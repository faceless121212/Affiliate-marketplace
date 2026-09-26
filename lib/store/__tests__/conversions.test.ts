import { describe, it, expect } from 'vitest'
import {
  recordConversion,
  listConversionsByAffiliate,
  listConversionsByOffer,
  totalEarnedUsd,
  spentUsd,
} from '@/lib/store/conversions'
import { issueLink } from '@/lib/store/links'
import { createOffer, getOffer, listOffers, topUpEscrow } from '@/lib/store/offers'
import { KEYS, read, write } from '@/lib/store/storage'
import type { Offer, OfferDraft } from '@/lib/types'

const AFFILIATE = '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU'
const ADVERTISER = '3nMwKpQ8rTyVbCfXzJ5hLdSaG2eU9NvRqBtHxY4kciWo'

const draft: OfferDraft = {
  name: 'Ashcroft Rail',
  description: 'Discount rail booking for commuters.',
  category: 'ecommerce',
  commissionAmountUsd: 15,
  conversionTerms: 'A conversion is a completed booking of $40 or more.',
  targetUrl: 'https://example.com/ashcroft',
  escrowBudgetUsd: 30,
}

describe('recordConversion', () => {
  it('decrements the offer’s escrow by exactly the commission', () => {
    listOffers()
    const link = issueLink('of_seed_drayton', AFFILIATE)
    const result = recordConversion(link.id)
    expect(result.ok).toBe(true)
    // Drayton seeds at $340 remaining with a $24 commission.
    expect(getOffer('of_seed_drayton')!.escrowRemainingUsd).toBe(316)
  })

  it('appends a payout record for that affiliate', () => {
    listOffers()
    const link = issueLink('of_seed_drayton', AFFILIATE)
    recordConversion(link.id)
    const rows = listConversionsByAffiliate(AFFILIATE)
    expect(rows).toHaveLength(1)
    expect(rows[0].amountUsd).toBe(24)
    expect(rows[0].source).toBe('simulator')
  })

  it('snapshots the amount so history survives a commission change', () => {
    listOffers()
    const link = issueLink('of_seed_drayton', AFFILIATE)
    recordConversion(link.id)
    expect(listConversionsByAffiliate(AFFILIATE)[0].amountUsd).toBe(24)

    // No public commission-editing API exists by design; reach through the
    // storage layer to simulate the advertiser changing the offer's terms.
    const offers = read<Offer[]>(KEYS.offers, [])
    write(
      KEYS.offers,
      offers.map((o) => (o.id === 'of_seed_drayton' ? { ...o, commissionAmountUsd: 48 } : o)),
    )

    expect(listConversionsByAffiliate(AFFILIATE)[0].amountUsd).toBe(24)
    expect(totalEarnedUsd(AFFILIATE)).toBe(24)
  })

  it('flips the offer to depleted when the remainder can no longer fund one', () => {
    // $30 budget, $15 commission: two conversions exhaust it.
    const offer = createOffer(draft, ADVERTISER)
    const link = issueLink(offer.id, AFFILIATE)
    recordConversion(link.id)
    expect(getOffer(offer.id)!.status).toBe('active')
    recordConversion(link.id)
    const after = getOffer(offer.id)!
    expect(after.escrowRemainingUsd).toBe(0)
    expect(after.status).toBe('depleted')
  })

  it('refuses once escrow cannot fund another conversion', () => {
    const offer = createOffer(draft, ADVERTISER)
    const link = issueLink(offer.id, AFFILIATE)
    recordConversion(link.id)
    recordConversion(link.id)
    const result = recordConversion(link.id)
    expect(result).toEqual({ ok: false, reason: 'insufficient_escrow' })
  })

  it('does not decrement escrow or record a payout when it refuses', () => {
    const offer = createOffer({ ...draft, escrowBudgetUsd: 10 }, ADVERTISER)
    const link = issueLink(offer.id, AFFILIATE)
    expect(recordConversion(link.id)).toEqual({ ok: false, reason: 'insufficient_escrow' })
    expect(getOffer(offer.id)!.escrowRemainingUsd).toBe(10)
    expect(listConversionsByAffiliate(AFFILIATE)).toHaveLength(0)
  })

  it('pays out again after a top-up revives the offer', () => {
    const offer = createOffer({ ...draft, escrowBudgetUsd: 10 }, ADVERTISER)
    const link = issueLink(offer.id, AFFILIATE)
    expect(recordConversion(link.id).ok).toBe(false)
    topUpEscrow(offer.id, 20)
    expect(recordConversion(link.id).ok).toBe(true)
  })

  it('reports not_found for an unknown link', () => {
    expect(recordConversion('lk_nope')).toEqual({ ok: false, reason: 'not_found' })
  })

  it('rounds repeated subtraction rather than drifting', () => {
    // Coastline: $187.50 remaining, $12.50 commission.
    listOffers()
    const link = issueLink('of_seed_coastline', AFFILIATE)
    for (let i = 0; i < 3; i += 1) recordConversion(link.id)
    expect(getOffer('of_seed_coastline')!.escrowRemainingUsd).toBe(150)
  })
})

describe('aggregates', () => {
  it('totals an affiliate’s earnings across offers', () => {
    listOffers()
    recordConversion(issueLink('of_seed_drayton', AFFILIATE).id) // $24
    recordConversion(issueLink('of_seed_meridian', AFFILIATE).id) // $65
    expect(totalEarnedUsd(AFFILIATE)).toBe(89)
  })

  it('returns zero earnings for a wallet with no conversions', () => {
    expect(totalEarnedUsd(ADVERTISER)).toBe(0)
  })

  it('lists conversions per offer', () => {
    listOffers()
    recordConversion(issueLink('of_seed_drayton', AFFILIATE).id)
    expect(listConversionsByOffer('of_seed_drayton')).toHaveLength(1)
    expect(listConversionsByOffer('of_seed_kestrel')).toHaveLength(0)
  })

  it('derives budget spent from total minus remaining', () => {
    listOffers()
    recordConversion(issueLink('of_seed_drayton', AFFILIATE).id)
    expect(spentUsd(getOffer('of_seed_drayton')!)).toBe(184)
  })
})
