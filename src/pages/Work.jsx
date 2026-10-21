import { useState, useEffect, useRef } from 'react'
import Seo from '../components/Seo'
import { Link, useLocation } from 'react-router-dom'
import { PhotoGrid } from '../components/ProjectGallery'
import { useGalleryPhotos } from '../data/gallery'
import { services } from '../data/services'
import { AREA_SERVED, SITE } from '../seo'

// Each service, tied to the business entity declared in index.html.
const servicesLd = {
  '@context': 'https://schema.org',
  '@graph': services.map(sv => ({
    '@type': 'Service',
    name: sv.title,
    serviceType: sv.title,
    description: sv.body,
    url: `${SITE.url}/work#${sv.slug}`,
    provider: { '@id': `${SITE.url}/#business` },
    areaServed: AREA_SERVED,
  })),
}

function useReveal(threshold = 0.1) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, visible]
}

function Reveal({ children, className = '' }) {
  const [ref, visible] = useReveal()
  return (
    <div
      ref={ref}
      className={`${className} transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
    >
      {children}
    </div>
  )
}

// Highlights the service section currently in view.
function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0])
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id) }),
      { rootMargin: '-45% 0px -50% 0px' }
    )
    ids.forEach(id => { const el = document.getElementById(id); if (el) obs.observe(el) })
    return () => obs.disconnect()
  }, [ids])
  return active
}

const serviceIds = services.map(s => s.slug)

function ServiceSection({ service, photos, shaded }) {
  return (
    <section id={service.slug} className={`py-20 md:py-24 scroll-mt-32 ${shaded ? 'bg-cream' : 'bg-white'}`}>
      <div className="max-w-6xl mx-auto px-6">
        <Reveal className="grid md:grid-cols-5 gap-10 md:gap-14 items-start">
          <div className="md:col-span-3">
            <p className="font-display text-oak-600 font-semibold text-sm tabular-nums mb-3">{service.num}</p>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-stone-900 leading-tight mb-3">{service.title}</h2>
            <p className="text-xs text-oak-600 font-semibold tracking-widest uppercase mb-8">{service.detail}</p>
            <div className="space-y-5 text-stone-600 text-lg leading-relaxed">
              <p className="text-stone-800 font-medium">{service.intro}</p>
              <p>{service.description}</p>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link
                to={`/contact?service=${encodeURIComponent(service.estimate)}`}
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-3 rounded-full text-sm tracking-wide transition-colors group"
              >
                Get a free estimate
                <span className="group-hover:translate-x-1 transition-transform inline-block" aria-hidden="true">→</span>
              </Link>
              <Link to={`/services/${service.slug}`} className="text-sm font-semibold text-stone-700 hover:text-red-700 underline-offset-4 hover:underline">
                More about {service.title.toLowerCase()} →
              </Link>
              {service.designer && (
                <Link to={`/design?room=${service.designer}`} className="text-sm font-semibold text-stone-700 hover:text-red-700 underline-offset-4 hover:underline">
                  Design it in 3D →
                </Link>
              )}
            </div>
          </div>

          <div className="md:col-span-2 border-l-4 border-red-600 bg-white rounded-r-xl ring-1 ring-stone-200/70 p-6 md:mt-12">
            <p className="text-red-700 font-bold tracking-widest text-xs uppercase mb-4">What We Do</p>
            <ul className="space-y-3">
              {service.includes.map(item => (
                <li key={item} className="flex gap-3 text-stone-700">
                  <span className="text-red-600 font-bold" aria-hidden="true">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <div className="mt-14">
          <p className="text-stone-900 font-bold mb-4">
            Recent {service.title.toLowerCase()} projects
          </p>
          {photos.length > 0 ? (
            <PhotoGrid photos={photos} />
          ) : (
            <div className="border-2 border-dashed border-stone-200 rounded-xl py-12 px-6 text-center">
              <p className="text-stone-600">Project photos coming soon.</p>
              <a href="tel:+13862878579" className="text-red-700 hover:text-red-600 font-semibold text-sm mt-1 inline-block">
                Call (386) 287-8579 to ask about past work
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default function Work() {
  const [headerRef, headerVisible] = useReveal()
  const photos = useGalleryPhotos()
  const active = useActiveSection(serviceIds)
  const { hash } = useLocation()

  // Links like /work#roofing land on that service.
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView()
  }, [hash, photos.length])

  return (
    <>
      <Seo path="/work" jsonLd={servicesLd} />

      {/* Page header */}
      <section className="bg-ink pt-20 pb-14 md:pt-24 md:pb-16 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-red-600" aria-hidden="true" />
        <div
          ref={headerRef}
          className={`max-w-6xl mx-auto px-6 transition-all duration-700 ${headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <p className="text-oak-300 font-semibold tracking-[0.3em] uppercase text-xs mb-4">Services &amp; Projects</p>
          <h1 className="font-display text-5xl md:text-7xl font-semibold text-white leading-none tracking-tight mb-6">
            Our Work
          </h1>
          <p className="text-stone-400 text-lg max-w-2xl leading-relaxed">
            A closer look at everything we do, with photos from real projects. Every job — big or
            small — gets the same care, and every estimate is free.
          </p>
        </div>
      </section>

      {/* Service jump links */}
      <nav className="bg-white border-b border-stone-100 sticky top-16 z-40" aria-label="Services">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-1 overflow-x-auto py-3 scrollbar-hide">
            {services.map(s => (
              <a
                key={s.slug}
                href={`#${s.slug}`}
                aria-current={active === s.slug ? 'true' : undefined}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide transition-colors ${
                  active === s.slug ? 'bg-red-600 text-white' : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                {s.title}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {services.map((service, i) => (
        <ServiceSection
          key={service.slug}
          service={service}
          photos={photos.filter(p => p.category === service.category)}
          shaded={i % 2 === 1}
        />
      ))}

      {/* CTA */}
      <section className="bg-red-700 py-20 text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-white leading-tight mb-4">
            Like what you see?
          </h2>
          <p className="text-red-100 text-lg mb-10 max-w-xl mx-auto">
            Get in touch for a free estimate on your project.
          </p>
          <Link
            to="/contact"
            className="bg-ink hover:bg-stone-800 text-white font-bold px-10 py-5 rounded-full text-lg tracking-wide transition-colors inline-block"
          >
            Get a Free Estimate
          </Link>
        </div>
      </section>
    </>
  )
}
