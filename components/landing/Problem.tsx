import { LandingIcon, type LandingGlyph } from '@/components/ui/LandingIcon'
import { Reveal } from './Reveal'

const FACTS: { heading: string; body: string; source: string; glyph: LandingGlyph }[] = [
  {
    heading: 'Paid in months, maybe.',
    body: 'Rakuten’s NET-60 rates 2.2/5 on Trustpilot; CJ Affiliate reports stuck commissions.',
    source: 'Source: Rakuten Advertising, Trustpilot; CJ Affiliate complaints',
    glyph: 'clock',
  },
  {
    heading: 'Smaller networks offer no recourse.',
    body: 'iGaming and dating networks are offshore, fragmented.',
    source: 'Source: Industry reporting',
    glyph: 'warning',
  },
  {
    heading: 'Networks disappear.',
    body: 'ShareASale folded into Awin, October 2025.',
    source: 'Source: ShareASale / Awin, October 2025',
    glyph: 'warning',
  },
]

/**
 * A type split: the heading is pinned left and set large, the evidence sits
 * small on the right. Nothing else on the page has this proportion, which is
 * the point.
 *
 * Every fact keeps its source line. These three claims are the only outside
 * credibility the page has, and the redesign must not weaken them.
 */
export function Problem() {
  return (
    <section
      data-testid="problem"
      data-shape="typesplit"
      className="border-b border-line bg-depleted/5 grain py-22"
    >
      <div className="mx-auto grid max-w-6xl items-start gap-10 px-4 lg:grid-cols-[0.82fr_1.18fr] lg:gap-18">
        <Reveal>
          <h2 className="text-title-sm font-semibold leading-[1.1] tracking-[-0.03em] sm:text-title">
            Nobody has fixed affiliate trust.
          </h2>
          <p className="mt-3.5 text-body leading-relaxed text-muted">
            Affiliates work first, trust comes after.
          </p>
        </Reveal>

        <div className="flex flex-col">
          {FACTS.map((fact, i) => (
            <Reveal
              key={fact.heading}
              delayMs={i * 70}
              className="border-t border-depleted/20 py-5 first:border-t-0 first:pt-0"
            >
              <h3 className="flex items-center gap-2.5 text-heading font-semibold tracking-[-0.015em]">
                <LandingIcon glyph={fact.glyph} className="h-5 w-5 shrink-0 text-depleted" />
                {fact.heading}
              </h3>
              <p className="mt-1.5 text-body leading-relaxed text-muted">{fact.body}</p>
              <p className="mt-1.5 text-caption text-muted">{fact.source}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
