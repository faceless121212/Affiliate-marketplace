import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import App from './App'
import { applyMeta, metaFor } from './seo'
import './base.css'

// Addresses used to live behind a hash. Send old links to the new paths.
if (window.location.hash.startsWith('#/')) {
  window.location.replace(window.location.hash.slice(1))
}

function Root() {
  const [url, setUrl] = useState(window.location.pathname + window.location.search)
  useEffect(() => {
    const onPop = () => setUrl(window.location.pathname + window.location.search)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])
  useEffect(() => { applyMeta(metaFor(url)) }, [url])
  return <App url={url} />
}

const container = document.getElementById('root')!
const tree = <React.StrictMode><Root /><Analytics /></React.StrictMode>
if (container.hasChildNodes()) ReactDOM.hydrateRoot(container, tree)
else ReactDOM.createRoot(container).render(tree)
