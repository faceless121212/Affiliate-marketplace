import { Badge } from '@/components/ui/Badge'
import { Money } from '@/components/ui/Money'
import { EscrowMeter } from '@/components/app/EscrowMeter'
import type { Offer } from '@/lib/types'
import { LoginCta } from './LoginCta'

/**
 * A representative offer, shaped exactly like a real `Offer`, so the hero
 * card can render the app's actual `EscrowMeter` instead of a redrawn
 * lookalike. Not a seeded offer — just illustrative numbers for the front door.
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

      {/* A real card from the app, not an illustration of one — same markup
          and the same EscrowMeter component as components/app/OfferCard.tsx. */}
      <div className="rounded-md border border-line bg-surface p-4 sm:max-w-sm sm:justify-self-end">
        <div className="mb-0.5 flex items-start justify-between gap-2">
          <h2 className="min-w-0 truncate text-[15px] font-semibold leading-tight">
            {SAMPLE_OFFER.name}
          </h2>
          <Badge tone="paid">Verified</Badge>
        </div>
        <p className="mb-4 text-[12px] text-muted">Ecommerce</p>

        <EscrowMeter offer={SAMPLE_OFFER} />
        <p className="mt-1.5 font-mono tnum text-[10.5px] text-muted">14 conversions funded</p>

        <div className="mt-3 flex items-baseline justify-between border-t border-line pt-2">
          <span className="text-[11.5px] text-muted">CPA per conversion</span>
          <Money value={SAMPLE_OFFER.commissionAmountUsd} className="text-[13px]" />
        </div>
      </div>
    </section>
  )
}
