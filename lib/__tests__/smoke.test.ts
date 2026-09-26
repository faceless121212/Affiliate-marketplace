import { describe, it, expect } from 'vitest'
import { round2 } from '@/lib/format'

describe('round2', () => {
  it('trims binary float drift to two decimals', () => {
    expect(round2(750 - 12.5 * 3)).toBe(712.5)
    expect(round2(0.1 + 0.2)).toBe(0.3)
  })

  it('leaves clean values untouched', () => {
    expect(round2(24)).toBe(24)
  })
})
