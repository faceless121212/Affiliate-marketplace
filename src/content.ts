import { marked } from 'marked'

export type Post = { slug: string; title: string; excerpt: string; img: string; date: string; minutes: number; tag: string; body: (string | { h: string })[]; html?: string; order?: string }

// Long-form articles live as markdown in src/posts, with front matter for the card.
const files = import.meta.glob('./posts/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>

const longDate = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })

type TocItem = { id: string; text: string; depth: number }
let toc: TocItem[] = []

const escapeHtml = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const slugify = (t: string) => t.toLowerCase().replace(/<[^>]+>/g, '').replace(/&[a-z]+;/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

// A fenced block tagged "score" becomes a score card:
//   Setup speed: 4
//   Cost to start: 5
function scoreCard(text: string) {
  const rows = text.trim().split('\n').map(l => l.split(':').map(x => x.trim())).filter(r => r.length === 2 && r[1] !== '')
  const total = rows.reduce((n, r) => n + Number(r[1]), 0)
  const bars = rows.map(([label, value]) =>
    `<div class="lp-score-row"><span>${escapeHtml(label)}</span><i>${[1, 2, 3, 4, 5].map(n => `<b class="${n <= Number(value) ? 'on' : ''}"></b>`).join('')}</i><em>${escapeHtml(value)}/5</em></div>`).join('')
  return `<div class="lp-score">${bars}<div class="lp-score-total"><span>Score</span><strong>${total}<small>/${rows.length * 5}</small></strong></div></div>`
}

function tocHtml(items: TocItem[]) {
  const links = items.map(i => `<li class="d${i.depth}"><a href="#" data-toc="${i.id}">${i.text}</a></li>`).join('')
  return `<nav class="lp-toc" aria-label="Table of contents"><p>In this article</p><ul>${links}</ul></nav>`
}

marked.use({
  renderer: {
    heading({ tokens, depth }) {
      const inner = this.parser.parseInline(tokens)
      const id = slugify(inner)
      if (depth === 2 || (depth === 3 && /^\d+\./.test(inner))) toc.push({ id, text: inner, depth })
      return `<h${depth} id="${id}">${inner}</h${depth}>\n`
    },
    code({ text, lang }) {
      if (lang === 'score') return scoreCard(text)
      return `<pre><code>${escapeHtml(text)}</code></pre>\n`
    },
  },
})

function fromMarkdown(raw: string): Post {
  const [, front = '', text = ''] = raw.split(/^---\s*$/m)
  const meta: Record<string, string> = {}
  for (const line of front.split('\n')) {
    const m = line.match(/^(\w+):\s*(.*)$/)
    if (m) meta[m[1]] = m[2].replace(/^"(.*)"$/, '$1').replace(/\\"/g, '"')
  }
  const article = text.replace(/^\s*# .*$/m, '').trim()
  toc = []
  const html = (marked.parse(article, { async: false }) as string)
    .replace(/<p>\[\[toc\]\]<\/p>/, () => tocHtml(toc))
    .replace(/<a href="http/g, '<a target="_blank" rel="noopener noreferrer" href="http')
    .replace(/<table>/g, '<div class="lp-table"><table>')
    .replace(/<\/table>/g, '</table></div>')
  return {
    slug: meta.slug, title: meta.title, excerpt: meta.description, img: meta.cover, tag: `For ${meta.audience.toLowerCase()}`,
    date: longDate(meta.published), minutes: parseFloat(meta.readingTime), body: [], html, order: meta.order,
  }
}

const ARTICLES: Post[] = Object.values(files).map(fromMarkdown).sort((a, b) => Number(b.order ?? 0) - Number(a.order ?? 0) || a.slug.localeCompare(b.slug))


export const POSTS: Post[] = ARTICLES


export type Doc = { title: string; updated: string; intro: string; sections: { h: string; p: string[] }[] }

const DRAFT = 'Draft. It has not been reviewed by a lawyer and the bracketed details must be completed before launch.'

export const TERMS: Doc = {
  title: 'Terms of Use', updated: '3 October 2026', intro: DRAFT,
  sections: [
    { h: '1. Who we are', p: ['Nativness is operated by [legal entity name], [registered address]. These terms apply to the Nativness website and web application.', 'By using Nativness you agree to these terms. If you do not agree, do not use it.'] },
    { h: '2. Current status', p: ['Nativness does not currently hold, move or pay real funds. Escrow balances, conversions and payouts shown in the app are records kept in the app, not on-chain transactions, and have no monetary value.'] },
    { h: '3. Your wallet', p: ['You sign in by connecting a crypto wallet, such as Phantom or MetaMask. Your wallet address is your account. We never ask for and never receive your private key or seed phrase.', 'You are responsible for the security of your wallet and for all activity carried out with it.'] },
    { h: '4. Advertisers', p: ['When you list an offer you must describe it accurately and state clearly what counts as a conversion. You must have the right to promote the product or service and must comply with the laws that apply to it, including advertising, gambling and consumer protection rules.', 'The commission budget you lock is committed to confirmed conversions under the terms you published.'] },
    { h: '5. Affiliates', p: ['You must promote offers honestly and within each offer’s terms. Incentivised, automated or fraudulent traffic is prohibited unless an offer expressly allows it.', 'A payout is due only for a conversion that is confirmed under the offer’s published terms and only while the offer’s escrow balance can cover it.'] },
    { h: '6. Prohibited use', p: ['You may not use Nativness to break the law, to mislead other users, to interfere with the service, or to list or promote illegal goods or services.'] },
    { h: '7. No advice', p: ['Nothing on Nativness is financial, legal or tax advice. You are responsible for your own tax and regulatory obligations.'] },
    { h: '8. Disclaimers and liability', p: ['Nativness is provided as is, without warranties of any kind. To the extent the law allows, we are not liable for indirect or consequential loss arising from your use of it.'] },
    { h: '9. Changes and ending use', p: ['We may change or withdraw the service at any time. We may update these terms and will change the date above when we do.'] },
    { h: '10. Governing law and contact', p: ['These terms are governed by the laws of [jurisdiction]. Questions can be sent to [contact email].'] },
  ],
}

export const PRIVACY: Doc = {
  title: 'Privacy Policy', updated: '3 October 2026', intro: DRAFT,
  sections: [
    { h: '1. Who is responsible', p: ['[Legal entity name], [registered address], is responsible for personal data handled through Nativness. Contact: [contact email].'] },
    { h: '2. What we handle', p: ['Your public wallet address, when you connect a wallet. We never receive your private key or seed phrase.', 'Offers you create, tracking links you take and simulated conversions and payouts.'] },
    { h: '3. Where it is stored', p: ['This information is kept in your own browser. The wallet you last connected is remembered in local storage. It is not sent to a Nativness server, and it is not shared across devices. Clearing your browser’s site data deletes it.'] },
    { h: '4. What we do not collect', p: ['We do not ask for your name, email address, payment card or identity documents. We set no advertising cookies.'] },
    { h: '5. Third parties', p: ['We use Vercel Web Analytics to count page visits. It sets no cookies and does not identify individual visitors. Fonts are loaded from Google Fonts, so your browser makes a request to Google when a page loads. Your wallet extension is provided by its own developer under its own privacy policy.', 'Blockchains are public. Any transaction a wallet makes on one is public and permanent. Nativness itself asks your wallet to make none.'] },
    { h: '6. Your rights', p: ['Depending on where you live, you may have the right to access, correct, delete or object to the use of your personal data. Because this data stays in your browser, you can delete it yourself at any time. For anything else, write to [contact email].'] },
    { h: '7. Changes', p: ['A later release will add a database and a server. This policy will be rewritten before that happens, and the date above will change.'] },
  ],
}
