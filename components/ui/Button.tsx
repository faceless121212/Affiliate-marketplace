type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'paid' | 'secondary' | 'ghost'
}

export function Button({ variant = 'primary', className = '', ...rest }: Props) {
  const variantClass = {
    // Black text on the lime fill — lime is a fill colour only; text drawn
    // in it is illegible on white (~1.2:1). Darkening slightly on hover
    // (brightness-95) reads as pressed feedback on a light, saturated fill.
    primary: 'bg-escrow text-ink hover:brightness-95 disabled:opacity-40',
    // White on the paid green. `paid` is darkened for 4.5:1 body-text
    // legibility elsewhere, so black text here no longer has enough
    // contrast; white does (5.6:1). No longer used by the split hero's
    // affiliate CTA — both hero CTAs now share `primary` so the two
    // audiences read as peers; the accent chips carry the distinction.
    paid: 'bg-paid text-white hover:brightness-110 disabled:opacity-40',
    secondary: 'border border-line bg-surface text-text hover:border-muted hover:bg-line disabled:opacity-40',
    ghost: 'text-muted hover:text-text',
  }[variant]
  return (
    <button
      {...rest}
      className={`rounded-[8px] px-3 py-2 text-[13px] font-semibold transition disabled:cursor-not-allowed ${variantClass} ${className}`}
    />
  )
}
