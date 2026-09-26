export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string
  hint?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="block text-[12px] text-muted mb-1">{label}</span>
      {children}
      {hint && !error && <span className="block text-[11px] text-muted mt-1">{hint}</span>}
      {error && <span className="block text-[11px] text-depleted mt-1">{error}</span>}
    </label>
  )
}

// `border-inset` (#E5E5E5), not `border-line` (#F0F0F0): on white, `line` is
// too close to the page/card background to read as an input boundary — this
// is the one spot the brief calls out by name.
export const inputClass =
  'w-full rounded-[8px] border border-inset bg-canvas px-2.5 py-2 text-[13px] text-text outline-none focus:border-text'
