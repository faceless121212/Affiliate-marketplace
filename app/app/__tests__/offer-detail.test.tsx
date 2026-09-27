import { act } from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import OfferDetailPage from '@/app/app/offers/[id]/page'
import { StoreProvider } from '@/lib/store/provider'
import { SEED_OFFERS } from '@/lib/store'

const WALLET = '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU'
const drayton = SEED_OFFERS.find((o) => o.name === 'Drayton Supply Co.')!

vi.mock('@/lib/wallet/useAccount', () => ({
  useAccount: () => ({ wallet: WALLET, connected: true, connecting: false }),
  useLoginModal: () => () => {},
}))

// `params` is a Promise (React's `use()` contract for App Router dynamic
// segments in a Client Component, see app/app/offers/[id]/page.tsx). A
// freshly-created Promise hasn't "settled" from React's point of view on
// the first synchronous render, so `use()` suspends; wrapping the render in
// an awaited `act` lets that resolution flush before we assert.
const renderDetail = async () => {
  await act(async () => {
    render(
      <StoreProvider>
        <OfferDetailPage params={Promise.resolve({ id: drayton.id })} />
      </StoreProvider>,
    )
  })
}

describe('Offer detail', () => {
  it('shows the offer name and CPA commission', async () => {
    await renderDetail()
    expect(screen.getByRole('heading', { name: drayton.name })).toBeInTheDocument()
    expect(screen.getByText('$24.00')).toBeInTheDocument()
  })

  // Regression for the "escrow must lead, CPA is supporting detail" review
  // finding raised against the offer-detail sidebar (mirrors the OfferCard
  // fix). Asserts the hierarchy itself rather than pinning exact pixel
  // values, so a later design pass can resize both without re-breaking this.
  it('gives the escrow remainder more visual weight than the CPA commission', async () => {
    await renderDetail()
    const escrow = screen.getByText('$340.00')
    const cpa = screen.getByText('$24.00')

    expect(escrow.className).toMatch(/font-bold/)
    expect(cpa.className).not.toMatch(/font-bold/)

    const escrowSize = Number(escrow.className.match(/text-\[(\d+)px\]/)?.[1])
    const cpaSize = Number(cpa.className.match(/text-\[(\d+)px\]/)?.[1])
    expect(escrowSize).toBeGreaterThan(cpaSize)
  })

  it('puts the escrow meter before the CPA row in document order', async () => {
    await renderDetail()
    const escrow = screen.getByText('$340.00')
    const cpa = screen.getByText('$24.00')
    expect(escrow.compareDocumentPosition(cpa) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })
})
