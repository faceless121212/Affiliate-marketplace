import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MyOffersPage from '@/app/app/my-offers/page'
import BrowsePage from '@/app/app/page'
import { StoreProvider } from '@/lib/store/provider'

const WALLET = '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU'

vi.mock('@/lib/wallet/useAccount', () => ({
  useAccount: () => ({ wallet: WALLET, connected: true, connecting: false }),
  useLoginModal: () => () => {},
}))

async function fillAndSubmit(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Offer name'), 'Ashcroft Rail')
  await user.type(
    screen.getByLabelText('Description'),
    'Discount rail booking for commuters in the north of England.',
  )
  // Scoped to the create-offer form: the browse grid's FilterBar (rendered
  // alongside it in the "no reload" test below) also exposes a "Category"
  // control, so an unscoped query would be ambiguous.
  const createForm = within(screen.getByTestId('create-offer-form'))
  await user.selectOptions(createForm.getByLabelText('Category'), 'ecommerce')
  await user.type(screen.getByLabelText('Commission per conversion (USD)'), '15')
  await user.type(
    screen.getByLabelText('Conversion terms'),
    'A conversion is a completed booking of $40 or more.',
  )
  await user.type(screen.getByLabelText('Target URL'), 'https://example.com/ashcroft')
  await user.type(screen.getByLabelText('Escrow budget (USD)'), '300')
  await user.click(screen.getByRole('button', { name: 'Lock budget and list offer' }))
}

describe('Create offer', () => {
  it('lists the offer and shows its locked balance', async () => {
    const user = userEvent.setup()
    render(
      <StoreProvider>
        <MyOffersPage />
      </StoreProvider>,
    )
    await fillAndSubmit(user)
    expect(screen.getByText('Ashcroft Rail')).toBeInTheDocument()
    expect(screen.getAllByText('$300.00').length).toBeGreaterThan(0)
  })

  it('appears in the marketplace grid with no reload', async () => {
    const user = userEvent.setup()
    render(
      <StoreProvider>
        <MyOffersPage />
        <BrowsePage />
      </StoreProvider>,
    )
    expect(screen.queryByRole('heading', { name: 'Ashcroft Rail' })).toBeNull()
    await fillAndSubmit(user)
    // One heading in the advertiser list, one in the marketplace grid: both
    // views read the same store and re-rendered without a reload.
    expect(screen.getAllByRole('heading', { name: 'Ashcroft Rail' })).toHaveLength(2)
  })

  it('refuses a budget smaller than one commission', async () => {
    const user = userEvent.setup()
    render(
      <StoreProvider>
        <MyOffersPage />
      </StoreProvider>,
    )
    await user.type(screen.getByLabelText('Offer name'), 'Underfunded Ltd')
    await user.type(screen.getByLabelText('Description'), 'Not enough budget to pay anyone.')
    await user.type(screen.getByLabelText('Commission per conversion (USD)'), '50')
    await user.type(screen.getByLabelText('Conversion terms'), 'A completed order.')
    await user.type(screen.getByLabelText('Target URL'), 'https://example.com/underfunded')
    await user.type(screen.getByLabelText('Escrow budget (USD)'), '20')
    await user.click(screen.getByRole('button', { name: 'Lock budget and list offer' }))
    expect(screen.getByText(/must cover at least one conversion/i)).toBeInTheDocument()
    expect(screen.queryByText('Underfunded Ltd')).toBeNull()
  })

  it('requires a http(s) target URL', async () => {
    const user = userEvent.setup()
    render(
      <StoreProvider>
        <MyOffersPage />
      </StoreProvider>,
    )
    await user.type(screen.getByLabelText('Offer name'), 'Bad URL Co.')
    await user.type(screen.getByLabelText('Description'), 'The target is not a web address.')
    await user.type(screen.getByLabelText('Commission per conversion (USD)'), '10')
    await user.type(screen.getByLabelText('Conversion terms'), 'A completed order.')
    await user.type(screen.getByLabelText('Target URL'), 'not-a-url')
    await user.type(screen.getByLabelText('Escrow budget (USD)'), '100')
    await user.click(screen.getByRole('button', { name: 'Lock budget and list offer' }))
    expect(screen.getByText(/must start with http/i)).toBeInTheDocument()
  })
})

describe('Top up escrow', () => {
  it('raises both the remainder and the total', async () => {
    const user = userEvent.setup()
    render(
      <StoreProvider>
        <MyOffersPage />
      </StoreProvider>,
    )
    await fillAndSubmit(user)
    await user.click(screen.getByRole('button', { name: 'Top up escrow' }))
    await user.type(screen.getByLabelText('Amount to add (USD)'), '200')
    await user.click(screen.getByRole('button', { name: 'Add to escrow' }))
    expect(screen.getAllByText('$500.00').length).toBeGreaterThan(0)
  })
})
