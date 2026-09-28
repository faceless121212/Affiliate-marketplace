import Link from 'next/link'
import { LoginCta } from './LoginCta'

/**
 * Only destinations a signed-out visitor can actually use. "My Offers" and
 * "My Links" used to sit here: they are app routes for a connected wallet,
 * and on a marketing page read to someone with no account they name things
 * that cannot exist yet. They live in `components/app/Nav.tsx`, behind
 * sign-in, which is the only place they mean anything.
 */
const LINKS = [
  { href: '/app', label: 'Browse' },
  { href: '#how-it-works', label: 'How it works' },
] as const

/**
 * Denser than a marketing header: wordmark, a couple of links that actually
 * go somewhere, one sign-in button. No search, no language switcher, no
 * theme toggle: nothing that would just sit there doing nothing.
 *
 * The nav renders at every width. It was previously `hidden sm:flex` with no
 * hamburger behind it, so below 640px the header collapsed to a wordmark and
 * a sign-in button and the marketplace became unreachable from the landing
 * page entirely. Two links need a row, not a drawer; `flex-wrap` on the bar
 * lets the sign-in button drop to a second line on a very narrow screen
 * instead of overflowing.
 */
export function Header() {
  return (
    <header data-testid="site-header" className="border-b border-line">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:gap-x-6">
        <Link href="/" className="text-[15px] font-semibold tracking-tight">
          Nativness
        </Link>
        <nav className="flex gap-3 sm:gap-4" aria-label="Main">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="whitespace-nowrap text-[13px] text-muted hover:text-text"
            >
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
