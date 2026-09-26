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
        <h3 className="min-w-0 truncate text-[15px] font-semibold leading-tight">{offer.name}</h3>
        {offer.verified && <Badge tone="paid">Verified</Badge>}
      </div>
      <p className="mb-4 text-[12px] text-muted">{category}</p>

      {/* Escrow leads the card — it's the guaranteed balance, not a promise,
          so it carries the most visual weight of anything here. */}
      <EscrowMeter offer={offer} />
      <p className="mt-1.5 font-mono tnum text-[10.5px] text-muted">
        {offer.status === 'depleted'
          ? 'Escrow empty'
          : `${fundable} conversion${fundable === 1 ? '' : 's'} funded`}
      </p>

      {/* CPA is supporting detail beneath the escrow figure, not the headline —
          the border now separates the meter from this footer instead of framing CPA. */}
      <div className="mt-3 flex items-baseline justify-between border-t border-line pt-2">
        <span className="text-[11.5px] text-muted">CPA per conversion</span>
        <Money value={offer.commissionAmountUsd} className="text-[13px]" />
      </div>
    </Link>
  )
}
