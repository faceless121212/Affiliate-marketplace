import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import LandingPage from '@/app/page'

vi.mock('@/lib/wallet/useAccount', () => ({
  useAccount: () => ({ wallet: null, connected: false, connecting: false }),
  useLoginModal: () => () => {},
}))

describe('Landing page', () => {
  it('offers exactly one primary call to action', () => {
    render(<LandingPage />)
    expect(screen.getAllByRole('button', { name: 'Enter Nativness' })).toHaveLength(1)
  })

  it('has no separate browse or list CTA — login is the single front door', () => {
    render(<LandingPage />)
    expect(screen.queryByRole('button', { name: /^browse/i })).toBeNull()
    expect(screen.queryByRole('button', { name: /^list an offer/i })).toBeNull()
  })

  it('shows a real offer card with a locked escrow balance', () => {
    render(<LandingPage />)
    expect(screen.getByText('$340.00')).toBeInTheDocument()
    expect(screen.getByText(/\$500\.00/)).toBeInTheDocument()
  })

  it('cites every market figure with its source', () => {
    render(<LandingPage />)
    const market = screen.getByTestId('market')
    expect(market).toHaveTextContent('$19.4B')
    expect(market).toHaveTextContent('$17.1B')
    expect(market).toHaveTextContent('$22B')
    expect(market).toHaveTextContent('Forrester')
    expect(market).toHaveTextContent('$13.81B')
    expect(market).toHaveTextContent('11.3%')
    expect(market).toHaveTextContent('eMarketer')
  })

  it('attributes each problem claim to a named source', () => {
    render(<LandingPage />)
    const problem = screen.getByTestId('problem')
    expect(problem).toHaveTextContent('$75,000')
    expect(problem).toHaveTextContent('$300,000')
    expect(problem).toHaveTextContent('15/100')
    expect(problem).toHaveTextContent('NET-60')
    expect(problem).toHaveTextContent('2.2/5')
    expect(problem).toHaveTextContent('Awin')
    expect(problem).toHaveTextContent('October 2025')
  })

  it('never claims LinkUp or Revelio Labs is an affiliate network', () => {
    render(<LandingPage />)
    const text = screen.getByTestId('problem').textContent ?? ''
    expect(text).toMatch(/workforce-data/i)
  })

  it('makes no numeric claim about Nativness itself', () => {
    render(<LandingPage />)
    const whatYouGet = screen.getByTestId('what-you-get').textContent ?? ''
    expect(whatYouGet).not.toMatch(/\d+\s*(companies|advertisers|affiliates|users|paid out)/i)
  })

  it('states the three steps in order', () => {
    render(<LandingPage />)
    const steps = screen.getByTestId('how-it-works')
    expect(steps).toHaveTextContent(/lock the commission budget/i)
    expect(steps).toHaveTextContent(/promote with the balance visible/i)
    expect(steps).toHaveTextContent(/confirmed conversion pays out/i)
  })
})
