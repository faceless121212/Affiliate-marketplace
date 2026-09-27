import { describe, it, expect } from 'vitest'
import {
  AVATAR_COUNT,
  AVATAR_PALETTE,
  avatarIndexFor,
  avatarPaletteKeyFor,
} from '@/lib/offerAvatar'

describe('avatarIndexFor', () => {
  it('is deterministic: the same id always yields the same mark', () => {
    const id = 'of_seed_drayton'
    const first = avatarIndexFor(id)
    for (let i = 0; i < 10; i++) {
      expect(avatarIndexFor(id)).toBe(first)
    }
  })

  it('spreads different ids across all eight marks, not just a few', () => {
    const indexes = new Set(
      Array.from({ length: 200 }, (_, i) => avatarIndexFor(`of_${i}_${i * 31}`)),
    )
    expect(indexes.size).toBe(AVATAR_COUNT)
  })

  it('stays in range for any id', () => {
    for (const id of ['', 'a', 'of_seed_halcyon', 'x'.repeat(50)]) {
      const index = avatarIndexFor(id)
      expect(index).toBeGreaterThanOrEqual(0)
      expect(index).toBeLessThan(AVATAR_COUNT)
    }
  })

  // Regression for "do not use array position": two ids that would sit at
  // the same position in a filtered/reordered list must not collide just
  // because of that position; only the id content decides the mark.
  it('does not depend on list position, only on the id itself', () => {
    const a = avatarIndexFor('of_alpha')
    const b = avatarIndexFor('of_bravo')
    // Same ids in a different "position" (simulated by reordering an array)
    // still resolve to the same marks.
    const reordered = [avatarIndexFor('of_bravo'), avatarIndexFor('of_alpha')]
    expect(reordered).toEqual([b, a])
  })
})

describe('avatarPaletteKeyFor', () => {
  it('is deterministic: the same id always yields the same tint', () => {
    const id = 'of_seed_meridian'
    const first = avatarPaletteKeyFor(id)
    for (let i = 0; i < 10; i++) {
      expect(avatarPaletteKeyFor(id)).toBe(first)
    }
  })

  it('only ever returns a key present in the palette', () => {
    for (let i = 0; i < 50; i++) {
      const key = avatarPaletteKeyFor(`of_${i}`)
      expect(Object.keys(AVATAR_PALETTE)).toContain(key)
    }
  })

  it('never assigns the lime escrow accent as a mark colour', () => {
    for (const { mark } of Object.values(AVATAR_PALETTE)) {
      expect(mark.toUpperCase()).not.toBe('#C3FF00')
    }
  })
})
