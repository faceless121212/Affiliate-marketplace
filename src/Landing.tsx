import { useEffect, useState, type ReactNode } from 'react'
import { SEED_OFFERS, TOTAL_LOCKED, CATEGORIES, money, categoryLabel, type Category } from './data'
import { Avatar, EscrowChart, Meter } from './MarketApp'
import { POSTS } from './content'
import { PostCard } from './Pages'
import './landing.css'

export function Logo({ light = false }: { light?: boolean }) {
  const ink = light ? '#fff' : '#000'
  return (
    <a href="#/" className="lp-logo" style={{ color: ink }} aria-label="Nativness home">
      <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden>
        <path d="M11 15V12a5 5 0 0 1 10 0v3" fill="none" stroke={ink} strokeWidth="2.6" strokeLinecap="round" />
        <rect x="8" y="15" width="16" height="11" rx="2.4" fill={ink} />
        <path d="M12.5 20.5h7" stroke="#c3ff00" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
      Nativness
    </a>
  )
}

const Arrow = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)
const Chevron = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M9 6l6 6-6 6" />
  </svg>
)

const ICONS: Record<string, ReactNode> = {
  ecommerce: <path d="M4 7h16l-1.5 9h-13L4 7Zm0 0L3.2 4H1.5M9 20.5h.01M16 20.5h.01" />,
  saas: <path d="M3 5h18v11H3zM8 20h8M12 16v4" />,
  igaming: <path d="M4 4h16v16H4zM8.5 8.5h.01M15.5 8.5h.01M12 12h.01M8.5 15.5h.01M15.5 15.5h.01" />,
  dating: <path d="M12 20s-7.5-4.6-7.5-10A4.2 4.2 0 0 1 12 7.6 4.2 4.2 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10Z" />,
  verified: <path d="M12 3l2.3 1.8 2.9-.100.8 2.8 2.4 1.7-1 2.8 1 2.8-2.4 1.7-.800 2.8-2.9-.100L12 21l-2.3-1.8-2.9.100-.800-2.800L3.6 14.800l1-2.8-1-2.800L6 7.5l.800-2.8 2.9.100L12 3Zm-3 9 2 2 4-4" />,
  funded: <path d="M7 11V8a5 5 0 0 1 10 0v3M5 11h14v9H5zM12 14.5v2.5" />,
}

function TileIcon({ name }: { name: string }) {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {ICONS[name]}
    </svg>
  )
}

const count = (c: Category) => SEED_OFFERS.filter(o => o.category === c).length
const plural = (n: number) => `${n} offer${n === 1 ? '' : 's'}`
const verticals = CATEGORIES.filter(c => count(c.value) > 0)

const TILES = [
  ...verticals.map(c => ({ icon: c.value as string, title: `${c.label} offers`, sub: plural(count(c.value)) })),
  { icon: 'verified', title: 'Verified offers', sub: plural(SEED_OFFERS.filter(o => o.verified).length) },
  { icon: 'funded', title: 'Funded right now', sub: plural(SEED_OFFERS.filter(o => o.escrowRemainingUsd > 0).length) },
]

const FACTS = [
  { img: 'fact-wait', quote: 'Paid in months, maybe. Rakuten’s NET-60 rates 2.2/5 on Trustpilot; CJ Affiliate reports stuck commissions.', source: 'Source: Rakuten Advertising, Trustpilot; CJ Affiliate complaints' },
  { img: 'fact-recourse', quote: 'Smaller networks offer no recourse. iGaming and dating networks are offshore, fragmented.', source: 'Source: Industry reporting' },
  { img: 'fact-vanish', quote: 'Networks disappear. ShareASale folded into Awin, October 2025.', source: 'Source: ShareASale / Awin, October 2025' },
]

export function Footer() {
  return (
    <footer className="lp-footer">
      <div className="lp-wrap lp-footer-in">
        <div>
          <Logo light />
          <p className="lp-footer-note">A Solana-native affiliate marketplace where the commission budget is locked in escrow before the offer goes live.</p>
        </div>
        <div><h4>For affiliates</h4><a href="#/app">Browse offers</a><a href="#/app">Your links</a><a href="#/blog/reading-an-escrow-balance">Reading a balance</a></div>
        <div><h4>For advertisers</h4><a href="#/app">List an offer</a><a href="#/app">Top up escrow</a><a href="#/blog/writing-conversion-terms">Writing terms</a></div>
        <div><h4>Company</h4><a href="#/blog">Blog</a><a href="#/terms">Terms of Use</a><a href="#/privacy">Privacy Policy</a></div>
      </div>
      <div className="lp-wrap lp-footer-base">© 2026 Nativness. All rights reserved.</div>
    </footer>
  )
}

const sample = SEED_OFFERS[0]
const N = SEED_OFFERS.length
const POS = ['front', 'second', 'third']

function HeroStack() {
  const [idx, setIdx] = useState(1)
  const [paused, setPaused] = useState(false)
  useEffect(() => {
    if (paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = window.setInterval(() => setIdx(i => (i + 1) % N), 3200)
    return () => window.clearInterval(t)
  }, [paused])

  return (
    <div className="lp-stack" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      {SEED_OFFERS.map((o, i) => {
        const pos = (i - idx + N) % N
        const cls = POS[pos] ?? (pos === N - 1 ? 'gone' : 'wait')
        const left = o.escrowRemainingUsd
        const status = left < o.commissionUsd ? 'Escrow empty' : left / o.escrowTotalUsd <= 0.1 ? 'Nearly spent' : 'Funded'
        return (
          <div key={o.id} className={`lp-card lp-card-${cls} lp-ui`} aria-hidden={pos !== 0}>
            <div className="lp-ui-head">
              <Avatar offer={o} size={44} />
              <div>
                <b>{o.name}</b>
                <small>{categoryLabel(o.category)}{o.verified ? ' · Verified' : ''}</small>
              </div>
              <div className="lp-ui-pay"><b>{money(o.commissionUsd)}</b><small>per conversion</small></div>
            </div>
            <EscrowChart offer={o} />
            <div className="lp-ui-foot">
              <span><b>{money(left)}</b> locked of {money(o.escrowTotalUsd)}</span>
              <span className={`lp-ui-live ${status === 'Funded' ? '' : 'warn'}`}><i /> {status}</span>
            </div>
            <Meter offer={o} />
          </div>
        )
      })}
      <div className="lp-stack-dots">
        {SEED_OFFERS.map((o, i) => (
          <button key={o.id} className={i === idx ? 'on' : ''} onClick={() => setIdx(i)} aria-label={`Show ${o.name}`} />
        ))}
      </div>
    </div>
  )
}

export default function Landing() {
  const [fact, setFact] = useState(0)
  const move = (d: number) => setFact(f => (f + d + FACTS.length) % FACTS.length)

  return (
    <div className="lp">
      <div className="lp-bar">
        <span className="lp-bar-dot" />
        Connect any Solana or Ethereum wallet and start promoting funded offers.
        <a href="#/app?connect">Connect wallet</a>
      </div>

      <header className="lp-header">
        <div className="lp-header-in">
          <Logo />
          <nav className="lp-nav">
            <a href="#/app">Browse offers</a>
            <a href="#advertisers">For advertisers</a>
            <a href="#how">How it works</a>
            <a href="#both">One login</a>
            <a href="#/blog">Blog</a>
          </nav>
          <div className="lp-header-right">
            <span className="lp-net">Solana</span>
            <a href="#/app?connect" className="lp-btn lp-btn-outline lp-btn-sm">Connect wallet</a>
          </div>
        </div>
      </header>

      <main>
        <section className="lp-hero">
          <div className="lp-wrap lp-hero-in">
            <div>
              <h1>Affiliate marketplace.<br />Escrow first.</h1>
              <p className="lp-hero-sub">
                Advertisers lock the commission budget before the offer goes live. Affiliates see a guaranteed balance, not a promise.
              </p>
              <a href="#/app" className="lp-btn lp-btn-dark lp-btn-lg">Browse offers <Arrow /></a>
            </div>
            <HeroStack />
          </div>
        </section>

        <section className="lp-wrap lp-stats">
          <div><b>{money(TOTAL_LOCKED)}</b><span>Locked in escrow</span></div>
          <div><b>{SEED_OFFERS.length}</b><span>Offers</span></div>
          <div><b>{verticals.length}</b><span>Verticals</span></div>
          <div><b>0 days</b><span>Payout wait after confirmation</span></div>
          <div><b>1 wallet</b><span>For affiliates and advertisers</span></div>
        </section>

        <section className="lp-wrap lp-marks" aria-label="Offers on the marketplace">
          <p>Offers on the marketplace</p>
          <div className="lp-marks-row">
            {SEED_OFFERS.map(o => (
              <a key={o.id} href="#/app" className={o.escrowRemainingUsd > 0 ? '' : 'off'}>
                <Avatar offer={o} size={34} />
                {o.name}
              </a>
            ))}
          </div>
        </section>

        <section className="lp-wrap lp-tiles">
          {TILES.map(t => (
            <a key={t.title} href="#/app" className="lp-tile">
              <TileIcon name={t.icon} />
              <span className="lp-tile-text"><b>{t.title}</b><small>{t.sub}</small></span>
              <Chevron />
            </a>
          ))}
        </section>

        <section className="lp-wrap lp-proof">
          <h2 className="lp-giant">Nobody has fixed affiliate trust</h2>
          <p className="lp-proof-sub">Affiliates work first, trust comes after. Nativness turns that around.</p>
          <div className="lp-proof-row">
            <button className="lp-round" onClick={() => move(-1)} aria-label="Previous fact"><span style={{ transform: 'rotate(180deg)', display: 'flex' }}><Chevron /></span></button>
            <div className="lp-proof-card">
              <div className="lp-art"><img src={`/img/${FACTS[fact].img}.jpg`} alt="" /></div>
              <div className="lp-proof-text">
                <h3>{FACTS[fact].quote}</h3>
                <p>{FACTS[fact].source}</p>
                <div className="lp-dots">
                  {FACTS.map((_, i) => (
                    <button key={i} className={i === fact ? 'on' : ''} onClick={() => setFact(i)} aria-label={`Fact ${i + 1}`} />
                  ))}
                </div>
              </div>
            </div>
            <button className="lp-round" onClick={() => move(1)} aria-label="Next fact"><Chevron /></button>
          </div>
        </section>

        <section className="lp-wrap lp-how" id="how">
          <h2>How Nativness works:</h2>
          <div className="lp-steps">
            <article className="lp-step">
              <span className="lp-num" style={{ background: '#c3ff00' }}>1</span>
              <h3>Lock the budget.</h3>
              <p>The advertiser funds escrow before the offer is visible to anyone.</p>
              <div className="lp-mini">
                <div className="lp-mini-row"><span>Escrow deposit</span><b>{money(sample.escrowTotalUsd)}</b></div>
                <div className="lp-mini-row"><span>Per conversion</span><b>{money(sample.commissionUsd)}</b></div>
                <div className="lp-mini-status"><i style={{ background: '#16a34a' }} /> Funded. Offer is live.</div>
              </div>
            </article>
            <article className="lp-step">
              <span className="lp-num" style={{ background: '#000', color: '#c3ff00' }}>2</span>
              <h3>See the balance, promote.</h3>
              <p>Affiliates read the real remaining balance, then take a tracking link.</p>
              <div className="lp-mini">
                <div className="lp-mini-row"><span>{sample.name}</span><b>{money(sample.escrowRemainingUsd)} left</b></div>
                <div className="lp-meter"><i style={{ width: `${(sample.escrowRemainingUsd / sample.escrowTotalUsd) * 100}%` }} /></div>
                <div className="lp-mini-link">nativness.app/r/drayton</div>
              </div>
            </article>
            <article className="lp-step">
              <span className="lp-num" style={{ background: '#f0f0f0' }}>3</span>
              <h3>Get paid on confirmation.</h3>
              <p>Confirmed means paid. No NET-60, no minimum threshold.</p>
              <div className="lp-mini">
                <div className="lp-mini-row"><span>Conversion confirmed</span><b style={{ color: '#16a34a' }}>+{money(sample.commissionUsd)}</b></div>
                <div className="lp-mini-row"><span>Sent to</span><b>your wallet</b></div>
                <div className="lp-mini-status"><i style={{ background: '#16a34a' }} /> Paid on confirmation.</div>
              </div>
            </article>
          </div>
        </section>

        <section className="lp-band">
          <h2>Confirmed means paid.</h2>
          <p>The money is already in escrow when you start promoting.</p>
        </section>

        <section className="lp-wrap" id="advertisers">
          <div className="lp-split">
            <div className="lp-split-img" style={{ backgroundImage: 'url(/img/vault.jpg)' }} role="img" aria-label="A vault holding the commission budget" />
            <div className="lp-split-body">
              <h2>List an offer</h2>
              <p>Fund escrow once and show affiliates the budget is really there. Connect a wallet to list your first offer on Nativness.</p>
              <ul>
                <li>Reach affiliates who check the balance</li>
                <li>Pay only for confirmed conversions</li>
                <li>Top up escrow whenever you like</li>
              </ul>
              <a href="#/app" className="lp-btn lp-btn-lime lp-btn-lg lp-btn-block">List an offer <Arrow /></a>
              <a href="#how" className="lp-link">How escrow works</a>
            </div>
          </div>
        </section>

        <section className="lp-wrap lp-biz" id="both">
          <div className="lp-biz-in">
            <div className="lp-biz-head">
              <h2>One login, both sides</h2>
              <img src="/img/key.jpg" alt="One key between two doors" />
            </div>
            <div className="lp-biz-body">
              <p>Connecting a wallet creates a single identity that can promote other people’s offers and list its own. There is no separate affiliate or advertiser account.</p>
              <p><b>Works with Phantom, MetaMask, Solflare, Backpack and other wallets.</b><br />The wallet is your identity here, not a payment rail.</p>
              <div className="lp-biz-cta">
                <a href="#/app?connect" className="lp-btn lp-btn-lime lp-btn-lg">Connect wallet</a>
                <a href="#/app" className="lp-btn lp-btn-outline lp-btn-lg">Browse offers</a>
              </div>
            </div>
          </div>
        </section>

        <section className="lp-wrap lp-blog" id="blog">
          <div className="lp-blog-head">
            <h2>From the blog</h2>
            <a href="#/blog" className="lp-btn lp-btn-outline">All posts</a>
          </div>
          <div className="lp-posts">{POSTS.slice(0, 3).map(p => <PostCard key={p.slug} slug={p.slug} />)}</div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
