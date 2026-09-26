import { money } from '@/lib/format'

/**
 * Every currency amount in the product renders through here, so mono +
 * tabular numerals are defined once and cannot drift across screens.
 */
export function Money({
  value,
  tone = 'default',
  className = '',
}: {
  value: number
  tone?: 'default' | 'escrow' | 'paid' | 'muted' | 'depleted'
  className?: string
}) {
  const toneClass = {
    default: 'text-text',
    // The dominant figure (escrow remainder, the hero counter). Lime as text
    // is ~1.2:1 on white — illegible — so escrow renders in `ink` (black)
    // instead, and gets its dominance from size and weight, not colour. Lime
    // stays reserved for fills: the meter's progress bar, chips.
    escrow: 'text-ink',
    paid: 'text-paid',
    muted: 'text-muted',
    // Used by EscrowMeter in Task 11 when a balance can no longer fund a conversion.
    depleted: 'text-depleted',
  }[tone]
  return <span className={`font-mono tnum ${toneClass} ${className}`}>{money(value)}</span>
}
