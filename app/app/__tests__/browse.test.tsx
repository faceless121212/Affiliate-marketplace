import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BrowsePage from '@/app/app/page'
import { StoreProvider } from '@/lib/store/provider'

const renderBrowse = () =>
  render(
    <StoreProvider>
      <BrowsePage />
    </StoreProvider>,
  )

describe('Browse', () => {
  it('lists every seeded offer', () => {
    renderBrowse()
    expect(screen.getByText('Drayton Supply Co.')).toBeInTheDocument()
    expect(screen.getByText('Halcyon Tools')).toBeInTheDocument()
  })

  it('filters by category', async () => {
    renderBrowse()
    await userEvent.selectOptions(screen.getByLabelText('Category'), 'saas')
    expect(screen.getByText('Meridian Ledger')).toBeInTheDocument()
    expect(screen.queryByText('Drayton Supply Co.')).toBeNull()
  })

  it('searches by name', async () => {
    renderBrowse()
    await userEvent.type(screen.getByLabelText('Search'), 'kestrel')
    expect(screen.getByText('Kestrel Play')).toBeInTheDocument()
    expect(screen.queryByText('Meridian Ledger')).toBeNull()
  })

  it('says so plainly when a filter matches nothing', async () => {
    renderBrowse()
    await userEvent.type(screen.getByLabelText('Search'), 'zzzzz')
    expect(screen.getByText(/no offers match/i)).toBeInTheDocument()
  })
})
