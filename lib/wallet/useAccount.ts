'use client'

import { useEffect, useMemo, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { ensureUser } from '@/lib/store'
import { readDemoWallet } from './demoWallet'

export function useAccount() {
  const { publicKey, connected, connecting } = useWallet()

  // Development-only fallback, read after mount so SSR is unaffected. Always
  // null in a production build — see lib/wallet/demoWallet.ts.
  const [demo, setDemo] = useState<string | null>(null)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reads localStorage once after mount, the same SSR-guard pattern as lib/useMounted.ts; it cannot cascade.
    setDemo(readDemoWallet())
  }, [])

  const real = useMemo(() => publicKey?.toBase58() ?? null, [publicKey])
  const wallet = real ?? demo

  // The first connection from an address creates the account. No signup step.
  useEffect(() => {
    if (wallet) ensureUser(wallet)
  }, [wallet])

  return { wallet, connected: (connected || !!demo) && !!wallet, connecting }
}
