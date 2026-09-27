import { Reveal } from './Reveal'

const GITHUB_URL = 'https://github.com/faceless121212/Affiliate-marketplace'

/**
 * Replaces the deleted `SocialProof.tsx` entirely, not just its render.
 * Labelling a quote as invented didn't stop a skimming visitor absorbing it
 * as real, so nothing here is attributed to a person who doesn't exist.
 * Only one point is live today, the GitHub link. Everything else is a
 * visibly unfilled placeholder for the owner to complete by hand, never
 * rendered as if it were already true.
 */
export function ProofNotQuotes() {
  return (
    <section data-testid="proof-not-quotes" className="border-t border-line bg-paid/5">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <Reveal>
          <h2 className="text-2xl font-semibold tracking-tight">Proof, not quotes</h2>
          <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-muted">
            No invented reviewers, no invented numbers. Only what is verifiable today.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <Reveal className="rounded-lg border border-line bg-surface p-5">
            <h3 className="text-[15px] font-semibold">Every escrow rule is public</h3>
            <p className="mt-2 text-[14px] leading-relaxed text-muted">
              Audit the logic on{' '}
              <a
                href={GITHUB_URL}
                className="text-text underline underline-offset-2 hover:no-underline"
              >
                GitHub
              </a>
              .
            </p>
          </Reveal>

          <PlaceholderCard delayMs={70}>
            [Add: hackathon name/track, if applicable]
          </PlaceholderCard>

          <PlaceholderCard delayMs={140}>
            [Add: real devnet payout count, once any exist, e.g. “N confirmed devnet payouts so
            far”]
          </PlaceholderCard>
        </div>

        <PlaceholderCard delayMs={200} className="mt-4">
          [Founder note, to be written by the founder in their own words. Not yet filled in.]
        </PlaceholderCard>
      </div>
    </section>
  )
}

/** A dashed-border, mutedly labelled slot: visibly not-yet-real, so nothing false can ship by accident. */
function PlaceholderCard({
  children,
  delayMs,
  className = '',
}: {
  children: React.ReactNode
  delayMs?: number
  className?: string
}) {
  return (
    <Reveal
      delayMs={delayMs}
      className={`rounded-lg border border-dashed border-line bg-surface p-5 ${className}`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
        Not yet filled in
      </p>
      <p className="mt-2 text-[13px] leading-relaxed text-muted">{children}</p>
    </Reveal>
  )
}
