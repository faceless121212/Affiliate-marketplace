import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { OfferCard } from '@/components/app/OfferCard'
import { SEED_OFFERS } from '@/lib/store'

const drayton = SEED_OFFERS.find((o) => o.name === 'Drayton Supply Co.')!
const kestrel = SEED_OFFERS.find((o) => o.name === 'Kestrel Play')!
const halcyon = SEED_OFFERS.find((o) => o.name === 'Halcyon Tools')!

describe('OfferCard', () => {
  it('shows the escrow remainder against the total — the trust signal', () => {
    render(<OfferCard offer={drayton} />)
    expect(screen.getByText('$340.00')).toBeInTheDocument()
    expect(screen.getByText(/\$500\.00/)).toBeInTheDocument()
  })

  it('shows the CPA commission', () => {
    render(<OfferCard offer={drayton} />)
    expect(screen.getByText('$24.00')).toBeInTheDocument()
  })

  it('badges a Verified advertiser', () => {
    render(<OfferCard offer={drayton} />)
    expect(screen.getByText('Verified')).toBeInTheDocument()
  })

  it('shows no Verified badge on a Community offer', () => {
    render(<OfferCard offer={kestrel} />)
    expect(screen.queryByText('Verified')).toBeNull()
  })

  it('marks a depleted offer rather than hiding it', () => {
    render(<OfferCard offer={halcyon} />)
    expect(screen.getByText('Escrow empty')).toBeInTheDocument()
  })

  it('links to the offer detail page', () => {
    render(<OfferCard offer={drayton} />)
    expect(screen.getByRole('link')).toHaveAttribute('href', `/app/offers/${drayton.id}`)
  })

  // Regression for the "escrow must be the dominant figure, not CPA" review
  // finding. Asserts the hierarchy itself rather than pinning exact pixel
  // values, so a later design pass can resize both without re-breaking this.
  it('gives the escrow remainder more visual weight than the CPA commission', () => {
    render(<OfferCard offer={drayton} />)
    const escrow = screen.getByText('$340.00')
    const cpa = screen.getByText('$24.00')

    expect(escrow.className).toMatch(/font-bold/)
    expect(cpa.className).not.toMatch(/font-bold/)

    const escrowSize = Number(escrow.className.match(/text-\[(\d+)px\]/)?.[1])
    const cpaSize = Number(cpa.className.match(/text-\[(\d+)px\]/)?.[1])
    expect(escrowSize).toBeGreaterThan(cpaSize)
  })
})
