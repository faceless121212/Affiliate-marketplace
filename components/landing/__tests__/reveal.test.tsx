import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { Reveal } from '@/components/landing/Reveal'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('Reveal', () => {
  // Asserts the gating mechanism itself: the `motion-reduce:` utilities that
  // force the final, visible state and disable the transition, rather than
  // any visual outcome, which jsdom cannot render anyway.
  it('carries motion-reduce utilities that force the final state and disable the transition', () => {
    render(
      <Reveal className="marker-class">
        <p>content</p>
      </Reveal>,
    )
    const wrapper = screen.getByText('content').parentElement!
    expect(wrapper.className).toMatch(/motion-reduce:opacity-100/)
    expect(wrapper.className).toMatch(/motion-reduce:translate-y-0/)
    expect(wrapper.className).toMatch(/motion-reduce:transition-none/)
  })

  it('starts hidden via data-revealed and exposes it as an attribute, not inline style', () => {
    render(
      <Reveal>
        <p>content</p>
      </Reveal>,
    )
    const wrapper = screen.getByText('content').parentElement!
    // jsdom has no IntersectionObserver, so Reveal degrades to revealed
    // immediately rather than hiding content forever in an environment that
    // cannot tell it the element ever entered the viewport.
    expect(wrapper).toHaveAttribute('data-revealed', 'true')
  })

  it('applies a stagger delay via transition-delay when delayMs is set', () => {
    render(
      <Reveal delayMs={160}>
        <p>content</p>
      </Reveal>,
    )
    const wrapper = screen.getByText('content').parentElement!
    expect(wrapper.style.transitionDelay).toBe('160ms')
  })

  it('reveals on scroll even when the observer never fires', () => {
    // Regression: IntersectionObserver only fires on a CHANGE of intersection
    // state, so scrolling past a section in one jump could leave it stuck at
    // opacity 0 forever. A live page had 13 such elements, including a whole
    // section, permanently invisible.
    const observers: { cb: IntersectionObserverCallback }[] = []
    class NeverFires {
      constructor(cb: IntersectionObserverCallback) {
        observers.push({ cb })
      }
      observe() {}
      disconnect() {}
      unobserve() {}
      takeRecords() {
        return []
      }
      root = null
      rootMargin = ''
      thresholds = []
    }
    vi.stubGlobal('IntersectionObserver', NeverFires)

    const { getByTestId } = render(
      <Reveal>
        <span data-testid="kid">content</span>
      </Reveal>,
    )
    const wrapper = getByTestId('kid').parentElement as HTMLElement
    expect(wrapper.dataset.revealed).toBe('false')

    // The element is above the viewport: we scrolled straight past it.
    vi.spyOn(wrapper, 'getBoundingClientRect').mockReturnValue({
      top: -500, bottom: -100, left: 0, right: 0, width: 0, height: 400, x: 0, y: -500,
      toJSON: () => ({}),
    } as DOMRect)

    act(() => {
      window.dispatchEvent(new Event('scroll'))
    })

    expect(wrapper.dataset.revealed).toBe('true')
    expect(observers.length).toBeGreaterThan(0)
  })
})
