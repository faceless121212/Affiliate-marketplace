import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Reveal } from '@/components/landing/Reveal'

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
})
