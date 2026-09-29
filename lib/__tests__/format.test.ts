import { describe, it, expect } from 'vitest'
import { money, shortAddress, linkUrl, escrowFillPct } from '@/lib/format'

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

describe('escrowFillPct', () => {
  it('is the remaining share of the total, as a percentage', () => {
    expect(escrowFillPct(340, 500)).toBe(68)
  })

  it('clamps an over-drawn or over-full balance into 0-100', () => {
    expect(escrowFillPct(-10, 500)).toBe(0)
    expect(escrowFillPct(900, 500)).toBe(100)
  })

  it('is 0 when there is no total to divide by', () => {
    expect(escrowFillPct(0, 0)).toBe(0)
    expect(escrowFillPct(50, 0)).toBe(0)
  })
})
