import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import LandingPage from '@/app/page'

// Overrides the global setup mock for this file only, so CTA destinations
// can be asserted against a real spy instead of a throwaway vi.fn().
const push = vi.fn()

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({ push, replace: vi.fn(), back: vi.fn(), prefetch: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))

describe('Landing page', () => {
  // The landing page is static marketing. It must render with no wallet
  // context at all: no provider, no adapter bundle, no mocks in this file.
  // Sign-in happens at /app, behind ConnectGate.
  it('renders with no wallet context, and every CTA is a plain link', () => {
    render(<LandingPage />)
    const main = screen.getByRole('main')
    const ctas = within(main)
      .getAllByRole('link')
      .filter((a) => (a.getAttribute('href') ?? '').startsWith('/app'))
    expect(ctas.length).toBeGreaterThan(0)
    expect(within(main).queryAllByRole('button')).toHaveLength(0)
  })

  // Replaces the old "offers two CTAs, one per audience" assertion: the
  // owner's spec reverses that decision, so the hero must now carry exactly
  // one primary call-to-action plus one smaller secondary browse link, not
  // two equal-weight buttons forcing a visitor to pick a side upfront.
  it('offers exactly one primary CTA in the hero, plus a secondary browse link', () => {
    render(<LandingPage />)
    const hero = screen.getByTestId('hero')
    const primary = within(hero).getByTestId('hero-primary-cta')
    expect(primary).toHaveTextContent('Get started')
    expect(primary).toHaveAttribute('href', '#get-started')
    expect(within(hero).getAllByTestId('hero-primary-cta')).toHaveLength(1)

    const secondary = within(hero).getByRole('link', { name: 'Browse offers' })
    expect(secondary).toBeInTheDocument()
    expect(within(hero).queryAllByRole('button')).toHaveLength(0)
  })

  it('leads with an asymmetric hero carrying the live demo, not a centred text block', () => {
    render(<LandingPage />)
    const hero = screen.getByTestId('hero')
    expect(hero).toHaveAttribute('data-shape', 'split')
    expect(within(hero).getByTestId('live-escrow-demo')).toBeInTheDocument()
    // The wordmark belongs in the header; repeating it here bought nothing but
    // height in the tallest column.
    expect(within(hero).queryByText('Nativness')).toBeNull()
  })

  it('sends the hero secondary link to /app', () => {
    render(<LandingPage />)
    const hero = screen.getByTestId('hero')
    expect(within(hero).getByRole('link', { name: 'Browse offers' })).toHaveAttribute('href', '/app')
  })

  // WhyNativness and WhatYouGet said the same things in two consecutive
  // equal-column grids, so they merge into one bento. The property worth
  // guarding is that no claim was lost in the merge, not that a section with
  // a particular testid still exists.
  it('keeps every merged claim in the bento, between the hero and the problem section', () => {
    render(<LandingPage />)
    const sections = Array.from(document.querySelector('main')?.children ?? [])
    const heroIdx = sections.findIndex((el) => el.getAttribute('data-testid') === 'hero')
    const bentoIdx = sections.findIndex((el) => el.getAttribute('data-testid') === 'bento')
    const problemIdx = sections.findIndex((el) => el.getAttribute('data-testid') === 'problem')
    expect(heroIdx).toBeGreaterThanOrEqual(0)
    expect(bentoIdx).toBeGreaterThan(heroIdx)
    expect(problemIdx).toBeGreaterThan(bentoIdx)

    const bento = screen.getByTestId('bento')
    expect(bento).toHaveAttribute('data-shape', 'bento')
    expect(bento).toHaveTextContent(/see the money before you commit/i)
    expect(bento).toHaveTextContent(/paid on confirmation/i)
    expect(bento).toHaveTextContent(/anyone can list/i)
    expect(bento).toHaveTextContent(/locked, not promised/i)
  })

  it('renders the persona picker with both destinations reachable and no gating', () => {
    render(<LandingPage />)
    const picker = screen.getByTestId('get-started')
    expect(within(picker).getByRole('link', { name: 'Browse offers' })).toHaveAttribute('href', '/app')
    expect(within(picker).getByRole('link', { name: 'List an offer' })).toHaveAttribute(
      'href',
      '/app/my-offers',
    )
  })

  it('states the persona picker is not a gate, in its own fine print', () => {
    render(<LandingPage />)
    const picker = screen.getByTestId('get-started')
    expect(picker).toHaveTextContent(/every wallet gets both/i)
    expect(picker).toHaveTextContent(/switch anytime/i)
  })

  it('renders the announcement bar and header', () => {
    render(<LandingPage />)
    expect(screen.getByTestId('site-header')).toBeInTheDocument()
    // Guards the honesty framing (constraint 8), not the exact wording:
    // escrow is disclosed as simulated and not on-chain, in one sentence.
    // (Matched as one regex, not two separate getByText calls, since the
    // escrow counter lower on the page also says "not on-chain" on its own.)
    expect(screen.getByText(/escrow is simulated.*not on-chain/i)).toBeInTheDocument()
  })

  // "One wallet. One login for both sides." moved out of the hero into the
  // bento's section header in the redesign. The property worth guarding is
  // that the page still makes the one-identity claim somewhere, not that the
  // hero is where it lives.
  it('states that one wallet covers both sides', () => {
    const { container } = render(<LandingPage />)
    const text = container.textContent ?? ''
    expect(text).toMatch(/one wallet/i)
    expect(text).toMatch(/both sides/i)
  })

  // The old "shows a real offer card with a locked escrow balance" test
  // asserted against the hero's showcase offer card, deleted along with the
  // rest of the unbalanced hero band (owner feedback: a tall card on one
  // side, nothing on the other). The element genuinely no longer exists on
  // the landing page, so there is nothing left here to assert. The property
  // it was
  // really guarding, that the escrow remainder outweighs the CPA commission
  // visually, is still covered for the real app card by
  // `components/app/__tests__/offer-card.test.tsx`'s
  // "gives the escrow remainder more visual weight than the CPA commission",
  // against the same Drayton Supply Co. $340.00 / $500.00 / $24.00 figures.

  it('cites every market figure with its source', () => {
    render(<LandingPage />)
    const market = screen.getByTestId('market')
    expect(market).toHaveTextContent('$19.4B')
    expect(market).toHaveTextContent('$17.1B')
    expect(market).toHaveTextContent('$22B')
    expect(market).toHaveTextContent('Forrester')
    expect(market).toHaveTextContent('$13.81B')
    expect(market).toHaveTextContent('11.3%')
    expect(market).toHaveTextContent('eMarketer')
  })

  // The former "Good tools cost enterprise money" card (LinkUp / Revelio
  // Labs, $75,000-$300,000/year) is deleted per owner feedback, so this
  // ledger now covers only the three claims that remain: Rakuten's NET-60
  // and Trustpilot score, the offshore-network claim (no figure), and
  // ShareASale folding into Awin.
  it('attributes each problem claim to a named source', () => {
    render(<LandingPage />)
    const problem = screen.getByTestId('problem')
    expect(problem).toHaveTextContent('NET-60')
    expect(problem).toHaveTextContent('2.2/5')
    expect(problem).toHaveTextContent('Rakuten')
    expect(problem).toHaveTextContent('Trustpilot')
    expect(problem).toHaveTextContent('ShareASale')
    expect(problem).toHaveTextContent('Awin')
    expect(problem).toHaveTextContent('October 2025')
  })

  // Re-anchored from "never claims LinkUp or Revelio Labs is an affiliate
  // network": the card that cited them (and thus justified naming them at
  // all) is now deleted, so the property worth guarding has inverted. It is
  // no longer about how they're framed if mentioned, it's that they must
  // never be mentioned, permanently, since nothing on the page cites them
  // any more.
  it('never mentions LinkUp or Revelio Labs anywhere on the page', () => {
    const { container } = render(<LandingPage />)
    const text = container.textContent ?? ''
    expect(text).not.toMatch(/linkup/i)
    expect(text).not.toMatch(/revelio/i)
  })

  it('makes no numeric claim about Nativness itself', () => {
    const { container } = render(<LandingPage />)
    const text = container.textContent ?? ''
    // Allows the animated escrow counter (labelled as the demo marketplace's
    // total, not Nativness's own) and the cited market figures. Only a
    // figure describing Nativness's own adoption, revenue or traffic is
    // disallowed.
    expect(text).not.toMatch(
      /\d[\d,]*(\.\d+)?%?\s*(companies|advertisers|affiliates|users|onboarded|paid out|conversions paid|volume|signups|revenue|traffic|GMV)\b/i,
    )
  })

  // Re-anchored from the old "renders the social-proof section labelled as
  // illustrative" assertion. `SocialProof.tsx` (and its invented names and
  // quotes) is now deleted, not just unrendered, so the property worth
  // guarding has inverted: no testimonial-style attributed quote should ever
  // appear on the page at all, permanently, not just today.
  it('never renders a testimonial-style attributed quote anywhere on the page', () => {
    const { container } = render(<LandingPage />)
    expect(screen.queryByTestId('social-proof')).not.toBeInTheDocument()

    const text = container.textContent ?? ''
    // "·" was the attribution separator ("Name · Role") unique to the
    // deleted testimonial cards; nothing else on the page uses it.
    expect(text).not.toContain('·')
    // The invented names themselves must never reappear anywhere in the DOM.
    for (const name of ['Osei', 'Adeyemi', 'Iversen', 'Whitlow']) {
      expect(text).not.toContain(name)
    }
  })

  // Re-anchored from the old "renders 'Proof, not quotes' with a live GitHub
  // link and clearly unfilled placeholders" assertion. That section (three
  // of its four cards permanently unfilled) is deleted outright per owner
  // feedback: a mostly-empty section reads as broken, not honest. The one
  // real thing it held, the GitHub source link, moved back to the footer
  // (its pre-existing home before the section moved it out). What is still
  // worth guarding: the link survives the move, and no placeholder marking
  // ever renders anywhere on the page, now or if a future section adds one
  // by accident.
  it('keeps the GitHub source link live in the footer and renders no unfilled placeholder anywhere', () => {
    const { container } = render(<LandingPage />)
    expect(screen.queryByTestId('proof-not-quotes')).not.toBeInTheDocument()

    const githubLink = screen.getByRole('link', { name: 'Source' })
    expect(githubLink).toHaveAttribute('href', expect.stringContaining('github.com'))

    expect(container.textContent ?? '').not.toMatch(/not yet filled in/i)
  })

  it('keeps the sourced competitor facts and an auditable source link on the page', () => {
    // The dedicated proof band was removed as a duplicate of the Problem
    // section. What must survive is the property it was guarding: those facts
    // are still stated with their sources, and the source is still auditable.
    const { container } = render(<LandingPage />)
    const text = container.textContent ?? ''
    for (const fact of ['Awin', 'NET-60', '2.2/5', 'October 2025', 'Trustpilot']) {
      expect(text).toContain(fact)
    }
    const githubLinks = screen
      .getAllByRole('link')
      .filter((a) => (a.getAttribute('href') ?? '').includes('github.com'))
    expect(githubLinks.length).toBeGreaterThan(0)
  })

  // Replaces the two assertions that guarded the repeat CTA band. That band
  // is deleted: it re-asked, in a third set of words ("Start an offer" /
  // "Browse now"), the same question the persona picker directly above it
  // had just asked, and the picker already sits 86% of the way down the
  // page, so it was never rescuing a reader from scrolling back up either.
  it('no longer renders a second CTA band under the persona picker', () => {
    const { container } = render(<LandingPage />)
    expect(screen.queryByTestId('repeat-cta')).not.toBeInTheDocument()

    const text = container.textContent ?? ''
    expect(text).not.toContain('Start an offer')
    expect(text).not.toContain('Browse now')

    // The persona picker is now the last thing before the footer, so it has
    // to still be there: deleting the band must not leave the page with no
    // closing call to action.
    const sections = Array.from(document.querySelector('main')?.children ?? [])
    const pickerIdx = sections.findIndex((el) => el.getAttribute('data-testid') === 'get-started')
    expect(pickerIdx).toBe(sections.length - 2) // picker, then the footer
  })

  // The property behind the CTA cleanup, unchanged by Task 1: a visitor
  // should never meet two different words for the same place, or one word
  // that means two places. Scoped to <main>: the header's "Sign in" also
  // lands on /app, but it is an account action rather than an offer CTA.
  // The footer's "Marketplace" link is likewise site navigation, not an offer
  // CTA (the footer renders inside <main>, so it is skipped explicitly).
  it('uses exactly one label per destination across the page body', () => {
    render(<LandingPage />)
    const labelsByDestination = new Map<string, Set<string>>()
    const destinationsByLabel = new Map<string, Set<string>>()

    for (const link of within(screen.getByRole('main')).getAllByRole('link')) {
      const destination = link.getAttribute('href') ?? ''
      if (!destination.startsWith('/app') || link.closest('footer')) continue
      const label = (link.textContent ?? '').trim()
      if (!labelsByDestination.has(destination)) labelsByDestination.set(destination, new Set())
      labelsByDestination.get(destination)?.add(label)
      if (!destinationsByLabel.has(label)) destinationsByLabel.set(label, new Set())
      destinationsByLabel.get(label)?.add(destination)
    }

    expect([...labelsByDestination.keys()].sort()).toEqual(['/app', '/app/my-offers'])
    for (const [destination, labels] of labelsByDestination) {
      expect([...labels], `${destination} is reached by more than one label`).toHaveLength(1)
    }
    for (const [label, destinations] of destinationsByLabel) {
      expect([...destinations], `"${label}" points at more than one destination`).toHaveLength(1)
    }
  })

  it('never uses an em dash, aside from the cited $75,000–$300,000 range', () => {
    const { container } = render(<LandingPage />)
    // Built from a char code rather than a literal em dash, so this source
    // file itself never contains the character the owner's grep checks for.
    const emDash = String.fromCharCode(8212)
    const range = `$75,000${emDash}$300,000`
    const text = (container.textContent ?? '').split(range).join('')
    expect(text).not.toContain(emDash)
  })

  it('states the three steps in order', () => {
    render(<LandingPage />)
    const steps = screen.getByTestId('how-it-works')
    const text = steps.textContent ?? ''
    // Guards the property (escrow, then promotion, then payout appear in
    // that order), not the exact step-heading wording, which copy passes
    // are free to keep tightening.
    const lockIdx = text.toLowerCase().indexOf('lock the budget')
    const promoteIdx = text.toLowerCase().indexOf('see the balance, promote')
    const payoutIdx = text.toLowerCase().indexOf('get paid on confirmation')
    expect(lockIdx).toBeGreaterThanOrEqual(0)
    expect(promoteIdx).toBeGreaterThan(lockIdx)
    expect(payoutIdx).toBeGreaterThan(promoteIdx)
  })

  it('renders the payout steps on a full-bleed rail, not in a bordered card grid', () => {
    render(<LandingPage />)
    const steps = screen.getByTestId('how-it-works')
    expect(steps).toHaveAttribute('data-shape', 'rail')
    // The band itself is full-bleed: it must not be the element carrying the
    // page's standard max-width container.
    expect(steps.className).not.toMatch(/max-w-6xl/)
  })

  it('sets the problem section as a type split, heading left', () => {
    render(<LandingPage />)
    expect(screen.getByTestId('problem')).toHaveAttribute('data-shape', 'typesplit')
  })

  it('renders the market figures as a thin band, not a card grid', () => {
    render(<LandingPage />)
    const market = screen.getByTestId('market')
    expect(market).toHaveAttribute('data-shape', 'band')
    // The breather: less than half the vertical padding of the redesigned sections around it.
    expect(market.className).toMatch(/(^|\s)py-10(\s|$)/)
  })
})
