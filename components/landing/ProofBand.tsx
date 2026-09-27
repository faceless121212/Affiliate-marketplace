import { LandingIcon, type LandingGlyph } from '@/components/ui/LandingIcon'
import { Reveal } from './Reveal'

const FACTS: { value: string; label: string; tone: string; glyph: LandingGlyph }[] = [
  { value: 'Oct 2025', label: 'Shut down, became Awin', tone: 'text-depleted', glyph: 'warning' },
  { value: 'NET-60', label: 'Rakuten’s settlement term', tone: 'text-ink', glyph: 'clock' },
  { value: '2.2/5', label: 'Rakuten’s Trustpilot rating', tone: 'text-depleted', glyph: 'warning' },
]

/**
 * The honest proof band: the sourced facts already cited in `Problem`,
 * resurfaced here with more visual weight, plus the one kind of proof a
 * product with zero customers can actually offer: an open-source repo
 * anyone can read for themselves.
 */
export function ProofBand() {
  return (
    <section data-testid="proof-band" className="border-t border-line bg-depleted/5">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <Reveal>
          <h2 className="text-2xl font-semibold tracking-tight">
            Proof, not a claim.
          </h2>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">
            Sourced facts, not assertions.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-3">
          {FACTS.map((f, i) => (
            <Reveal
              key={f.value}
              delayMs={i * 80}
              className="border border-transparent bg-surface p-5 transition-colors duration-300 hover:border-muted hover:bg-depleted/10"
            >
              <p className={`flex items-center gap-2 font-mono tnum text-3xl font-bold ${f.tone}`}>
                <LandingIcon glyph={f.glyph} className="h-6 w-6 shrink-0" />
                {f.value}
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-muted">{f.label}</p>
            </Reveal>
          ))}
        </div>

        <Reveal
          delayMs={240}
          className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-escrow/30 bg-escrow/5 p-5"
        >
          <p className="max-w-md text-[14px] leading-relaxed text-text">
            Every line is public. Read it yourself.
          </p>
          <a
            href="https://github.com/faceless121212/Affiliate-marketplace"
            className="shrink-0 rounded-[8px] border border-line bg-surface px-4 py-2.5 text-[13px] font-semibold text-text transition-colors duration-300 hover:border-escrow/50 hover:bg-escrow/10"
          >
            Audit the source on GitHub
          </a>
        </Reveal>
      </div>
    </section>
  )
}
