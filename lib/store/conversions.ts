import { KEYS, newId, read, write } from './storage'
import { getLink } from './links'
import { deriveStatus } from './offers'
import { ensureSeeded } from './seed'
import { round2 } from '@/lib/format'
import type { Conversion, Offer } from '@/lib/types'

export type ConversionResult =
  | { ok: true; conversion: Conversion; offer: Offer }
  | { ok: false; reason: 'insufficient_escrow' | 'not_found' }

function all(): Conversion[] {
  return read<Conversion[]>(KEYS.conversions, [])
}

export function listConversionsByAffiliate(wallet: string): Conversion[] {
  return all().filter((c) => c.affiliateWallet === wallet)
}

export function listConversionsByOffer(offerId: string): Conversion[] {
  return all().filter((c) => c.offerId === offerId)
}

export function totalEarnedUsd(wallet: string): number {
  return round2(listConversionsByAffiliate(wallet).reduce((sum, c) => sum + c.amountUsd, 0))
}

export function spentUsd(offer: Offer): number {
  return round2(offer.escrowTotalUsd - offer.escrowRemainingUsd)
}

/**
 * The single write path a Phase 2 postback handler will call. Returns a
 * result rather than throwing: insufficient escrow is an expected outcome
 * the UI renders, not an exception.
 *
 * Reads offers directly rather than via getOffer so the decrement and the
 * persist operate on one consistent snapshot.
 */
export function recordConversion(linkId: string): ConversionResult {
  const link = getLink(linkId)
  if (!link) return { ok: false, reason: 'not_found' }

  ensureSeeded()
  const offers = read<Offer[]>(KEYS.offers, [])
  const offer = offers.find((o) => o.id === link.offerId)
  if (!offer) return { ok: false, reason: 'not_found' }

  if (offer.escrowRemainingUsd < offer.commissionAmountUsd) {
    return { ok: false, reason: 'insufficient_escrow' }
  }

  const updated: Offer = {
    ...offer,
    escrowRemainingUsd: round2(offer.escrowRemainingUsd - offer.commissionAmountUsd),
  }
  updated.status = deriveStatus(updated)
  write(
    KEYS.offers,
    offers.map((o) => (o.id === offer.id ? updated : o)),
  )

  const conversion: Conversion = {
    id: newId('cv'),
    linkId,
    offerId: offer.id,
    affiliateWallet: link.affiliateWallet,
    // Snapshot: the payout is what the commission was at confirmation.
    amountUsd: offer.commissionAmountUsd,
    confirmedAt: new Date().toISOString(),
    source: 'simulator',
  }
  write(KEYS.conversions, [conversion, ...all()])

  return { ok: true, conversion, offer: updated }
}
