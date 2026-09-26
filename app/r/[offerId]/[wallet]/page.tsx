'use client'

import { use, useEffect, useState } from 'react'
import { getOffer, recordClick } from '@/lib/store'

/**
 * The public end of a tracking link. Not under /app: the visitor is a
 * consumer following an affiliate's link, not a logged-in user.
 *
 * Client-side because click counts live in localStorage in Phase 1. Phase 2
 * turns this into a server route handler.
 */
export default function TrackingRedirect({
  params,
}: {
  params: Promise<{ offerId: string; wallet: string }>
}) {
  const { offerId, wallet } = use(params)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const offer = getOffer(offerId)
    if (!offer) {
      // Fires at most once per (offerId, wallet) mount, when the offer lookup
      // fails; it does not cascade. Mirrors the disable in lib/useMounted.ts.
      // eslint-disable-next-line react-hooks/set-state-in-effect -- this effect must run client-side only, since getOffer reads localStorage, which is unavailable during SSR.
      setFailed(true)
      return
    }
    recordClick(offerId, decodeURIComponent(wallet))
    window.location.replace(offer.targetUrl)
  }, [offerId, wallet])

  return (
    <main className="grid min-h-dvh place-items-center px-4 text-center">
      {failed ? (
        <p className="text-[13px] text-muted">
          This tracking link points to an offer that no longer exists.
        </p>
      ) : (
        <p className="text-[13px] text-muted">Redirecting…</p>
      )}
    </main>
  )
}
