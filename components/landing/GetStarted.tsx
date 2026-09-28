import { LoginCta } from './LoginCta'
import { Reveal } from './Reveal'

/**
 * The page's one real wallet-connect decision point, with the framing copy
 * the hero's old CTAs never had. Connecting creates the account (see
 * `lib/wallet/useAccount.ts`'s `ensureUser` call): there is no separate
 * signup step. The two options below are a first-view preference only, each
 * just a `LoginCta` pointed at a different destination; neither restricts
 * the other. Both `/app` and `/app/my-offers` stay reachable by any
 * connected wallet from the app nav (`components/app/Nav.tsx`) regardless of
 * which option was clicked, and nothing about the choice is persisted, so
 * there is no state anywhere that could turn this into a gate.
 */
export function GetStarted() {
  return (
    <section id="get-started" data-testid="get-started" className="border-t border-line">
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <Reveal>
          <h2 className="text-2xl font-semibold tracking-tight">
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
