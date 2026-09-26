# Nativness Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a marketing landing page whose single CTA opens wallet login, and behind it one authenticated marketplace app where the same wallet can both promote offers and list them.

**Architecture:** Next.js App Router. All domain state lives in `localStorage` behind a repository seam (`lib/store/`) whose function signatures are the REST API that replaces them in Phase 2 — no component ever touches `localStorage`. A React Context wraps the seam with a version counter so mutations re-render every reader, which is what makes a newly created offer appear in the marketplace grid without a reload. Login is a real Solana wallet connection on devnet; the connected address *is* the account.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, `@solana/wallet-adapter-react` on devnet, Vitest + React Testing Library + jsdom.

**Spec:** `docs/superpowers/specs/2026-09-26-nativness-design.md`

## Global Constraints

Every task's requirements implicitly include this section.

- **Commission type is CPA only.** A fixed USD amount per conversion. No CPL, no CPS, anywhere in types, UI, or copy.
- **Design tokens, exact values:** `canvas #0B0D10`, `surface #141922`, `line #242C38`, `text #E6EAF0`, `muted #8695A8`, `escrow #F2B231`, `paid #3FCF8E`, `depleted #E5484D`. No other colours.
- **Typefaces:** Inter for all prose. JetBrains Mono for every balance, commission, count and wallet address, always with `font-variant-numeric: tabular-nums`.
- **Forbidden visual patterns:** purple-pink gradients; uniform rounded cards with identical soft shadows; tracked-out ALL-CAPS eyebrow labels; an arrow appended to every button; Solana's purple/green gradient as the primary palette. Surfaces are raised by hue, never by shadow. Borders are hairlines.
- **No real brand names** as demo offers. The six fictional names in Task 3 are the only offers seeded.
- **No invented statistics.** The only numbers permitted on the landing page are those in the Task 13 fact ledger, each with its source. No figure about Nativness itself — no companies onboarded, no escrow volume, no conversions paid. No customer logos, no testimonials.
- **LinkUp and Revelio Labs are workforce-data providers, not affiliate networks.** They are cited for exactly one claim: infrastructure tooling in adjacent markets is priced enterprise-only. Copy must never imply they compete with Rakuten or CJ.
- **The prototype banner is not dismissible** and appears on every `/app` route.
- **Money arithmetic passes through `round2`.** USD amounts carry at most two decimals; repeated subtraction of e.g. `12.50` from `750` drifts without it.
- **Responsive to 380px.** No horizontal page scroll at that width.
- **No lorem ipsum.** Every string is real copy.

---

## File Structure

| Path | Responsibility |
|---|---|
| `app/layout.tsx` | Root layout: fonts, `<html>` theme, global CSS |
| `app/globals.css` | Tailwind import + `@theme` token definitions |
| `app/page.tsx` | Landing page — composes `components/landing/*` |
| `app/r/[offerId]/[wallet]/page.tsx` | Tracking redirect: records click, forwards to target URL. A client page, not a route handler — click counts live in `localStorage`, which a server handler cannot read. |
| `app/app/layout.tsx` | Wallet gate, nav, prototype banner, providers |
| `app/app/page.tsx` | Browse marketplace |
| `app/app/offers/[id]/page.tsx` | Offer detail + Get my link |
| `app/app/links/page.tsx` | Affiliate dashboard |
| `app/app/my-offers/page.tsx` | Create offer + advertiser dashboard |
| `app/app/simulate/page.tsx` | Conversion simulator |
| `lib/types.ts` | Domain types — the single source of shape truth |
| `lib/store/storage.ts` | `localStorage` read/write primitives, SSR-safe, throw-safe |
| `lib/store/seed.ts` | The six fictional offers + seed-once guard |
| `lib/store/offers.ts` | Offer reads/writes |
| `lib/store/links.ts` | Tracking link reads/writes |
| `lib/store/conversions.ts` | Conversion recording + queries |
| `lib/store/users.ts` | Account creation on first connection |
| `lib/store/index.ts` | Public seam — re-exports the modules above |
| `lib/store/provider.tsx` | React Context + version counter + typed hooks |
| `lib/wallet/provider.tsx` | Solana wallet adapter wiring, devnet |
| `lib/format.ts` | `money`, `shortAddress`, `linkUrl`, `round2`, `relativeDate` |
| `components/ui/*` | `Button`, `Badge`, `Input`, `Select`, `Textarea`, `Money`, `Address` |
| `components/app/*` | `OfferCard`, `OfferGrid`, `FilterBar`, `EscrowMeter`, `CreateOfferForm`, `TopUpDialog`, `Nav`, `PrototypeBanner`, `WalletBadge` |
| `components/landing/*` | `Hero`, `Problem`, `HowItWorks`, `WhyEscrow`, `WhatYouGet`, `Market`, `Footer` |

`Money` and `Address` are components rather than helpers so mono + tabular numerals are applied in exactly one place each and cannot drift.

---

## Task 1: Scaffold, tokens, and test harness

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `vitest.config.ts`, `vitest.setup.ts`, `.gitignore`
- Create: `app/layout.tsx`, `app/globals.css`, `app/page.tsx`
- Test: `lib/__tests__/smoke.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces: a running Next.js app; `npx vitest run` executes; Tailwind classes `bg-canvas`, `text-muted`, `border-line`, `text-escrow`, `text-paid`, `text-depleted`, `font-mono` all resolve.

- [ ] **Step 1: Scaffold the app**

Run from the repo root (`/Users/ilaladyga/Affiliate-marketplace`). The directory already contains `README.md` and `docs/`, so scaffold in place:

```bash
npx create-next-app@latest . --typescript --tailwind --app --eslint --no-src-dir --import-alias "@/*" --use-npm
```

Answer "yes" to proceeding in a non-empty directory. Then add test tooling:

```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom @testing-library/user-event @testing-library/jest-dom
```

- [ ] **Step 2: Configure Vitest**

Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
})
```

Create `vitest.setup.ts`:

```ts
import '@testing-library/jest-dom/vitest'
import React from 'react'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

/**
 * next/link and next/navigation both reach for the App Router context, which
 * does not exist under jsdom. Every component test that renders a link or
 * reads the pathname would otherwise fail on an invariant rather than on the
 * behaviour under test.
 */
vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...rest
  }: { href: string; children: React.ReactNode } & Record<string, unknown>) =>
    React.createElement('a', { href, ...rest }, children),
}))

vi.mock('next/navigation', () => ({
  usePathname: () => '/app',
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn(), prefetch: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))

afterEach(() => {
  cleanup()
  window.localStorage.clear()
})
```

Because `next/navigation` is mocked globally, a test that needs a different
pathname passes it explicitly — which is why `Nav` in Task 10 takes `pathname`
as a prop rather than reading it itself.

Add to `package.json` scripts:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 3: Write the failing smoke test**

Create `lib/__tests__/smoke.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { round2 } from '@/lib/format'

describe('round2', () => {
  it('trims binary float drift to two decimals', () => {
    expect(round2(750 - 12.5 * 3)).toBe(712.5)
    expect(round2(0.1 + 0.2)).toBe(0.3)
  })

  it('leaves clean values untouched', () => {
    expect(round2(24)).toBe(24)
  })
})
```

- [ ] **Step 4: Run it and watch it fail**

```bash
npx vitest run lib/__tests__/smoke.test.ts
```

Expected: FAIL — cannot resolve `@/lib/format`.

- [ ] **Step 5: Create `lib/format.ts` with only `round2`**

```ts
export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100
}
```

- [ ] **Step 6: Run it and watch it pass**

```bash
npx vitest run lib/__tests__/smoke.test.ts
```

Expected: PASS, 2 tests.

- [ ] **Step 7: Define the design tokens**

Replace `app/globals.css` entirely:

```css
@import "tailwindcss";

@theme {
  --color-canvas: #0B0D10;
  --color-surface: #141922;
  --color-line: #242C38;
  --color-text: #E6EAF0;
  --color-muted: #8695A8;
  --color-escrow: #F2B231;
  --color-paid: #3FCF8E;
  --color-depleted: #E5484D;

  --font-sans: var(--font-inter), system-ui, sans-serif;
  --font-mono: var(--font-jetbrains), ui-monospace, monospace;
}

html, body {
  background: var(--color-canvas);
  color: var(--color-text);
}

/* Numbers are a first-class visual element: they always align in columns. */
.tnum {
  font-variant-numeric: tabular-nums;
}
```

- [ ] **Step 8: Wire the fonts in the root layout**

Replace `app/layout.tsx`:

```tsx
import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains', display: 'swap' })

export const metadata: Metadata = {
  title: 'Nativness — commission budgets locked before the offer goes live',
  description:
    'A Solana-native affiliate marketplace where the commission budget sits in escrow before affiliates ever see the offer.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable}`}>
      <body className="font-sans antialiased bg-canvas text-text">{children}</body>
    </html>
  )
}
```

- [ ] **Step 9: Placeholder landing page proving tokens resolve**

Replace `app/page.tsx`:

```tsx
export default function LandingPage() {
  return (
    <main className="min-h-dvh grid place-items-center px-4">
      <div className="border border-line bg-surface rounded-md p-6 max-w-sm w-full">
        <p className="text-muted text-sm">Escrow remaining</p>
        <p className="font-mono tnum text-2xl">
          <span className="text-escrow">$340.00</span>
          <span className="text-muted"> / $500.00</span>
        </p>
      </div>
    </main>
  )
}
```

- [ ] **Step 10: Verify the app boots and the tokens render**

```bash
npm run dev
```

Open `http://localhost:3000`. Expected: near-black page, one bordered card, `$340.00` in amber mono, `/ $500.00` in muted grey. If the colours are default Tailwind instead, the `@theme` block did not load — check that `globals.css` is imported by `app/layout.tsx`.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js app with Nativness design tokens and Vitest harness"
```

---

## Task 2: Domain types and storage primitives

**Files:**
- Create: `lib/types.ts`, `lib/store/storage.ts`
- Test: `lib/store/__tests__/storage.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces:
  - `Category`, `User`, `Offer`, `TrackingLink`, `Conversion` types
  - `KEYS` — the five storage keys
  - `read<T>(key: string, fallback: T): T`
  - `write<T>(key: string, value: T): void`
  - `newId(prefix: string): string`

- [ ] **Step 1: Write the failing test**

Create `lib/store/__tests__/storage.test.ts`:

```ts
import { describe, it, expect, vi } from 'vitest'
import { read, write, newId, KEYS } from '@/lib/store/storage'

describe('storage', () => {
  it('round-trips a value', () => {
    write('nativness:v1:test', [{ a: 1 }])
    expect(read('nativness:v1:test', [])).toEqual([{ a: 1 }])
  })

  it('returns the fallback when the key is absent', () => {
    expect(read('nativness:v1:missing', 'fallback')).toBe('fallback')
  })

  it('returns the fallback when stored JSON is corrupt', () => {
    window.localStorage.setItem('nativness:v1:bad', '{not json')
    expect(read('nativness:v1:bad', [])).toEqual([])
  })

  it('does not throw when writing fails, e.g. quota or private mode', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError')
    })
    expect(() => write('nativness:v1:test', { a: 1 })).not.toThrow()
    spy.mockRestore()
  })

  it('mints unique prefixed ids', () => {
    const ids = new Set(Array.from({ length: 200 }, () => newId('of')))
    expect(ids.size).toBe(200)
    expect([...ids][0]).toMatch(/^of_/)
  })

  it('exposes the five v1 keys', () => {
    expect(Object.values(KEYS)).toEqual([
      'nativness:v1:offers',
      'nativness:v1:links',
      'nativness:v1:conversions',
      'nativness:v1:users',
      'nativness:v1:seeded',
    ])
  })
})
```

- [ ] **Step 2: Run it and watch it fail**

```bash
npx vitest run lib/store/__tests__/storage.test.ts
```

Expected: FAIL — cannot resolve `@/lib/store/storage`.

- [ ] **Step 3: Write `lib/types.ts`**

```ts
export type Category = 'ecommerce' | 'igaming' | 'dating' | 'saas' | 'finance' | 'other'

export const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'ecommerce', label: 'Ecommerce' },
  { value: 'igaming', label: 'iGaming' },
  { value: 'dating', label: 'Dating' },
  { value: 'saas', label: 'SaaS' },
  { value: 'finance', label: 'Finance' },
  { value: 'other', label: 'Other' },
]

export type User = {
  wallet: string
  createdAt: string
}

export type OfferStatus = 'active' | 'depleted'

export type Offer = {
  id: string
  advertiserWallet: string
  name: string
  description: string
  category: Category
  /** CPA only: a fixed USD amount per confirmed conversion. */
  commissionAmountUsd: number
  conversionTerms: string
  targetUrl: string
  escrowTotalUsd: number
  escrowRemainingUsd: number
  /** Seeded only. Never self-set by a user. */
  verified: boolean
  status: OfferStatus
  createdAt: string
}

export type TrackingLink = {
  id: string
  offerId: string
  affiliateWallet: string
  clicks: number
  createdAt: string
}

/** A confirmed conversion IS the payout record in v1. */
export type Conversion = {
  id: string
  linkId: string
  offerId: string
  affiliateWallet: string
  /** Snapshotted at confirmation so history stays correct if commission changes. */
  amountUsd: number
  confirmedAt: string
  source: 'simulator'
}

export type OfferDraft = Pick<
  Offer,
  'name' | 'description' | 'category' | 'commissionAmountUsd' | 'conversionTerms' | 'targetUrl'
> & { escrowBudgetUsd: number }
```

- [ ] **Step 4: Write `lib/store/storage.ts`**

```ts
export const KEYS = {
  offers: 'nativness:v1:offers',
  links: 'nativness:v1:links',
  conversions: 'nativness:v1:conversions',
  users: 'nativness:v1:users',
  seeded: 'nativness:v1:seeded',
} as const

/**
 * localStorage is unavailable during SSR and can throw in private mode or
 * when the quota is exhausted. Every access is guarded; callers get the
 * fallback rather than an exception.
 */
export function read<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(key)
    return raw === null ? fallback : (JSON.parse(raw) as T)
  } catch {
    return fallback
  }
}

export function write<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Quota exceeded or storage blocked. Phase 1 degrades rather than crashes.
  }
}

let counter = 0
export function newId(prefix: string): string {
  counter += 1
  return `${prefix}_${Date.now().toString(36)}${counter.toString(36)}${Math.random()
    .toString(36)
    .slice(2, 8)}`
}
```

- [ ] **Step 5: Run it and watch it pass**

```bash
npx vitest run lib/store/__tests__/storage.test.ts
```

Expected: PASS, 6 tests.

- [ ] **Step 6: Commit**

```bash
git add lib/types.ts lib/store/storage.ts lib/store/__tests__/storage.test.ts
git commit -m "feat: add domain types and SSR-safe storage primitives"
```

---

## Task 3: Seed data

**Files:**
- Create: `lib/store/seed.ts`
- Test: `lib/store/__tests__/seed.test.ts`

**Interfaces:**
- Consumes: `KEYS`, `read`, `write` from `lib/store/storage`; `Offer` from `lib/types`
- Produces: `ensureSeeded(): void`, `SEED_WALLETS` (two fictional advertiser addresses), `SEED_OFFERS: Offer[]`

- [ ] **Step 1: Write the failing test**

Create `lib/store/__tests__/seed.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { ensureSeeded, SEED_OFFERS } from '@/lib/store/seed'
import { read, KEYS } from '@/lib/store/storage'
import type { Offer } from '@/lib/types'

describe('seed', () => {
  it('writes six offers on first run', () => {
    ensureSeeded()
    expect(read<Offer[]>(KEYS.offers, [])).toHaveLength(6)
  })

  it('is idempotent — a second call does not duplicate', () => {
    ensureSeeded()
    ensureSeeded()
    expect(read<Offer[]>(KEYS.offers, [])).toHaveLength(6)
  })

  it('does not re-seed after the user deletes every offer', () => {
    ensureSeeded()
    // Simulate the user emptying the marketplace; the flag must hold.
    window.localStorage.setItem(KEYS.offers, JSON.stringify([]))
    ensureSeeded()
    expect(read<Offer[]>(KEYS.offers, [])).toHaveLength(0)
  })

  it('marks exactly two offers Verified', () => {
    expect(SEED_OFFERS.filter((o) => o.verified)).toHaveLength(2)
  })

  it('includes one nearly-exhausted and one fully depleted offer', () => {
    const fenwick = SEED_OFFERS.find((o) => o.name === 'Fenwick Grounds')!
    // Nearly exhausted but still fundable: $54 remaining covers three $18 conversions.
    expect(fenwick.status).toBe('active')
    expect(fenwick.escrowRemainingUsd).toBe(54)

    const depleted = SEED_OFFERS.filter((o) => o.status === 'depleted')
    expect(depleted.map((o) => o.name)).toEqual(['Halcyon Tools'])
    expect(depleted[0].escrowRemainingUsd).toBe(0)
  })

  it('never uses a real brand name', () => {
    const names = SEED_OFFERS.map((o) => o.name.toLowerCase())
    for (const real of ['amazon', 'rakuten', 'shopify', 'booking', 'tinder', 'bet365']) {
      expect(names.some((n) => n.includes(real))).toBe(false)
    }
  })

  it('every seeded offer carries a remaining balance no greater than its total', () => {
    for (const o of SEED_OFFERS) {
      expect(o.escrowRemainingUsd).toBeLessThanOrEqual(o.escrowTotalUsd)
    }
  })
})
```

- [ ] **Step 2: Run it and watch it fail**

```bash
npx vitest run lib/store/__tests__/seed.test.ts
```

Expected: FAIL — cannot resolve `@/lib/store/seed`.

Note: "nearly exhausted" and "depleted" are different states. `Fenwick Grounds` has `$54` against an `$18` commission, so it is still *active* — it can fund three more conversions. Only `Halcyon Tools` at `$0` is depleted.

- [ ] **Step 3: Write `lib/store/seed.ts`**

```ts
import { KEYS, read, write } from './storage'
import type { Offer } from '@/lib/types'

/** Fictional advertiser wallets. Plausible base58, not real accounts. */
export const SEED_WALLETS = {
  drayton: '4QvYm2NqHRBxTtLpZ8cWgKdF3hSnA9uJeVrX6bPyMzCk',
  meridian: '9hKpR3wLnBqYc5TdVmZ2xGfJ8sAeU7NvQrHtX4byCiWo',
} as const

const at = (daysAgo: number) =>
  new Date(Date.UTC(2026, 8, 26 - daysAgo, 12, 0, 0)).toISOString()

export const SEED_OFFERS: Offer[] = [
  {
    id: 'of_seed_drayton',
    advertiserWallet: SEED_WALLETS.drayton,
    name: 'Drayton Supply Co.',
    description:
      'Workwear and site equipment sold direct to trade customers across the UK and Ireland. We pay on first completed order from a new account, not on signup.',
    category: 'ecommerce',
    commissionAmountUsd: 24,
    conversionTerms:
      'A conversion is a first order of $60 or more from a new trade account, confirmed after the 14-day returns window closes.',
    targetUrl: 'https://example.com/drayton',
    escrowTotalUsd: 500,
    escrowRemainingUsd: 340,
    verified: true,
    status: 'active',
    createdAt: at(31),
  },
  {
    id: 'of_seed_meridian',
    advertiserWallet: SEED_WALLETS.meridian,
    name: 'Meridian Ledger',
    description:
      'Double-entry bookkeeping for small agencies. Conversion is a paid subscription that survives the trial, so affiliates are not paid for tyre-kickers.',
    category: 'saas',
    commissionAmountUsd: 65,
    conversionTerms:
      'A conversion is a paid plan still active on day 30. Trials that lapse do not count and do not draw down escrow.',
    targetUrl: 'https://example.com/meridian',
    escrowTotalUsd: 4000,
    escrowRemainingUsd: 2600,
    verified: true,
    status: 'active',
    createdAt: at(24),
  },
  {
    id: 'of_seed_kestrel',
    advertiserWallet: SEED_WALLETS.drayton,
    name: 'Kestrel Play',
    description:
      'Licensed casino and sportsbook operating in regulated markets only. High CPA, strict geo rules — read the terms before sending traffic.',
    category: 'igaming',
    commissionAmountUsd: 110,
    conversionTerms:
      'A conversion is a verified depositing player with a first deposit of $50 or more, from an approved jurisdiction. Self-excluded and duplicate accounts are rejected.',
    targetUrl: 'https://example.com/kestrel',
    escrowTotalUsd: 3300,
    escrowRemainingUsd: 1430,
    verified: false,
    status: 'active',
    createdAt: at(17),
  },
  {
    id: 'of_seed_coastline',
    advertiserWallet: SEED_WALLETS.meridian,
    name: 'Coastline',
    description:
      'A slower dating app built around shared plans rather than swiping. Low commission, high volume, no incentive traffic.',
    category: 'dating',
    commissionAmountUsd: 12.5,
    conversionTerms:
      'A conversion is a completed profile with a verified photo and one sent message. Incentivised or bot traffic is rejected and does not draw down escrow.',
    targetUrl: 'https://example.com/coastline',
    escrowTotalUsd: 750,
    escrowRemainingUsd: 187.5,
    verified: false,
    status: 'active',
    createdAt: at(11),
  },
  {
    id: 'of_seed_fenwick',
    advertiserWallet: SEED_WALLETS.drayton,
    name: 'Fenwick Grounds',
    description:
      'Single-origin coffee on a rolling subscription. Escrow is nearly spent — top-ups are at the advertiser’s discretion, so check the balance before you invest in creative.',
    category: 'ecommerce',
    commissionAmountUsd: 18,
    conversionTerms:
      'A conversion is a subscription that reaches its second delivery. One-off purchases do not qualify.',
    targetUrl: 'https://example.com/fenwick',
    escrowTotalUsd: 900,
    escrowRemainingUsd: 54,
    verified: false,
    status: 'active',
    createdAt: at(6),
  },
  {
    id: 'of_seed_halcyon',
    advertiserWallet: SEED_WALLETS.meridian,
    name: 'Halcyon Tools',
    description:
      'Design handoff tooling for product teams. Escrow is exhausted: no further conversions can be funded until the advertiser tops up.',
    category: 'saas',
    commissionAmountUsd: 40,
    conversionTerms:
      'A conversion is a paid seat active on day 14. This offer cannot currently pay out — its escrow balance is zero.',
    targetUrl: 'https://example.com/halcyon',
    escrowTotalUsd: 1200,
    escrowRemainingUsd: 0,
    verified: false,
    status: 'depleted',
    createdAt: at(3),
  },
]

/**
 * Seeds once per browser. The flag is separate from the offers array so that
 * a user who deletes every offer does not get the demo data resurrected.
 */
export function ensureSeeded(): void {
  if (read<boolean>(KEYS.seeded, false)) return
  write(KEYS.offers, SEED_OFFERS)
  write(KEYS.seeded, true)
}
```

- [ ] **Step 4: Run it and watch it pass**

```bash
npx vitest run lib/store/__tests__/seed.test.ts
```

Expected: PASS, 7 tests.

- [ ] **Step 5: Commit**

```bash
git add lib/store/seed.ts lib/store/__tests__/seed.test.ts
git commit -m "feat: add six fictional seed offers with both degraded escrow states"
```

---

## Task 4: Offers store

**Files:**
- Create: `lib/store/offers.ts`
- Test: `lib/store/__tests__/offers.test.ts`

**Interfaces:**
- Consumes: `KEYS`, `read`, `write`, `newId`; `ensureSeeded`; `round2`; `Offer`, `OfferDraft`, `OfferStatus`, `Category`
- Produces:
  - `deriveStatus(offer: Pick<Offer,'escrowRemainingUsd'|'commissionAmountUsd'>): OfferStatus`
  - `listOffers(opts?: { category?: Category; query?: string }): Offer[]`
  - `getOffer(id: string): Offer | null`
  - `createOffer(draft: OfferDraft, advertiserWallet: string): Offer`
  - `topUpEscrow(offerId: string, amountUsd: number): Offer | null`
  - `listOffersByAdvertiser(wallet: string): Offer[]`

- [ ] **Step 1: Write the failing test**

Create `lib/store/__tests__/offers.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import {
  deriveStatus,
  listOffers,
  getOffer,
  createOffer,
  topUpEscrow,
  listOffersByAdvertiser,
} from '@/lib/store/offers'
import type { OfferDraft } from '@/lib/types'

const WALLET = '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU'

const draft: OfferDraft = {
  name: 'Ashcroft Rail',
  description: 'Discount rail booking for commuters in the north of England.',
  category: 'ecommerce',
  commissionAmountUsd: 15,
  conversionTerms: 'A conversion is a completed booking of $40 or more.',
  targetUrl: 'https://example.com/ashcroft',
  escrowBudgetUsd: 300,
}

describe('deriveStatus', () => {
  it('is active while the remainder can fund one more conversion', () => {
    expect(deriveStatus({ escrowRemainingUsd: 18, commissionAmountUsd: 18 })).toBe('active')
  })

  it('is depleted the moment it cannot', () => {
    expect(deriveStatus({ escrowRemainingUsd: 17.99, commissionAmountUsd: 18 })).toBe('depleted')
    expect(deriveStatus({ escrowRemainingUsd: 0, commissionAmountUsd: 18 })).toBe('depleted')
  })
})

describe('listOffers', () => {
  it('seeds on first read', () => {
    expect(listOffers()).toHaveLength(6)
  })

  it('filters by category', () => {
    const saas = listOffers({ category: 'saas' })
    expect(saas.map((o) => o.name).sort()).toEqual(['Halcyon Tools', 'Meridian Ledger'])
  })

  it('searches name and description, case-insensitively', () => {
    expect(listOffers({ query: 'DRAYTON' }).map((o) => o.name)).toEqual(['Drayton Supply Co.'])
    // 'bookkeeping' appears only in Meridian's description.
    expect(listOffers({ query: 'bookkeeping' }).map((o) => o.name)).toEqual(['Meridian Ledger'])
  })

  it('does not search conversion terms or target URL', () => {
    expect(listOffers({ query: 'example.com' })).toHaveLength(0)
    expect(listOffers({ query: 'returns window' })).toHaveLength(0)
  })

  it('treats a whitespace-only query as no query', () => {
    expect(listOffers({ query: '   ' })).toHaveLength(6)
  })
})

describe('createOffer', () => {
  it('appears in the marketplace immediately', () => {
    const before = listOffers().length
    const offer = createOffer(draft, WALLET)
    expect(listOffers()).toHaveLength(before + 1)
    expect(getOffer(offer.id)!.name).toBe('Ashcroft Rail')
  })

  it('locks the whole budget: remaining equals total', () => {
    const offer = createOffer(draft, WALLET)
    expect(offer.escrowTotalUsd).toBe(300)
    expect(offer.escrowRemainingUsd).toBe(300)
  })

  it('is always Community — a user cannot self-verify', () => {
    const offer = createOffer({ ...draft, name: 'Sneaky Ltd' }, WALLET)
    expect(offer.verified).toBe(false)
  })

  it('is depleted on creation if the budget cannot fund one conversion', () => {
    const offer = createOffer({ ...draft, escrowBudgetUsd: 10 }, WALLET)
    expect(offer.status).toBe('depleted')
  })

  it('attributes the offer to the creating wallet', () => {
    createOffer(draft, WALLET)
    expect(listOffersByAdvertiser(WALLET).map((o) => o.name)).toEqual(['Ashcroft Rail'])
  })
})

describe('topUpEscrow', () => {
  it('raises both the total and the remainder', () => {
    const offer = createOffer(draft, WALLET)
    const topped = topUpEscrow(offer.id, 200)!
    expect(topped.escrowTotalUsd).toBe(500)
    expect(topped.escrowRemainingUsd).toBe(500)
  })

  it('revives a depleted offer once it can fund a conversion again', () => {
    const offer = createOffer({ ...draft, escrowBudgetUsd: 10 }, WALLET)
    expect(offer.status).toBe('depleted')
    expect(topUpEscrow(offer.id, 20)!.status).toBe('active')
  })

  it('leaves an offer depleted if the top-up is still too small', () => {
    const offer = createOffer({ ...draft, escrowBudgetUsd: 1 }, WALLET)
    expect(topUpEscrow(offer.id, 2)!.status).toBe('depleted')
  })

  it('rounds to two decimals rather than drifting', () => {
    const offer = createOffer({ ...draft, escrowBudgetUsd: 0.1 }, WALLET)
    expect(topUpEscrow(offer.id, 0.2)!.escrowRemainingUsd).toBe(0.3)
  })

  it('returns null for an unknown offer', () => {
    expect(topUpEscrow('of_nope', 100)).toBeNull()
  })

  it('rejects a non-positive top-up', () => {
    const offer = createOffer(draft, WALLET)
    expect(topUpEscrow(offer.id, 0)).toBeNull()
    expect(topUpEscrow(offer.id, -50)).toBeNull()
    expect(getOffer(offer.id)!.escrowTotalUsd).toBe(300)
  })
})

describe('getOffer', () => {
  it('returns null for an unknown id', () => {
    expect(getOffer('of_nope')).toBeNull()
  })
})
```

- [ ] **Step 2: Run it and watch it fail**

```bash
npx vitest run lib/store/__tests__/offers.test.ts
```

Expected: FAIL — cannot resolve `@/lib/store/offers`.

- [ ] **Step 3: Write `lib/store/offers.ts`**

```ts
import { KEYS, newId, read, write } from './storage'
import { ensureSeeded } from './seed'
import { round2 } from '@/lib/format'
import type { Category, Offer, OfferDraft, OfferStatus } from '@/lib/types'

/**
 * An offer is depleted when its remaining escrow cannot fund one more
 * conversion. Equality is still active: exactly enough is enough.
 */
export function deriveStatus(
  o: Pick<Offer, 'escrowRemainingUsd' | 'commissionAmountUsd'>,
): OfferStatus {
  return o.escrowRemainingUsd >= o.commissionAmountUsd ? 'active' : 'depleted'
}

function all(): Offer[] {
  ensureSeeded()
  return read<Offer[]>(KEYS.offers, [])
}

function persist(offers: Offer[]): void {
  write(KEYS.offers, offers)
}

export function listOffers(opts: { category?: Category; query?: string } = {}): Offer[] {
  let offers = all()
  if (opts.category) {
    offers = offers.filter((o) => o.category === opts.category)
  }
  const q = opts.query?.trim().toLowerCase()
  if (q) {
    // Name and description only. URLs are not how people search, and
    // conversion terms are long enough to match almost anything.
    offers = offers.filter(
      (o) => o.name.toLowerCase().includes(q) || o.description.toLowerCase().includes(q),
    )
  }
  return offers
}

export function getOffer(id: string): Offer | null {
  return all().find((o) => o.id === id) ?? null
}

export function listOffersByAdvertiser(wallet: string): Offer[] {
  return all().filter((o) => o.advertiserWallet === wallet)
}

export function createOffer(draft: OfferDraft, advertiserWallet: string): Offer {
  const budget = round2(draft.escrowBudgetUsd)
  const commission = round2(draft.commissionAmountUsd)
  const offer: Offer = {
    id: newId('of'),
    advertiserWallet,
    name: draft.name.trim(),
    description: draft.description.trim(),
    category: draft.category,
    commissionAmountUsd: commission,
    conversionTerms: draft.conversionTerms.trim(),
    targetUrl: draft.targetUrl.trim(),
    escrowTotalUsd: budget,
    escrowRemainingUsd: budget,
    // Verification is never self-granted. Phase 2 adds the review path.
    verified: false,
    status: deriveStatus({ escrowRemainingUsd: budget, commissionAmountUsd: commission }),
    createdAt: new Date().toISOString(),
  }
  persist([offer, ...all()])
  return offer
}

/**
 * Raises total AND remaining. Raising only the remainder would render an
 * incoherent card ($540 / $500); raising only the total would take the
 * advertiser's money without funding anything.
 */
export function topUpEscrow(offerId: string, amountUsd: number): Offer | null {
  if (!(amountUsd > 0)) return null
  const offers = all()
  const current = offers.find((o) => o.id === offerId)
  if (!current) return null

  const amount = round2(amountUsd)
  const updated: Offer = {
    ...current,
    escrowTotalUsd: round2(current.escrowTotalUsd + amount),
    escrowRemainingUsd: round2(current.escrowRemainingUsd + amount),
  }
  updated.status = deriveStatus(updated)

  persist(offers.map((o) => (o.id === offerId ? updated : o)))
  return updated
}
```

- [ ] **Step 4: Run it and watch it pass**

```bash
npx vitest run lib/store/__tests__/offers.test.ts
```

Expected: PASS, 19 tests.

- [ ] **Step 5: Commit**

```bash
git add lib/store/offers.ts lib/store/__tests__/offers.test.ts
git commit -m "feat: add offers store with escrow status derivation and top-up"
```

---

## Task 5: Tracking links store

**Files:**
- Create: `lib/store/links.ts`
- Test: `lib/store/__tests__/links.test.ts`

**Interfaces:**
- Consumes: `KEYS`, `read`, `write`, `newId`; `TrackingLink`
- Produces:
  - `issueLink(offerId: string, affiliateWallet: string): TrackingLink` — idempotent
  - `getLink(id: string): TrackingLink | null`
  - `findLink(offerId: string, affiliateWallet: string): TrackingLink | null`
  - `listLinksByAffiliate(wallet: string): TrackingLink[]`
  - `recordClick(offerId: string, affiliateWallet: string): void`

- [ ] **Step 1: Write the failing test**

Create `lib/store/__tests__/links.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import {
  issueLink,
  getLink,
  findLink,
  listLinksByAffiliate,
  recordClick,
} from '@/lib/store/links'

const A = '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU'
const B = '3nMwKpQ8rTyVbCfXzJ5hLdSaG2eU9NvRqBtHxY4kciWo'

describe('issueLink', () => {
  it('mints a link tied to the offer and the affiliate wallet', () => {
    const link = issueLink('of_seed_drayton', A)
    expect(link.offerId).toBe('of_seed_drayton')
    expect(link.affiliateWallet).toBe(A)
    expect(link.clicks).toBe(0)
  })

  it('is idempotent — asking twice returns the same link, not a duplicate', () => {
    const first = issueLink('of_seed_drayton', A)
    const second = issueLink('of_seed_drayton', A)
    expect(second.id).toBe(first.id)
    expect(listLinksByAffiliate(A)).toHaveLength(1)
  })

  it('gives different affiliates different links for the same offer', () => {
    const forA = issueLink('of_seed_drayton', A)
    const forB = issueLink('of_seed_drayton', B)
    expect(forB.id).not.toBe(forA.id)
  })

  it('gives one affiliate different links for different offers', () => {
    issueLink('of_seed_drayton', A)
    issueLink('of_seed_kestrel', A)
    expect(listLinksByAffiliate(A)).toHaveLength(2)
  })
})

describe('listLinksByAffiliate', () => {
  it('returns only that wallet’s links', () => {
    issueLink('of_seed_drayton', A)
    issueLink('of_seed_kestrel', B)
    expect(listLinksByAffiliate(A).map((l) => l.offerId)).toEqual(['of_seed_drayton'])
  })

  it('returns an empty array for a wallet with no links', () => {
    expect(listLinksByAffiliate(B)).toEqual([])
  })
})

describe('recordClick', () => {
  it('increments the click count', () => {
    const link = issueLink('of_seed_drayton', A)
    recordClick('of_seed_drayton', A)
    recordClick('of_seed_drayton', A)
    expect(getLink(link.id)!.clicks).toBe(2)
  })

  it('creates the link on a cold click, so a shared URL still attributes', () => {
    // Someone shares their link; the affiliate never opened the app on this
    // browser. The click must not be dropped on the floor.
    recordClick('of_seed_kestrel', B)
    const link = findLink('of_seed_kestrel', B)
    expect(link).not.toBeNull()
    expect(link!.clicks).toBe(1)
  })
})

describe('getLink', () => {
  it('returns null for an unknown id', () => {
    expect(getLink('lk_nope')).toBeNull()
  })
})
```

- [ ] **Step 2: Run it and watch it fail**

```bash
npx vitest run lib/store/__tests__/links.test.ts
```

Expected: FAIL — cannot resolve `@/lib/store/links`.

- [ ] **Step 3: Write `lib/store/links.ts`**

```ts
import { KEYS, newId, read, write } from './storage'
import type { TrackingLink } from '@/lib/types'

function all(): TrackingLink[] {
  return read<TrackingLink[]>(KEYS.links, [])
}

function persist(links: TrackingLink[]): void {
  write(KEYS.links, links)
}

export function findLink(offerId: string, affiliateWallet: string): TrackingLink | null {
  return all().find((l) => l.offerId === offerId && l.affiliateWallet === affiliateWallet) ?? null
}

export function getLink(id: string): TrackingLink | null {
  return all().find((l) => l.id === id) ?? null
}

export function listLinksByAffiliate(wallet: string): TrackingLink[] {
  return all().filter((l) => l.affiliateWallet === wallet)
}

/**
 * Idempotent by (offer, affiliate). Minting a second link for the same pair
 * would fragment the affiliate's own attribution across two records.
 */
export function issueLink(offerId: string, affiliateWallet: string): TrackingLink {
  const existing = findLink(offerId, affiliateWallet)
  if (existing) return existing

  const link: TrackingLink = {
    id: newId('lk'),
    offerId,
    affiliateWallet,
    clicks: 0,
    createdAt: new Date().toISOString(),
  }
  persist([link, ...all()])
  return link
}

/**
 * Keyed by (offer, wallet) rather than link id because that is all a shared
 * URL carries. A click on a link this browser has never seen still counts.
 */
export function recordClick(offerId: string, affiliateWallet: string): void {
  const link = issueLink(offerId, affiliateWallet)
  persist(all().map((l) => (l.id === link.id ? { ...l, clicks: l.clicks + 1 } : l)))
}
```

- [ ] **Step 4: Run it and watch it pass**

```bash
npx vitest run lib/store/__tests__/links.test.ts
```

Expected: PASS, 9 tests.

- [ ] **Step 5: Commit**

```bash
git add lib/store/links.ts lib/store/__tests__/links.test.ts
git commit -m "feat: add idempotent tracking-link store with cold-click attribution"
```

---

## Task 6: Conversions store

**Files:**
- Create: `lib/store/conversions.ts`
- Test: `lib/store/__tests__/conversions.test.ts`

**Interfaces:**
- Consumes: `KEYS`, `read`, `write`, `newId`; `getLink`; `getOffer`, `deriveStatus`; `round2`; `Conversion`, `Offer`
- Produces:
  - `type ConversionResult = { ok: true; conversion: Conversion; offer: Offer } | { ok: false; reason: 'insufficient_escrow' | 'not_found' }`
  - `recordConversion(linkId: string): ConversionResult`
  - `listConversionsByAffiliate(wallet: string): Conversion[]`
  - `listConversionsByOffer(offerId: string): Conversion[]`
  - `totalEarnedUsd(wallet: string): number`
  - `spentUsd(offer: Offer): number`

- [ ] **Step 1: Write the failing test**

Create `lib/store/__tests__/conversions.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import {
  recordConversion,
  listConversionsByAffiliate,
  listConversionsByOffer,
  totalEarnedUsd,
  spentUsd,
} from '@/lib/store/conversions'
import { issueLink } from '@/lib/store/links'
import { createOffer, getOffer, listOffers, topUpEscrow } from '@/lib/store/offers'
import type { OfferDraft } from '@/lib/types'

const AFFILIATE = '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU'
const ADVERTISER = '3nMwKpQ8rTyVbCfXzJ5hLdSaG2eU9NvRqBtHxY4kciWo'

const draft: OfferDraft = {
  name: 'Ashcroft Rail',
  description: 'Discount rail booking for commuters.',
  category: 'ecommerce',
  commissionAmountUsd: 15,
  conversionTerms: 'A conversion is a completed booking of $40 or more.',
  targetUrl: 'https://example.com/ashcroft',
  escrowBudgetUsd: 30,
}

describe('recordConversion', () => {
  it('decrements the offer’s escrow by exactly the commission', () => {
    listOffers()
    const link = issueLink('of_seed_drayton', AFFILIATE)
    const result = recordConversion(link.id)
    expect(result.ok).toBe(true)
    // Drayton seeds at $340 remaining with a $24 commission.
    expect(getOffer('of_seed_drayton')!.escrowRemainingUsd).toBe(316)
  })

  it('appends a payout record for that affiliate', () => {
    listOffers()
    const link = issueLink('of_seed_drayton', AFFILIATE)
    recordConversion(link.id)
    const rows = listConversionsByAffiliate(AFFILIATE)
    expect(rows).toHaveLength(1)
    expect(rows[0].amountUsd).toBe(24)
    expect(rows[0].source).toBe('simulator')
  })

  it('snapshots the amount so history survives a commission change', () => {
    const offer = createOffer(draft, ADVERTISER)
    const link = issueLink(offer.id, AFFILIATE)
    recordConversion(link.id)
    expect(listConversionsByAffiliate(AFFILIATE)[0].amountUsd).toBe(15)
  })

  it('flips the offer to depleted when the remainder can no longer fund one', () => {
    // $30 budget, $15 commission: two conversions exhaust it.
    const offer = createOffer(draft, ADVERTISER)
    const link = issueLink(offer.id, AFFILIATE)
    recordConversion(link.id)
    expect(getOffer(offer.id)!.status).toBe('active')
    recordConversion(link.id)
    const after = getOffer(offer.id)!
    expect(after.escrowRemainingUsd).toBe(0)
    expect(after.status).toBe('depleted')
  })

  it('refuses once escrow cannot fund another conversion', () => {
    const offer = createOffer(draft, ADVERTISER)
    const link = issueLink(offer.id, AFFILIATE)
    recordConversion(link.id)
    recordConversion(link.id)
    const result = recordConversion(link.id)
    expect(result).toEqual({ ok: false, reason: 'insufficient_escrow' })
  })

  it('does not decrement escrow or record a payout when it refuses', () => {
    const offer = createOffer({ ...draft, escrowBudgetUsd: 10 }, ADVERTISER)
    const link = issueLink(offer.id, AFFILIATE)
    expect(recordConversion(link.id)).toEqual({ ok: false, reason: 'insufficient_escrow' })
    expect(getOffer(offer.id)!.escrowRemainingUsd).toBe(10)
    expect(listConversionsByAffiliate(AFFILIATE)).toHaveLength(0)
  })

  it('pays out again after a top-up revives the offer', () => {
    const offer = createOffer({ ...draft, escrowBudgetUsd: 10 }, ADVERTISER)
    const link = issueLink(offer.id, AFFILIATE)
    expect(recordConversion(link.id).ok).toBe(false)
    topUpEscrow(offer.id, 20)
    expect(recordConversion(link.id).ok).toBe(true)
  })

  it('reports not_found for an unknown link', () => {
    expect(recordConversion('lk_nope')).toEqual({ ok: false, reason: 'not_found' })
  })

  it('rounds repeated subtraction rather than drifting', () => {
    // Coastline: $187.50 remaining, $12.50 commission.
    listOffers()
    const link = issueLink('of_seed_coastline', AFFILIATE)
    for (let i = 0; i < 3; i += 1) recordConversion(link.id)
    expect(getOffer('of_seed_coastline')!.escrowRemainingUsd).toBe(150)
  })
})

describe('aggregates', () => {
  it('totals an affiliate’s earnings across offers', () => {
    listOffers()
    recordConversion(issueLink('of_seed_drayton', AFFILIATE).id) // $24
    recordConversion(issueLink('of_seed_meridian', AFFILIATE).id) // $65
    expect(totalEarnedUsd(AFFILIATE)).toBe(89)
  })

  it('returns zero earnings for a wallet with no conversions', () => {
    expect(totalEarnedUsd(ADVERTISER)).toBe(0)
  })

  it('lists conversions per offer', () => {
    listOffers()
    recordConversion(issueLink('of_seed_drayton', AFFILIATE).id)
    expect(listConversionsByOffer('of_seed_drayton')).toHaveLength(1)
    expect(listConversionsByOffer('of_seed_kestrel')).toHaveLength(0)
  })

  it('derives budget spent from total minus remaining', () => {
    listOffers()
    recordConversion(issueLink('of_seed_drayton', AFFILIATE).id)
    expect(spentUsd(getOffer('of_seed_drayton')!)).toBe(184)
  })
})
```

- [ ] **Step 2: Run it and watch it fail**

```bash
npx vitest run lib/store/__tests__/conversions.test.ts
```

Expected: FAIL — cannot resolve `@/lib/store/conversions`.

- [ ] **Step 3: Write `lib/store/conversions.ts`**

```ts
import { KEYS, newId, read, write } from './storage'
import { getLink } from './links'
import { deriveStatus } from './offers'
import { ensureSeeded } from './seed'
import { round2 } from '@/lib/format'
import type { Conversion, Offer } from '@/lib/types'

export type ConversionResult =
  | { ok: true; conversion: Conversion; offer: Offer }
  | { ok: false; reason: 'insufficient_escrow' | 'not_found' }

function all(): Conversion[] {
  return read<Conversion[]>(KEYS.conversions, [])
}

export function listConversionsByAffiliate(wallet: string): Conversion[] {
  return all().filter((c) => c.affiliateWallet === wallet)
}

export function listConversionsByOffer(offerId: string): Conversion[] {
  return all().filter((c) => c.offerId === offerId)
}

export function totalEarnedUsd(wallet: string): number {
  return round2(listConversionsByAffiliate(wallet).reduce((sum, c) => sum + c.amountUsd, 0))
}

export function spentUsd(offer: Offer): number {
  return round2(offer.escrowTotalUsd - offer.escrowRemainingUsd)
}

/**
 * The single write path a Phase 2 postback handler will call. Returns a
 * result rather than throwing: insufficient escrow is an expected outcome
 * the UI renders, not an exception.
 *
 * Reads offers directly rather than via getOffer so the decrement and the
 * persist operate on one consistent snapshot.
 */
export function recordConversion(linkId: string): ConversionResult {
  const link = getLink(linkId)
  if (!link) return { ok: false, reason: 'not_found' }

  ensureSeeded()
  const offers = read<Offer[]>(KEYS.offers, [])
  const offer = offers.find((o) => o.id === link.offerId)
  if (!offer) return { ok: false, reason: 'not_found' }

  if (offer.escrowRemainingUsd < offer.commissionAmountUsd) {
    return { ok: false, reason: 'insufficient_escrow' }
  }

  const updated: Offer = {
    ...offer,
    escrowRemainingUsd: round2(offer.escrowRemainingUsd - offer.commissionAmountUsd),
  }
  updated.status = deriveStatus(updated)
  write(
    KEYS.offers,
    offers.map((o) => (o.id === offer.id ? updated : o)),
  )

  const conversion: Conversion = {
    id: newId('cv'),
    linkId,
    offerId: offer.id,
    affiliateWallet: link.affiliateWallet,
    // Snapshot: the payout is what the commission was at confirmation.
    amountUsd: offer.commissionAmountUsd,
    confirmedAt: new Date().toISOString(),
    source: 'simulator',
  }
  write(KEYS.conversions, [conversion, ...all()])

  return { ok: true, conversion, offer: updated }
}
```

- [ ] **Step 4: Run it and watch it pass**

```bash
npx vitest run lib/store/__tests__/conversions.test.ts
```

Expected: PASS, 13 tests.

- [ ] **Step 5: Run the whole suite — the seam is now complete**

```bash
npm test
```

Expected: PASS — roughly 56 tests across six files. Treat the count as
approximate: the gate is that nothing fails, not that the number matches.

- [ ] **Step 6: Commit**

```bash
git add lib/store/conversions.ts lib/store/__tests__/conversions.test.ts
git commit -m "feat: add conversion recording with escrow drawdown and depletion"
```

---

## Task 7: Users, the public seam, and the React provider

**Files:**
- Create: `lib/store/users.ts`, `lib/store/index.ts`, `lib/store/provider.tsx`
- Test: `lib/store/__tests__/users.test.ts`, `lib/store/__tests__/provider.test.tsx`

**Interfaces:**
- Consumes: everything from Tasks 2–6
- Produces:
  - `ensureUser(wallet: string): User`
  - `lib/store/index.ts` re-exporting the whole seam — **components import only from `@/lib/store`**
  - `<StoreProvider>` and hooks: `useStoreVersion()`, `useMutate()`, `useOffers(opts)`, `useOffer(id)`, `useMyOffers(wallet)`, `useMyLinks(wallet)`, `useMyConversions(wallet)`

- [ ] **Step 1: Write the failing tests**

Create `lib/store/__tests__/users.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { ensureUser } from '@/lib/store/users'

const W = '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU'

describe('ensureUser', () => {
  it('creates an account on first connection', () => {
    expect(ensureUser(W).wallet).toBe(W)
  })

  it('returns the same account on every later connection', () => {
    const first = ensureUser(W)
    const second = ensureUser(W)
    expect(second.createdAt).toBe(first.createdAt)
  })
})
```

Create `lib/store/__tests__/provider.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StoreProvider, useOffers, useMutate } from '@/lib/store/provider'
import { createOffer } from '@/lib/store'

const W = '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU'

function Harness() {
  const offers = useOffers()
  const mutate = useMutate()
  return (
    <div>
      <p data-testid="count">{offers.length}</p>
      <button
        onClick={() =>
          mutate(() =>
            createOffer(
              {
                name: 'Ashcroft Rail',
                description: 'Discount rail booking.',
                category: 'ecommerce',
                commissionAmountUsd: 15,
                conversionTerms: 'A completed booking of $40 or more.',
                targetUrl: 'https://example.com/ashcroft',
                escrowBudgetUsd: 300,
              },
              W,
            ),
          )
        }
      >
        List offer
      </button>
    </div>
  )
}

describe('StoreProvider', () => {
  it('re-renders every reader after a mutation, with no reload', async () => {
    render(
      <StoreProvider>
        <Harness />
      </StoreProvider>,
    )
    expect(screen.getByTestId('count')).toHaveTextContent('6')
    await userEvent.click(screen.getByRole('button', { name: 'List offer' }))
    expect(screen.getByTestId('count')).toHaveTextContent('7')
  })
})
```

- [ ] **Step 2: Run them and watch them fail**

```bash
npx vitest run lib/store/__tests__/users.test.ts lib/store/__tests__/provider.test.tsx
```

Expected: FAIL — cannot resolve `@/lib/store/users`, `@/lib/store/provider`.

- [ ] **Step 3: Write `lib/store/users.ts`**

```ts
import { KEYS, read, write } from './storage'
import type { User } from '@/lib/types'

/**
 * The first connection from an address creates the account; every later
 * connection returns the same one. There is no separate signup.
 */
export function ensureUser(wallet: string): User {
  const users = read<User[]>(KEYS.users, [])
  const existing = users.find((u) => u.wallet === wallet)
  if (existing) return existing

  const user: User = { wallet, createdAt: new Date().toISOString() }
  write(KEYS.users, [...users, user])
  return user
}
```

- [ ] **Step 4: Write `lib/store/index.ts`**

```ts
// The public seam. Components import from '@/lib/store' and nowhere deeper,
// so Phase 2 can replace these implementations with API calls without
// touching a single component.
export { deriveStatus, listOffers, getOffer, createOffer, topUpEscrow, listOffersByAdvertiser } from './offers'
export { issueLink, getLink, findLink, listLinksByAffiliate, recordClick } from './links'
export {
  recordConversion,
  listConversionsByAffiliate,
  listConversionsByOffer,
  totalEarnedUsd,
  spentUsd,
} from './conversions'
export type { ConversionResult } from './conversions'
export { ensureUser } from './users'
export { SEED_OFFERS, SEED_WALLETS } from './seed'
```

- [ ] **Step 5: Write `lib/store/provider.tsx`**

```tsx
'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import {
  listConversionsByAffiliate,
  listLinksByAffiliate,
  listOffers,
  listOffersByAdvertiser,
  getOffer,
} from '.'
import type { Category, Conversion, Offer, TrackingLink } from '@/lib/types'

type Ctx = { version: number; bump: () => void }
const StoreCtx = createContext<Ctx | null>(null)

/**
 * Holds no domain data. A version counter is bumped on every mutation, and
 * the hooks below re-read from the store whenever it changes. That keeps
 * localStorage as the single source of truth while still re-rendering every
 * reader — which is what makes a new offer appear in the grid with no reload.
 */
export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [version, setVersion] = useState(0)
  const bump = useCallback(() => setVersion((v) => v + 1), [])
  const value = useMemo(() => ({ version, bump }), [version, bump])
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>
}

function useCtx(): Ctx {
  const ctx = useContext(StoreCtx)
  if (!ctx) throw new Error('Store hooks must be used inside <StoreProvider>')
  return ctx
}

export function useStoreVersion(): number {
  return useCtx().version
}

/** Runs a store write, then re-renders every reader. */
export function useMutate() {
  const { bump } = useCtx()
  return useCallback(
    <T,>(write: () => T): T => {
      const result = write()
      bump()
      return result
    },
    [bump],
  )
}

export function useOffers(opts: { category?: Category; query?: string } = {}): Offer[] {
  const version = useStoreVersion()
  const { category, query } = opts
  return useMemo(() => listOffers({ category, query }), [version, category, query])
}

export function useOffer(id: string): Offer | null {
  const version = useStoreVersion()
  return useMemo(() => getOffer(id), [version, id])
}

export function useMyOffers(wallet: string | null): Offer[] {
  const version = useStoreVersion()
  return useMemo(() => (wallet ? listOffersByAdvertiser(wallet) : []), [version, wallet])
}

export function useMyLinks(wallet: string | null): TrackingLink[] {
  const version = useStoreVersion()
  return useMemo(() => (wallet ? listLinksByAffiliate(wallet) : []), [version, wallet])
}

export function useMyConversions(wallet: string | null): Conversion[] {
  const version = useStoreVersion()
  return useMemo(() => (wallet ? listConversionsByAffiliate(wallet) : []), [version, wallet])
}
```

- [ ] **Step 6: Run them and watch them pass**

```bash
npx vitest run lib/store/__tests__/users.test.ts lib/store/__tests__/provider.test.tsx
```

Expected: PASS, 3 tests.

- [ ] **Step 7: Commit**

```bash
git add lib/store/users.ts lib/store/index.ts lib/store/provider.tsx lib/store/__tests__
git commit -m "feat: add store seam, user accounts, and version-counter provider"
```

---

## Task 8: Wallet login

**Files:**
- Create: `lib/wallet/provider.tsx`, `lib/wallet/useAccount.ts`
- Modify: `package.json` (dependencies)

**Interfaces:**
- Consumes: `ensureUser` from `@/lib/store`
- Produces:
  - `<WalletProviders>` — `ConnectionProvider` + `WalletProvider` + `WalletModalProvider`, devnet
  - `useAccount(): { wallet: string | null; connected: boolean; connecting: boolean }` — `wallet` is the base58 address
  - `useLoginModal(): () => void` — opens the wallet modal

- [ ] **Step 1: Install the adapter**

```bash
npm install @solana/web3.js @solana/wallet-adapter-base @solana/wallet-adapter-react @solana/wallet-adapter-react-ui @solana/wallet-adapter-wallets
```

- [ ] **Step 2: Write `lib/wallet/provider.tsx`**

```tsx
'use client'

import { useMemo } from 'react'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { clusterApiUrl } from '@solana/web3.js'
import '@solana/wallet-adapter-react-ui/styles.css'

/**
 * Devnet only. Nothing of value moves; the wallet is an identity, not a
 * payment rail, in Phase 1.
 *
 * The wallets array is left empty on purpose: wallet-standard wallets
 * (Phantom, Solflare, Backpack) register themselves, so listing adapters
 * explicitly would only duplicate them in the modal.
 */
export function WalletProviders({ children }: { children: React.ReactNode }) {
  const endpoint = useMemo(() => clusterApiUrl(WalletAdapterNetwork.Devnet), [])
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={[]} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
```

- [ ] **Step 3: Write `lib/wallet/useAccount.ts`**

```ts
'use client'

import { useEffect, useMemo } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { ensureUser } from '@/lib/store'

export function useAccount() {
  const { publicKey, connected, connecting } = useWallet()
  const wallet = useMemo(() => publicKey?.toBase58() ?? null, [publicKey])

  // The first connection from an address creates the account. No signup step.
  useEffect(() => {
    if (wallet) ensureUser(wallet)
  }, [wallet])

  return { wallet, connected: connected && !!wallet, connecting }
}

export function useLoginModal() {
  const { setVisible } = useWalletModal()
  return () => setVisible(true)
}
```

- [ ] **Step 4: Verify it compiles and the modal opens**

Temporarily wrap `app/page.tsx` in `<WalletProviders>` with a button calling `useLoginModal()`, run `npm run dev`, click it, and confirm the wallet modal appears. Expected: a modal listing detected wallets, or "No wallet found" guidance if no extension is installed — both are correct. Revert the temporary edit before committing.

There is no unit test for this task: the adapter's value is entirely in real browser integration, and a mocked `useWallet` would test the mock. Login is covered end-to-end by the manual verification in Task 16.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json lib/wallet
git commit -m "feat: add Solana wallet login on devnet"
```

---

## Task 9: Formatting helpers and UI primitives

**Files:**
- Modify: `lib/format.ts`
- Create: `components/ui/Money.tsx`, `components/ui/Address.tsx`, `components/ui/Badge.tsx`, `components/ui/Button.tsx`, `components/ui/Field.tsx`
- Test: `lib/__tests__/format.test.ts`, `components/ui/__tests__/primitives.test.tsx`

**Interfaces:**
- Consumes: `round2`; `TrackingLink`
- Produces:
  - `money(n: number): string` — `"$340.00"`
  - `shortAddress(a: string): string` — `"7xKX…gAsU"`
  - `linkUrl(offerId: string, wallet: string): string` — `"nativness.app/r/{offerId}/{wallet}"`
  - `<Money value={n} />`, `<Address value={a} />`, `<Badge tone>`, `<Button variant>`, `<Field label>`

- [ ] **Step 1: Write the failing tests**

Create `lib/__tests__/format.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { money, shortAddress, linkUrl } from '@/lib/format'

describe('money', () => {
  it('always shows two decimals', () => {
    expect(money(340)).toBe('$340.00')
    expect(money(12.5)).toBe('$12.50')
    expect(money(0)).toBe('$0.00')
  })

  it('groups thousands', () => {
    expect(money(2600)).toBe('$2,600.00')
  })
})

describe('shortAddress', () => {
  it('keeps four characters each end', () => {
    expect(shortAddress('7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU')).toBe('7xKX…gAsU')
  })

  it('leaves a short string alone rather than padding it', () => {
    expect(shortAddress('abc')).toBe('abc')
  })
})

describe('linkUrl', () => {
  it('embeds the offer id and the affiliate wallet', () => {
    expect(linkUrl('of_seed_drayton', '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU')).toBe(
      'nativness.app/r/of_seed_drayton/7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    )
  })
})
```

Create `components/ui/__tests__/primitives.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Money } from '@/components/ui/Money'
import { Address } from '@/components/ui/Address'

describe('Money', () => {
  it('renders in mono with tabular numerals so columns align', () => {
    render(<Money value={340} />)
    const el = screen.getByText('$340.00')
    expect(el).toHaveClass('font-mono')
    expect(el).toHaveClass('tnum')
  })
})

describe('Address', () => {
  it('shows the shortened form but exposes the full address', () => {
    const full = '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU'
    render(<Address value={full} />)
    const el = screen.getByText('7xKX…gAsU')
    expect(el).toHaveClass('font-mono')
    expect(el).toHaveAttribute('title', full)
  })
})
```

- [ ] **Step 2: Run them and watch them fail**

```bash
npx vitest run lib/__tests__/format.test.ts components/ui/__tests__/primitives.test.tsx
```

Expected: FAIL — `money` is not exported; component modules do not resolve.

- [ ] **Step 3: Extend `lib/format.ts`**

Append to the existing file (keep `round2`):

```ts
export function money(n: number): string {
  return n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function shortAddress(address: string): string {
  if (address.length <= 10) return address
  return `${address.slice(0, 4)}…${address.slice(-4)}`
}

/** The public shape of a tracking link. Derived, never stored. */
export function linkUrl(offerId: string, wallet: string): string {
  return `nativness.app/r/${offerId}/${wallet}`
}

export function relativeDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
```

- [ ] **Step 4: Write the primitives**

`components/ui/Money.tsx`:

```tsx
import { money } from '@/lib/format'

/**
 * Every currency amount in the product renders through here, so mono +
 * tabular numerals are defined once and cannot drift across screens.
 */
export function Money({
  value,
  tone = 'default',
  className = '',
}: {
  value: number
  tone?: 'default' | 'escrow' | 'paid' | 'muted' | 'depleted'
  className?: string
}) {
  const toneClass = {
    default: 'text-text',
    escrow: 'text-escrow',
    paid: 'text-paid',
    muted: 'text-muted',
    // Used by EscrowMeter in Task 11 when a balance can no longer fund a conversion.
    depleted: 'text-depleted',
  }[tone]
  return <span className={`font-mono tnum ${toneClass} ${className}`}>{money(value)}</span>
}
```

`components/ui/Address.tsx`:

```tsx
import { shortAddress } from '@/lib/format'

export function Address({ value, className = '' }: { value: string; className?: string }) {
  return (
    <span className={`font-mono ${className}`} title={value}>
      {shortAddress(value)}
    </span>
  )
}
```

`components/ui/Badge.tsx`:

```tsx
export function Badge({
  children,
  tone = 'neutral',
}: {
  children: React.ReactNode
  tone?: 'neutral' | 'paid' | 'depleted' | 'escrow'
}) {
  const toneClass = {
    neutral: 'text-muted border-line',
    paid: 'text-paid border-paid/35 bg-paid/10',
    depleted: 'text-depleted border-depleted/35 bg-depleted/10',
    escrow: 'text-escrow border-escrow/35 bg-escrow/10',
  }[tone]
  return (
    <span className={`inline-block rounded border px-1.5 py-0.5 text-[10.5px] font-medium ${toneClass}`}>
      {children}
    </span>
  )
}
```

`components/ui/Button.tsx`:

```tsx
type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost'
}

export function Button({ variant = 'primary', className = '', ...rest }: Props) {
  const variantClass = {
    // Dark text on the bright accent, as on all three reference apps.
    primary: 'bg-escrow text-canvas hover:brightness-110 disabled:opacity-40',
    secondary: 'border border-line bg-surface text-text hover:border-muted disabled:opacity-40',
    ghost: 'text-muted hover:text-text',
  }[variant]
  return (
    <button
      {...rest}
      className={`rounded-[5px] px-3 py-2 text-[13px] font-semibold transition disabled:cursor-not-allowed ${variantClass} ${className}`}
    />
  )
}
```

`components/ui/Field.tsx`:

```tsx
export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string
  hint?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="block text-[12px] text-muted mb-1">{label}</span>
      {children}
      {hint && !error && <span className="block text-[11px] text-muted mt-1">{hint}</span>}
      {error && <span className="block text-[11px] text-depleted mt-1">{error}</span>}
    </label>
  )
}

export const inputClass =
  'w-full rounded-[5px] border border-line bg-canvas px-2.5 py-2 text-[13px] text-text outline-none focus:border-muted'
```

- [ ] **Step 5: Run them and watch them pass**

```bash
npx vitest run lib/__tests__/format.test.ts components/ui/__tests__/primitives.test.tsx
```

Expected: PASS, 8 tests.

- [ ] **Step 6: Commit**

```bash
git add lib/format.ts lib/__tests__/format.test.ts components/ui
git commit -m "feat: add formatting helpers and UI primitives"
```

---

## Task 10: App shell — providers, nav, wallet gate, prototype banner

**Files:**
- Modify: `app/layout.tsx` (mount providers at the root)
- Create: `lib/useMounted.ts`, `app/app/layout.tsx`, `components/app/Nav.tsx`, `components/app/PrototypeBanner.tsx`, `components/app/WalletBadge.tsx`, `components/app/ConnectGate.tsx`
- Test: `components/app/__tests__/shell.test.tsx`

**Interfaces:**
- Consumes: `WalletProviders`, `useAccount`, `useLoginModal`; `StoreProvider`; `Address`, `Button`
- Produces: `useMounted(): boolean`; the `/app` shell — every `/app/*` page renders inside it and may assume a connected wallet

**Why providers live at the root:** the landing page's CTA opens the wallet modal, so `WalletProviders` must wrap the landing route too, not just `/app`.

**Hydration note:** the store reads `localStorage`, which is empty during SSR. Rendering store data straight away produces a hydration mismatch. Every `/app` page therefore renders behind `useMounted()`.

- [ ] **Step 1: Write the failing test**

Create `components/app/__tests__/shell.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PrototypeBanner } from '@/components/app/PrototypeBanner'
import { Nav } from '@/components/app/Nav'

describe('PrototypeBanner', () => {
  it('states plainly that escrow is simulated', () => {
    render(<PrototypeBanner />)
    expect(screen.getByRole('status')).toHaveTextContent(
      /escrow balances are simulated and stored in this browser\. not yet on-chain\./i,
    )
  })

  it('offers no way to dismiss it', () => {
    render(<PrototypeBanner />)
    expect(screen.queryByRole('button')).toBeNull()
  })
})

describe('Nav', () => {
  it('shows all four destinations as peers, with no mode switch', () => {
    render(<Nav pathname="/app" />)
    const labels = screen.getAllByRole('link').map((a) => a.textContent)
    expect(labels).toEqual(['Browse', 'My Links', 'My Offers', 'Simulate'])
  })

  it('marks the current destination', () => {
    render(<Nav pathname="/app/my-offers" />)
    expect(screen.getByRole('link', { name: 'My Offers' })).toHaveAttribute(
      'aria-current',
      'page',
    )
  })
})
```

- [ ] **Step 2: Run it and watch it fail**

```bash
npx vitest run components/app/__tests__/shell.test.tsx
```

Expected: FAIL — modules do not resolve.

- [ ] **Step 3: Write `lib/useMounted.ts`**

```ts
'use client'

import { useEffect, useState } from 'react'

/** True only after the first client render. Guards localStorage reads against SSR mismatch. */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  return mounted
}
```

- [ ] **Step 4: Mount the providers at the root**

In `app/layout.tsx`, wrap `{children}`:

```tsx
import { WalletProviders } from '@/lib/wallet/provider'
import { StoreProvider } from '@/lib/store/provider'
```

```tsx
      <body className="font-sans antialiased bg-canvas text-text">
        <WalletProviders>
          <StoreProvider>{children}</StoreProvider>
        </WalletProviders>
      </body>
```

- [ ] **Step 5: Write `components/app/PrototypeBanner.tsx`**

```tsx
/**
 * Permanent and undismissable. A viewer must not be able to mistake a
 * localStorage number for an on-chain balance.
 */
export function PrototypeBanner() {
  return (
    <div
      role="status"
      className="border-b border-escrow/25 bg-escrow/10 px-4 py-2 text-[12px] text-escrow"
    >
      <span className="font-semibold">Prototype</span> — escrow balances are simulated and
      stored in this browser. Not yet on-chain.
    </div>
  )
}
```

- [ ] **Step 6: Write `components/app/Nav.tsx`**

```tsx
import Link from 'next/link'

const DESTINATIONS = [
  { href: '/app', label: 'Browse' },
  { href: '/app/links', label: 'My Links' },
  { href: '/app/my-offers', label: 'My Offers' },
  { href: '/app/simulate', label: 'Simulate' },
] as const

/**
 * Flat and peer-level on purpose. There is no affiliate mode and no
 * advertiser mode — one identity reaches every destination, so the UI must
 * not imply a second account exists.
 */
export function Nav({ pathname }: { pathname: string }) {
  return (
    <nav className="flex gap-1 overflow-x-auto" aria-label="Main">
      {DESTINATIONS.map(({ href, label }) => {
        const active = href === '/app' ? pathname === '/app' : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={`whitespace-nowrap rounded-[5px] px-2.5 py-1.5 text-[13px] transition ${
              active ? 'bg-surface text-text' : 'text-muted hover:text-text'
            }`}
          >
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
```

- [ ] **Step 7: Write `components/app/WalletBadge.tsx`**

```tsx
'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { Address } from '@/components/ui/Address'

export function WalletBadge({ wallet }: { wallet: string }) {
  const { disconnect } = useWallet()
  return (
    <div className="flex items-center gap-2">
      <Address value={wallet} className="text-[12px] text-muted" />
      <button
        onClick={() => disconnect()}
        className="text-[12px] text-muted hover:text-text transition"
      >
        Disconnect
      </button>
    </div>
  )
}
```

- [ ] **Step 8: Write `components/app/ConnectGate.tsx`**

```tsx
'use client'

import { Button } from '@/components/ui/Button'
import { useLoginModal } from '@/lib/wallet/useAccount'

/**
 * Renders in place rather than redirecting to '/'. A redirect would lose the
 * destination and risks a loop while the adapter is still restoring a session.
 */
export function ConnectGate() {
  const openLogin = useLoginModal()
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="text-xl font-semibold">Connect your wallet to continue</h1>
      <p className="mt-2 text-[13px] text-muted">
        Your wallet address is your account. Connecting it for the first time creates one; every
        later connection returns to the same offers, links and payout history.
      </p>
      <Button className="mt-6" onClick={openLogin}>
        Connect wallet
      </Button>
    </div>
  )
}
```

- [ ] **Step 9: Write `app/app/layout.tsx`**

```tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Nav } from '@/components/app/Nav'
import { PrototypeBanner } from '@/components/app/PrototypeBanner'
import { WalletBadge } from '@/components/app/WalletBadge'
import { ConnectGate } from '@/components/app/ConnectGate'
import { useAccount } from '@/lib/wallet/useAccount'
import { useMounted } from '@/lib/useMounted'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { wallet, connected } = useAccount()
  const mounted = useMounted()

  return (
    <div className="min-h-dvh">
      <PrototypeBanner />
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
          <Link href="/" className="text-[15px] font-semibold tracking-tight">
            Nativness
          </Link>
          {connected && <Nav pathname={pathname} />}
          <div className="ml-auto">{wallet && <WalletBadge wallet={wallet} />}</div>
        </div>
      </header>

      {/* Nothing store-backed renders until mount: localStorage is empty during SSR. */}
      {!mounted ? null : connected ? (
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      ) : (
        <ConnectGate />
      )}
    </div>
  )
}
```

- [ ] **Step 10: Run it and watch it pass**

```bash
npx vitest run components/app/__tests__/shell.test.tsx
```

Expected: PASS, 4 tests.

- [ ] **Step 11: Commit**

```bash
git add app/layout.tsx app/app/layout.tsx lib/useMounted.ts components/app
git commit -m "feat: add app shell with flat nav, wallet gate, and prototype banner"
```

---

## Task 11: Browse the marketplace

**Files:**
- Create: `components/app/EscrowMeter.tsx`, `components/app/OfferCard.tsx`, `components/app/FilterBar.tsx`, `app/app/page.tsx`
- Test: `components/app/__tests__/offer-card.test.tsx`, `app/app/__tests__/browse.test.tsx`

**Interfaces:**
- Consumes: `useOffers`; `Money`, `Badge`, `Button`; `CATEGORIES`, `Offer`
- Produces: `<EscrowMeter offer>`, `<OfferCard offer>`, `<FilterBar category query onCategory onQuery>`

- [ ] **Step 1: Write the failing tests**

Create `components/app/__tests__/offer-card.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { OfferCard } from '@/components/app/OfferCard'
import { SEED_OFFERS } from '@/lib/store'

const drayton = SEED_OFFERS.find((o) => o.name === 'Drayton Supply Co.')!
const kestrel = SEED_OFFERS.find((o) => o.name === 'Kestrel Play')!
const halcyon = SEED_OFFERS.find((o) => o.name === 'Halcyon Tools')!

describe('OfferCard', () => {
  it('shows the escrow remainder against the total — the trust signal', () => {
    render(<OfferCard offer={drayton} />)
    expect(screen.getByText('$340.00')).toBeInTheDocument()
    expect(screen.getByText(/\$500\.00/)).toBeInTheDocument()
  })

  it('shows the CPA commission', () => {
    render(<OfferCard offer={drayton} />)
    expect(screen.getByText('$24.00')).toBeInTheDocument()
  })

  it('badges a Verified advertiser', () => {
    render(<OfferCard offer={drayton} />)
    expect(screen.getByText('Verified')).toBeInTheDocument()
  })

  it('shows no Verified badge on a Community offer', () => {
    render(<OfferCard offer={kestrel} />)
    expect(screen.queryByText('Verified')).toBeNull()
  })

  it('marks a depleted offer rather than hiding it', () => {
    render(<OfferCard offer={halcyon} />)
    expect(screen.getByText('Escrow empty')).toBeInTheDocument()
  })

  it('links to the offer detail page', () => {
    render(<OfferCard offer={drayton} />)
    expect(screen.getByRole('link')).toHaveAttribute('href', `/app/offers/${drayton.id}`)
  })
})
```

Create `app/app/__tests__/browse.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BrowsePage from '@/app/app/page'
import { StoreProvider } from '@/lib/store/provider'

const renderBrowse = () =>
  render(
    <StoreProvider>
      <BrowsePage />
    </StoreProvider>,
  )

describe('Browse', () => {
  it('lists every seeded offer', () => {
    renderBrowse()
    expect(screen.getByText('Drayton Supply Co.')).toBeInTheDocument()
    expect(screen.getByText('Halcyon Tools')).toBeInTheDocument()
  })

  it('filters by category', async () => {
    renderBrowse()
    await userEvent.selectOptions(screen.getByLabelText('Category'), 'saas')
    expect(screen.getByText('Meridian Ledger')).toBeInTheDocument()
    expect(screen.queryByText('Drayton Supply Co.')).toBeNull()
  })

  it('searches by name', async () => {
    renderBrowse()
    await userEvent.type(screen.getByLabelText('Search'), 'kestrel')
    expect(screen.getByText('Kestrel Play')).toBeInTheDocument()
    expect(screen.queryByText('Meridian Ledger')).toBeNull()
  })

  it('says so plainly when a filter matches nothing', async () => {
    renderBrowse()
    await userEvent.type(screen.getByLabelText('Search'), 'zzzzz')
    expect(screen.getByText(/no offers match/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run them and watch them fail**

```bash
npx vitest run components/app/__tests__/offer-card.test.tsx app/app/__tests__/browse.test.tsx
```

Expected: FAIL — modules do not resolve.

- [ ] **Step 3: Write `components/app/EscrowMeter.tsx`**

```tsx
import { Money } from '@/components/ui/Money'
import type { Offer } from '@/lib/types'

export function EscrowMeter({ offer, showLabel = true }: { offer: Offer; showLabel?: boolean }) {
  const pct = offer.escrowTotalUsd
    ? Math.max(0, Math.min(100, (offer.escrowRemainingUsd / offer.escrowTotalUsd) * 100))
    : 0
  const empty = offer.status === 'depleted'

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        {showLabel && <span className="text-[11.5px] text-muted">Escrow remaining</span>}
        <span className="text-[13px]">
          <Money value={offer.escrowRemainingUsd} tone={empty ? 'depleted' : 'escrow'} />
          <span className="font-mono tnum text-muted"> / </span>
          <Money value={offer.escrowTotalUsd} tone="muted" />
        </span>
      </div>
      <div className="mt-1.5 h-1 overflow-hidden rounded-sm bg-line">
        <div
          className={`h-full ${empty ? 'bg-depleted' : 'bg-escrow'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Write `components/app/OfferCard.tsx`**

```tsx
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { Money } from '@/components/ui/Money'
import { EscrowMeter } from './EscrowMeter'
import { CATEGORIES, type Offer } from '@/lib/types'

export function OfferCard({ offer }: { offer: Offer }) {
  const category = CATEGORIES.find((c) => c.value === offer.category)?.label ?? offer.category
  const fundable = Math.floor(offer.escrowRemainingUsd / offer.commissionAmountUsd)

  return (
    <Link
      href={`/app/offers/${offer.id}`}
      className="block rounded-md border border-line bg-surface p-4 transition hover:border-muted"
    >
      <div className="mb-0.5 flex items-start justify-between gap-2">
        <h3 className="text-[15px] font-semibold leading-tight">{offer.name}</h3>
        {offer.verified && <Badge tone="paid">Verified</Badge>}
      </div>
      <p className="mb-4 text-[12px] text-muted">{category}</p>

      <div className="flex items-baseline justify-between border-b border-line pb-2">
        <span className="text-[11.5px] text-muted">CPA per conversion</span>
        <Money value={offer.commissionAmountUsd} className="text-[15px] font-bold" />
      </div>

      <div className="pt-3">
        <EscrowMeter offer={offer} />
        <p className="mt-1.5 font-mono tnum text-[10.5px] text-muted">
          {offer.status === 'depleted'
            ? 'Escrow empty'
            : `${fundable} conversion${fundable === 1 ? '' : 's'} funded`}
        </p>
      </div>
    </Link>
  )
}
```

- [ ] **Step 5: Write `components/app/FilterBar.tsx`**

```tsx
import { CATEGORIES, type Category } from '@/lib/types'
import { inputClass } from '@/components/ui/Field'

export function FilterBar({
  category,
  query,
  onCategory,
  onQuery,
}: {
  category: Category | ''
  query: string
  onCategory: (c: Category | '') => void
  onQuery: (q: string) => void
}) {
  return (
    <div className="mb-5 flex flex-col gap-2 sm:flex-row">
      <label className="flex-1">
        <span className="sr-only">Search</span>
        <input
          aria-label="Search"
          className={inputClass}
          placeholder="Search offers by name or description"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
        />
      </label>
      <label className="sm:w-48">
        <span className="sr-only">Category</span>
        <select
          aria-label="Category"
          className={inputClass}
          value={category}
          onChange={(e) => onCategory(e.target.value as Category | '')}
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}
```

- [ ] **Step 6: Write `app/app/page.tsx`**

```tsx
'use client'

import { useState } from 'react'
import { FilterBar } from '@/components/app/FilterBar'
import { OfferCard } from '@/components/app/OfferCard'
import { useOffers } from '@/lib/store/provider'
import type { Category } from '@/lib/types'

export default function BrowsePage() {
  const [category, setCategory] = useState<Category | ''>('')
  const [query, setQuery] = useState('')
  const offers = useOffers({ category: category || undefined, query: query || undefined })

  return (
    <section>
      <header className="mb-5">
        <h1 className="text-lg font-semibold">Browse offers</h1>
        <p className="text-[13px] text-muted">
          Every listed offer, with the commission budget already locked. The balance is what the
          advertiser can still pay out.
        </p>
      </header>

      <FilterBar
        category={category}
        query={query}
        onCategory={setCategory}
        onQuery={setQuery}
      />

      {offers.length === 0 ? (
        <p className="rounded-md border border-line bg-surface p-6 text-center text-[13px] text-muted">
          No offers match that filter.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {offers.map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </div>
      )}
    </section>
  )
}
```

- [ ] **Step 7: Run them and watch them pass**

```bash
npx vitest run components/app/__tests__/offer-card.test.tsx app/app/__tests__/browse.test.tsx
```

Expected: PASS, 10 tests.

- [ ] **Step 8: Commit**

```bash
git add components/app/EscrowMeter.tsx components/app/OfferCard.tsx components/app/FilterBar.tsx app/app/page.tsx components/app/__tests__ app/app/__tests__
git commit -m "feat: add marketplace browse grid with escrow balance as the trust signal"
```

---

## Task 12: Offer detail, Get my link, and the tracking redirect

**Files:**
- Create: `app/app/offers/[id]/page.tsx`, `components/app/GetLinkPanel.tsx`, `app/r/[offerId]/[wallet]/page.tsx`
- Test: `components/app/__tests__/get-link.test.tsx`

**Interfaces:**
- Consumes: `useOffer`, `useMutate`, `issueLink`, `recordClick`, `getOffer`; `linkUrl`; `useAccount`
- Produces: `<GetLinkPanel offer>`

**Deviation from the spec, deliberate:** §3 of the spec specifies `app/r/[offerId]/[wallet]/route.ts`. A server route handler cannot record a click, because click counts live in `localStorage`, which exists only in the browser. This task builds the redirect as a **client page** instead, which keeps click tracking real in Phase 1. When Phase 2 moves clicks into the database, this becomes a server route as originally specified. Update the spec's §3 and §10 to match.

- [ ] **Step 1: Write the failing test**

Create `components/app/__tests__/get-link.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GetLinkPanel } from '@/components/app/GetLinkPanel'
import { StoreProvider } from '@/lib/store/provider'
import { SEED_OFFERS, listLinksByAffiliate } from '@/lib/store'

const WALLET = '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU'
const drayton = SEED_OFFERS.find((o) => o.name === 'Drayton Supply Co.')!

const renderPanel = () =>
  render(
    <StoreProvider>
      <GetLinkPanel offer={drayton} wallet={WALLET} />
    </StoreProvider>,
  )

describe('GetLinkPanel', () => {
  it('generates a link containing the connected wallet address', async () => {
    renderPanel()
    await userEvent.click(screen.getByRole('button', { name: 'Get my link' }))
    expect(
      screen.getByText(`nativness.app/r/${drayton.id}/${WALLET}`),
    ).toBeInTheDocument()
  })

  it('does not mint a second link when asked twice', async () => {
    renderPanel()
    await userEvent.click(screen.getByRole('button', { name: 'Get my link' }))
    expect(listLinksByAffiliate(WALLET)).toHaveLength(1)
  })

  it('copies the link to the clipboard', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })
    renderPanel()
    await userEvent.click(screen.getByRole('button', { name: 'Get my link' }))
    await userEvent.click(screen.getByRole('button', { name: 'Copy' }))
    expect(writeText).toHaveBeenCalledWith(`nativness.app/r/${drayton.id}/${WALLET}`)
    expect(screen.getByRole('button', { name: 'Copied' })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run it and watch it fail**

```bash
npx vitest run components/app/__tests__/get-link.test.tsx
```

Expected: FAIL — cannot resolve `@/components/app/GetLinkPanel`.

- [ ] **Step 3: Write `components/app/GetLinkPanel.tsx`**

```tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { issueLink } from '@/lib/store'
import { useMutate } from '@/lib/store/provider'
import { linkUrl } from '@/lib/format'
import type { Offer } from '@/lib/types'

export function GetLinkPanel({ offer, wallet }: { offer: Offer; wallet: string }) {
  const mutate = useMutate()
  const [url, setUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  function generate() {
    // Idempotent in the store, so clicking twice cannot fragment attribution.
    const link = mutate(() => issueLink(offer.id, wallet))
    setUrl(linkUrl(link.offerId, link.affiliateWallet))
  }

  async function copy() {
    if (!url) return
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
    } catch {
      // Clipboard denied. The URL is on screen and selectable, so nothing is lost.
    }
  }

  if (!url) {
    return (
      <div className="rounded-md border border-line bg-surface p-4">
        <Button onClick={generate}>Get my link</Button>
        <p className="mt-2 text-[11.5px] text-muted">
          Your link carries your wallet address, so confirmed conversions pay out to you.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-md border border-line bg-surface p-4">
      <p className="mb-2 text-[11.5px] text-muted">Your tracking link</p>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <code className="min-w-0 flex-1 break-all rounded-[5px] border border-line bg-canvas px-2 py-1.5 font-mono text-[12px]">
          {url}
        </code>
        <Button variant="secondary" onClick={copy} className="shrink-0">
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run it and watch it pass**

```bash
npx vitest run components/app/__tests__/get-link.test.tsx
```

Expected: PASS, 3 tests.

- [ ] **Step 5: Write `app/app/offers/[id]/page.tsx`**

```tsx
'use client'

import { use } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { Money } from '@/components/ui/Money'
import { Address } from '@/components/ui/Address'
import { EscrowMeter } from '@/components/app/EscrowMeter'
import { GetLinkPanel } from '@/components/app/GetLinkPanel'
import { useOffer } from '@/lib/store/provider'
import { useAccount } from '@/lib/wallet/useAccount'
import { CATEGORIES } from '@/lib/types'

export default function OfferDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const offer = useOffer(id)
  const { wallet } = useAccount()

  if (!offer) {
    return (
      <p className="rounded-md border border-line bg-surface p-6 text-[13px] text-muted">
        That offer no longer exists. <Link href="/app" className="text-escrow">Back to browse</Link>.
      </p>
    )
  }

  const category = CATEGORIES.find((c) => c.value === offer.category)?.label ?? offer.category

  return (
    <article className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <div>
        <Link href="/app" className="text-[12px] text-muted hover:text-text">
          Back to browse
        </Link>
        <div className="mt-2 flex items-start gap-2">
          <h1 className="text-xl font-semibold leading-tight">{offer.name}</h1>
          {offer.verified ? <Badge tone="paid">Verified</Badge> : <Badge>Community</Badge>}
        </div>
        <p className="mt-1 text-[13px] text-muted">{category}</p>

        <p className="mt-5 text-[14px] leading-relaxed">{offer.description}</p>

        <h2 className="mt-6 text-[13px] font-semibold">Conversion terms</h2>
        <p className="mt-1 text-[13px] leading-relaxed text-muted">{offer.conversionTerms}</p>

        <h2 className="mt-6 text-[13px] font-semibold">Target page</h2>
        <a
          href={offer.targetUrl}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="mt-1 block break-all font-mono text-[12px] text-escrow"
        >
          {offer.targetUrl}
        </a>

        <h2 className="mt-6 text-[13px] font-semibold">Listed by</h2>
        <Address value={offer.advertiserWallet} className="mt-1 block text-[12px] text-muted" />
      </div>

      <aside className="space-y-4">
        <div className="rounded-md border border-line bg-surface p-4">
          <div className="flex items-baseline justify-between border-b border-line pb-2">
            <span className="text-[11.5px] text-muted">CPA per conversion</span>
            <Money value={offer.commissionAmountUsd} className="text-[17px] font-bold" />
          </div>
          <div className="pt-3">
            <EscrowMeter offer={offer} />
          </div>
          {offer.status === 'depleted' && (
            <p className="mt-3 text-[11.5px] text-depleted">
              This offer cannot pay out until the advertiser tops up its escrow.
            </p>
          )}
        </div>

        {wallet && <GetLinkPanel offer={offer} wallet={wallet} />}
      </aside>
    </article>
  )
}
```

- [ ] **Step 6: Write `app/r/[offerId]/[wallet]/page.tsx`**

```tsx
'use client'

import { use, useEffect, useState } from 'react'
import { getOffer, recordClick } from '@/lib/store'

/**
 * The public end of a tracking link. Not under /app: the visitor is a
 * consumer following an affiliate's link, not a logged-in user.
 *
 * Client-side because click counts live in localStorage in Phase 1. Phase 2
 * turns this into a server route handler.
 */
export default function TrackingRedirect({
  params,
}: {
  params: Promise<{ offerId: string; wallet: string }>
}) {
  const { offerId, wallet } = use(params)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const offer = getOffer(offerId)
    if (!offer) {
      setFailed(true)
      return
    }
    recordClick(offerId, decodeURIComponent(wallet))
    window.location.replace(offer.targetUrl)
  }, [offerId, wallet])

  return (
    <main className="grid min-h-dvh place-items-center px-4 text-center">
      {failed ? (
        <p className="text-[13px] text-muted">
          This tracking link points to an offer that no longer exists.
        </p>
      ) : (
        <p className="text-[13px] text-muted">Redirecting…</p>
      )}
    </main>
  )
}
```

- [ ] **Step 7: Verify the redirect by hand**

Run `npm run dev`, connect a wallet, open Drayton Supply Co., click **Get my link**, then visit `http://localhost:3000/r/of_seed_drayton/<your-wallet>`. Expected: brief "Redirecting…", then `example.com/drayton`. Return to `/app/links` and confirm the click count incremented.

- [ ] **Step 8: Commit**

```bash
git add app/app/offers app/r components/app/GetLinkPanel.tsx components/app/__tests__/get-link.test.tsx
git commit -m "feat: add offer detail, wallet-bearing tracking links, and redirect"
```

---

## Task 13: Affiliate dashboard and conversion simulator

**Files:**
- Create: `app/app/links/page.tsx`, `app/app/simulate/page.tsx`
- Test: `app/app/__tests__/simulate.test.tsx`

**Interfaces:**
- Consumes: `useMyLinks`, `useMyConversions`, `useMutate`, `useOffers`; `recordConversion`, `getOffer`, `totalEarnedUsd`; `Money`, `Button`
- Produces: nothing consumed by later tasks

- [ ] **Step 1: Write the failing test**

Create `app/app/__tests__/simulate.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SimulatePage from '@/app/app/simulate/page'
import LinksPage from '@/app/app/links/page'
import { StoreProvider } from '@/lib/store/provider'
import { issueLink, listOffers, getOffer } from '@/lib/store'

const WALLET = '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU'

vi.mock('@/lib/wallet/useAccount', () => ({
  useAccount: () => ({ wallet: WALLET, connected: true, connecting: false }),
  useLoginModal: () => () => {},
}))

describe('Simulate', () => {
  it('tells the user plainly that this stands in for a postback', () => {
    render(
      <StoreProvider>
        <SimulatePage />
      </StoreProvider>,
    )
    expect(screen.getByText(/stands in for a real postback/i)).toBeInTheDocument()
  })

  it('says there is nothing to simulate when the user has no links', () => {
    render(
      <StoreProvider>
        <SimulatePage />
      </StoreProvider>,
    )
    expect(screen.getByText(/you have no tracking links yet/i)).toBeInTheDocument()
  })

  it('decrements escrow and records a payout on confirmation', async () => {
    listOffers()
    issueLink('of_seed_drayton', WALLET)
    render(
      <StoreProvider>
        <SimulatePage />
      </StoreProvider>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Confirm conversion' }))
    expect(getOffer('of_seed_drayton')!.escrowRemainingUsd).toBe(316)
    expect(screen.getByText(/paid \$24\.00/i)).toBeInTheDocument()
  })

  it('refuses when the offer’s escrow cannot fund another conversion', async () => {
    listOffers()
    issueLink('of_seed_halcyon', WALLET) // seeded at $0 remaining
    render(
      <StoreProvider>
        <SimulatePage />
      </StoreProvider>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Confirm conversion' }))
    expect(screen.getByText(/not enough escrow/i)).toBeInTheDocument()
  })
})

describe('My Links', () => {
  it('shows the payout after a simulated conversion', async () => {
    listOffers()
    issueLink('of_seed_drayton', WALLET)
    const { unmount } = render(
      <StoreProvider>
        <SimulatePage />
      </StoreProvider>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Confirm conversion' }))
    unmount()

    render(
      <StoreProvider>
        <LinksPage />
      </StoreProvider>,
    )
    expect(screen.getByTestId('total-earned')).toHaveTextContent('$24.00')
  })
})
```

- [ ] **Step 2: Run it and watch it fail**

```bash
npx vitest run app/app/__tests__/simulate.test.tsx
```

Expected: FAIL — page modules do not resolve.

- [ ] **Step 3: Write `app/app/links/page.tsx`**

```tsx
'use client'

import Link from 'next/link'
import { Money } from '@/components/ui/Money'
import { useMyConversions, useMyLinks, useStoreVersion } from '@/lib/store/provider'
import { getOffer, totalEarnedUsd } from '@/lib/store'
import { useAccount } from '@/lib/wallet/useAccount'
import { linkUrl, relativeDate } from '@/lib/format'
import { useMemo } from 'react'

export default function LinksPage() {
  const { wallet } = useAccount()
  const links = useMyLinks(wallet)
  const conversions = useMyConversions(wallet)
  const version = useStoreVersion()
  const earned = useMemo(() => (wallet ? totalEarnedUsd(wallet) : 0), [wallet, version])

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-lg font-semibold">My links</h1>
        <p className="text-[13px] text-muted">
          Links you have generated, and every conversion confirmed against them.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label="Total earned" value={<Money value={earned} tone="paid" />} testId="total-earned" />
        <Stat label="Active links" value={<span className="font-mono tnum">{links.length}</span>} />
        <Stat label="Conversions" value={<span className="font-mono tnum">{conversions.length}</span>} />
      </div>

      <div>
        <h2 className="mb-2 text-[13px] font-semibold">Tracking links</h2>
        {links.length === 0 ? (
          <Empty>
            No links yet. <Link href="/app" className="text-escrow">Browse offers</Link> and generate one.
          </Empty>
        ) : (
          <Table head={['Offer', 'Clicks', 'Link']}>
            {links.map((l) => {
              const offer = getOffer(l.offerId)
              return (
                <tr key={l.id} className="border-t border-line">
                  <Td>{offer?.name ?? 'Removed offer'}</Td>
                  <Td className="font-mono tnum text-right">{l.clicks}</Td>
                  <Td className="font-mono text-[11px] break-all text-muted">
                    {linkUrl(l.offerId, l.affiliateWallet)}
                  </Td>
                </tr>
              )
            })}
          </Table>
        )}
      </div>

      <div>
        <h2 className="mb-2 text-[13px] font-semibold">Confirmed payouts</h2>
        {conversions.length === 0 ? (
          <Empty>No confirmed conversions yet.</Empty>
        ) : (
          <Table head={['Offer', 'Confirmed', 'Paid']}>
            {conversions.map((c) => (
              <tr key={c.id} className="border-t border-line">
                <Td>{getOffer(c.offerId)?.name ?? 'Removed offer'}</Td>
                <Td className="text-muted">{relativeDate(c.confirmedAt)}</Td>
                <Td className="text-right">
                  <Money value={c.amountUsd} tone="paid" />
                </Td>
              </tr>
            ))}
          </Table>
        )}
      </div>
    </section>
  )
}

function Stat({
  label,
  value,
  testId,
}: {
  label: string
  value: React.ReactNode
  testId?: string
}) {
  return (
    <div className="rounded-md border border-line bg-surface p-3">
      <p className="text-[11.5px] text-muted">{label}</p>
      <p className="mt-1 text-[17px] font-bold" data-testid={testId}>
        {value}
      </p>
    </div>
  )
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-md border border-line bg-surface p-5 text-[13px] text-muted">
      {children}
    </p>
  )
}

function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-md border border-line bg-surface">
      <table className="w-full text-[13px]">
        <thead>
          <tr>
            {head.map((h, i) => (
              <th
                key={h}
                className={`px-3 py-2 text-[11.5px] font-medium text-muted ${
                  i === 0 ? 'text-left' : 'text-right'
                }`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

function Td({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-3 py-2 ${className}`}>{children}</td>
}
```

- [ ] **Step 4: Write `app/app/simulate/page.tsx`**

```tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Money } from '@/components/ui/Money'
import { inputClass } from '@/components/ui/Field'
import { useMyLinks, useMutate } from '@/lib/store/provider'
import { getOffer, recordConversion } from '@/lib/store'
import { useAccount } from '@/lib/wallet/useAccount'
import { money } from '@/lib/format'

export default function SimulatePage() {
  const { wallet } = useAccount()
  const links = useMyLinks(wallet)
  const mutate = useMutate()
  const [linkId, setLinkId] = useState('')
  const [message, setMessage] = useState<{ tone: 'paid' | 'depleted'; text: string } | null>(null)

  const selected = linkId || links[0]?.id || ''

  function confirm() {
    const result = mutate(() => recordConversion(selected))
    if (result.ok) {
      setMessage({
        tone: 'paid',
        text: `Conversion confirmed. Paid ${money(result.conversion.amountUsd)} to your wallet. ${result.offer.name} now holds ${money(result.offer.escrowRemainingUsd)} in escrow.`,
      })
    } else if (result.reason === 'insufficient_escrow') {
      setMessage({
        tone: 'depleted',
        text: 'Not enough escrow. This offer cannot fund another conversion until the advertiser tops up.',
      })
    } else {
      setMessage({ tone: 'depleted', text: 'That tracking link could not be found.' })
    }
  }

  return (
    <section className="max-w-xl space-y-5">
      <header>
        <h1 className="text-lg font-semibold">Simulate a conversion</h1>
        <p className="text-[13px] text-muted">
          A testing tool. It stands in for a real postback from an advertiser’s backend, which
          Phase 2 adds as an API endpoint.
        </p>
      </header>

      {links.length === 0 ? (
        <p className="rounded-md border border-line bg-surface p-5 text-[13px] text-muted">
          You have no tracking links yet.{' '}
          <Link href="/app" className="text-escrow">
            Browse offers
          </Link>{' '}
          and generate one first.
        </p>
      ) : (
        <div className="space-y-3 rounded-md border border-line bg-surface p-4">
          <label className="block">
            <span className="mb-1 block text-[12px] text-muted">Tracking link</span>
            <select
              aria-label="Tracking link"
              className={inputClass}
              value={selected}
              onChange={(e) => {
                setLinkId(e.target.value)
                setMessage(null)
              }}
            >
              {links.map((l) => {
                const offer = getOffer(l.offerId)
                return (
                  <option key={l.id} value={l.id}>
                    {offer ? `${offer.name} — ${money(offer.commissionAmountUsd)} CPA` : l.offerId}
                  </option>
                )
              })}
            </select>
          </label>

          <Button onClick={confirm}>Confirm conversion</Button>
        </div>
      )}

      {message && (
        <p
          role="status"
          className={`rounded-md border p-3 text-[13px] ${
            message.tone === 'paid'
              ? 'border-paid/35 bg-paid/10 text-paid'
              : 'border-depleted/35 bg-depleted/10 text-depleted'
          }`}
        >
          {message.text}
        </p>
      )}
    </section>
  )
}
```

- [ ] **Step 5: Run it and watch it pass**

```bash
npx vitest run app/app/__tests__/simulate.test.tsx
```

Expected: PASS, 5 tests.

- [ ] **Step 6: Commit**

```bash
git add app/app/links app/app/simulate app/app/__tests__/simulate.test.tsx
git commit -m "feat: add affiliate dashboard and conversion simulator"
```

---

## Task 14: Advertiser side — create an offer, dashboard, top up

**Files:**
- Create: `components/app/CreateOfferForm.tsx`, `components/app/TopUpDialog.tsx`, `app/app/my-offers/page.tsx`
- Test: `app/app/__tests__/my-offers.test.tsx`

**Interfaces:**
- Consumes: `useMyOffers`, `useMutate`; `createOffer`, `topUpEscrow`, `listConversionsByOffer`, `spentUsd`; `Money`, `Button`, `Field`, `inputClass`; `CATEGORIES`, `OfferDraft`
- Produces: nothing consumed by later tasks

- [ ] **Step 1: Write the failing test**

Create `app/app/__tests__/my-offers.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MyOffersPage from '@/app/app/my-offers/page'
import BrowsePage from '@/app/app/page'
import { StoreProvider } from '@/lib/store/provider'

const WALLET = '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU'

vi.mock('@/lib/wallet/useAccount', () => ({
  useAccount: () => ({ wallet: WALLET, connected: true, connecting: false }),
  useLoginModal: () => () => {},
}))

async function fillAndSubmit(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Offer name'), 'Ashcroft Rail')
  await user.type(
    screen.getByLabelText('Description'),
    'Discount rail booking for commuters in the north of England.',
  )
  await user.selectOptions(screen.getByLabelText('Category'), 'ecommerce')
  await user.type(screen.getByLabelText('Commission per conversion (USD)'), '15')
  await user.type(
    screen.getByLabelText('Conversion terms'),
    'A conversion is a completed booking of $40 or more.',
  )
  await user.type(screen.getByLabelText('Target URL'), 'https://example.com/ashcroft')
  await user.type(screen.getByLabelText('Escrow budget (USD)'), '300')
  await user.click(screen.getByRole('button', { name: 'Lock budget and list offer' }))
}

describe('Create offer', () => {
  it('lists the offer and shows its locked balance', async () => {
    const user = userEvent.setup()
    render(
      <StoreProvider>
        <MyOffersPage />
      </StoreProvider>,
    )
    await fillAndSubmit(user)
    expect(screen.getByText('Ashcroft Rail')).toBeInTheDocument()
    expect(screen.getAllByText('$300.00').length).toBeGreaterThan(0)
  })

  it('appears in the marketplace grid with no reload', async () => {
    const user = userEvent.setup()
    render(
      <StoreProvider>
        <MyOffersPage />
        <BrowsePage />
      </StoreProvider>,
    )
    expect(screen.queryByRole('heading', { name: 'Ashcroft Rail' })).toBeNull()
    await fillAndSubmit(user)
    // One heading in the advertiser list, one in the marketplace grid: both
    // views read the same store and re-rendered without a reload.
    expect(screen.getAllByRole('heading', { name: 'Ashcroft Rail' })).toHaveLength(2)
  })

  it('refuses a budget smaller than one commission', async () => {
    const user = userEvent.setup()
    render(
      <StoreProvider>
        <MyOffersPage />
      </StoreProvider>,
    )
    await user.type(screen.getByLabelText('Offer name'), 'Underfunded Ltd')
    await user.type(screen.getByLabelText('Description'), 'Not enough budget to pay anyone.')
    await user.type(screen.getByLabelText('Commission per conversion (USD)'), '50')
    await user.type(screen.getByLabelText('Conversion terms'), 'A completed order.')
    await user.type(screen.getByLabelText('Target URL'), 'https://example.com/underfunded')
    await user.type(screen.getByLabelText('Escrow budget (USD)'), '20')
    await user.click(screen.getByRole('button', { name: 'Lock budget and list offer' }))
    expect(screen.getByText(/must cover at least one conversion/i)).toBeInTheDocument()
    expect(screen.queryByText('Underfunded Ltd')).toBeNull()
  })

  it('requires a http(s) target URL', async () => {
    const user = userEvent.setup()
    render(
      <StoreProvider>
        <MyOffersPage />
      </StoreProvider>,
    )
    await user.type(screen.getByLabelText('Offer name'), 'Bad URL Co.')
    await user.type(screen.getByLabelText('Description'), 'The target is not a web address.')
    await user.type(screen.getByLabelText('Commission per conversion (USD)'), '10')
    await user.type(screen.getByLabelText('Conversion terms'), 'A completed order.')
    await user.type(screen.getByLabelText('Target URL'), 'not-a-url')
    await user.type(screen.getByLabelText('Escrow budget (USD)'), '100')
    await user.click(screen.getByRole('button', { name: 'Lock budget and list offer' }))
    expect(screen.getByText(/must start with http/i)).toBeInTheDocument()
  })
})

describe('Top up escrow', () => {
  it('raises both the remainder and the total', async () => {
    const user = userEvent.setup()
    render(
      <StoreProvider>
        <MyOffersPage />
      </StoreProvider>,
    )
    await fillAndSubmit(user)
    await user.click(screen.getByRole('button', { name: 'Top up escrow' }))
    await user.type(screen.getByLabelText('Amount to add (USD)'), '200')
    await user.click(screen.getByRole('button', { name: 'Add to escrow' }))
    expect(screen.getAllByText('$500.00').length).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: Run it and watch it fail**

```bash
npx vitest run app/app/__tests__/my-offers.test.tsx
```

Expected: FAIL — modules do not resolve.

- [ ] **Step 3: Write `components/app/CreateOfferForm.tsx`**

```tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Field, inputClass } from '@/components/ui/Field'
import { createOffer } from '@/lib/store'
import { useMutate } from '@/lib/store/provider'
import { CATEGORIES, type Category } from '@/lib/types'

const BLANK = {
  name: '',
  description: '',
  category: 'ecommerce' as Category,
  commission: '',
  conversionTerms: '',
  targetUrl: '',
  budget: '',
}

export function CreateOfferForm({ wallet }: { wallet: string }) {
  const mutate = useMutate()
  const [form, setForm] = useState(BLANK)
  const [error, setError] = useState<string | null>(null)

  const set = (k: keyof typeof BLANK) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const commission = Number(form.commission)
    const budget = Number(form.budget)

    if (!form.name.trim()) return setError('Give the offer a name.')
    if (!form.description.trim()) return setError('Describe what the advertiser sells.')
    if (!(commission > 0)) return setError('Commission must be greater than zero.')
    if (!form.conversionTerms.trim()) return setError('State what counts as a conversion.')
    if (!/^https?:\/\//i.test(form.targetUrl.trim()))
      return setError('The target URL must start with http:// or https://')
    if (!(budget >= commission))
      return setError('The escrow budget must cover at least one conversion.')

    mutate(() =>
      createOffer(
        {
          name: form.name,
          description: form.description,
          category: form.category,
          commissionAmountUsd: commission,
          conversionTerms: form.conversionTerms,
          targetUrl: form.targetUrl,
          escrowBudgetUsd: budget,
        },
        wallet,
      ),
    )
    setForm(BLANK)
    setError(null)
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-md border border-line bg-surface p-4">
      <Field label="Offer name">
        <input aria-label="Offer name" className={inputClass} value={form.name} onChange={set('name')} />
      </Field>

      <Field label="Description">
        <textarea
          aria-label="Description"
          rows={3}
          className={inputClass}
          value={form.description}
          onChange={set('description')}
        />
      </Field>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Category">
          <select
            aria-label="Category"
            className={inputClass}
            value={form.category}
            onChange={set('category')}
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Commission per conversion (USD)" hint="CPA: a fixed amount per conversion.">
          <input
            aria-label="Commission per conversion (USD)"
            inputMode="decimal"
            className={`${inputClass} font-mono tnum`}
            value={form.commission}
            onChange={set('commission')}
          />
        </Field>
      </div>

      <Field label="Conversion terms" hint="Be specific. Affiliates price their effort on this.">
        <textarea
          aria-label="Conversion terms"
          rows={2}
          className={inputClass}
          value={form.conversionTerms}
          onChange={set('conversionTerms')}
        />
      </Field>

      <Field label="Target URL">
        <input
          aria-label="Target URL"
          className={`${inputClass} font-mono text-[12px]`}
          placeholder="https://"
          value={form.targetUrl}
          onChange={set('targetUrl')}
        />
      </Field>

      <Field
        label="Escrow budget (USD)"
        hint="Locked before the offer goes live. Affiliates see this balance, not a promise."
        error={error ?? undefined}
      >
        <input
          aria-label="Escrow budget (USD)"
          inputMode="decimal"
          className={`${inputClass} font-mono tnum`}
          value={form.budget}
          onChange={set('budget')}
        />
      </Field>

      <Button type="submit">Lock budget and list offer</Button>
    </form>
  )
}
```

- [ ] **Step 4: Write `components/app/TopUpDialog.tsx`**

```tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Field, inputClass } from '@/components/ui/Field'
import { topUpEscrow } from '@/lib/store'
import { useMutate } from '@/lib/store/provider'

export function TopUpDialog({ offerId }: { offerId: string }) {
  const mutate = useMutate()
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [error, setError] = useState<string | null>(null)

  if (!open) {
    return (
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Top up escrow
      </Button>
    )
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const value = Number(amount)
    if (!(value > 0)) return setError('Enter an amount greater than zero.')
    mutate(() => topUpEscrow(offerId, value))
    setAmount('')
    setError(null)
    setOpen(false)
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <Field label="Amount to add (USD)" error={error ?? undefined}>
        <input
          aria-label="Amount to add (USD)"
          inputMode="decimal"
          className={`${inputClass} font-mono tnum`}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </Field>
      <div className="flex gap-2">
        <Button type="submit">Add to escrow</Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
```

- [ ] **Step 5: Write `app/app/my-offers/page.tsx`**

```tsx
'use client'

import { Badge } from '@/components/ui/Badge'
import { Money } from '@/components/ui/Money'
import { EscrowMeter } from '@/components/app/EscrowMeter'
import { CreateOfferForm } from '@/components/app/CreateOfferForm'
import { TopUpDialog } from '@/components/app/TopUpDialog'
import { useMyOffers, useStoreVersion } from '@/lib/store/provider'
import { listConversionsByOffer, spentUsd } from '@/lib/store'
import { useAccount } from '@/lib/wallet/useAccount'

export default function MyOffersPage() {
  const { wallet } = useAccount()
  const offers = useMyOffers(wallet)
  // Conversion counts are read per render; the version dependency keeps them fresh.
  useStoreVersion()

  return (
    <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <div>
        <h1 className="mb-1 text-lg font-semibold">List an offer</h1>
        <p className="mb-3 text-[13px] text-muted">
          The budget is locked when the offer is created. Nobody has to take your word for it.
        </p>
        {wallet && <CreateOfferForm wallet={wallet} />}
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold">My offers</h2>
        {offers.length === 0 ? (
          <p className="rounded-md border border-line bg-surface p-5 text-[13px] text-muted">
            You have not listed an offer yet. The form on the left lists one immediately.
          </p>
        ) : (
          <ul className="space-y-3">
            {offers.map((offer) => {
              const conversions = listConversionsByOffer(offer.id).length
              return (
                <li key={offer.id} className="rounded-md border border-line bg-surface p-4">
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <h3 className="text-[15px] font-semibold">{offer.name}</h3>
                    {offer.status === 'depleted' ? (
                      <Badge tone="depleted">Escrow empty</Badge>
                    ) : (
                      <Badge>Community</Badge>
                    )}
                  </div>

                  <EscrowMeter offer={offer} />

                  <dl className="mt-3 grid grid-cols-3 gap-2 border-t border-line pt-3">
                    <div>
                      <dt className="text-[11px] text-muted">Conversions</dt>
                      <dd className="font-mono tnum text-[14px]">{conversions}</dd>
                    </div>
                    <div>
                      <dt className="text-[11px] text-muted">Budget spent</dt>
                      <dd className="text-[14px]">
                        <Money value={spentUsd(offer)} />
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[11px] text-muted">CPA</dt>
                      <dd className="text-[14px]">
                        <Money value={offer.commissionAmountUsd} />
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-3">
                    <TopUpDialog offerId={offer.id} />
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}
```

- [ ] **Step 6: Run it and watch it pass**

```bash
npx vitest run app/app/__tests__/my-offers.test.tsx
```

Expected: PASS, 5 tests.

- [ ] **Step 7: Commit**

```bash
git add components/app/CreateOfferForm.tsx components/app/TopUpDialog.tsx app/app/my-offers app/app/__tests__/my-offers.test.tsx
git commit -m "feat: add offer creation, advertiser dashboard, and escrow top-up"
```

---

## Task 15: Landing page

**Files:**
- Create: `components/landing/LoginCta.tsx`, `Hero.tsx`, `Problem.tsx`, `HowItWorks.tsx`, `WhyEscrow.tsx`, `WhatYouGet.tsx`, `Market.tsx`, `Footer.tsx`
- Modify: `app/page.tsx`
- Test: `app/__tests__/landing.test.tsx`

**Interfaces:**
- Consumes: `useAccount`, `useLoginModal`; `Money`, `Badge`, `Button`
- Produces: the landing page at `/`

**Copy rule for this task:** every numeric claim below appears exactly as written, with its source visible on the page. Add nothing numeric that is not in this list. No figure about Nativness itself.

- [ ] **Step 1: Write the failing test**

Create `app/__tests__/landing.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import LandingPage from '@/app/page'

vi.mock('@/lib/wallet/useAccount', () => ({
  useAccount: () => ({ wallet: null, connected: false, connecting: false }),
  useLoginModal: () => () => {},
}))

describe('Landing page', () => {
  it('offers exactly one primary call to action', () => {
    render(<LandingPage />)
    expect(screen.getAllByRole('button', { name: 'Enter Nativness' })).toHaveLength(1)
  })

  it('has no separate browse or list CTA — login is the single front door', () => {
    render(<LandingPage />)
    expect(screen.queryByRole('button', { name: /^browse/i })).toBeNull()
    expect(screen.queryByRole('button', { name: /^list an offer/i })).toBeNull()
  })

  it('shows a real offer card with a locked escrow balance', () => {
    render(<LandingPage />)
    expect(screen.getByText('$340.00')).toBeInTheDocument()
    expect(screen.getByText(/\$500\.00/)).toBeInTheDocument()
  })

  it('cites every market figure with its source', () => {
    render(<LandingPage />)
    const market = screen.getByTestId('market')
    expect(market).toHaveTextContent('$19.4B')
    expect(market).toHaveTextContent('$17.1B')
    expect(market).toHaveTextContent('$22B')
    expect(market).toHaveTextContent('Forrester')
    expect(market).toHaveTextContent('$13.81B')
    expect(market).toHaveTextContent('11.3%')
    expect(market).toHaveTextContent('eMarketer')
  })

  it('attributes each problem claim to a named source', () => {
    render(<LandingPage />)
    const problem = screen.getByTestId('problem')
    expect(problem).toHaveTextContent('$75,000')
    expect(problem).toHaveTextContent('$300,000')
    expect(problem).toHaveTextContent('15/100')
    expect(problem).toHaveTextContent('NET-60')
    expect(problem).toHaveTextContent('2.2/5')
    expect(problem).toHaveTextContent('Awin')
    expect(problem).toHaveTextContent('October 2025')
  })

  it('never claims LinkUp or Revelio Labs is an affiliate network', () => {
    render(<LandingPage />)
    const text = screen.getByTestId('problem').textContent ?? ''
    expect(text).toMatch(/workforce-data/i)
  })

  it('makes no numeric claim about Nativness itself', () => {
    render(<LandingPage />)
    const whatYouGet = screen.getByTestId('what-you-get').textContent ?? ''
    expect(whatYouGet).not.toMatch(/\d+\s*(companies|advertisers|affiliates|users|paid out)/i)
  })

  it('states the three steps in order', () => {
    render(<LandingPage />)
    const steps = screen.getByTestId('how-it-works')
    expect(steps).toHaveTextContent(/lock the commission budget/i)
    expect(steps).toHaveTextContent(/promote with the balance visible/i)
    expect(steps).toHaveTextContent(/confirmed conversion pays out/i)
  })
})
```

- [ ] **Step 2: Run it and watch it fail**

```bash
npx vitest run app/__tests__/landing.test.tsx
```

Expected: FAIL — landing components do not exist.

- [ ] **Step 3: Write `components/landing/LoginCta.tsx`**

```tsx
'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { useAccount, useLoginModal } from '@/lib/wallet/useAccount'

/**
 * The single front door. Opens the wallet modal and, once the connection the
 * user just initiated succeeds, sends them into the app.
 *
 * The ref matters: someone already connected who deliberately visits the
 * landing page should not be bounced away from it.
 */
export function LoginCta() {
  const { connected } = useAccount()
  const openLogin = useLoginModal()
  const router = useRouter()
  const requested = useRef(false)

  useEffect(() => {
    if (connected && requested.current) router.push('/app')
  }, [connected, router])

  return (
    <Button
      className="px-5 py-2.5 text-[14px]"
      onClick={() => {
        if (connected) {
          router.push('/app')
          return
        }
        requested.current = true
        openLogin()
      }}
    >
      Enter Nativness
    </Button>
  )
}
```

- [ ] **Step 4: Write `components/landing/Hero.tsx`**

```tsx
import { Badge } from '@/components/ui/Badge'
import { Money } from '@/components/ui/Money'
import { LoginCta } from './LoginCta'

export function Hero() {
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 lg:grid-cols-[1.1fr_1fr] lg:py-24">
      <div>
        <p className="text-[15px] font-semibold tracking-tight">Nativness</p>
        <h1 className="mt-4 text-3xl font-semibold leading-[1.15] tracking-tight sm:text-4xl">
          Affiliate offers whose commission budget is already locked in escrow.
        </h1>
        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted">
          Anyone can list an offer in any niche — ecommerce, iGaming, dating, SaaS. The catch is
          the budget goes into on-chain escrow before the offer goes live, so affiliates see a
          guaranteed balance instead of a promise, and a confirmed conversion pays out on the spot.
        </p>
        <div className="mt-8">
          <LoginCta />
        </div>
        <p className="mt-3 text-[12px] text-muted">
          Your Solana wallet is your account. One login opens both sides of the marketplace.
        </p>
      </div>

      {/* A real card from the app, not an illustration of one. */}
      <div className="rounded-md border border-line bg-surface p-5 sm:max-w-sm sm:justify-self-end">
        <div className="mb-0.5 flex items-start justify-between gap-2">
          <h2 className="text-[15px] font-semibold leading-tight">Drayton Supply Co.</h2>
          <Badge tone="paid">Verified</Badge>
        </div>
        <p className="mb-4 text-[12px] text-muted">Ecommerce</p>

        <div className="flex items-baseline justify-between border-b border-line pb-2">
          <span className="text-[11.5px] text-muted">CPA per conversion</span>
          <Money value={24} className="text-[15px] font-bold" />
        </div>

        <div className="pt-3">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[11.5px] text-muted">Escrow remaining</span>
            <span className="text-[13px]">
              <Money value={340} tone="escrow" />
              <span className="font-mono tnum text-muted"> / </span>
              <Money value={500} tone="muted" />
            </span>
          </div>
          <div className="mt-1.5 h-1 overflow-hidden rounded-sm bg-line">
            <div className="h-full bg-escrow" style={{ width: '68%' }} />
          </div>
          <p className="mt-1.5 font-mono tnum text-[10.5px] text-muted">
            14 conversions funded · locked before listing
          </p>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 5: Write `components/landing/Problem.tsx`**

```tsx
const CLAIMS = [
  {
    heading: 'The good tooling is priced for enterprises only',
    body: 'Workforce-data providers LinkUp and Revelio Labs list at $75,000–$300,000 a year, enterprise-only, with no self-serve tier. One independent review scored Revelio Labs 15/100 on fit for a solo marketer or founder. Adjacent infrastructure prices out exactly the people who need it most.',
    source: 'LinkUp, Revelio Labs; independent review',
  },
  {
    heading: 'Getting paid takes months — when it happens',
    body: 'Rakuten Advertising settles on NET-60 terms and holds a 2.2/5 rating on Trustpilot. CJ Affiliate has drawn reported complaints of commissions withheld behind an “investigation” that never resolves.',
    source: 'Rakuten Advertising, Trustpilot; CJ Affiliate complaints',
  },
  {
    heading: 'Outside the big networks there is no recourse at all',
    body: 'iGaming and dating CPA networks such as Ace Partners, N1 Partners and Affilitex are fragmented and offshore. Trust rests on reputation alone: no escrow, no arbitration, nowhere to go when a payment does not arrive.',
    source: 'Ace Partners, N1 Partners, Affilitex',
  },
  {
    heading: 'And networks do disappear',
    body: 'ShareASale shut down and merged into Awin in October 2025. Affiliates who had built their business on it had no claim on anything except goodwill.',
    source: 'ShareASale / Awin, October 2025',
  },
]

export function Problem() {
  return (
    <section data-testid="problem" className="border-t border-line">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-semibold tracking-tight">
          Affiliate payment is a trust problem nobody has fixed
        </h2>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">
          Every layer of the current market asks the affiliate to do the work first and trust
          somebody else to pay later.
        </p>

        <div className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2">
          {CLAIMS.map((c) => (
            <div key={c.heading}>
              <h3 className="text-[15px] font-semibold">{c.heading}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-muted">{c.body}</p>
              <p className="mt-2 text-[11px] text-muted/70">Source: {c.source}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 6: Write `components/landing/HowItWorks.tsx`**

```tsx
const STEPS = [
  {
    n: '01',
    heading: 'Lock the commission budget',
    body: 'The advertiser funds escrow before the offer is visible to anyone. No budget, no listing.',
  },
  {
    n: '02',
    heading: 'Promote with the balance visible',
    body: 'Affiliates see exactly what is left to pay out and generate a link carrying their own wallet address.',
  },
  {
    n: '03',
    heading: 'A confirmed conversion pays out',
    body: 'Confirmation releases the commission from escrow to the affiliate’s wallet. No terms, no hold, no investigation.',
  },
]

export function HowItWorks() {
  return (
    <section data-testid="how-it-works" className="border-t border-line">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-semibold tracking-tight">How a payout actually happens</h2>

        <ol className="mt-10 grid gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-3">
          {STEPS.map((s) => (
            <li key={s.n} className="bg-surface p-5">
              <span className="font-mono tnum text-[12px] text-escrow">{s.n}</span>
              <h3 className="mt-2 text-[15px] font-semibold">{s.heading}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-muted">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
```

- [ ] **Step 7: Write `components/landing/WhyEscrow.tsx`**

```tsx
export function WhyEscrow() {
  return (
    <section className="border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 lg:grid-cols-2">
        <h2 className="text-2xl font-semibold tracking-tight">
          Why escrow, and not reputation
        </h2>
        <div className="space-y-4 text-[15px] leading-relaxed text-muted">
          <p>
            A reputation system prices trust after the fact. It can tell you who failed to pay
            last quarter; it cannot stop this quarter’s advertiser from being the next one. That
            is why every open affiliate market eventually closes itself off — vetting becomes the
            only defence, and vetting is what locks out newcomers.
          </p>
          <p>
            Escrow inverts the order. The money is committed before an affiliate ever sees the
            offer, so the listing itself carries the guarantee. Nobody has to be trusted, which
            is precisely what makes it safe to let anyone list.
          </p>
          <p className="text-text">
            An unknown advertiser with a funded balance is a better counterparty than a
            well-known one with an unfunded promise.
          </p>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 8: Write `components/landing/WhatYouGet.tsx`**

```tsx
const AFFILIATE = [
  'Browse every listed offer with its escrow balance in view',
  'Generate a tracking link tied to your wallet address',
  'Track clicks, confirmed conversions and payouts in one place',
]

const ADVERTISER = [
  'List an offer in any niche, with your budget locked on creation',
  'Watch remaining escrow, conversions and spend per offer',
  'Top up escrow whenever you want more conversions funded',
]

export function WhatYouGet() {
  return (
    <section data-testid="what-you-get" className="border-t border-line">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-semibold tracking-tight">One login opens both sides</h2>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">
          There is no affiliate account and no advertiser account. Connecting your wallet creates
          one identity that can promote other people’s offers and list its own, in the same
          session, from the same navigation. Nobody signs up twice.
        </p>

        <div className="mt-10 grid gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-2">
          <Column title="Promote offers" items={AFFILIATE} />
          <Column title="List your own" items={ADVERTISER} />
        </div>
      </div>
    </section>
  )
}

function Column({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="bg-surface p-5">
      <h3 className="text-[15px] font-semibold">{title}</h3>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-[14px] leading-relaxed text-muted">
            <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-escrow" aria-hidden />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
```

- [ ] **Step 9: Write `components/landing/Market.tsx`**

```tsx
export function Market() {
  return (
    <section data-testid="market" className="border-t border-line">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-semibold tracking-tight">
          The channel is growing. The infrastructure under it is not.
        </h2>

        <div className="mt-10 grid gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-2">
          <div className="bg-surface p-5">
            <p className="font-mono tnum text-2xl font-bold text-escrow">$19.4B</p>
            <p className="mt-2 text-[14px] leading-relaxed text-muted">
              Global affiliate marketing spend in 2026, up from{' '}
              <span className="font-mono tnum text-text">$17.1B</span> in 2025, on track for{' '}
              <span className="font-mono tnum text-text">$22B</span> by 2027.
            </p>
            <p className="mt-2 text-[11px] text-muted/70">Source: Forrester</p>
          </div>

          <div className="bg-surface p-5">
            <p className="font-mono tnum text-2xl font-bold text-escrow">$13.81B</p>
            <p className="mt-2 text-[14px] leading-relaxed text-muted">
              United States affiliate marketing spend in 2026, up{' '}
              <span className="font-mono tnum text-text">11.3%</span> year over year.
            </p>
            <p className="mt-2 text-[11px] text-muted/70">Source: eMarketer</p>
          </div>
        </div>

        <p className="mt-6 max-w-2xl text-[14px] leading-relaxed text-muted">
          These are adoption figures for the channel, not a forecast for this product. They
          describe how much commission money moves through a payment layer that still runs on
          NET-60 terms and goodwill.
        </p>
      </div>
    </section>
  )
}
```

- [ ] **Step 10: Write `components/landing/Footer.tsx`**

```tsx
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-8">
        <p className="text-[13px] font-semibold">Nativness</p>
        <Link href="/app" className="text-[13px] text-muted hover:text-text">
          Marketplace
        </Link>
        <a
          href="https://github.com/faceless121212/Affiliate-marketplace"
          className="text-[13px] text-muted hover:text-text"
        >
          Source
        </a>
        <p className="ml-auto text-[12px] text-muted/70">
          Solana devnet prototype. Escrow is simulated.
        </p>
      </div>
    </footer>
  )
}
```

- [ ] **Step 11: Compose `app/page.tsx`**

```tsx
import { Hero } from '@/components/landing/Hero'
import { Problem } from '@/components/landing/Problem'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { WhyEscrow } from '@/components/landing/WhyEscrow'
import { WhatYouGet } from '@/components/landing/WhatYouGet'
import { Market } from '@/components/landing/Market'
import { Footer } from '@/components/landing/Footer'

export default function LandingPage() {
  return (
    <main>
      <Hero />
      <Problem />
      <HowItWorks />
      <WhyEscrow />
      <WhatYouGet />
      <Market />
      <Footer />
    </main>
  )
}
```

- [ ] **Step 12: Run it and watch it pass**

```bash
npx vitest run app/__tests__/landing.test.tsx
```

Expected: PASS, 9 tests.

- [ ] **Step 13: Commit**

```bash
git add components/landing app/page.tsx app/__tests__/landing.test.tsx
git commit -m "feat: add landing page with sourced claims and a single login CTA"
```

---

## Task 16: README, responsive pass, and end-to-end verification

**Files:**
- Modify: `README.md`
- Test: full suite plus manual walkthrough

- [ ] **Step 1: Run the whole suite**

```bash
npm test
```

Expected: PASS. If any test fails, fix it before continuing — do not proceed with a red suite.

- [ ] **Step 2: Build for production**

```bash
npm run build
```

Expected: success. A type error here that the tests missed is common around `use(params)`; fix it rather than casting to `any`.

- [ ] **Step 3: Walk the acceptance criteria by hand**

```bash
npm run dev
```

Check each in order, in a browser with a Solana wallet extension set to devnet:

1. Landing page at `http://localhost:3000` — one CTA, "Enter Nativness".
2. Click it → wallet modal → approve → you land on `/app`, **not** a role-selection screen.
3. `/app` shows six offers; Drayton and Meridian carry Verified badges; Halcyon Tools shows "Escrow empty".
4. Open Drayton → **Get my link** → the URL contains your wallet address → **Copy** turns to "Copied".
5. Visit that `/r/...` URL → it redirects to the target page.
6. `/app/my-offers` → list an offer → it appears in the right-hand column immediately.
7. `/app` → your new offer is in the grid, no reload performed.
8. `/app/simulate` → select your link → **Confirm conversion** → confirmation names the payout.
9. `/app` → that offer's escrow has decreased by exactly the commission.
10. `/app/links` → the payout appears and total earned matches.
11. Disconnect, reconnect the same wallet → your offers, links and payouts are all still there.
12. The prototype banner is present on every `/app` route and has no close control.

- [ ] **Step 4: Responsive pass at 380px**

In devtools, set the viewport to 380×800 and walk every route. Fix anything that overflows horizontally. Expected at that width: offer grid at one column; nav scrolls horizontally without clipping; the tracking-link URL wraps rather than widening the page; tables scroll inside their own container, not the page.

- [ ] **Step 5: Write the README**

Replace `README.md`:

````markdown
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
npm test          # unit and component tests
npm run build     # production build
```

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

### Demo data

Six fictional offers seed on first load, across ecommerce, iGaming, dating and SaaS. No real
brand names are used. Two are Verified; one (Fenwick Grounds) is nearly exhausted and one
(Halcyon Tools) has zero escrow, so both degraded states are visible without simulating your
way there.

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
swaps implementations without touching a single component.

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
````

- [ ] **Step 6: Reconcile the spec with the two deviations found during the build**

In `docs/superpowers/specs/2026-09-26-nativness-design.md`:
1. §3 and §10 — change `app/r/[offerId]/[wallet]/route.ts` to `page.tsx` and note why (a server handler cannot read `localStorage`).
2. §6 storage table — add `lib/store/users.ts` to the file list.

- [ ] **Step 7: Final commit**

```bash
git add -A
git commit -m "docs: add README with honest Phase 1 boundaries and Phase 2 seams"
```

- [ ] **Step 8: Report**

State plainly: which acceptance criteria passed, anything that did not, and the test count. Do not report completion with a red suite or an unverified criterion.
