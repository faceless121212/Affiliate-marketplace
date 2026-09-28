'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { createOffer } from '@/lib/store'
import { useMutate } from '@/lib/store/provider'
import { money } from '@/lib/format'
import type { Category } from '@/lib/types'
import { EXAMPLE_OFFER } from './createOfferExample'
import { OfferDetailsFields, PayoutFields } from './CreateOfferFormFields'

const BLANK = {
  name: '',
  description: '',
  category: 'ecommerce' as Category,
  commission: '',
  conversionTerms: '',
  targetUrl: '',
  budget: '',
}

export type OfferFormState = typeof BLANK

/**
 * Which field failed, alongside what to tell the user about it.
 *
 * This used to be a bare `string`, which `PayoutFields` rendered in the
 * escrow budget's error slot no matter which field had actually failed: a
 * missing offer name reported itself underneath "Escrow budget (USD)".
 * Naming the field lets each message render against the input it is about.
 */
export type OfferFormError = { field: keyof OfferFormState; message: string }

export function CreateOfferForm({ wallet }: { wallet: string }) {
  const mutate = useMutate()
  const [form, setForm] = useState<OfferFormState>(BLANK)
  const [error, setError] = useState<OfferFormError | null>(null)

  const set = (k: keyof OfferFormState) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  // Fills every field with one coherent, fictional sample offer so a
  // first-time advertiser can see what a valid, complete offer looks like
  // before writing their own. Pure convenience: it only sets form state,
  // never calls createOffer, and every field stays editable afterwards.
  function fillExample() {
    setForm({ ...EXAMPLE_OFFER })
    setError(null)
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const commission = Number(form.commission)
    const budget = Number(form.budget)
    const fail = (field: keyof OfferFormState, message: string) => setError({ field, message })

    if (!form.name.trim())
      return fail('name', 'Add an offer name. It’s the first thing affiliates see.')
    if (!form.description.trim()) return fail('description', 'Describe what you’re selling.')
    if (!(commission > 0))
      return fail('commission', 'Commission must be above $0. This is what each conversion pays.')
    if (!form.conversionTerms.trim())
      return fail('conversionTerms', 'Say what counts as a conversion.')
    if (!/^https?:\/\//i.test(form.targetUrl.trim()))
      return fail('targetUrl', 'Target URL must start with http:// or https://')
    // Says the two numbers rather than restating the rule. This is the one
    // failure where the advertiser cannot infer the fix from the label, and
    // both figures are in hand at the moment it fails.
    if (!(budget >= commission))
      return fail(
        'budget',
        `Budget is ${money(budget)}, but one conversion pays ${money(commission)}. Raise the budget to at least ${money(commission)}.`,
      )

    mutate(() =>
      createOffer(
        {
          name: form.name,
          description: form.description,
          category: form.category,
          commissionAmountUsd: commission,
          conversionTerms: form.conversionTerms,
          targetUrl: form.targetUrl,
          escrowBudgetUsd: budget,
        },
        wallet,
      ),
    )
    setForm(BLANK)
    setError(null)
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-lg border border-line bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[12px] text-muted">
          New to this? Every field has an example, or fill the whole form at once.
        </p>
        <Button type="button" variant="secondary" className="shrink-0" onClick={fillExample}>
          Fill with an example
        </Button>
      </div>

      {/* Two columns from `lg` up. The form used to run as one 360px
          column, which stacked six fields deep enough to push the submit
          button below the fold of a 900px screen. Side by side, the whole
          thing fits on one screen. */}
      <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
        <OfferDetailsFields form={form} set={set} error={error} />
        <PayoutFields form={form} set={set} error={error} />
      </div>

      <Button type="submit">Lock budget and list offer</Button>
    </form>
  )
}
