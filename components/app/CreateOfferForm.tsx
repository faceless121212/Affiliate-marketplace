'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Field, inputClass } from '@/components/ui/Field'
import { createOffer } from '@/lib/store'
import { useMutate } from '@/lib/store/provider'
import { CATEGORIES, type Category } from '@/lib/types'

const BLANK = {
  name: '',
  description: '',
  category: 'ecommerce' as Category,
  commission: '',
  conversionTerms: '',
  targetUrl: '',
  budget: '',
}

export function CreateOfferForm({ wallet }: { wallet: string }) {
  const mutate = useMutate()
  const [form, setForm] = useState(BLANK)
  const [error, setError] = useState<string | null>(null)

  const set = (k: keyof typeof BLANK) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const commission = Number(form.commission)
    const budget = Number(form.budget)

    if (!form.name.trim()) return setError('Give the offer a name.')
    if (!form.description.trim()) return setError('Describe what the advertiser sells.')
    if (!(commission > 0)) return setError('Commission must be greater than zero.')
    if (!form.conversionTerms.trim()) return setError('State what counts as a conversion.')
    if (!/^https?:\/\//i.test(form.targetUrl.trim()))
      return setError('The target URL must start with http:// or https://')
    if (!(budget >= commission))
      return setError('The escrow budget must cover at least one conversion.')

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
    <form onSubmit={submit} className="space-y-3 rounded-md border border-line bg-surface p-4">
      <Field label="Offer name">
        <input aria-label="Offer name" className={inputClass} value={form.name} onChange={set('name')} />
      </Field>

      <Field label="Description">
        <textarea
          aria-label="Description"
          rows={3}
          className={inputClass}
          value={form.description}
          onChange={set('description')}
        />
      </Field>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Category">
          <select
            aria-label="Category"
            className={inputClass}
            value={form.category}
            onChange={set('category')}
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Commission per conversion (USD)" hint="CPA: a fixed amount per conversion.">
          <input
            aria-label="Commission per conversion (USD)"
            inputMode="decimal"
            className={`${inputClass} font-mono tnum`}
            value={form.commission}
            onChange={set('commission')}
          />
        </Field>
      </div>

      <Field label="Conversion terms" hint="Be specific. Affiliates price their effort on this.">
        <textarea
          aria-label="Conversion terms"
          rows={2}
          className={inputClass}
          value={form.conversionTerms}
          onChange={set('conversionTerms')}
        />
      </Field>

      <Field label="Target URL">
        <input
          aria-label="Target URL"
          className={`${inputClass} font-mono text-[12px]`}
          placeholder="https://"
          value={form.targetUrl}
          onChange={set('targetUrl')}
        />
      </Field>

      <Field
        label="Escrow budget (USD)"
        hint="Locked before the offer goes live. Affiliates see this balance, not a promise."
        error={error ?? undefined}
      >
        <input
          aria-label="Escrow budget (USD)"
          inputMode="decimal"
          className={`${inputClass} font-mono tnum`}
          value={form.budget}
          onChange={set('budget')}
        />
      </Field>

      <Button type="submit">Lock budget and list offer</Button>
    </form>
  )
}
