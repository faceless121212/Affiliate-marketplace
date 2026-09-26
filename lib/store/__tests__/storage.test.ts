import { describe, it, expect, vi } from 'vitest'
import { read, write, newId, KEYS } from '@/lib/store/storage'

describe('storage', () => {
  it('round-trips a value', () => {
    write('nativness:v1:test', [{ a: 1 }])
    expect(read('nativness:v1:test', [])).toEqual([{ a: 1 }])
  })

  it('returns the fallback when the key is absent', () => {
    expect(read('nativness:v1:missing', 'fallback')).toBe('fallback')
  })

  it('returns the fallback when stored JSON is corrupt', () => {
    window.localStorage.setItem('nativness:v1:bad', '{not json')
    expect(read('nativness:v1:bad', [])).toEqual([])
  })

  it('does not throw when writing fails, e.g. quota or private mode', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError')
    })
    expect(() => write('nativness:v1:test', { a: 1 })).not.toThrow()
    spy.mockRestore()
  })

  it('mints unique prefixed ids', () => {
    const ids = new Set(Array.from({ length: 200 }, () => newId('of')))
    expect(ids.size).toBe(200)
    expect([...ids][0]).toMatch(/^of_/)
  })

  it('exposes the five v1 keys', () => {
    expect(Object.values(KEYS)).toEqual([
      'nativness:v1:offers',
      'nativness:v1:links',
      'nativness:v1:conversions',
      'nativness:v1:users',
      'nativness:v1:seeded',
    ])
  })
})
