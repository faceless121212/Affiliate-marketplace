'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { Address } from '@/components/ui/Address'

export function WalletBadge({ wallet }: { wallet: string }) {
  const { disconnect } = useWallet()
  return (
    <div className="flex items-center gap-2">
      <Address value={wallet} className="text-[12px] text-muted" />
      <button
        onClick={() => disconnect()}
        className="text-[12px] text-muted hover:text-text transition"
      >
        Disconnect
      </button>
    </div>
  )
}
