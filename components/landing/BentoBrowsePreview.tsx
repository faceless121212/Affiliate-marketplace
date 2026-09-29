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
        const pct =
          offer.escrowTotalUsd > 0
            ? Math.max(0, Math.min(100, (offer.escrowRemainingUsd / offer.escrowTotalUsd) * 100))
            : 0
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
