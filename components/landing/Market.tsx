export function Market() {
  return (
    <section data-testid="market" className="border-t border-line">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-semibold tracking-tight">
          The channel is growing. The infrastructure under it is not.
        </h2>

        <div className="mt-10 grid gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-2">
          <div className="bg-surface p-5">
            <p className="font-mono tnum text-2xl font-bold text-escrow">$19.4B</p>
            <p className="mt-2 text-[14px] leading-relaxed text-muted">
              Global affiliate marketing spend in 2026, up from{' '}
              <span className="font-mono tnum text-text">$17.1B</span> in 2025, on track for{' '}
              <span className="font-mono tnum text-text">$22B</span> by 2027.
            </p>
            <p className="mt-2 text-[11px] text-muted/70">Source: Forrester</p>
          </div>

          <div className="bg-surface p-5">
            <p className="font-mono tnum text-2xl font-bold text-escrow">$13.81B</p>
            <p className="mt-2 text-[14px] leading-relaxed text-muted">
              United States affiliate marketing spend in 2026, up{' '}
              <span className="font-mono tnum text-text">11.3%</span> year over year.
            </p>
            <p className="mt-2 text-[11px] text-muted/70">Source: eMarketer</p>
          </div>
        </div>

        <p className="mt-6 max-w-2xl text-[14px] leading-relaxed text-muted">
          These are adoption figures for the channel, not a forecast for this product. They
          describe how much commission money moves through a payment layer that still runs on
          NET-60 terms and goodwill.
        </p>
      </div>
    </section>
  )
}
