'use client'

import { Button } from '@/components/ui/Button'
import { useLoginModal } from '@/lib/wallet/useAccount'

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
    </div>
  )
}
