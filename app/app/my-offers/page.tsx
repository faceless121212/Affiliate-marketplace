'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Money } from '@/components/ui/Money'
import { OfferAvatar } from '@/components/ui/OfferAvatar'
import { EscrowMeter } from '@/components/app/EscrowMeter'
import { CreateOfferForm } from '@/components/app/CreateOfferForm'
import { TopUpDialog } from '@/components/app/TopUpDialog'
import { useMyOffers, useStoreVersion } from '@/lib/store/provider'
import { listConversionsByOffer, spentUsd } from '@/lib/store'
import { useAccount } from '@/lib/wallet/useAccount'

/**
 * Leads with the list the page is named after, not the form.
 *
 * This was a two-column split that gave the creation form a fixed 360px and
 * handed the remaining 736px to an offers list that, for a new advertiser,
 * held one sentence. The narrow column also forced every field tall enough
 * that the submit button landed at y=960 on a 900px viewport: the page's
 * primary action was below the fold on load.
 *
 * So creation is a disclosure now. It opens automatically while you have no
 * offers (an empty list with a hidden form would be a dead end), and
 * otherwise sits behind the button beside the heading. Open, it runs the
 * full width with its fields in two columns, which is what brings the
 * submit back above the fold.
 */
export default function MyOffersPage() {
  const { wallet } = useAccount()
  const offers = useMyOffers(wallet)
  // Conversion counts are read per render; the version dependency keeps them fresh.
  useStoreVersion()
  const [creating, setCreating] = useState(false)

  const hasOffers = offers.length > 0
  const showForm = creating || !hasOffers

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="mb-1 text-lg font-semibold">My offers</h1>
          <p className="text-[13px] text-muted">
            The budget locks the moment an offer is created. No trust required.
          </p>
        </div>
        {hasOffers && (
          <Button
            type="button"
            variant={creating ? 'secondary' : 'primary'}
            onClick={() => setCreating((v) => !v)}
          >
            {creating ? 'Cancel' : 'List an offer'}
          </Button>
        )}
      </div>

      {showForm && (
        <div>
          <h2 className="mb-3 text-[15px] font-semibold">
            {hasOffers ? 'List an offer' : 'List your first offer'}
          </h2>
          {wallet && <CreateOfferForm wallet={wallet} />}
        </div>
      )}

      {hasOffers && (
        <ul className="grid gap-3 sm:grid-cols-2">
          {offers.map((offer) => {
            const conversions = listConversionsByOffer(offer.id).length
            return (
              <li key={offer.id} className="rounded-lg border border-line bg-surface p-4">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <OfferAvatar offer={offer} />
                    <h3 className="min-w-0 truncate text-[15px] font-semibold">{offer.name}</h3>
                  </div>
                  {offer.status === 'depleted' && (
                    <Badge tone="depleted">Escrow empty</Badge>
                  )}
                </div>

                <EscrowMeter offer={offer} />

                <dl className="mt-3 grid grid-cols-3 gap-2 border-t border-line pt-3">
                  <div>
                    <dt className="text-[11px] text-muted">Conversions</dt>
                    <dd className="font-mono tnum text-[14px]">{conversions}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] text-muted">Budget spent</dt>
                    <dd className="text-[14px]">
                      <Money value={spentUsd(offer)} />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] text-muted">CPA</dt>
                    <dd className="text-[14px]">
                      <Money value={offer.commissionAmountUsd} />
                    </dd>
                  </div>
                </dl>

                <div className="mt-3">
                  <TopUpDialog offerId={offer.id} />
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
