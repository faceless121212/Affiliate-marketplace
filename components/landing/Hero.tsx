import { Badge } from '@/components/ui/Badge'
import { HeroCenter } from './HeroCenter'
import { HeroOfferCard } from './HeroOfferCard'
import { LoginCta } from './LoginCta'

const ADVERTISER_CHIPS = ['Budget locked before listing', 'Paid on confirmation', 'Any niche']
const AFFILIATE_CHIPS = ['Balance visible before you promote', 'Paid on confirmation', 'Any niche']

const CTA_CLASS = 'px-7 py-3.5 text-[15px]'

export function Hero() {
  return (
    <section data-testid="hero" className="mx-auto max-w-6xl px-4 py-16 lg:py-20">
      <div className="grid gap-10 lg:grid-cols-[1fr_0.7fr_1fr] lg:gap-6">
        {/* Left — advertisers ("affiliate platforms" in the owner's words). Amber, escrow-toned. */}
        <div>
          {/* Lime as text is illegible on white (~1.2:1) — the audience tag
              now carries the colour as a small fill swatch instead, with the
              label itself in legible black. */}
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-text">
            <span className="h-1.5 w-4 rounded-full bg-escrow" aria-hidden />
            For affiliate platforms
          </p>
          <h1 className="mt-3 text-[30px] font-bold leading-[1.08] tracking-tight sm:text-[36px]">
            Fund it. Affiliates will trust you.
          </h1>
          <p className="mt-3 text-[14px] leading-relaxed text-muted">
            List in any niche — ecommerce, iGaming, dating, SaaS. Your budget locks in escrow
            before affiliates ever see the offer.
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
              Connect a wallet — that’s the signup.
            </p>
          </div>

          <HeroOfferCard />
        </div>

        {/* Centre — narrow, restrained. Reads last on mobile. */}
        <HeroCenter />

        {/* Right — affiliates. Green, paid-toned. Default source order already
            places this third on mobile (after the centre column is pushed
            last) and third in the desktop grid — no order override needed. */}
        <div>
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-paid">
            <span className="h-1.5 w-4 rounded-full bg-paid" aria-hidden />
            For affiliates
          </p>
          <h1 className="mt-3 text-[30px] font-bold leading-[1.08] tracking-tight sm:text-[36px]">
            See the money before you click.
          </h1>
          <p className="mt-3 text-[14px] leading-relaxed text-muted">
            Browse offers with the balance visible. Generate your link, and get paid the instant a
            conversion confirms — no NET-60, no investigation.
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
              Devnet — nothing real is at risk.
            </p>
          </div>
        </div>
      </div>

      <p className="mt-10 text-center text-[12px] text-muted">
        One wallet. One login for both sides — no second signup.
      </p>
    </section>
  )
}
