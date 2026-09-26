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
    expect(screen.getByText(/in for a real postback/i)).toBeInTheDocument()
  })

  it('says there is nothing to simulate when the user has no links', () => {
    render(
      <StoreProvider>
        <SimulatePage />
      </StoreProvider>,
    )
    expect(screen.getByText(/no links yet/i)).toBeInTheDocument()
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

    const status = screen.getByRole('status')
    expect(status.textContent).toMatch(/paid \$24\.00/i)
    expect(status.textContent).toMatch(/\$316\.00/)
    expect(status.textContent).toMatch(/in escrow/i)
  })

  it('renders the confirmation figures in mono with tabular numerals, like every other balance', async () => {
    listOffers()
    issueLink('of_seed_drayton', WALLET)
    render(
      <StoreProvider>
        <SimulatePage />
      </StoreProvider>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Confirm conversion' }))

    // These are the product's two most consequential numbers on this screen
    // (the payout and the resulting escrow balance) — they must carry the
    // same mono/tabular treatment as every other currency figure, not render
    // in the prose typeface as part of a flat interpolated string.
    const paidFigure = screen.getByText('$24.00')
    expect(paidFigure.className).toMatch(/\bfont-mono\b/)
    expect(paidFigure.className).toMatch(/\btnum\b/)

    const escrowFigure = screen.getByText('$316.00')
    expect(escrowFigure.className).toMatch(/\bfont-mono\b/)
    expect(escrowFigure.className).toMatch(/\btnum\b/)
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
    // Guards the property that insufficient escrow renders an actionable
    // message pointing at the advertiser's top-up, not a bare error.
    const status = screen.getByRole('status')
    expect(status).toHaveTextContent(/escrow.*empty/i)
    expect(status).toHaveTextContent(/top-up/i)
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
