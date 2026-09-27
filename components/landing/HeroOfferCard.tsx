import { Badge } from '@/components/ui/Badge'
import { CategoryIcon } from '@/components/ui/CategoryIcon'
import { Money } from '@/components/ui/Money'
import { EscrowMeter } from '@/components/app/EscrowMeter'
import type { Offer } from '@/lib/types'

/**
 * A representative offer, shaped exactly like a real `Offer`, so this card
 * can render the app's actual `EscrowMeter` instead of a redrawn lookalike.
 * Not a seeded offer, just illustrative numbers for the front door.
 */
const SAMPLE_OFFER: Offer = {
  id: 'sample',
  advertiserWallet: '',
  name: 'Drayton Supply Co.',
  description: '',
  category: 'ecommerce',
  commissionAmountUsd: 24,
  conversionTerms: '',
  targetUrl: '',
  escrowTotalUsd: 500,
  escrowRemainingUsd: 340,
  verified: true,
  status: 'active',
  createdAt: '',
}

/**
 * The hero's showcase offer card. Illustrative, not a seeded offer, but it
 * shares the same `EscrowMeter` component and the same fundable-conversions
 * calculation as `components/app/OfferCard.tsx`, so the numbers stay honest
 * if `SAMPLE_OFFER` above is ever edited. `animateFill` gives this one card
 * a fill-on-mount instead of rendering already full.
 */
export function HeroOfferCard() {
  const fundable = Math.floor(SAMPLE_OFFER.escrowRemainingUsd / SAMPLE_OFFER.commissionAmountUsd)

  return (
    <div className="mt-8 rounded-lg border border-line bg-surface p-4 transition-colors duration-300 hover:border-escrow/40 hover:bg-escrow/5">
      <div className="mb-0.5 flex items-start justify-between gap-2">
        <h2 className="min-w-0 truncate text-[15px] font-semibold leading-tight">
          {SAMPLE_OFFER.name}
        </h2>
        <Badge tone="paid">Verified</Badge>
      </div>
      <p className="mb-4 flex items-center gap-1.5 text-[12px] text-muted">
        <CategoryIcon category={SAMPLE_OFFER.category} />
        Ecommerce
      </p>

      <EscrowMeter offer={SAMPLE_OFFER} animateFill />
      <p className="mt-1.5 font-mono tnum text-[10.5px] text-muted">
        {fundable} conversion{fundable === 1 ? '' : 's'} funded
      </p>

      <div className="mt-3 flex items-baseline justify-between border-t border-line pt-2">
        <span className="text-[11.5px] text-muted">Per conversion</span>
        <Money value={SAMPLE_OFFER.commissionAmountUsd} className="text-[13px]" />
      </div>
    </div>
  )
}
