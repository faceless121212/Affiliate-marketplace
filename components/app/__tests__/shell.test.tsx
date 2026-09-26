import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PrototypeBanner } from '@/components/app/PrototypeBanner'
import { Nav } from '@/components/app/Nav'

describe('PrototypeBanner', () => {
  it('states plainly that escrow is simulated', () => {
    render(<PrototypeBanner />)
    expect(screen.getByRole('status')).toHaveTextContent(
      /escrow balances are simulated and stored in this browser\. not yet on-chain\./i,
    )
  })

  it('offers no way to dismiss it', () => {
    render(<PrototypeBanner />)
    expect(screen.queryByRole('button')).toBeNull()
  })
})

describe('Nav', () => {
  it('shows all four destinations as peers, with no mode switch', () => {
    render(<Nav pathname="/app" />)
    const labels = screen.getAllByRole('link').map((a) => a.textContent)
    expect(labels).toEqual(['Browse', 'My Links', 'My Offers', 'Simulate'])
  })

  it('marks the current destination', () => {
    render(<Nav pathname="/app/my-offers" />)
    expect(screen.getByRole('link', { name: 'My Offers' })).toHaveAttribute(
      'aria-current',
      'page',
    )
  })
})
