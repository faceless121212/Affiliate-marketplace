import type { Category } from '@/lib/types'

/**
 * Category glyphs, hand-authored rather than generated.
 *
 * These are six geometric primitives that must read at 16px and look like one
 * family. Generated vector art could not hold a single stroke weight across the
 * set, and arrived at 16-50 KB each; these are ~200 bytes, inline (no request),
 * and inherit `currentColor` so they tint with the design tokens.
 */
const PATHS: Record<Category, React.ReactNode> = {
  // Open carton, front view
  ecommerce: <><path d="M3 8h18v11H3z" /><path d="M3 8l3-4h12l3 4" /><path d="M12 4v15" /></>,
  // Playing-card spade
  igaming: <><path d="M12 3c-2.5 3-6 5.2-6 8.2A3.8 3.8 0 0 0 12 14a3.8 3.8 0 0 0 6-2.8C18 8.2 14.5 6 12 3Z" /><path d="M12 14v6" /><path d="M9.5 20h5" /></>,
  // Two speech bubbles
  dating: <><path d="M3 6h11v7H7l-4 3V6Z" /><path d="M10 13v1a2 2 0 0 0 2 2h4l4 3v-7a2 2 0 0 0-2-2h-3" /></>,
  // Stacked server layers
  saas: <><path d="M3 5h18v4H3z" /><path d="M3 11h18v4H3z" /><path d="M3 17h18v2H3z" /><path d="M6 7h.01M6 13h.01" /></>,
  // Ascending bars
  finance: <><path d="M4 20V13" /><path d="M10 20V9" /><path d="M16 20V5" /><path d="M4 20h16" /></>,
  // 2x2 grid
  other: <><path d="M4 4h6v6H4z" /><path d="M14 4h6v6h-6z" /><path d="M4 14h6v6H4z" /><path d="M14 14h6v6h-6z" /></>,
}

export function CategoryIcon({ category, className = '' }: { category: Category; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {PATHS[category]}
    </svg>
  )
}
