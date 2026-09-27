import Link from 'next/link'

const DESTINATIONS = [
  { href: '/app', label: 'Browse' },
  { href: '/app/links', label: 'My Links' },
  { href: '/app/my-offers', label: 'My Offers' },
  { href: '/app/simulate', label: 'Simulate' },
] as const

/**
 * Flat and peer-level on purpose. There is no affiliate mode and no
 * advertiser mode: one identity reaches every destination, so the UI must
 * not imply a second account exists.
 */
export function Nav({ pathname }: { pathname: string }) {
  return (
    <nav className="flex gap-1 overflow-x-auto" aria-label="Main">
      {DESTINATIONS.map(({ href, label }) => {
        const active = href === '/app' ? pathname === '/app' : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={`whitespace-nowrap rounded-full px-2.5 py-1.5 text-[13px] transition ${
              active ? 'bg-line text-text' : 'text-muted hover:text-text hover:bg-surface'
            }`}
          >
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
