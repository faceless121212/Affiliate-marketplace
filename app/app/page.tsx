'use client'

import { useState } from 'react'
import { FilterBar } from '@/components/app/FilterBar'
import { OfferCard } from '@/components/app/OfferCard'
import { useOffers } from '@/lib/store/provider'
import type { Category } from '@/lib/types'

export default function BrowsePage() {
  const [category, setCategory] = useState<Category | ''>('')
  const [query, setQuery] = useState('')
  const offers = useOffers({ category: category || undefined, query: query || undefined })

  return (
    <section>
      <header className="mb-5">
        <h1 className="text-lg font-semibold">Browse offers</h1>
        <p className="text-[13px] text-muted">
          The budget’s locked. The balance is what’s left to pay.
        </p>
      </header>

      <FilterBar
        category={category}
        query={query}
        onCategory={setCategory}
        onQuery={setQuery}
      />

      {offers.length === 0 ? (
        <p className="rounded-lg border border-line bg-surface p-6 text-center text-[13px] text-muted">
          No offers match. Try another category, or clear the search.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {offers.map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </div>
      )}
    </section>
  )
}
