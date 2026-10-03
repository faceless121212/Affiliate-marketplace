import type { ReactNode } from 'react'
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
