import { POSTS, type Post } from './content'

export const SITE = 'https://www.top100affiliates.com'
const NAME = 'Nativness'
const TAGLINE = 'Affiliate Marketplace with Escrow'
const DESC = 'Nativness is an affiliate marketplace where the commission budget is locked in escrow before the offer goes live. Affiliates see a guaranteed balance, not a promise.'

export type Meta = {
  title: string
  description: string
  canonical: string
  image: string
  type: 'website' | 'article'
  noindex?: boolean
  jsonLd: Record<string, unknown>[]
}

const org = { '@type': 'Organization', name: NAME, url: SITE, logo: `${SITE}/icon-192.png` }
const strip = (h: string) => h.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').trim()

// Questions and answers under a FAQ heading become FAQPage structured data.
function faqFrom(html: string) {
  const sections = html.split(/(?=<h2 )/)
  const faq = sections.find(s => /<h2[^>]*>[^<]*(FAQ|Quick questions)/i.test(s))
  if (!faq) return null
  const items = [...faq.matchAll(/<h3[^>]*>(.*?)<\/h3>\s*<p>(.*?)<\/p>/gs)].map(m => ({
    '@type': 'Question', name: strip(m[1]),
    acceptedAnswer: { '@type': 'Answer', text: strip(m[2]) },
  }))
  return items.length ? { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: items } : null
}

function articleMeta(p: Post): Meta {
  const url = `${SITE}/blog/${p.slug}`
  const image = `${SITE}/img/${p.img}.jpg`
  const jsonLd: Record<string, unknown>[] = [{
    '@context': 'https://schema.org', '@type': 'BlogPosting',
    headline: p.title, description: p.excerpt, image, url, mainEntityOfPage: url,
    datePublished: p.published, dateModified: p.updated,
    author: org, publisher: org,
  }, {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Blog', item: `${SITE}/blog` },
      { '@type': 'ListItem', position: 2, name: p.title, item: url },
    ],
  }]
  const faq = p.html ? faqFrom(p.html) : null
  if (faq) jsonLd.push(faq)
  return { title: `${p.metaTitle} | ${NAME}`, description: p.excerpt, canonical: url, image, type: 'article', jsonLd }
}

export function metaFor(url: string): Meta {
  const path = url.split('?')[0].replace(/\/+$/, '') || '/'
  if (path.startsWith('/blog/')) {
    const post = POSTS.find(p => p.slug === path.slice(6))
    if (post) return articleMeta(post)
  }
  const base = { image: `${SITE}/og.jpg`, type: 'website' as const }
  if (path === '/blog') return {
    ...base, title: `Blog | ${NAME}`, canonical: `${SITE}/blog`,
    description: 'Guides for affiliates and advertisers on escrow, payouts, tracking links and honest affiliate offers.',
    jsonLd: [{ '@context': 'https://schema.org', '@type': 'Blog', name: `${NAME} Blog`, url: `${SITE}/blog`, publisher: org,
      blogPost: POSTS.map(p => ({ '@type': 'BlogPosting', headline: p.title, url: `${SITE}/blog/${p.slug}`, datePublished: p.published })) }],
  }
  if (path === '/app') return {
    ...base, title: `Marketplace | ${NAME}`, canonical: `${SITE}/app`,
    description: 'Browse funded affiliate offers, take a tracking link and report conversions. Providers list offers, lock the budget and pay affiliates from escrow.',
    jsonLd: [{ '@context': 'https://schema.org', '@type': 'WebPage', name: 'Marketplace', url: `${SITE}/app`, isPartOf: { '@type': 'WebSite', name: NAME, url: SITE } }],
  }
  if (path === '/terms') return { ...base, title: `Terms of Use | ${NAME}`, canonical: `${SITE}/terms`, description: `Terms of use for the ${NAME} affiliate marketplace.`, jsonLd: [] }
  if (path === '/privacy') return { ...base, title: `Privacy Policy | ${NAME}`, canonical: `${SITE}/privacy`, description: `How ${NAME} handles your wallet address and other data.`, jsonLd: [] }
  if (path.startsWith('/r/')) return { ...base, title: `${NAME}`, canonical: `${SITE}/app`, description: DESC, noindex: true, jsonLd: [] }
  return {
    ...base, title: `${NAME}: ${TAGLINE}`, canonical: SITE, description: DESC,
    jsonLd: [
      { '@context': 'https://schema.org', ...org },
      { '@context': 'https://schema.org', '@type': 'WebSite', name: NAME, url: SITE },
    ],
  }
}

export const ROUTES = ['/', '/app', '/blog', '/terms', '/privacy', ...POSTS.map(p => `/blog/${p.slug}`)]

export function applyMeta(meta: Meta) {
  document.title = meta.title
  const set = (sel: string, make: () => HTMLElement, attr: string, value: string) => {
    let el = document.head.querySelector<HTMLElement>(sel)
    if (!el) { el = make(); document.head.appendChild(el) }
    el.setAttribute(attr, value)
  }
  const metaTag = (name: string, value: string, key = 'name') => set(`meta[${key}="${name}"]`, () => { const m = document.createElement('meta'); m.setAttribute(key, name); return m }, 'content', value)
  metaTag('description', meta.description)
  metaTag('og:title', meta.title, 'property'); metaTag('og:description', meta.description, 'property')
  metaTag('og:image', meta.image, 'property'); metaTag('og:url', meta.canonical, 'property'); metaTag('og:type', meta.type, 'property')
  metaTag('twitter:card', 'summary_large_image'); metaTag('robots', meta.noindex ? 'noindex' : 'index,follow')
  set('link[rel="canonical"]', () => { const l = document.createElement('link'); l.rel = 'canonical'; return l }, 'href', meta.canonical)
}

export function headHtml(meta: Meta) {
  const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
  const lines = [
    `<title>${esc(meta.title)}</title>`,
    `<meta name="description" content="${esc(meta.description)}" />`,
    `<link rel="canonical" href="${meta.canonical}" />`,
    `<meta name="robots" content="${meta.noindex ? 'noindex' : 'index,follow'}" />`,
    `<meta property="og:site_name" content="${NAME}" />`,
    `<meta property="og:type" content="${meta.type}" />`,
    `<meta property="og:title" content="${esc(meta.title)}" />`,
    `<meta property="og:description" content="${esc(meta.description)}" />`,
    `<meta property="og:url" content="${meta.canonical}" />`,
    `<meta property="og:image" content="${meta.image}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(meta.title)}" />`,
    `<meta name="twitter:description" content="${esc(meta.description)}" />`,
    `<meta name="twitter:image" content="${meta.image}" />`,
    ...meta.jsonLd.map(j => `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, '\\u003c')}</script>`),
  ]
  return lines.join('\n    ')
}
