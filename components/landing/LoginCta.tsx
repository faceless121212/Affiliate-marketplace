'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { useAccount, useLoginModal } from '@/lib/wallet/useAccount'

type Props = {
  /** Where this CTA sends the visitor. Both audience CTAs share this one front door. */
  destination?: string
  children?: React.ReactNode
  className?: string
  variant?: 'primary' | 'paid' | 'secondary' | 'ghost'
}

/**
 * The single front door, parameterised by destination so the split hero can
 * offer two CTAs, one per audience, that both still go through the same
 * wallet login. Opens the wallet modal and, once the connection the user
 * just initiated succeeds, sends them to `destination`.
 *
 * The ref matters: someone already connected who deliberately visits the
 * landing page should not be bounced away from it. Each rendered instance of
 * this component keeps its own ref, so clicking one CTA never causes another
 * CTA elsewhere on the page to redirect.
 */
export function LoginCta({
  destination = '/app',
  children = 'Enter Nativness',
  className = '',
  variant,
}: Props) {
  const { connected } = useAccount()
  const openLogin = useLoginModal()
  const router = useRouter()
  const requested = useRef(false)

  useEffect(() => {
    if (connected && requested.current) router.push(destination)
  }, [connected, router, destination])

  return (
    <Button
      variant={variant}
      className={`px-5 py-2.5 text-[14px] ${className}`}
      onClick={() => {
        if (connected) {
          router.push(destination)
          return
        }
        requested.current = true
        openLogin()
      }}
    >
      {children}
    </Button>
  )
}
