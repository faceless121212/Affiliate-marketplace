'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { createOffer } from '@/lib/store'
import { useMutate } from '@/lib/store/provider'
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

export function CreateOfferForm({ wallet }: { wallet: string }) {
  const mutate = useMutate()
  const [form, setForm] = useState<OfferFormState>(BLANK)
  const [error, setError] = useState<string | null>(null)

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

    if (!form.name.trim()) return setError('Give it a name.')
    if (!form.description.trim()) return setError('Describe what you’re selling.')
    if (!(commission > 0)) return setError('Enter a commission above zero.')
    if (!form.conversionTerms.trim()) return setError('Say what counts as a conversion.')
    if (!/^https?:\/\//i.test(form.targetUrl.trim()))
      return setError('The URL must start with http:// or https://')
    if (!(budget >= commission))
      return setError('Budget must cover at least one payout.')

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

      <OfferDetailsFields form={form} set={set} />
      <PayoutFields form={form} set={set} error={error} />

      <Button type="submit">Lock budget and list offer</Button>
    </form>
  )
}
