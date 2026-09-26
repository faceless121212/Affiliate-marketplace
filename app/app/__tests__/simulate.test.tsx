import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SimulatePage from '@/app/app/simulate/page'
import LinksPage from '@/app/app/links/page'
import { StoreProvider } from '@/lib/store/provider'
import { issueLink, listOffers, getOffer } from '@/lib/store'

const WALLET = '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU'

vi.mock('@/lib/wallet/useAccount', () => ({
  useAccount: () => ({ wallet: WALLET, connected: true, connecting: false }),
  useLoginModal: () => () => {},
}))

describe('Simulate', () => {
  it('tells the user plainly that this stands in for a postback', () => {
    render(
      <StoreProvider>
        <SimulatePage />
      </StoreProvider>,
    )
    expect(screen.getByText(/stands in for a real postback/i)).toBeInTheDocument()
  })

  it('says there is nothing to simulate when the user has no links', () => {
    render(
      <StoreProvider>
        <SimulatePage />
      </StoreProvider>,
    )
    expect(screen.getByText(/you have no tracking links yet/i)).toBeInTheDocument()
  })

  it('decrements escrow and records a payout on confirmation', async () => {
    listOffers()
    issueLink('of_seed_drayton', WALLET)
    render(
      <StoreProvider>
        <SimulatePage />
      </StoreProvider>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Confirm conversion' }))
    expect(getOffer('of_seed_drayton')!.escrowRemainingUsd).toBe(316)
    expect(screen.getByText(/paid \$24\.00/i)).toBeInTheDocument()
  })

  it('refuses when the offer’s escrow cannot fund another conversion', async () => {
    listOffers()
    issueLink('of_seed_halcyon', WALLET) // seeded at $0 remaining
    render(
      <StoreProvider>
        <SimulatePage />
      </StoreProvider>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Confirm conversion' }))
    expect(screen.getByText(/not enough escrow/i)).toBeInTheDocument()
  })
})

describe('My Links', () => {
  it('shows the payout after a simulated conversion', async () => {
    listOffers()
    issueLink('of_seed_drayton', WALLET)
    const { unmount } = render(
      <StoreProvider>
        <SimulatePage />
      </StoreProvider>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Confirm conversion' }))
    unmount()

    render(
      <StoreProvider>
        <LinksPage />
      </StoreProvider>,
    )
    expect(screen.getByTestId('total-earned')).toHaveTextContent('$24.00')
  })
})
