export type Category = 'ecommerce' | 'igaming' | 'dating' | 'saas' | 'finance' | 'other'

export const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'ecommerce', label: 'Ecommerce' },
  { value: 'igaming', label: 'iGaming' },
  { value: 'dating', label: 'Dating' },
  { value: 'saas', label: 'SaaS' },
  { value: 'finance', label: 'Finance' },
  { value: 'other', label: 'Other' },
]

export type Offer = {
  id: string
  advertiser: string
  name: string
  description: string
  category: Category
  commissionUsd: number
  terms: string
  escrowTotalUsd: number
  escrowRemainingUsd: number
  verified: boolean
  mine?: boolean
  logo?: string
}

// Fictional demo offers, mirrored from the Nativness prototype's seed data.
export const SEED_OFFERS: Offer[] = [
  {
    id: 'drayton', logo: '/logos/drayton.png', advertiser: '4QvY…MzCk', name: 'Drayton Supply Co.', category: 'ecommerce', commissionUsd: 24,
    description: 'Workwear and site equipment sold direct to trade customers across the UK and Ireland. We pay on first completed order from a new account, not on signup.',
    terms: 'A conversion is a first order of $60 or more from a new trade account, confirmed after the 14-day returns window closes.',
    escrowTotalUsd: 500, escrowRemainingUsd: 340, verified: true,
  },
  {
    id: 'meridian', logo: '/logos/meridian.png', advertiser: '9hKp…CiWo', name: 'Meridian Ledger', category: 'saas', commissionUsd: 65,
    description: 'Double-entry bookkeeping for small agencies. Conversion is a paid subscription that survives the trial, so affiliates are not paid for tyre-kickers.',
    terms: 'A conversion is a paid plan still active on day 30. Trials that lapse do not count and do not draw down escrow.',
    escrowTotalUsd: 4000, escrowRemainingUsd: 2600, verified: true,
  },
  {
    id: 'kestrel', logo: '/logos/kestrel.png', advertiser: '4QvY…MzCk', name: 'Kestrel Play', category: 'igaming', commissionUsd: 110,
    description: 'Licensed casino and sportsbook operating in regulated markets only. High CPA, strict geo rules — read the terms before sending traffic.',
    terms: 'A conversion is a verified depositing player with a first deposit of $50 or more, from an approved jurisdiction. Self-excluded and duplicate accounts are rejected.',
    escrowTotalUsd: 3300, escrowRemainingUsd: 1430, verified: false,
  },
  {
    id: 'coastline', logo: '/logos/coastline.png', advertiser: '9hKp…CiWo', name: 'Coastline', category: 'dating', commissionUsd: 12.5,
    description: 'A slower dating app built around shared plans rather than swiping. Low commission, high volume, no incentive traffic.',
    terms: 'A conversion is a completed profile with a verified photo and one sent message. Incentivised or bot traffic is rejected and does not draw down escrow.',
    escrowTotalUsd: 750, escrowRemainingUsd: 187.5, verified: false,
  },
  {
    id: 'fenwick', logo: '/logos/fenwick.png', advertiser: '4QvY…MzCk', name: 'Fenwick Grounds', category: 'ecommerce', commissionUsd: 18,
    description: "Single-origin coffee on a rolling subscription. Escrow is nearly spent — top-ups are at the advertiser's discretion, so check the balance before you invest in creative.",
    terms: 'A conversion is a subscription that reaches its second delivery. One-off purchases do not qualify.',
    escrowTotalUsd: 900, escrowRemainingUsd: 54, verified: false,
  },
  {
    id: 'halcyon', logo: '/logos/halcyon.png', advertiser: '9hKp…CiWo', name: 'Halcyon Tools', category: 'saas', commissionUsd: 40,
    description: 'Design handoff tooling for product teams. Escrow is exhausted: no further conversions can be funded until the advertiser tops up.',
    terms: 'A conversion is a paid seat active on day 14. This offer cannot currently pay out — its escrow balance is zero.',
    escrowTotalUsd: 1200, escrowRemainingUsd: 0, verified: false,
  },
]

export const money = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })

export const TOTAL_LOCKED = SEED_OFFERS.reduce((s, o) => s + o.escrowRemainingUsd, 0)

export const categoryLabel = (c: Category) => CATEGORIES.find(x => x.value === c)!.label

export const payoutsLeft = (o: Offer) => Math.floor(o.escrowRemainingUsd / o.commissionUsd)
