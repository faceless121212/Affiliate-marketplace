import { AVATAR_MARKS } from './avatarMarks.generated'
import { AVATAR_PALETTE, avatarIndexFor, avatarPaletteKeyFor } from '@/lib/offerAvatar'
import type { Offer } from '@/lib/types'

const DIMENSIONS = { default: 40, large: 56 } as const

/**
 * A square tile carrying one of eight abstract marks, deterministically
 * assigned and tinted from the offer id (see `lib/offerAvatar.ts`). Purely
 * decorative: `aria-hidden` on the mark itself, so the offer name rendered
 * beside it (by the caller) stays the only accessible label.
 *
 * The mark is inlined as raw SVG markup (`AVATAR_MARKS`, extracted from
 * `public/avatars/*.svg` ahead of time) rather than loaded via `<img src>`,
 * because only an inlined `<path fill="currentColor">` picks up the tint
 * colour set on the wrapping element — an `<img>` cannot inherit
 * `currentColor` and would render invisible against its tile.
 */
export function OfferAvatar({
  offer,
  size = 'default',
  className = '',
}: {
  offer: Pick<Offer, 'id' | 'name'>
  size?: keyof typeof DIMENSIONS
  className?: string
}) {
  const mark = AVATAR_MARKS[avatarIndexFor(offer.id)]
  const { mark: markColor, tile } = AVATAR_PALETTE[avatarPaletteKeyFor(offer.id)]
  const dimension = DIMENSIONS[size]
  const glyphSize = Math.round(dimension * 0.62)

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-md ${className}`}
      style={{ width: dimension, height: dimension, background: tile }}
    >
      <svg
        viewBox="0 0 2048 2048"
        width={glyphSize}
        height={glyphSize}
        fill="none"
        aria-hidden="true"
        style={{ color: markColor }}
        // AVATAR_MARKS is generated once from our own committed assets in
        // public/avatars/, not user input, so injecting it as markup is safe.
        dangerouslySetInnerHTML={{ __html: mark }}
      />
    </span>
  )
}
