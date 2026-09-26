'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Field, inputClass } from '@/components/ui/Field'
import { topUpEscrow } from '@/lib/store'
import { useMutate } from '@/lib/store/provider'

export function TopUpDialog({ offerId }: { offerId: string }) {
  const mutate = useMutate()
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [error, setError] = useState<string | null>(null)

  if (!open) {
    return (
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Top up escrow
      </Button>
    )
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const value = Number(amount)
    if (!(value > 0)) return setError('Enter an amount greater than zero.')
    mutate(() => topUpEscrow(offerId, value))
    setAmount('')
    setError(null)
    setOpen(false)
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <Field label="Amount to add (USD)" error={error ?? undefined}>
        <input
          aria-label="Amount to add (USD)"
          inputMode="decimal"
          className={`${inputClass} font-mono tnum`}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </Field>
      <div className="flex gap-2">
        <Button type="submit">Add to escrow</Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
