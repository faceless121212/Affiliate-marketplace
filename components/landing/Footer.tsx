import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-8">
        <p className="text-[13px] font-semibold">Nativness</p>
        <Link href="/app" className="text-[13px] text-muted hover:text-text">
          Marketplace
        </Link>
        <a
          href="https://github.com/faceless121212/Affiliate-marketplace"
          className="text-[13px] text-muted hover:text-text"
        >
          Source
        </a>
        <p className="ml-auto text-[12px] text-muted">
          Solana devnet prototype. Escrow is simulated.
        </p>
      </div>
    </footer>
  )
}
