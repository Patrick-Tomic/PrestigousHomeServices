import { Helmet } from 'react-helmet-async'
import { PAGES, SITE, absolute, breadcrumbs } from '../seo'

// Per-page title, description, canonical, social tags and breadcrumbs, all
// from src/seo.js. `jsonLd` adds page-specific structured data.
export default function Seo({ path, jsonLd }) {
  const page = PAGES[path]
  const url = absolute(path)
  const image = absolute(SITE.shareImage)
  const crumbs = breadcrumbs(path)

  return (
    <Helmet>
      <title>{page.title}</title>
      {page.description && <meta name="description" content={page.description} />}
      <meta name="robots" content={page.noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large'} />
      {path !== '/404' && <link rel="canonical" href={url} />}

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE.name} />
      <meta property="og:title" content={page.title} />
      {page.description && <meta property="og:description" content={page.description} />}
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta name="twitter:title" content={page.title} />
      {page.description && <meta name="twitter:description" content={page.description} />}

      {crumbs && <script type="application/ld+json">{JSON.stringify(crumbs)}</script>}
      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </Helmet>
  )
}
