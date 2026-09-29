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
  | 'lightning'
  | 'clock'
  | 'warning'
  | 'chart'
  | 'check'

const PATHS: Record<LandingGlyph, React.ReactNode> = {
  // Padlock, shackle up
  lock: <><path d="M6 11V8a6 6 0 0 1 12 0v3" /><path d="M5 11h14v9H5z" /><path d="M12 15v3" /></>,
  // Card wallet with a flap
  wallet: <><path d="M3 7a2 2 0 0 1 2-2h13v4" /><path d="M3 7v11a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1h-4a2 2 0 0 0 0 4h5" /></>,
  // Bolt
  lightning: <path d="M13 3 4 14h6l-1 7 9-11h-6l1-7Z" />,
  // Clock face
  clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  // Triangle with exclamation
  warning: <><path d="M12 4 2.5 20h19L12 4Z" /><path d="M12 10.5v4" /><path d="M12 17.5h.01" /></>,
  // Ascending bars, matching CategoryIcon's finance glyph
  chart: <><path d="M4 20V13" /><path d="M10 20V9" /><path d="M16 20V5" /><path d="M4 20h16" /></>,
  // Checkmark
  check: <path d="M4.5 12.5 9 17l10.5-11" />,
}

export function LandingIcon({
  glyph,
  className = 'h-5 w-5',
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
