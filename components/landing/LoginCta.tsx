'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { useAccount, useLoginModal } from '@/lib/wallet/useAccount'

/**
 * The single front door. Opens the wallet modal and, once the connection the
 * user just initiated succeeds, sends them into the app.
 *
 * The ref matters: someone already connected who deliberately visits the
 * landing page should not be bounced away from it.
 */
export function LoginCta() {
  const { connected } = useAccount()
  const openLogin = useLoginModal()
  const router = useRouter()
  const requested = useRef(false)

  useEffect(() => {
    if (connected && requested.current) router.push('/app')
  }, [connected, router])

  return (
    <Button
      className="px-5 py-2.5 text-[14px]"
      onClick={() => {
        if (connected) {
          router.push('/app')
          return
        }
        requested.current = true
        openLogin()
      }}
    >
      Enter Nativness
    </Button>
  )
}
