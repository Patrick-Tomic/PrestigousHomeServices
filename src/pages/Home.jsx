import { Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { Helmet } from 'react-helmet-async'

const services = [
  {
    num: '01',
    title: 'Flooring Installation',
    body: 'We install all major flooring types — laminate, hardwood, tile, and natural stone. Whether you\'re refreshing a single room or updating your entire home, we\'ll help you choose the right material and deliver a flawless installation.',
    detail: 'Laminate · Hardwood · Tile · Natural Stone',
  },
  {
    num: '02',
    title: 'Bathroom Remodels',
    body: 'A bathroom remodel is one of the best investments you can make in your home. We handle tile work, fixtures, vanities, and complete custom bathroom builds. Tell us your vision and we\'ll bring it to life.',
    detail: 'Tile Work · Fixtures · Vanities · Custom Builds',
  },
  {
    num: '03',
    title: 'Kitchen Updates',
    body: 'From cabinet installation to new flooring and backsplash, we help transform kitchens into spaces you\'ll love spending time in. Clean finishes, solid work, on schedule.',
    detail: 'Cabinets · Flooring · Backsplash',
  },
  {
    num: '04',
    title: 'Enclosed Patios',
    body: 'Extend your living space without leaving home. We build enclosed patios designed to handle the South\'s climate while giving you a comfortable, functional area year-round.',
    detail: 'Custom Enclosures · Southern-Climate Rated · Year-Round Use',
  },
  {
    num: '05',
    title: 'Roofing',
    body: 'We offer roofing services to keep your home protected. Contact us for an assessment and free estimate.',
    detail: 'Assessment · Repair · Replacement',
  },
  {
    num: '06',
    title: 'Handyman Services',
    body: 'Got a project that doesn\'t fit neatly into a category? We do that too. If it\'s in or around your home, give us a call and we\'ll let you know what we can do.',
    detail: 'Repairs · Installs · Odd Jobs',
  },
]

function useReveal(threshold = 0.12) {
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

function Reveal({ children, delay = 0, className = '' }) {
  const [ref, visible] = useReveal()
  return (
    <div
      ref={ref}
      className={`${className} ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      style={{ transition: `opacity 650ms ease ${delay}ms, transform 650ms ease ${delay}ms` }}
    >
      {children}
    </div>
  )
}

function ServiceRow({ service, index, isOpen, onToggle }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.05 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`border-b border-zinc-100 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      style={{ transition: `opacity 600ms ease ${index * 90}ms, transform 600ms ease ${index * 90}ms` }}
    >
      {/* Accordion trigger */}
      <button
        onClick={onToggle}
        className="w-full flex items-start gap-6 md:gap-10 py-8 text-left group cursor-pointer"
      >
        <span className={`font-black text-sm tabular-nums pt-1.5 min-w-[2rem] transition-colors duration-300 ${isOpen ? 'text-red-600' : 'text-red-600/40 group-hover:text-red-600/70'}`}>
          {service.num}
        </span>
        <div className="flex-1 min-w-0">
          <p className={`font-black text-2xl md:text-3xl leading-tight transition-colors duration-300 ${isOpen ? 'text-red-600' : 'text-zinc-900 group-hover:text-zinc-600'}`}>
            {service.title}
          </p>
          <p className="text-xs text-zinc-400 font-semibold tracking-widest uppercase mt-2">
            {service.detail}
          </p>
        </div>
        <span
          className={`text-3xl font-thin leading-none mt-1 transition-all duration-300 select-none ${isOpen ? 'text-red-600 rotate-45' : 'text-zinc-300 group-hover:text-zinc-500'}`}
          aria-hidden="true"
        >
          +
        </span>
      </button>

      {/* Expandable body — CSS grid trick for smooth height animation */}
      <div
        className="grid"
        style={{
          gridTemplateRows: isOpen ? '1fr' : '0fr',
          transition: 'grid-template-rows 420ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div className="overflow-hidden">
          <div className="pb-10 pl-14 md:pl-20">
            <p className="text-zinc-600 text-lg leading-relaxed mb-6 max-w-2xl">{service.body}</p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 text-zinc-900 font-bold hover:text-red-600 transition-colors text-sm tracking-wide group/link"
            >
              GET A FREE ESTIMATE
              <span className="group-hover/link:translate-x-1 transition-transform inline-block">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const [openIndex, setOpenIndex] = useState(null)
  const toggle = (i) => setOpenIndex(prev => prev === i ? null : i)

  return (
    <>
      <Helmet>
        <title>Prestigious Home Services, LLC. | Flooring & Home Improvement Contractor</title>
        <meta name="description" content="Licensed and insured flooring and home improvement contractor founded by Kruno Tomic in 2011. Hardwood, tile, laminate, bathroom remodels, kitchen updates, roofing & more. Nationwide service. Free estimates." />
        <link rel="canonical" href="https://prestigioushomeservices.com/" />
      </Helmet>

      {/* Hero — no reveal, it's the entry point */}
      <section className="relative min-h-[88vh] flex items-end bg-zinc-950 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(
              -55deg, transparent, transparent 60px,
              rgba(255,255,255,0.018) 60px, rgba(255,255,255,0.018) 61px
            )`
          }}
          aria-hidden="true"
        />
        <div
          className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(220,38,38,0.18) 0%, transparent 70%)' }}
          aria-hidden="true"
        />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-zinc-950 to-transparent" aria-hidden="true" />
        <div className="absolute top-0 left-0 w-1.5 h-full bg-red-600" aria-hidden="true" />

        <div className="relative max-w-6xl mx-auto px-6 pb-20 md:pb-28 w-full">
          <p className="text-red-500 font-bold tracking-[0.25em] uppercase text-xs mb-6">
            Licensed &bull; Insured &bull; Since 2011
          </p>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[0.95] tracking-tight max-w-3xl mb-8">
            Prestigious<br />
            <span className="text-red-500">Home</span><br />
            Services.
          </h1>
          <p className="text-zinc-300 text-lg md:text-xl max-w-lg leading-relaxed mb-10">
            Trusted flooring and home improvement contractor serving across the USA.
            Built on craftsmanship, backed by over a decade of results.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="tel:+13862878579"
              className="bg-red-600 hover:bg-red-500 text-white font-black px-8 py-4 text-base tracking-wide transition-colors"
            >
              CALL (386) 287-8579
            </a>
            <Link
              to="/contact"
              className="border-2 border-white/40 hover:border-white text-white font-bold px-8 py-4 text-base tracking-wide transition-colors"
            >
              FREE ESTIMATE →
            </Link>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="bg-white py-24">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-5 gap-12 items-start">
          <Reveal className="md:col-span-3">
            <p className="text-red-600 font-bold tracking-widest text-xs uppercase mb-4">Who We Are</p>
            <h2 className="text-4xl md:text-5xl font-black text-zinc-900 leading-tight mb-8">
              A contractor<br />you can trust.
            </h2>
            <div className="space-y-5 text-zinc-600 text-lg leading-relaxed">
              <p>
                My name is <span className="font-semibold text-zinc-800">Kruno Tomic</span>, and
                I founded Prestigious Home Services in 2011 with one goal: to be the kind of
                contractor I'd want working in my own home. Over a decade later, that standard
                hasn't changed — top-quality workmanship at competitive rates, without cutting corners.
              </p>
              <p>
                We're fully licensed and insured, and I personally walk every client through the
                process so there are never any surprises. Whether it's a floor upgrade or a full
                bathroom transformation, every job gets the same care and attention.
              </p>
            </div>
          </Reveal>

          <div className="md:col-span-2 flex flex-col gap-6 md:pt-16">
            {[
              { stat: '14+', label: 'Years in Business' },
              { stat: '100%', label: 'Licensed & Insured' },
              { stat: 'FREE', label: 'Estimates' },
            ].map(({ stat, label }, i) => (
              <Reveal key={label} delay={i * 120}>
                <div className="border-l-4 border-red-600 pl-6">
                  <p className="text-5xl font-black text-zinc-900">{stat}</p>
                  <p className="text-zinc-500 font-semibold mt-1">{label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Services header */}
      <section className="bg-zinc-950 pt-24 pb-0 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-red-600" aria-hidden="true" />
        <Reveal className="max-w-6xl mx-auto px-6 pb-16">
          <p className="text-red-500 font-bold tracking-[0.25em] uppercase text-xs mb-4">What We Offer</p>
          <h2 className="text-5xl md:text-7xl font-black text-white leading-none tracking-tight mb-6">
            Our Services
          </h2>
          <p className="text-zinc-400 text-lg max-w-2xl leading-relaxed">
            From the floors beneath your feet to the tile on your walls, we handle it all.
            Every job is backed by our commitment to quality craftsmanship and customer satisfaction.
          </p>
        </Reveal>
      </section>

      {/* Service accordion rows */}
      <section className="bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="border-t border-zinc-100">
            {services.map((service, i) => (
              <ServiceRow
                key={service.num}
                service={service}
                index={i}
                isOpen={openIndex === i}
                onToggle={() => toggle(i)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <Reveal>
        <section className="bg-red-600 py-20 text-center">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4">
              Ready to start your project?
            </h2>
            <p className="text-red-100 text-lg mb-10 max-w-xl mx-auto">
              Free estimates, no pressure. Call or text us and we'll walk you through every step.
            </p>
            <a
              href="tel:+13862878579"
              className="bg-zinc-950 hover:bg-zinc-800 text-white font-black px-10 py-5 text-lg tracking-wide transition-colors inline-block"
            >
              CALL (386) 287-8579
            </a>
          </div>
        </section>
      </Reveal>
    </>
  )
}
