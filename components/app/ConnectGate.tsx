'use client'

import { Button } from '@/components/ui/Button'
import { useLoginModal } from '@/lib/wallet/useAccount'
import { enableDemoWallet, isDevMode } from '@/lib/wallet/demoWallet'

/**
 * Renders in place rather than redirecting to '/'. A redirect would lose the
 * destination and risks a loop while the adapter is still restoring a session.
 */
export function ConnectGate() {
  const openLogin = useLoginModal()
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="text-xl font-semibold">Connect your wallet</h1>
      <p className="mt-2 text-[13px] text-muted">
        Your wallet address is your account. It’s the same one every time you connect.
      </p>
      <Button className="mt-6" onClick={openLogin}>
        Connect wallet
      </Button>
      <p className="mt-3 text-[12px] text-muted">
        Needs a Solana wallet (Phantom, Solflare or Backpack) on devnet.
      </p>

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
