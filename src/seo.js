// Single source of truth for search and social metadata. Used by the <Seo>
// component at runtime and by scripts/prerender.mjs at build time, which
// writes a real HTML file per route so every crawler (and link previews)
// sees the right title, description and page text without running JS.
//
// Keep the business name, phone and founder identical everywhere: with many
// "Prestige…" companies around, consistency is what tells search engines
// this is one distinct business.

export const SITE = {
  url: 'https://prestigioushomeservices.com',
  name: 'Prestigious Home Services',
  legalName: 'Prestigious Home Services, LLC',
  alternateNames: ['Prestigious Home Services LLC', 'prestigioushomeservices.com'],
  founder: 'Kruno Tomic',
  foundingDate: '2011',
  phone: '+13862878579',
  phoneDisplay: '(386) 287-8579',
  logo: '/logo.png',
  description:
    'Licensed and insured flooring and home improvement contractor founded by Kruno Tomic in 2011. Hardwood, tile, laminate, bathroom remodels, kitchen updates, enclosed patios, roofing and handyman work. Free estimates.',
  // Profiles that belong to this business (Google Business Profile, Facebook,
  // Instagram, Yelp, BBB, Houzz…). Adding them is one of the strongest ways
  // to separate this company from similarly named ones.
  sameAs: [],
}

const brand = SITE.legalName

export const PAGES = {
  '/': {
    title: `${brand} | Flooring & Home Improvement Contractor`,
    description: SITE.description,
    h1: 'Prestigious Home Services',
    intro: 'Trusted flooring and home improvement contractor serving across the USA. Built on craftsmanship, backed by over a decade of results. Founded by Kruno Tomic in 2011 — licensed, insured, and free estimates.',
    crumb: 'Home',
  },
  '/work': {
    title: `Our Work: Flooring, Bathrooms, Kitchens & More | ${brand}`,
    description: 'Flooring, bathroom remodels, kitchen updates, enclosed patios, roofing and handyman services by Prestigious Home Services — with photos of completed projects. Licensed and insured since 2011. Free estimates.',
    h1: 'Our Work',
    intro: 'Flooring, bathroom remodels, kitchen updates, enclosed patios, roofing and handyman services by Prestigious Home Services, with photos of completed projects.',
    crumb: 'Our Work',
  },
  '/design': {
    title: `Design Your Room in 3D | ${brand}`,
    description: 'Plan your project in 3D with Prestigious Home Services: choose a room, set the size, and preview hardwood, laminate, tile or natural stone flooring, showers, cabinets and more. Then send it for a free estimate.',
    h1: 'Design Your Room',
    intro: 'Pick a room, set the size, and try different floors, showers, cabinets and finishes in 3D. When it looks right, send it to Prestigious Home Services for a free estimate.',
    crumb: 'Design Your Room',
  },
  '/contact': {
    title: `Contact & Free Estimates | ${brand}`,
    description: 'Get a free estimate from Prestigious Home Services, LLC. Call or text Kruno Tomic at (386) 287-8579. Licensed and insured flooring and home improvement contractor.',
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

export const absolute = (path) => (path.startsWith('http') ? path : SITE.url + path)

export function breadcrumbs(path) {
  const page = PAGES[path]
  if (!page?.crumb || path === '/') return null
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: PAGES['/'].crumb, item: SITE.url + '/' },
      { '@type': 'ListItem', position: 2, name: page.crumb, item: absolute(path) },
    ],
  }
}
