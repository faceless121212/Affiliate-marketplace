import { ImageResponse } from 'next/og'
import { OG_ALT, OG_SIZE, renderShareImage } from '@/lib/ogImage'

export const alt = OG_ALT
export const size = OG_SIZE
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(renderShareImage(), size)
}
