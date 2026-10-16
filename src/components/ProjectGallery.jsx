import { useState, useEffect, useRef, useCallback } from 'react'
import { CATEGORIES, useGalleryPhotos } from '../data/gallery'

const ALL = 'All'

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
      className={`group relative aspect-video overflow-hidden bg-stone-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transition: `opacity 550ms ease ${(index % 3) * 80}ms, transform 550ms ease ${(index % 3) * 80}ms` }}
      aria-label={`View ${photo.label}`}
    >
      <img
        src={photo.src}
        alt={`${photo.label} by Prestigious Home Services`}
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/20 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-400" />
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
      className="fixed inset-0 bg-stone-950/95 z-50 flex items-center justify-center px-4"
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-stone-400 hover:text-white text-3xl leading-none transition-colors z-10"
        aria-label="Close"
      >
        ×
      </button>

      {/* Prev */}
      <button
        onClick={(e) => { e.stopPropagation(); onPrev() }}
        className="absolute left-4 text-stone-400 hover:text-white text-4xl font-thin transition-colors z-10 px-2 py-4"
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
          alt={`${photo.label} by Prestigious Home Services`}
          className="w-full max-h-[80vh] object-contain"
        />
        <div className="mt-3 flex items-center gap-3">
          <span className="text-red-500 text-xs font-bold tracking-widest uppercase">{photo.category}</span>
          <span className="text-stone-600">·</span>
          <p className="text-stone-300 text-sm font-semibold">{photo.label}</p>
          <span className="ml-auto text-stone-600 text-xs">{index + 1} / {photos.length}</span>
        </div>
      </div>

      {/* Next */}
      <button
        onClick={(e) => { e.stopPropagation(); onNext() }}
        className="absolute right-4 text-stone-400 hover:text-white text-4xl font-thin transition-colors z-10 px-2 py-4"
        aria-label="Next"
      >
        ›
      </button>
    </div>
  )
}

// Photo grid that opens a lightbox when a photo is clicked.
export function PhotoGrid({ photos }) {
  const [lightboxIndex, setLightboxIndex] = useState(null)

  const closeLightbox = useCallback(() => setLightboxIndex(null), [])
  const prevPhoto = useCallback(() => setLightboxIndex(i => (i - 1 + photos.length) % photos.length), [photos.length])
  const nextPhoto = useCallback(() => setLightboxIndex(i => (i + 1) % photos.length), [photos.length])

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {photos.map((photo, i) => (
          <GalleryItem
            key={photo.id}
            photo={photo}
            index={i}
            onClick={() => setLightboxIndex(i)}
          />
        ))}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          photos={photos}
          index={lightboxIndex}
          onClose={closeLightbox}
          onPrev={prevPhoto}
          onNext={nextPhoto}
        />
      )}
    </>
  )
}

// Filterable photo grid used on the Home page.
export default function ProjectGallery() {
  const [activeFilter, setActiveFilter] = useState(ALL)
  const photos = useGalleryPhotos()

  const categories = [ALL, ...CATEGORIES.filter(c => photos.some(p => p.category === c))]
  const filtered = activeFilter === ALL ? photos : photos.filter(p => p.category === activeFilter)

  return (
    <>
      {/* Filter tabs */}
      <section className="bg-white border-b border-stone-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-1 overflow-x-auto py-3 scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`whitespace-nowrap px-4 py-1.5 rounded text-sm font-bold tracking-wide transition-colors ${
                  activeFilter === cat
                    ? 'bg-red-600 text-white'
                    : 'text-stone-500 hover:text-stone-900'
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
          <PhotoGrid key={activeFilter} photos={filtered} />

          {filtered.length === 0 && (
            <p className="text-center text-stone-400 py-20">No projects in this category yet.</p>
          )}
        </div>
      </section>
    </>
  )
}
