import { Money } from '@/components/ui/Money'
import type { Offer } from '@/lib/types'

export function EscrowMeter({
  offer,
  showLabel = true,
}: {
  offer: Offer
  showLabel?: boolean
}) {
  const pct = offer.escrowTotalUsd
    ? Math.max(0, Math.min(100, (offer.escrowRemainingUsd / offer.escrowTotalUsd) * 100))
    : 0
  const empty = offer.status === 'depleted'

  return (
    <div>
      {showLabel && <span className="text-[11.5px] text-muted">Escrow remaining</span>}
      {/* The remainder is the trust signal: largest, boldest figure on the card.
          The total is context for it, not a peer: small and muted. flex-wrap keeps
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
      {/* `bg-inset` (#E5E5E5), not `bg-line` (#F0F0F0): the track needs to
          read as a groove against the card's own #FAFAFA surface, which
          `line` is too close to. */}
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-inset">
        <div
          className={`h-full rounded-full transition-[width] duration-700 ease-out motion-reduce:transition-none ${empty ? 'bg-depleted' : 'bg-escrow'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
