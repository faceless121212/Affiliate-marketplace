import { LoginCta } from './LoginCta'
import { LiveEscrowDemo } from './LiveEscrowDemo'
import { SEED_OFFERS } from '@/lib/store'
import { money } from '@/lib/format'

// What is still locked, not what was ever deposited: escrowTotalUsd includes
// money already paid out in seed conversions, and the demo card beside this
// figure shows a remaining balance, so summing totals would contradict it.
const TOTAL_LOCKED = SEED_OFFERS.reduce((sum, offer) => sum + offer.escrowRemainingUsd, 0)

/**
 * Asymmetric split: argument left, the product working right.
 *
 * The old hero centred everything in a max-w-2xl column and put a 46px
 * escrow counter below the h1, so the largest element on the page was a
 * number whose own caption said it was simulated. The counter is gone; the
 * demo card carries the same figure in context, where it reads as a product
 * rather than a claim.
 *
 * The trust row states only what the page can source: escrow still locked
 * across the seeded offers (the sum of their remaining balances, computed
 * not asserted), the offer count, and a product
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
        {/* A gradient mesh, not a single blurred circle.
 *
            Four overlapping light sources at different scales and hues: two lime
            blooms of different sizes, a cool green one low and left to keep the
            field from reading as one flat tint, and a white one top-right that
            knocks the centre back so the mesh has somewhere to breathe. Depth
            comes from the layers disagreeing with each other; one radial can only
            ever look like one radial.

            This is hand-built on purpose. Three fal.ai generations were spent
            trying to produce this image, and the third converged on a green blur
            on black, which is a radial gradient rendered as a 13KB raster with no
            alpha channel. CSS does it exactly, at no weight, in the real token
            colour, and stays sharp at any viewport. Generation is good at content
            and bad at controlled decorative form, the same finding recorded in
            components/ui/LandingIcon.tsx. */}
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-y-1/3 -right-1/4 w-[85%]"
          style={{
            background: [
              'radial-gradient(55% 45% at 72% 26%, rgb(195 255 0 / 0.50), transparent 70%)',
              'radial-gradient(38% 52% at 90% 58%, rgb(195 255 0 / 0.26), transparent 72%)',
              'radial-gradient(44% 40% at 52% 80%, rgb(41 118 67 / 0.10), transparent 70%)',
              'radial-gradient(34% 30% at 96% 12%, rgb(255 255 255 / 0.85), transparent 68%)',
            ].join(','),
            filter: 'blur(44px)',
          }}
        />

        <div className="relative min-w-0">
          <h1 className="text-display-sm font-bold leading-[1.04] tracking-[-0.035em] sm:text-display">
            Escrow first.
            <br />
            Trust follows.
          </h1>
          <p className="mt-5 max-w-[30em] text-lead leading-relaxed text-muted">
            Advertisers lock the commission budget before the offer goes live. Affiliates see a
            guaranteed balance, not a promise.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-5">
            <LoginCta
              destination="#get-started"
              data-testid="hero-primary-cta"
              className="px-7 py-3.5 text-lead"
            >
              Get started
            </LoginCta>
            <LoginCta destination="/app" variant="ghost" className="px-0 py-0 text-body">
              Browse offers
            </LoginCta>
          </div>

          <dl className="mt-9 flex flex-wrap gap-x-8 gap-y-3 border-t border-line pt-5 text-caption text-muted">
            <div className="flex flex-col-reverse">
              <dt>locked across demo offers</dt>
              <dd className="mb-0.5 font-mono tnum text-heading font-bold tracking-tight text-ink">
                {money(TOTAL_LOCKED)}
              </dd>
            </div>
            <div className="flex flex-col-reverse">
              <dt>demo offers</dt>
              <dd className="mb-0.5 font-mono tnum text-heading font-bold tracking-tight text-ink">
                {SEED_OFFERS.length}
              </dd>
            </div>
            <div className="flex flex-col-reverse">
              <dt>payout on confirm</dt>
              <dd className="mb-0.5 text-heading font-bold tracking-tight text-text">Instant</dd>
            </div>
          </dl>
        </div>

        <div className="relative min-w-0">
          <LiveEscrowDemo />
        </div>
      </div>
    </section>
  )
}
