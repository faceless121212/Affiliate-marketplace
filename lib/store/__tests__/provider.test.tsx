import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StoreProvider, useOffers, useMutate } from '@/lib/store/provider'
import { createOffer } from '@/lib/store'

const W = '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU'

function Harness() {
  const offers = useOffers()
  const mutate = useMutate()
  return (
    <div>
      <p data-testid="count">{offers.length}</p>
      <button
        onClick={() =>
          mutate(() =>
            createOffer(
              {
                name: 'Ashcroft Rail',
                description: 'Discount rail booking.',
                category: 'ecommerce',
                commissionAmountUsd: 15,
                conversionTerms: 'A completed booking of $40 or more.',
                targetUrl: 'https://example.com/ashcroft',
                escrowBudgetUsd: 300,
              },
              W,
            ),
          )
        }
      >
        List offer
      </button>
    </div>
  )
}

describe('StoreProvider', () => {
  it('re-renders every reader after a mutation, with no reload', async () => {
    render(
      <StoreProvider>
        <Harness />
      </StoreProvider>,
    )
    expect(screen.getByTestId('count')).toHaveTextContent('6')
    await userEvent.click(screen.getByRole('button', { name: 'List offer' }))
    expect(screen.getByTestId('count')).toHaveTextContent('7')
  })
})
