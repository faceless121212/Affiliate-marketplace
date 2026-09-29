# Landing Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the landing page so it stops reading as eight identical stacked text boxes, replacing them with six sections that each have a distinct layout shape, led by a hero that shows the escrow mechanic running instead of describing it.

**Architecture:** The landing page sheds the Solana wallet bundle entirely (it becomes a static marketing page whose CTAs are plain links into `/app`, where the existing `ConnectGate` already handles sign-in). That frees the JS budget for one new client component, `LiveEscrowDemo`, which reuses the app's own `EscrowMeter` and `Money` so the demo cannot drift from the product. Each section then carries a `data-shape` attribute naming its layout archetype, and a test asserts no two adjacent sections share one — making the governing design rule mechanically enforceable.

**Tech Stack:** Next.js 16.3.6 (App Router), React 19.2.8, TypeScript, Tailwind CSS v4 (`@theme static`), Vitest 5 + React Testing Library + jsdom.

**Spec:** `design.md` (repo root)

## Global Constraints

Copied verbatim from the spec. Every task's requirements implicitly include these.

- **Scope:** `app/page.tsx` and `components/landing/` only. No app screens, no new colour tokens, no dark mode.
- **Lime `#C3FF00` is a fill colour only, never text.** Lime text on white is ~1.2:1.
- **Every text node must meet 4.5:1** (3:1 for large text). The page passes today; it must still pass.
- **No claim, figure or logo the page cannot source.** Every problem and market figure keeps its source line.
- **No testimonial-style attributed quote, ever.** No numeric claim about Nativness's own adoption, revenue or traffic.
- **No em dash** anywhere on the page, except inside the cited `$75,000–$300,000` range (which no longer appears — the card citing it was deleted).
- **One label per destination, 1:1 in both directions,** across every CTA in `<main>`.
- **The Phase 1 disclosure holds:** escrow is simulated, not on-chain. Anything showing escrow must say so.
- **Landing JS must not be worse at the end than at the start.** Budget is 300 KB (`scripts/measure-sli.mjs`, `BUDGETS.landingJsKB`); it currently measures ~1,074 KB.
- **Run tests with** `npx vitest run --no-file-parallelism` — the suite flakes under CPU contention otherwise.
- **Commit after every task.** Lint (`npm run lint`), typecheck (`npx tsc --noEmit`) and the full suite must be clean before each commit.

---

## File Structure

**Created:**

| File | Responsibility |
|---|---|
| `components/landing/LiveEscrowDemo.tsx` | The hero's right column. One offer card whose escrow drains on a timer. Client component. |
| `components/landing/Bento.tsx` | Section 3. Merges `WhyNativness` + `WhatYouGet` into an unequal-cell grid. |
| `components/landing/BentoBrowsePreview.tsx` | The miniature Browse grid inside the bento's 2×2 cell. Pure presentation, no state. |
| `components/landing/__tests__/live-escrow-demo.test.tsx` | Demo behaviour: drain, reset, reduced motion, disclosure. |
| `components/landing/__tests__/section-shapes.test.tsx` | The governing rule: no two adjacent sections share a shape. |

**Modified:** `app/layout.tsx`, `app/app/layout.tsx`, `components/landing/LoginCta.tsx`, `Hero.tsx`, `HeroCenter.tsx`, `EscrowCounter.tsx`, `HowItWorks.tsx`, `Problem.tsx`, `Market.tsx`, `GetStarted.tsx`, `app/page.tsx`, `app/globals.css`, `app/__tests__/landing.test.tsx`

**Deleted:** `components/landing/WhyNativness.tsx`, `components/landing/WhatYouGet.tsx`, `components/landing/WhyEscrow.tsx`

---

### Task 1: Landing page sheds the wallet bundle

This is the spec's §9 prerequisite and a **gate**: if the measured saving is small, stop and report before building the demo.

`WalletProviders` sits in the root layout, so the Solana wallet adapter loads on a purely static marketing page. Every wallet-context consumer already lives under `app/app/` except `LoginCta`. Moving the provider down one level and converting the landing CTAs to plain links removes the bundle from the landing page entirely. `/app`'s `ConnectGate` already says "Sign in with your wallet", so the sign-in experience improves: one gate instead of a modal on the marketing page.

**Files:**
- Modify: `app/layout.tsx:3` (remove import), `app/layout.tsx:25-29` (unwrap)
- Modify: `app/app/layout.tsx` (wrap with `WalletProviders`)
- Modify: `components/landing/LoginCta.tsx` (full rewrite)
- Modify: `app/__tests__/landing.test.tsx` (remove wallet mocks, re-anchor CTA tests)
- Test: `app/__tests__/landing.test.tsx`

**Interfaces:**
- Consumes: nothing
- Produces: `LoginCta` with props `{ destination?: string; children?: React.ReactNode; className?: string; variant?: 'primary' | 'paid' | 'secondary' | 'ghost' }`, rendering `<a href={destination}>` — **an anchor, not a button.** Tasks 4 and 9 depend on this.

- [ ] **Step 1: Record the baseline**

```bash
node scripts/measure-sli.mjs 2>&1 | tee /tmp/sli-before.txt
```

Write down the "Landing JS" figure. Expect ~1,074 KB.

- [ ] **Step 2: Write the failing test**

Replace the two mock blocks at the top of `app/__tests__/landing.test.tsx` (the `vi.mock('@/lib/wallet/useAccount', ...)` block and the `let connected` / `const push` declarations) with nothing, and delete the `beforeEach` that resets them. Keep the `next/navigation` mock. Then add this test at the top of the `describe('Landing page')` block:

```tsx
// The landing page is static marketing. It must render with no wallet
// context at all: no provider, no adapter bundle, no mocks in this file.
// Sign-in happens at /app, behind ConnectGate.
it('renders with no wallet context, and every CTA is a plain link', () => {
  render(<LandingPage />)
  const main = screen.getByRole('main')
  const ctas = within(main)
    .getAllByRole('link')
    .filter((a) => (a.getAttribute('href') ?? '').startsWith('/app'))
  expect(ctas.length).toBeGreaterThan(0)
  expect(within(main).queryAllByRole('button')).toHaveLength(0)
})
```

- [ ] **Step 3: Run it and watch it fail**

```bash
npx vitest run --no-file-parallelism app/__tests__/landing.test.tsx
```

Expected: FAIL. Without the mock, `LoginCta` calls `useWallet()` with no provider and throws.

- [ ] **Step 4: Rewrite `LoginCta`**

```tsx
import Link from 'next/link'

type Props = {
  /** Where this CTA sends the visitor. */
  destination?: string
  children?: React.ReactNode
  className?: string
  variant?: 'primary' | 'paid' | 'secondary' | 'ghost'
}

/**
 * A plain link, deliberately.
 *
 * This used to open the wallet modal in place, which meant the landing page
 * had to mount `WalletProviders` and therefore shipped the whole Solana
 * adapter (~700KB) onto a static marketing page. Sign-in now happens at the
 * destination, where `components/app/ConnectGate.tsx` already presents it
 * properly ("Sign in with your wallet") instead of a modal over marketing
 * copy. The landing page ships no wallet code at all.
 */
export function LoginCta({
  destination = '/app',
  children = 'Enter Nativness',
  className = '',
  variant = 'primary',
}: Props) {
  const variantClass = {
    primary: 'bg-escrow text-ink hover:brightness-95',
    paid: 'bg-paid text-white hover:brightness-110',
    secondary: 'border border-inset bg-surface text-text hover:border-muted',
    ghost: 'text-muted hover:text-text',
  }[variant]
  return (
    <Link
      href={destination}
      className={`inline-flex items-center justify-center rounded-[9px] px-5 py-2.5 text-[14px] font-semibold transition ${variantClass} ${className}`}
    >
      {children}
    </Link>
  )
}
```

- [ ] **Step 5: Move the provider out of the root layout**

In `app/layout.tsx`, delete the line `import { WalletProviders } from '@/lib/wallet/provider'` and change the body to:

```tsx
      <body className="font-sans antialiased bg-canvas text-text">
        <StoreProvider>{children}</StoreProvider>
      </body>
```

In `app/app/layout.tsx`, add `import { WalletProviders } from '@/lib/wallet/provider'` and wrap the returned tree:

```tsx
  return (
    <WalletProviders>
      <div className="min-h-dvh">
        {/* ...existing children unchanged... */}
      </div>
    </WalletProviders>
  )
```

- [ ] **Step 6: Re-anchor the CTA tests**

In `app/__tests__/landing.test.tsx`, three tests clicked buttons and asserted `push` was called. Replace them with href assertions. Replace the whole `it('uses exactly one label per destination across the page body', ...)` test with:

```tsx
// The property behind the CTA cleanup, unchanged by Task 1: a visitor
// should never meet two different words for the same place, or one word
// that means two places. Scoped to <main>: the header's "Sign in" also
// lands on /app, but it is an account action rather than an offer CTA.
it('uses exactly one label per destination across the page body', () => {
  render(<LandingPage />)
  const labelsByDestination = new Map<string, Set<string>>()
  const destinationsByLabel = new Map<string, Set<string>>()

  for (const link of within(screen.getByRole('main')).getAllByRole('link')) {
    const destination = link.getAttribute('href') ?? ''
    if (!destination.startsWith('/app')) continue
    const label = (link.textContent ?? '').trim()
    if (!labelsByDestination.has(destination)) labelsByDestination.set(destination, new Set())
    labelsByDestination.get(destination)?.add(label)
    if (!destinationsByLabel.has(label)) destinationsByLabel.set(label, new Set())
    destinationsByLabel.get(label)?.add(destination)
  }

  expect([...labelsByDestination.keys()].sort()).toEqual(['/app', '/app/my-offers'])
  for (const [destination, labels] of labelsByDestination) {
    expect([...labels], `${destination} is reached by more than one label`).toHaveLength(1)
  }
  for (const [label, destinations] of destinationsByLabel) {
    expect([...destinations], `"${label}" points at more than one destination`).toHaveLength(1)
  }
})
```

Then replace `it('routes the hero secondary link to /app once the wallet is connected', ...)` with:

```tsx
it('sends the hero secondary link to /app', () => {
  render(<LandingPage />)
  const hero = screen.getByTestId('hero')
  expect(within(hero).getByRole('link', { name: 'Browse offers' })).toHaveAttribute('href', '/app')
})
```

And replace `it('renders the persona picker with both destinations reachable and no gating', ...)` with:

```tsx
it('renders the persona picker with both destinations reachable and no gating', () => {
  render(<LandingPage />)
  const picker = screen.getByTestId('get-started')
  expect(within(picker).getByRole('link', { name: 'Browse offers' })).toHaveAttribute('href', '/app')
  expect(within(picker).getByRole('link', { name: 'List an offer' })).toHaveAttribute(
    'href',
    '/app/my-offers',
  )
})
```

Finally, in `it('offers exactly one primary CTA in the hero, plus a secondary browse link', ...)`, change the last two lines from `queryAllByRole('button')` to:

```tsx
  const secondary = within(hero).getByRole('link', { name: 'Browse offers' })
  expect(secondary).toBeInTheDocument()
  expect(within(hero).queryAllByRole('button')).toHaveLength(0)
```

- [ ] **Step 7: Run the full suite**

```bash
npx vitest run --no-file-parallelism
```

Expected: PASS. If `components/landing/__tests__/header.test.tsx` fails on `getByRole('button', { name: 'Sign in' })`, change it to `getByRole('link', { name: 'Sign in' })` — the header's CTA is now an anchor too.

- [ ] **Step 8: Measure, and check the gate**

```bash
npm run build && node scripts/measure-sli.mjs 2>&1 | tee /tmp/sli-after.txt
diff /tmp/sli-before.txt /tmp/sli-after.txt
```

Expected: Landing JS drops from ~1,074 KB to under 400 KB.

**GATE — stop here if the saving is under 400 KB.** Report the measured figures and do not start Task 3. The spec makes the live demo conditional on this working.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "Take the wallet bundle off the landing page

WalletProviders sat in the root layout, so a static marketing page
shipped the whole Solana adapter. Every wallet-context consumer already
lived under app/app/ except LoginCta, which opened the modal in place.

The provider moves into app/app/layout.tsx and LoginCta becomes a plain
link. Sign-in now happens at the destination, where ConnectGate already
presents it as 'Sign in with your wallet' rather than a modal over
marketing copy.

Landing JS: 1074KB -> <measured>KB against a 300KB budget.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 2: Depth and type scale tokens

The spec's §7 and §8. H3 currently renders at 15px, identical to body text, so only weight separates a heading from a paragraph. Cards are defined by a 1px `border-line` (#F0F0F0) on `surface` (#FAFAFA) — a 1.02:1 edge that does not read as an object.

**Files:**
- Modify: `app/globals.css` (add to the `@theme static` block)
- Test: none (tokens are asserted through the components that use them, in Tasks 4–8)

**Interfaces:**
- Consumes: nothing
- Produces: Tailwind utilities `shadow-card`, `shadow-card-lg`, and the text sizes used by every later task. Tasks 3–8 depend on these class names existing.

- [ ] **Step 1: Add the shadow tokens**

In `app/globals.css`, inside the existing `@theme static { ... }` block, after the `--color-info` line, add:

```css
  /*
   * Elevation, new in the landing redesign. Cards were previously defined
   * only by a 1px `line` border on `surface`, which is ~1.02:1 and does not
   * read as an object. Two levels only: `card` for ordinary cells, `card-lg`
   * for the two elements that should sit above the page (the hero's live
   * demo and the bento's 2x2 cell). Deliberately soft and neutral: this is
   * a light canvas gaining depth, not a switch to a shadowed idiom.
   */
  --shadow-card: 0 1px 2px rgb(0 0 0 / 0.04), 0 8px 24px rgb(0 0 0 / 0.06);
  --shadow-card-lg: 0 4px 8px rgb(0 0 0 / 0.04), 0 16px 48px rgb(0 0 0 / 0.09);
```

- [ ] **Step 2: Verify the utilities compile**

```bash
npm run build && grep -c "shadow-card" .next/static/css/*.css
```

Expected: `0` at this point — Tailwind only emits a utility once a component uses it. That is correct; `@theme static` guarantees the custom properties exist in `:root`, which is what Task 3 onward relies on. Confirm the properties themselves are present:

```bash
grep -o "\-\-shadow-card[a-z-]*" .next/static/css/*.css | sort -u
```

Expected: `--shadow-card` and `--shadow-card-lg`.

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "Add elevation tokens for the landing redesign

Two levels, card and card-lg. Cards were defined only by a 1px line
border on surface (~1.02:1), which does not read as an object.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 3: `LiveEscrowDemo`

The spec's §6. The hero's right column: one real seed offer whose escrow drains as conversions confirm.

**Files:**
- Create: `components/landing/LiveEscrowDemo.tsx`
- Test: `components/landing/__tests__/live-escrow-demo.test.tsx`

**Interfaces:**
- Consumes: `SEED_OFFERS` from `@/lib/store`; `Money` from `@/components/ui/Money`; `shadow-card-lg` from Task 2.
- Produces: `<LiveEscrowDemo />`, no required props. Renders a region with `data-testid="live-escrow-demo"`. Task 4 mounts it.

- [ ] **Step 1: Write the failing tests**

Create `components/landing/__tests__/live-escrow-demo.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { LiveEscrowDemo } from '../LiveEscrowDemo'

// jsdom has no matchMedia. Every test states the motion preference it wants,
// because the component's whole behaviour hangs off it.
function stubMotion(reduced: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: reduced && query.includes('reduce'),
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia
}

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

describe('LiveEscrowDemo', () => {
  it('starts at the seeded offer balance', () => {
    stubMotion(false)
    render(<LiveEscrowDemo />)
    expect(screen.getByTestId('live-escrow-demo')).toBeInTheDocument()
    expect(screen.getByText('$340.00')).toBeInTheDocument()
    expect(screen.getByText(/covers 14 conversions/i)).toBeInTheDocument()
  })

  it('drains by one commission per tick', () => {
    stubMotion(false)
    render(<LiveEscrowDemo />)
    act(() => { vi.advanceTimersByTime(3400) })
    // $340.00 - $24.00 commission
    expect(screen.getByText('$316.00')).toBeInTheDocument()
    expect(screen.getByText(/covers 13 conversions/i)).toBeInTheDocument()
  })

  it('never renders a negative balance: it resets instead', () => {
    stubMotion(false)
    render(<LiveEscrowDemo />)
    // 14 payouts of $24 exhaust $340 down to $4, which cannot fund a 15th.
    act(() => { vi.advanceTimersByTime(3400 * 20) })
    const figure = screen.getByTestId('demo-remaining').textContent ?? ''
    expect(figure).not.toContain('-')
    const value = Number(figure.replace(/[^0-9.]/g, ''))
    expect(value).toBeGreaterThanOrEqual(0)
    expect(value).toBeLessThanOrEqual(340)
  })

  it('does not start the timer under reduced motion', () => {
    stubMotion(true)
    render(<LiveEscrowDemo />)
    act(() => { vi.advanceTimersByTime(3400 * 5) })
    expect(screen.getByText('$340.00')).toBeInTheDocument()
  })

  it('carries the Phase 1 disclosure', () => {
    stubMotion(false)
    const { container } = render(<LiveEscrowDemo />)
    expect(container.textContent ?? '').toMatch(/simulated/i)
    expect(container.textContent ?? '').not.toMatch(/on-chain settlement|real payout/i)
  })
})
```

- [ ] **Step 2: Run them and watch them fail**

```bash
npx vitest run --no-file-parallelism components/landing/__tests__/live-escrow-demo.test.tsx
```

Expected: FAIL, "Failed to resolve import ../LiveEscrowDemo".

- [ ] **Step 3: Write the component**

Create `components/landing/LiveEscrowDemo.tsx`:

```tsx
'use client'

import { useEffect, useState } from 'react'
import { Money } from '@/components/ui/Money'
import { Badge } from '@/components/ui/Badge'
import { OfferAvatar } from '@/components/ui/OfferAvatar'
import { SEED_OFFERS } from '@/lib/store'

const OFFER = SEED_OFFERS[0]
const TICK_MS = 3400

/**
 * The hero's right column: the escrow mechanic running, rather than described.
 *
 * The landing page used to spend eight text sections narrating a thing the
 * product can simply do on screen. This renders one real seeded offer and
 * drains its escrow by one commission every few seconds, so a visitor sees
 * the balance fall and the payout land before reading a word about it.
 *
 * It reads SEED_OFFERS, the same data /app serves, so the demo and the
 * product cannot drift apart. It is labelled as the demo marketplace in both
 * the header and the footer: Phase 1 escrow is a number in localStorage, and
 * nothing here may imply otherwise.
 */
export function LiveEscrowDemo() {
  const [remaining, setRemaining] = useState(OFFER.escrowRemainingUsd)
  const [justPaid, setJustPaid] = useState(false)

  useEffect(() => {
    // A viewer who asked for less motion gets the card at rest, not a
    // silently-jumping figure: no timer starts at all.
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return

    const id = setInterval(() => {
      setRemaining((value) => {
        // Reset rather than go negative. The balance can never fund a
        // payout it cannot cover, which is the rule the real store enforces
        // in lib/store/conversions.ts.
        if (value - OFFER.commissionAmountUsd < 0) return OFFER.escrowRemainingUsd
        return value - OFFER.commissionAmountUsd
      })
      setJustPaid(true)
      setTimeout(() => setJustPaid(false), 2100)
    }, TICK_MS)

    return () => clearInterval(id)
  }, [])

  const pct = Math.max(0, Math.min(100, (remaining / OFFER.escrowTotalUsd) * 100))
  const covers = Math.floor(remaining / OFFER.commissionAmountUsd)

  return (
    <div
      data-testid="live-escrow-demo"
      className="overflow-hidden rounded-2xl border border-line bg-canvas shadow-card-lg"
    >
      <div className="flex items-center justify-between border-b border-line bg-surface px-4 py-2.5">
        <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.09em] text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-paid" aria-hidden />
          Live demo marketplace
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.09em] text-muted">Devnet</span>
      </div>

      <div className="p-5">
        <div className="mb-3.5 flex items-center gap-2.5">
          <OfferAvatar offer={OFFER} />
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold">{OFFER.name}</p>
            <p className="text-[11.5px] text-muted">Ecommerce</p>
          </div>
          {OFFER.verified && (
            <span className="ml-auto">
              <Badge tone="paid">Verified</Badge>
            </span>
          )}
        </div>

        <p className="text-[11.5px] text-muted">Escrow remaining</p>
        <p className="mt-0.5 flex flex-wrap items-baseline gap-x-1.5" data-testid="demo-remaining">
          <Money value={remaining} tone="escrow" className="text-[28px] font-bold leading-none" />
          <span className="font-mono tnum text-[12px] text-muted">
            / <Money value={OFFER.escrowTotalUsd} tone="muted" className="text-[12px]" />
          </span>
        </p>

        <div className="mt-3 h-2 overflow-hidden rounded-full bg-inset">
          <div
            className="h-full rounded-full bg-escrow transition-[width] duration-700 ease-out motion-reduce:transition-none"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-1.5 font-mono tnum text-[10.5px] text-muted">
          Covers {covers} conversion{covers === 1 ? '' : 's'}
        </p>

        <div className="mt-3.5 flex items-baseline justify-between border-t border-line pt-2.5 text-[11.5px] text-muted">
          <span>Commission per conversion</span>
          <Money value={OFFER.commissionAmountUsd} className="text-[13px]" />
        </div>

        <div className="mt-3 h-8">
          <p
            className={`flex h-full items-center gap-2 rounded-lg border border-paid/20 bg-paid/[0.07] px-3 text-[12px] text-paid transition-opacity duration-500 ${
              justPaid ? 'opacity-100' : 'opacity-0'
            }`}
            aria-hidden
          >
            Conversion confirmed, <Money value={OFFER.commissionAmountUsd} tone="paid" className="text-[12px]" /> paid
          </p>
        </div>
      </div>

      <p className="border-t border-line bg-surface p-2.5 text-center text-[11px] text-muted">
        Real data from the demo marketplace. Escrow is simulated in Phase 1.
      </p>
    </div>
  )
}
```

- [ ] **Step 4: Run the tests**

```bash
npx vitest run --no-file-parallelism components/landing/__tests__/live-escrow-demo.test.tsx
```

Expected: PASS, 5 tests.

- [ ] **Step 5: Commit**

```bash
git add components/landing/LiveEscrowDemo.tsx components/landing/__tests__/live-escrow-demo.test.tsx
git commit -m "Add LiveEscrowDemo: the hero shows the mechanic running

Renders one real seeded offer and drains its escrow by one commission
every few seconds. Reads SEED_OFFERS, the same data /app serves, so the
demo cannot drift from the product.

Resets rather than going negative, mirroring the rule the real store
enforces. Under prefers-reduced-motion no timer starts at all.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 4: Hero — asymmetric split

The spec's §5.1. Replaces the centred `max-w-2xl` block and the three-up row.

**Files:**
- Modify: `components/landing/Hero.tsx` (full rewrite)
- Delete: `components/landing/HeroCenter.tsx`, `components/landing/EscrowCounter.tsx`
- Test: `app/__tests__/landing.test.tsx`

**Interfaces:**
- Consumes: `LiveEscrowDemo` (Task 3), `LoginCta` as an anchor (Task 1)
- Produces: `<section data-testid="hero" data-shape="split">`. Task 9's shape test reads `data-shape`.

- [ ] **Step 1: Write the failing test**

Add to `app/__tests__/landing.test.tsx`, inside `describe('Landing page')`:

```tsx
it('leads with an asymmetric hero carrying the live demo, not a centred text block', () => {
  render(<LandingPage />)
  const hero = screen.getByTestId('hero')
  expect(hero).toHaveAttribute('data-shape', 'split')
  expect(within(hero).getByTestId('live-escrow-demo')).toBeInTheDocument()
  // The wordmark belongs in the header; repeating it here bought nothing but
  // height in the tallest column.
  expect(within(hero).queryByText('Nativness')).toBeNull()
})
```

- [ ] **Step 2: Run it and watch it fail**

```bash
npx vitest run --no-file-parallelism app/__tests__/landing.test.tsx
```

Expected: FAIL, "Unable to find an element by: [data-testid="live-escrow-demo"]".

- [ ] **Step 3: Rewrite the hero**

Replace all of `components/landing/Hero.tsx`:

```tsx
import { LoginCta } from './LoginCta'
import { LiveEscrowDemo } from './LiveEscrowDemo'
import { SEED_OFFERS } from '@/lib/store'
import { money } from '@/lib/format'

const TOTAL_LOCKED = SEED_OFFERS.reduce((sum, offer) => sum + offer.escrowTotalUsd, 0)

/**
 * Asymmetric split: argument left, the product working right.
 *
 * The old hero centred everything in a max-w-2xl column and put a 46px
 * escrow counter below the h1 — so the largest element on the page was a
 * number whose own caption said it was simulated. The counter is gone; the
 * demo card carries the same figure in context, where it reads as a product
 * rather than a claim.
 *
 * The trust row states only what the page can source: escrow locked across
 * the seeded offers (computed, not asserted), the offer count, and a product
 * property. No adoption, revenue or traffic figure about Nativness itself.
 */
export function Hero() {
  return (
    <section
      data-testid="hero"
      data-shape="split"
      className="relative overflow-hidden border-b border-line"
    >
      <div className="relative mx-auto grid max-w-6xl items-center gap-16 px-4 py-22 lg:grid-cols-[1.05fr_0.95fr]">
        {/* Decorative only. Sits behind the right column and bleeds off the
            edge; text lives in the left column, clear of it. */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-56 -top-36 h-[760px] w-[760px] rounded-full opacity-90 blur-2xl"
          style={{
            background:
              'radial-gradient(circle, rgb(195 255 0 / 0.5) 0%, rgb(195 255 0 / 0.14) 38%, transparent 66%)',
          }}
        />

        <div className="relative">
          <h1 className="text-[38px] font-bold leading-[1.04] tracking-[-0.035em] sm:text-[54px]">
            Escrow first.
            <br />
            Trust follows.
          </h1>
          <p className="mt-5 max-w-[30em] text-[16px] leading-relaxed text-muted">
            Advertisers lock the commission budget before the offer goes live. Affiliates see a
            guaranteed balance, not a promise.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-5">
            <LoginCta
              destination="/app"
              data-testid="hero-primary-cta"
              className="px-7 py-3.5 text-[15px]"
            >
              Get started
            </LoginCta>
            <LoginCta destination="/app" variant="ghost" className="px-0 py-0 text-[14px]">
              Browse offers
            </LoginCta>
          </div>

          <dl className="mt-9 flex flex-wrap gap-x-8 gap-y-3 border-t border-line pt-5 text-[12px] text-muted">
            <div>
              <dd className="mb-0.5 font-mono tnum text-[19px] font-bold tracking-tight text-ink">
                {money(TOTAL_LOCKED)}
              </dd>
              <dt>locked in escrow</dt>
            </div>
            <div>
              <dd className="mb-0.5 font-mono tnum text-[19px] font-bold tracking-tight text-ink">
                {SEED_OFFERS.length}
              </dd>
              <dt>live offers</dt>
            </div>
            <div>
              <dd className="mb-0.5 text-[19px] font-bold tracking-tight text-text">Instant</dd>
              <dt>payout on confirm</dt>
            </div>
          </dl>
        </div>

        <div className="relative">
          <LiveEscrowDemo />
        </div>
      </div>
    </section>
  )
}
```

Note: `LoginCta` does not accept `data-testid`. Add it to the `Props` type in `components/landing/LoginCta.tsx` as `'data-testid'?: string` and spread it onto the `<Link>`, so the existing `hero-primary-cta` assertion keeps working.

- [ ] **Step 4: Delete the two dead components**

```bash
git rm components/landing/HeroCenter.tsx components/landing/EscrowCounter.tsx
```

- [ ] **Step 5: Re-anchor the hero copy test**

`it('states one login for both sides in the hero', ...)` asserted a line that now lives in the bento (Task 6). Replace it with:

```tsx
// "One wallet. One login for both sides." moved out of the hero into the
// bento's section header in the redesign. The property worth guarding is
// that the page still makes the one-identity claim somewhere, not that the
// hero is where it lives.
it('states that one wallet covers both sides', () => {
  const { container } = render(<LandingPage />)
  const text = container.textContent ?? ''
  expect(text).toMatch(/one wallet/i)
  expect(text).toMatch(/both sides/i)
})
```

- [ ] **Step 6: Run the suite**

```bash
npx vitest run --no-file-parallelism
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "Rebuild the hero as an asymmetric split with the live demo

Argument left, product working right. Deletes HeroCenter and
EscrowCounter: the 46px counter made the largest element on the page a
number captioned 'simulated', and the centre column repeated the
wordmark already in the header.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 5: How payouts happen — full-bleed rail

The spec's §5.2. Three steps on a horizontal rail, full-bleed, breaking the `max-w-6xl` container every other section obeys.

**Files:**
- Modify: `components/landing/HowItWorks.tsx` (full rewrite)
- Test: `app/__tests__/landing.test.tsx` (existing order test survives; one new assertion)

**Interfaces:**
- Consumes: `Reveal` from `./Reveal`
- Produces: `<section id="how-it-works" data-testid="how-it-works" data-shape="rail">`

- [ ] **Step 1: Write the failing test**

```tsx
it('renders the payout steps on a full-bleed rail, not in a bordered card grid', () => {
  render(<LandingPage />)
  const steps = screen.getByTestId('how-it-works')
  expect(steps).toHaveAttribute('data-shape', 'rail')
  // The band itself is full-bleed: it must not be the element carrying the
  // page's standard max-width container.
  expect(steps.className).not.toMatch(/max-w-6xl/)
})
```

- [ ] **Step 2: Run it and watch it fail**

```bash
npx vitest run --no-file-parallelism app/__tests__/landing.test.tsx -t "full-bleed rail"
```

Expected: FAIL, "expected null to be 'rail'".

- [ ] **Step 3: Rewrite the section**

Replace all of `components/landing/HowItWorks.tsx`:

```tsx
import { Reveal } from './Reveal'

const STEPS = [
  {
    n: '01',
    heading: 'Lock the budget',
    body: 'The advertiser funds escrow before the offer is visible to anyone.',
  },
  {
    n: '02',
    heading: 'See the balance, promote',
    body: 'Affiliates read the real remaining balance, then take a tracking link.',
  },
  {
    n: '03',
    heading: 'Get paid on confirmation',
    body: 'Confirmed means paid. No NET-60, no minimum threshold.',
  },
] as const

/**
 * A full-bleed tinted band, deliberately ignoring the max-w-6xl container
 * every other section obeys. The three steps sit on a horizontal rail rather
 * than in three bordered boxes: the old version was one more equal-column
 * card grid in a page made entirely of equal-column card grids.
 *
 * The rail line is hidden below `sm`, where the steps stack and a horizontal
 * connector would point at nothing.
 */
export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      data-testid="how-it-works"
      data-shape="rail"
      className="border-b border-line bg-surface py-23"
    >
      <div className="mx-auto max-w-6xl px-4">
        <Reveal>
          <h2 className="text-[36px] font-semibold tracking-[-0.03em]">How payouts happen</h2>
        </Reveal>

        <ol className="relative mt-14 grid gap-9 sm:grid-cols-3">
          <span
            aria-hidden
            className="absolute left-[16%] right-[16%] top-[19px] hidden h-0.5 sm:block"
            style={{
              background:
                'linear-gradient(90deg, var(--color-escrow), var(--color-escrow) 66%, var(--color-inset))',
            }}
          />
          {STEPS.map((s, i) => (
            <li key={s.n} className="relative text-center">
              <Reveal delayMs={i * 80}>
                <span
                  className={`mx-auto mb-4 grid h-10 w-10 place-items-center rounded-full font-mono text-[13px] font-bold shadow-[0_0_0_7px_var(--color-surface)] ${
                    i === 2 ? 'border-2 border-inset bg-canvas text-text' : 'bg-escrow text-ink'
                  }`}
                >
                  {s.n}
                </span>
                <h3 className="text-[18px] font-semibold tracking-[-0.015em]">{s.heading}</h3>
                <p className="mx-auto mt-1.5 max-w-[26em] text-[14px] leading-relaxed text-muted">
                  {s.body}
                </p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Run the suite**

```bash
npx vitest run --no-file-parallelism
```

Expected: PASS. The existing `it('states the three steps in order', ...)` test still passes — the headings are unchanged.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Rebuild How payouts happen as a full-bleed rail

Three steps on a horizontal connector, breaking the max-w-6xl container
every other section obeys. It was previously one more equal-column card
grid in a page made entirely of equal-column card grids.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 6: Bento — merge the two duplicate sections

The spec's §5.3. `WhyNativness` ("See the money before you commit") and `WhatYouGet` ("See offer balances") say the same things in two consecutive equal-column grids. `WhyEscrow` is a 194px stub carrying two lines.

**Files:**
- Create: `components/landing/Bento.tsx`, `components/landing/BentoBrowsePreview.tsx`
- Delete: `components/landing/WhyNativness.tsx`, `components/landing/WhatYouGet.tsx`, `components/landing/WhyEscrow.tsx`
- Test: `app/__tests__/landing.test.tsx`

**Interfaces:**
- Consumes: `LandingIcon` with glyphs `lock`, `lightning`, `check`, `wallet`; `SEED_OFFERS`; `Money`; `OfferAvatar`; `shadow-card` / `shadow-card-lg` (Task 2)
- Produces: `<section data-testid="bento" data-shape="bento">`

- [ ] **Step 1: Write the failing test**

Replace the existing `it('renders the "Why Nativness" section between the hero and the problem cards', ...)` test with:

```tsx
// WhyNativness and WhatYouGet said the same things in two consecutive
// equal-column grids, so they merge into one bento. The property worth
// guarding is that no claim was lost in the merge, not that a section with
// a particular testid still exists.
it('keeps every merged claim in the bento, between the hero and the problem section', () => {
  render(<LandingPage />)
  const sections = Array.from(document.querySelector('main')?.children ?? [])
  const heroIdx = sections.findIndex((el) => el.getAttribute('data-testid') === 'hero')
  const bentoIdx = sections.findIndex((el) => el.getAttribute('data-testid') === 'bento')
  const problemIdx = sections.findIndex((el) => el.getAttribute('data-testid') === 'problem')
  expect(heroIdx).toBeGreaterThanOrEqual(0)
  expect(bentoIdx).toBeGreaterThan(heroIdx)
  expect(problemIdx).toBeGreaterThan(bentoIdx)

  const bento = screen.getByTestId('bento')
  expect(bento).toHaveAttribute('data-shape', 'bento')
  expect(bento).toHaveTextContent(/see the money before you commit/i)
  expect(bento).toHaveTextContent(/paid on confirmation/i)
  expect(bento).toHaveTextContent(/anyone can list/i)
  expect(bento).toHaveTextContent(/locked, not promised/i)
})
```

- [ ] **Step 2: Run it and watch it fail**

```bash
npx vitest run --no-file-parallelism app/__tests__/landing.test.tsx -t "merged claim"
```

Expected: FAIL, "Unable to find an element by: [data-testid="bento"]".

- [ ] **Step 3: Write the Browse preview**

Create `components/landing/BentoBrowsePreview.tsx`:

```tsx
import { Money } from '@/components/ui/Money'
import { OfferAvatar } from '@/components/ui/OfferAvatar'
import { SEED_OFFERS } from '@/lib/store'

/**
 * A miniature of the Browse grid, built from the same seeded offers /app
 * serves. This is the "show the product, don't describe it" pattern every
 * strong reference page uses, and it is why the bento's 2x2 cell exists.
 *
 * Presentation only: no links, no state, not interactive. The real grid is
 * one click away behind any CTA on the page.
 */
export function BentoBrowsePreview() {
  return (
    <div aria-hidden className="mt-3.5 grid min-h-0 flex-1 grid-rows-3 gap-2.5">
      {SEED_OFFERS.slice(0, 3).map((offer) => {
        const pct = Math.max(0, Math.min(100, (offer.escrowRemainingUsd / offer.escrowTotalUsd) * 100))
        return (
          <div
            key={offer.id}
            className="flex items-center gap-2.5 rounded-[9px] border border-line bg-surface px-3 py-2.5"
          >
            <OfferAvatar offer={offer} />
            <span className="min-w-0 flex-1 truncate text-[12px] font-semibold">{offer.name}</span>
            <Money value={offer.escrowRemainingUsd} className="text-[12px] font-bold" />
            <span className="h-1.5 w-13 shrink-0 overflow-hidden rounded-full bg-inset">
              <span className="block h-full rounded-full bg-escrow" style={{ width: `${pct}%` }} />
            </span>
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 4: Write the bento**

Create `components/landing/Bento.tsx`:

```tsx
import { LandingIcon, type LandingGlyph } from '@/components/ui/LandingIcon'
import { Reveal } from './Reveal'
import { BentoBrowsePreview } from './BentoBrowsePreview'

const CELLS: { heading: string; body: string; glyph: LandingGlyph; wide?: boolean }[] = [
  {
    heading: 'Paid on confirmation',
    body: 'Not on a schedule. No NET-30/NET-60, no minimum payout threshold.',
    glyph: 'lightning',
  },
  {
    heading: 'Locked, not promised',
    body: 'Funds can’t be pulled back out once an offer is live.',
    glyph: 'lock',
  },
  {
    heading: 'Anyone can list',
    body: 'No enterprise minimum, no sales call, no weeks-long approval.',
    glyph: 'check',
    wide: true,
  },
]

/**
 * Unequal cells, on purpose.
 *
 * This replaces WhyNativness and WhatYouGet, two consecutive sections that
 * made the same claims in the same equal-column grid, plus WhyEscrow, a
 * 194px band carrying two lines. The 2x2 cell holds a real miniature of the
 * Browse grid rather than more prose: the page's problem was never which
 * words it used.
 */
export function Bento() {
  return (
    <section data-testid="bento" data-shape="bento" className="border-b border-line py-23">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal className="mb-10 flex flex-col justify-between gap-3 sm:flex-row sm:items-end sm:gap-10">
          <h2 className="text-[36px] font-semibold tracking-[-0.03em]">One wallet, both sides</h2>
          <p className="max-w-[24em] text-[14px] leading-relaxed text-muted sm:text-right">
            One wallet. One login for both sides. The same wallet that promotes an offer today can
            fund one tomorrow.
          </p>
        </Reveal>

        <div className="grid auto-rows-[174px] grid-cols-2 gap-4 lg:grid-cols-4">
          <Reveal className="col-span-2 row-span-2 flex flex-col rounded-2xl border border-line bg-canvas p-6 shadow-card-lg">
            <h3 className="text-[18px] font-semibold tracking-[-0.015em]">
              See the money before you commit
            </h3>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">
              Every offer shows its live escrow balance, not a promise from an advertiser you’ve
              never worked with.
            </p>
            <BentoBrowsePreview />
          </Reveal>

          {CELLS.map((cell, i) => (
            <Reveal
              key={cell.heading}
              delayMs={(i + 1) * 70}
              className={`flex flex-col rounded-2xl border border-line bg-surface p-5 shadow-card transition hover:-translate-y-0.5 ${
                cell.wide ? 'col-span-2' : ''
              }`}
            >
              <span className="mb-auto grid h-9 w-9 place-items-center rounded-[10px] border border-inset bg-canvas">
                <LandingIcon glyph={cell.glyph} className="h-5 w-5 text-ink" />
              </span>
              <h3 className="mt-4 text-[16px] font-semibold tracking-[-0.015em]">{cell.heading}</h3>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">{cell.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 5: Delete the three replaced sections**

```bash
git rm components/landing/WhyNativness.tsx components/landing/WhatYouGet.tsx components/landing/WhyEscrow.tsx
```

- [ ] **Step 6: Wire it into the page**

In `app/page.tsx`, remove the `WhyNativness`, `WhatYouGet` and `WhyEscrow` imports and usages, and add `import { Bento } from '@/components/landing/Bento'` with `<Bento />` placed immediately after `<HowItWorks />`.

- [ ] **Step 7: Run the suite**

```bash
npx vitest run --no-file-parallelism
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "Merge two duplicate sections into one bento grid

WhyNativness and WhatYouGet made the same claims in two consecutive
equal-column grids; WhyEscrow was a 194px band carrying two lines. They
become one bento of unequal cells whose 2x2 holds a real miniature of
the Browse grid, built from the same seeded offers /app serves.

Every claim from the merged sections is asserted by the test that
replaced their old assertions.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 7: Problem — type split

The spec's §5.4. A 38px heading pinned left at 0.82fr, the three sourced facts small on the right at 1.18fr.

**Files:**
- Modify: `components/landing/Problem.tsx` (full rewrite)
- Test: `app/__tests__/landing.test.tsx` (the existing sourcing test must survive untouched)

**Interfaces:**
- Consumes: `LandingIcon` glyphs `clock`, `warning`; `Reveal`
- Produces: `<section data-testid="problem" data-shape="typesplit">`

- [ ] **Step 1: Write the failing test**

```tsx
it('sets the problem section as a type split, heading left', () => {
  render(<LandingPage />)
  expect(screen.getByTestId('problem')).toHaveAttribute('data-shape', 'typesplit')
})
```

- [ ] **Step 2: Run it and watch it fail**

```bash
npx vitest run --no-file-parallelism app/__tests__/landing.test.tsx -t "type split"
```

Expected: FAIL, "expected null to be 'typesplit'".

- [ ] **Step 3: Rewrite the section**

Replace all of `components/landing/Problem.tsx`:

```tsx
import { LandingIcon, type LandingGlyph } from '@/components/ui/LandingIcon'
import { Reveal } from './Reveal'

const FACTS: { heading: string; body: string; source: string; glyph: LandingGlyph }[] = [
  {
    heading: 'Paid in months, maybe.',
    body: 'Rakuten’s NET-60 rates 2.2/5 on Trustpilot; CJ Affiliate reports stuck commissions.',
    source: 'Source: Rakuten Advertising, Trustpilot; CJ Affiliate complaints',
    glyph: 'clock',
  },
  {
    heading: 'Smaller networks offer no recourse.',
    body: 'iGaming and dating networks are offshore, fragmented.',
    source: 'Source: Industry reporting',
    glyph: 'warning',
  },
  {
    heading: 'Networks disappear.',
    body: 'ShareASale folded into Awin, October 2025.',
    source: 'Source: ShareASale / Awin, October 2025',
    glyph: 'warning',
  },
]

/**
 * A type split: the heading is pinned left and set large, the evidence sits
 * small on the right. Nothing else on the page has this proportion, which is
 * the point.
 *
 * Every fact keeps its source line. These three claims are the only outside
 * credibility the page has, and the redesign must not weaken them.
 */
export function Problem() {
  return (
    <section
      data-testid="problem"
      data-shape="typesplit"
      className="border-b border-line bg-depleted/5 py-22"
    >
      <div className="mx-auto grid max-w-6xl items-start gap-10 px-4 lg:grid-cols-[0.82fr_1.18fr] lg:gap-18">
        <Reveal>
          <h2 className="text-[30px] font-semibold leading-[1.1] tracking-[-0.035em] sm:text-[38px]">
            Nobody has fixed affiliate trust.
          </h2>
          <p className="mt-3.5 text-[14px] leading-relaxed text-muted">
            Affiliates work first, trust comes after. Every fact here is sourced.
          </p>
        </Reveal>

        <div className="flex flex-col">
          {FACTS.map((fact, i) => (
            <Reveal
              key={fact.heading}
              delayMs={i * 70}
              className="border-t border-depleted/20 py-5 first:border-t-0 first:pt-0"
            >
              <h3 className="flex items-center gap-2.5 text-[17px] font-semibold tracking-[-0.015em]">
                <LandingIcon glyph={fact.glyph} className="h-5 w-5 shrink-0 text-depleted" />
                {fact.heading}
              </h3>
              <p className="mt-1.5 text-[14px] leading-relaxed text-muted">{fact.body}</p>
              <p className="mt-1.5 text-[11px] text-muted opacity-75">{fact.source}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Run the suite**

```bash
npx vitest run --no-file-parallelism
```

Expected: PASS. `it('attributes each problem claim to a named source', ...)` must still pass **unmodified** — it asserts `NET-60`, `2.2/5`, `Rakuten`, `Trustpilot`, `ShareASale`, `Awin`, `October 2025`, all of which survive above. If it fails, the rewrite dropped a fact: restore it rather than changing the test.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Rebuild the problem section as a type split

38px heading pinned left, evidence small on the right. No other section
has this proportion. Every fact keeps its source line, and the sourcing
test passes unmodified.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 8: Market — thin stat band

The spec's §5.5. A deliberate breather at `py-10` (40px), roughly a quarter the height of its neighbours.

**Files:**
- Modify: `components/landing/Market.tsx` (full rewrite)
- Test: `app/__tests__/landing.test.tsx` (the existing sourcing test must survive untouched)

**Interfaces:**
- Consumes: `Reveal`
- Produces: `<section data-testid="market" data-shape="band">`

- [ ] **Step 1: Write the failing test**

```tsx
it('renders the market figures as a thin band, not a card grid', () => {
  render(<LandingPage />)
  const market = screen.getByTestId('market')
  expect(market).toHaveAttribute('data-shape', 'band')
  // The breather: a quarter the vertical rhythm of its neighbours.
  expect(market.className).toMatch(/\bpy-10\b/)
})
```

- [ ] **Step 2: Run it and watch it fail**

```bash
npx vitest run --no-file-parallelism app/__tests__/landing.test.tsx -t "thin band"
```

Expected: FAIL, "expected null to be 'band'".

- [ ] **Step 3: Rewrite the section**

Replace all of `components/landing/Market.tsx`:

```tsx
import { Reveal } from './Reveal'

const FIGURES = [
  {
    value: '$19.4B',
    caption: 'Affiliate spend, up from $17.1B to $22B by 2027',
    source: 'Forrester',
  },
  {
    value: '$13.81B',
    caption: 'US spend, up 11.3% year over year',
    source: 'eMarketer',
  },
] as const

/**
 * The page's breather: 40px of vertical rhythm against the 88-92px every
 * section around it uses. Sitting between a tall bento and a tall closing
 * CTA, its shortness is what makes the page's rhythm legible. It is not
 * unfinished; it is the rest between two bars.
 *
 * Both figures keep their attribution inline.
 */
export function Market() {
  return (
    <section
      data-testid="market"
      data-shape="band"
      className="border-b border-line bg-escrow/[0.07] py-10"
    >
      <Reveal className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-14 gap-y-6 px-4">
        {FIGURES.map((figure) => (
          <p key={figure.value} className="flex items-baseline gap-3">
            <span className="font-mono tnum text-[30px] font-bold leading-none tracking-[-0.025em] text-ink">
              {figure.value}
            </span>
            <span className="max-w-[19em] text-[13px] leading-snug text-muted">
              {figure.caption} · {figure.source}
            </span>
          </p>
        ))}
        <span className="text-[11.5px] text-muted sm:ml-auto">Channel figures, not a forecast.</span>
      </Reveal>
    </section>
  )
}
```

- [ ] **Step 4: Run the suite**

```bash
npx vitest run --no-file-parallelism
```

Expected: PASS. `it('cites every market figure with its source', ...)` must still pass **unmodified** — it asserts `$19.4B`, `$17.1B`, `$22B`, `Forrester`, `$13.81B`, `11.3%`, `eMarketer`, all present above.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Rebuild Market as a thin stat band

40px of rhythm against the 88-92px around it. Between a tall bento and
a tall closing CTA, its shortness is what makes the page's rhythm
legible. Both figures keep their attribution.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 9: Assemble the page and enforce the governing rule

The spec's §4 and §5.6. `GetStarted` becomes the only centred section, and the design rule becomes a test.

**Files:**
- Modify: `app/page.tsx`, `components/landing/GetStarted.tsx`
- Create: `components/landing/__tests__/section-shapes.test.tsx`

**Interfaces:**
- Consumes: every section's `data-shape` from Tasks 4–8
- Produces: nothing downstream

- [ ] **Step 1: Write the failing test**

Create `components/landing/__tests__/section-shapes.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import LandingPage from '@/app/page'

/**
 * The governing rule from design.md §4, made mechanical.
 *
 * Before the redesign every section was `mx-auto max-w-6xl px-4 py-16`,
 * centred, separated by an identical border-t: eight instances of one shape,
 * which is what made the page read as stacked text. `data-shape` names each
 * section's layout archetype so the rule can be asserted rather than hoped
 * for.
 */
describe('Landing section shapes', () => {
  const shapesOf = () => {
    render(<LandingPage />)
    return Array.from(document.querySelector('main')?.children ?? [])
      .filter((el) => el.tagName === 'SECTION')
      .map((el) => el.getAttribute('data-shape'))
  }

  it('gives every section a declared shape', () => {
    const shapes = shapesOf()
    expect(shapes.length).toBeGreaterThanOrEqual(6)
    expect(shapes.filter((s) => s === null)).toHaveLength(0)
  })

  it('never places two sections of the same shape next to each other', () => {
    const shapes = shapesOf()
    for (let i = 1; i < shapes.length; i++) {
      expect(shapes[i], `sections ${i} and ${i + 1} share the shape "${shapes[i]}"`).not.toBe(
        shapes[i - 1],
      )
    }
  })

  it('centres exactly one section, so centring means something', () => {
    const shapes = shapesOf()
    expect(shapes.filter((s) => s === 'centred')).toHaveLength(1)
  })
})
```

- [ ] **Step 2: Run it and watch it fail**

```bash
npx vitest run --no-file-parallelism components/landing/__tests__/section-shapes.test.tsx
```

Expected: FAIL on the centred count — `GetStarted` has no `data-shape` yet.

- [ ] **Step 3: Mark the CTA section**

In `components/landing/GetStarted.tsx`, change the opening tag to:

```tsx
    <section
      id="get-started"
      data-testid="get-started"
      data-shape="centred"
      className="border-t border-line py-23"
    >
      <div className="mx-auto max-w-2xl px-4 text-center">
```

and change the `<h2>` size from `text-2xl` to `text-[36px] tracking-[-0.03em]`. Remove the now-duplicated `py-16` from the inner div.

- [ ] **Step 4: Assemble the page**

`app/page.tsx` should read exactly:

```tsx
import { AnnouncementBar } from '@/components/landing/AnnouncementBar'
import { Header } from '@/components/landing/Header'
import { Hero } from '@/components/landing/Hero'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { Bento } from '@/components/landing/Bento'
import { Problem } from '@/components/landing/Problem'
import { Market } from '@/components/landing/Market'
import { GetStarted } from '@/components/landing/GetStarted'
import { Footer } from '@/components/landing/Footer'

export default function LandingPage() {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <Bento />
        <Problem />
        <Market />
        <GetStarted />
        <Footer />
      </main>
    </>
  )
}
```

Shape order: `split, rail, bento, typesplit, band, centred` — six sections, no two adjacent alike.

- [ ] **Step 5: Run the full suite**

```bash
npx vitest run --no-file-parallelism
```

Expected: PASS, all files.

- [ ] **Step 6: Lint, typecheck, build**

```bash
npm run lint && npx tsc --noEmit && npm run build
```

Expected: all clean.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "Assemble the six-section landing page and test the rule

Shape order is split, rail, bento, typesplit, band, centred: six
sections, no two adjacent alike. GetStarted becomes the only centred
section, which is what gives centring meaning.

data-shape makes design.md's governing rule mechanical rather than
aspirational: a test asserts every section declares a shape, no two
neighbours share one, and exactly one is centred.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 10: Verify in a browser and re-measure

The spec's §9 and §11. Nothing here is optional: the previous redesign shipped a bug (36 elements permanently invisible) that every test passed through, because jsdom has no layout.

**Files:** none modified unless a check fails

- [ ] **Step 1: Start the dev server**

Run in a terminal the user can see (backgrounded processes are cleaned up at turn end):

```bash
npm run dev
```

- [ ] **Step 2: Check every section renders and reveals**

Open `http://localhost:3000` at 1440×900. Scroll the full page **slowly**, then reload and scroll **fast** to the bottom. `Reveal` uses `IntersectionObserver` plus a rect check; a fast scroll past previously left elements at `opacity: 0` forever.

Confirm: all six sections visible, no element stuck faded, the hero demo draining, the payout event appearing.

- [ ] **Step 3: Re-measure contrast against the new tinted bands**

With the page open, run in the browser console:

```js
function srgb(c){c/=255;return c<=0.03928?c/12.92:Math.pow((c+0.055)/1.055,2.4)}
function lum(r){return 0.2126*srgb(r[0])+0.7152*srgb(r[1])+0.0722*srgb(r[2])}
function parse(s){const m=s.match(/rgba?\(([^)]+)\)/);if(!m)return null;const p=m[1].split(',').map(parseFloat);return{rgb:[p[0],p[1],p[2]],a:p.length>3?p[3]:1}}
function bgOf(el){let n=el;while(n&&n!==document.documentElement){const c=parse(getComputedStyle(n).backgroundColor);if(c&&c.a>0.95)return c.rgb;n=n.parentElement}return[255,255,255]}
function ratio(f,b){const a=lum(f),c=lum(b);return (Math.max(a,c)+0.05)/(Math.min(a,c)+0.05)}
const fails=[];
for(const el of document.querySelectorAll('main *')){
  if(![...el.childNodes].some(n=>n.nodeType===3&&n.textContent.trim()))continue;
  const cs=getComputedStyle(el),fc=parse(cs.color);if(!fc)continue;
  const fs=parseFloat(cs.fontSize),fw=+cs.fontWeight||400;
  const need=(fs>=24||(fs>=18.66&&fw>=700))?3:4.5;
  const cr=ratio(fc.rgb,bgOf(el));
  if(cr<need)fails.push({txt:el.textContent.trim().slice(0,40),ratio:+cr.toFixed(2),need,fs});
}
console.table(fails); fails.length
```

Expected: `0`. The tinted bands (`bg-surface`, `bg-depleted/5`, `bg-escrow/[0.07]`) and the bento's `bg-canvas` cell against its `bg-surface` siblings are all new backgrounds that the previous audit never measured.

- [ ] **Step 4: Check the glow does not sit under text**

```js
const h1 = document.querySelector('h1').getBoundingClientRect();
const glow = document.querySelector('[data-testid=hero] [aria-hidden].pointer-events-none').getBoundingClientRect();
({ overlaps: !(glow.left > h1.right || glow.right < h1.left) })
```

Expected: `{ overlaps: false }`. If true, the headline sits over the gradient and step 3's measurement is unreliable — pull the glow further right.

- [ ] **Step 5: Check mobile and the narrowest case**

Set the viewport to 375×812, then 320×700. Confirm: no horizontal overflow (`document.documentElement.scrollWidth <= innerWidth`), the hero stacks with the demo below the copy, the bento drops to two columns, the rail's connector line is hidden.

- [ ] **Step 6: Re-measure the SLI**

```bash
npm run build && node scripts/measure-sli.mjs
```

Expected: Landing JS below the Task 1 figure from `/tmp/sli-after.txt`, and far below the 1,074 KB baseline. **If Landing JS is worse than the Task 1 measurement, stop and report** rather than committing.

- [ ] **Step 7: Full gate**

```bash
npx vitest run --no-file-parallelism && npm run lint && npx tsc --noEmit
```

Expected: all clean.

- [ ] **Step 8: Commit any fixes**

```bash
git add -A
git commit -m "Fix issues found verifying the landing redesign in a browser

<describe what was actually found; if nothing was, skip this commit>

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Self-Review

**Spec coverage.** Every section of `design.md` maps to a task: §1 diagnosis → the whole plan; §3 decisions → Global Constraints; §4 governing rule → Task 9's `section-shapes.test.tsx`; §5.1–5.6 → Tasks 4, 5, 6, 7, 8, 9; §6 `LiveEscrowDemo` → Task 3; §7 type scale → Tasks 2, 4–9 (applied per section); §8 depth → Task 2 tokens, consumed in Tasks 3 and 6; §9 performance → Task 1 (with its gate) and Task 10 step 6; §10 testing → the test steps throughout, with the seven must-not-change tests named in Global Constraints and re-verified in Tasks 7 and 8; §11 accessibility → Task 10 steps 3–5; §12 risks → the Task 1 gate and the Task 10 stop condition; §13 out of scope → not implemented, correctly.

**Type consistency.** `LoginCta` is an anchor from Task 1 onward, and every later assertion uses `getByRole('link')`, never `'button'`. `data-shape` values are fixed: `split`, `rail`, `bento`, `typesplit`, `band`, `centred` — the same six strings in Tasks 4–9. `LiveEscrowDemo` exposes `data-testid="live-escrow-demo"` (Task 3) and is queried by that exact string in Task 4. `shadow-card` / `shadow-card-lg` are defined in Task 2 and used in Tasks 3 and 6 under those names.

**One scope note for the executor.** Task 1 changes behaviour, not just bundle size: the landing page's CTAs stop opening a wallet modal in place and become links into `/app`. This is the correct fix — it is what removes the adapter from a static page — and it improves the flow, since `ConnectGate` already presents sign-in properly. But it is a user-visible change beyond pure layout, so surface it at the Task 1 review rather than sliding it through.
