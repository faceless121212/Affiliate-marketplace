import type { MouseEvent, ReactNode } from 'react'
import { Logo, Footer } from './Landing'
import { POSTS, type Doc } from './content'

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="lp">
      <header className="lp-header">
        <div className="lp-header-in">
          <Logo />
          <nav className="lp-nav">
            <a href="#/app">Browse offers</a>
            <a href="#/blog">Blog</a>
            <a href="#/terms">Terms</a>
            <a href="#/privacy">Privacy</a>
          </nav>
          <div className="lp-header-right">
            <a href="#/app" className="lp-btn lp-btn-lime lp-btn-sm">Open the app</a>
          </div>
        </div>
      </header>
      <main>{children}</main>
      <Footer />
    </div>
  )
}

export function PostCard({ slug }: { slug: string }) {
  const p = POSTS.find(x => x.slug === slug)!
  return (
    <a href={`#/blog/${p.slug}`} className="lp-post">
      <img src={`/img/${p.img}.jpg`} alt="" />
      <span className="lp-post-tag">{p.tag}</span>
      <h3>{p.title}</h3>
      <p>{p.excerpt}</p>
      <small>{p.date} · {p.minutes} min read</small>
    </a>
  )
}

export function BlogIndex() {
  return (
    <Shell>
      <section className="lp-wrap lp-page">
        <h1>Blog</h1>
        <p className="lp-page-lead">Notes on escrow, payouts and running honest affiliate offers.</p>
        <div className="lp-posts">{POSTS.map(p => <PostCard key={p.slug} slug={p.slug} />)}</div>
      </section>
    </Shell>
  )
}

export function BlogPost({ slug }: { slug: string }) {
  const p = POSTS.find(x => x.slug === slug)
  if (!p) return <BlogIndex />
  if (!p.html) {
    return (
      <Shell>
        <article className="lp-wrap lp-page lp-prose">
          <a href="#/blog" className="lp-back">← All posts</a>
          <span className="lp-post-tag">{p.tag}</span>
          <h1>{p.title}</h1>
          <small>{p.date} · {p.minutes} min read</small>
          <img src={`/img/${p.img}.jpg`} alt="" />
          {p.body.map((b, i) => typeof b === 'string' ? <p key={i}>{b}</p> : <h2 key={i}>{b.h}</h2>)}
          <a href="#/app" className="lp-btn lp-btn-lime lp-btn-lg">Browse funded offers</a>
        </article>
      </Shell>
    )
  }
  // Table of contents links scroll in place, because the hash is used for routing.
  const onTocClick = (e: MouseEvent<HTMLDivElement>) => {
    const link = (e.target as HTMLElement).closest<HTMLElement>('[data-toc]')
    if (!link) return
    e.preventDefault()
    const el = document.getElementById(link.dataset.toc!)
    const header = document.querySelector<HTMLElement>('.lp-header')?.offsetHeight ?? 0
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - header - 16, behavior: 'smooth' })
  }
  return (
    <Shell>
      <header className="lp-arthero" style={{ backgroundImage: `url(/img/${p.img}.jpg)` }}>
        <div className="lp-arthero-in">
          <span className="lp-arthero-tag">{p.tag}</span>
          <h1>{p.title}</h1>
          <p>By the Nativness team · {p.date} · {p.minutes} min read</p>
        </div>
      </header>
      <article className="lp-wrap lp-page lp-prose lp-article">
        <a href="#/blog" className="lp-back">← All posts</a>
        <div className="lp-md" onClick={onTocClick} dangerouslySetInnerHTML={{ __html: p.html }} />
        <aside className="lp-cta">
          <div>
            <h2>See what a funded offer looks like</h2>
            <p>Every offer on Nativness shows the commission budget that is still locked in escrow.</p>
          </div>
          <a href="#/app" className="lp-btn lp-btn-lime lp-btn-lg">Browse offers</a>
        </aside>
      </article>
    </Shell>
  )
}

export function Legal({ doc }: { doc: Doc }) {
  return (
    <Shell>
      <article className="lp-wrap lp-page lp-prose">
        <h1>{doc.title}</h1>
        <small>Last updated {doc.updated}</small>
        <p className="lp-draft">{doc.intro}</p>
        {doc.sections.map(s => (
          <section key={s.h}>
            <h2>{s.h}</h2>
            {s.p.map((t, i) => <p key={i}>{t}</p>)}
          </section>
        ))}
      </article>
    </Shell>
  )
}
