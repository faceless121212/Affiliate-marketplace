import { renderToString } from 'react-dom/server'
import App from './App'
import { metaFor, headHtml, ROUTES, SITE } from './seo'
import { POSTS } from './content'

export function render(url: string) {
  const meta = metaFor(url)
  return { html: renderToString(<App url={url} />), head: headHtml(meta), meta }
}

export { ROUTES, SITE, POSTS }
