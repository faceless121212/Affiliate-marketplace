// The public seam. Components import from '@/lib/store' and nowhere deeper,
// so Phase 2 can replace these implementations with API calls without
// touching a single component.
export { deriveStatus, listOffers, getOffer, createOffer, topUpEscrow, listOffersByAdvertiser } from './offers'
export { issueLink, getLink, findLink, listLinksByAffiliate, recordClick } from './links'
export {
  recordConversion,
  listConversionsByAffiliate,
  listConversionsByOffer,
  totalEarnedUsd,
  spentUsd,
} from './conversions'
export type { ConversionResult } from './conversions'
export { ensureUser } from './users'
export { SEED_OFFERS, SEED_WALLETS } from './seed'
