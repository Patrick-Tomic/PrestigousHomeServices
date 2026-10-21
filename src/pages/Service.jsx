import { Link, useParams } from 'react-router-dom'
import Seo from '../components/Seo'
import { PhotoGrid } from '../components/ProjectGallery'
import { ServiceIcon } from '../components/ServiceCards'
import { useGalleryPhotos } from '../data/gallery'
import { services } from '../data/services'
import { AREA_SERVED, SITE } from '../seo'
import NotFound from './NotFound'
import { HOME_BASE, TERRITORY } from '../data/areas'

// Structured data for one service, tied to the business in index.html.
const serviceLd = (sv, photos) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': `${SITE.url}/services/${sv.slug}#service`,
  name: sv.title,
  serviceType: sv.title,
  description: `${sv.intro} ${sv.description}`,
  url: `${SITE.url}/services/${sv.slug}`,
  provider: { '@id': `${SITE.url}/#business` },
  areaServed: AREA_SERVED,
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: sv.title,
    itemListElement: sv.includes.map(item => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: item } })),
  },
  ...(photos.length ? { image: photos.slice(0, 6).map(p => (p.src.startsWith('http') ? p.src : SITE.url + p.src)) } : {}),
})

export default function Service() {
  const { slug } = useParams()
  const sv = services.find(s => s.slug === slug)
  const allPhotos = useGalleryPhotos()
  if (!sv) return <NotFound />

  const photos = allPhotos.filter(p => p.category === sv.category)
  const others = services.filter(s => s.slug !== sv.slug)

  return (
    <>
      <Seo path={`/services/${sv.slug}`} jsonLd={serviceLd(sv, photos)} />

      {/* Header */}
      <section className="bg-ink text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-red-600" aria-hidden="true" />
        <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
          <nav aria-label="Breadcrumb" className="text-sm text-stone-400 mb-6">
            <ol className="flex flex-wrap gap-2">
              <li><Link to="/" className="hover:text-white">Home</Link></li>
              <li aria-hidden="true">/</li>
              <li><Link to="/work" className="hover:text-white">Our Work</Link></li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-stone-200">{sv.title}</li>
            </ol>
          </nav>
          <div className="flex items-start gap-4">
            <span className="hidden sm:flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 text-oak-300 ring-1 ring-white/15 shrink-0">
              <ServiceIcon slug={sv.slug} />
            </span>
            <div>
              <h1 className="font-display text-4xl md:text-6xl font-semibold leading-tight mb-3">{sv.title}</h1>
              <p className="text-oak-300 text-xs md:text-sm font-semibold tracking-[0.2em] uppercase">{sv.detail}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Overview + what's included */}
      <section className="bg-cream py-14 md:py-20">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-5 gap-10 md:gap-14 items-start">
          <div className="md:col-span-3">
            <div className="space-y-5 text-stone-700 text-lg leading-relaxed">
              <p className="text-stone-900 font-medium text-xl leading-relaxed">{sv.intro}</p>
              <p>{sv.description}</p>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link
                to={`/contact?service=${encodeURIComponent(sv.estimate)}`}
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-3.5 rounded-full tracking-wide transition-colors"
              >
                Get a free estimate <span aria-hidden="true">→</span>
              </Link>
              <a href={`tel:${SITE.phone}`} className="font-semibold text-stone-800 hover:text-red-700">
                or call {SITE.phoneDisplay}
              </a>
            </div>
          </div>

          <aside className="md:col-span-2 flex flex-col gap-4">
            <div className="border-l-4 border-red-600 bg-white rounded-r-xl ring-1 ring-stone-200/70 p-6">
              <h2 className="text-red-700 font-bold tracking-widest text-xs uppercase mb-4">What’s included</h2>
              <ul className="space-y-3">
                {sv.includes.map(item => (
                  <li key={item} className="flex gap-3 text-stone-800">
                    <span className="text-red-600 font-bold" aria-hidden="true">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl bg-white ring-1 ring-stone-200/70 p-5 text-sm text-stone-700">
              <p className="font-semibold text-stone-900 mb-2">Why homeowners choose us</p>
              <ul className="space-y-1.5">
                <li>Based in {HOME_BASE.label}, serving <Link to="/service-areas" className="font-semibold text-red-700 hover:underline">{TERRITORY}</Link></li>
                <li>Licensed &amp; insured since {SITE.foundingDate}</li>
                <li>Founder {SITE.founder} walks you through every step</li>
                <li>Free estimates, no obligation</li>
              </ul>
            </div>
            {sv.designer && (
              <Link to={`/design?room=${sv.designer}`} className="rounded-xl bg-ink text-white p-5 hover:bg-stone-800 transition-colors">
                <span className="block font-semibold">Plan it in 3D →</span>
                <span className="block text-sm text-stone-300 mt-1">Try sizes, flooring and finishes in our room designer, then send it with your request.</span>
              </Link>
            )}
          </aside>
        </div>
      </section>

      {/* Photos */}
      <section className="bg-white py-14 md:py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-stone-900 mb-2">
            {sv.title} projects
          </h2>
          <p className="text-stone-600 mb-8">Photos from completed jobs.</p>
          {photos.length > 0 ? (
            <PhotoGrid photos={photos} />
          ) : (
            <div className="border-2 border-dashed border-stone-200 rounded-xl py-12 px-6 text-center">
              <p className="text-stone-600">Project photos coming soon.</p>
              <a href={`tel:${SITE.phone}`} className="text-red-700 hover:text-red-600 font-semibold text-sm mt-1 inline-block">
                Call {SITE.phoneDisplay} to ask about past work
              </a>
            </div>
          )}
        </div>
      </section>

      {/* Other services (internal links) */}
      <section className="bg-cream py-14 md:py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-stone-900 mb-6">Other services</h2>
          <ul className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {others.map(o => (
              <li key={o.slug}>
                <Link to={`/services/${o.slug}`} className="flex h-full flex-col gap-2 rounded-xl bg-white ring-1 ring-stone-200 hover:ring-red-600 p-4 transition-colors">
                  <span className="text-oak-600"><ServiceIcon slug={o.slug} /></span>
                  <span className="font-semibold text-stone-900">{o.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  )
}
