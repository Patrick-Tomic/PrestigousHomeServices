// Single source of truth for search and social metadata. Used by the <Seo>
// component at runtime and by scripts/prerender.mjs at build time, which
// writes a real HTML file per route so every crawler (and link previews)
// sees the right title, description and page text without running JS.
//
// Keep the business name, phone and founder identical everywhere: with many
// "Prestige…" companies around, consistency is what tells search engines
// this is one distinct business.

import { services } from './data/services.js'
import { HOME_BASE, REGIONS, STATES, TERRITORY, regionPages } from './data/areas.js'

export const SITE = {
  // The live domain. Switch to https:// once the SSL certificate is active
  // in IONOS (then rebuild and re-upload) — every URL below follows this.
  url: 'http://prestigoushomeservices.com',
  name: 'Prestigious Home Services',
  legalName: 'Prestigious Home Services, LLC',
  alternateNames: ['Prestigious Home Services LLC', 'Prestigous Home Services', 'prestigoushomeservices.com'],
  founder: 'Kruno Tomic',
  foundingDate: '2011',
  phone: '+13862878579',
  phoneDisplay: '(386) 287-8579',
  logo: '/logo.png',
  // 1200×630 image for link previews (Facebook, iMessage, LinkedIn, X).
  shareImage: '/og-image.jpg',
  description:
    `Licensed & insured flooring and home improvement contractor based in ${HOME_BASE.label}, serving ${TERRITORY.replace('&', 'and')} since 2011. Free estimates.`,
  // Profiles that belong to this business (Google Business Profile, Facebook,
  // Instagram, Yelp, BBB, Houzz…). Adding them is one of the strongest ways
  // to separate this company from similarly named ones.
  sameAs: [],
}

const brand = SITE.legalName

export const PAGES = {
  '/': {
    title: `${SITE.name} | Flooring & Home Improvement, ${HOME_BASE.label}`,
    description: SITE.description,
    h1: 'Prestigious Home Services',
    intro: `Trusted flooring and home improvement contractor based in ${HOME_BASE.city}, ${HOME_BASE.state}, serving homeowners across ${TERRITORY}. Built on craftsmanship, backed by over a decade of results. Founded by Kruno Tomic in 2011 — licensed, insured, and free estimates.`,
    crumb: 'Home',
  },
  '/work': {
    title: `Our Work: Project Photos & Services | ${SITE.name}`,
    description: 'Completed flooring, bathroom, kitchen and roofing projects by Prestigious Home Services, plus every service we offer. Free estimates.',
    h1: 'Our Work',
    intro: 'Flooring, bathroom remodels, kitchen updates, enclosed patios, roofing and handyman services by Prestigious Home Services, with photos of completed projects.',
    crumb: 'Our Work',
  },
  '/design': {
    title: `Design Your Room in 3D | ${SITE.name}`,
    description: 'Plan a room in 3D: set the size and preview flooring, showers, cabinets and more, then send it to Prestigious Home Services for a free estimate.',
    h1: 'Design Your Room',
    intro: 'Pick a room, set the size, and try different floors, showers, cabinets and finishes in 3D. When it looks right, send it to Prestigious Home Services for a free estimate.',
    crumb: 'Design Your Room',
  },
  '/contact': {
    title: `Contact Us for a Free Estimate | ${SITE.name}`,
    description: `Get a free estimate from Prestigious Home Services in ${HOME_BASE.label}. Call or text Kruno Tomic at (386) 287-8579. Serving ${TERRITORY.replace('&', 'and')}.`,
    h1: 'Contact Us',
    intro: 'Ready to get started? Prestigious Home Services offers free estimates. Call or text Kruno Tomic at (386) 287-8579.',
    crumb: 'Contact',
  },
  '/project': {
    title: `My Project | ${brand}`,
    description: "The rooms you've designed with Prestigious Home Services, ready to send for a free estimate.",
    noindex: true,
  },
  '/admin': {
    title: `Admin | ${brand}`,
    description: '',
    noindex: true,
  },
  '/404': {
    title: `Page Not Found | ${brand}`,
    description: 'That page doesn’t exist. Find our services, project photos, room designer and free estimates at Prestigious Home Services.',
    noindex: true,
  },
}

// Where we work: an overview, plus a page for each region with real details
// (see src/data/areas.js).
PAGES['/service-areas'] = {
  title: `Service Areas: ${TERRITORY} | ${SITE.name}`,
  description: `Based in ${HOME_BASE.label}, Prestigious Home Services serves ${TERRITORY.replace('&', 'and')}, from the Daytona area to the Panhandle. Free estimates.`,
  h1: 'Service Areas',
  intro: `We’re based in ${HOME_BASE.city}, ${HOME_BASE.state}, and take on flooring and home improvement projects across ${TERRITORY}.`,
  crumb: 'Service Areas',
}
for (const r of regionPages) {
  PAGES[`/service-areas/${r.slug}`] = {
    title: `Flooring & Home Improvement in ${r.name} | ${SITE.name}`,
    description: r.homeBase
      ? `Licensed & insured flooring and home improvement contractor based in ${r.name}: flooring, bathrooms, kitchens, roofing and more. Free estimates.`
      : `Flooring and home improvement in ${r.name} by Prestigious Home Services. Licensed & insured since 2011. Free estimates.`,
    h1: r.homeBase ? `Flooring & Home Improvement in ${r.name}` : r.name,
    intro: r.summary,
    crumb: r.name,
    parent: '/service-areas',
    region: r.slug,
  }
}

// One page per service at /services/<slug>, built from src/data/services.js.
for (const sv of services) {
  PAGES[`/services/${sv.slug}`] = {
    title: `${sv.seoTitle} | ${SITE.name}`,
    description: sv.seoDescription,
    h1: sv.title,
    intro: sv.intro,
    crumb: sv.title,
    parent: '/work',
    service: sv.slug,
  }
}

export const absolute = (path) => (path.startsWith('http') ? path : SITE.url + path)

const STATE_CODES = { Florida: 'US-FL', Georgia: 'US-GA', Texas: 'US-TX' }

// The service territory as structured data: the three states.
export const AREA_SERVED = STATES.map(name => ({ '@type': 'State', name }))

// Who this business is, for the JSON-LD in every page's <head> (injected by
// scripts/prerender.mjs). Only verified facts: a service-area business based
// in Lake City, FL, so the address is the city only (no street address).
export function businessGraph() {
  const id = (frag) => `${SITE.url}/#${frag}`
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': id('website'),
        url: `${SITE.url}/`,
        name: SITE.name,
        alternateName: [SITE.legalName, ...SITE.alternateNames],
        publisher: { '@id': id('business') },
        inLanguage: 'en-US',
      },
      {
        '@type': 'HomeAndConstructionBusiness',
        '@id': id('business'),
        name: SITE.name,
        legalName: SITE.legalName,
        alternateName: SITE.alternateNames,
        url: `${SITE.url}/`,
        telephone: '+1-386-287-8579',
        description: SITE.description,
        slogan: 'Built on craftsmanship, backed by over a decade of results.',
        foundingDate: SITE.foundingDate,
        founder: { '@type': 'Person', '@id': id('founder'), name: SITE.founder },
        logo: { '@type': 'ImageObject', '@id': id('logo'), url: absolute(SITE.logo), width: 1024, height: 1024, caption: SITE.legalName },
        image: [absolute(SITE.shareImage), { '@id': id('logo') }],
        address: { '@type': 'PostalAddress', addressLocality: HOME_BASE.city, addressRegion: HOME_BASE.stateCode, addressCountry: 'US' },
        areaServed: [
          ...AREA_SERVED,
          ...REGIONS.filter(r => !STATES.includes(r.name)).map(r => (r.homeBase
            ? { '@type': 'City', name: HOME_BASE.city, containedInPlace: { '@type': 'State', name: HOME_BASE.state } }
            : { '@type': 'AdministrativeArea', name: r.name, containedInPlace: { '@type': 'State', name: r.state } })),
        ],
        priceRange: '$$',
        contactPoint: { '@type': 'ContactPoint', telephone: '+1-386-287-8579', contactType: 'customer service', availableLanguage: 'English', areaServed: STATES.map(s => STATE_CODES[s]) },
        knowsAbout: ['hardwood flooring', 'laminate flooring', 'tile installation', 'natural stone flooring', 'bathroom remodeling', 'custom tile showers', 'kitchen renovation', 'cabinet installation', 'tile backsplashes', 'enclosed patios', 'roofing', 'handyman services'],
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Home Improvement Services',
          itemListElement: services.map(sv => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', '@id': `${SITE.url}/services/${sv.slug}#service`, name: sv.title, url: `${SITE.url}/services/${sv.slug}` } })),
        },
        ...(SITE.sameAs.length ? { sameAs: SITE.sameAs } : {}),
      },
    ],
  }
}

// Home › (parent ›) page
export function breadcrumbs(path) {
  const page = PAGES[path]
  if (!page?.crumb || path === '/') return null
  const trail = ['/', ...(page.parent ? [page.parent] : []), path]
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((p, i) => ({ '@type': 'ListItem', position: i + 1, name: PAGES[p].crumb, item: absolute(p === '/' ? '/' : p) })),
  }
}
