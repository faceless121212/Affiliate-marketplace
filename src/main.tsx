import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import Landing from './Landing'
import MarketApp from './MarketApp'
import { BlogIndex, BlogPost, Legal } from './Pages'
import { TERMS, PRIVACY } from './content'
import './base.css'

function Root() {
  const [hash, setHash] = useState(window.location.hash)
  useEffect(() => {
    const onHash = () => { setHash(window.location.hash); if (window.location.hash.startsWith('#/')) window.scrollTo(0, 0) }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  if (hash.startsWith('#/app')) return <MarketApp />
  if (hash.startsWith('#/blog/')) return <BlogPost slug={hash.slice(7)} />
  if (hash === '#/blog') return <BlogIndex />
  if (hash === '#/terms') return <Legal doc={TERMS} />
  if (hash === '#/privacy') return <Legal doc={PRIVACY} />
  return <Landing />
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><Root /><Analytics /></React.StrictMode>,
)
