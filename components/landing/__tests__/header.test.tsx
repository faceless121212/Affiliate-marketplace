import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { Header } from '../Header'

vi.mock('@/lib/wallet/useAccount', () => ({
  useAccount: () => ({ wallet: null, connected: false, connecting: false }),
  useLoginModal: () => () => {},
}))

describe('Landing header', () => {
  // The header used to carry the app's own nav: "My Offers" and "My Links".
  // Read by someone with no account, on the one page that is served to
  // signed-out visitors, those name things that cannot exist yet.
  it('never links a signed-out visitor to a personal app route', () => {
    render(<Header />)
    const nav = screen.getByRole('navigation', { name: 'Main' })
    for (const link of within(nav).getAllByRole('link')) {
      expect(link.getAttribute('href')).not.toMatch(/^\/app\/(my-offers|links)/)
      expect(link.textContent?.trim()).not.toMatch(/^my /i)
    }
  })

  it('links to the marketplace and to the mechanic', () => {
    render(<Header />)
    const nav = screen.getByRole('navigation', { name: 'Main' })
    expect(within(nav).getByRole('link', { name: 'Browse' })).toHaveAttribute('href', '/app')
    expect(within(nav).getByRole('link', { name: 'How it works' })).toHaveAttribute(
      'href',
      '#how-it-works',
    )
  })

  // The nav was `hidden sm:flex` with no hamburger behind it, so under 640px
  // the landing page offered no navigation at all and the marketplace was
  // unreachable except through a CTA. jsdom applies no media queries, so
  // this asserts the class that caused it is gone rather than a rendered
  // width: `hidden` here would mean hidden at the narrowest sizes.
  it('renders its nav at every width, with nothing hiding it on small screens', () => {
    render(<Header />)
    const nav = screen.getByRole('navigation', { name: 'Main' })
    expect(nav.className).not.toMatch(/\bhidden\b/)
    expect(within(nav).getAllByRole('link').length).toBeGreaterThan(0)
  })

  it('still offers one sign-in action', () => {
    render(<Header />)
    expect(screen.getByRole('link', { name: 'Sign in' })).toBeInTheDocument()
  })
})
