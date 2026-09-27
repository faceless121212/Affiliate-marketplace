import { LandingIcon } from '@/components/ui/LandingIcon'
import { Reveal } from './Reveal'

const AFFILIATE = ['See offer balances', 'Get your link', 'Track clicks and payouts']

const ADVERTISER = ['List any niche instantly', 'Watch escrow and spend', 'Top up anytime']

export function WhatYouGet() {
  return (
    <section data-testid="what-you-get" className="border-t border-line bg-paid/5">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <Reveal>
          <h2 className="text-2xl font-semibold tracking-tight">One login, both sides</h2>
        </Reveal>

        <div className="mt-10 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2">
          <Reveal
            delayMs={0}
            className="border border-transparent bg-surface p-5 transition-colors duration-300 hover:border-paid/40 hover:bg-paid/5"
          >
            <Column title="Promote offers" items={AFFILIATE} />
          </Reveal>
          <Reveal
            delayMs={80}
            className="border border-transparent bg-surface p-5 transition-colors duration-300 hover:border-escrow/40 hover:bg-escrow/5"
          >
            <Column title="List your own" items={ADVERTISER} />
          </Reveal>
        </div>
      </div>
    </section>
  )
}

function Column({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="text-[15px] font-semibold">{title}</h3>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-[14px] leading-relaxed text-muted">
            <LandingIcon glyph="check" className="mt-[3px] h-3.5 w-3.5 shrink-0 text-escrow" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
