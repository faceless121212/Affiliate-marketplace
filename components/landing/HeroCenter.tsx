import { Badge } from '@/components/ui/Badge'
import { EscrowCounter } from './EscrowCounter'

/**
 * The hero's narrow centre column: badges, the live escrow counter, and the
 * link into the mechanic. No wordmark: "Nativness" already sits in the
 * header a couple of hundred pixels above, and repeating it here bought
 * nothing but height in the column that was already the tallest of the three.
 */
export function HeroCenter() {
  return (
    <div className="order-last flex flex-col items-center gap-4 text-center lg:order-none lg:justify-self-center">
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        <Badge>Solana</Badge>
        <Badge>Devnet</Badge>
        <Badge>CPA</Badge>
      </div>

      <EscrowCounter />

      <a href="#how-it-works" className="text-[12px] text-muted hover:text-text">
        How it works
      </a>
    </div>
  )
}
