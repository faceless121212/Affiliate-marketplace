/*
 * Placeholder testimonials. Nativness has no real customers yet, so every
 * quote and name below is invented: plausible, in the same spirit as the
 * fictional seed offers (Drayton Supply Co., Meridian Ledger, and the rest of
 * `SEED_OFFERS`), but not a real person, company, or result. Swap each one
 * for a real quote the moment there's a real user to quote, see README,
 * "Known limits", for the same note.
 */
import { Badge } from '@/components/ui/Badge'
import { Reveal } from './Reveal'

const QUOTES = [
  {
    quote: 'I saw the balance first.',
    name: 'Priya Osei',
    role: 'Marketer',
  },
  {
    quote: 'I lock the budget, so I risk it.',
    name: 'Femi Adeyemi',
    role: 'Lead',
  },
  {
    quote: 'No form. Wallet connected, offer funded.',
    name: 'Dana Iversen',
    role: 'Partner',
  },
  {
    quote: 'Visible escrow before trusting a new brand.',
    name: 'Marcus Whitlow',
    role: 'Founder',
  },
] as const

export function SocialProof() {
  return (
    <section data-testid="social-proof" className="border-t border-line bg-paid/5">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <Reveal className="flex flex-wrap items-baseline gap-2">
          <h2 className="text-2xl font-semibold tracking-tight">What it might feel like</h2>
          <Badge>Illustrative examples</Badge>
        </Reveal>
        <Reveal delayMs={60}>
          <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-muted">
            Nativness has no customers yet. These quotes are invented.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2">
          {QUOTES.map((q, i) => (
            <Reveal
              key={q.name}
              delayMs={i * 70}
              className="border border-transparent bg-surface p-5 transition-colors duration-300 hover:border-paid/40 hover:bg-paid/10"
            >
              <p className="text-[14px] leading-relaxed text-text">“{q.quote}”</p>
              <p className="mt-3 text-[12.5px] text-muted">
                {q.name} <span className="text-muted">· {q.role}</span>
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
