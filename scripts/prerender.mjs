// Runs after `vite build`. For every route in src/seo.js it writes an HTML
// file with that page's title, description, canonical, social tags and
// breadcrumbs, plus the page's key text inside #root, so crawlers and link
// previews that don't run JavaScript still see a real page. React replaces
// the #root content as soon as the app loads.
//
// Output: dist/index.html (home), dist/work.html, dist/services/roofing.html,
// … — .htaccess serves /work from work.html. Also writes dist/sitemap.xml
// (with image entries for the project photos).

import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { PAGES, SITE, absolute, breadcrumbs, businessGraph } from '../src/seo.js'
import { services } from '../src/data/services.js'
import { builtinPhotos } from '../src/data/builtinPhotos.js'
import { faq } from '../src/data/faq.js'
import { HOME_BASE, REGIONS, STATES, TERRITORY } from '../src/data/areas.js'

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
  html = setTag(html, 'property="og:image"', absolute(SITE.shareImage))
  html = html.replace(/(<meta name="twitter:image" content=")[^"]*(")/, `$1${absolute(SITE.shareImage)}$2`)
  const crumbs = breadcrumbs(path)
  if (crumbs) {
    html = html.replace('</head>', `  <script data-rh="true" type="application/ld+json">${JSON.stringify(crumbs)}</script>\n  </head>`)
  }
  return html
}

// The business entity, generated from src/seo.js (includes SITE.sameAs
// profile links once they're added).
function businessLd(html) {
  if (!html.includes('<!--business-ld-->')) throw new Error('prerender: <!--business-ld--> placeholder missing from index.html')
  return html.replace('<!--business-ld-->', `<script type="application/ld+json">${JSON.stringify(businessGraph())}</script>`)
}

// ---------------------------------------------------------------------------
// Static page text (the same content the app renders)
// ---------------------------------------------------------------------------

const nav = `
  <header>
    <a href="/"><strong>${esc(SITE.legalName)}</strong></a>
    <nav aria-label="Main">
      <a href="/">Home</a> · <a href="/work">Our Work</a> · <a href="/design">Design Your Room</a> · <a href="/contact">Contact</a> ·
      <a href="/service-areas">Service Areas</a> · <a href="tel:${SITE.phone}">${SITE.phoneDisplay}</a>
    </nav>
    <nav aria-label="Services">
      ${services.map(s => `<a href="/services/${s.slug}">${esc(s.title)}</a>`).join(' · ')}
    </nav>
  </header>`

const footer = `
  <footer>
    <p>${esc(SITE.legalName)} — founded by ${esc(SITE.founder)} in ${SITE.foundingDate}. Licensed &amp; insured. Based in ${esc(HOME_BASE.label)}, serving <a href="/service-areas">${esc(TERRITORY)}</a>.
    Call or text <a href="tel:${SITE.phone}">${SITE.phoneDisplay}</a> for a free estimate.</p>
  </footer>`

const serviceList = (detail) => `
    <ul>
      ${services.map(s => `<li id="${s.slug}"><h2><a href="/services/${s.slug}">${esc(s.title)}</a></h2><p>${esc(detail ? s.intro + ' ' + s.description : s.body)}</p>${
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
    <p>Based in ${esc(HOME_BASE.label)} · Serving <a href="/service-areas">${esc(TERRITORY)}</a></p>
    <p>Fully licensed &amp; insured · Free estimates</p>
    <h2>Frequently asked questions</h2>
    ${faq.map(f => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join('\n    ')}`,
}

const notFound = `
  <main>
    <h1>Page not found</h1>
    <p>That page doesn’t exist or may have moved.</p>
    <p><a href="/">Home</a> · <a href="/work">Our Work</a> · <a href="/design">Design Your Room</a> · <a href="/contact">Contact</a></p>
  </main>`

// A service page: the same text the app shows, plus links to the others.
function serviceBody(slug) {
  const s = services.find(x => x.slug === slug)
  return `
    <p>${esc(s.detail)}</p>
    <p>${esc(s.description)}</p>
    <h2>What’s included</h2>
    <ul>${s.includes.map(i => `<li>${esc(i)}</li>`).join('')}</ul>
    <p><a href="/contact?service=${encodeURIComponent(s.estimate)}">Get a free estimate</a>${s.designer ? ` · <a href="/design?room=${s.designer}">Plan it in 3D</a>` : ''}</p>
    <h2>Other services</h2>
    <ul>${services.filter(o => o.slug !== slug).map(o => `<li><a href="/services/${o.slug}">${esc(o.title)}</a></li>`).join('')}</ul>`
}

// Service areas overview and region pages (src/data/areas.js).
const serviceLinks = () => `<ul>${services.map(s => `<li><a href="/services/${s.slug}">${esc(s.title)}</a></li>`).join('')}</ul>`

function areasBody() {
  return STATES.map(state => `
    <h2>${esc(state)}</h2>
    <ul>${REGIONS.filter(r => r.state === state).map(r => `<li id="${r.slug}"><h3>${r.page ? `<a href="/service-areas/${r.slug}">${esc(r.name)}</a>` : esc(r.name)}</h3><p>${esc(r.summary)}</p></li>`).join('')}</ul>`).join('') + `
    <h2>What we do across our service area</h2>${serviceLinks()}
    <p>Not sure if we cover your area? Call or text <a href="tel:${SITE.phone}">${SITE.phoneDisplay}</a>.</p>`
}

function regionBody(slug) {
  const r = REGIONS.find(x => x.slug === slug)
  return `
    <ul>${(r.details || []).map(d => `<li>${esc(d)}</li>`).join('')}</ul>
    <h2>Our services in ${esc(r.name)}</h2>${serviceLinks()}
    <p><a href="/contact">Get a free estimate</a> · <a href="/service-areas">All service areas</a></p>`
}

function body(html, path) {
  const page = PAGES[path]
  if (path === '/404') return html.replace('<div id="root"></div>', `<div id="root"><div style="max-width:72rem;margin:0 auto;padding:2rem 1.5rem;font-family:system-ui,sans-serif">${notFound}</div></div>`)
  if (page.noindex) return html
  const content = `${nav}
  <main>
    <h1>${esc(page.h1)}</h1>
    <p>${esc(page.intro)}</p>${page.service ? serviceBody(page.service) : page.region ? regionBody(page.region) : path === '/service-areas' ? areasBody() : (bodies[path]?.() ?? '')}
  </main>${footer}`
  // Plain, readable fallback; the app replaces it on load.
  return html.replace('<div id="root"></div>', `<div id="root"><div style="max-width:72rem;margin:0 auto;padding:2rem 1.5rem;font-family:system-ui,sans-serif;color:#e7e5e4;background:#14110f;line-height:1.6">${content}\n</div></div>`)
}

// ---------------------------------------------------------------------------

for (const path of Object.keys(PAGES)) {
  let html = body(head(businessLd(template), path), path)
  const file = path === '/' ? 'index.html' : `${path.slice(1)}.html`
  // The 404 page has no canonical URL of its own.
  if (path === '/404') html = html.replace(/\s*<link data-rh="true" rel="canonical"[^>]*>/, '')
  mkdirSync(dirname(join(dist, file)), { recursive: true })
  writeFileSync(join(dist, file), html)
  console.log(`prerender: ${file}`)
}

// Sitemap, with the built project photos listed under the pages that show
// them (Home and Our Work show all; each service page shows its category).
const assets = readdirSync(join(dist, 'assets'))
const photoUrl = (name) => {
  const file = assets.find(f => f.startsWith(`${name}-1600-`) && f.endsWith('.webp'))
  return file ? `${SITE.url}/assets/${file}` : null
}
const photosFor = (path) => {
  const page = PAGES[path]
  const category = page.service && services.find(s => s.slug === page.service).category
  if (!['/', '/work'].includes(path) && !category) return []
  return builtinPhotos.filter(p => !category || p.category === category).map(p => photoUrl(p.name)).filter(Boolean)
}

const today = new Date().toISOString().slice(0, 10)
const priority = { '/': '1.0', '/work': '0.9', '/design': '0.8', '/contact': '0.8' }
const urls = Object.entries(PAGES)
  .filter(([, p]) => !p.noindex)
  .map(([path, p]) => [
    '  <url>',
    `    <loc>${absolute(path)}</loc>`,
    `    <lastmod>${today}</lastmod>`,
    `    <priority>${priority[path] ?? (p.service ? '0.8' : '0.5')}</priority>`,
    ...photosFor(path).map(src => `    <image:image><image:loc>${src}</image:loc></image:image>`),
    '  </url>',
  ].join('\n'))
writeFileSync(join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls.join('\n')}\n</urlset>\n`)
console.log('prerender: sitemap.xml')

// robots.txt, pointing at this domain's sitemap; private pages excluded.
writeFileSync(join(dist, 'robots.txt'), `User-agent: *
Allow: /
Disallow: /admin
Disallow: /project
Disallow: /api/

Sitemap: ${SITE.url}/sitemap.xml
`)
console.log('prerender: robots.txt')
