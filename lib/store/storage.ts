export const KEYS = {
  offers: 'nativness:v1:offers',
  links: 'nativness:v1:links',
  conversions: 'nativness:v1:conversions',
  users: 'nativness:v1:users',
  seeded: 'nativness:v1:seeded',
} as const

/**
 * localStorage is unavailable during SSR and can throw in private mode or
 * when the quota is exhausted. Every access is guarded; callers get the
 * fallback rather than an exception.
 */
export function read<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(key)
    return raw === null ? fallback : (JSON.parse(raw) as T)
  } catch {
    return fallback
  }
}

export function write<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Quota exceeded or storage blocked. Phase 1 degrades rather than crashes.
  }
}

let counter = 0
export function newId(prefix: string): string {
  counter += 1
  return `${prefix}_${Date.now().toString(36)}${counter.toString(36)}${Math.random()
    .toString(36)
    .slice(2, 8)}`
}
