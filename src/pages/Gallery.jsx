import { useState, useEffect, useRef, useCallback } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'

const ALL = 'All'
const categories = [ALL, 'Flooring', 'Bathroom', 'Kitchen', 'Patio', 'Roofing']

const photos = [
  { id: 1,  src: 'https://picsum.photos/seed/phs-f1/900/600', category: 'Flooring',  label: 'Hardwood Installation' },
  { id: 2,  src: 'https://picsum.photos/seed/phs-b1/900/600', category: 'Bathroom',  label: 'Custom Tile Work' },
  { id: 3,  src: 'https://picsum.photos/seed/phs-k1/900/600', category: 'Kitchen',   label: 'Full Kitchen Renovation' },
  { id: 4,  src: 'https://picsum.photos/seed/phs-f2/900/600', category: 'Flooring',  label: 'Laminate Flooring' },
  { id: 5,  src: 'https://picsum.photos/seed/phs-p1/900/600', category: 'Patio',     label: 'Enclosed Patio Build' },
  { id: 6,  src: 'https://picsum.photos/seed/phs-b2/900/600', category: 'Bathroom',  label: 'Vanity & Fixtures' },
  { id: 7,  src: 'https://picsum.photos/seed/phs-k2/900/600', category: 'Kitchen',   label: 'Cabinet Installation' },
  { id: 8,  src: 'https://picsum.photos/seed/phs-f3/900/600', category: 'Flooring',  label: 'Tile Installation' },
  { id: 9,  src: 'https://picsum.photos/seed/phs-r1/900/600', category: 'Roofing',   label: 'Roof Replacement' },
  { id: 10, src: 'https://picsum.photos/seed/phs-f4/900/600', category: 'Flooring',  label: 'Natural Stone Floor' },
  { id: 11, src: 'https://picsum.photos/seed/phs-b3/900/600', category: 'Bathroom',  label: 'Full Bathroom Remodel' },
  { id: 12, src: 'https://picsum.photos/seed/phs-k3/900/600', category: 'Kitchen',   label: 'Backsplash & Flooring' },
  { id: 13, src: 'https://picsum.photos/seed/phs-p2/900/600', category: 'Patio',     label: 'Screened Enclosure' },
  { id: 14, src: 'https://picsum.photos/seed/phs-f5/900/600', category: 'Flooring',  label: 'Engineered Hardwood' },
  { id: 15, src: 'https://picsum.photos/seed/phs-r2/900/600', category: 'Roofing',   label: 'Shingle Installation' },
]

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

function GalleryItem({ photo, index, onClick }) {
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
    <button
      ref={ref}
      onClick={onClick}
      className={`group relative aspect-video overflow-hidden bg-zinc-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transition: `opacity 550ms ease ${(index % 3) * 80}ms, transform 550ms ease ${(index % 3) * 80}ms` }}
      aria-label={`View ${photo.label}`}
    >
      <img
        src={photo.src}
        alt={photo.label}
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/20 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-400" />
      <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-400">
        <span className="text-red-400 text-xs font-bold tracking-widest uppercase">{photo.category}</span>
        <p className="text-white font-bold text-sm mt-0.5">{photo.label}</p>
      </div>
    </button>
  )
}

function Lightbox({ photos, index, onClose, onPrev, onNext }) {
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape')     onClose()
      if (e.key === 'ArrowLeft')  onPrev()
      if (e.key === 'ArrowRight') onNext()
    }
    window.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [onClose, onPrev, onNext])

  const photo = photos[index]

  return (
    <div
      className="fixed inset-0 bg-zinc-950/95 z-50 flex items-center justify-center px-4"
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-zinc-400 hover:text-white text-3xl leading-none transition-colors z-10"
        aria-label="Close"
      >
        ×
      </button>

      {/* Prev */}
      <button
        onClick={(e) => { e.stopPropagation(); onPrev() }}
        className="absolute left-4 text-zinc-400 hover:text-white text-4xl font-thin transition-colors z-10 px-2 py-4"
        aria-label="Previous"
      >
        ‹
      </button>

      {/* Image */}
      <div
        className="max-w-5xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={photo.src}
          alt={photo.label}
          className="w-full max-h-[80vh] object-contain"
        />
        <div className="mt-3 flex items-center gap-3">
          <span className="text-red-500 text-xs font-bold tracking-widest uppercase">{photo.category}</span>
          <span className="text-zinc-600">·</span>
          <p className="text-zinc-300 text-sm font-semibold">{photo.label}</p>
          <span className="ml-auto text-zinc-600 text-xs">{index + 1} / {photos.length}</span>
        </div>
      </div>

      {/* Next */}
      <button
        onClick={(e) => { e.stopPropagation(); onNext() }}
        className="absolute right-4 text-zinc-400 hover:text-white text-4xl font-thin transition-colors z-10 px-2 py-4"
        aria-label="Next"
      >
        ›
      </button>
    </div>
  )
}

export default function Gallery() {
  const [activeFilter, setActiveFilter] = useState(ALL)
  const [lightboxIndex, setLightboxIndex] = useState(null)
  const [headerRef, headerVisible] = useReveal()

  const filtered = activeFilter === ALL ? photos : photos.filter(p => p.category === activeFilter)

  const openLightbox = (index) => setLightboxIndex(index)
  const closeLightbox = useCallback(() => setLightboxIndex(null), [])
  const prevPhoto = useCallback(() => setLightboxIndex(i => (i - 1 + filtered.length) % filtered.length), [filtered.length])
  const nextPhoto = useCallback(() => setLightboxIndex(i => (i + 1) % filtered.length), [filtered.length])

  return (
    <>
      <Helmet>
        <title>Gallery | Prestigious Home Services, LLC.</title>
        <meta name="description" content="View completed flooring, bathroom, kitchen, patio, and roofing projects by Prestigious Home Services. Licensed contractor serving customers nationwide since 2011." />
        <link rel="canonical" href="https://prestigioushomeservices.com/gallery" />
      </Helmet>

      {/* Page header */}
      <section className="bg-zinc-950 pt-24 pb-16 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-red-600" aria-hidden="true" />
        <div
          ref={headerRef}
          className={`max-w-6xl mx-auto px-6 transition-all duration-700 ${headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <p className="text-red-500 font-bold tracking-[0.25em] uppercase text-xs mb-4">Our Work</p>
          <h1 className="text-5xl md:text-7xl font-black text-white leading-none tracking-tight mb-6">
            Project Gallery
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl leading-relaxed">
            A look at some of the work we're proud of. From hardwood floors to full bathroom
            remodels — every project finished to the same standard.
          </p>
        </div>
      </section>

      {/* Filter tabs */}
      <section className="bg-white border-b border-zinc-100 sticky top-16 z-40">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-1 overflow-x-auto py-3 scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => { setActiveFilter(cat); setLightboxIndex(null) }}
                className={`whitespace-nowrap px-4 py-1.5 rounded text-sm font-bold tracking-wide transition-colors ${
                  activeFilter === cat
                    ? 'bg-red-600 text-white'
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="bg-white py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((photo, i) => (
              <GalleryItem
                key={photo.id}
                photo={photo}
                index={i}
                onClick={() => openLightbox(i)}
              />
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="text-center text-zinc-400 py-20">No projects in this category yet.</p>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-red-600 py-20 text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4">
            Like what you see?
          </h2>
          <p className="text-red-100 text-lg mb-10 max-w-xl mx-auto">
            Get in touch for a free estimate on your project.
          </p>
          <Link
            to="/contact"
            className="bg-zinc-950 hover:bg-zinc-800 text-white font-black px-10 py-5 text-lg tracking-wide transition-colors inline-block"
          >
            GET A FREE ESTIMATE
          </Link>
        </div>
      </section>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          photos={filtered}
          index={lightboxIndex}
          onClose={closeLightbox}
          onPrev={prevPhoto}
          onNext={nextPhoto}
        />
      )}
    </>
  )
}
