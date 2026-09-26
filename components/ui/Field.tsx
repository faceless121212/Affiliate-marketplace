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

export const inputClass =
  'w-full rounded-[5px] border border-line bg-canvas px-2.5 py-2 text-[13px] text-text outline-none focus:border-muted'
