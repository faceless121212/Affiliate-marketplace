import { LoginCta } from './LoginCta'
import { LiveEscrowDemo } from './LiveEscrowDemo'
import { SEED_OFFERS } from '@/lib/store'
import { money } from '@/lib/format'

const TOTAL_LOCKED = SEED_OFFERS.reduce((sum, offer) => sum + offer.escrowTotalUsd, 0)

/**
 * Asymmetric split: argument left, the product working right.
 *
 * The old hero centred everything in a max-w-2xl column and put a 46px
 * escrow counter below the h1, so the largest element on the page was a
 * number whose own caption said it was simulated. The counter is gone; the
 * demo card carries the same figure in context, where it reads as a product
 * rather than a claim.
 *
 * The trust row states only what the page can source: escrow locked across
 * the seeded offers (computed, not asserted), the offer count, and a product
 * property. No adoption, revenue or traffic figure about Nativness itself.
 */
export function Hero() {
  return (
    <section
      data-testid="hero"
      data-shape="split"
      className="relative overflow-hidden border-b border-line"
    >
      <div className="relative mx-auto grid max-w-6xl items-center gap-16 px-4 py-22 lg:grid-cols-[1.05fr_0.95fr]">
        {/* Decorative only. Sits behind the right column and bleeds off the
            edge; text lives in the left column, clear of it. */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-56 -top-36 h-[760px] w-[760px] rounded-full opacity-90 blur-2xl"
          style={{
            background:
              'radial-gradient(circle, rgb(195 255 0 / 0.5) 0%, rgb(195 255 0 / 0.14) 38%, transparent 66%)',
          }}
        />

        <div className="relative">
          <h1 className="text-[38px] font-bold leading-[1.04] tracking-[-0.035em] sm:text-[54px]">
            Escrow first.
            <br />
            Trust follows.
          </h1>
          <p className="mt-5 max-w-[30em] text-[16px] leading-relaxed text-muted">
            Advertisers lock the commission budget before the offer goes live. Affiliates see a
            guaranteed balance, not a promise.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-5">
            <LoginCta
              destination="#get-started"
              data-testid="hero-primary-cta"
              className="px-7 py-3.5 text-[15px]"
            >
              Get started
            </LoginCta>
            <LoginCta destination="/app" variant="ghost" className="px-0 py-0 text-[14px]">
              Browse offers
            </LoginCta>
          </div>

          <dl className="mt-9 flex flex-wrap gap-x-8 gap-y-3 border-t border-line pt-5 text-[12px] text-muted">
            <div className="flex flex-col-reverse">
              <dt>locked across demo offers</dt>
              <dd className="mb-0.5 font-mono tnum text-[19px] font-bold tracking-tight text-ink">
                {money(TOTAL_LOCKED)}
              </dd>
            </div>
            <div className="flex flex-col-reverse">
              <dt>demo offers</dt>
              <dd className="mb-0.5 font-mono tnum text-[19px] font-bold tracking-tight text-ink">
                {SEED_OFFERS.length}
              </dd>
            </div>
            <div className="flex flex-col-reverse">
              <dt>payout on confirm</dt>
              <dd className="mb-0.5 text-[19px] font-bold tracking-tight text-text">Instant</dd>
            </div>
          </dl>
        </div>

        <div className="relative">
          <LiveEscrowDemo />
        </div>
      </div>
    </section>
  )
}
