import { LoginCta } from './LoginCta'
import { Reveal } from './Reveal'

const CTA_CLASS = 'px-7 py-3.5 text-[15px]'

/**
 * A second chance at the same two destinations as the hero, placed low on
 * the page so a reader who scrolled this far doesn't have to scroll back up
 * to act. Different button copy from the hero's on purpose, this is a repeat
 * of the offer, not a third CTA, so it never collides with the "exactly one
 * of each" assertions on the hero buttons.
 */
export function RepeatCtaBand() {
  return (
    <section data-testid="repeat-cta" className="border-t border-line bg-escrow/5">
      <Reveal className="mx-auto max-w-6xl px-4 py-16 text-center">
        <h2 className="text-2xl font-semibold tracking-tight">See for yourself.</h2>
        <p className="mx-auto mt-3 max-w-xl text-[14px] leading-relaxed text-muted">
          One wallet, one login.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <LoginCta destination="/app/my-offers" variant="primary" className={CTA_CLASS}>
            Start an offer
          </LoginCta>
          <LoginCta destination="/app" variant="primary" className={CTA_CLASS}>
            Browse now
          </LoginCta>
        </div>
      </Reveal>
    </section>
  )
}
