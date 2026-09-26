'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { inputClass } from '@/components/ui/Field'
import { useMyLinks, useMutate } from '@/lib/store/provider'
import { getOffer, recordConversion } from '@/lib/store'
import { useAccount } from '@/lib/wallet/useAccount'
import { money } from '@/lib/format'

export default function SimulatePage() {
  const { wallet } = useAccount()
  const links = useMyLinks(wallet)
  const mutate = useMutate()
  const [linkId, setLinkId] = useState('')
  const [message, setMessage] = useState<{ tone: 'paid' | 'depleted'; text: string } | null>(null)

  const selected = linkId || links[0]?.id || ''

  function confirm() {
    const result = mutate(() => recordConversion(selected))
    if (result.ok) {
      setMessage({
        tone: 'paid',
        text: `Conversion confirmed. Paid ${money(result.conversion.amountUsd)} to your wallet. ${result.offer.name} now holds ${money(result.offer.escrowRemainingUsd)} in escrow.`,
      })
    } else if (result.reason === 'insufficient_escrow') {
      setMessage({
        tone: 'depleted',
        text: 'Not enough escrow. This offer cannot fund another conversion until the advertiser tops up.',
      })
    } else {
      setMessage({ tone: 'depleted', text: 'That tracking link could not be found.' })
    }
  }

  return (
    <section className="max-w-xl space-y-5">
      <header>
        <h1 className="text-lg font-semibold">Simulate a conversion</h1>
        <p className="text-[13px] text-muted">
          A testing tool. It stands in for a real postback from an advertiser’s backend, which
          Phase 2 adds as an API endpoint.
        </p>
      </header>

      {links.length === 0 ? (
        <p className="rounded-md border border-line bg-surface p-5 text-[13px] text-muted">
          You have no tracking links yet.{' '}
          <Link href="/app" className="text-escrow">
            Browse offers
          </Link>{' '}
          and generate one first.
        </p>
      ) : (
        <div className="space-y-3 rounded-md border border-line bg-surface p-4">
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
          className={`rounded-md border p-3 text-[13px] ${
            message.tone === 'paid'
              ? 'border-paid/35 bg-paid/10 text-paid'
              : 'border-depleted/35 bg-depleted/10 text-depleted'
          }`}
        >
          {message.text}
        </p>
      )}
    </section>
  )
}
