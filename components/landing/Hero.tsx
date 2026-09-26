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
          <p className="text-[11px] font-semibold uppercase tracking-wide text-escrow">
            For affiliate platforms
          </p>
          <h1 className="mt-3 text-[30px] font-bold leading-[1.08] tracking-tight sm:text-[36px]">
            No proof of funds, no affiliate will risk sending you traffic.
          </h1>
          <p className="mt-3 text-[14px] leading-relaxed text-muted">
            List in any niche — ecommerce, iGaming, dating, SaaS. Lock your commission budget in
            escrow the moment you create the offer, so affiliates see a guaranteed balance instead
            of a promise from a stranger.
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
              Connecting a wallet is the whole signup — seconds, not a form.
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
          <p className="text-[11px] font-semibold uppercase tracking-wide text-paid">
            For affiliates
          </p>
          <h1 className="mt-3 text-[30px] font-bold leading-[1.08] tracking-tight sm:text-[36px]">
            Promote on a promise, and you might not get paid at all.
          </h1>
          <p className="mt-3 text-[14px] leading-relaxed text-muted">
            Browse offers with the escrow balance visible before you send a single click,
            generate a tracking link tied to your own wallet, and get paid the instant a
            conversion is confirmed — no NET-60, no “under investigation.”
          </p>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {AFFILIATE_CHIPS.map((chip) => (
              <Badge key={chip} tone="paid">
                {chip}
              </Badge>
            ))}
          </div>

          <div className="mt-6">
            <LoginCta destination="/app" variant="paid" className={CTA_CLASS}>
              Browse offers
            </LoginCta>
            <p className="mt-2 text-[12px] text-muted">
              Devnet means nothing real is at risk while you look around.
            </p>
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
