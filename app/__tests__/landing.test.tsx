import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import LandingPage from '@/app/page'

// Mutable so individual tests can simulate a connected wallet without a
// second vi.mock factory per test.
let connected = false
const push = vi.fn()

vi.mock('@/lib/wallet/useAccount', () => ({
  useAccount: () => ({ wallet: connected ? 'DemoWallet111' : null, connected, connecting: false }),
  useLoginModal: () => () => {},
}))

// Overrides the global setup mock for this file only, so CTA destinations
// can be asserted against a real spy instead of a throwaway vi.fn().
vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({ push, replace: vi.fn(), back: vi.fn(), prefetch: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))

beforeEach(() => {
  connected = false
  push.mockClear()
})

describe('Landing page', () => {
  // Replaces the old "offers two CTAs, one per audience" assertion: the
  // owner's spec reverses that decision, so the hero must now carry exactly
  // one primary call-to-action plus one smaller secondary browse link, not
  // two equal-weight buttons forcing a visitor to pick a side upfront.
  it('offers exactly one primary CTA in the hero, plus a secondary browse link', () => {
    render(<LandingPage />)
    const hero = screen.getByTestId('hero')
    const primary = within(hero).getByTestId('hero-primary-cta')
    expect(primary).toHaveTextContent('Get started')
    expect(within(hero).getAllByTestId('hero-primary-cta')).toHaveLength(1)

    const secondary = within(hero).getByRole('button', { name: /browse offers first/i })
    expect(secondary).toBeInTheDocument()
    // Only one clickable "browse" affordance in the hero: the secondary link.
    expect(within(hero).queryAllByRole('button')).toHaveLength(1)
  })

  it('routes the hero secondary link to /app once the wallet is connected', () => {
    connected = true
    render(<LandingPage />)
    const hero = screen.getByTestId('hero')
    fireEvent.click(within(hero).getByRole('button', { name: /browse offers first/i }))
    expect(push).toHaveBeenCalledWith('/app')
  })

  it('renders the "Why Nativness" section between the hero and the problem cards', () => {
    render(<LandingPage />)
    const bodyChildren = Array.from(document.querySelector('main')?.children ?? [])
    const heroIdx = bodyChildren.findIndex((el) => el.getAttribute('data-testid') === 'hero')
    const whyIdx = bodyChildren.findIndex((el) => el.getAttribute('data-testid') === 'why-nativness')
    const problemIdx = bodyChildren.findIndex((el) => el.getAttribute('data-testid') === 'problem')
    expect(heroIdx).toBeGreaterThanOrEqual(0)
    expect(whyIdx).toBeGreaterThan(heroIdx)
    expect(problemIdx).toBeGreaterThan(whyIdx)

    const why = screen.getByTestId('why-nativness')
    expect(why).toHaveTextContent(/see the money before you commit/i)
    expect(why).toHaveTextContent(/paid on confirmation/i)
    expect(why).toHaveTextContent(/anyone can list/i)
    expect(why).toHaveTextContent(/one login unlocks both sides/i)
  })

  it('renders the persona picker with both destinations reachable and no gating', () => {
    connected = true
    render(<LandingPage />)
    const picker = screen.getByTestId('get-started')

    fireEvent.click(within(picker).getByRole('button', { name: 'I want to promote offers' }))
    expect(push).toHaveBeenCalledWith('/app')

    push.mockClear()

    // Picking the other option still works in the same session: neither
    // choice disables or redirects away from the other view. This is a
    // first-view preference, not an access gate.
    fireEvent.click(within(picker).getByRole('button', { name: 'I want to list an offer' }))
    expect(push).toHaveBeenCalledWith('/app/my-offers')
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

  it('states one login for both sides in the hero', () => {
    render(<LandingPage />)
    const hero = screen.getByTestId('hero')
    expect(hero).toHaveTextContent(/one wallet/i)
    expect(hero).toHaveTextContent(/one login/i)
    expect(hero).toHaveTextContent(/both sides/i)
  })

  it('shows a real offer card with a locked escrow balance', () => {
    render(<LandingPage />)
    expect(screen.getByText('$340.00')).toBeInTheDocument()
    expect(screen.getByText(/\$500\.00/)).toBeInTheDocument()
  })

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

  it('attributes each problem claim to a named source', () => {
    render(<LandingPage />)
    const problem = screen.getByTestId('problem')
    expect(problem).toHaveTextContent('$75,000')
    expect(problem).toHaveTextContent('$300,000')
    expect(problem).toHaveTextContent('NET-60')
    expect(problem).toHaveTextContent('2.2/5')
    expect(problem).toHaveTextContent('Awin')
    expect(problem).toHaveTextContent('October 2025')
  })

  it('never claims LinkUp or Revelio Labs is an affiliate network', () => {
    render(<LandingPage />)
    const text = screen.getByTestId('problem').textContent ?? ''
    const sentences = text.split(/(?<=[.!?])\s+/)
    const linkUpSentence = sentences.find((s) => s.includes('LinkUp'))
    expect(linkUpSentence).toBeDefined()
    expect(linkUpSentence).toMatch(/workforce-data/i)
    expect(linkUpSentence).not.toMatch(/affiliate network/i)
  })

  it('makes no numeric claim about Nativness itself', () => {
    const { container } = render(<LandingPage />)
    const text = container.textContent ?? ''
    // Allows the hero's sanctioned illustrative offer-card figures ($340, $500,
    // $24, the conversions count), the animated escrow counter (labelled as
    // the demo marketplace's total, not Nativness's own), and the cited
    // market figures. Only a figure describing Nativness's own adoption,
    // revenue or traffic is disallowed.
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

  it('renders "Proof, not quotes" with a live GitHub link and clearly unfilled placeholders', () => {
    render(<LandingPage />)
    const proof = screen.getByTestId('proof-not-quotes')
    expect(proof).toHaveTextContent(/every escrow rule is public/i)

    const githubLink = within(proof).getByRole('link', { name: /github/i })
    expect(githubLink).toHaveAttribute('href', expect.stringContaining('github.com'))

    // The two owner-supplied slots and the founder-note block must render as
    // visibly marked, unfilled placeholders, not as asserted fact.
    const notYetFilled = within(proof).getAllByText(/not yet filled in/i)
    expect(notYetFilled.length).toBeGreaterThanOrEqual(3)
    expect(proof).toHaveTextContent(/\[Add: hackathon name\/track/i)
    expect(proof).toHaveTextContent(/\[Add: real devnet payout count/i)
    expect(proof).toHaveTextContent(/founder note/i)
  })

  it('renders the honest proof band with the sourced facts and an audit link', () => {
    render(<LandingPage />)
    const band = screen.getByTestId('proof-band')
    expect(band).toHaveTextContent('Awin')
    expect(band).toHaveTextContent('NET-60')
    expect(band).toHaveTextContent('2.2/5')
    expect(
      screen.getByRole('link', { name: /audit the source on github/i }),
    ).toHaveAttribute('href', expect.stringContaining('github.com'))
  })

  it('offers a repeat CTA band low on the page that routes to the same two destinations', () => {
    connected = true
    render(<LandingPage />)
    expect(screen.getByTestId('repeat-cta')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Start an offer' }))
    expect(push).toHaveBeenCalledWith('/app/my-offers')

    fireEvent.click(screen.getByRole('button', { name: 'Browse now' }))
    expect(push).toHaveBeenCalledWith('/app')
  })

  // Replaces the old "never duplicates the hero CTA labels in the repeat
  // band" assertion, which checked for 'List an offer'/'Browse offers'
  // labels that no longer exist anywhere on the page now that the hero
  // carries only one CTA. The property worth keeping is that the repeat
  // band's own labels stay unique, so it never collides with the hero's or
  // the persona picker's button text.
  it('never duplicates the repeat band CTA labels elsewhere on the page', () => {
    render(<LandingPage />)
    expect(screen.getAllByRole('button', { name: 'Start an offer' })).toHaveLength(1)
    expect(screen.getAllByRole('button', { name: 'Browse now' })).toHaveLength(1)
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
})
