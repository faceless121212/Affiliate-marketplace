import { LoginCta } from './LoginCta'
import { Reveal } from './Reveal'

/**
 * The page's closing call to action: two plain links, one per first-view
 * preference ("Browse offers" to /app, "List an offer" to /app/my-offers).
 * Neither connects a wallet here. Sign-in happens at the destination, where
 * `components/app/ConnectGate.tsx` presents it, and connecting creates the
 * account (`lib/wallet/useAccount.ts`'s `ensureUser`), so there is no separate
 * signup step. The choice only decides what a visitor sees first: both routes
 * stay reachable to any connected wallet from the app nav
 * (`components/app/Nav.tsx`), and nothing about it is persisted, so there is
 * no state anywhere that could turn this into a gate.
 */
export function GetStarted() {
  return (
    <section id="get-started" data-testid="get-started" data-shape="centred" className="py-23">
      <div className="mx-auto max-w-2xl px-4 text-center">
        <Reveal>
          <h2 className="text-[36px] font-semibold leading-[1.1] tracking-[-0.03em] text-balance">
            One wallet. Then tell us why you’re here.
          </h2>
          <p className="mt-3 text-[14px] leading-relaxed text-muted">
            Connecting a wallet creates your account, no email, no password. Right after, pick
            what brought you here today:
          </p>
        </Reveal>

        <Reveal delayMs={80} className="mt-8 grid gap-3 sm:grid-cols-2">
          <LoginCta destination="/app" variant="secondary" className="w-full px-5 py-4 text-[14px]">
            Browse offers
          </LoginCta>
          <LoginCta
            destination="/app/my-offers"
            variant="secondary"
            className="w-full px-5 py-4 text-[14px]"
          >
            List an offer
          </LoginCta>
        </Reveal>

        <Reveal delayMs={140}>
          <p className="mt-4 text-[12px] text-muted">
            Either choice just decides what you see first. Every wallet gets both. Switch anytime
            from the nav.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
