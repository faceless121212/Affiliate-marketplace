/**
 * Landing-page glyphs, hand-authored rather than generated, following the
 * same model as `CategoryIcon`: 24x24 viewBox, `currentColor` stroke, one
 * shared component with a record of paths, ~200 bytes each and inline (no
 * request). Decorative only — every icon sits beside text that still carries
 * the meaning for a screen reader, so each one is `aria-hidden`.
 */
export type LandingGlyph =
  | 'lock'
  | 'wallet'
  | 'link'
  | 'lightning'
  | 'clock'
  | 'warning'
  | 'chart'
  | 'code'
  | 'check'
  | 'shield'
  | 'document'

const PATHS: Record<LandingGlyph, React.ReactNode> = {
  // Padlock, shackle up
  lock: <><path d="M6 11V8a6 6 0 0 1 12 0v3" /><path d="M5 11h14v9H5z" /><path d="M12 15v3" /></>,
  // Card wallet with a flap
  wallet: <><path d="M3 7a2 2 0 0 1 2-2h13v4" /><path d="M3 7v11a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1h-4a2 2 0 0 0 0 4h5" /></>,
  // Chain link, two loops
  link: <><path d="M9 15l6-6" /><path d="M11 6l1-1a3.5 3.5 0 0 1 5 5l-1 1" /><path d="M13 18l-1 1a3.5 3.5 0 0 1-5-5l1-1" /></>,
  // Bolt
  lightning: <path d="M13 3 4 14h6l-1 7 9-11h-6l1-7Z" />,
  // Clock face
  clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  // Triangle with exclamation
  warning: <><path d="M12 4 2.5 20h19L12 4Z" /><path d="M12 10.5v4" /><path d="M12 17.5h.01" /></>,
  // Ascending bars, matching CategoryIcon's finance glyph
  chart: <><path d="M4 20V13" /><path d="M10 20V9" /><path d="M16 20V5" /><path d="M4 20h16" /></>,
  // Angle brackets
  code: <><path d="M8.5 8 4 12l4.5 4" /><path d="M15.5 8 20 12l-4.5 4" /></>,
  // Checkmark
  check: <path d="M4.5 12.5 9 17l10.5-11" />,
  // Shield
  shield: <path d="M12 3.5 5 6v5.5c0 4.6 3 7.6 7 9 4-1.4 7-4.4 7-9V6l-7-2.5Z" />,
  // Lines, a short document
  document: <><path d="M6 3.5h9l3 3V20.5H6Z" /><path d="M9 11h6" /><path d="M9 14.5h6" /><path d="M9 18h4" /></>,
}

export function LandingIcon({
  glyph,
  className = 'h-4 w-4',
}: {
  glyph: LandingGlyph
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {PATHS[glyph]}
    </svg>
  )
}
