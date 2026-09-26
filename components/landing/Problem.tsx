const CLAIMS = [
  {
    heading: 'The good tooling is priced for enterprises only',
    body: 'Workforce-data providers LinkUp and Revelio Labs list at $75,000–$300,000 a year, enterprise-only, with no self-serve tier. One independent review scored Revelio Labs 15/100 on fit for a solo marketer or founder. Adjacent infrastructure prices out exactly the people who need it most.',
    source: 'LinkUp, Revelio Labs; independent review',
  },
  {
    heading: 'Getting paid takes months — when it happens',
    body: 'Rakuten Advertising settles on NET-60 terms and holds a 2.2/5 rating on Trustpilot. CJ Affiliate has drawn reported complaints of commissions withheld behind an “investigation” that never resolves.',
    source: 'Rakuten Advertising, Trustpilot; CJ Affiliate complaints',
  },
  {
    heading: 'Outside the big networks there is no recourse at all',
    body: 'iGaming and dating CPA networks such as Ace Partners, N1 Partners and Affilitex are fragmented and offshore. Trust rests on reputation alone: no escrow, no arbitration, nowhere to go when a payment does not arrive.',
    source: 'Ace Partners, N1 Partners, Affilitex',
  },
  {
    heading: 'And networks do disappear',
    body: 'ShareASale shut down and merged into Awin in October 2025. Affiliates who had built their business on it had no claim on anything except goodwill.',
    source: 'ShareASale / Awin, October 2025',
  },
]

export function Problem() {
  return (
    <section data-testid="problem" className="border-t border-line">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-semibold tracking-tight">
          Affiliate payment is a trust problem nobody has fixed
        </h2>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">
          Every layer of the current market asks the affiliate to do the work first and trust
          somebody else to pay later.
        </p>

        <div className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2">
          {CLAIMS.map((c) => (
            <div key={c.heading}>
              <h3 className="text-[15px] font-semibold">{c.heading}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-muted">{c.body}</p>
              <p className="mt-2 text-[11px] text-muted/70">Source: {c.source}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
