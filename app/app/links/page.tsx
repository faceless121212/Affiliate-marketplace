'use client'

import Link from 'next/link'
import { Money } from '@/components/ui/Money'
import { useMyConversions, useMyLinks, useStoreVersion } from '@/lib/store/provider'
import { getOffer, totalEarnedUsd } from '@/lib/store'
import { useAccount } from '@/lib/wallet/useAccount'
import { linkUrl, relativeDate } from '@/lib/format'
import { useMemo } from 'react'

export default function LinksPage() {
  const { wallet } = useAccount()
  const links = useMyLinks(wallet)
  const conversions = useMyConversions(wallet)
  const version = useStoreVersion()
  // eslint-disable-next-line react-hooks/exhaustive-deps -- `version` is an intentional invalidation trigger (see StoreProvider docblock), not an unused dependency: bumping it forces this memo to re-read the store.
  const earned = useMemo(() => (wallet ? totalEarnedUsd(wallet) : 0), [wallet, version])

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-lg font-semibold">My links</h1>
        <p className="text-[13px] text-muted">
          Your links, and what they’ve earned.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label="Total earned" value={<Money value={earned} tone="paid" />} testId="total-earned" />
        <Stat label="Active links" value={<span className="font-mono tnum">{links.length}</span>} />
        <Stat label="Conversions" value={<span className="font-mono tnum">{conversions.length}</span>} />
      </div>

      <div>
        <h2 className="mb-2 text-[13px] font-semibold">Tracking links</h2>
        {links.length === 0 ? (
          <Empty>
            No tracking links yet. <Link href="/app" className="text-info hover:underline">Browse offers</Link> and get your first link.
          </Empty>
        ) : (
          <Table head={['Offer', 'Clicks', 'Link']}>
            {links.map((l) => {
              const offer = getOffer(l.offerId)
              return (
                <tr key={l.id} className="border-t border-line">
                  <Td>{offer?.name ?? 'Removed offer'}</Td>
                  <Td className="font-mono tnum text-right">{l.clicks}</Td>
                  <Td className="font-mono text-[11px] break-all text-muted">
                    {linkUrl(l.offerId, l.affiliateWallet)}
                  </Td>
                </tr>
              )
            })}
          </Table>
        )}
      </div>

      <div>
        <h2 className="mb-2 text-[13px] font-semibold">Confirmed payouts</h2>
        {conversions.length === 0 ? (
          <Empty>No payouts yet. They appear here the moment a conversion confirms.</Empty>
        ) : (
          <Table head={['Offer', 'Confirmed', 'Paid']}>
            {conversions.map((c) => (
              <tr key={c.id} className="border-t border-line">
                <Td>{getOffer(c.offerId)?.name ?? 'Removed offer'}</Td>
                <Td className="text-muted">{relativeDate(c.confirmedAt)}</Td>
                <Td className="text-right">
                  <Money value={c.amountUsd} tone="paid" />
                </Td>
              </tr>
            ))}
          </Table>
        )}
      </div>
    </section>
  )
}

function Stat({
  label,
  value,
  testId,
}: {
  label: string
  value: React.ReactNode
  testId?: string
}) {
  return (
    <div className="rounded-lg border border-line bg-surface p-3">
      <p className="text-[11.5px] text-muted">{label}</p>
      <p className="mt-1 text-[17px] font-bold" data-testid={testId}>
        {value}
      </p>
    </div>
  )
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg border border-line bg-surface p-5 text-[13px] text-muted">
      {children}
    </p>
  )
}

function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-line bg-surface">
      <table className="w-full text-[13px]">
        <thead>
          <tr>
            {head.map((h, i) => (
              <th
                key={h}
                className={`px-3 py-2 text-[11.5px] font-medium text-muted ${
                  i === 0 ? 'text-left' : 'text-right'
                }`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

function Td({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-3 py-2 ${className}`}>{children}</td>
}
