import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { LiveEscrowDemo } from '../LiveEscrowDemo'

// jsdom has no matchMedia. Every test states the motion preference it wants,
// because the component's whole behaviour hangs off it.
function stubMotion(reduced: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: reduced && query.includes('reduce'),
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia
}

// The hook wraps the whole EscrowMeter (label, remainder, total), so read the
// remainder as the first currency amount in it.
function remainingFigure(): string {
  const text = screen.getByTestId('demo-remaining').textContent ?? ''
  return text.match(/-?\$[\d,]+\.\d{2}/)?.[0] ?? ''
}

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

describe('LiveEscrowDemo', () => {
  it('starts at the seeded offer balance', () => {
    stubMotion(false)
    render(<LiveEscrowDemo />)
    expect(screen.getByTestId('live-escrow-demo')).toBeInTheDocument()
    expect(screen.getByText('$340.00')).toBeInTheDocument()
    expect(screen.getByText(/covers 14 conversions/i)).toBeInTheDocument()
  })

  it('drains by one commission per tick', () => {
    stubMotion(false)
    render(<LiveEscrowDemo />)
    act(() => { vi.advanceTimersByTime(3400) })
    // $340.00 - $24.00 commission
    expect(screen.getByText('$316.00')).toBeInTheDocument()
    expect(screen.getByText(/covers 13 conversions/i)).toBeInTheDocument()
  })

  it('never renders a negative balance: it resets instead', () => {
    stubMotion(false)
    render(<LiveEscrowDemo />)
    // 14 payouts of $24 exhaust $340 down to $4, which cannot fund a 15th.
    act(() => { vi.advanceTimersByTime(3400 * 20) })
    const figure = remainingFigure()
    expect(figure).not.toContain('-')
    const value = Number(figure.replace(/[^0-9.]/g, ''))
    expect(value).toBeGreaterThanOrEqual(0)
    expect(value).toBeLessThanOrEqual(340)
  })

  it('does not start the timer under reduced motion', () => {
    stubMotion(true)
    render(<LiveEscrowDemo />)
    act(() => { vi.advanceTimersByTime(3400 * 5) })
    expect(screen.getByText('$340.00')).toBeInTheDocument()
  })

  it('carries the Phase 1 disclosure', () => {
    stubMotion(false)
    const { container } = render(<LiveEscrowDemo />)
    expect(container.textContent ?? '').toMatch(/simulated/i)
    expect(container.textContent ?? '').not.toMatch(/on-chain settlement|real payout/i)
  })
})
