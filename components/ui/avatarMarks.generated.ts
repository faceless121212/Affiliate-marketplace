/**
 * The eight offer-avatar marks, hand-authored on a 24x24 grid.
 *
 * These replace marks traced from generated raster art, which cost 182KB for
 * eight shapes: a circle that weighed 21KB, a triangle that weighed 46KB, and
 * a leaf described by 108 near-collinear paths. Tracing produces thousands of
 * points for geometry expressible in a few dozen bytes, and every traced mark
 * was a solid silhouette, so at the 20px size used in the landing page's browse
 * preview they stopped being marks and became coloured dots.
 *
 * Each of these is built from circles, rectangles and one diagonal, and each
 * carries negative space so it still reads as a distinct mark at 20px. Total
 * 1.1KB, about 166x smaller.
 *
 * Every mark is `fill="currentColor"` so it tints with whatever colour the
 * wrapping <svg> is given (see lib/offerAvatar.ts for the palette, whose tones
 * are all measured to clear 4.5:1 against their own tile).
 *
 * Kept as inline strings rather than <img src> for the same reason as before:
 * an <img> cannot inherit currentColor, so a tinted mark needs its path data
 * in the DOM, and OfferAvatar renders inside client boundaries.
 *
 * The file name keeps its `.generated` suffix for import stability; the
 * contents are no longer generated. Do not re-trace these.
 */
export const AVATAR_MARKS: readonly string[] = [
  // ring
  '<path fill="currentColor" fill-rule="evenodd" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 3.5a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13Z"/><circle cx="12" cy="12" r="3" fill="currentColor"/>',
  // slot
  '<path fill="currentColor" fill-rule="evenodd" d="M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm2.5 8.25h11v1.5h-11v-1.5Z"/>',
  // quad
  '<path fill="currentColor" d="M3 3h8v8H3V3Zm10 0h8v8h-8V3ZM3 13h8v8H3v-8Z"/><circle cx="17" cy="17" r="4" fill="currentColor"/>',
  // split
  '<path fill="currentColor" d="M3 3h18v3.2L6.2 21H3V3Z"/><path fill="currentColor" d="M21 10.5V21h-10.5L21 10.5Z"/>',
  // vesica
  '<path fill="currentColor" fill-rule="evenodd" d="M9 4.5a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15Zm6 0a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15Z"/>',
  // steps
  '<path fill="currentColor" d="M3 15h4.5v6H3v-6Zm6.75-5h4.5v11h-4.5V10ZM16.5 3H21v18h-4.5V3Z"/>',
  // cross
  '<path fill="currentColor" d="M10.25 3h3.5v7.25H21v3.5h-7.25V21h-3.5v-7.25H3v-3.5h7.25V3Z"/>',
  // frame
  '<path fill="currentColor" fill-rule="evenodd" d="M3 3h18v18H3V3Zm3.5 3.5v11h11v-11h-11Z"/><path fill="currentColor" d="M9 9h6v6H9V9Z"/>',
]
