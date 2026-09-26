export function WhyEscrow() {
  return (
    <section className="border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 lg:grid-cols-2">
        <h2 className="text-2xl font-semibold tracking-tight">
          Why escrow, and not reputation
        </h2>
        <div className="space-y-4 text-[15px] leading-relaxed text-muted">
          <p>
            A reputation system prices trust after the fact. It can tell you who failed to pay
            last quarter; it cannot stop this quarter’s advertiser from being the next one. That
            is why every open affiliate market eventually closes itself off — vetting becomes the
            only defence, and vetting is what locks out newcomers.
          </p>
          <p>
            Escrow inverts the order. The money is committed before an affiliate ever sees the
            offer, so the listing itself carries the guarantee. Nobody has to be trusted, which
            is precisely what makes it safe to let anyone list.
          </p>
          <p className="text-text">
            An unknown advertiser with a funded balance is a better counterparty than a
            well-known one with an unfunded promise.
          </p>
        </div>
      </div>
    </section>
  )
}
