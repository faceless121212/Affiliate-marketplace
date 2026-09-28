'use client'

import { Money } from '@/components/ui/Money'
import { SEED_OFFERS } from '@/lib/store'
import { useCountUp } from '@/lib/useCountUp'

const TOTAL_LOCKED_USD = SEED_OFFERS.reduce((sum, offer) => sum + offer.escrowTotalUsd, 0)

/**
 * The hero's live number: not invented, and not a claim about Nativness's
 * growth. It is the sum of the six seeded demo offers' escrow budgets from
 * `@/lib/store`, counted up on load and labelled honestly as the demo
 * marketplace's total. Phase 1 escrow is a number in `localStorage`, not an
 * on-chain fact.
 */
export function EscrowCounter() {
  const value = useCountUp(TOTAL_LOCKED_USD)

  return (
    // Deliberately smaller than the h1 above it (26/30px against 32/42px).
    // At its old 38/46px this was the largest element on the page, which
    // meant the first thing a visitor read was a number whose own caption
    // says it is simulated. The headline makes the argument; this supports
    // it. The lime radial glow this had on dark is dropped rather than
    // re-tuned: on white it only muddied the figure underneath.
    <div className="relative">
      <p className="text-[11px] uppercase tracking-wide text-muted">In escrow now</p>
      <Money
        value={value}
        tone="escrow"
        className="text-[26px] font-bold leading-none sm:text-[30px]"
      />
      <p className="mt-1 max-w-[220px] text-[11px] leading-snug text-muted">
        Simulated, not on-chain.
      </p>
    </div>
  )
}
