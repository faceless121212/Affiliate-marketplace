import { describe, it, expect } from 'vitest'
import { ensureUser } from '@/lib/store/users'

const W = '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU'

describe('ensureUser', () => {
  it('creates an account on first connection', () => {
    expect(ensureUser(W).wallet).toBe(W)
  })

  it('returns the same account on every later connection', () => {
    const first = ensureUser(W)
    const second = ensureUser(W)
    expect(second.createdAt).toBe(first.createdAt)
  })
})
