import { Badge } from '@/components/ui/Badge'

/**
 * A slim strip above the header, x402-style: a small badge, one short true
 * line, and a link. It must never claim more than Phase 1 actually is —
 * escrow here is a number in localStorage, not an on-chain balance.
 */
export function AnnouncementBar() {
  return (
    <div className="border-b border-line bg-surface">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-2 text-[12px]">
        <Badge tone="escrow">Devnet</Badge>
        <p className="text-muted">
          Phase 1 prototype — escrow balances are simulated in this browser, not on-chain yet.
        </p>
        <a
          href="https://github.com/faceless121212/Affiliate-marketplace"
          className="ml-auto shrink-0 text-text underline-offset-2 hover:underline"
        >
          View the source
        </a>
      </div>
    </div>
  )
}
