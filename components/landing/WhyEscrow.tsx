import { LandingIcon } from '@/components/ui/LandingIcon'
import { Reveal } from './Reveal'

export function WhyEscrow() {
  return (
    <section className="border-t border-line bg-escrow/5">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 lg:grid-cols-2">
        <Reveal>
          <h2 className="text-2xl font-semibold tracking-tight">Why escrow, not reputation</h2>
        </Reveal>
        <Reveal delayMs={80} className="space-y-4 text-[15px] leading-relaxed text-muted">
          <p className="flex items-start gap-2">
            <LandingIcon glyph="lock" className="mt-0.5 h-5 w-5 shrink-0 text-ink" />
            Escrow locks the money first.
          </p>
          <p className="text-text">
            A funded stranger is safer than a trusted name with no proof behind it.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
