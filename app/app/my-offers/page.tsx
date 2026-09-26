'use client'

import { Badge } from '@/components/ui/Badge'
import { Money } from '@/components/ui/Money'
import { EscrowMeter } from '@/components/app/EscrowMeter'
import { CreateOfferForm } from '@/components/app/CreateOfferForm'
import { TopUpDialog } from '@/components/app/TopUpDialog'
import { useMyOffers, useStoreVersion } from '@/lib/store/provider'
import { listConversionsByOffer, spentUsd } from '@/lib/store'
import { useAccount } from '@/lib/wallet/useAccount'

export default function MyOffersPage() {
  const { wallet } = useAccount()
  const offers = useMyOffers(wallet)
  // Conversion counts are read per render; the version dependency keeps them fresh.
  useStoreVersion()

  return (
    <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <div>
        <h1 className="mb-1 text-lg font-semibold">List an offer</h1>
        <p className="mb-3 text-[13px] text-muted">
          The budget is locked when the offer is created. Nobody has to take your word for it.
        </p>
        {wallet && <CreateOfferForm wallet={wallet} />}
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold">My offers</h2>
        {offers.length === 0 ? (
          <p className="rounded-lg border border-line bg-surface p-5 text-[13px] text-muted">
            You have not listed an offer yet. The form on the left lists one immediately.
          </p>
        ) : (
          <ul className="space-y-3">
            {offers.map((offer) => {
              const conversions = listConversionsByOffer(offer.id).length
              return (
                <li key={offer.id} className="rounded-lg border border-line bg-surface p-4">
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <h3 className="text-[15px] font-semibold">{offer.name}</h3>
                    {offer.status === 'depleted' ? (
                      <Badge tone="depleted">Escrow empty</Badge>
                    ) : (
                      <Badge>Community</Badge>
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
      </div>
    </section>
  )
}
