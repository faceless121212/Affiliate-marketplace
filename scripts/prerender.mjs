// Renders every route to static HTML after the client build, and writes the sitemap and robots file.
import fs from 'node:fs'
import path from 'node:path'

const dist = path.resolve('dist')
const { render, ROUTES, SITE, POSTS } = await import(path.join(dist, 'server/entry-server.js'))
const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf8')

const fileFor = route => (route === '/' ? 'index.html' : `${route.slice(1)}.html`)

for (const route of ROUTES) {
  let html = '', head = ''
  try {
    ({ html, head } = render(route))
  } catch (err) {
    console.warn(`prerender: ${route} rendered as an empty shell (${err.message})`)
    ;({ head } = render('/'))
  }
  const page = template
    .replace(/<title>.*?<\/title>\n?/s, '')
    .replace(/<meta name="description"[^>]*>\n?/, '')
    .replace('<!--seo-->', head)
    .replace('<div id="root"></div>', `<div id="root">${html}</div>`)
  const out = path.join(dist, fileFor(route))
  fs.mkdirSync(path.dirname(out), { recursive: true })
  fs.writeFileSync(out, page)
  console.log(`prerender: ${route} -> ${path.relative(dist, out)} (${(html.length / 1024).toFixed(0)} KB)`)
}

const today = new Date().toISOString().slice(0, 10)
const lastmod = route => POSTS.find(p => route === `/blog/${p.slug}`)?.updated ?? today
const urls = ROUTES.map(r => `  <url><loc>${SITE}${r === '/' ? '' : r}</loc><lastmod>${lastmod(r)}</lastmod></url>`).join('\n')
fs.writeFileSync(path.join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`)
fs.writeFileSync(path.join(dist, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /r/\n\nSitemap: ${SITE}/sitemap.xml\n`)
fs.rmSync(path.join(dist, 'server'), { recursive: true, force: true })
console.log(`prerender: ${ROUTES.length} pages, sitemap.xml, robots.txt`)
