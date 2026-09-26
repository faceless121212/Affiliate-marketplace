import { describe, it, expect } from 'vitest'
import { ensureSeeded, SEED_OFFERS } from '@/lib/store/seed'
import { read, KEYS } from '@/lib/store/storage'
import type { Offer } from '@/lib/types'

describe('seed', () => {
  it('writes six offers on first run', () => {
    ensureSeeded()
    expect(read<Offer[]>(KEYS.offers, [])).toHaveLength(6)
  })

  it('is idempotent — a second call does not duplicate', () => {
    ensureSeeded()
    ensureSeeded()
    expect(read<Offer[]>(KEYS.offers, [])).toHaveLength(6)
  })

  it('does not re-seed after the user deletes every offer', () => {
    ensureSeeded()
    // Simulate the user emptying the marketplace; the flag must hold.
    window.localStorage.setItem(KEYS.offers, JSON.stringify([]))
    ensureSeeded()
    expect(read<Offer[]>(KEYS.offers, [])).toHaveLength(0)
  })

  it('marks exactly two offers Verified', () => {
    expect(SEED_OFFERS.filter((o) => o.verified)).toHaveLength(2)
  })

  it('includes one nearly-exhausted and one fully depleted offer', () => {
    const fenwick = SEED_OFFERS.find((o) => o.name === 'Fenwick Grounds')!
    // Nearly exhausted but still fundable: $54 remaining covers three $18 conversions.
    expect(fenwick.status).toBe('active')
    expect(fenwick.escrowRemainingUsd).toBe(54)

    const depleted = SEED_OFFERS.filter((o) => o.status === 'depleted')
    expect(depleted.map((o) => o.name)).toEqual(['Halcyon Tools'])
    expect(depleted[0].escrowRemainingUsd).toBe(0)
  })

  it('never uses a real brand name', () => {
    const names = SEED_OFFERS.map((o) => o.name.toLowerCase())
    for (const real of ['amazon', 'rakuten', 'shopify', 'booking', 'tinder', 'bet365']) {
      expect(names.some((n) => n.includes(real))).toBe(false)
    }
  })

  it('every seeded offer carries a remaining balance no greater than its total', () => {
    for (const o of SEED_OFFERS) {
      expect(o.escrowRemainingUsd).toBeLessThanOrEqual(o.escrowTotalUsd)
    }
  })
})
