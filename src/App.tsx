import Landing from './Landing'
import MarketApp from './MarketApp'
import { BlogIndex, BlogPost, Legal } from './Pages'
import { TERMS, PRIVACY } from './content'

export default function App({ url }: { url: string }) {
  const path = url.split('?')[0].replace(/\/+$/, '') || '/'
  if (path === '/app') return <MarketApp />
  if (path.startsWith('/r/')) return <MarketApp refId={decodeURIComponent(path.slice(3))} />
  if (path.startsWith('/blog/')) return <BlogPost slug={decodeURIComponent(path.slice(6))} />
  if (path === '/blog') return <BlogIndex />
  if (path === '/terms') return <Legal doc={TERMS} />
  if (path === '/privacy') return <Legal doc={PRIVACY} />
  return <Landing />
}
