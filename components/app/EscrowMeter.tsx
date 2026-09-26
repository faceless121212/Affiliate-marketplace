'use client'

import { useEffect, useState } from 'react'
import { Money } from '@/components/ui/Money'
import type { Offer } from '@/lib/types'

export function EscrowMeter({
  offer,
  showLabel = true,
  animateFill = false,
}: {
  offer: Offer
  showLabel?: boolean
  /** Fills the bar from 0 on mount instead of rendering it already full — the
   *  hero's one showcase card asks for this; ordinary offer cards don't. */
  animateFill?: boolean
}) {
  const pct = offer.escrowTotalUsd
    ? Math.max(0, Math.min(100, (offer.escrowRemainingUsd / offer.escrowTotalUsd) * 100))
    : 0
  const empty = offer.status === 'depleted'

  // Starts at 0 and is pushed to `pct` in an effect so the CSS width
  // transition below has something to animate. `motion-reduce:transition-none`
  // means a reduced-motion viewer still only ever sees the final width — the
  // 0-to-pct jump happens with no transition to render, so nothing moves.
  const [barPct, setBarPct] = useState(animateFill ? 0 : pct)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncs the bar's rendered width to the offer's current pct, deliberately one tick after the initial 0 so the CSS width transition has a change to animate.
    setBarPct(pct)
  }, [pct])

  return (
    <div>
      {showLabel && <span className="text-[11.5px] text-muted">Escrow remaining</span>}
      {/* The remainder is the trust signal: largest, boldest figure on the card.
          The total is context for it, not a peer — small and muted. flex-wrap keeps
          this from overflowing a narrow sidebar (the offer-detail aside is ~320px). */}
      <div className={`flex flex-wrap items-baseline gap-x-1.5 ${showLabel ? 'mt-0.5' : ''}`}>
        <Money
          value={offer.escrowRemainingUsd}
          tone={empty ? 'depleted' : 'escrow'}
          className="text-[21px] font-bold"
        />
        <span className="font-mono tnum text-[12px] text-muted">
          / <Money value={offer.escrowTotalUsd} tone="muted" className="text-[12px]" />
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-sm bg-line">
        <div
          className={`h-full transition-[width] duration-700 ease-out motion-reduce:transition-none ${empty ? 'bg-depleted' : 'bg-escrow'}`}
          style={{ width: `${barPct}%` }}
        />
      </div>
    </div>
  )
}
