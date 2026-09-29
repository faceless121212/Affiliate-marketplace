'use client'

import { useEffect, useState } from 'react'
import { Money } from '@/components/ui/Money'
import { EscrowMeter } from '@/components/app/EscrowMeter'
import { Badge } from '@/components/ui/Badge'
import { OfferAvatar } from '@/components/ui/OfferAvatar'
import { SEED_OFFERS } from '@/lib/store'

// Looked up by id, not position: a reorder of the seed array must not change
// which offer the hero demonstrates.
const OFFER = SEED_OFFERS.find((o) => o.id === 'of_seed_drayton') ?? SEED_OFFERS[0]
const TICK_MS = 3400

/**
 * The hero's right column: the escrow mechanic running, rather than described.
 *
 * The landing page used to spend eight text sections narrating a thing the
 * product can simply do on screen. This renders one real seeded offer and
 * drains its escrow by one commission every few seconds, so a visitor sees
 * the balance fall and the payout land before reading a word about it.
 *
 * It reads SEED_OFFERS, the same data /app serves, so the demo and the
 * product cannot drift apart. It is labelled as the demo marketplace in both
 * the header and the footer: Phase 1 escrow is a number in localStorage, and
 * nothing here may imply otherwise.
 */
export function LiveEscrowDemo() {
  const [remaining, setRemaining] = useState(OFFER.escrowRemainingUsd)
  const [justPaid, setJustPaid] = useState(false)

  useEffect(() => {
    // Read live and subscribed to, not sampled once: a viewer who turns
    // reduced motion on mid-session must have the timer stop, not keep
    // running until they reload.
    const query = window.matchMedia?.('(prefers-reduced-motion: reduce)')

    // The running balance lives here rather than inside a state updater, so
    // the tick can tell a payout from a reset without a side effect in an
    // updater function. It survives stop/start when the preference flips.
    let balance = OFFER.escrowRemainingUsd
    let intervalId: ReturnType<typeof setInterval> | undefined
    let paidTimeout: ReturnType<typeof setTimeout> | undefined

    const tick = () => {
      const next = balance - OFFER.commissionAmountUsd
      if (next < 0) {
        // Reset rather than go negative. The balance can never fund a
        // payout it cannot cover, which is the rule the real store enforces
        // in lib/store/conversions.ts. Nothing was paid on this tick, so
        // no "Conversion confirmed" flash.
        balance = OFFER.escrowRemainingUsd
        setRemaining(balance)
        return
      }
      balance = next
      setRemaining(balance)
      setJustPaid(true)
      clearTimeout(paidTimeout)
      paidTimeout = setTimeout(() => setJustPaid(false), 2100)
    }

    const stop = () => {
      clearInterval(intervalId)
      clearTimeout(paidTimeout)
      intervalId = undefined
    }

    const start = () => {
      if (intervalId === undefined) intervalId = setInterval(tick, TICK_MS)
    }

    // A viewer who asked for less motion gets the card at rest, not a
    // silently-jumping figure: no timer runs at all.
    const onPreferenceChange = () => {
      if (query?.matches) {
        stop()
        setJustPaid(false)
      } else {
        start()
      }
    }

    if (!query?.matches) start()
    query?.addEventListener?.('change', onPreferenceChange)

    return () => {
      query?.removeEventListener?.('change', onPreferenceChange)
      stop()
    }
  }, [])

  const covers = Math.floor(remaining / OFFER.commissionAmountUsd)

  return (
    <div
      data-testid="live-escrow-demo"
      className="overflow-hidden rounded-2xl border border-line bg-canvas shadow-card-lg"
    >
      <div className="flex items-center justify-between border-b border-line bg-surface px-4 py-2.5">
        <span className="flex items-center gap-2 font-mono text-caption uppercase tracking-[0.09em] text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-paid" aria-hidden />
          Live demo marketplace
        </span>
        <span className="font-mono text-caption uppercase tracking-[0.09em] text-muted">Devnet</span>
      </div>

      <div className="p-5">
        <div className="mb-3.5 flex items-center gap-2.5">
          <OfferAvatar offer={OFFER} />
          <div className="min-w-0">
            <p className="truncate text-lead font-semibold">{OFFER.name}</p>
            <p className="text-caption text-muted">Ecommerce</p>
          </div>
          {OFFER.verified && (
            <span className="ml-auto">
              <Badge tone="paid">Verified</Badge>
            </span>
          )}
        </div>

        {/* The app's own meter, fed the running balance, so the demo is the
            product's component rather than a lookalike. The wrapper carries
            the test hook: EscrowMeter is shared and stays free of it. */}
        <div data-testid="demo-remaining">
          <EscrowMeter offer={{ ...OFFER, escrowRemainingUsd: remaining }} />
        </div>
        <p className="mt-1.5 font-mono tnum text-caption text-muted">
          Covers {covers} conversion{covers === 1 ? '' : 's'}
        </p>

        <div className="mt-3.5 flex items-baseline justify-between border-t border-line pt-2.5 text-caption text-muted">
          <span>Commission per conversion</span>
          <Money value={OFFER.commissionAmountUsd} className="text-body" />
        </div>

        <div className="mt-3 h-8">
          <p
            className={`flex h-full items-center gap-2 rounded-lg border border-paid/20 bg-paid/[0.07] px-3 text-caption text-paid transition-opacity duration-500 ${
              justPaid ? 'opacity-100' : 'opacity-0'
            }`}
            aria-hidden
          >
            Conversion confirmed, <Money value={OFFER.commissionAmountUsd} tone="paid" className="text-caption" /> paid
          </p>
        </div>
      </div>

      <p className="border-t border-line bg-surface p-2.5 text-center text-caption text-muted">
        Real data from the demo marketplace. Escrow is simulated in Phase 1.
      </p>
    </div>
  )
}
