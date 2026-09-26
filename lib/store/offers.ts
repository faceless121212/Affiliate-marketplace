import { KEYS, newId, read, write } from './storage'
import { ensureSeeded } from './seed'
import { round2 } from '@/lib/format'
import type { Category, Offer, OfferDraft, OfferStatus } from '@/lib/types'

/**
 * An offer is depleted when its remaining escrow cannot fund one more
 * conversion. Equality is still active: exactly enough is enough.
 */
export function deriveStatus(
  o: Pick<Offer, 'escrowRemainingUsd' | 'commissionAmountUsd'>,
): OfferStatus {
  return o.escrowRemainingUsd >= o.commissionAmountUsd ? 'active' : 'depleted'
}

function all(): Offer[] {
  ensureSeeded()
  return read<Offer[]>(KEYS.offers, [])
}

function persist(offers: Offer[]): void {
  write(KEYS.offers, offers)
}

export function listOffers(opts: { category?: Category; query?: string } = {}): Offer[] {
  let offers = all()
  if (opts.category) {
    offers = offers.filter((o) => o.category === opts.category)
  }
  const q = opts.query?.trim().toLowerCase()
  if (q) {
    // Name and description only. URLs are not how people search, and
    // conversion terms are long enough to match almost anything.
    offers = offers.filter(
      (o) => o.name.toLowerCase().includes(q) || o.description.toLowerCase().includes(q),
    )
  }
  return offers
}

export function getOffer(id: string): Offer | null {
  return all().find((o) => o.id === id) ?? null
}

export function listOffersByAdvertiser(wallet: string): Offer[] {
  return all().filter((o) => o.advertiserWallet === wallet)
}

export function createOffer(draft: OfferDraft, advertiserWallet: string): Offer {
  const budget = round2(draft.escrowBudgetUsd)
  const commission = round2(draft.commissionAmountUsd)
  const offer: Offer = {
    id: newId('of'),
    advertiserWallet,
    name: draft.name.trim(),
    description: draft.description.trim(),
    category: draft.category,
    commissionAmountUsd: commission,
    conversionTerms: draft.conversionTerms.trim(),
    targetUrl: draft.targetUrl.trim(),
    escrowTotalUsd: budget,
    escrowRemainingUsd: budget,
    // Verification is never self-granted. Phase 2 adds the review path.
    verified: false,
    status: deriveStatus({ escrowRemainingUsd: budget, commissionAmountUsd: commission }),
    createdAt: new Date().toISOString(),
  }
  persist([offer, ...all()])
  return offer
}

/**
 * Raises total AND remaining. Raising only the remainder would render an
 * incoherent card ($540 / $500); raising only the total would take the
 * advertiser's money without funding anything.
 */
export function topUpEscrow(offerId: string, amountUsd: number): Offer | null {
  if (!(amountUsd > 0)) return null
  const offers = all()
  const current = offers.find((o) => o.id === offerId)
  if (!current) return null

  const amount = round2(amountUsd)
  const updated: Offer = {
    ...current,
    escrowTotalUsd: round2(current.escrowTotalUsd + amount),
    escrowRemainingUsd: round2(current.escrowRemainingUsd + amount),
  }
  updated.status = deriveStatus(updated)

  persist(offers.map((o) => (o.id === offerId ? updated : o)))
  return updated
}
