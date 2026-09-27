import { ImageResponse } from 'next/og'
import { OG_ALT, OG_SIZE, renderShareImage } from '@/lib/ogImage'

// X/Twitter's card reuses the exact same generated image as the Open Graph
// one (`app/opengraph-image.tsx`); both call the shared `renderShareImage`
// so they stay pixel-identical.
export const alt = OG_ALT
export const size = OG_SIZE
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(renderShareImage(), size)
}
