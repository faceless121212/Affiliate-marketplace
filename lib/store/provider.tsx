'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import {
  listConversionsByAffiliate,
  listLinksByAffiliate,
  listOffers,
  listOffersByAdvertiser,
  getOffer,
} from '.'
import type { Category, Conversion, Offer, TrackingLink } from '@/lib/types'

type Ctx = { version: number; bump: () => void }
const StoreCtx = createContext<Ctx | null>(null)

/**
 * Holds no domain data. A version counter is bumped on every mutation, and
 * the hooks below re-read from the store whenever it changes. That keeps
 * localStorage as the single source of truth while still re-rendering every
 * reader — which is what makes a new offer appear in the grid with no reload.
 */
export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [version, setVersion] = useState(0)
  const bump = useCallback(() => setVersion((v) => v + 1), [])
  const value = useMemo(() => ({ version, bump }), [version, bump])
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>
}

function useCtx(): Ctx {
  const ctx = useContext(StoreCtx)
  if (!ctx) throw new Error('Store hooks must be used inside <StoreProvider>')
  return ctx
}

export function useStoreVersion(): number {
  return useCtx().version
}

/** Runs a store write, then re-renders every reader. */
export function useMutate() {
  const { bump } = useCtx()
  return useCallback(
    <T,>(write: () => T): T => {
      const result = write()
      bump()
      return result
    },
    [bump],
  )
}

export function useOffers(opts: { category?: Category; query?: string } = {}): Offer[] {
  const version = useStoreVersion()
  const { category, query } = opts
  return useMemo(() => listOffers({ category, query }), [version, category, query])
}

export function useOffer(id: string): Offer | null {
  const version = useStoreVersion()
  return useMemo(() => getOffer(id), [version, id])
}

export function useMyOffers(wallet: string | null): Offer[] {
  const version = useStoreVersion()
  return useMemo(() => (wallet ? listOffersByAdvertiser(wallet) : []), [version, wallet])
}

export function useMyLinks(wallet: string | null): TrackingLink[] {
  const version = useStoreVersion()
  return useMemo(() => (wallet ? listLinksByAffiliate(wallet) : []), [version, wallet])
}

export function useMyConversions(wallet: string | null): Conversion[] {
  const version = useStoreVersion()
  return useMemo(() => (wallet ? listConversionsByAffiliate(wallet) : []), [version, wallet])
}
