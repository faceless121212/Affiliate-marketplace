import { Reveal } from './Reveal'

const STEPS = [
  {
    n: '01',
    label: 'Escrow',
    heading: 'Lock the budget',
    body: 'No budget, no listing. The advertiser funds escrow first.',
  },
  {
    n: '02',
    label: 'Promotion',
    heading: 'See the balance, promote',
    body: 'They see the balance and grab their own link.',
  },
  {
    n: '03',
    label: 'Payout',
    heading: 'Get paid on confirmation',
    body: 'Confirmed means paid — no terms, no hold, no investigation.',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" data-testid="how-it-works" className="border-t border-line">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <Reveal>
          <h2 className="text-2xl font-semibold tracking-tight">How payouts happen</h2>
        </Reveal>

        <ol className="mt-10 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <li
              key={s.n}
              className="border border-transparent bg-surface p-5 transition-colors duration-300 hover:border-escrow/40 hover:bg-escrow/5"
            >
              <Reveal delayMs={i * 80}>
                <div className="flex items-baseline gap-2">
                  {/* A lime-filled pill, not lime text — same fill+ink
                      pattern as the badges and the escrow figure. */}
                  <span className="rounded-full bg-escrow px-1.5 py-0.5 font-mono tnum text-[11px] font-semibold text-ink">
                    {s.n}
                  </span>
                  <span className="text-[12px] text-muted">{s.label}</span>
                </div>
                <h3 className="mt-2 text-[15px] font-semibold">{s.heading}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-muted">{s.body}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
