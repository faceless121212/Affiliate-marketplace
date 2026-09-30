'use client'

import { useMemo } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletReadyState } from '@solana/wallet-adapter-base'

/**
 * The wallets this app will ever ask to connect.
 *
 * `WalletProvider` is given no adapter list, so every Wallet Standard wallet in
 * the browser registers itself. That now includes wallets whose primary chain is
 * not Solana, and the default modal offers all of them. Two things went wrong
 * because of it:
 *
 * 1. A user with MetaMask installed was offered MetaMask on a page whose own copy
 *    says "Phantom, Solflare or Backpack", and MetaMask answered the connect
 *    request with a full-screen phishing warning. An Ethereum-brand wallet
 *    prompting on a Solana app looks wrong to the user before it ever gets to
 *    the warning.
 * 2. Asking a wallet we cannot actually use is a connect request with no purpose,
 *    which is exactly the pattern wallet security scanners look for.
 *
 * Filtering at the picker means a wallet outside this list is never sent a
 * request at all, so it has nothing to warn about.
 */
export const SUPPORTED_WALLETS = ['Phantom', 'Solflare', 'Backpack'] as const

export const WALLET_DOWNLOADS: Record<(typeof SUPPORTED_WALLETS)[number], string> = {
  Phantom: 'https://phantom.app/download',
  Solflare: 'https://solflare.com/download',
  Backpack: 'https://backpack.app/download',
}

const isSupported = (name: string): name is (typeof SUPPORTED_WALLETS)[number] =>
  (SUPPORTED_WALLETS as readonly string[]).includes(name)

/**
 * The supported wallets actually present in this browser, in the order declared
 * above rather than registration order, so the list does not reshuffle between
 * visits. `Installed` and `Loadable` both mean the wallet can be connected;
 * anything else is absent and belongs in the install prompt instead.
 */
export function useAvailableWallets() {
  const { wallets } = useWallet()
  return useMemo(() => {
    const ready = wallets.filter(
      (w) =>
        isSupported(w.adapter.name) &&
        (w.readyState === WalletReadyState.Installed ||
          w.readyState === WalletReadyState.Loadable),
    )
    return SUPPORTED_WALLETS.map((name) =>
      ready.find((w) => w.adapter.name === name),
    ).filter((w): w is NonNullable<typeof w> => w != null)
  }, [wallets])
}
