import { Badge } from '@/components/ui/Badge'
import { EscrowCounter } from './EscrowCounter'

/** The hero's narrow centre column: badges, wordmark, the live escrow counter. */
export function HeroCenter() {
  return (
    <div className="order-last flex flex-col items-center gap-5 text-center lg:order-none lg:justify-self-center lg:self-start lg:pt-2">
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        <Badge>Solana</Badge>
        <Badge>Devnet</Badge>
        <Badge>CPA</Badge>
      </div>
      <p className="text-[17px] font-semibold tracking-tight">Nativness</p>

      <EscrowCounter />

      <a href="#how-it-works" className="text-[12px] text-muted hover:text-text">
        How it works
      </a>
    </div>
  )
}
