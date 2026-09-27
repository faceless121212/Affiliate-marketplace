import { LandingIcon, type LandingGlyph } from '@/components/ui/LandingIcon'
import { Reveal } from './Reveal'

const CLAIMS: { heading: string; body: string; source: string; glyph: LandingGlyph }[] = [
  {
    heading: 'Good tools cost enterprise money.',
    body: 'LinkUp and Revelio Labs, workforce-data providers: $75,000–$300,000 yearly.',
    source: 'LinkUp, Revelio Labs',
    glyph: 'chart',
  },
  {
    heading: 'Paid in months, maybe.',
    body: 'Rakuten’s NET-60 rates 2.2/5 on Trustpilot; CJ Affiliate reports stuck commissions.',
    source: 'Rakuten Advertising, Trustpilot; CJ Affiliate complaints',
    glyph: 'clock',
  },
  {
    heading: 'Smaller networks offer no recourse.',
    body: 'iGaming and dating networks are offshore, fragmented.',
    source: 'Industry reporting',
    glyph: 'warning',
  },
  {
    heading: 'Networks disappear.',
    body: 'ShareASale folded into Awin, October 2025.',
    source: 'ShareASale / Awin, October 2025',
    glyph: 'warning',
  },
]

export function Problem() {
  return (
    <section data-testid="problem" className="border-t border-line bg-depleted/5">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <Reveal>
          <h2 className="text-2xl font-semibold tracking-tight">
            Nobody has fixed affiliate trust.
          </h2>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">
            Affiliates work first, trust comes after.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-x-6 gap-y-4 sm:grid-cols-2">
          {CLAIMS.map((c, i) => (
            <Reveal
              key={c.heading}
              delayMs={i * 70}
              className="rounded-lg border border-transparent p-4 transition-colors duration-300 hover:border-line hover:bg-surface"
            >
              <h3 className="flex items-start gap-1.5 text-[15px] font-semibold">
                <LandingIcon glyph={c.glyph} className="mt-0.5 h-4 w-4 shrink-0 text-depleted" />
                {c.heading}
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed text-muted">{c.body}</p>
              <p className="mt-2 text-[11px] text-muted">Source: {c.source}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
