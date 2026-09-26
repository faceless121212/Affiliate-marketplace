export default function LandingPage() {
  return (
    <main className="min-h-dvh grid place-items-center px-4">
      <div className="border border-line bg-surface rounded-md p-6 max-w-sm w-full">
        <p className="text-muted text-sm">Escrow remaining</p>
        <p className="font-mono tnum text-2xl">
          <span className="text-escrow">$340.00</span>
          <span className="text-muted"> / $500.00</span>
        </p>
      </div>
    </main>
  )
}
