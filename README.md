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
| Wallet login | **Real address, nothing signed.** Discovers Solana wallets through the Wallet Standard and Ethereum wallets such as MetaMask through EIP-6963, with the older injected globals as a fallback. It reads the public address only and remembers the last wallet. |
| Offers, links, conversions, payouts | **Real logic, in memory.** State resets on reload. |
| Escrow balances | **Simulated.** Numbers in the page, not an on-chain fact. |
| Conversions | **Simulated.** From the in-app simulator only. There is no postback endpoint. |
| Listed offers | **Fictional.** Six invented advertisers with generated logos. |
| Terms of Use, Privacy Policy | **Drafts.** Not reviewed by a lawyer. Bracketed details must be completed before launch. |

The site itself no longer labels any of this as a demo, by the owner's decision. This table is the
record of what is and is not real.

## History

This replaces the earlier Next.js prototype, which had wallet-adapter login, `localStorage`
persistence and a Vitest suite. That code is in the git history before this change. The original
specs and plans are kept in `docs/`.
