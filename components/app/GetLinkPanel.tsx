'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { issueLink } from '@/lib/store'
import { useMutate } from '@/lib/store/provider'
import { linkUrl } from '@/lib/format'
import type { Offer } from '@/lib/types'

export function GetLinkPanel({ offer, wallet }: { offer: Offer; wallet: string }) {
  const mutate = useMutate()
  const [url, setUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  function generate() {
    // Idempotent in the store, so clicking twice cannot fragment attribution.
    const link = mutate(() => issueLink(offer.id, wallet))
    setUrl(linkUrl(link.offerId, link.affiliateWallet))
  }

  async function copy() {
    if (!url) return
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
    } catch {
      // Clipboard denied. The URL is on screen and selectable, so nothing is lost.
    }
  }

  if (!url) {
    return (
      <div className="rounded-lg border border-line bg-surface p-4">
        <Button onClick={generate}>Get link</Button>
        <p className="mt-2 text-[11.5px] text-muted">
          Your wallet’s in the link. Payouts land there.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-line bg-surface p-4">
      <p className="mb-2 text-[11.5px] text-muted">Your tracking link</p>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <code className="min-w-0 flex-1 break-all rounded-[8px] border border-inset bg-canvas px-2 py-1.5 font-mono text-[12px]">
          {url}
        </code>
        <Button variant="secondary" onClick={copy} className="shrink-0">
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>
    </div>
  )
}
