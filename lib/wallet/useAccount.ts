'use client'

import { useEffect, useMemo } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { ensureUser } from '@/lib/store'

export function useAccount() {
  const { publicKey, connected, connecting } = useWallet()
  const wallet = useMemo(() => publicKey?.toBase58() ?? null, [publicKey])

  // The first connection from an address creates the account. No signup step.
  useEffect(() => {
    if (wallet) ensureUser(wallet)
  }, [wallet])

  return { wallet, connected: connected && !!wallet, connecting }
}

export function useLoginModal() {
  const { setVisible } = useWalletModal()
  return () => setVisible(true)
}
