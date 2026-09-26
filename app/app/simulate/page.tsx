'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Money } from '@/components/ui/Money'
import { inputClass } from '@/components/ui/Field'
import { useMyLinks, useMutate } from '@/lib/store/provider'
import { getOffer, recordConversion } from '@/lib/store'
import { useAccount } from '@/lib/wallet/useAccount'
import { money } from '@/lib/format'

type SimMessage =
  | { kind: 'paid'; amountUsd: number; offerName: string; remainingUsd: number }
  | { kind: 'insufficient_escrow' }
  | { kind: 'not_found' }

export default function SimulatePage() {
  const { wallet } = useAccount()
  const links = useMyLinks(wallet)
  const mutate = useMutate()
  const [linkId, setLinkId] = useState('')
  const [message, setMessage] = useState<SimMessage | null>(null)

  const selected = linkId || links[0]?.id || ''

  function confirm() {
    const result = mutate(() => recordConversion(selected))
    if (result.ok) {
      setMessage({
        kind: 'paid',
        amountUsd: result.conversion.amountUsd,
        offerName: result.offer.name,
        remainingUsd: result.offer.escrowRemainingUsd,
      })
    } else if (result.reason === 'insufficient_escrow') {
      setMessage({ kind: 'insufficient_escrow' })
    } else {
      setMessage({ kind: 'not_found' })
    }
  }

  return (
    <section className="max-w-xl space-y-5">
      <header>
        <h1 className="text-lg font-semibold">Simulate a conversion</h1>
        <p className="text-[13px] text-muted">
          A testing tool, standing in for a real postback (coming in Phase 2).
        </p>
      </header>

      {links.length === 0 ? (
        <p className="rounded-lg border border-line bg-surface p-5 text-[13px] text-muted">
          No links yet —{' '}
          <Link href="/app" className="text-info hover:underline">
            browse offers
          </Link>{' '}
          to make one.
        </p>
      ) : (
        <div className="space-y-3 rounded-lg border border-line bg-surface p-4">
          <label className="block">
            <span className="mb-1 block text-[12px] text-muted">Tracking link</span>
            <select
              aria-label="Tracking link"
              className={inputClass}
              value={selected}
              onChange={(e) => {
                setLinkId(e.target.value)
                setMessage(null)
              }}
            >
              {links.map((l) => {
                const offer = getOffer(l.offerId)
                return (
                  <option key={l.id} value={l.id}>
                    {offer ? `${offer.name} — ${money(offer.commissionAmountUsd)} CPA` : l.offerId}
                  </option>
                )
              })}
            </select>
          </label>

          <Button onClick={confirm}>Confirm conversion</Button>
        </div>
      )}

      {message && (
        <p
          role="status"
          className={`rounded-lg border p-3 text-[13px] ${
            message.kind === 'paid'
              ? 'border-paid/35 bg-paid/10 text-paid'
              : 'border-depleted/35 bg-depleted/10 text-depleted'
          }`}
        >
          {message.kind === 'paid' && (
            <>
              Confirmed. Paid <Money value={message.amountUsd} tone="paid" /> to your wallet —{' '}
              <Money value={message.remainingUsd} tone="paid" /> left in escrow.
            </>
          )}
          {message.kind === 'insufficient_escrow' &&
            'Escrow’s empty. This waits on the advertiser’s top-up.'}
          {message.kind === 'not_found' && 'Link not found.'}
        </p>
      )}
    </section>
  )
}
