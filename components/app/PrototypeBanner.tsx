/**
 * Permanent and undismissable. A viewer must not be able to mistake a
 * localStorage number for an on-chain balance.
 */
export function PrototypeBanner() {
  return (
    <div
      role="status"
      className="border-b border-escrow/25 bg-escrow/10 px-4 py-2 text-[12px] text-escrow"
    >
      <span className="font-semibold">Prototype</span> — escrow balances are simulated and
      stored in this browser. Not yet on-chain.
    </div>
  )
}
