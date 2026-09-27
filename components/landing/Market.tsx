import { Reveal } from './Reveal'

export function Market() {
  return (
    <section data-testid="market" className="border-t border-line bg-escrow/5">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <Reveal>
          <h2 className="text-2xl font-semibold tracking-tight">
            The channel is growing. Its infrastructure isn’t.
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2">
          <Reveal className="border border-transparent bg-surface p-5 transition-colors duration-300 hover:border-escrow/40 hover:bg-escrow/10">
            <p className="font-mono tnum text-4xl font-bold text-ink">$19.4B</p>
            <p className="mt-2 text-[14px] leading-relaxed text-muted">
              Affiliate spend, up from{' '}
              <span className="font-mono tnum text-text">$17.1B</span> to{' '}
              <span className="font-mono tnum text-text">$22B</span> by 2027.
            </p>
            <p className="mt-2 text-[11px] text-muted">Source: Forrester</p>
          </Reveal>

          <Reveal
            delayMs={80}
            className="border border-transparent bg-surface p-5 transition-colors duration-300 hover:border-escrow/40 hover:bg-escrow/10"
          >
            <p className="font-mono tnum text-4xl font-bold text-ink">$13.81B</p>
            <p className="mt-2 text-[14px] leading-relaxed text-muted">
              US spend, up{' '}
              <span className="font-mono tnum text-text">11.3%</span> year over year.
            </p>
            <p className="mt-2 text-[11px] text-muted">Source: eMarketer</p>
          </Reveal>
        </div>

        <p className="mt-6 max-w-2xl text-[14px] leading-relaxed text-muted">
          Channel figures, not a forecast.
        </p>
      </div>
    </section>
  )
}
