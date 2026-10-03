# Nativness

An affiliate marketplace where the commission budget is locked in escrow before the offer goes
live. Affiliates see a guaranteed balance instead of a promise, and a confirmed conversion
releases payment to the affiliate's wallet.

One login, both sides. Connecting a wallet creates a single identity that can promote other
people's offers and list its own.

## Running it

```bash
npm install
npm run dev
```

Then open the URL Vite prints. `npm run build` type-checks and builds for production.

Built with Vite, React 18 and TypeScript. Styling is plain CSS in a white, black and lime palette.

## What is in here

| Route | What it is |
|---|---|
| `#/` | Landing page |
| `#/app` | Marketplace: browse offers, take tracking links, simulate conversions, list and top up offers |
| `#/blog`, `#/blog/<slug>` | Blog index and posts |
| `#/terms`, `#/privacy` | Draft legal pages |

Source lives in `src/`. Copy for the blog and legal pages is in `src/content.ts`, demo offers in
`src/data.ts`, and the wallet connector in `src/wallet.ts`.

## What is real, and what is not

This is a **prototype**.

| | Status |
|---|---|
| Wallet login | **Real address, nothing signed.** Connects to an injected Phantom, Solflare or Backpack wallet and reads its public address. A demo wallet is offered when no extension is present. |
| Offers, links, conversions, payouts | **Real logic, in memory.** State resets on reload. |
| Escrow balances | **Simulated.** Numbers in the page, not an on-chain fact. |
| Conversions | **Simulated.** From the in-app simulator only. There is no postback endpoint. |
| Demo offers | **Fictional.** Six invented advertisers with generated logos. |
| Terms of Use, Privacy Policy | **Drafts.** Not reviewed by a lawyer. Bracketed details must be completed before launch. |

Both the landing page and the app carry a banner saying the same thing.

## History

This replaces the earlier Next.js prototype, which had wallet-adapter login, `localStorage`
persistence and a Vitest suite. That code is in the git history before this change. The original
specs and plans are kept in `docs/`.
