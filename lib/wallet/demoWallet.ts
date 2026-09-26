'use client'

/**
 * Development-only wallet bypass.
 *
 * Connecting a wallet IS the login in Nativness, which means the whole app is
 * unreachable without a browser extension installed. That is correct for the
 * product and wrong for local development, so this provides a way in.
 *
 * It is gated on NODE_ENV so it cannot exist in a production build: `isDevMode`
 * is false there, the gate never offers it, and `readDemoWallet` always returns
 * null regardless of what is in localStorage.
 */
const KEY = 'nativness:dev:demo-wallet'

/** A fixed, obviously-fake base58 address so demo data is recognisable as such. */
export const DEMO_WALLET = 'DEVdemo1111111111111111111111111111111111111'

export const isDevMode = process.env.NODE_ENV === 'development'

export function readDemoWallet(): string | null {
  if (!isDevMode || typeof window === 'undefined') return null
  try {
    return window.localStorage.getItem(KEY)
  } catch {
    return null
  }
}

export function enableDemoWallet(): void {
  if (!isDevMode || typeof window === 'undefined') return
  try {
    window.localStorage.setItem(KEY, DEMO_WALLET)
  } catch {
    // Storage blocked; nothing to do but leave the gate as it was.
  }
}

export function clearDemoWallet(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(KEY)
  } catch {
    // ignore
  }
}
