import Link from 'next/link'
import { LoginCta } from './LoginCta'

const LINKS = [
  { href: '/app', label: 'Browse' },
  { href: '/app/my-offers', label: 'My Offers' },
  { href: '/app/links', label: 'My Links' },
] as const

/**
 * Denser than a marketing header: wordmark, a few links that actually go
 * somewhere, one sign-in button. No search, no language switcher, no theme
 * toggle: nothing that would just sit there doing nothing.
 */
export function Header() {
  return (
    <header data-testid="site-header" className="border-b border-line">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3">
        <Link href="/" className="text-[15px] font-semibold tracking-tight">
          Nativness
        </Link>
        <nav className="hidden gap-4 sm:flex" aria-label="Main">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="text-[13px] text-muted hover:text-text">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto">
          <LoginCta variant="secondary" className="px-3.5 py-1.5 text-[13px]">
            Sign in
          </LoginCta>
        </div>
      </div>
    </header>
  )
}
