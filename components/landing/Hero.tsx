import { Badge } from '@/components/ui/Badge'
import { LandingIcon } from '@/components/ui/LandingIcon'
import { HeroCenter } from './HeroCenter'
import { HeroOfferCard } from './HeroOfferCard'
import { LoginCta } from './LoginCta'

const ADVERTISER_CHIPS = ['Any niche']
const AFFILIATE_CHIPS = ['Any niche']

const CTA_CLASS = 'px-7 py-3.5 text-[15px]'

export function Hero() {
  return (
    <section data-testid="hero" className="mx-auto max-w-6xl px-4 py-16 lg:py-20">
      <div className="grid gap-10 lg:grid-cols-[1fr_0.7fr_1fr] lg:gap-6">
        {/* Left: advertisers ("affiliate platforms" in the owner's words). Amber, escrow-toned. */}
        <div>
          {/* Lime as text is illegible on white (~1.2:1). The audience tag
              now carries the colour as a small fill swatch instead, with the
              label itself in legible black. */}
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-text">
            <span className="h-1.5 w-4 rounded-full bg-escrow" aria-hidden />
            For affiliate platforms
          </p>
          <h1 className="mt-3 text-[30px] font-bold leading-[1.08] tracking-tight sm:text-[36px]">
            Fund it. Affiliates will trust you.
          </h1>
          <p className="mt-3 flex items-start gap-1.5 text-[14px] leading-relaxed text-muted">
            <LandingIcon glyph="lock" className="mt-0.5 h-4 w-4 shrink-0 text-escrow" />
            Your budget locks in escrow first.
          </p>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {ADVERTISER_CHIPS.map((chip) => (
              <Badge key={chip} tone="escrow">
                {chip}
              </Badge>
            ))}
          </div>

          <div className="mt-6">
            <LoginCta destination="/app/my-offers" variant="primary" className={CTA_CLASS}>
              List an offer
            </LoginCta>
            <p className="mt-2 text-[12px] text-muted">
              Connect a wallet to start.
            </p>
          </div>

          <HeroOfferCard />
        </div>

        {/* Centre: narrow, restrained. Reads last on mobile. */}
        <HeroCenter />

        {/* Right: affiliates. Green, paid-toned. Default source order already
            places this third on mobile (after the centre column is pushed
            last) and third in the desktop grid, so no order override is needed. */}
        <div>
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-paid">
            <span className="h-1.5 w-4 rounded-full bg-paid" aria-hidden />
            For affiliates
          </p>
          <h1 className="mt-3 text-[30px] font-bold leading-[1.08] tracking-tight sm:text-[36px]">
            See the money before you click.
          </h1>
          <p className="mt-3 flex items-start gap-1.5 text-[14px] leading-relaxed text-muted">
            <LandingIcon glyph="lightning" className="mt-0.5 h-4 w-4 shrink-0 text-paid" />
            Get paid the instant it confirms.
          </p>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {AFFILIATE_CHIPS.map((chip) => (
              <Badge key={chip} tone="paid">
                {chip}
              </Badge>
            ))}
          </div>

          <div className="mt-6">
            <LoginCta destination="/app" variant="primary" className={CTA_CLASS}>
              Browse offers
            </LoginCta>
            <p className="mt-2 text-[12px] text-muted">
              Devnet only.
            </p>
          </div>
        </div>
      </div>

      <p className="mt-10 text-center text-[12px] text-muted">
        One wallet. One login for both sides.
      </p>
    </section>
  )
}
