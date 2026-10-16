import { Helmet } from 'react-helmet-async'
import ProjectGallery from '../components/ProjectGallery'
import Hero from '../components/hero/Hero'
import TrustStrip from '../components/TrustStrip'
import ServiceCards from '../components/ServiceCards'
import Reveal from '../components/Reveal'
import { services } from '../data/services'
import imgFloor from '../assets/floor.jpg'

export default function Home() {
  return (
    <>
      <Helmet>
        <title>Prestigious Home Services, LLC. | Flooring & Home Improvement Contractor</title>
        <meta name="description" content="Licensed and insured flooring and home improvement contractor founded by Kruno Tomic in 2011. Hardwood, tile, laminate, bathroom remodels, kitchen updates, roofing & more. Nationwide service. Free estimates." />
        <link rel="canonical" href="https://prestigioushomeservices.com/" />
      </Helmet>

      {/* Hero — 3D floor scene with the headline overlaid */}
      <Hero />

      {/* Trust strip */}
      <TrustStrip />

      {/* About */}
      <section className="bg-cream py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-5 gap-12 md:gap-16 items-center">
          <Reveal className="md:col-span-3">
            <p className="text-red-600 font-semibold tracking-[0.25em] text-xs uppercase mb-4">Who We Are</p>
            <h2 className="font-display text-4xl md:text-6xl font-semibold text-stone-900 leading-[1.05] mb-8">
              A contractor<br />you can <em className="text-oak-500">trust.</em>
            </h2>
            <div className="space-y-5 text-stone-600 text-lg leading-relaxed">
              <p>
                My name is <span className="font-semibold text-stone-800">Kruno Tomic</span>, and
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

          <Reveal delay={150} className="md:col-span-2">
            <figure className="relative">
              <div className="absolute -inset-3 md:-inset-4 rounded-[1.75rem] border border-oak-300/50 translate-x-3 translate-y-3 md:translate-x-4 md:translate-y-4" aria-hidden="true" />
              <img
                src={imgFloor}
                alt="Flooring installation by Prestigious Home Services"
                loading="lazy"
                decoding="async"
                width="1536"
                height="2048"
                className="relative w-full aspect-[4/5] object-cover rounded-3xl shadow-2xl shadow-stone-900/20"
              />
              <figcaption className="absolute -bottom-5 left-6 bg-ink text-white rounded-xl px-5 py-3 shadow-xl">
                <span className="block text-[10px] tracking-[0.25em] uppercase text-oak-300 font-semibold">Founded by</span>
                <span className="font-display text-lg font-semibold">Kruno Tomic</span>
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </section>

      {/* Services header */}
      <section className="bg-ink pt-24 pb-0 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-red-600" aria-hidden="true" />
        <Reveal className="max-w-6xl mx-auto px-6 pb-16">
          <p className="text-oak-300 font-semibold tracking-[0.3em] uppercase text-xs mb-4">What We Offer</p>
          <h2 className="font-display text-5xl md:text-7xl font-semibold text-white leading-none tracking-tight mb-6">
            Our Services
          </h2>
          <p className="text-stone-400 text-lg max-w-2xl leading-relaxed">
            From the floors beneath your feet to the tile on your walls, we handle it all.
            Every job is backed by our commitment to quality craftsmanship and customer satisfaction.
          </p>
        </Reveal>
      </section>

      {/* Service cards */}
      <section className="bg-cream py-20 md:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <ServiceCards services={services} />
        </div>
      </section>

      {/* Gallery header */}
      <section id="gallery" className="bg-ink pt-24 pb-0 relative overflow-hidden scroll-mt-16">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-red-600" aria-hidden="true" />
        <Reveal className="max-w-6xl mx-auto px-6 pb-16">
          <p className="text-oak-300 font-semibold tracking-[0.3em] uppercase text-xs mb-4">Our Work</p>
          <h2 className="font-display text-5xl md:text-7xl font-semibold text-white leading-none tracking-tight mb-6">
            Project Gallery
          </h2>
          <p className="text-stone-400 text-lg max-w-2xl leading-relaxed">
            A look at some of the work we're proud of. From hardwood floors to full bathroom
            remodels — every project finished to the same standard.
          </p>
        </Reveal>
      </section>

      <ProjectGallery />

      {/* CTA */}
      <section className="relative bg-red-600 py-20 md:py-24 text-center overflow-hidden">
        <div
          className="absolute inset-0 opacity-30"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.35), transparent 60%)' }}
          aria-hidden="true"
        />
        <Reveal className="relative">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="font-display text-4xl md:text-6xl font-semibold text-white leading-tight mb-4">
              Ready to start your project?
            </h2>
            <p className="text-red-100 text-lg mb-10 max-w-xl mx-auto">
              Free estimates, no pressure. Call or text us and we'll walk you through every step.
            </p>
            <a
              href="tel:+13862878579"
              className="bg-ink hover:bg-stone-800 text-white font-bold px-10 py-5 rounded-full text-lg tracking-wide shadow-xl shadow-red-950/40 transition-all hover:-translate-y-0.5 inline-block"
            >
              CALL (386) 287-8579
            </a>
          </div>
        </Reveal>
      </section>
    </>
  )
}
