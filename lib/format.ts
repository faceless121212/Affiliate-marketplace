export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100
}

export function money(n: number): string {
  return n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/**
 * How full an escrow bar is, as a 0-100 percentage. The one place this is
 * clamped, so EscrowMeter, the landing's live demo and its browse preview
 * cannot disagree about an over-drawn or zero-total offer.
 */
export function escrowFillPct(remainingUsd: number, totalUsd: number): number {
  if (!(totalUsd > 0)) return 0
  return Math.max(0, Math.min(100, (remainingUsd / totalUsd) * 100))
}

export function shortAddress(address: string): string {
  if (address.length <= 10) return address
  return `${address.slice(0, 4)}…${address.slice(-4)}`
}

/** The public shape of a tracking link. Derived, never stored. */
export function linkUrl(offerId: string, wallet: string): string {
  return `nativness.app/r/${offerId}/${wallet}`
}

export function relativeDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
