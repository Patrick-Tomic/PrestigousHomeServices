// Where the business is based and where it works. Single source of truth for
// the visible service-area text, the Service Areas pages, and the structured
// data (src/seo.js, scripts/prerender.mjs), so they always agree.
//
// Only verified information goes here. The business is based in Lake City,
// Florida (a service-area business: no street address is published) and
// works across Florida, Georgia and Texas.
//
// Adding a location page: give a region `page: true` plus real, specific
// details (`cities` it actually serves, `details` about work there). Its page
// at /service-areas/<slug> is then built, linked and added to the sitemap.
// Regions without `page: true` appear as sections on /service-areas only,
// which avoids thin, near-duplicate city pages.

export const HOME_BASE = {
  city: 'Lake City',
  state: 'Florida',
  stateCode: 'FL',
  label: 'Lake City, FL',
}

export const STATES = ['Florida', 'Georgia', 'Texas']

// "Florida, Georgia & Texas"
export const TERRITORY = `${STATES.slice(0, -1).join(', ')} & ${STATES[STATES.length - 1]}`

export const REGIONS = [
  {
    slug: 'lake-city-fl',
    name: 'Lake City, FL',
    state: 'Florida',
    page: true,
    homeBase: true,
    summary:
      'Prestigious Home Services is based in Lake City, Florida. Founded by Kruno Tomic in 2011, we’re a licensed and insured flooring and home improvement contractor, and Lake City is home base for the work we do across Florida, Georgia and Texas.',
    details: [
      'Free estimates for homeowners in Lake City and the surrounding area.',
      'Flooring installation, bathroom remodels, kitchen updates, enclosed patios, roofing and handyman services.',
      'Kruno Tomic personally walks every client through the process.',
    ],
  },
  {
    slug: 'daytona',
    name: 'Daytona Beach area',
    state: 'Florida',
    summary: 'We take on projects in the Daytona Beach area on Florida’s east coast.',
  },
  {
    slug: 'florida-panhandle',
    name: 'Florida Panhandle',
    state: 'Florida',
    summary: 'Our Florida service area reaches west across the Panhandle.',
  },
  {
    slug: 'central-south-florida',
    name: 'Central & South Florida',
    state: 'Florida',
    summary: 'We also work farther south in Florida.',
  },
  {
    slug: 'georgia',
    name: 'Georgia',
    state: 'Georgia',
    summary: 'We serve homeowners in Georgia.',
  },
  {
    slug: 'texas',
    name: 'Texas',
    state: 'Texas',
    summary: 'We serve homeowners in Texas.',
  },
]

export const regionPages = REGIONS.filter(r => r.page)
