import { KEYS, read, write } from './storage'
import type { User } from '@/lib/types'

/**
 * The first connection from an address creates the account; every later
 * connection returns the same one. There is no separate signup.
 */
export function ensureUser(wallet: string): User {
  const users = read<User[]>(KEYS.users, [])
  const existing = users.find((u) => u.wallet === wallet)
  if (existing) return existing

  const user: User = { wallet, createdAt: new Date().toISOString() }
  write(KEYS.users, [...users, user])
  return user
}
