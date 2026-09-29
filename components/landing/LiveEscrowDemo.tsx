'use client'

import { useEffect, useState } from 'react'
import { Money } from '@/components/ui/Money'
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
    // A viewer who asked for less motion gets the card at rest, not a
    // silently-jumping figure: no timer starts at all.
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return

    let resetTimeout: ReturnType<typeof setTimeout> | undefined

    const id = setInterval(() => {
      setRemaining((value) => {
        // Reset rather than go negative. The balance can never fund a
        // payout it cannot cover, which is the rule the real store enforces
        // in lib/store/conversions.ts.
        if (value - OFFER.commissionAmountUsd < 0) return OFFER.escrowRemainingUsd
        return value - OFFER.commissionAmountUsd
      })
      setJustPaid(true)
      clearTimeout(resetTimeout)
      resetTimeout = setTimeout(() => setJustPaid(false), 2100)
    }, TICK_MS)

    return () => {
      clearInterval(id)
      clearTimeout(resetTimeout)
    }
  }, [])

  const pct = Math.max(0, Math.min(100, (remaining / OFFER.escrowTotalUsd) * 100))
  const covers = Math.floor(remaining / OFFER.commissionAmountUsd)

  return (
    <div
      data-testid="live-escrow-demo"
      className="overflow-hidden rounded-2xl border border-line bg-canvas shadow-card-lg"
    >
      <div className="flex items-center justify-between border-b border-line bg-surface px-4 py-2.5">
        <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.09em] text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-paid" aria-hidden />
          Live demo marketplace
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.09em] text-muted">Devnet</span>
      </div>

      <div className="p-5">
        <div className="mb-3.5 flex items-center gap-2.5">
          <OfferAvatar offer={OFFER} />
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold">{OFFER.name}</p>
            <p className="text-[11.5px] text-muted">Ecommerce</p>
          </div>
          {OFFER.verified && (
            <span className="ml-auto">
              <Badge tone="paid">Verified</Badge>
            </span>
          )}
        </div>

        <p className="text-[11.5px] text-muted">Escrow remaining</p>
        <p className="mt-0.5 flex flex-wrap items-baseline gap-x-1.5">
          <span data-testid="demo-remaining">
            <Money value={remaining} tone="escrow" className="text-[28px] font-bold leading-none" />
          </span>
          <span className="font-mono tnum text-[12px] text-muted">
            / <Money value={OFFER.escrowTotalUsd} tone="muted" className="text-[12px]" />
          </span>
        </p>

        <div className="mt-3 h-2 overflow-hidden rounded-full bg-inset">
          <div
            className="h-full rounded-full bg-escrow transition-[width] duration-700 ease-out motion-reduce:transition-none"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-1.5 font-mono tnum text-[10.5px] text-muted">
          Covers {covers} conversion{covers === 1 ? '' : 's'}
        </p>

        <div className="mt-3.5 flex items-baseline justify-between border-t border-line pt-2.5 text-[11.5px] text-muted">
          <span>Commission per conversion</span>
          <Money value={OFFER.commissionAmountUsd} className="text-[13px]" />
        </div>

        <div className="mt-3 h-8">
          <p
            className={`flex h-full items-center gap-2 rounded-lg border border-paid/20 bg-paid/[0.07] px-3 text-[12px] text-paid transition-opacity duration-500 ${
              justPaid ? 'opacity-100' : 'opacity-0'
            }`}
            aria-hidden
          >
            Conversion confirmed, <Money value={OFFER.commissionAmountUsd} tone="paid" className="text-[12px]" /> paid
          </p>
        </div>
      </div>

      <p className="border-t border-line bg-surface p-2.5 text-center text-[11px] text-muted">
        Real data from the demo marketplace. Escrow is simulated in Phase 1.
      </p>
    </div>
  )
}
