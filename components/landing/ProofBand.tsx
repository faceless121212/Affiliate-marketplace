import { Reveal } from './Reveal'

const FACTS = [
  { value: 'Oct 2025', label: 'ShareASale shut down, folded into Awin', tone: 'text-depleted' },
  { value: 'NET-60', label: 'Rakuten Advertising’s standard settlement term', tone: 'text-escrow' },
  { value: '2.2/5', label: 'Rakuten Advertising’s Trustpilot rating', tone: 'text-depleted' },
] as const

/**
 * The honest proof band: the sourced facts already cited in `Problem`,
 * resurfaced here with more visual weight, plus the one kind of proof a
 * product with zero customers can actually offer — an open-source repo
 * anyone can read for themselves.
 */
export function ProofBand() {
  return (
    <section data-testid="proof-band" className="border-t border-line bg-depleted/5">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <Reveal>
          <h2 className="text-2xl font-semibold tracking-tight">
            Proof that doesn’t need us to say it
          </h2>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">
            These facts are sourced, not asserted — and they’re the strongest argument on this
            page.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-3">
          {FACTS.map((f, i) => (
            <Reveal
              key={f.value}
              delayMs={i * 80}
              className="border border-transparent bg-surface p-5 transition-colors duration-300 hover:border-muted hover:bg-depleted/10"
            >
              <p className={`font-mono tnum text-3xl font-bold ${f.tone}`}>{f.value}</p>
              <p className="mt-2 text-[13px] leading-relaxed text-muted">{f.label}</p>
            </Reveal>
          ))}
        </div>

        <Reveal
          delayMs={240}
          className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-md border border-escrow/30 bg-escrow/5 p-5"
        >
          <p className="max-w-md text-[14px] leading-relaxed text-text">
            Every line of this prototype is public. An open-source claim is proof a new product
            can actually make — read the code rather than take our word for it.
          </p>
          <a
            href="https://github.com/faceless121212/Affiliate-marketplace"
            className="shrink-0 rounded-[5px] border border-line bg-surface px-4 py-2.5 text-[13px] font-semibold text-text transition-colors duration-300 hover:border-escrow/50 hover:bg-escrow/10"
          >
            Audit the source on GitHub
          </a>
        </Reveal>
      </div>
    </section>
  )
}
