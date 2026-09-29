import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { LiveEscrowDemo } from '../LiveEscrowDemo'

// jsdom has no matchMedia. Every test states the motion preference it wants,
// because the component's whole behaviour hangs off it. The returned handle
// flips the preference mid-session and notifies subscribers, as a browser does.
function stubMotion(reduced: boolean) {
  const listeners = new Set<() => void>()
  let current = reduced
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    get matches() {
      return current && query.includes('reduce')
    },
    media: query,
    addEventListener: (_type: string, cb: () => void) => listeners.add(cb),
    removeEventListener: (_type: string, cb: () => void) => listeners.delete(cb),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia
  return {
    setReduced(next: boolean) {
      current = next
      act(() => listeners.forEach((cb) => cb()))
    },
    listenerCount: () => listeners.size,
  }
}

const TICK = 3400

// The payout pill is aria-hidden and toggled by opacity, so its visibility is
// the class it carries, not its presence in the DOM.
function payoutPillVisible(): boolean {
  const pill = screen.getByText(/conversion confirmed/i).closest('p')
  return pill?.className.includes('opacity-100') ?? false
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

  it('resets to the seeded starting balance, exactly, once it cannot fund another payout', () => {
    stubMotion(false)
    render(<LiveEscrowDemo />)
    // 14 payouts of $24 take $340 down to $4, which cannot fund a 15th.
    act(() => { vi.advanceTimersByTime(TICK * 14) })
    expect(remainingFigure()).toBe('$4.00')
    // The 15th tick is the reset: back to the seeded balance, not merely in range.
    act(() => { vi.advanceTimersByTime(TICK) })
    expect(remainingFigure()).toBe('$340.00')
    // And it then drains again from there.
    act(() => { vi.advanceTimersByTime(TICK) })
    expect(remainingFigure()).toBe('$316.00')
  })

  it('shows the payout confirmation on a payout tick, and not on the reset tick', () => {
    stubMotion(false)
    render(<LiveEscrowDemo />)
    expect(payoutPillVisible()).toBe(false)
    act(() => { vi.advanceTimersByTime(TICK) })
    expect(payoutPillVisible()).toBe(true)

    // Run to the tick before the reset, let the pill fade, then take the reset tick.
    act(() => { vi.advanceTimersByTime(TICK * 13) })
    expect(remainingFigure()).toBe('$4.00')
    act(() => { vi.advanceTimersByTime(TICK) })
    expect(remainingFigure()).toBe('$340.00')
    // Escrow jumped UP: nothing was paid, so "Conversion confirmed" must not flash.
    expect(payoutPillVisible()).toBe(false)
  })

  it('stops the interval on unmount', () => {
    stubMotion(false)
    const { unmount } = render(<LiveEscrowDemo />)
    expect(vi.getTimerCount()).toBe(1)
    unmount()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('clears the pending payout-pill timeout on unmount', () => {
    stubMotion(false)
    const { unmount } = render(<LiveEscrowDemo />)
    // One tick: the interval is live and the pill's 2.1s fade-out timeout is pending.
    act(() => { vi.advanceTimersByTime(TICK) })
    expect(vi.getTimerCount()).toBe(2)
    unmount()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('unsubscribes from the motion preference on unmount', () => {
    const motion = stubMotion(false)
    const { unmount } = render(<LiveEscrowDemo />)
    expect(motion.listenerCount()).toBe(1)
    unmount()
    expect(motion.listenerCount()).toBe(0)
  })

  it('stops the timer when reduced motion is switched on mid-session', () => {
    const motion = stubMotion(false)
    render(<LiveEscrowDemo />)
    act(() => { vi.advanceTimersByTime(TICK) })
    expect(remainingFigure()).toBe('$316.00')
    expect(payoutPillVisible()).toBe(true)

    motion.setReduced(true)
    expect(vi.getTimerCount()).toBe(0)
    // Frozen where it was, and the pill is not left stuck on.
    act(() => { vi.advanceTimersByTime(TICK * 5) })
    expect(remainingFigure()).toBe('$316.00')
    expect(payoutPillVisible()).toBe(false)
  })

  it('resumes when reduced motion is switched back off', () => {
    const motion = stubMotion(true)
    render(<LiveEscrowDemo />)
    expect(vi.getTimerCount()).toBe(0)
    motion.setReduced(false)
    act(() => { vi.advanceTimersByTime(TICK) })
    expect(remainingFigure()).toBe('$316.00')
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
