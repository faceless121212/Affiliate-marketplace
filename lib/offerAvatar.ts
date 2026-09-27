/**
 * Deterministic mark + colour assignment for `OfferAvatar`.
 *
 * Both the mark (one of eight geometric svgs in `public/avatars/`) and the
 * tint are derived from a single hash of the offer id, so the same offer
 * always renders the same avatar and a freshly created offer gets one
 * automatically — no array index, no lookup table to keep in sync.
 */

export const AVATAR_COUNT = 8

export type AvatarPaletteKey = 'paid' | 'depleted' | 'info' | 'ink' | 'muted'

/**
 * Palette-derived tones only. `escrow` (#C3FF00) is deliberately excluded:
 * it is a fill-only accent (lime text/marks are ~1.2:1 on white, illegible)
 * and using it here would risk an unreadable mark on some hash.
 *
 * `mark` is the full-strength colour (used as the SVG's `currentColor`).
 * `tile` is the same hue at 10% alpha over white — light enough to read as
 * a tinted surface, dark enough that every mark colour still clears 4.5:1
 * against it (measured: paid 4.85:1, depleted 4.78:1, info 4.71:1, ink
 * 16.83:1, muted 5.04:1).
 */
export const AVATAR_PALETTE: Record<AvatarPaletteKey, { mark: string; tile: string }> = {
  paid: { mark: '#297644', tile: 'rgba(41, 118, 68, 0.1)' },
  depleted: { mark: '#BC3B15', tile: 'rgba(188, 59, 21, 0.1)' },
  info: { mark: '#0066D6', tile: 'rgba(0, 102, 214, 0.1)' },
  ink: { mark: '#000000', tile: 'rgba(0, 0, 0, 0.1)' },
  muted: { mark: '#666666', tile: 'rgba(102, 102, 102, 0.1)' },
}

const PALETTE_KEYS: AvatarPaletteKey[] = ['paid', 'depleted', 'info', 'ink', 'muted']

/**
 * A small stable string hash (djb2 variant). Pure and synchronous so it
 * produces the same value in every environment (server render, client
 * render, tests) with no dependency on iteration or insertion order.
 */
function hashId(id: string): number {
  let hash = 5381
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 33) ^ id.charCodeAt(i)
  }
  return hash >>> 0
}

/** Index into the eight avatar marks, 0-7. */
export function avatarIndexFor(id: string): number {
  return hashId(id) % AVATAR_COUNT
}

/**
 * Palette key for the tint. Divides the hash down by the mark count first,
 * rather than re-using the same low-order bits `avatarIndexFor` reads, so
 * the mark and the colour don't move in lockstep across ids.
 */
export function avatarPaletteKeyFor(id: string): AvatarPaletteKey {
  const shifted = Math.floor(hashId(id) / AVATAR_COUNT)
  return PALETTE_KEYS[shifted % PALETTE_KEYS.length]
}
