import { Reveal } from './Reveal'

const AFFILIATE = [
  'Browse every listed offer with its escrow balance in view',
  'Generate a tracking link tied to your wallet address',
  'Track clicks, confirmed conversions and payouts in one place',
]

const ADVERTISER = [
  'List an offer in any niche, with your budget locked on creation',
  'Watch remaining escrow, conversions and spend per offer',
  'Top up escrow whenever you want more conversions funded',
]

export function WhatYouGet() {
  return (
    <section data-testid="what-you-get" className="border-t border-line bg-paid/5">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <Reveal>
          <h2 className="text-2xl font-semibold tracking-tight">One login opens both sides</h2>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">
            There is no affiliate account and no advertiser account. Connecting your wallet creates
            one identity that can promote other people’s offers and list its own, in the same
            session, from the same navigation. Nobody signs up twice.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-2">
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
            <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-escrow" aria-hidden />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
