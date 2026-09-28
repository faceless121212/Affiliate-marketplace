import { Badge } from '@/components/ui/Badge'
import { LandingIcon } from '@/components/ui/LandingIcon'
import { HeroCenter } from './HeroCenter'
import { LoginCta } from './LoginCta'

const ADVERTISER_CHIPS = ['Any niche']
const AFFILIATE_CHIPS = ['Any niche']

/**
 * One primary action, not two. "Get started" points at the `GetStarted`
 * section below (`#get-started`), where the actual wallet-connect decision
 * lives with proper framing copy; the secondary link is a lower-commitment
 * escape hatch straight to the browse view, wired through the same
 * `LoginCta` front door as everything else on this page.
 *
 * Its label is "Browse offers", the same words the persona picker uses for
 * the same destination. The page deliberately keeps one label per
 * destination so a repeated button teaches rather than re-asks, which is
 * what `landing.test.tsx` asserts as a 1:1 label/destination mapping.
 */
export function Hero() {
  return (
    <section data-testid="hero" className="mx-auto max-w-6xl px-4 py-16 lg:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-[32px] font-bold leading-[1.08] tracking-tight sm:text-[42px]">
          Escrow first. Trust follows.
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-muted">
          Nativness is the affiliate marketplace where the budget is locked before the offer goes
          live, so affiliates see a guaranteed balance instead of a promise, and advertisers
          don’t need a reputation to get taken seriously.
        </p>

        <div className="mt-6 flex flex-col items-center gap-2">
          <a
            href="#get-started"
            data-testid="hero-primary-cta"
            className="rounded-[8px] bg-escrow px-7 py-3.5 text-[15px] font-semibold text-ink transition hover:brightness-95"
          >
            Get started
          </a>
          <LoginCta destination="/app" variant="ghost" className="px-0 py-0 text-[13px]">
            Browse offers
          </LoginCta>
        </div>
      </div>

      {/* A symmetric three-up row: the two audience statements carry equal
          weight on either side of the escrow counter. Aligned to a shared
          top edge, not vertically centred: the centre column is taller than
          the two beside it, so centring left the side columns floating at
          an offset that read as a layout accident rather than a
          composition. `items-start` gives all three one line to start on. */}
      <div className="mt-10 grid items-start gap-8 lg:grid-cols-3 lg:gap-6">
        {/* Left: advertisers ("affiliate platforms" in the owner's words). Amber, escrow-toned. */}
        <div>
          {/* Lime as text is illegible on white (~1.2:1). The audience tag
              carries the colour as a small fill swatch instead, with the
              label itself in legible black. */}
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-text">
            <span className="h-1.5 w-4 rounded-full bg-escrow" aria-hidden />
            For affiliate platforms
          </p>
          <p className="mt-3 flex items-start gap-2 text-[14px] leading-relaxed text-muted">
            <LandingIcon glyph="lock" className="mt-0.5 h-5 w-5 shrink-0 text-ink" />
            Your budget locks in escrow first.
          </p>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {ADVERTISER_CHIPS.map((chip) => (
              <Badge key={chip} tone="escrow">
                {chip}
              </Badge>
            ))}
          </div>
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
          <p className="mt-3 flex items-start gap-2 text-[14px] leading-relaxed text-muted">
            <LandingIcon glyph="lightning" className="mt-0.5 h-5 w-5 shrink-0 text-paid" />
            Get paid the instant it confirms.
          </p>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {AFFILIATE_CHIPS.map((chip) => (
              <Badge key={chip} tone="paid">
                {chip}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-10 text-center text-[12px] text-muted">
        One wallet. One login for both sides.
      </p>
    </section>
  )
}
