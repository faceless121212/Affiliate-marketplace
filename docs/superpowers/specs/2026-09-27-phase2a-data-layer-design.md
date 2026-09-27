# Nativness Phase 2a: Real Data Layer (Design)

**Date:** 2026-09-27
**Status:** Awaiting review
**Scope:** The database, API and wallet authentication that replace `localStorage`. One of five Phase 2 subsystems.
**Predecessor:** `docs/superpowers/specs/2026-09-26-nativness-design.md` (Phase 1, shipped)

---

## 1. Phase 2 decomposes into five subsystems

The owner's Phase 2 request described five independent pieces. Speccing them together would produce a document nobody can implement, so they are separated and ordered by dependency:

| | Subsystem | Depends on | Status |
|---|---|---|---|
| **2a** | **Real data layer**: database, API, wallet auth |, | **this document** |
| 2b | Role-scoped UI, hidden by default | 2a | not yet specced |
| 2c | Partner verification by domain control | 2a | not yet specced |
| 2d | Approve-and-pay on real devnet escrow | 2a | not yet specced |
| 2e | Wallet-level attribution visibility | 2a + a privacy decision | not yet specced |

Only 2a is a hard prerequisite. 2b through 2e are independent of one another.

---

## 2. Locked decisions

| # | Question | Decision |
|---|---|---|
| 1 | Build order | **Data layer first.** Everything else needs persistence, and the Phase 1 seam was built for exactly this swap. |
| 2 | Role model | **Hidden by default, still reachable.** Affiliate surfaces show by default; listing an offer stays available through a quiet entry point. One wallet keeps both capabilities. Implemented in 2b, but 2a must not foreclose it. |
| 3 | Partner verification | **Domain control plus manual review.** Implemented in 2c. 2a only reserves the column. |
| 4 | Payouts | **Real devnet escrow with approve-and-pay.** Implemented in 2d. 2a must leave room for a transaction signature and an approval step. |
| 5 | Stack | **Postgres on Neon, Prisma, Next route handlers in the same repo.** |
| 6 | Authentication | **Sign-in with Solana:** wallet signs a one-time nonce, server verifies, server issues a short-lived httpOnly session cookie. |
| 7 | Existing local data | **Start clean.** The six demo offers seed server-side. No importer. |

---

## 3. What 2a does, and does not

**Does:**
- Replaces `localStorage` with Postgres as the single source of truth.
- Adds an HTTP API mirroring the existing seam's function names and result shapes.
- Adds wallet authentication and, for the first time, real server-side authorization.
- Makes the store seam asynchronous.
- Moves offer validation from the component to the server.
- Introduces integer-cent money and conversion idempotency keys.

**Does not:**
- Touch on-chain escrow. Escrow remains a database number; the in-app prototype banner stays accurate and stays visible.
- Implement verification, role scoping or attribution visibility.
- Replace the conversion simulator. It remains the only way a conversion is created, now behind an authenticated, authorized endpoint.
- Move to mainnet. Devnet only.

---

## 4. Two changes made now because they are expensive later

### 4.1 Money becomes integer cents

Phase 1 stores USD as floats and routes every arithmetic site through `round2` to stop binary drift. The Phase 1 final review flagged `spentUsd` (derived as `total − remaining`) as correct only by accident: no current operation breaks the identity, but the first refund, withdrawal or budget reduction would break it silently.

In Postgres, integer cents removes the class of problem rather than managing it. No rounding discipline, no drift, no `NUMERIC` comparison surprises. Changing this after real balances exist means a migration over live money, so it happens now.

Every money column is `Int`, named `...Cents`. Formatting to dollars happens once, at the edge, in `lib/format.ts`. The existing `Money` component keeps being the only place currency renders.

### 4.2 The version-counter provider becomes a query cache

`lib/store/provider.tsx` holds a version counter bumped on every mutation; hooks re-read synchronously when it changes. That was correct for synchronous `localStorage` and it is what delivers the "new offer appears with no reload" criterion.

It cannot survive async reads. Each of the **11 component call sites** would otherwise grow its own loading and error state by hand. TanStack Query replaces the counter with a cache that already handles loading, error, refetch and invalidation, and deletes the five `react-hooks/exhaustive-deps` suppressions that exist only to serve the counter.

Call sites to migrate:
`app/layout.tsx`, `app/app/page.tsx`, `app/app/simulate/page.tsx`, `app/app/offers/[id]/page.tsx`, `app/app/links/page.tsx`, `app/app/my-offers/page.tsx`, `app/r/[offerId]/[wallet]/page.tsx`, `components/landing/EscrowCounter.tsx`, `components/app/TopUpDialog.tsx`, `components/app/GetLinkPanel.tsx`, `components/app/CreateOfferForm.tsx`.

`components/landing/EscrowCounter.tsx` is on the **public landing page**. It currently sums `SEED_OFFERS` locally. It must not start making an authenticated request, and it must not make the marketing page wait on a database round trip. It reads from a cached, public, unauthenticated endpoint or stays a build-time constant.

---

## 5. Data model

```prisma
model User {
  wallet    String   @id              // base58, the account identity
  createdAt DateTime @default(now())

  offers       Offer[]
  links        TrackingLink[]
  conversions  Conversion[]
  sessions     Session[]
}

model Offer {
  id                   String   @id @default(cuid())
  advertiser           User     @relation(fields: [advertiserWallet], references: [wallet])
  advertiserWallet     String
  name                 String
  description          String
  category             Category
  commissionAmountCents Int
  conversionTerms      String
  targetUrl            String
  escrowTotalCents     Int
  escrowRemainingCents Int
  /// Server-only. No client request may set this. Granted in 2c.
  verified             Boolean  @default(false)
  status               OfferStatus
  createdAt            DateTime @default(now())

  links       TrackingLink[]
  conversions Conversion[]

  @@index([category])
  @@index([advertiserWallet])
}

model TrackingLink {
  id               String   @id @default(cuid())
  offer            Offer    @relation(fields: [offerId], references: [id], onDelete: Cascade)
  offerId          String
  affiliate        User     @relation(fields: [affiliateWallet], references: [wallet])
  affiliateWallet  String
  clicks           Int      @default(0)
  createdAt        DateTime @default(now())

  conversions Conversion[]

  /// Phase 1 enforced this in code. The database enforces it now: one link
  /// per (offer, affiliate), so an affiliate's history can never split.
  @@unique([offerId, affiliateWallet])
  @@index([affiliateWallet])
}

model Conversion {
  id              String   @id @default(cuid())
  link            TrackingLink @relation(fields: [linkId], references: [id])
  linkId          String
  offer           Offer    @relation(fields: [offerId], references: [id])
  offerId         String
  affiliate       User     @relation(fields: [affiliateWallet], references: [wallet])
  affiliateWallet String
  /// Snapshot of the commission at confirmation. Never re-derived on read.
  amountCents     Int
  confirmedAt     DateTime @default(now())
  source          ConversionSource

  /// The only thing that makes duplicate protection possible. A real postback
  /// in 2d keys on this; the simulator generates one per confirmation.
  idempotencyKey  String   @unique

  @@index([affiliateWallet])
  @@index([offerId])
}

model AuthNonce {
  nonce     String   @id
  wallet    String
  expiresAt DateTime
  usedAt    DateTime?

  @@index([expiresAt])
}

model Session {
  token     String   @id            // opaque, random; the cookie value
  user      User     @relation(fields: [wallet], references: [wallet])
  wallet    String
  createdAt DateTime @default(now())
  expiresAt DateTime

  @@index([wallet])
  @@index([expiresAt])
}

enum Category { ecommerce igaming dating saas finance other }
enum OfferStatus { active depleted }
enum ConversionSource { simulator }   // `postback` is added in 2d
```

**Kept from Phase 1 deliberately:**
- A `Conversion` is still the payout record. Splitting it buys nothing until 2d introduces a transaction signature and an approval state.
- `status` is still derived by the same rule: `depleted` when `escrowRemainingCents < commissionAmountCents`. Equality is active.
- `amountCents` is snapshotted, so changing an offer's commission never rewrites history. The Phase 1 regression test that proves this carries over.

---

## 6. API surface

Route handlers under `app/api/`. The shapes mirror the existing seam so the swap is mechanical.

| Method | Path | Auth | Replaces |
|---|---|---|---|
| POST | `/api/auth/nonce` | none |, |
| POST | `/api/auth/verify` | signature | `ensureUser` |
| POST | `/api/auth/signout` | session |, |
| GET | `/api/auth/me` | session |, |
| GET | `/api/offers?category&q` | none | `listOffers` |
| GET | `/api/offers/:id` | none | `getOffer` |
| POST | `/api/offers` | session | `createOffer` |
| POST | `/api/offers/:id/topup` | session + owner | `topUpEscrow` |
| GET | `/api/offers/mine` | session | `listOffersByAdvertiser` |
| POST | `/api/links` | session | `issueLink` |
| GET | `/api/links/mine` | session | `listLinksByAffiliate` |
| POST | `/api/clicks` | none | `recordClick` |
| POST | `/api/conversions` | session + scoped | `recordConversion` |
| GET | `/api/conversions/mine` | session | `listConversionsByAffiliate` |
| GET | `/api/conversions/by-offer/:offerId` | session + owner | `listConversionsByOffer` |
| GET | `/api/stats/mine` | session | `totalEarnedUsd` |
| GET | `/api/stats/escrow-locked` | none, cached | the landing counter |

Browsing is public and unauthenticated, as it is today: an affiliate evaluates offers before connecting anything.

`getLink` and `findLink` get no endpoint. They exist only to serve `recordClick` and become server-internal helpers, not part of the public seam. `lib/store/index.ts` stops exporting them.

`totalEarnedUsd` and `spentUsd` are aggregates. They are computed **server-side from the conversion records**, not in the browser, and `spentUsd` is derived from the sum of a offer's payouts rather than from `total − remaining`. That closes the fragility the Phase 1 final review named: the subtraction identity holds today only because no operation breaks it, and the first refund or budget reduction would break it silently.

`POST /api/conversions` returns the Phase 1 discriminated union unchanged, `{ ok: true, conversion, offer }` or `{ ok: false, reason }`, as an HTTP 200 with a body, not an error status. Insufficient escrow is an expected outcome the UI renders, not a failure.

---

## 7. Authentication

1. Client requests a nonce for its wallet address. Server stores it with a short expiry.
2. Wallet signs a human-readable message containing the nonce, the origin and the expiry.
3. Client posts the signature. Server verifies it against the claimed public key with `tweetnacl`, checks the nonce is unused and unexpired, marks it used, upserts the `User`, and sets an httpOnly, `SameSite=Lax`, `Secure` session cookie.
4. Subsequent requests carry the cookie. The wallet is not prompted again.

The signed message is not a transaction and authorizes no transfer. It must say so in plain language, because a wallet prompt that looks like a payment request trains users to approve things they should read.

Nonces and sessions both expire. Expired rows are swept on read rather than by a cron job.

---

## 8. Authorization

Phase 1's wallet gate was cosmetic; nothing sat behind it. Every rule below is a server-side check with a negative test:

| Action | Rule |
|---|---|
| Top up or edit an offer | Caller's session wallet equals `offer.advertiserWallet` |
| Read `/offers/mine` | Scoped to the session wallet; the parameter is ignored if sent |
| Read `/links/mine`, `/conversions/mine` | Scoped to the session wallet |
| Set `verified` | Impossible. Not in any request schema, not in any writable path. |
| Record a conversion | Caller is the link's affiliate or the offer's advertiser |
| Create an offer | Any authenticated wallet |

**Validation moves to the server.** Today `components/app/CreateOfferForm.tsx` is the only thing enforcing commission greater than zero, budget at least one commission, and an `http(s)` target URL. The Phase 1 final review noted that a commission of zero would make `deriveStatus` return `active` and render "Infinity conversions funded". The server revalidates every field; the form keeps its checks for fast feedback, not as the guarantee.

---

## 9. The seam goes async

`lib/store/*` keeps its exported names and its result shapes, and every function returns a `Promise`. Components continue importing `@/lib/store` and `@/lib/store/provider` only, the import discipline the Phase 1 final review confirmed holds, and which this change is the whole point of.

`deriveStatus` stays a pure synchronous helper; it is used by the server.

Read paths become TanStack Query hooks with the same names as today's (`useOffers`, `useOffer`, `useMyOffers`, `useMyLinks`, `useMyConversions`), so component code changes as little as possible. Writes become mutations that invalidate the relevant query keys, replacing `useMutate` and the version counter.

Every screen gains an explicit loading state and an explicit error state. Today a failed read is impossible; after this it is routine, and a silent empty grid would be indistinguishable from "no offers match".

---

## 10. Seeding

The six fictional offers move into a Prisma seed script, keeping their exact names, categories, commissions and escrow values, with amounts converted to cents. `Fenwick Grounds` stays active and near-exhausted; `Halcyon Tools` stays depleted at zero. Both degraded states must still be visible on a fresh database, for the same reason as Phase 1: hiding them would hide the failure mode escrow exists to make legible.

The two seeded advertiser wallets remain fictional and belong to no real account.

---

## 11. Testing

The 126 Phase 1 tests are the specification of correct behaviour. They are **rewritten to run against a test database, not deleted.** The invariants they guard must keep being guarded:

- escrow can never go negative, be double-spent within a request, or drift
- `deriveStatus` applied consistently at every write site, equality active
- payouts snapshotted, never re-derived at read time
- `issueLink` idempotent per (offer, affiliate), now also a database constraint, so add a test that the constraint itself holds
- a refused conversion mutates nothing

New tests required:
- **Authorization negatives:** wrong wallet topping up another advertiser's offer; a client attempting to set `verified`; reading another wallet's links; recording a conversion against a link the caller neither owns nor advertises.
- **Auth flow:** nonce single-use, nonce expiry, signature mismatch rejected, session expiry.
- **Idempotency:** the same idempotency key submitted twice creates one conversion and draws escrow down once.
- **Concurrency:** two simultaneous conversions against an offer with budget for exactly one must result in one success and one `insufficient_escrow`. This is the lost-update hazard the Phase 1 review named across `createOffer`, `topUpEscrow` and `recordConversion`; a transaction with the right isolation is the fix, and this test is what proves it.

---

## 12. Deployment

Neon Postgres with a branch per environment. `prisma migrate deploy` in the build step. `DATABASE_URL` and a session signing secret come from environment variables, `.env*` is already gitignored and no credential belongs in the repo.

The Phase 1 `perf-sli` budgets still apply. The landing page is already 1,074 KB against a 300 KB budget because `WalletProviders` is mounted at the root layout; adding a query client must not make that worse, and the landing escrow counter must not introduce a blocking request.

---

## 13. What 2a must leave possible

- **2b role scoping:** no schema change needed. Roles are inferred from behaviour (does this wallet own offers?), not stored as a type, which is what keeps "one wallet, both roles" true.
- **2c verification:** `Offer.verified` exists and is server-only. 2c adds the domain-challenge tables and the review path.
- **2d approve-and-pay:** `ConversionSource` gains `postback`. `Conversion` gains an approval state and a transaction signature. The idempotency key added here is what a real postback will key on.
- **2e attribution visibility:** deliberately unresolved. Publishing "wallet X promotes offer Y" exposes that affiliate's entire on-chain history to anyone with a block explorer. 2a stores the association but exposes it only to the parties already entitled to it: the affiliate themselves, and the advertiser of that offer. Any broader exposure is 2e's decision to make explicitly.

---

## 14. Risks

| Risk | Mitigation |
|---|---|
| The async migration touches 11 call sites and could regress the no-reload behaviour | The Phase 1 test that renders the create form and the browse grid together and proves cross-component reactivity carries over, rewritten against the query cache |
| Lost updates on concurrent escrow writes | Serializable transaction around read-check-decrement; the concurrency test above is the proof |
| A failed API read renders as an empty state | Explicit error states on every screen, asserted in tests |
| Landing page weight grows further | `perf-sli` budgets gate it; the public counter endpoint is cached and non-blocking |
| Signed-message prompt mistaken for a payment | The message text states plainly that it authorizes no transfer |
