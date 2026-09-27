import type { Category } from '@/lib/types'

/**
 * One coherent, fictional example offer, used both as every field's
 * placeholder text and as the payload for the "Fill with an example"
 * control. Sharing a single object keeps the two in sync, so the form
 * never shows a placeholder that the fill button would contradict.
 *
 * Hollowell Trading Co. is invented for this form, in the same spirit as
 * the seed offers (Drayton Supply Co., Fenwick Grounds, Kestrel Play, ...).
 * Never a real brand. The budget is set well above the commission so the
 * example always clears the "budget must cover at least one payout" rule.
 */
export const EXAMPLE_OFFER: {
  name: string
  description: string
  category: Category
  commission: string
  conversionTerms: string
  targetUrl: string
  budget: string
} = {
  name: 'Hollowell Trading Co.',
  description:
    'Outdoor and camp gear sold direct to consumers across North America. We pay on the first completed order from a new customer, not on signup.',
  category: 'ecommerce',
  commission: '35',
  conversionTerms:
    'A conversion is a first order of $75 or more from a new customer, confirmed after the 14-day return window closes.',
  targetUrl: 'https://example.com/hollowell',
  budget: '1200',
}
