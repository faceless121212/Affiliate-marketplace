import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { OfferAvatar } from '@/components/ui/OfferAvatar'
import { avatarIndexFor, avatarPaletteKeyFor, AVATAR_PALETTE } from '@/lib/offerAvatar'

const offer = { id: 'of_seed_drayton', name: 'Drayton Supply Co.' }

describe('OfferAvatar', () => {
  it('renders the mark as aria-hidden, decorative only', () => {
    const { container } = render(<OfferAvatar offer={offer} />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('aria-hidden', 'true')
  })

  it('exposes no accessible name of its own: the offer name beside it carries the meaning', () => {
    render(
      <div>
        <OfferAvatar offer={offer} />
        <h3>{offer.name}</h3>
      </div>,
    )
    // The avatar contributes no text and no role; only the sibling heading
    // is discoverable by its accessible name.
    expect(screen.getByRole('heading', { name: offer.name })).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('picks the same mark and tint for the same offer id every render (determinism)', () => {
    const { container: first } = render(<OfferAvatar offer={offer} />)
    const { container: second } = render(<OfferAvatar offer={offer} />)
    expect(first.querySelector('svg')?.innerHTML).toBe(second.querySelector('svg')?.innerHTML)
    expect((first.querySelector('span') as HTMLElement).style.background).toBe(
      (second.querySelector('span') as HTMLElement).style.background,
    )
  })

  it('tints the tile and mark from the same palette entry the hash selects', () => {
    const { container } = render(<OfferAvatar offer={offer} />)
    const span = container.querySelector('span') as HTMLElement
    const svg = container.querySelector('svg') as SVGElement
    const expected = AVATAR_PALETTE[avatarPaletteKeyFor(offer.id)]
    expect(span.style.background).toBe(expected.tile)
    expect((svg.style as CSSStyleDeclaration & { color: string }).color).not.toBe('')
    // The mark's assigned index is stable and within the eight-mark set.
    expect(avatarIndexFor(offer.id)).toBe(avatarIndexFor(offer.id))
  })

  it('renders larger at the "large" size than the default', () => {
    const { container: def } = render(<OfferAvatar offer={offer} />)
    const { container: large } = render(<OfferAvatar offer={offer} size="large" />)
    const defSpan = def.querySelector('span') as HTMLElement
    const largeSpan = large.querySelector('span') as HTMLElement
    expect(parseInt(largeSpan.style.width)).toBeGreaterThan(parseInt(defSpan.style.width))
  })
})
