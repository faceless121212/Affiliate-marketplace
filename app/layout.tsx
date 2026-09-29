import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { StoreProvider } from '@/lib/store/provider'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains', display: 'swap' })

export const metadata: Metadata = {
  // Resolves the opengraph-image/twitter-image routes to an absolute URL in
  // the rendered <meta> tags; without it Next falls back to localhost and
  // the social preview breaks in production. Matches the canonical domain
  // `lib/format.ts`'s `linkUrl` already assumes for tracking links.
  metadataBase: new URL('https://nativness.app'),
  title: 'Nativness: budget locked before the offer goes live',
  description:
    'A Solana-native affiliate marketplace where the commission budget sits in escrow before affiliates ever see the offer.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable}`}>
      <body className="font-sans antialiased bg-canvas text-text">
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  )
}
