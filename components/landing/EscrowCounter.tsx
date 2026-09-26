'use client'

import { Money } from '@/components/ui/Money'
import { SEED_OFFERS } from '@/lib/store'
import { useCountUp } from '@/lib/useCountUp'

const TOTAL_LOCKED_USD = SEED_OFFERS.reduce((sum, offer) => sum + offer.escrowTotalUsd, 0)

/**
 * The hero's live number — not invented, and not a claim about Nativness's
 * growth. It is the sum of the six seeded demo offers' escrow budgets from
 * `@/lib/store`, counted up on load and labelled honestly as the demo
 * marketplace's total: Phase 1 escrow is a number in `localStorage`, not an
 * on-chain fact.
 */
export function EscrowCounter() {
  const value = useCountUp(TOTAL_LOCKED_USD)

  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-10 -z-10 rounded-full bg-[radial-gradient(circle,var(--color-escrow)_0%,transparent_70%)] opacity-20 blur-2xl"
      />
      <p className="text-[11px] uppercase tracking-wide text-muted">Locked in escrow right now</p>
      <Money
        value={value}
        tone="escrow"
        className="text-[38px] font-bold leading-none sm:text-[46px]"
      />
      <p className="mt-1 max-w-[220px] text-[11px] leading-snug text-muted">
        The demo marketplace’s six seeded offers — simulated in this browser, not on-chain.
      </p>
    </div>
  )
}
