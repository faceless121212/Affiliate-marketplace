const STEPS = [
  {
    n: '01',
    label: 'Escrow',
    heading: 'Lock the commission budget',
    body: 'The advertiser funds escrow before the offer is visible to anyone. No budget, no listing.',
  },
  {
    n: '02',
    label: 'Promotion',
    heading: 'Promote with the balance visible',
    body: 'Affiliates see exactly what is left to pay out and generate a link carrying their own wallet address.',
  },
  {
    n: '03',
    label: 'Payout',
    heading: 'A confirmed conversion pays out',
    body: 'Confirmation releases the commission from escrow to the affiliate’s wallet. No terms, no hold, no investigation.',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" data-testid="how-it-works" className="border-t border-line">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-semibold tracking-tight">How a payout actually happens</h2>

        <ol className="mt-10 grid gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-3">
          {STEPS.map((s) => (
            <li key={s.n} className="bg-surface p-5">
              <div className="flex items-baseline gap-2">
                <span className="font-mono tnum text-[12px] text-escrow">{s.n}</span>
                <span className="text-[12px] text-muted">{s.label}</span>
              </div>
              <h3 className="mt-2 text-[15px] font-semibold">{s.heading}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-muted">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
