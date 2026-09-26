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
