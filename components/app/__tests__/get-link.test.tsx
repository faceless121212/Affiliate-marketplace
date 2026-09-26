import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GetLinkPanel } from '@/components/app/GetLinkPanel'
import { StoreProvider } from '@/lib/store/provider'
import { SEED_OFFERS, listLinksByAffiliate } from '@/lib/store'

const WALLET = '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU'
const drayton = SEED_OFFERS.find((o) => o.name === 'Drayton Supply Co.')!

const renderPanel = () =>
  render(
    <StoreProvider>
      <GetLinkPanel offer={drayton} wallet={WALLET} />
    </StoreProvider>,
  )

describe('GetLinkPanel', () => {
  it('generates a link containing the connected wallet address', async () => {
    renderPanel()
    await userEvent.click(screen.getByRole('button', { name: 'Get my link' }))
    expect(
      screen.getByText(`nativness.app/r/${drayton.id}/${WALLET}`),
    ).toBeInTheDocument()
  })

  it('does not mint a second link when asked twice', async () => {
    renderPanel()
    await userEvent.click(screen.getByRole('button', { name: 'Get my link' }))
    expect(listLinksByAffiliate(WALLET)).toHaveLength(1)
  })

  it('copies the link to the clipboard', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })
    renderPanel()
    await userEvent.click(screen.getByRole('button', { name: 'Get my link' }))
    await userEvent.click(screen.getByRole('button', { name: 'Copy' }))
    expect(writeText).toHaveBeenCalledWith(`nativness.app/r/${drayton.id}/${WALLET}`)
    expect(screen.getByRole('button', { name: 'Copied' })).toBeInTheDocument()
  })
})
