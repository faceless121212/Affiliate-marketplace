import { SEED_OFFERS } from '@/lib/store'
import { money } from '@/lib/format'

/**
 * Shared content for `app/opengraph-image.tsx` and `app/twitter-image.tsx`.
 * Both special files call `renderShareImage()` and pass the result to their
 * own `ImageResponse`, so the two images stay pixel-identical without one
 * special file importing another (Next generates a route per special file;
 * keeping the shared piece in a plain module avoids depending on how that
 * generation handles a re-export).
 *
 * `ImageResponse` renders through Satori, not a browser: only flexbox
 * layout, and every div with more than one child needs an explicit
 * `display: 'flex'` (Satori doesn't default to it the way CSS does).
 */

export const OG_SIZE = { width: 1200, height: 630 }
export const OG_ALT = 'Nativness: escrow first, trust follows'

const ink = '#000000'
const muted = '#666666'
const canvas = '#FFFFFF'
const inset = '#E5E5E5'
// Fill only, per the brand rule: lime never renders as text.
const escrow = '#C3FF00'

// One of the six seeded demo offers, not a Nativness-wide figure. Labelled
// below as "One listed offer", never as a platform total.
const demoOffer = SEED_OFFERS.find((o) => o.id === 'of_seed_drayton')!
const fillPct = Math.round((demoOffer.escrowRemainingUsd / demoOffer.escrowTotalUsd) * 100)

export function renderShareImage() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: canvas,
        color: ink,
        padding: '64px',
        fontFamily: 'sans-serif',
      }}
    >
      {/* Wordmark */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 22, height: 22, borderRadius: 6, backgroundColor: escrow, display: 'flex' }} />
        <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.01em', display: 'flex' }}>
          Nativness
        </div>
      </div>

      {/* Positioning line, drawn from the hero copy verbatim */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05, display: 'flex' }}>
          Escrow first. Trust follows.
        </div>
        <div style={{ fontSize: 32, color: muted, display: 'flex' }}>
          Budget locked before the offer goes live.
        </div>
      </div>

      {/* Escrow motif: an EscrowMeter-style bar and figure, sourced from one
          seeded demo offer and captioned as exactly that, not a platform
          statistic. */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: 620 }}>
        <div style={{ fontSize: 17, color: muted, display: 'flex' }}>
          One listed offer, escrow remaining
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, fontFamily: 'monospace' }}>
          <div style={{ fontSize: 44, fontWeight: 700, display: 'flex' }}>
            {money(demoOffer.escrowRemainingUsd)}
          </div>
          <div style={{ fontSize: 24, color: muted, display: 'flex' }}>
            / {money(demoOffer.escrowTotalUsd)}
          </div>
        </div>
        <div style={{ width: '100%', height: 18, borderRadius: 9, backgroundColor: inset, display: 'flex' }}>
          <div
            style={{
              width: `${fillPct}%`,
              height: '100%',
              borderRadius: 9,
              backgroundColor: escrow,
              display: 'flex',
            }}
          />
        </div>
      </div>
    </div>
  )
}
