import { KEYS, newId, read, write } from './storage'
import type { TrackingLink } from '@/lib/types'

function all(): TrackingLink[] {
  return read<TrackingLink[]>(KEYS.links, [])
}

function persist(links: TrackingLink[]): void {
  write(KEYS.links, links)
}

export function findLink(offerId: string, affiliateWallet: string): TrackingLink | null {
  return all().find((l) => l.offerId === offerId && l.affiliateWallet === affiliateWallet) ?? null
}

export function getLink(id: string): TrackingLink | null {
  return all().find((l) => l.id === id) ?? null
}

export function listLinksByAffiliate(wallet: string): TrackingLink[] {
  return all().filter((l) => l.affiliateWallet === wallet)
}

/**
 * Idempotent by (offer, affiliate). Minting a second link for the same pair
 * would fragment the affiliate's own attribution across two records.
 */
export function issueLink(offerId: string, affiliateWallet: string): TrackingLink {
  const existing = findLink(offerId, affiliateWallet)
  if (existing) return existing

  const link: TrackingLink = {
    id: newId('lk'),
    offerId,
    affiliateWallet,
    clicks: 0,
    createdAt: new Date().toISOString(),
  }
  persist([link, ...all()])
  return link
}

/**
 * Keyed by (offer, wallet) rather than link id because that is all a shared
 * URL carries. A click on a link this browser has never seen still counts.
 */
export function recordClick(offerId: string, affiliateWallet: string): void {
  const link = issueLink(offerId, affiliateWallet)
  persist(all().map((l) => (l.id === link.id ? { ...l, clicks: l.clicks + 1 } : l)))
}
