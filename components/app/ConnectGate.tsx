'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { Button } from '@/components/ui/Button'
import {
  SUPPORTED_WALLETS,
  WALLET_DOWNLOADS,
  useAvailableWallets,
} from '@/lib/wallet/supportedWallets'
import { enableDemoWallet, isDevMode } from '@/lib/wallet/demoWallet'

/**
 * Renders in place rather than redirecting to '/'. A redirect would lose the
 * destination and risks a loop while the adapter is still restoring a session.
 *
 * This picks a named wallet directly instead of opening the bundled modal. The
 * modal offered every Wallet Standard wallet in the browser, which on a machine
 * with MetaMask installed meant offering MetaMask on a Solana app, and MetaMask
 * answered with a phishing warning. Only the three wallets this app can actually
 * use are ever sent a connect request now, and a request only goes out when
 * someone presses that wallet's name.
 */
export function ConnectGate() {
  const { select, connect, connecting } = useWallet()
  const available = useAvailableWallets()

  async function connectTo(name: (typeof SUPPORTED_WALLETS)[number]) {
    select(name as Parameters<typeof select>[0])
    try {
      await connect()
    } catch {
      // The visitor dismissed their wallet's prompt, or the wallet refused.
      // Either way the gate simply stays as it is; there is nothing to recover.
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="text-xl font-semibold">Sign in with your wallet</h1>
      <p className="mt-2 text-[13px] text-muted">
        Your wallet address is your account. It’s the same one every time you connect.
      </p>

      {available.length > 0 ? (
        <>
          <div className="mt-6 flex flex-col gap-2">
            {available.map((wallet) => (
              <Button
                key={wallet.adapter.name}
                disabled={connecting}
                onClick={() => connectTo(wallet.adapter.name as (typeof SUPPORTED_WALLETS)[number])}
                className="w-full justify-center py-3"
              >
                Continue with {wallet.adapter.name}
              </Button>
            ))}
          </div>
          <p className="mt-3 text-[12px] text-muted">
            Nativness reads your address and nothing else. It never asks you to sign a
            transaction: in Phase 1 escrow is simulated, so there is nothing to sign.
          </p>
        </>
      ) : (
        <>
          <p className="mt-6 rounded-lg border border-line bg-surface p-4 text-[13px] text-muted">
            No Solana wallet detected in this browser. Install one of these, then reload:
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-2 text-[13px]">
            {SUPPORTED_WALLETS.map((name) => (
              <a
                key={name}
                href={WALLET_DOWNLOADS[name]}
                target="_blank"
                rel="noreferrer noopener"
                className="text-info hover:underline"
              >
                {name}
              </a>
            ))}
          </div>
        </>
      )}

      <p className="mt-3 text-[12px] text-muted">Runs on devnet, Solana’s test network.</p>

      {isDevMode && (
        <div className="mt-8 border-t border-line pt-6">
          <Button
            variant="secondary"
            onClick={() => {
              enableDemoWallet()
              window.location.reload()
            }}
          >
            Explore without a wallet
          </Button>
          <p className="mt-2 text-[12px] text-muted">
            Local development only. Signs you in as a demo wallet, no extension needed. Not
            present in production.
          </p>
        </div>
      )}
    </div>
  )
}
