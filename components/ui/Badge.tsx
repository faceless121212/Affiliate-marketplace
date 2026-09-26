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
    // A solid lime fill with black text — the one accent colour is a fill,
    // never text (lime text on white is illegible). See app/globals.css.
    escrow: 'text-ink border-transparent bg-escrow',
  }[tone]
  return (
    <span className={`inline-block rounded-full border px-2 py-0.5 text-[10.5px] font-medium ${toneClass}`}>
      {children}
    </span>
  )
}
