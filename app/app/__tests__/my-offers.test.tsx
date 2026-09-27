import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
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
  await user.selectOptions(screen.getByLabelText('Category'), 'ecommerce')
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
    expect(screen.getByText(/must cover at least one payout/i)).toBeInTheDocument()
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

describe('Create offer form usability', () => {
  const TEXT_FIELDS = [
    'Offer name',
    'Description',
    'Target URL',
    'Conversion terms',
    'Commission per conversion (USD)',
    'Escrow budget (USD)',
  ]

  it('shows an example placeholder in every text field', () => {
    render(
      <StoreProvider>
        <MyOffersPage />
      </StoreProvider>,
    )
    for (const label of TEXT_FIELDS) {
      const field = screen.getByLabelText(label) as HTMLInputElement | HTMLTextAreaElement
      expect(field.placeholder.trim().length).toBeGreaterThan(0)
      // A placeholder is an example, not a restatement of the label.
      expect(field.placeholder.toLowerCase()).not.toBe(label.toLowerCase())
    }
  })

  it('fills every field from one example that passes validation on submit', async () => {
    const user = userEvent.setup()
    render(
      <StoreProvider>
        <MyOffersPage />
      </StoreProvider>,
    )
    await user.click(screen.getByRole('button', { name: 'Fill with an example' }))

    expect(screen.getByLabelText('Offer name')).toHaveValue('Hollowell Trading Co.')
    expect(screen.getByLabelText('Description')).not.toHaveValue('')
    expect(screen.getByLabelText('Target URL')).toHaveValue('https://example.com/hollowell')
    expect(screen.getByLabelText('Conversion terms')).not.toHaveValue('')
    expect(screen.getByLabelText('Commission per conversion (USD)')).toHaveValue('35')
    expect(screen.getByLabelText('Escrow budget (USD)')).toHaveValue('1200')

    // The fill only sets state — every field must still be editable
    // afterwards, not locked.
    await user.clear(screen.getByLabelText('Offer name'))
    await user.type(screen.getByLabelText('Offer name'), 'Hollowell Outdoor Co.')
    expect(screen.getByLabelText('Offer name')).toHaveValue('Hollowell Outdoor Co.')

    await user.click(screen.getByRole('button', { name: 'Lock budget and list offer' }))
    expect(screen.getByText('Hollowell Outdoor Co.')).toBeInTheDocument()
    expect(screen.queryByText(/must cover at least one payout/i)).not.toBeInTheDocument()
  })

  it('does not create an offer just from filling the example', async () => {
    const user = userEvent.setup()
    render(
      <StoreProvider>
        <MyOffersPage />
      </StoreProvider>,
    )
    await user.click(screen.getByRole('button', { name: 'Fill with an example' }))
    expect(screen.queryByText('Hollowell Trading Co.')).not.toBeInTheDocument()
    expect(screen.getByText('No offers yet. Use the form on the left.')).toBeInTheDocument()
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
