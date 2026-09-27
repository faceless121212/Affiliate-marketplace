export function Field({
  label,
  hint,
  error,
  children,
  align,
}: {
  label: string
  hint?: string
  error?: string
  children: React.ReactNode
  /**
   * Set when this field is one half of a `FieldRow`. Swaps the wrapping
   * `<label>` for a `display: contents` element, so the label/input/hint
   * stop being one stacked block and instead become three direct grid
   * items of the parent row — see `FieldRow` for why.
   */
  align?: 'row'
}) {
  const Wrapper = align === 'row' ? 'div' : 'label'
  return (
    <Wrapper className={align === 'row' ? 'contents' : 'block'}>
      <span className="block text-[12px] text-muted mb-1">{label}</span>
      {children}
      {hint && !error && <span className="block text-[11px] text-muted mt-1">{hint}</span>}
      {error && <span className="block text-[11px] text-depleted mt-1">{error}</span>}
    </Wrapper>
  )
}

/**
 * Lays out two `<Field align="row">` side by side so their labels, inputs
 * and hints each land in a shared grid row (label row, input row, hint
 * row), sized to the taller of the two. That is the actual fix for a
 * two-up row where one label wraps and the other doesn't: it used to leave
 * the two inputs starting at different heights, because each `Field` was
 * an independent block with no idea how tall its sibling's label was.
 * `grid-flow-col` with three explicit rows fills each column (i.e. each
 * field's label/input/hint) top to bottom before moving to the next, so
 * the label/input/hint order per field is preserved without reordering
 * children by hand.
 */
export function FieldRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 grid-flow-col grid-rows-[auto_auto_auto] gap-x-3">
      {children}
    </div>
  )
}

// `border-inset` (#E5E5E5), not `border-line` (#F0F0F0): on white, `line` is
// too close to the page/card background to read as an input boundary — this
// is the one spot the brief calls out by name.
export const inputClass =
  'w-full rounded-[8px] border border-inset bg-canvas px-2.5 py-2 text-[13px] text-text outline-none focus:border-text'
