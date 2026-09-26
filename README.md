# Nativness

A Solana-native affiliate marketplace where the commission budget is locked in escrow before
the offer goes live. Affiliates see a guaranteed balance instead of a promise; a confirmed
conversion releases payment to the affiliate's wallet.

One login opens both sides. Connecting a wallet creates a single identity that can promote
other people's offers and list its own — there is no separate affiliate or advertiser account.

## Running it

```bash
npm install
npm run dev
```

Then open http://localhost:3000. You need a Solana wallet extension (Phantom, Solflare or
Backpack) set to **devnet**. Nothing of value moves: the wallet is an identity here, not a
payment rail.

```bash
npm test          # 106 unit and component tests (Vitest 5)
npm run lint       # ESLint
npx tsc --noEmit   # type-check
npm run build      # production build
```

Built on Next.js 16.3.6 (App Router, Turbopack) with React 19.2.8, Tailwind v4, and Vitest 5.

## What is real, and what is not

This is **Phase 1: frontend only**. Being precise about the boundary:

| | Status |
|---|---|
| Wallet login | **Real.** `@solana/wallet-adapter-react` on devnet. The address is the account. |
| Offers, links, conversions, payouts | **Real logic, local persistence.** State lives in `localStorage`. |
| Escrow balances | **Simulated.** A number in `localStorage`, not an on-chain fact. |
| Conversions | **Simulated.** From the in-app simulator only. There is no postback endpoint. |
| Verified tier | **Real field, seeded values.** Two demo offers are Verified. Users cannot self-verify; there is no review path yet. |

The app carries a permanent banner saying the same thing. It is not dismissible.

### Known limits

- **Persistence is per-browser.** Reconnecting the same address returns you to the same account
  *in the same browser profile*. Cross-device continuity needs the Phase 2 database.
- **The wallet gate is client-side.** There is no server session and nothing secret behind it,
  so this is not a security hole — but it is not authentication either.
- **No attribution integrity.** With no postback endpoint there are no duplicate-conversion
  checks. Deferred deliberately to Phase 2.
- **Devnet only.** No mainnet, no real funds.
- **The dependency tree has known-vulnerable packages.** `npm audit` reports 97 advisories, 13
  of them critical or high, all transitive via `@solana/web3.js` and the wallet-adapter tree:
  `protobufjs` (12 criticals — arbitrary code execution, prototype pollution, several DoS),
  `lodash` (code injection via `_.template`, prototype pollution), `toml` (uncontrolled
  recursion, prototype pollution), and `ws` (uninitialised memory disclosure, DoS). The app
  imports the adapter packages directly, so this tree ships in the bundle regardless of use;
  `WalletProvider wallets={[]}` (see `lib/wallet/provider.tsx`) means the WalletConnect and
  mobile adapters responsible for much of it are never instantiated, which limits but does not
  remove the exposure. **This must be resolved before mainnet or any handling of real funds.**
  The realistic options are `npm audit fix --force` (likely breaks the adapter — these are deep
  transitive pins, not direct ones) or migrating to [`@solana/kit`](https://github.com/anza-xyz/kit),
  the v2 rewrite with a far smaller dependency tree.

### Demo data

Six fictional offers seed on first load, across ecommerce, iGaming, dating and SaaS. No real
brand names are used. Two are Verified; one (Fenwick Grounds) is nearly exhausted and one
(Halcyon Tools) has zero escrow, so both degraded states are visible without simulating your
way there.

## Icons and assets

- `app/icon.svg` is the app icon, used by the Next.js `icon` convention.
- `components/ui/CategoryIcon.tsx` holds six hand-authored category glyphs — inline SVG, no
  network request, tintable via `currentColor` so they inherit the design tokens.
- `scripts/generate-icons.mjs` is a [fal.ai](https://fal.ai) entry point for future raster
  assets. It reads `FAL_KEY` from the environment and embeds no credential. `.env*` is
  gitignored; no key belongs in this repo.

## Architecture

```
app/                    routes — landing at /, app behind /app, tracking redirect at /r
components/landing/     landing page sections
components/app/         marketplace UI
components/ui/          primitives — Money and Address own all mono/tabular rendering
lib/store/              the repository seam — the only place that touches localStorage
lib/wallet/             Solana wallet adapter wiring
```

**The repository seam is the important part.** Components import from `@/lib/store` and never
reach deeper. Those function signatures — `listOffers`, `createOffer`, `issueLink`,
`recordConversion` — are deliberately shaped like the REST API that replaces them, so Phase 2
swaps implementations without touching a single component. `lib/store/users.ts` holds the
one function on that seam that manages identity (`ensureUser`), alongside `offers.ts`,
`links.ts`, `conversions.ts`, `storage.ts` and `seed.ts`.

**The tracking redirect is a client page, not a route handler:**
`app/r/[offerId]/[wallet]/page.tsx`. In Phase 1, click counts live in `localStorage`, and a
server route handler cannot read it — only client-side JavaScript can. It still does real work:
it records the click and forwards the visitor to the offer's target URL. Phase 2 converts it to
a server route once clicks move to the database, where a server can read them directly.

## Phase 2

Planned, not built:

- Real database for offers, links, conversions, payouts and wallets.
- A postback endpoint an advertiser's backend can call to confirm a conversion, with
  duplicate-conversion checks. The simulator stays alongside it as a testing tool.
- On-chain escrow via [`solana-marketplace-escrow`](https://github.com/topics/solana-escrow)
  (non-custodial, arbiter-mediated, x402 support) — integrated, not reimplemented. A custom
  Anchor program is explicitly out of scope.
- A review path for Verified status.
- API auth tied to the wallet via a signed message.

## Documents

- Design spec: `docs/superpowers/specs/2026-09-26-nativness-design.md`
- Implementation plan: `docs/superpowers/plans/2026-09-26-nativness-phase1.md`
