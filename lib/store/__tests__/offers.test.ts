import { describe, it, expect } from 'vitest'
import {
  deriveStatus,
  listOffers,
  getOffer,
  createOffer,
  topUpEscrow,
  listOffersByAdvertiser,
} from '@/lib/store/offers'
import type { OfferDraft } from '@/lib/types'

const WALLET = '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU'

const draft: OfferDraft = {
  name: 'Ashcroft Rail',
  description: 'Discount rail booking for commuters in the north of England.',
  category: 'ecommerce',
  commissionAmountUsd: 15,
  conversionTerms: 'A conversion is a completed booking of $40 or more.',
  targetUrl: 'https://example.com/ashcroft',
  escrowBudgetUsd: 300,
}

describe('deriveStatus', () => {
  it('is active while the remainder can fund one more conversion', () => {
    expect(deriveStatus({ escrowRemainingUsd: 18, commissionAmountUsd: 18 })).toBe('active')
  })

  it('is depleted the moment it cannot', () => {
    expect(deriveStatus({ escrowRemainingUsd: 17.99, commissionAmountUsd: 18 })).toBe('depleted')
    expect(deriveStatus({ escrowRemainingUsd: 0, commissionAmountUsd: 18 })).toBe('depleted')
  })
})

describe('listOffers', () => {
  it('seeds on first read', () => {
    expect(listOffers()).toHaveLength(6)
  })

  it('filters by category', () => {
    const saas = listOffers({ category: 'saas' })
    expect(saas.map((o) => o.name).sort()).toEqual(['Halcyon Tools', 'Meridian Ledger'])
  })

  it('searches name and description, case-insensitively', () => {
    expect(listOffers({ query: 'DRAYTON' }).map((o) => o.name)).toEqual(['Drayton Supply Co.'])
    // 'bookkeeping' appears only in Meridian's description.
    expect(listOffers({ query: 'bookkeeping' }).map((o) => o.name)).toEqual(['Meridian Ledger'])
  })

  it('does not search conversion terms or target URL', () => {
    expect(listOffers({ query: 'example.com' })).toHaveLength(0)
    expect(listOffers({ query: 'returns window' })).toHaveLength(0)
  })

  it('treats a whitespace-only query as no query', () => {
    expect(listOffers({ query: '   ' })).toHaveLength(6)
  })
})

describe('createOffer', () => {
  it('appears in the marketplace immediately', () => {
    const before = listOffers().length
    const offer = createOffer(draft, WALLET)
    expect(listOffers()).toHaveLength(before + 1)
    expect(getOffer(offer.id)!.name).toBe('Ashcroft Rail')
  })

  it('locks the whole budget: remaining equals total', () => {
    const offer = createOffer(draft, WALLET)
    expect(offer.escrowTotalUsd).toBe(300)
    expect(offer.escrowRemainingUsd).toBe(300)
  })

  it('is always Community — a user cannot self-verify', () => {
    const offer = createOffer({ ...draft, name: 'Sneaky Ltd' }, WALLET)
    expect(offer.verified).toBe(false)
  })

  it('is depleted on creation if the budget cannot fund one conversion', () => {
    const offer = createOffer({ ...draft, escrowBudgetUsd: 10 }, WALLET)
    expect(offer.status).toBe('depleted')
  })

  it('attributes the offer to the creating wallet', () => {
    createOffer(draft, WALLET)
    expect(listOffersByAdvertiser(WALLET).map((o) => o.name)).toEqual(['Ashcroft Rail'])
  })
})

describe('topUpEscrow', () => {
  it('raises both the total and the remainder', () => {
    const offer = createOffer(draft, WALLET)
    const topped = topUpEscrow(offer.id, 200)!
    expect(topped.escrowTotalUsd).toBe(500)
    expect(topped.escrowRemainingUsd).toBe(500)
  })

  it('revives a depleted offer once it can fund a conversion again', () => {
    const offer = createOffer({ ...draft, escrowBudgetUsd: 10 }, WALLET)
    expect(offer.status).toBe('depleted')
    expect(topUpEscrow(offer.id, 20)!.status).toBe('active')
  })

  it('leaves an offer depleted if the top-up is still too small', () => {
    const offer = createOffer({ ...draft, escrowBudgetUsd: 1 }, WALLET)
    expect(topUpEscrow(offer.id, 2)!.status).toBe('depleted')
  })

  it('rounds to two decimals rather than drifting', () => {
    const offer = createOffer({ ...draft, escrowBudgetUsd: 0.1 }, WALLET)
    expect(topUpEscrow(offer.id, 0.2)!.escrowRemainingUsd).toBe(0.3)
  })

  it('returns null for an unknown offer', () => {
    expect(topUpEscrow('of_nope', 100)).toBeNull()
  })

  it('rejects a non-positive top-up', () => {
    const offer = createOffer(draft, WALLET)
    expect(topUpEscrow(offer.id, 0)).toBeNull()
    expect(topUpEscrow(offer.id, -50)).toBeNull()
    expect(getOffer(offer.id)!.escrowTotalUsd).toBe(300)
  })
})

describe('getOffer', () => {
  it('returns null for an unknown id', () => {
    expect(getOffer('of_nope')).toBeNull()
  })
})
