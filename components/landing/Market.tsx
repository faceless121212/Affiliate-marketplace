import { Reveal } from './Reveal'

const FIGURES = [
  {
    value: '$19.4B',
    caption: 'Affiliate spend, up from $17.1B to $22B by 2027',
    source: 'Forrester',
  },
  {
    value: '$13.81B',
    caption: 'US spend, up 11.3% year over year',
    source: 'eMarketer',
  },
] as const

/**
 * The page's breather: 40px of vertical rhythm against the 88-92px every
 * section around it uses. Sitting between a tall bento and a tall closing
 * CTA, its shortness is what makes the page's rhythm legible. It is not
 * unfinished; it is the rest between two bars.
 *
 * Both figures keep their attribution inline.
 */
export function Market() {
  return (
    <section
      data-testid="market"
      data-shape="band"
      className="border-b border-line bg-escrow/[0.07] py-10"
    >
      <Reveal className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-14 gap-y-6 px-4">
        {FIGURES.map((figure) => (
          <p key={figure.value} className="flex items-baseline gap-3">
            <span className="font-mono tnum text-[30px] font-bold leading-none tracking-[-0.025em] text-ink">
              {figure.value}
            </span>
            <span className="max-w-[19em] text-[13px] leading-snug text-muted">
              {figure.caption}. Source: {figure.source}
            </span>
          </p>
        ))}
        <span className="text-[11.5px] text-muted sm:ml-auto">Channel figures, not a forecast.</span>
      </Reveal>
    </section>
  )
}
