import { Link, useParams } from 'react-router-dom'
import Seo from '../components/Seo'
import { ServiceIcon } from '../components/ServiceCards'
import { HOME_BASE, REGIONS, STATES, TERRITORY, regionPages } from '../data/areas'
import { services } from '../data/services'
import { SITE } from '../seo'
import NotFound from './NotFound'

function Header({ crumbs, title, eyebrow, children }) {
  return (
    <section className="bg-ink text-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1.5 h-full bg-red-600" aria-hidden="true" />
      <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
        <nav aria-label="Breadcrumb" className="text-sm text-stone-400 mb-6">
          <ol className="flex flex-wrap gap-2">
            {crumbs.map(([to, label], i) => (
              <li key={label} className="flex gap-2">
                {i > 0 && <span aria-hidden="true">/</span>}
                {to ? <Link to={to} className="hover:text-white">{label}</Link> : <span aria-current="page" className="text-stone-200">{label}</span>}
              </li>
            ))}
          </ol>
        </nav>
        <p className="text-oak-300 font-semibold tracking-[0.3em] uppercase text-xs mb-4">{eyebrow}</p>
        <h1 className="font-display text-4xl md:text-6xl font-semibold leading-tight mb-4">{title}</h1>
        <div className="text-stone-300 text-lg max-w-2xl leading-relaxed">{children}</div>
      </div>
    </section>
  )
}

function ServicesGrid({ heading }) {
  return (
    <section className="bg-white py-14 md:py-16">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="font-display text-2xl md:text-3xl font-semibold text-stone-900 mb-6">{heading}</h2>
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {services.map(sv => (
            <li key={sv.slug}>
              <Link to={`/services/${sv.slug}`} className="flex h-full gap-4 rounded-xl bg-cream ring-1 ring-stone-200 hover:ring-red-600 p-5 transition-colors">
                <span className="text-oak-600 shrink-0"><ServiceIcon slug={sv.slug} /></span>
                <span>
                  <span className="block font-semibold text-stone-900">{sv.title}</span>
                  <span className="block text-sm text-stone-600 mt-1">{sv.detail}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function EstimateBand() {
  return (
    <section className="bg-red-700 py-16 text-center">
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="font-display text-3xl md:text-4xl font-semibold text-white mb-3">Not sure if we cover your area?</h2>
        <p className="text-red-50 text-lg mb-8">Call or text us. Estimates are always free.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <a href={`tel:${SITE.phone}`} className="bg-ink hover:bg-stone-800 text-white font-bold px-8 py-4 rounded-full">Call {SITE.phoneDisplay}</a>
          <Link to="/contact" className="bg-white/10 hover:bg-white/20 ring-1 ring-inset ring-white/50 text-white font-bold px-8 py-4 rounded-full">Send a message</Link>
        </div>
      </div>
    </section>
  )
}

// /service-areas — where we're based and every region we work in.
export function ServiceAreas() {
  const byState = STATES.map(state => ({ state, regions: REGIONS.filter(r => r.state === state) }))
  return (
    <>
      <Seo path="/service-areas" />
      <Header crumbs={[['/', 'Home'], [null, 'Service Areas']]} title="Service Areas" eyebrow={`Based in ${HOME_BASE.label}`}>
        <p>
          Prestigious Home Services is based in {HOME_BASE.city}, {HOME_BASE.state}, and takes on flooring and
          home improvement projects across {TERRITORY}: from the Daytona area to the Panhandle and farther south in Florida.
        </p>
      </Header>

      <section className="bg-cream py-14 md:py-20">
        <div className="max-w-6xl mx-auto px-6 flex flex-col gap-12">
          {byState.map(({ state, regions }) => (
            <div key={state}>
              <h2 className="font-display text-3xl font-semibold text-stone-900 mb-5">{state}</h2>
              <ul className="grid md:grid-cols-2 gap-4">
                {regions.map(r => (
                  <li key={r.slug} id={r.slug} className={`rounded-2xl bg-white ring-1 p-6 scroll-mt-24 ${r.homeBase ? 'ring-red-600/40 md:col-span-2' : 'ring-stone-200'}`}>
                    {r.name !== state && (
                      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                        <h3 className="font-display text-xl font-semibold text-stone-900">{r.name}</h3>
                        {r.homeBase && <span className="text-xs font-bold uppercase tracking-wider text-red-700">Home base</span>}
                      </div>
                    )}
                    <p className="text-stone-700">{r.summary}</p>
                    {r.page && (
                      <Link to={`/service-areas/${r.slug}`} className="inline-block mt-3 font-semibold text-red-700 hover:underline">
                        Flooring &amp; home improvement in {r.name} →
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <ServicesGrid heading="What we do across our service area" />
      <EstimateBand />
    </>
  )
}

// /service-areas/<slug> — a region with its own page (see src/data/areas.js).
export function ServiceArea() {
  const { slug } = useParams()
  const r = regionPages.find(x => x.slug === slug)
  if (!r) return <NotFound />

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `Flooring & home improvement in ${r.name}`,
    serviceType: 'Flooring and home improvement contractor',
    url: `${SITE.url}/service-areas/${r.slug}`,
    provider: { '@id': `${SITE.url}/#business` },
    areaServed: r.homeBase
      ? { '@type': 'City', name: HOME_BASE.city, containedInPlace: { '@type': 'State', name: HOME_BASE.state } }
      : { '@type': 'AdministrativeArea', name: r.name, containedInPlace: { '@type': 'State', name: r.state } },
  }
  const others = REGIONS.filter(x => x.slug !== r.slug)

  return (
    <>
      <Seo path={`/service-areas/${r.slug}`} jsonLd={ld} />
      <Header
        crumbs={[['/', 'Home'], ['/service-areas', 'Service Areas'], [null, r.name]]}
        title={r.homeBase ? `Flooring & Home Improvement in ${r.name}` : r.name}
        eyebrow={r.homeBase ? 'Our home base' : r.state}
      >
        <p>{r.summary}</p>
      </Header>

      <section className="bg-cream py-14 md:py-20">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-5 gap-10 items-start">
          <div className="md:col-span-3">
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-stone-900 mb-5">
              {r.homeBase ? `Working with us in ${HOME_BASE.city}` : `Working with us in ${r.name}`}
            </h2>
            <ul className="space-y-3 text-stone-800 text-lg">
              {(r.details || []).map(d => (
                <li key={d} className="flex gap-3">
                  <span className="text-red-600 font-bold" aria-hidden="true">✓</span>
                  {d}
                </li>
              ))}
            </ul>
            {r.cities?.length > 0 && (
              <p className="mt-6 text-stone-700">Communities we serve include {r.cities.join(', ')}.</p>
            )}
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link to="/contact" className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-3.5 rounded-full">
                Get a free estimate <span aria-hidden="true">→</span>
              </Link>
              <a href={`tel:${SITE.phone}`} className="font-semibold text-stone-800 hover:text-red-700">or call {SITE.phoneDisplay}</a>
            </div>
          </div>
          <aside className="md:col-span-2 rounded-2xl bg-white ring-1 ring-stone-200 p-6">
            <h2 className="font-semibold text-stone-900 mb-3">We also serve</h2>
            <ul className="space-y-1.5 text-stone-700">
              {others.map(o => (
                <li key={o.slug}>
                  <Link to={o.page ? `/service-areas/${o.slug}` : `/service-areas#${o.slug}`} className="hover:text-red-700 hover:underline">
                    {o.name}{!STATES.includes(o.name) && o.state !== HOME_BASE.state ? `, ${o.state}` : ''}
                  </Link>
                </li>
              ))}
            </ul>
            <Link to="/service-areas" className="inline-block mt-4 text-sm font-semibold text-red-700 hover:underline">All service areas →</Link>
          </aside>
        </div>
      </section>

      <ServicesGrid heading={`Our services in ${r.name}`} />
      <EstimateBand />
    </>
  )
}
