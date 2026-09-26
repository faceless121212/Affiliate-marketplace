import { describe, it, expect, vi, afterEach } from 'vitest'
import { StrictMode } from 'react'
import { render, screen, act } from '@testing-library/react'
import { useCountUp } from '@/lib/useCountUp'

function Probe({ target }: { target: number }) {
  return <span data-testid="v">{useCountUp(target, 100)}</span>
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

/**
 * These stub matchMedia and requestAnimationFrame so the ANIMATED path is
 * actually exercised. Without driving the frame callbacks, a broken animation
 * loop passes the suite — which is how the hero counter shipped pinned at 0:
 * a run-once ref guard survived React Strict Mode's second mount and
 * short-circuited before the loop ever restarted.
 */
function stubMotion(reduced: boolean) {
  vi.stubGlobal('matchMedia', () => ({
    matches: reduced,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }))
}

describe('useCountUp', () => {
  it('jumps straight to the target when reduced motion is requested', () => {
    stubMotion(true)
    render(<Probe target={500} />)
    expect(screen.getByTestId('v')).toHaveTextContent('500')
  })

  it('starts below the target and reaches it once frames run', () => {
    stubMotion(false)
    const frames: FrameRequestCallback[] = []
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => frames.push(cb))
    vi.stubGlobal('cancelAnimationFrame', () => {})

    render(<Probe target={1000} />)
    expect(screen.getByTestId('v')).toHaveTextContent('0')
    expect(frames.length).toBeGreaterThan(0)

    act(() => frames[frames.length - 1](performance.now() + 10_000))
    expect(screen.getByTestId('v')).toHaveTextContent('1000')
  })

  it('still animates after a Strict Mode double mount', () => {
    stubMotion(false)
    const frames: FrameRequestCallback[] = []
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => frames.push(cb))
    vi.stubGlobal('cancelAnimationFrame', () => {})

    render(
      <StrictMode>
        <Probe target={1000} />
      </StrictMode>,
    )

    // The regression: with a run-once guard, the second mount registers no frame.
    expect(frames.length).toBeGreaterThan(0)
    act(() => frames[frames.length - 1](performance.now() + 10_000))
    expect(screen.getByTestId('v')).toHaveTextContent('1000')
  })
})
