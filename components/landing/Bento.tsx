import { LandingIcon, type LandingGlyph } from '@/components/ui/LandingIcon'
import { Reveal } from './Reveal'
import { BentoBrowsePreview } from './BentoBrowsePreview'

const CELLS: { heading: string; body: string; glyph: LandingGlyph; wide?: boolean }[] = [
  {
    heading: 'Paid on confirmation',
    body: 'Released the moment a conversion is confirmed, not at the end of a billing cycle.',
    glyph: 'lightning',
  },
  {
    heading: 'Locked, not promised',
    body: 'Funds can’t be pulled back out once an offer is live.',
    glyph: 'lock',
  },
  {
    heading: 'Anyone can list',
    body: 'List any niche instantly. No enterprise minimum, no sales call, no weeks-long approval.',
    glyph: 'check',
    wide: true,
  },
  {
    heading: 'Track clicks and payouts',
    body: 'See every click and every confirmed payout against your wallet.',
    glyph: 'chart',
    wide: true,
  },
  {
    heading: 'Watch escrow and top up',
    body: 'Follow spend against your locked budget, and add to it any time.',
    glyph: 'wallet',
    wide: true,
  },
]

/**
 * Unequal cells, on purpose.
 *
 * This replaces WhyNativness and WhatYouGet, two consecutive sections that
 * made the same claims in the same equal-column grid, plus WhyEscrow, a
 * 194px band carrying two lines. The 2x2 cell holds a real miniature of the
 * Browse grid rather than more prose: the page's problem was never which
 * words it used.
 */
export function Bento() {
  return (
    <section data-testid="bento" data-shape="bento" className="border-b border-line py-23">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal className="mb-10 flex flex-col justify-between gap-3 sm:flex-row sm:items-end sm:gap-10">
          <h2 className="text-[36px] font-semibold tracking-[-0.03em]">One wallet, both sides</h2>
          <p className="max-w-[24em] text-[14px] leading-relaxed text-muted sm:text-right">
            One login for both sides. The same wallet that promotes an offer today can fund one
            tomorrow.
          </p>
        </Reveal>

        <div className="grid auto-rows-[174px] grid-cols-2 gap-4 lg:grid-cols-4">
          <Reveal className="col-span-2 row-span-2 flex flex-col rounded-2xl border border-line bg-canvas p-6 shadow-card-lg">
            <h3 className="text-[18px] font-semibold tracking-[-0.015em]">
              See the money before you commit
            </h3>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">
              Every offer shows its live escrow balance, not a promise from an advertiser you’ve
              never worked with.
            </p>
            <BentoBrowsePreview />
          </Reveal>

          {CELLS.map((cell, i) => (
            <Reveal
              key={cell.heading}
              delayMs={(i + 1) * 70}
              className={`flex flex-col rounded-2xl border border-line bg-surface p-5 shadow-card transition hover:-translate-y-0.5 ${
                cell.wide ? 'col-span-2' : ''
              }`}
            >
              <span className="mb-auto grid h-9 w-9 place-items-center rounded-[10px] border border-inset bg-canvas">
                <LandingIcon glyph={cell.glyph} className="h-5 w-5 text-ink" />
              </span>
              <h3 className="mt-4 text-[16px] font-semibold tracking-[-0.015em]">{cell.heading}</h3>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">{cell.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
