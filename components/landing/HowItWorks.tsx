import { Reveal } from './Reveal'

const STEPS = [
  {
    n: '01',
    heading: 'Lock the budget',
    body: 'The advertiser funds escrow before the offer is visible to anyone.',
  },
  {
    n: '02',
    heading: 'See the balance, promote',
    body: 'Affiliates read the real remaining balance, then take a tracking link.',
  },
  {
    n: '03',
    heading: 'Get paid on confirmation',
    body: 'Confirmed means paid. No NET-60, no minimum threshold.',
  },
] as const

/**
 * A full-bleed tinted band, deliberately ignoring the max-w-6xl container
 * every other section obeys. The three steps sit on a horizontal rail rather
 * than in three bordered boxes: the old version was one more equal-column
 * card grid in a page made entirely of equal-column card grids.
 *
 * The rail line is hidden below `sm`, where the steps stack and a horizontal
 * connector would point at nothing.
 */
export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      data-testid="how-it-works"
      data-shape="rail"
      className="border-b border-line bg-surface py-23"
    >
      <div className="mx-auto max-w-6xl px-4">
        <Reveal>
          <h2 className="text-[36px] font-semibold tracking-[-0.03em]">How payouts happen</h2>
        </Reveal>

        <ol className="relative mt-14 grid gap-9 sm:grid-cols-3">
          <span
            aria-hidden
            className="absolute left-[16%] right-[16%] top-[19px] hidden h-0.5 sm:block"
            style={{
              background:
                'linear-gradient(90deg, var(--color-escrow), var(--color-escrow) 66%, var(--color-inset))',
            }}
          />
          {STEPS.map((s, i) => (
            <li key={s.n} className="relative text-center">
              <Reveal delayMs={i * 80}>
                <span
                  className={`mx-auto mb-4 grid h-10 w-10 place-items-center rounded-full font-mono text-[13px] font-bold shadow-[0_0_0_7px_var(--color-surface)] ${
                    i === 2 ? 'border-2 border-inset bg-canvas text-text' : 'bg-escrow text-ink'
                  }`}
                >
                  {s.n}
                </span>
                <h3 className="text-[18px] font-semibold tracking-[-0.015em]">{s.heading}</h3>
                <p className="mx-auto mt-1.5 max-w-[26em] text-[14px] leading-relaxed text-muted">
                  {s.body}
                </p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
