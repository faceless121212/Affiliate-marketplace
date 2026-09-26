export type Category = 'ecommerce' | 'igaming' | 'dating' | 'saas' | 'finance' | 'other'

export const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'ecommerce', label: 'Ecommerce' },
  { value: 'igaming', label: 'iGaming' },
  { value: 'dating', label: 'Dating' },
  { value: 'saas', label: 'SaaS' },
  { value: 'finance', label: 'Finance' },
  { value: 'other', label: 'Other' },
]

export type User = {
  wallet: string
  createdAt: string
}

export type OfferStatus = 'active' | 'depleted'

export type Offer = {
  id: string
  advertiserWallet: string
  name: string
  description: string
  category: Category
  /** CPA only: a fixed USD amount per confirmed conversion. */
  commissionAmountUsd: number
  conversionTerms: string
  targetUrl: string
  escrowTotalUsd: number
  escrowRemainingUsd: number
  /** Seeded only. Never self-set by a user. */
  verified: boolean
  status: OfferStatus
  createdAt: string
}

export type TrackingLink = {
  id: string
  offerId: string
  affiliateWallet: string
  clicks: number
  createdAt: string
}

/** A confirmed conversion IS the payout record in v1. */
export type Conversion = {
  id: string
  linkId: string
  offerId: string
  affiliateWallet: string
  /** Snapshotted at confirmation so history stays correct if commission changes. */
  amountUsd: number
  confirmedAt: string
  source: 'simulator'
}

export type OfferDraft = Pick<
  Offer,
  'name' | 'description' | 'category' | 'commissionAmountUsd' | 'conversionTerms' | 'targetUrl'
> & { escrowBudgetUsd: number }
