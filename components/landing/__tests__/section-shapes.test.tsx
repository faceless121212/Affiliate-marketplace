import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import LandingPage from '@/app/page'

/**
 * The governing rule from design.md §4, made mechanical.
 *
 * Before the redesign every section was `mx-auto max-w-6xl px-4 py-16`,
 * centred, separated by an identical border-t: eight instances of one shape,
 * which is what made the page read as stacked text. `data-shape` names each
 * section's layout archetype so the rule can be asserted rather than hoped
 * for.
 */
describe('Landing section shapes', () => {
  // Every direct child of <main>, unfiltered. A <section> reports its
  // data-shape; anything else reports its tag, so a section demoted to a <div>
  // (which would silently drop out of a tag filter) shows up as "<div>".
  const shapesOf = () => {
    render(<LandingPage />)
    return Array.from(document.querySelector('main')?.children ?? []).map((el) =>
      el.tagName === 'SECTION' ? el.getAttribute('data-shape') : `<${el.tagName.toLowerCase()}>`,
    )
  }

  it('lays the page out as exactly split, rail, bento, typesplit, band, centred', () => {
    // Pins the order, the count, and that each one is a real <section>.
    expect(shapesOf()).toEqual(['split', 'rail', 'bento', 'typesplit', 'band', 'centred'])
  })

  it('gives every section a declared shape', () => {
    const shapes = shapesOf()
    expect(shapes.length).toBeGreaterThanOrEqual(6)
    expect(shapes.filter((s) => s === null)).toHaveLength(0)
  })

  it('never places two sections of the same shape next to each other', () => {
    const shapes = shapesOf()
    for (let i = 1; i < shapes.length; i++) {
      expect(shapes[i], `sections ${i} and ${i + 1} share the shape "${shapes[i]}"`).not.toBe(
        shapes[i - 1],
      )
    }
  })

  it('centres exactly one section, so centring means something', () => {
    const shapes = shapesOf()
    expect(shapes.filter((s) => s === 'centred')).toHaveLength(1)
  })
})
