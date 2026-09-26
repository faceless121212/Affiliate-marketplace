# Nativness — Design Spec (Phase 1)

**Date:** 2026-09-26
**Status:** Awaiting review
**Scope:** Phase 1 — landing page, wallet login, authenticated marketplace app. Frontend only.

---

## 1. Locked decisions

These came from the ten scoping questions. They are settled; changing one invalidates parts of this spec.

| # | Question | Decision |
|---|---|---|
| 1 | Login mechanism | Wallet-only, **real** `@solana/wallet-adapter-react` on **devnet**. The address is the account. No password, no email, no signup screen. |
| 2 | Starting point | Information architecture designed **fresh from the spec**. The existing prototype is not used. |
| 3 | Tech stack | **Next.js (App Router) + React + Tailwind.** Plain React Context for state. |
| 4 | Role model | **Flat peer-level navigation.** No modes, no toggle, no role gate. Both sides are simply destinations. |
| 5 | Hosting | **Local dev now**, kept Vercel-deployable with no config debt. |
| 6 | Backend | **Phase 1 frontend only.** Persistence in `localStorage`. |
| 7 | Fraud/attribution | **Moot** — no postback endpoint this pass. The seam is designed for it; no fraud logic is written. |
| 8 | Verified tier | **Real `verified` field** on the data model. Seeded on demo offers. User-created offers are always Community and cannot self-verify. |
| 9 | Brand | **Original identity**, proposed and approved. See §2. |
| 10 | Proof points | **Qualitative only**, except the cited market figures, each shown with its source. No invented stats. |
| — | State architecture | **Option B — repository seam.** Components never touch `localStorage` directly. |
| — | Escrow honesty | Landing page speaks in product voice. The app carries a **permanent** prototype banner. |

---

## 2. Design tokens

Grounded in values sampled directly from the three reference apps on 2026-09-26, not from memory.

### What was observed

| Site | Canvas | Primary accent | Numerals |
|---|---|---|---|
| jup.ag | `rgb(9,13,16)` `#090D10` | lime `oklch(0.907 0.145 126.6)` ≈ `#C7F284`, dark text `#2E3C2C` | Inter |
| app.velocity.exchange (ex-Drift) | `rgb(5,6,12)` `#05060C` | green `#23B133` / red `#CF3858` semantic pair | dedicated `interDigits` face + `tabular-nums` |
| tensor.trade | `rgb(17,19,20)` `#111314` | cyan `#8EE3FB`, **black** text, 5px radius | `cpmono` across the entire UI |

**Convergent pattern, adopted:** near-black canvas; hairline borders rather than shadows; small radii; exactly one high-chroma light accent reserved for the primary action, always carrying dark text, never a gradient.

**Divergence, deliberate:** full-monospace body copy (Tensor) hurts landing-page readability. Mono is scoped to balances, commissions and wallet addresses — where it carries meaning.

### The palette

| Token | Hex | Role |
|---|---|---|
| `canvas` | `#0B0D10` | page ground |
| `surface` | `#141922` | cards, panels — raised by hue, never by shadow |
| `line` | `#242C38` | hairlines, table dividers, card borders |
| `text` | `#E6EAF0` | primary copy |
| `muted` | `#8695A8` | secondary copy, labels, units |
| `escrow` | `#F2B231` | **the one accent** — primary CTA, escrow figures, progress fill |
| `paid` | `#3FCF8E` | confirmed conversion, payout released, Verified badge |
| `depleted` | `#E5484D` | escrow exhausted, destructive |

Amber was chosen because lime and cyan are taken by the two nearest neighbours, purple/green is ruled out by the non-goals, and amber does semantic work: it is the colour of locked value, so one token carries the CTA, the balance and the progress fill. Green is then freed to mean exactly one thing — *paid*.

### Type

| Face | Licence | Role |
|---|---|---|
| **Inter** | SIL OFL | all prose, labels, navigation, buttons |
| **JetBrains Mono** | SIL OFL | every balance, commission, count, and wallet address. Always `font-variant-numeric: tabular-nums`. Chosen over alternatives for unambiguous `0/O` and `l/1`, which matters for base58. |

Nothing to license. Both self-hosted via `next/font/google`.

### Prohibited

Purple-pink gradients. Uniform rounded cards with identical soft shadows. Tracked-out ALL-CAPS eyebrow labels. An arrow appended to every button. Solana's purple/green brand gradient as the primary palette.

---

## 3. Routes

```
/                       landing page — static, no wallet required
/app                    browse marketplace
/app/offers/[id]        offer detail + Get my link
/app/links              affiliate dashboard
/app/my-offers          advertiser dashboard + create offer
/app/simulate           conversion simulator
/r/[offerId]/[wallet]   tracking redirect — records click, forwards to target URL
```

`/app/*` sits under a layout that gates on wallet connection. When disconnected it renders a connect prompt **in place** rather than redirecting, which avoids a redirect loop and preserves the intended destination.

`/r/*` is deliberately a **real working route**, not a decorative string. It records the click and redirects. This also means the tracking-link seam already exists when Phase 2 adds attribution.

---

## 4. Navigation

Flat, peer-level, always visible once connected:

```
Browse   My Links   My Offers   Simulate            [ 7xKX…gAsU ▾ ]
```

There is no mode concept anywhere in the UI. The same identity reaches every destination. Nothing in the interface implies a second signup exists, because none does.

Header right: shortened wallet address in JetBrains Mono, with a disconnect action.

Below the header, on every `/app` route, a permanent bar:

> **Prototype** — escrow balances are simulated and stored in this browser. Not yet on-chain.

Not dismissible. A later viewer must not be able to mistake this for a live chain.

---

## 5. Data model

```ts
type Category = 'ecommerce' | 'igaming' | 'dating' | 'saas' | 'finance' | 'other'

type User = {
  wallet: string          // base58
  createdAt: string       // ISO
}

type Offer = {
  id: string
  advertiserWallet: string
  name: string
  description: string
  category: Category
  commissionAmountUsd: number      // CPA only — fixed amount per conversion
  conversionTerms: string
  targetUrl: string
  escrowTotalUsd: number
  escrowRemainingUsd: number
  verified: boolean                // seeded only; never self-set
  status: 'active' | 'depleted'
  createdAt: string
}

type TrackingLink = {
  id: string
  offerId: string
  affiliateWallet: string
  clicks: number
  createdAt: string
}

type Conversion = {
  id: string
  linkId: string
  offerId: string
  affiliateWallet: string
  amountUsd: number                // snapshot of commission at confirmation time
  confirmedAt: string
  source: 'simulator'
}
```

**`Conversion` is the payout record in v1.** A confirmed conversion is exactly one payout of `amountUsd`. Splitting them into separate entities buys nothing until partial or batched payouts exist — a Phase 2 concern. `amountUsd` is snapshotted so historical payouts stay correct if an offer's commission later changes.

**Commission type:** CPA only. No CPL or CPS in v1, per the non-goals.

**Status derivation:** `status` becomes `depleted` when `escrowRemainingUsd < commissionAmountUsd` — the offer cannot fund another conversion. Depleted offers stay visible in the grid, visibly marked, because hiding them would hide the failure mode the escrow model exists to make legible.

---

## 6. Repository seam

Every read and write goes through `lib/store/`. No component touches `localStorage`. The signatures are deliberately shaped like the REST API that replaces them in Phase 2.

```ts
ensureUser(wallet): User
listOffers(opts?: { category?: Category; query?: string }): Offer[]   // query: name + description
getOffer(id): Offer | null
createOffer(draft, advertiserWallet): Offer
topUpEscrow(offerId, amountUsd): Offer                // raises total AND remaining
listOffersByAdvertiser(wallet): Offer[]

issueLink(offerId, affiliateWallet): TrackingLink     // idempotent
listLinksByAffiliate(wallet): TrackingLink[]
recordClick(linkId): void

recordConversion(linkId): { ok: true; conversion: Conversion; offer: Offer }
                        | { ok: false; reason: 'insufficient_escrow' | 'not_found' }
listConversionsByAffiliate(wallet): Conversion[]
listConversionsByOffer(offerId): Conversion[]
```

`issueLink` is idempotent: asking twice for the same `(offer, wallet)` returns the same link. Otherwise a user who clicks "Get my link" twice would fragment their own attribution.

`recordConversion` returns a **result type rather than throwing**, because insufficient escrow is an expected outcome the UI must render, not an exceptional one.

`topUpEscrow` raises **both** `escrowTotalUsd` and `escrowRemainingUsd` by `amountUsd`. Raising only the remainder would make the card read `$540 / $500`, which is incoherent; raising only the total would take the advertiser's money without funding anything. A top-up that lifts remaining back above the commission amount also flips `status` from `depleted` to `active` — otherwise a funded offer would stay dark.

`listOffers` searches `name` and `description`, case-insensitively. Not `targetUrl` (users do not think in URLs) and not `conversionTerms` (too noisy to be useful as a match).

### Storage

| Key | Contents |
|---|---|
| `nativness:v1:offers` | all offers, every wallet |
| `nativness:v1:links` | all tracking links |
| `nativness:v1:conversions` | all conversions |
| `nativness:v1:users` | known wallets |
| `nativness:v1:seeded` | seed-once flag |

The marketplace is **global across wallets within one browser** — switching wallets shows the same offer grid, with ownership determined per offer. This is what makes "one login, both roles" demonstrable: connect wallet A, list an offer, connect wallet B, and promote it.

---

## 7. Seed data

Six fictional offers. No real brand names, per the non-goals.

| Name | Category | Tier | CPA | Escrow |
|---|---|---|---|---|
| Drayton Supply Co. | Ecommerce | Verified | $24.00 | $340 / $500 |
| Meridian Ledger | SaaS | Verified | $65.00 | $2,600 / $4,000 |
| Kestrel Play | iGaming | Community | $110.00 | $1,430 / $3,300 |
| Coastline | Dating | Community | $12.50 | $187.50 / $750 |
| Fenwick Grounds | Ecommerce | Community | $18.00 | $54 / $900 |
| Halcyon Tools | SaaS | Community | $40.00 | $0 / $1,200 |

Fenwick Grounds is nearly exhausted and Halcyon Tools is fully depleted, so both degraded states are visible on first load without anyone having to simulate their way there.

---

## 8. Landing page

One primary CTA — **Enter Nativness** — which opens the wallet modal. On successful connection, route to `/app`. No secondary "browse" or "list" CTA anywhere in the hero; login is the single front door.

| § | Section | Content |
|---|---|---|
| 1 | Hero | Name, one-line positioning, and a real UI-style offer card showing a locked escrow balance (the card designed in §2). Single CTA. |
| 2 | Problem | The enterprise-onboarding gap and payment-delay pain, stated with sources. |
| 3 | Solution in 3 steps | Horizontal flow: lock budget in escrow → affiliate promotes with the balance visible → confirmed conversion pays out instantly. Not a bullet list. |
| 4 | Why escrow, not reputation | Money is locked before an affiliate ever sees the offer. That is what makes an open, permissionless listing model possible at all — reputation systems cannot, because they price trust *after* the work. |
| 5 | What you get once logged in | One login, both sides. Browse and promote, and list your own. Explicitly not two signups. |
| 6 | Market context | Forrester and eMarketer figures, framed as adoption evidence. |
| 7 | Footer | Product name, a couple of nav links. No fake social-proof logos. |

### Fact ledger

Every number on the page, and its source. Nothing else numeric appears.

| Claim | Source | Placement |
|---|---|---|
| $75,000–$300,000/year, enterprise-only, no self-serve tier | LinkUp, Revelio Labs | §2 |
| 15/100 on "fit for a solo marketer or founder" | Revelio Labs, independent review | §2 |
| NET-60 payout terms; 2.2/5 Trustpilot | Rakuten Advertising | §2 |
| Commissions withheld behind an "investigation" that never resolves | CJ Affiliate, reported complaints | §2 |
| Fragmented, offshore, reputation-only trust — no escrow, no recourse | Ace Partners, N1 Partners, Affilitex | §2 |
| Shut down and merged into Awin, October 2025 | ShareASale | §2 |
| $19.4B in 2026, up from $17.1B in 2025, on track for $22B by 2027 | Forrester | §6 |
| US $13.81B in 2026, up 11.3% YoY | eMarketer | §6 |

**Framing note.** LinkUp and Revelio Labs are workforce-data providers, not affiliate networks. They are cited for exactly one thing — evidence that infrastructure tooling in adjacent markets is priced enterprise-only, locking out solo operators. Copy must not imply they are affiliate networks. This is the "enterprise-onboarding gap", not a competitor comparison.

**Never stated:** any figure about Nativness itself — companies onboarded, escrow volume, conversions paid. No customer logos. No testimonials. Claims about Nativness stay qualitative.

---

## 9. Authenticated app

### Browse (`/app`)
Grid of every listed offer, including the user's own. Per card: name, category, commission, **escrow balance remaining** as the visually dominant element, Verified badge or nothing. Category filter and text search. Depleted offers visibly marked.

### Offer detail (`/app/offers/[id]`)
Full description, conversion terms, target-page link, escrow balance with progress indicator, and **Get my link** — which generates `nativness.app/r/{offerId}/{wallet}` containing the connected wallet's address, with copy-to-clipboard.

### My Links (`/app/links`)
This wallet's active tracking links, confirmed conversions and payouts, total earnings. Numbers set as a terminal: tabular, right-aligned, mono.

### My Offers (`/app/my-offers`)
Create-offer form — name, description, category, commission amount, conversion terms, target URL, escrow budget. On submit the offer appears in the marketplace grid **immediately, without reload** (shared Context, so both views read the same state).

Below it, this wallet's own offers with remaining escrow, conversion count, budget spent, and **Top up escrow**.

### Simulate (`/app/simulate`)
Clearly labelled as standing in for a real postback endpoint. Dropdown of this wallet's active tracking links, **Confirm conversion** button. On confirm: decrement that offer's escrow by the commission amount, append a `Conversion`, show confirmation. Blocked with a clear message when escrow cannot fund another conversion.

---

## 10. Component structure

Files stay focused; nothing becomes a grab-bag.

```
app/
  layout.tsx                  root, fonts, providers
  page.tsx                    landing
  r/[offerId]/[wallet]/route.ts
  app/
    layout.tsx                wallet gate + nav + prototype banner
    page.tsx                  browse
    offers/[id]/page.tsx
    links/page.tsx
    my-offers/page.tsx
    simulate/page.tsx
components/
  landing/                    Hero, Problem, HowItWorks, WhyEscrow, WhatYouGet, Market, Footer
  app/                        OfferCard, OfferGrid, FilterBar, EscrowMeter, LinkRow,
                              ConversionRow, CreateOfferForm, TopUpDialog, WalletBadge
  ui/                         Button, Input, Select, Badge, Money, Address
lib/
  store/                      index.ts (the seam), storage.ts, seed.ts
  wallet/                     provider.tsx, useAccount.ts
  format.ts                   money, address shortening, dates
```

`Money` and `Address` are components, not helpers, so mono + tabular numerals are applied in exactly one place each and cannot drift.

---

## 11. Acceptance criteria → where satisfied

| Criterion | Satisfied by |
|---|---|
| Landing CTA leads to login; success lands in shared app, not a role screen | §8 hero → wallet modal → `/app`. No role gate exists. |
| Same user can get a tracking link AND create an offer, no extra signup | §4 flat nav; both destinations always present |
| Created offer appears in grid without reload | §6 shared Context; §9 My Offers |
| Tracking link contains the logged-in wallet address | §9 `nativness.app/r/{offerId}/{wallet}` |
| Simulating a conversion decreases escrow and appends a record | §6 `recordConversion`; §9 Simulate |
| Every landing stat traces to Context or is framed as illustrative | §8 fact ledger |
| Responsive to ~380px, no lorem ipsum | Grid → 1 column; nav → horizontal scroll; all copy written, none placeholder |

---

## 12. Phase 1 limitations — to be stated in the README

Honest boundaries, not caveats to bury:

1. **Escrow is a number in `localStorage`, not an on-chain fact.** The in-app banner says so permanently.
2. **Persistence is per-browser.** "Reconnecting the same address returns to the same account" holds within one browser profile. Cross-device continuity needs the Phase 2 database.
3. **The wallet gate is client-side.** There is no server session to protect and nothing secret behind it, so this is not a security hole — but it is not authentication either, and the README will not call it that.
4. **Conversions come only from the simulator.** No postback endpoint, therefore no attribution integrity and no duplicate-conversion checks. Deferred with Q7.
5. **Devnet only.** No mainnet, no real value moves anywhere.

### Phase 2 seams already in place
- `lib/store/` signatures are the intended API surface — swap the implementation, leave components alone.
- `/r/[offerId]/[wallet]` already records clicks, so attribution has somewhere to land.
- `verified` is a real field, so the admin review path adds a workflow rather than a data migration.
- `recordConversion` is the exact shape a postback handler calls.
- Escrow integration path: **`solana-marketplace-escrow`** (non-custodial, arbiter-mediated, x402 support). To be integrated, not reimplemented. A custom Anchor program is explicitly out of scope.
