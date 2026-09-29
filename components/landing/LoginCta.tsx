import Link from 'next/link'

type Props = {
  /** Where this CTA sends the visitor. */
  destination?: string
  children?: React.ReactNode
  className?: string
  variant?: 'primary' | 'paid' | 'secondary' | 'ghost'
  'data-testid'?: string
}

/**
 * A plain link, deliberately.
 *
 * This used to open the wallet modal in place, which meant the landing page
 * had to mount `WalletProviders` and therefore shipped the whole Solana
 * adapter (~700KB) onto a static marketing page. Sign-in now happens at the
 * destination, where `components/app/ConnectGate.tsx` already presents it
 * properly ("Sign in with your wallet") instead of a modal over marketing
 * copy. The landing page ships no wallet code at all.
 */
export function LoginCta({
  destination = '/app',
  children = 'Enter Nativness',
  className = '',
  variant = 'primary',
  'data-testid': testId,
}: Props) {
  const variantClass = {
    primary: 'bg-escrow text-ink hover:brightness-95',
    paid: 'bg-paid text-white hover:brightness-110',
    secondary: 'border border-inset bg-surface text-text hover:border-muted',
    ghost: 'text-muted hover:text-text',
  }[variant]
  return (
    <Link
      href={destination}
      data-testid={testId}
      // Off on purpose: the destination's layout mounts WalletProviders, so
      // a viewport prefetch would pull the wallet chunks back onto this page.
      prefetch={false}
      className={`inline-flex items-center justify-center rounded-[9px] px-5 py-2.5 text-[14px] font-semibold transition ${variantClass} ${className}`}
    >
      {children}
    </Link>
  )
}
