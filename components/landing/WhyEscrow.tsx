import { Reveal } from './Reveal'

export function WhyEscrow() {
  return (
    <section className="border-t border-line bg-escrow/5">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 lg:grid-cols-2">
        <Reveal>
          <h2 className="text-2xl font-semibold tracking-tight">Why escrow, not reputation</h2>
        </Reveal>
        <Reveal delayMs={80} className="space-y-4 text-[15px] leading-relaxed text-muted">
          <p>
            Reputation only prices trust after the damage is done. That’s why open affiliate
            markets end up gatekept — vetting is the only defense, and it locks out newcomers.
          </p>
          <p>
            Escrow flips the order — the money locks before anyone sees the offer, so the
            listing itself is the guarantee.
          </p>
          <p className="text-text">
            A funded unknown beats an unfunded name you know.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
