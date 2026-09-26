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
    escrow: 'text-escrow',
    paid: 'text-paid',
    muted: 'text-muted',
    // Used by EscrowMeter in Task 11 when a balance can no longer fund a conversion.
    depleted: 'text-depleted',
  }[tone]
  return <span className={`font-mono tnum ${toneClass} ${className}`}>{money(value)}</span>
}
