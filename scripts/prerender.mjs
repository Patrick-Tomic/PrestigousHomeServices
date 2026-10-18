// Runs after `vite build`. For every route in src/seo.js it writes an HTML
// file with that page's title, description, canonical, social tags and
// breadcrumbs, plus the page's key text inside #root, so crawlers and link
// previews that don't run JavaScript still see a real page. React replaces
// the #root content as soon as the app loads.
//
// Output: dist/index.html (home), dist/work.html, dist/design.html, … —
// .htaccess serves /work from work.html. Also writes dist/sitemap.xml.

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { PAGES, SITE, absolute, breadcrumbs } from '../src/seo.js'
import { services } from '../src/data/services.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const template = readFileSync(join(dist, 'index.html'), 'utf8')

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// Swap the content of a data-rh tag in the template's <head>.
function setTag(html, pattern, value) {
  const re = new RegExp(`(<meta data-rh="true" ${pattern} content=")[^"]*(")`)
  if (!re.test(html)) throw new Error(`prerender: tag not found: ${pattern}`)
  return html.replace(re, `$1${esc(value)}$2`)
}

function head(html, path) {
  const page = PAGES[path]
  const url = absolute(path)
  html = html.replace(/<title data-rh="true">[^<]*<\/title>/, `<title data-rh="true">${esc(page.title)}</title>`)
  html = html.replace(/(<link data-rh="true" rel="canonical" href=")[^"]*(")/, `$1${url}$2`)
  html = setTag(html, 'name="description"', page.description)
  html = setTag(html, 'name="robots"', page.noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large')
  html = setTag(html, 'property="og:title"', page.title)
  html = setTag(html, 'property="og:description"', page.description)
  html = setTag(html, 'property="og:url"', url)
  html = setTag(html, 'name="twitter:title"', page.title)
  html = setTag(html, 'name="twitter:description"', page.description)
  const crumbs = breadcrumbs(path)
  if (crumbs) {
    html = html.replace('</head>', `  <script data-rh="true" type="application/ld+json">${JSON.stringify(crumbs)}</script>\n  </head>`)
  }
  return html
}

// Add the business's profile links (src/seo.js → SITE.sameAs) to the
// structured data once they exist.
function sameAs(html) {
  if (!SITE.sameAs.length) return html
  return html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/, (m, json) => {
    const data = JSON.parse(json)
    const biz = data['@graph'].find(n => n['@id'].endsWith('#business'))
    biz.sameAs = SITE.sameAs
    return `<script type="application/ld+json">${JSON.stringify(data)}</script>`
  })
}

// ---------------------------------------------------------------------------
// Static page text (the same content the app renders)
// ---------------------------------------------------------------------------

const nav = `
  <header>
    <a href="/"><strong>${esc(SITE.legalName)}</strong></a>
    <nav aria-label="Main">
      <a href="/">Home</a> · <a href="/work">Our Work</a> · <a href="/design">Design Your Room</a> · <a href="/contact">Contact</a> ·
      <a href="tel:${SITE.phone}">${SITE.phoneDisplay}</a>
    </nav>
  </header>`

const footer = `
  <footer>
    <p>${esc(SITE.legalName)} — founded by ${esc(SITE.founder)} in ${SITE.foundingDate}. Licensed &amp; insured. Serving nationwide.
    Call or text <a href="tel:${SITE.phone}">${SITE.phoneDisplay}</a> for a free estimate.</p>
  </footer>`

const serviceList = (detail) => `
    <ul>
      ${services.map(s => `<li id="${s.slug}"><h2>${esc(s.title)}</h2><p>${esc(detail ? s.intro + ' ' + s.description : s.body)}</p>${
        detail ? `<ul>${s.includes.map(i => `<li>${esc(i)}</li>`).join('')}</ul>` : ''
      }</li>`).join('\n      ')}
    </ul>`

const bodies = {
  '/': () => `
    <p>Licensed • Insured • Since 2011</p>
    ${serviceList(false)}
    <p><a href="/contact">Get a free estimate</a> · <a href="/design">Design your room in 3D</a></p>`,
  '/work': () => serviceList(true),
  '/design': () => `
    <p>Choose a living area, bedroom, kitchen, bathroom or enclosed patio; set the room size; and preview
    hardwood, laminate, tile or natural stone flooring. Customize shower tile, glass and fixtures, kitchen
    layouts, cabinets, countertops and backsplashes, then save rooms to your project and send it for a free estimate.</p>`,
  '/contact': () => `
    <p>Phone / text: <a href="tel:${SITE.phone}">${SITE.phoneDisplay}</a></p>
    <p>Service area: Serving nationwide</p>
    <p>Fully licensed &amp; insured · Free estimates</p>`,
}

const notFound = `
  <main>
    <h1>Page not found</h1>
    <p>That page doesn’t exist or may have moved.</p>
    <p><a href="/">Home</a> · <a href="/work">Our Work</a> · <a href="/design">Design Your Room</a> · <a href="/contact">Contact</a></p>
  </main>`

function body(html, path) {
  const page = PAGES[path]
  if (path === '/404') return html.replace('<div id="root"></div>', `<div id="root"><div style="max-width:72rem;margin:0 auto;padding:2rem 1.5rem;font-family:system-ui,sans-serif">${notFound}</div></div>`)
  if (page.noindex) return html
  const content = `${nav}
  <main>
    <h1>${esc(page.h1)}</h1>
    <p>${esc(page.intro)}</p>${bodies[path]?.() ?? ''}
  </main>${footer}`
  // Plain, readable fallback; the app replaces it on load.
  return html.replace('<div id="root"></div>', `<div id="root"><div style="max-width:72rem;margin:0 auto;padding:2rem 1.5rem;font-family:system-ui,sans-serif;color:#e7e5e4;background:#14110f;line-height:1.6">${content}\n</div></div>`)
}

// ---------------------------------------------------------------------------

for (const path of Object.keys(PAGES)) {
  let html = body(head(sameAs(template), path), path)
  const file = path === '/' ? 'index.html' : `${path.slice(1)}.html`
  // The 404 page has no canonical URL of its own.
  if (path === '/404') html = html.replace(/\s*<link data-rh="true" rel="canonical"[^>]*>/, '')
  writeFileSync(join(dist, file), html)
  console.log(`prerender: ${file}`)
}

const today = new Date().toISOString().slice(0, 10)
const priority = { '/': '1.0', '/work': '0.9', '/design': '0.8', '/contact': '0.8' }
const urls = Object.entries(PAGES)
  .filter(([, p]) => !p.noindex)
  .map(([path]) => `  <url>\n    <loc>${absolute(path)}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>${priority[path] ?? '0.5'}</priority>\n  </url>`)
writeFileSync(join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`)
console.log('prerender: sitemap.xml')
