import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { SEED_OFFERS, CATEGORIES, money, categoryLabel, payoutsLeft, type Offer, type Category } from './data'
import { detectWallets, onWalletsChanged, rememberWallet, rememberedWallet, shortAddress, type WalletOption } from './wallet'
import { rememberRole, rememberedRole, type Role } from './role'
import './app.css'

type Tab = 'offers' | 'my' | 'links' | 'conversions'
type Link = { id: string; offerId: string; affiliate: string }
type Payout = { id: string; offerId: string; amountUsd: number; affiliate?: string; seeded?: boolean }
type ReportStatus = 'pending' | 'approved' | 'partial' | 'declined'
type Message = { from: Role; text: string; at: number }
type Report = {
  id: string; linkId: string; offerId: string; affiliate: string
  action: string; count: number; note: string
  status: ReportStatus; approvedCount: number; reason?: string
  messages: Message[]; at: number
}
const ACTIONS = ['Registered', 'Deposited', 'Purchased', 'Booked a demo', 'Other']
const STATUS_LABEL: Record<ReportStatus, string> = { pending: 'Waiting for review', approved: 'Approved and paid', partial: 'Partly approved', declined: 'Declined' }
const when = (t: number) => new Date(t).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

// One payout per conversion the listed offers have already paid, newest first.
const SEED_PAYOUTS: Payout[] = SEED_OFFERS.flatMap(o => {
  const n = Math.min(3, Math.round((o.escrowTotalUsd - o.escrowRemainingUsd) / o.commissionUsd))
  return Array.from({ length: n }, (_, i) => ({ id: `${o.id}-${i}`, offerId: o.id, amountUsd: o.commissionUsd, seeded: true }))
})

const initials = (name: string) => name.split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase()
const HUES: Record<Category, string> = { ecommerce: '#0079ff', saas: '#5155dd', igaming: '#ed5023', dating: '#e0439a', finance: '#16a34a', other: '#747474' }

export function Avatar({ offer, size = 36 }: { offer: Offer; size?: number }) {
  if (offer.logo) {
    return <img className="mx-avatar mx-logo-img" src={offer.logo} alt="" width={size} height={size} style={{ width: size, height: size }} />
  }
  return (
    <span className="mx-avatar" style={{ width: size, height: size, background: HUES[offer.category], fontSize: size * 0.36 }}>
      {initials(offer.name)}
    </span>
  )
}

export function state(o: Offer) {
  if (o.escrowRemainingUsd < o.commissionUsd) return 'empty'
  if (o.escrowRemainingUsd / o.escrowTotalUsd <= 0.1) return 'low'
  return 'ok'
}

export function Meter({ offer }: { offer: Offer }) {
  const pct = Math.max(0, Math.min(100, (offer.escrowRemainingUsd / offer.escrowTotalUsd) * 100))
  return (
    <div className={`mx-meter mx-meter-${state(offer)}`} role="img" aria-label={`${Math.round(pct)}% of escrow remaining`}>
      <i style={{ width: `${pct}%` }} />
    </div>
  )
}

export function EscrowChart({ offer }: { offer: Offer }) {
  const W = 640, H = 220, padR = 64, padY = 18
  const paid = Math.round((offer.escrowTotalUsd - offer.escrowRemainingUsd) / offer.commissionUsd)
  const steps = Math.max(paid, 1)
  const y = (v: number) => padY + (1 - v / offer.escrowTotalUsd) * (H - padY * 2)
  const x = (i: number) => (i / (steps + 1)) * (W - padR)
  let d = `M0 ${y(offer.escrowTotalUsd)}`
  for (let i = 1; i <= paid; i++) {
    d += ` H${x(i)} V${y(offer.escrowTotalUsd - i * offer.commissionUsd)}`
  }
  d += ` H${W - padR}`
  const endY = y(offer.escrowRemainingUsd)
  const pct = Math.round((offer.escrowRemainingUsd / offer.escrowTotalUsd) * 100)
  const color = state(offer) === 'ok' ? '#16a34a' : '#ed5023'
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mx-chart" role="img" aria-label={`Escrow balance drawn down to ${money(offer.escrowRemainingUsd)}`}>
      {[100, 75, 50, 25, 0].map(p => (
        <g key={p}>
          <line x1="0" x2={W - padR} y1={y(offer.escrowTotalUsd * p / 100)} y2={y(offer.escrowTotalUsd * p / 100)} stroke="#f0f0f0" />
          <text x={W - 4} y={y(offer.escrowTotalUsd * p / 100) + 4} textAnchor="end" fontSize="11" fill="#a8a8a8">{p}%</text>
        </g>
      ))}
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
      <circle cx={W - padR} cy={endY} r="4" fill={color} />
      <text x={W - padR + 8} y={endY - 6} fontSize="11" fontWeight="600" fill={color}>Escrow</text>
      <text x={W - padR + 8} y={endY + 10} fontSize="15" fontWeight="700" fill={color}>{pct}%</text>
    </svg>
  )
}

const SITE = 'https://www.top100affiliates.com'
export const linkUrl = (id: string) => `${SITE}/#/r/${id}`
const linkLabel = (id: string) => `top100affiliates.com/r/${id}`

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const ta = document.createElement('textarea')
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0'
    document.body.appendChild(ta); ta.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    return ok
  }
}

export default function MarketApp({ refId }: { refId?: string } = {}) {
  const [offers, setOffers] = useState<Offer[]>(SEED_OFFERS)
  const [links, setLinks] = useState<Link[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [payouts, setPayouts] = useState<Payout[]>(SEED_PAYOUTS)
  const [wallet, setWallet] = useState<string | null>(null)
  const [walletName, setWalletName] = useState('')
  const [active, setActive] = useState<WalletOption | null>(null)
  const [menu, setMenu] = useState<WalletOption[] | null>(null)
  const [busy, setBusy] = useState(false)
  const [role, setRole] = useState<Role | null>(rememberedRole)
  const [tab, setTab] = useState<Tab>(() => (rememberedRole() === 'provider' ? 'my' : 'offers'))
  const [cat, setCat] = useState<Category | 'all' | 'verified' | 'funded'>('all')
  const [query, setQuery] = useState('')
  const [featuredId, setFeaturedId] = useState('meridian')
  const [toast, setToast] = useState('')
  const [reportFor, setReportFor] = useState<string | null>(null)
  const [partialFor, setPartialFor] = useState<string | null>(null)
  const [threadFor, setThreadFor] = useState<string | null>(null)

  const byId = (id: string) => offers.find(o => o.id === id)!
  const featured = offers.find(o => o.id === featuredId) ?? offers[0]
  const toastTimer = useRef(0)
  const listRef = useRef<HTMLDivElement>(null)
  const [confirmOut, setConfirmOut] = useState(false)
  const viewAll = () => {
    setCat('all'); setQuery('')
    window.setTimeout(() => {
      const el = listRef.current
      if (!el) return
      const header = document.querySelector<HTMLElement>('.mx-header')?.offsetHeight ?? 0
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - header - 12, behavior: 'smooth' })
    }, 0)
  }
  const say = (m: string) => {
    setToast(m)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(''), 3200)
  }
  const needWallet = () => { if (wallet) return false; say('Connect a wallet first.'); return true }

  const chooseRole = (r: Role) => {
    setRole(r); rememberRole(r)
    setTab(r === 'provider' ? (offers.some(o => o.advertiser === wallet) ? 'conversions' : 'my') : 'offers')
  }

  const connect = async (option: WalletOption, silent = false) => {
    setMenu(null)
    setBusy(!silent)
    try {
      const address = await option.connect(silent)
      setWallet(address); setWalletName(option.name); setActive(option)
      rememberWallet(option.id)
      if (!silent) say(`${option.name} connected as ${role === 'provider' ? 'an affiliate provider' : 'an affiliate'}.`)
    } catch (err) {
      if (silent) return
      const rejected = (err as { code?: number })?.code === 4001
      say(rejected ? `${option.name} connection was rejected.` : `Could not connect ${option.name}. Check that it is unlocked.`)
    } finally {
      setBusy(false)
    }
  }

  const disconnect = () => {
    setConfirmOut(false)
    active?.disconnect().catch(() => {})
    rememberWallet(null)
    setWallet(null); setWalletName(''); setActive(null)
    say('Wallet disconnected.')
  }

  // Arriving through a tracking link opens the offer it belongs to.
  useEffect(() => {
    if (!refId) return
    const offer = SEED_OFFERS.find(o => refId.startsWith(`${o.id}-`))
    if (offer) { setFeaturedId(offer.id); setTab('offers'); say(`You arrived through a tracking link for ${offer.name}.`) }
    else say('That tracking link was not recognised.')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refId])

  // Wallets announce themselves asynchronously, so keep an open menu current,
  // restore the last wallet if it is still authorised, and honour #/app?connect.
  useEffect(() => {
    let restored = false
    const sync = () => {
      const options = detectWallets()
      setMenu(m => (m ? options : m))
      const last = rememberedWallet()
      const match = !restored && last ? options.find(o => o.id === last) : undefined
      if (match) { restored = true; connect(match, true) }
    }
    const off = onWalletsChanged(sync)
    sync()
    if (window.location.hash.includes('connect') && !rememberedWallet()) setMenu(detectWallets())
    return off
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const visible = useMemo(() => offers.filter(o => {
    if (cat === 'verified' && !o.verified) return false
    if (cat === 'funded' && state(o) === 'empty') return false
    if (cat !== 'all' && cat !== 'verified' && cat !== 'funded' && o.category !== cat) return false
    return (o.name + o.description).toLowerCase().includes(query.trim().toLowerCase())
  }), [offers, cat, query])

  const mostFunded = [...offers].sort((a, b) => b.escrowRemainingUsd - a.escrowRemainingUsd).slice(0, 5)
  const earned = payouts.filter(p => p.affiliate && p.affiliate === wallet).reduce((s, p) => s + p.amountUsd, 0)
  const myLinks = links.filter(l => l.affiliate === wallet)
  const mine = offers.filter(o => o.advertiser === wallet)
  const pendingForMe = reports.filter(r => r.status === 'pending' && mine.some(o => o.id === r.offerId)).length
  const approvedOn = (linkId: string) => reports.filter(r => r.linkId === linkId).reduce((n, r) => n + r.approvedCount, 0)

  const getLink = (o: Offer) => {
    if (needWallet()) return
    if (myLinks.some(l => l.offerId === o.id)) { say('You already have a link for this offer.'); setTab('links'); return }
    setLinks(ls => [{ id: `${o.id}-${Date.now().toString(36)}`, offerId: o.id, affiliate: wallet! }, ...ls])
    say(`Tracking link created for ${o.name}. Find it under Links.`)
  }

  const submitReport = (l: Link, e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const count = Number(f.get('count'))
    if (!(count > 0)) { say('Enter how many conversions you are reporting.'); return }
    const o = byId(l.offerId)
    setReports(rs => [{
      id: `r-${Date.now().toString(36)}`, linkId: l.id, offerId: l.offerId, affiliate: l.affiliate,
      action: String(f.get('action')), count, note: String(f.get('note')).trim(),
      status: 'pending', approvedCount: 0, messages: [], at: Date.now(),
    }, ...rs])
    setReportFor(null)
    say(`Report sent to ${o.name}. They will approve it or ask you a question here.`)
  }

  const pay = (r: Report, n: number, reason?: string) => {
    const o = byId(r.offerId)
    const affordable = Math.floor(o.escrowRemainingUsd / o.commissionUsd)
    if (n > affordable) { say(`Escrow covers only ${affordable} payout${affordable === 1 ? '' : 's'}. Top up the offer or approve fewer.`); return }
    const amount = n * o.commissionUsd
    if (n > 0) {
      setOffers(os => os.map(x => x.id === o.id ? { ...x, escrowRemainingUsd: x.escrowRemainingUsd - amount } : x))
      setPayouts(ps => [{ id: `p-${Date.now()}`, offerId: o.id, amountUsd: amount, affiliate: r.affiliate }, ...ps])
    }
    const status: ReportStatus = n === 0 ? 'declined' : n < r.count ? 'partial' : 'approved'
    setReports(rs => rs.map(x => x.id === r.id ? { ...x, status, approvedCount: n, reason } : x))
    setPartialFor(null)
    say(n === 0 ? `Report declined.` : `Paid ${money(amount)} to ${shortAddress(r.affiliate)} from ${o.name} escrow.`)
  }

  const partial = (r: Report, e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const n = Number(f.get('count')); const reason = String(f.get('reason')).trim()
    if (!(n >= 0) || n > r.count) { say(`Enter a number between 0 and ${r.count}.`); return }
    if (n < r.count && !reason) { say('Give the affiliate a reason for the difference.'); return }
    pay(r, n, reason || undefined)
  }

  const send = (r: Report, e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const text = String(new FormData(form).get('text')).trim()
    if (!text || !role) return
    setReports(rs => rs.map(x => x.id === r.id ? { ...x, messages: [...x.messages, { from: role, text, at: Date.now() }] } : x))
    form.reset()
    say(role === 'provider' ? 'Question sent to the affiliate.' : 'Reply sent to the provider.')
  }

  const createOffer = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (needWallet()) return
    const f = new FormData(e.currentTarget)
    const commission = Number(f.get('commission')), budget = Number(f.get('budget'))
    const name = String(f.get('name')).trim()
    if (!name || !(commission > 0) || budget < commission) { say('Escrow budget must cover at least one conversion.'); return }
    const id = `mine-${Date.now().toString(36)}`
    setOffers(os => [{
      id, advertiser: wallet!, name, category: f.get('category') as Category, commissionUsd: commission,
      description: String(f.get('description')), terms: String(f.get('terms')),
      escrowTotalUsd: budget, escrowRemainingUsd: budget, verified: false, mine: true,
    }, ...os])
    setFeaturedId(id)
    e.currentTarget.reset()
    say(`${name} is live with ${money(budget)} locked. Affiliates can take links now.`)
  }

  const topUp = (o: Offer, amount: number) => {
    setOffers(os => os.map(x => x.id === o.id ? { ...x, escrowTotalUsd: x.escrowTotalUsd + amount, escrowRemainingUsd: x.escrowRemainingUsd + amount } : x))
    say(`Added ${money(amount)} to ${o.name} escrow.`)
  }

  const TABS: { id: Tab; label: string; badge?: number }[] = role === 'provider'
    ? [{ id: 'my', label: 'My offers' }, { id: 'conversions', label: 'Conversions', badge: pendingForMe }]
    : [{ id: 'offers', label: 'Offers' }, { id: 'links', label: 'Links', badge: myLinks.length }]
  const CHIPS: { id: typeof cat; label: string }[] = [
    { id: 'all', label: 'All' }, { id: 'verified', label: 'Verified' }, { id: 'funded', label: 'Funded' },
    ...CATEGORIES.map(c => ({ id: c.value, label: c.label })),
  ]

  const Thread = ({ r }: { r: Report }) => (
    <div className="mx-thread">
      {r.messages.map((m, i) => (
        <div key={i} className={`mx-msg ${m.from === role ? 'me' : ''}`}>
          <small>{m.from === 'provider' ? 'Provider' : 'Affiliate'} · {when(m.at)}</small>
          <p>{m.text}</p>
        </div>
      ))}
      {(threadFor === r.id || r.messages.length > 0) && role && (
        <form className="mx-msg-form" onSubmit={e => send(r, e)}>
          <input name="text" placeholder={role === 'provider' ? 'Ask the affiliate a question' : 'Reply to the provider'} aria-label="Message" />
          <button className="mx-btn" type="submit">Send</button>
        </form>
      )}
    </div>
  )

  const StatusChip = ({ r }: { r: Report }) => <span className={`mx-status mx-status-${r.status}`}>{STATUS_LABEL[r.status]}</span>

  return (
    <div className="mx">
      <div className="mx-ticker" aria-label="Recent payouts">
        <div className="mx-ticker-run">
          {[...payouts, ...payouts].map((p, i) => (
            <span key={i}><em>Paid</em> <b>{money(p.amountUsd)}</b>{p.affiliate ? ` to ${shortAddress(p.affiliate)}` : ''} from {byId(p.offerId)?.name ?? 'offer'} escrow</span>
          ))}
        </div>
      </div>

      <header className="mx-header">
        <div className="mx-header-in">
          <a href="#/" className="mx-logo">
            <svg width="22" height="22" viewBox="0 0 32 32" aria-hidden>
              <rect width="32" height="32" rx="7" fill="#C3FF00" />
              <path d="M11 15V12a5 5 0 0 1 10 0v3" fill="none" stroke="#000" strokeWidth="2.6" strokeLinecap="round" />
              <rect x="8.5" y="15" width="15" height="10.5" rx="2.2" fill="#000" />
              <path d="M12 20.2h8" stroke="#C3FF00" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
            Nativness
          </a>
          <nav className="mx-tabs">
            {TABS.map(t => (
              <button key={t.id} className={tab === t.id ? 'on' : ''} onClick={() => setTab(t.id)}>
                {t.label}{!!t.badge && <i>{t.badge}</i>}
              </button>
            ))}
          </nav>
          {role !== 'provider' && (
            <label className="mx-search">
              <input value={query} onChange={e => { setQuery(e.target.value); setTab('offers') }} placeholder="Search offers" aria-label="Search offers" />
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#747474" strokeWidth="2" strokeLinecap="round" aria-hidden><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
            </label>
          )}
          {role && (
            <div className="mx-role" role="radiogroup" aria-label="Your role">
              <button role="radio" aria-checked={role === 'affiliate'} className={role === 'affiliate' ? 'on' : ''} onClick={() => chooseRole('affiliate')}>Affiliate</button>
              <button role="radio" aria-checked={role === 'provider'} className={role === 'provider' ? 'on' : ''} onClick={() => chooseRole('provider')}>Provider</button>
            </div>
          )}
          {wallet ? (
            <button className="mx-btn" onClick={() => setConfirmOut(true)} title={`${walletName}: ${wallet}. Click to disconnect.`}>
              <span className="mx-dot" /> {shortAddress(wallet)}{role === 'affiliate' ? ` · ${money(earned)} earned` : ''}
            </button>
          ) : (
            <div className="mx-wallet">
              <button className="mx-btn mx-btn-lime" disabled={busy} aria-haspopup="menu" aria-expanded={menu !== null}
                onClick={() => setMenu(m => (m ? null : detectWallets()))}>
                {busy ? 'Connecting…' : 'Connect wallet'}
              </button>
              {menu && (
                <div className="mx-menu" role="menu">
                  {!role ? (
                    <div className="mx-rolepick">
                      <p>First, who are you?</p>
                      <button onClick={() => chooseRole('affiliate')}>
                        <b>I'm an affiliate</b><small>I promote offers with links and report the conversions I bring.</small>
                      </button>
                      <button onClick={() => chooseRole('provider')}>
                        <b>I'm an affiliate provider</b><small>I list offers, lock the budget and pay affiliates for conversions.</small>
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="mx-menu-head">Connect as {role === 'provider' ? 'a provider' : 'an affiliate'}</p>
                      {menu.map(o => (
                        <button key={o.id} role="menuitem" onClick={() => connect(o)}>
                          <span>{o.icon && <img src={o.icon} alt="" width={20} height={20} />}{o.name}</span><small>{o.chain}</small>
                        </button>
                      ))}
                      {menu.length === 0 && <p>No wallet found in this browser. Install a wallet extension such as Phantom, MetaMask, Solflare or Backpack, then reload.</p>}
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        {tab === 'offers' && (
          <div className="mx-chips">
            {CHIPS.map(c => (
              <button key={c.id} className={cat === c.id ? 'on' : ''} onClick={() => setCat(c.id)}>{c.label}</button>
            ))}
          </div>
        )}
      </header>

      <main className="mx-main">
        {tab === 'offers' && (
          <>
            <section className="mx-top">
              <article className="mx-card mx-feature">
                <div className="mx-kicker">{categoryLabel(featured.category)}{featured.verified && <span className="mx-badge">Verified</span>}</div>
                <div className="mx-feature-head">
                  <Avatar offer={featured} size={44} />
                  <div>
                    <h1>{featured.name}</h1>
                    <p className="mx-muted">Advertiser {shortAddress(featured.advertiser)}</p>
                  </div>
                  <div className="mx-score">
                    <b>{money(featured.commissionUsd)}</b>
                    <span>per conversion</span>
                  </div>
                </div>
                <div className="mx-feature-body">
                  <div className="mx-feature-side">
                    <div className="mx-actions">
                      <button className="mx-btn mx-btn-lime" disabled={state(featured) === 'empty'} onClick={() => getLink(featured)}>Get link</button>
                      <button className="mx-btn" onClick={() => setTab('links')}>My links</button>
                    </div>
                    <h2 className="mx-label">Escrow</h2>
                    <dl className="mx-dl">
                      <div><dt>Remaining</dt><dd>{money(featured.escrowRemainingUsd)}</dd></div>
                      <div><dt>Deposited</dt><dd>{money(featured.escrowTotalUsd)}</dd></div>
                      <div><dt>Payouts it can still fund</dt><dd>{payoutsLeft(featured)}</dd></div>
                      <div><dt>Affiliates promoting</dt><dd>{links.filter(l => l.offerId === featured.id).length}</dd></div>
                    </dl>
                    <h2 className="mx-label">What counts</h2>
                    <p className="mx-terms">{featured.terms}</p>
                  </div>
                  <EscrowChart offer={featured} />
                </div>
              </article>

              <aside className="mx-card mx-side">
                <h2 className="mx-side-title">Most funded</h2>
                {mostFunded.map(o => (
                  <button key={o.id} className={`mx-side-row ${o.id === featured.id ? 'on' : ''}`} onClick={() => setFeaturedId(o.id)}>
                    <Avatar offer={o} size={30} />
                    <span><b>{o.name}</b><small>{money(o.commissionUsd)} per conversion</small></span>
                    <em>{money(o.escrowRemainingUsd)}</em>
                  </button>
                ))}
                <button className="mx-btn mx-btn-block" onClick={viewAll}>View all ({offers.length})</button>
              </aside>
            </section>

            <div className="mx-section-head" ref={listRef}>
              <h2>Offers <span>{visible.length}</span></h2>
              <p className="mx-muted">Every balance below is what is still locked, not what was ever deposited.</p>
            </div>

            {visible.length === 0 ? (
              <div className="mx-empty">No offers match. Clear the search or pick another category.</div>
            ) : (
              <section className="mx-grid">
                {visible.map(o => (
                  <article key={o.id} className={`mx-card mx-offer ${o.id === featured.id ? 'on' : ''}`}>
                    <button className="mx-offer-hit" onClick={() => { setFeaturedId(o.id); window.scrollTo({ top: 0, behavior: 'smooth' }) }} aria-label={`Show ${o.name}`} />
                    <div className="mx-kicker">{categoryLabel(o.category)}{o.verified && <span className="mx-badge">Verified</span>}</div>
                    <div className="mx-offer-head">
                      <Avatar offer={o} />
                      <h3>{o.name}</h3>
                    </div>
                    <p className="mx-desc">{o.description}</p>
                    <div className="mx-offer-nums">
                      <div><b>{money(o.commissionUsd)}</b><span>per conversion</span></div>
                      <div className={`mx-left mx-left-${state(o)}`}><b>{money(o.escrowRemainingUsd)}</b><span>{state(o) === 'empty' ? 'escrow empty' : state(o) === 'low' ? 'nearly spent' : 'locked'}</span></div>
                    </div>
                    <Meter offer={o} />
                    <button className="mx-btn mx-btn-block mx-offer-cta" disabled={state(o) === 'empty'} onClick={() => getLink(o)}>
                      {state(o) === 'empty' ? 'Cannot pay out' : 'Get link'}
                    </button>
                  </article>
                ))}
              </section>
            )}
          </>
        )}

        {tab === 'links' && (
          <section className="mx-card mx-list mx-wide">
            <h1>Your tracking links</h1>
            <p className="mx-muted">One link per offer. Report the conversions you bring, and the provider approves and pays them from escrow.</p>
            {myLinks.length === 0 && (
              <div className="mx-empty">
                {wallet ? 'No links yet. Take one from any funded offer.' : 'Connect a wallet, then take a link from any funded offer.'}
                <button className="mx-btn" onClick={() => setTab('offers')}>Browse offers</button>
              </div>
            )}
            {myLinks.map(l => {
              const o = byId(l.offerId)
              const mineReports = reports.filter(r => r.linkId === l.id)
              return (
                <div key={l.id} className="mx-linkblock">
                  <div className="mx-list-row">
                    <Avatar offer={o} size={30} />
                    <span>
                      <b>{o.name}</b>
                      <small className="mx-mono">{linkLabel(l.id)}</small>
                    </span>
                    <button className="mx-btn" onClick={async () => say((await copyText(linkUrl(l.id))) ? 'Link copied.' : 'Could not copy. Select the link and copy it by hand.')}>
                      Copy link
                    </button>
                    <span className="mx-right"><b>{approvedOn(l.id)}</b><small>paid</small></span>
                    <span className="mx-right"><b>{money(o.escrowRemainingUsd)}</b><small>escrow left</small></span>
                    <button className="mx-btn mx-btn-lime" disabled={state(o) === 'empty'} onClick={() => setReportFor(reportFor === l.id ? null : l.id)}>
                      Report conversions
                    </button>
                  </div>
                  {reportFor === l.id && (
                    <form className="mx-report-form" onSubmit={e => submitReport(l, e)}>
                      <label>What happened
                        <select name="action" defaultValue="Registered">{ACTIONS.map(a => <option key={a}>{a}</option>)}</select>
                      </label>
                      <label>How many<input name="count" type="number" min="1" step="1" required placeholder="10" /></label>
                      <label className="mx-grow">Details for the provider<input name="note" placeholder="Dates, order numbers, usernames, anything that helps them check" /></label>
                      <button className="mx-btn mx-btn-lime" type="submit">Send report</button>
                    </form>
                  )}
                  {mineReports.map(r => (
                    <div key={r.id} className="mx-report">
                      <div className="mx-report-head">
                        <span><b>{r.count} {r.action.toLowerCase()}</b><small>Sent {when(r.at)}{r.note ? ` · ${r.note}` : ''}</small></span>
                        <StatusChip r={r} />
                      </div>
                      {r.status !== 'pending' && (
                        <p className="mx-report-result">
                          {r.approvedCount} of {r.count} approved, {money(r.approvedCount * o.commissionUsd)} paid.{r.reason ? ` Reason: ${r.reason}` : ''}
                        </p>
                      )}
                      <Thread r={r} />
                    </div>
                  ))}
                </div>
              )
            })}
          </section>
        )}

        {tab === 'my' && (
          <section className="mx-two">
            <form className="mx-card mx-form" onSubmit={createOffer}>
              <h1>List an offer</h1>
              <p className="mx-muted">The escrow budget is locked before the offer becomes visible to anyone.</p>
              <label>Offer name<input name="name" required placeholder="Northwind Coffee" /></label>
              <label>Category
                <select name="category" defaultValue="ecommerce">{CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}</select>
              </label>
              <div className="mx-form-row">
                <label>Commission per conversion, USD<input name="commission" type="number" min="1" step="0.5" required placeholder="20" /></label>
                <label>Escrow budget, USD<input name="budget" type="number" min="1" step="1" required placeholder="500" /></label>
              </div>
              <label>Description<textarea name="description" rows={2} required placeholder="What you sell and who it is for." /></label>
              <label>What counts as a conversion<textarea name="terms" rows={2} required placeholder="A conversion is a first paid order from a new customer." /></label>
              <button className="mx-btn mx-btn-lime mx-btn-block" type="submit">Lock budget and go live</button>
            </form>
            <div className="mx-card mx-list">
              <h2 className="mx-side-title">Your offers</h2>
              {mine.length === 0 && <p className="mx-muted mx-pad">{wallet ? 'You have not listed an offer yet.' : 'Connect a wallet to list an offer.'}</p>}
              {mine.map(o => (
                <div key={o.id} className="mx-list-row">
                  <Avatar offer={o} size={30} />
                  <span>
                    <b>{o.name}</b>
                    <small>{money(o.escrowRemainingUsd)} of {money(o.escrowTotalUsd)} locked · {links.filter(l => l.offerId === o.id).length} affiliates promoting</small>
                    <Meter offer={o} />
                  </span>
                  <button className="mx-btn" onClick={() => topUp(o, 100)}>Top up $100</button>
                </div>
              ))}
            </div>
          </section>
        )}

        {tab === 'conversions' && (
          <section className="mx-card mx-list mx-wide">
            <h1>Conversions</h1>
            <p className="mx-muted">Every affiliate promoting your offers, with the conversions they report. Approve to pay from escrow, or ask a question first.</p>
            {mine.length === 0 && (
              <div className="mx-empty">
                {wallet ? 'You have no offers yet, so there is nothing to review.' : 'Connect a wallet as a provider to review conversions on your offers.'}
                <button className="mx-btn" onClick={() => setTab('my')}>List an offer</button>
              </div>
            )}
            {mine.map(o => {
              const offerLinks = links.filter(l => l.offerId === o.id)
              const offerReports = reports.filter(r => r.offerId === o.id)
              return (
                <div key={o.id} className="mx-linkblock">
                  <div className="mx-list-row">
                    <Avatar offer={o} size={30} />
                    <span><b>{o.name}</b><small>{offerLinks.length} affiliate{offerLinks.length === 1 ? '' : 's'} promoting · {money(o.commissionUsd)} per conversion</small></span>
                    <span className="mx-right"><b>{offerReports.filter(r => r.status === 'pending').length}</b><small>to review</small></span>
                    <span className="mx-right"><b>{money(o.escrowRemainingUsd)}</b><small>escrow left</small></span>
                  </div>
                  {offerLinks.length === 0 && <p className="mx-muted mx-pad">No affiliate has taken a link for this offer yet.</p>}
                  {offerLinks.map(l => {
                    const rs = offerReports.filter(r => r.linkId === l.id)
                    return (
                      <div key={l.id} className="mx-affiliate">
                        <div className="mx-affiliate-head">
                          <span><b>Affiliate {shortAddress(l.affiliate)}</b><small className="mx-mono">{linkLabel(l.id)}</small></span>
                          <span className="mx-right"><b>{approvedOn(l.id)}</b><small>paid so far</small></span>
                        </div>
                        {rs.length === 0 && <p className="mx-muted">No reports yet from this affiliate.</p>}
                        {rs.map(r => (
                          <div key={r.id} className="mx-report">
                            <div className="mx-report-head">
                              <span><b>Reports {r.count} {r.action.toLowerCase()}</b><small>Sent {when(r.at)}{r.note ? ` · ${r.note}` : ''}</small></span>
                              <StatusChip r={r} />
                            </div>
                            {r.status === 'pending' && partialFor !== r.id && (
                              <div className="mx-report-actions">
                                <button className="mx-btn mx-btn-lime" onClick={() => pay(r, r.count)}>Approve all, pay {money(r.count * o.commissionUsd)}</button>
                                <button className="mx-btn" onClick={() => setPartialFor(r.id)}>Approve some</button>
                                <button className="mx-btn" onClick={() => setThreadFor(threadFor === r.id ? null : r.id)}>Ask a question</button>
                              </div>
                            )}
                            {r.status === 'pending' && partialFor === r.id && (
                              <form className="mx-report-form" onSubmit={e => partial(r, e)}>
                                <label>Approve how many<input name="count" type="number" min="0" max={r.count} step="1" required defaultValue={r.count} /></label>
                                <label className="mx-grow">Reason for the difference<input name="reason" placeholder="For example: 3 were duplicate accounts" /></label>
                                <button className="mx-btn mx-btn-lime" type="submit">Approve and pay</button>
                                <button className="mx-btn" type="button" onClick={() => setPartialFor(null)}>Cancel</button>
                              </form>
                            )}
                            {r.status !== 'pending' && (
                              <p className="mx-report-result">
                                {r.approvedCount} of {r.count} approved, {money(r.approvedCount * o.commissionUsd)} paid.{r.reason ? ` Reason: ${r.reason}` : ''}
                              </p>
                            )}
                            <Thread r={r} />
                          </div>
                        ))}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </section>
        )}
      </main>

      {confirmOut && wallet && (
        <div className="mx-overlay" onClick={() => setConfirmOut(false)}>
          <div className="mx-dialog" role="alertdialog" aria-modal="true" aria-labelledby="mx-out-title" onClick={e => e.stopPropagation()}
            onKeyDown={e => { if (e.key === 'Escape') setConfirmOut(false) }}>
            <h2 id="mx-out-title">Disconnect wallet?</h2>
            <p>{walletName} {shortAddress(wallet)} will be signed out of Nativness. You can connect it again at any time.</p>
            <div className="mx-dialog-actions">
              <button className="mx-btn" autoFocus onClick={() => setConfirmOut(false)}>Stay connected</button>
              <button className="mx-btn mx-btn-danger" onClick={disconnect}>Disconnect</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="mx-toast" role="status">{toast}</div>}
    </div>
  )
}
