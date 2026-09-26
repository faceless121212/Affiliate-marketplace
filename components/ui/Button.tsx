type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost'
}

export function Button({ variant = 'primary', className = '', ...rest }: Props) {
  const variantClass = {
    // Dark text on the bright accent, as on all three reference apps.
    primary: 'bg-escrow text-canvas hover:brightness-110 disabled:opacity-40',
    secondary: 'border border-line bg-surface text-text hover:border-muted disabled:opacity-40',
    ghost: 'text-muted hover:text-text',
  }[variant]
  return (
    <button
      {...rest}
      className={`rounded-[5px] px-3 py-2 text-[13px] font-semibold transition disabled:cursor-not-allowed ${variantClass} ${className}`}
    />
  )
}
