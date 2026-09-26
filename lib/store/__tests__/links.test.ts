import { describe, it, expect } from 'vitest'
import {
  issueLink,
  getLink,
  findLink,
  listLinksByAffiliate,
  recordClick,
} from '@/lib/store/links'

const A = '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU'
const B = '3nMwKpQ8rTyVbCfXzJ5hLdSaG2eU9NvRqBtHxY4kciWo'

describe('issueLink', () => {
  it('mints a link tied to the offer and the affiliate wallet', () => {
    const link = issueLink('of_seed_drayton', A)
    expect(link.offerId).toBe('of_seed_drayton')
    expect(link.affiliateWallet).toBe(A)
    expect(link.clicks).toBe(0)
  })

  it('is idempotent - asking twice returns the same link, not a duplicate', () => {
    const first = issueLink('of_seed_drayton', A)
    const second = issueLink('of_seed_drayton', A)
    expect(second.id).toBe(first.id)
    expect(listLinksByAffiliate(A)).toHaveLength(1)
  })

  it('gives different affiliates different links for the same offer', () => {
    const forA = issueLink('of_seed_drayton', A)
    const forB = issueLink('of_seed_drayton', B)
    expect(forB.id).not.toBe(forA.id)
  })

  it('gives one affiliate different links for different offers', () => {
    issueLink('of_seed_drayton', A)
    issueLink('of_seed_kestrel', A)
    expect(listLinksByAffiliate(A)).toHaveLength(2)
  })
})

describe('listLinksByAffiliate', () => {
  it('returns only that wallet links', () => {
    issueLink('of_seed_drayton', A)
    issueLink('of_seed_kestrel', B)
    expect(listLinksByAffiliate(A).map((l) => l.offerId)).toEqual(['of_seed_drayton'])
  })

  it('returns an empty array for a wallet with no links', () => {
    expect(listLinksByAffiliate(B)).toEqual([])
  })
})

describe('recordClick', () => {
  it('increments the click count', () => {
    const link = issueLink('of_seed_drayton', A)
    recordClick('of_seed_drayton', A)
    recordClick('of_seed_drayton', A)
    expect(getLink(link.id)!.clicks).toBe(2)
  })

  it('creates the link on a cold click, so a shared URL still attributes', () => {
    // Someone shares their link; the affiliate never opened the app on this
    // browser. The click must not be dropped on the floor.
    recordClick('of_seed_kestrel', B)
    const link = findLink('of_seed_kestrel', B)
    expect(link).not.toBeNull()
    expect(link!.clicks).toBe(1)
  })
})

describe('getLink', () => {
  it('returns null for an unknown id', () => {
    expect(getLink('lk_nope')).toBeNull()
  })
})
