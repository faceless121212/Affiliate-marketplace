import { KEYS, read, write } from './storage'
import type { Offer } from '@/lib/types'

/** Fictional advertiser wallets. Plausible base58, not real accounts. */
export const SEED_WALLETS = {
  drayton: '4QvYm2NqHRBxTtLpZ8cWgKdF3hSnA9uJeVrX6bPyMzCk',
  meridian: '9hKpR3wLnBqYc5TdVmZ2xGfJ8sAeU7NvQrHtX4byCiWo',
} as const

const at = (daysAgo: number) =>
  new Date(Date.UTC(2026, 8, 26 - daysAgo, 12, 0, 0)).toISOString()

export const SEED_OFFERS: Offer[] = [
  {
    id: 'of_seed_drayton',
    advertiserWallet: SEED_WALLETS.drayton,
    name: 'Drayton Supply Co.',
    description:
      'Workwear and site equipment sold direct to trade customers across the UK and Ireland. We pay on first completed order from a new account, not on signup.',
    category: 'ecommerce',
    commissionAmountUsd: 24,
    conversionTerms:
      'A conversion is a first order of $60 or more from a new trade account, confirmed after the 14-day returns window closes.',
    targetUrl: 'https://example.com/drayton',
    escrowTotalUsd: 500,
    escrowRemainingUsd: 340,
    verified: true,
    status: 'active',
    createdAt: at(31),
  },
  {
    id: 'of_seed_meridian',
    advertiserWallet: SEED_WALLETS.meridian,
    name: 'Meridian Ledger',
    description:
      "Double-entry bookkeeping for small agencies. Conversion is a paid subscription that survives the trial, so affiliates are not paid for tyre-kickers.",
    category: 'saas',
    commissionAmountUsd: 65,
    conversionTerms:
      'A conversion is a paid plan still active on day 30. Trials that lapse do not count and do not draw down escrow.',
    targetUrl: 'https://example.com/meridian',
    escrowTotalUsd: 4000,
    escrowRemainingUsd: 2600,
    verified: true,
    status: 'active',
    createdAt: at(24),
  },
  {
    id: 'of_seed_kestrel',
    advertiserWallet: SEED_WALLETS.drayton,
    name: 'Kestrel Play',
    description:
      'Licensed casino and sportsbook operating in regulated markets only. High CPA, strict geo rules — read the terms before sending traffic.',
    category: 'igaming',
    commissionAmountUsd: 110,
    conversionTerms:
      'A conversion is a verified depositing player with a first deposit of $50 or more, from an approved jurisdiction. Self-excluded and duplicate accounts are rejected.',
    targetUrl: 'https://example.com/kestrel',
    escrowTotalUsd: 3300,
    escrowRemainingUsd: 1430,
    verified: false,
    status: 'active',
    createdAt: at(17),
  },
  {
    id: 'of_seed_coastline',
    advertiserWallet: SEED_WALLETS.meridian,
    name: 'Coastline',
    description:
      'A slower dating app built around shared plans rather than swiping. Low commission, high volume, no incentive traffic.',
    category: 'dating',
    commissionAmountUsd: 12.5,
    conversionTerms:
      'A conversion is a completed profile with a verified photo and one sent message. Incentivised or bot traffic is rejected and does not draw down escrow.',
    targetUrl: 'https://example.com/coastline',
    escrowTotalUsd: 750,
    escrowRemainingUsd: 187.5,
    verified: false,
    status: 'active',
    createdAt: at(11),
  },
  {
    id: 'of_seed_fenwick',
    advertiserWallet: SEED_WALLETS.drayton,
    name: 'Fenwick Grounds',
    description:
      "Single-origin coffee on a rolling subscription. Escrow is nearly spent — top-ups are at the advertiser's discretion, so check the balance before you invest in creative.",
    category: 'ecommerce',
    commissionAmountUsd: 18,
    conversionTerms:
      'A conversion is a subscription that reaches its second delivery. One-off purchases do not qualify.',
    targetUrl: 'https://example.com/fenwick',
    escrowTotalUsd: 900,
    escrowRemainingUsd: 54,
    verified: false,
    status: 'active',
    createdAt: at(6),
  },
  {
    id: 'of_seed_halcyon',
    advertiserWallet: SEED_WALLETS.meridian,
    name: 'Halcyon Tools',
    description:
      'Design handoff tooling for product teams. Escrow is exhausted: no further conversions can be funded until the advertiser tops up.',
    category: 'saas',
    commissionAmountUsd: 40,
    conversionTerms:
      'A conversion is a paid seat active on day 14. This offer cannot currently pay out — its escrow balance is zero.',
    targetUrl: 'https://example.com/halcyon',
    escrowTotalUsd: 1200,
    escrowRemainingUsd: 0,
    verified: false,
    status: 'depleted',
    createdAt: at(3),
  },
]

/**
 * Seeds once per browser. The flag is separate from the offers array so that
 * a user who deletes every offer does not get the demo data resurrected.
 */
export function ensureSeeded(): void {
  if (read<boolean>(KEYS.seeded, false)) return
  write(KEYS.offers, SEED_OFFERS)
  write(KEYS.seeded, true)
}
