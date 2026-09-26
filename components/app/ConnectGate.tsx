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
      <h1 className="text-xl font-semibold">Connect your wallet to continue</h1>
      <p className="mt-2 text-[13px] text-muted">
        Your wallet address is your account. Connecting it for the first time creates one; every
        later connection returns to the same offers, links and payout history.
      </p>
      <Button className="mt-6" onClick={openLogin}>
        Connect wallet
      </Button>
      <p className="mt-3 text-[12px] text-muted">
        Needs a Solana wallet extension — Phantom, Solflare or Backpack — set to devnet.
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
            Local development only. Signs you in as a fixed demo address so you can walk the app
            without installing an extension. This control does not exist in a production build.
          </p>
        </div>
      )}
    </div>
  )
}
