import { Badge } from '@/components/ui/Badge'
import { CategoryIcon } from '@/components/ui/CategoryIcon'
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

const ADVERTISER_CHIPS = ['Budget locked before listing', 'Paid on confirmation', 'Any niche']
const AFFILIATE_CHIPS = ['Balance visible before you promote', 'Paid on confirmation', 'Any niche']

export function Hero() {
  const fundable = Math.floor(SAMPLE_OFFER.escrowRemainingUsd / SAMPLE_OFFER.commissionAmountUsd)

  return (
    <section data-testid="hero" className="mx-auto max-w-6xl px-4 py-16 lg:py-20">
      <div className="grid gap-10 lg:grid-cols-[1fr_0.7fr_1fr] lg:gap-6">
        {/* Left — advertisers ("affiliate platforms" in the owner's words). Amber, escrow-toned. */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-escrow">
            For affiliate platforms
          </p>
          <h1 className="mt-3 text-[28px] font-semibold leading-[1.15] tracking-tight sm:text-[32px]">
            Fund the offer before anyone can see it.
          </h1>
          <p className="mt-3 text-[14px] leading-relaxed text-muted">
            List in any niche — ecommerce, iGaming, dating, SaaS. Your commission budget sits in
            escrow the moment you create the offer, so affiliates only ever see a balance that is
            already funded.
          </p>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {ADVERTISER_CHIPS.map((chip) => (
              <Badge key={chip} tone="escrow">
                {chip}
              </Badge>
            ))}
          </div>

          <div className="mt-6">
            <LoginCta destination="/app/my-offers" variant="primary">
              List an offer
            </LoginCta>
          </div>

          {/* Illustrative, not a seeded offer — but it shares the same EscrowMeter
              component and the same fundable-conversions calculation as
              components/app/OfferCard.tsx, so the numbers stay honest if the
              sample offer above is ever edited. */}
          <div className="mt-8 rounded-md border border-line bg-surface p-4">
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

            <EscrowMeter offer={SAMPLE_OFFER} />
            <p className="mt-1.5 font-mono tnum text-[10.5px] text-muted">
              {fundable} conversion{fundable === 1 ? '' : 's'} funded
            </p>

            <div className="mt-3 flex items-baseline justify-between border-t border-line pt-2">
              <span className="text-[11.5px] text-muted">CPA per conversion</span>
              <Money value={SAMPLE_OFFER.commissionAmountUsd} className="text-[13px]" />
            </div>
          </div>
        </div>

        {/* Centre — narrow, restrained. Reads last on mobile. */}
        <div className="order-last flex flex-col items-center gap-4 text-center lg:order-none lg:justify-self-center lg:self-start lg:pt-2">
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            <Badge>Solana</Badge>
            <Badge>Devnet</Badge>
            <Badge>CPA</Badge>
          </div>
          <p className="text-[17px] font-semibold tracking-tight">Nativness</p>
          <a href="#how-it-works" className="text-[12px] text-muted hover:text-text">
            See how it works
          </a>
        </div>

        {/* Right — affiliates. Green, paid-toned. Default source order already
            places this third on mobile (after the centre column is pushed
            last) and third in the desktop grid — no order override needed. */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-paid">
            For affiliates
          </p>
          <h1 className="mt-3 text-[28px] font-semibold leading-[1.15] tracking-tight sm:text-[32px]">
            Promote knowing the payout is already there.
          </h1>
          <p className="mt-3 text-[14px] leading-relaxed text-muted">
            Browse offers with the escrow balance visible, generate a tracking link tied to your
            own wallet, and get paid the moment a conversion is confirmed.
          </p>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {AFFILIATE_CHIPS.map((chip) => (
              <Badge key={chip} tone="paid">
                {chip}
              </Badge>
            ))}
          </div>

          <div className="mt-6">
            <LoginCta destination="/app" variant="paid">
              Browse offers
            </LoginCta>
          </div>
        </div>
      </div>

      <p className="mt-10 text-center text-[12px] text-muted">
        One wallet is one login for both sides — there’s no separate advertiser account and no
        second signup.
      </p>
    </section>
  )
}
