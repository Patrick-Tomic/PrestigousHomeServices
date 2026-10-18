import { useRef } from 'react'
import { Link } from 'react-router-dom'
import Reveal from './Reveal'

const iconPaths = {
  flooring: <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M3 15h18M10 3v6M15 9v6M8 15v6" /></>,
  bathrooms: <><path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3z" /><path d="M6 12V5.5a2.5 2.5 0 0 1 4.6-1.4" /><path d="M9.5 6.5l2.5-1.5M7 19l-1 2M17 19l1 2" /></>,
  kitchens: <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 10h18M12 10v11M9.5 14.5v2M14.5 14.5v2M7 6.5h2.5M14.5 6.5H17" /></>,
  patios: <><path d="M2 20h20" /><path d="M4 20V9.5L12 4l8 5.5V20" /><path d="M4 12.5h16M8 12.5V20M12 12.5V20M16 12.5V20" /></>,
  roofing: <><path d="M2.5 12.5 12 5l9.5 7.5" /><path d="M6 10.2 12 5.5" opacity=".4" /><path d="M5 11v9h14v-9" /><path d="M10 20v-5h4v5" /></>,
  handyman: <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />,
}

function ServiceIcon({ slug }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6" aria-hidden="true">
      {iconPaths[slug]}
    </svg>
  )
}

const MAX_TILT = 6 // degrees

function TiltCard({ children }) {
  const ref = useRef(null)

  const onMove = (e) => {
    if (e.pointerType !== 'mouse') return
    const el = ref.current
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width
    const py = (e.clientY - r.top) / r.height
    el.style.setProperty('--rx', `${(0.5 - py) * MAX_TILT}deg`)
    el.style.setProperty('--ry', `${(px - 0.5) * MAX_TILT}deg`)
    el.style.setProperty('--mx', `${px * 100}%`)
    el.style.setProperty('--my', `${py * 100}%`)
  }
  const onLeave = () => {
    const el = ref.current
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
  }

  return (
    <div className="h-full [perspective:1000px]">
      <div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        className="group relative h-full rounded-2xl bg-white ring-1 ring-stone-200/80 shadow-sm transition-[transform,box-shadow] duration-300 ease-out hover:shadow-2xl hover:shadow-stone-900/10 motion-safe:[transform:rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))] [transform-style:preserve-3d]"
      >
        {/* Soft glare that follows the cursor */}
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: 'radial-gradient(420px circle at var(--mx,50%) var(--my,50%), rgba(217,178,122,0.16), transparent 45%)' }}
          aria-hidden="true"
        />
        {children}
      </div>
    </div>
  )
}

export default function ServiceCards({ services }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {services.map((service, i) => (
        <Reveal key={service.slug} delay={(i % 3) * 110} className="h-full">
          <TiltCard>
            <article className="relative flex flex-col h-full p-7 md:p-8 [transform:translateZ(24px)]">
              <div className="flex items-start justify-between mb-7">
                <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-oak-100 text-oak-600 ring-1 ring-oak-200 transition-colors duration-300 group-hover:bg-red-600 group-hover:text-white group-hover:ring-red-600">
                  <ServiceIcon slug={service.slug} />
                </span>
                <span className="font-display text-sm font-semibold text-stone-300 tabular-nums">{service.num}</span>
              </div>
              <h3 className="font-display text-2xl font-semibold text-stone-900 leading-tight">{service.title}</h3>
              <p className="text-[11px] text-oak-500 font-semibold tracking-[0.18em] uppercase mt-2 mb-4">{service.detail}</p>
              <p className="text-stone-600 leading-relaxed mb-7 flex-1">{service.body}</p>
              <div className="flex flex-wrap gap-x-6 gap-y-2 pt-5 border-t border-stone-100">
                <Link
                  to={`/contact?service=${encodeURIComponent(service.estimate)}`}
                  className="inline-flex items-center gap-1.5 text-stone-900 font-bold hover:text-red-600 transition-colors text-xs tracking-wider group/link"
                >
                  GET A FREE ESTIMATE
                  <span className="group-hover/link:translate-x-1 transition-transform inline-block">→</span>
                </Link>
                <Link
                  to={`/work#${service.slug}`}
                  className="inline-flex items-center gap-1.5 text-stone-500 font-bold hover:text-red-600 transition-colors text-xs tracking-wider group/link"
                >
                  SEE DETAILS &amp; PHOTOS
                  <span className="group-hover/link:translate-x-1 transition-transform inline-block">→</span>
                </Link>
              </div>
            </article>
          </TiltCard>
        </Reveal>
      ))}
    </div>
  )
}
