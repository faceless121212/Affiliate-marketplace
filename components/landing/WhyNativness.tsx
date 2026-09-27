import { LandingIcon, type LandingGlyph } from '@/components/ui/LandingIcon'
import { Reveal } from './Reveal'

const POINTS: { heading: string; body: string; glyph: LandingGlyph }[] = [
  {
    heading: 'See the money before you commit',
    body: 'Every offer shows its live escrow balance, not a promise from an advertiser you’ve never worked with.',
    glyph: 'lock',
  },
  {
    heading: 'Paid on confirmation, not on a schedule',
    body: 'No NET-30/NET-60, no minimum payout threshold.',
    glyph: 'lightning',
  },
  {
    heading: 'Anyone can list, not just enterprise accounts',
    body: 'No $75K/year minimum, no sales call, no weeks-long approval.',
    glyph: 'check',
  },
  {
    heading: 'One login unlocks both sides',
    body: 'The same wallet that promotes an offer today can fund one tomorrow.',
    glyph: 'wallet',
  },
]

export function WhyNativness() {
  return (
    <section data-testid="why-nativness" className="border-t border-line">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <Reveal>
          <h2 className="text-2xl font-semibold tracking-tight">Why Nativness</h2>
        </Reveal>

        <div className="mt-10 grid gap-x-6 gap-y-6 sm:grid-cols-2">
          {POINTS.map((p, i) => (
            <Reveal key={p.heading} delayMs={i * 70}>
              <h3 className="flex items-start gap-2 text-[15px] font-semibold">
                <LandingIcon glyph={p.glyph} className="mt-0.5 h-6 w-6 shrink-0 text-paid" />
                {p.heading}
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed text-muted">{p.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
