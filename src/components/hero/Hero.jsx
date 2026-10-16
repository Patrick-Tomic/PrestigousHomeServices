import { Component, Suspense, lazy, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { MATERIALS } from './floorLayouts'

// three.js lives in its own chunk, fetched only after the page has painted.
const HeroScene = lazy(() => import('./HeroScene'))

function supportsWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

const media = (q) => typeof window !== 'undefined' && window.matchMedia(q).matches

// If the 3D chunk or WebGL context fails, keep the static hero.
class SceneBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? null : this.props.children }
}

function PhoneIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  )
}

function MaterialSwitcher({ kind, onChange, className = '' }) {
  return (
    <div className={className}>
      <p className="text-[10px] font-semibold tracking-[0.25em] uppercase text-stone-400 mb-2.5">Preview a floor</p>
      <div role="group" aria-label="Floor material preview" className="inline-flex gap-1 p-1 rounded-full bg-stone-950/60 backdrop-blur-md ring-1 ring-white/10">
        {Object.entries(MATERIALS).map(([key, { label }]) => {
          const on = key === kind
          return (
            <button
              key={key}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(key)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 cursor-pointer ${
                on
                  ? 'bg-oak-300 text-stone-950 shadow-md shadow-black/30'
                  : 'text-stone-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function Hero() {
  const sectionRef = useRef(null)
  const [env] = useState(() => ({
    lite: media('(max-width: 767px)') || media('(pointer: coarse)') || (navigator.hardwareConcurrency || 8) <= 2,
    reduced: media('(prefers-reduced-motion: reduce)'),
  }))
  const [load, setLoad] = useState(false)
  const [ready, setReady] = useState(false)
  const [kind, setKind] = useState('hardwood')
  const [onScreen, setOnScreen] = useState(true)
  const [tabHidden, setTabHidden] = useState(false)

  // Defer the 3D scene until after first paint and the browser goes idle.
  useEffect(() => {
    if (!supportsWebGL()) return
    let idleId, timer
    const start = () => {
      const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 200))
      idleId = idle(() => setLoad(true), { timeout: 2000 })
    }
    if (document.readyState === 'complete') timer = setTimeout(start, 0)
    else window.addEventListener('load', start, { once: true })
    return () => {
      window.removeEventListener('load', start)
      clearTimeout(timer)
      window.cancelIdleCallback?.(idleId)
    }
  }, [])

  // Stop rendering when the hero is scrolled away or the tab is hidden.
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { threshold: 0 })
    obs.observe(sectionRef.current)
    const onVis = () => setTabHidden(document.hidden)
    document.addEventListener('visibilitychange', onVis)
    return () => { obs.disconnect(); document.removeEventListener('visibilitychange', onVis) }
  }, [])

  return (
    <section ref={sectionRef} className="relative min-h-[88svh] flex items-end bg-ink overflow-hidden isolate">
      {/* Static poster: shown until the scene fades in, and kept if WebGL is unavailable */}
      <div
        className="absolute inset-0 -z-20"
        style={{
          backgroundImage: `repeating-linear-gradient(
            -55deg, transparent, transparent 60px,
            rgba(255,255,255,0.018) 60px, rgba(255,255,255,0.018) 61px
          )`
        }}
        aria-hidden="true"
      />
      <div
        className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full -z-20"
        style={{ background: 'radial-gradient(circle, rgba(220,38,38,0.18) 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      {load && (
        <div
          className={`absolute inset-0 -z-10 transition-opacity duration-[1200ms] ease-out ${ready ? 'opacity-100' : 'opacity-0'}`}
          aria-hidden="true"
        >
          <SceneBoundary>
            <Suspense fallback={null}>
              <HeroScene
                kind={kind}
                paused={!onScreen || tabHidden}
                lite={env.lite}
                reduced={env.reduced}
                onReady={() => setReady(true)}
              />
            </Suspense>
          </SceneBoundary>
        </div>
      )}

      {/* Scrims keep the headline readable over the floor */}
      <div className="absolute inset-0 -z-10 pointer-events-none bg-gradient-to-t from-ink via-ink/70 to-ink/10 md:bg-gradient-to-r md:from-ink md:via-ink/75 md:to-transparent" aria-hidden="true" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 -z-10 pointer-events-none bg-gradient-to-t from-ink to-transparent" aria-hidden="true" />
      <div className="absolute top-0 left-0 w-1.5 h-full bg-red-600" aria-hidden="true" />

      {ready && (
        <MaterialSwitcher
          kind={kind}
          onChange={setKind}
          className="absolute top-6 right-4 md:top-auto md:bottom-28 md:right-10 lg:right-[max(2.5rem,calc((100vw-72rem)/2))] text-right animate-[fadeIn_700ms_ease-out_both]"
        />
      )}

      <div className="relative max-w-6xl mx-auto px-6 pb-20 md:pb-28 w-full">
        <p className="text-oak-300 font-semibold tracking-[0.3em] uppercase text-xs mb-6">
          Licensed &bull; Insured &bull; Since 2011
        </p>
        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-semibold text-white leading-[0.95] tracking-tight max-w-3xl mb-8 [text-shadow:0_2px_24px_rgba(0,0,0,0.45)]">
          Prestigious<br />
          <span className="text-red-500 italic">Home</span><br />
          Services.
        </h1>
        <p className="text-stone-200 text-lg md:text-xl max-w-lg leading-relaxed mb-10 [text-shadow:0_1px_12px_rgba(0,0,0,0.6)]">
          Trusted flooring and home improvement contractor serving across the USA.
          Built on craftsmanship, backed by over a decade of results.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            to="/contact"
            className="group inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold px-8 py-4 rounded-full text-base tracking-wide shadow-lg shadow-red-950/50 transition-all hover:-translate-y-0.5"
          >
            Get a Free Estimate
            <span className="transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
          </Link>
          <a
            href="tel:+13862878579"
            className="inline-flex items-center gap-2.5 bg-white/5 backdrop-blur-sm ring-1 ring-inset ring-white/35 hover:ring-white hover:bg-white/10 text-white font-bold px-8 py-4 rounded-full text-base tracking-wide transition-all"
          >
            <PhoneIcon className="w-4 h-4" />
            Call (386) 287-8579
          </a>
        </div>
      </div>
    </section>
  )
}
