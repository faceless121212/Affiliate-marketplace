'use client'

import { use } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { Money } from '@/components/ui/Money'
import { Address } from '@/components/ui/Address'
import { EscrowMeter } from '@/components/app/EscrowMeter'
import { GetLinkPanel } from '@/components/app/GetLinkPanel'
import { useOffer } from '@/lib/store/provider'
import { useAccount } from '@/lib/wallet/useAccount'
import { CATEGORIES } from '@/lib/types'

export default function OfferDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const offer = useOffer(id)
  const { wallet } = useAccount()

  if (!offer) {
    return (
      <p className="rounded-md border border-line bg-surface p-6 text-[13px] text-muted">
        That offer no longer exists. <Link href="/app" className="text-escrow">Back to browse</Link>.
      </p>
    )
  }

  const category = CATEGORIES.find((c) => c.value === offer.category)?.label ?? offer.category

  return (
    <article className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <div>
        <Link href="/app" className="text-[12px] text-muted hover:text-text">
          Back to browse
        </Link>
        <div className="mt-2 flex items-start gap-2">
          <h1 className="text-xl font-semibold leading-tight">{offer.name}</h1>
          {offer.verified ? <Badge tone="paid">Verified</Badge> : <Badge>Community</Badge>}
        </div>
        <p className="mt-1 text-[13px] text-muted">{category}</p>

        <p className="mt-5 text-[14px] leading-relaxed">{offer.description}</p>

        <h2 className="mt-6 text-[13px] font-semibold">Conversion terms</h2>
        <p className="mt-1 text-[13px] leading-relaxed text-muted">{offer.conversionTerms}</p>

        <h2 className="mt-6 text-[13px] font-semibold">Target page</h2>
        <a
          href={offer.targetUrl}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="mt-1 block break-all font-mono text-[12px] text-escrow"
        >
          {offer.targetUrl}
        </a>

        <h2 className="mt-6 text-[13px] font-semibold">Listed by</h2>
        <Address value={offer.advertiserWallet} className="mt-1 block text-[12px] text-muted" />
      </div>

      <aside className="space-y-4">
        <div className="rounded-md border border-line bg-surface p-4">
          {/* Escrow leads, unframed, matching the browse card: it's the
              guaranteed balance the affiliate's decision turns on, so it
              carries the most visual weight. CPA is supporting detail below
              it, in a plain unbolded footer row — not its own headline. */}
          <EscrowMeter offer={offer} />
          <div className="mt-3 flex items-baseline justify-between border-t border-line pt-2">
            <span className="text-[11.5px] text-muted">CPA per conversion</span>
            <Money value={offer.commissionAmountUsd} className="text-[13px]" />
          </div>
          {offer.status === 'depleted' && (
            <p className="mt-3 text-[11.5px] text-depleted">
              This offer cannot pay out until the advertiser tops up its escrow.
            </p>
          )}
        </div>

        {wallet && <GetLinkPanel offer={offer} wallet={wallet} />}
      </aside>
    </article>
  )
}
