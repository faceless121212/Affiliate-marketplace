export function Badge({
  children,
  tone = 'neutral',
}: {
  children: React.ReactNode
  tone?: 'neutral' | 'paid' | 'depleted' | 'escrow'
}) {
  const toneClass = {
    neutral: 'text-muted border-line',
    paid: 'text-paid border-paid/35 bg-paid/10',
    depleted: 'text-depleted border-depleted/35 bg-depleted/10',
    escrow: 'text-escrow border-escrow/35 bg-escrow/10',
  }[tone]
  return (
    <span className={`inline-block rounded border px-1.5 py-0.5 text-[10.5px] font-medium ${toneClass}`}>
      {children}
    </span>
  )
}
