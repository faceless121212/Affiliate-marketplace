'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Nav } from '@/components/app/Nav'
import { PrototypeBanner } from '@/components/app/PrototypeBanner'
import { WalletBadge } from '@/components/app/WalletBadge'
import { ConnectGate } from '@/components/app/ConnectGate'
import { useAccount } from '@/lib/wallet/useAccount'
import { useMounted } from '@/lib/useMounted'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { wallet, connected } = useAccount()
  const mounted = useMounted()

  return (
    <div className="min-h-dvh">
      <PrototypeBanner />
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
          <Link href="/" className="text-[15px] font-semibold tracking-tight">
            Nativness
          </Link>
          {connected && <Nav pathname={pathname} />}
          <div className="ml-auto">{wallet && <WalletBadge wallet={wallet} />}</div>
        </div>
      </header>

      {/* Nothing store-backed renders until mount: localStorage is empty during SSR. */}
      {!mounted ? null : connected ? (
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      ) : (
        <ConnectGate />
      )}
    </div>
  )
}
