/**
 * Permanent and undismissable. A viewer must not be able to mistake a
 * localStorage number for an on-chain balance.
 */
export function PrototypeBanner() {
  return (
    <div
      role="status"
      // A pale lime wash (fill), black text — lime text on white is
      // illegible, so this drops the old amber-on-dark "text-escrow" pairing
      // in favour of the fill+ink pattern used everywhere else.
      className="border-b border-line bg-escrow/20 px-4 py-2 text-[12px] text-text"
    >
      <span className="font-semibold">Prototype</span> — escrow balances are simulated and
      stored in this browser. Not yet on-chain.
    </div>
  )
}
