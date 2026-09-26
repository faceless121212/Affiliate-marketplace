import { CATEGORIES, type Category } from '@/lib/types'
import { inputClass } from '@/components/ui/Field'

export function FilterBar({
  category,
  query,
  onCategory,
  onQuery,
}: {
  category: Category | ''
  query: string
  onCategory: (c: Category | '') => void
  onQuery: (q: string) => void
}) {
  return (
    <div className="mb-5 flex flex-col gap-2 sm:flex-row">
      <label className="flex-1">
        <input
          aria-label="Search"
          className={inputClass}
          placeholder="Search by name or description"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
        />
      </label>
      <label className="sm:w-48">
        <select
          aria-label="Filter by category"
          className={inputClass}
          value={category}
          onChange={(e) => onCategory(e.target.value as Category | '')}
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}
