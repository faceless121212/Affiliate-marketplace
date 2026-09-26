import { describe, it, expect } from 'vitest'
import { money, shortAddress, linkUrl } from '@/lib/format'

describe('money', () => {
  it('always shows two decimals', () => {
    expect(money(340)).toBe('$340.00')
    expect(money(12.5)).toBe('$12.50')
    expect(money(0)).toBe('$0.00')
  })

  it('groups thousands', () => {
    expect(money(2600)).toBe('$2,600.00')
  })
})

describe('shortAddress', () => {
  it('keeps four characters each end', () => {
    expect(shortAddress('7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU')).toBe('7xKX…gAsU')
  })

  it('leaves a short string alone rather than padding it', () => {
    expect(shortAddress('abc')).toBe('abc')
  })
})

describe('linkUrl', () => {
  it('embeds the offer id and the affiliate wallet', () => {
    expect(linkUrl('of_seed_drayton', '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU')).toBe(
      'nativness.app/r/of_seed_drayton/7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    )
  })
})
