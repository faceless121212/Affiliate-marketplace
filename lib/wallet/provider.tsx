'use client'

import { useMemo } from 'react'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { clusterApiUrl } from '@solana/web3.js'

/**
 * Devnet only. Nothing of value moves; the wallet is an identity, not a
 * payment rail, in Phase 1.
 *
 * `autoConnect` is deliberately OFF. It used to be on, which meant the page
 * attempted to connect a wallet on load, before the visitor had clicked
 * anything. That is the behaviour wallet security scanners treat as a drainer
 * signal, and they are right to: a site reaching for a wallet unprompted is
 * asking for access it has not been offered. A real user saw MetaMask answer
 * this app with a full-screen phishing warning. Connecting now happens only
 * when someone presses a named wallet in `ConnectGate`.
 *
 * The wallets array stays empty so Wallet Standard wallets self-register and
 * we do not ship adapter code for wallets a visitor does not have. Which of
 * the registered wallets we will actually ask is decided in
 * `lib/wallet/supportedWallets.ts`, not here.
 *
 * `WalletModalProvider` is gone with its stylesheet. The bundled modal offers
 * every registered wallet including ones this app cannot use, and it was the
 * route by which an Ethereum wallet got a connect request from a Solana app.
 * `ConnectGate` renders its own picker over the filtered list instead.
 */
export function WalletProviders({ children }: { children: React.ReactNode }) {
  const endpoint = useMemo(() => clusterApiUrl(WalletAdapterNetwork.Devnet), [])
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={[]} autoConnect={false}>
        {children}
      </WalletProvider>
    </ConnectionProvider>
  )
}
