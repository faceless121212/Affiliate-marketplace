import { Reveal } from './Reveal'

const CLAIMS = [
  {
    heading: 'Good tools cost enterprise money.',
    body: 'LinkUp and Revelio Labs — workforce-data providers — charge $75,000–$300,000 a year, pricing out everyone but enterprises.',
    source: 'LinkUp, Revelio Labs',
  },
  {
    heading: 'Paid in months — maybe.',
    body: 'Rakuten Advertising: NET-60 terms, 2.2/5 on Trustpilot. CJ Affiliate: reported complaints of commissions stuck in ‘investigation.’',
    source: 'Rakuten Advertising, Trustpilot; CJ Affiliate complaints',
  },
  {
    heading: 'Smaller networks offer no recourse.',
    body: 'iGaming and dating CPA networks — Ace Partners, N1 Partners, Affilitex — are offshore and fragmented. No escrow, no arbitration, nowhere to go.',
    source: 'Ace Partners, N1 Partners, Affilitex',
  },
  {
    heading: 'Networks disappear.',
    body: 'ShareASale folded into Awin, October 2025. Its affiliates were left with nothing but goodwill.',
    source: 'ShareASale / Awin, October 2025',
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
            Affiliates do the work first and trust someone else to pay later.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-x-6 gap-y-4 sm:grid-cols-2">
          {CLAIMS.map((c, i) => (
            <Reveal
              key={c.heading}
              delayMs={i * 70}
              className="rounded-lg border border-transparent p-4 transition-colors duration-300 hover:border-line hover:bg-surface"
            >
              <h3 className="text-[15px] font-semibold">{c.heading}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-muted">{c.body}</p>
              <p className="mt-2 text-[11px] text-muted">Source: {c.source}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
