import { Component, Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useSearchParams } from 'react-router-dom'
import {
  BACKSPLASH, CABINETS, FLOORS, PHONE, ROOM_TYPES, SHOWERS, TONES, VANITIES, WASTE,
  area, bathroomLayout, defaultDesign, parseDesign, serializeDesign, summaryLines, summaryText,
} from '../components/designer/designOptions'

// three.js lives in its own chunk, fetched once the page has painted.
const DesignerScene = lazy(() => import('../components/designer/DesignerScene'))

function supportsWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

const media = (q) => window.matchMedia(q).matches

class SceneBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? this.props.fallback : this.props.children }
}

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------

const roomIcons = {
  living: <><path d="M4 11V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3" /><path d="M2 13a2 2 0 0 1 4 0v2h12v-2a2 2 0 0 1 4 0v4H2z" /><path d="M5 17v2M19 17v2" /></>,
  bedroom: <><path d="M3 18V7" /><path d="M3 14h18v4" /><path d="M21 14v-2a3 3 0 0 0-3-3h-7v5" /><circle cx="7" cy="11" r="1.6" /></>,
  kitchen: <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 10h18M12 10v11M9.5 14.5v2M14.5 14.5v2M7 6.5h2.5M14.5 6.5H17" /></>,
  bathroom: <><path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3z" /><path d="M6 12V5.5a2.5 2.5 0 0 1 4.6-1.4" /><path d="M9.5 6.5l2.5-1.5M7 19l-1 2M17 19l1 2" /></>,
  patio: <><path d="M2 20h20" /><path d="M4 20V9.5L12 4l8 5.5V20" /><path d="M4 12.5h16M8 12.5V20M12 12.5V20M16 12.5V20" /></>,
}

function Icon({ children, className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {children}
    </svg>
  )
}

// Little CSS previews of each floor material for the swatch buttons.
const floorSwatch = {
  hardwood: 'repeating-linear-gradient(90deg, #b7895d 0 12px, #a67a50 12px 13px, #c39568 13px 25px, #9c6f47 25px 26px), linear-gradient(#b7895d, #b7895d)',
  laminate: 'repeating-linear-gradient(90deg, #d8c3a3 0 19px, #bfa680 19px 20px), linear-gradient(#d8c3a3, #d8c3a3)',
  tile: 'linear-gradient(90deg, #cbc3b7 2px, transparent 2px) 0 0 / 24px 24px, linear-gradient(#cbc3b7 2px, transparent 2px) 0 0 / 24px 24px, #f0ece6',
  stone: 'linear-gradient(90deg, #c7b49a 2px, transparent 2px) 0 0 / 28px 14px, linear-gradient(90deg, #c7b49a 2px, transparent 2px) 14px 14px / 28px 14px, linear-gradient(#c7b49a 2px, transparent 2px) 0 0 / 28px 14px, #e2d4be',
}

// ---------------------------------------------------------------------------
// Controls
// ---------------------------------------------------------------------------

function Section({ num, title, children }) {
  return (
    <section className="rounded-2xl bg-white ring-1 ring-stone-200/80 p-5 md:p-6">
      <h2 className="flex items-baseline gap-3 mb-4">
        <span className="font-display text-sm font-semibold text-oak-500 tabular-nums">{num}</span>
        <span className="font-display text-xl font-semibold text-stone-900">{title}</span>
      </h2>
      {children}
    </section>
  )
}

function Choice({ label, options, value, onChange, columns = 2 }) {
  return (
    <div role="radiogroup" aria-label={label} className={`grid gap-2 ${columns === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
      {Object.entries(options).map(([key, o]) => {
        const on = key === value
        return (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(key)}
            className={`px-3 py-2.5 rounded-xl text-sm font-semibold text-left transition-all cursor-pointer ring-1 ${
              on ? 'bg-ink text-white ring-ink shadow-md' : 'bg-stone-50 text-stone-700 ring-stone-200 hover:ring-stone-400'
            }`}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

function Slider({ id, label, value, range, onChange }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <label htmlFor={id} className="text-sm font-semibold text-stone-700">{label}</label>
        <span className="font-display text-lg font-semibold text-stone-900 tabular-nums">{value} ft</span>
      </div>
      <input
        id={id}
        type="range"
        min={range[0]}
        max={range[1]}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-red-600 cursor-pointer"
      />
      <div className="flex justify-between text-[11px] text-stone-400 mt-1 tabular-nums">
        <span>{range[0]} ft</span><span>{range[1]} ft</span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function Design() {
  const [params, setParams] = useSearchParams()
  const [design, setDesign] = useState(() => parseDesign(params))
  const update = (patch) => setDesign(d => ({ ...d, ...patch }))
  const chooseType = (type) => setDesign(d => ({ ...defaultDesign(type), tone: d.tone, cabinets: d.cabinets, backsplash: d.backsplash, shower: d.shower, vanity: d.vanity }))

  // Keep the URL in step (debounced so slider drags don't spam history).
  useEffect(() => {
    const t = setTimeout(() => setParams(serializeDesign(design), { replace: true }), 300)
    return () => clearTimeout(t)
  }, [design, setParams])

  const [env] = useState(() => ({
    webgl: supportsWebGL(),
    lite: media('(max-width: 767px)') || media('(pointer: coarse)') || (navigator.hardwareConcurrency || 8) <= 2,
    reduced: media('(prefers-reduced-motion: reduce)'),
    touch: media('(pointer: coarse)'),
  }))
  const [load, setLoad] = useState(false)
  const [tabHidden, setTabHidden] = useState(false)
  useEffect(() => {
    if (!env.webgl) return
    const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 100))
    const id = idle(() => setLoad(true), { timeout: 800 })
    const onVis = () => setTabHidden(document.hidden)
    document.addEventListener('visibilitychange', onVis)
    return () => { window.cancelIdleCallback?.(id); document.removeEventListener('visibilitychange', onVis) }
  }, [env.webgl])

  const type = ROOM_TYPES[design.type]
  const sqft = area(design)
  const needed = Math.ceil(sqft * (1 + WASTE))
  const bath = design.type === 'bathroom' ? bathroomLayout(design) : null
  const shareUrl = `${window.location.origin}/design?${serializeDesign(design)}`
  const text = useMemo(() => summaryText(design, shareUrl), [design, shareUrl])

  const [copied, setCopied] = useState(false)
  const copyTimer = useRef(null)
  useEffect(() => () => clearTimeout(copyTimer.current), [])
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      clearTimeout(copyTimer.current)
      copyTimer.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('Copy your design details:', text)
    }
  }

  return (
    <>
      <Helmet>
        <title>Design Your Room | Prestigious Home Services, LLC.</title>
        <meta name="description" content="Plan your project in 3D: choose a room type, set the size, and preview hardwood, laminate, tile or natural stone flooring. Then send your design to Prestigious Home Services for a free estimate." />
        <link rel="canonical" href="https://prestigioushomeservices.com/design" />
      </Helmet>

      {/* Header */}
      <section className="bg-ink text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-red-600" aria-hidden="true" />
        <div className="max-w-6xl mx-auto px-6 py-14 md:py-16">
          <p className="text-oak-300 font-semibold tracking-[0.3em] uppercase text-xs mb-4">Plan Your Project</p>
          <h1 className="font-display text-4xl md:text-6xl font-semibold leading-tight mb-4">Design Your Room</h1>
          <p className="text-stone-300 text-lg max-w-2xl leading-relaxed">
            Pick a room, set the size, and try different floors in 3D. When it looks right,
            send it to us and we'll follow up with a free estimate.
          </p>
        </div>
      </section>

      <section className="bg-cream py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-6 grid lg:grid-cols-[minmax(0,1fr)_400px] gap-6 lg:gap-8 items-start">

          {/* 3D preview */}
          <div className="lg:sticky lg:top-24">
            <div
              className="relative rounded-3xl overflow-hidden h-[52vh] min-h-[320px] lg:h-[calc(100vh-8rem)] lg:max-h-[760px] ring-1 ring-black/5 shadow-xl shadow-stone-900/10"
              style={{ background: 'radial-gradient(ellipse at 50% 40%, #3a3029 0%, #1f1a16 60%, #15110e 100%)' }}
            >
              {env.webgl ? (
                load && (
                  <SceneBoundary fallback={<PreviewUnavailable />}>
                    <Suspense fallback={<PreviewLoading />}>
                      <DesignerScene design={design} lite={env.lite} reduced={env.reduced} paused={tabHidden} />
                    </Suspense>
                  </SceneBoundary>
                )
              ) : <PreviewUnavailable />}
              {!load && env.webgl && <PreviewLoading />}

              <div className="pointer-events-none absolute top-4 left-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-black/45 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 ring-1 ring-white/10">
                  {type.label} · {design.width} × {design.length} ft
                </span>
                <span className="rounded-full bg-black/45 backdrop-blur-md text-oak-200 text-xs font-semibold px-3 py-1.5 ring-1 ring-white/10">
                  {FLOORS[design.floor].label}
                </span>
              </div>
              {env.webgl && (
                <p className="pointer-events-none absolute bottom-4 inset-x-0 text-center text-[11px] tracking-wide text-stone-300/80">
                  {env.touch ? 'Drag to look around · Pinch to zoom' : 'Drag to look around · Scroll to zoom'}
                </p>
              )}
            </div>
            <p className="text-xs text-stone-500 mt-3 px-1">
              Furniture is shown for scale. Your free estimate includes exact measurements and material options.
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-col gap-4">
            <Section num="01" title="Room type">
              <div role="radiogroup" aria-label="Room type" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2">
                {Object.entries(ROOM_TYPES).map(([key, r]) => {
                  const on = key === design.type
                  return (
                    <button
                      key={key}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => chooseType(key)}
                      className={`flex items-center gap-2.5 px-3 py-3 rounded-xl text-sm font-semibold text-left transition-all cursor-pointer ring-1 ${
                        on ? 'bg-ink text-white ring-ink shadow-md' : 'bg-stone-50 text-stone-700 ring-stone-200 hover:ring-stone-400'
                      }`}
                    >
                      <span className={on ? 'text-oak-300' : 'text-oak-500'}><Icon>{roomIcons[key]}</Icon></span>
                      {r.label}
                    </button>
                  )
                })}
              </div>
            </Section>

            <Section num="02" title="Room size">
              <div className="flex flex-col gap-5">
                <Slider id="room-width" label="Width" value={design.width} range={type.range} onChange={(width) => update({ width })} />
                <Slider id="room-length" label="Length" value={design.length} range={type.range} onChange={(length) => update({ length })} />
                <div className="flex items-baseline justify-between rounded-xl bg-stone-50 px-4 py-3">
                  <span className="text-sm font-semibold text-stone-600">Floor area</span>
                  <span className="font-display text-2xl font-semibold text-stone-900 tabular-nums">{sqft} sq ft</span>
                </div>
              </div>
            </Section>

            <Section num="03" title="Flooring">
              <div role="radiogroup" aria-label="Flooring type" className="grid grid-cols-2 gap-2 mb-4">
                {Object.entries(FLOORS).map(([key, f]) => {
                  const on = key === design.floor
                  return (
                    <button
                      key={key}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => update({ floor: key })}
                      className={`text-left rounded-xl p-2 pb-3 transition-all cursor-pointer ring-1 ${
                        on ? 'ring-2 ring-red-600 bg-white shadow-md' : 'ring-stone-200 bg-stone-50 hover:ring-stone-400'
                      }`}
                    >
                      <span className="block h-12 rounded-lg mb-2 ring-1 ring-black/5" style={{ background: floorSwatch[key] }} aria-hidden="true" />
                      <span className="block px-1 text-sm font-semibold text-stone-900">{f.label}</span>
                      <span className="block px-1 text-[11px] leading-snug text-stone-500">{f.note}</span>
                    </button>
                  )
                })}
              </div>
              <p className="text-sm font-semibold text-stone-700 mb-2">Tone</p>
              <Choice label="Floor tone" options={TONES} value={design.tone} onChange={(tone) => update({ tone })} columns={3} />
            </Section>

            {design.type === 'kitchen' && (
              <Section num="04" title="Kitchen details">
                <p className="text-sm font-semibold text-stone-700 mb-2">Cabinets</p>
                <div role="radiogroup" aria-label="Cabinet finish" className="grid grid-cols-3 gap-2 mb-4">
                  {Object.entries(CABINETS).map(([key, c]) => {
                    const on = key === design.cabinets
                    return (
                      <button
                        key={key}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        onClick={() => update({ cabinets: key })}
                        className={`flex flex-col items-center gap-2 px-2 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ring-1 ${
                          on ? 'ring-2 ring-red-600 bg-white shadow-md text-stone-900' : 'ring-stone-200 bg-stone-50 text-stone-600 hover:ring-stone-400'
                        }`}
                      >
                        <span className="w-8 h-8 rounded-full ring-1 ring-black/10" style={{ background: c.color }} aria-hidden="true" />
                        {c.label}
                      </button>
                    )
                  })}
                </div>
                <p className="text-sm font-semibold text-stone-700 mb-2">Backsplash</p>
                <Choice label="Backsplash" options={BACKSPLASH} value={design.backsplash} onChange={(backsplash) => update({ backsplash })} />
              </Section>
            )}

            {design.type === 'bathroom' && (
              <Section num="04" title="Bathroom details">
                <p className="text-sm font-semibold text-stone-700 mb-2">Shower</p>
                <div className="mb-4">
                  <Choice label="Shower" options={SHOWERS} value={design.shower} onChange={(shower) => update({ shower })} />
                </div>
                <p className="text-sm font-semibold text-stone-700 mb-2">Vanity</p>
                <Choice label="Vanity" options={VANITIES} value={design.vanity} onChange={(vanity) => update({ vanity })} />
                {design.vanity === 'double' && !bath.doubleFits && (
                  <p className="text-xs text-oak-600 mt-3">A double vanity needs a longer room. Try increasing the length, or ask us about other layouts.</p>
                )}
              </Section>
            )}

            {/* Summary */}
            <section className="rounded-2xl bg-ink text-white p-5 md:p-6 shadow-xl shadow-stone-900/20">
              <h2 className="font-display text-xl font-semibold mb-4">Your project</h2>
              <dl className="divide-y divide-white/10 text-sm">
                {summaryLines(design).map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 py-2">
                    <dt className="text-stone-400">{k}</dt>
                    <dd className="text-right font-medium">{v}</dd>
                  </div>
                ))}
                <div className="flex justify-between gap-4 py-2">
                  <dt className="text-stone-400">Flooring needed</dt>
                  <dd className="text-right font-medium">≈ {needed} sq ft</dd>
                </div>
              </dl>
              <p className="text-[11px] text-stone-500 mt-1 mb-5">
                Includes about {Math.round(WASTE * 100)}% extra for cuts and waste. Exact quantities are confirmed when we measure.
              </p>

              <div className="flex flex-col gap-2.5">
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-3.5 rounded-full tracking-wide transition-colors"
                >
                  Get a Free Estimate <span aria-hidden="true">→</span>
                </Link>
                {env.touch ? (
                  <a
                    href={`sms:${PHONE}?&body=${encodeURIComponent(text)}`}
                    className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 ring-1 ring-inset ring-white/25 text-white font-bold px-6 py-3.5 rounded-full tracking-wide transition-colors"
                  >
                    Text this design to us
                  </a>
                ) : (
                  <a
                    href={`tel:${PHONE}`}
                    className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 ring-1 ring-inset ring-white/25 text-white font-bold px-6 py-3.5 rounded-full tracking-wide transition-colors"
                  >
                    Call (386) 287-8579
                  </a>
                )}
                <button
                  type="button"
                  onClick={copy}
                  className="inline-flex items-center justify-center gap-2 text-stone-300 hover:text-white font-semibold px-6 py-2.5 text-sm transition-colors cursor-pointer"
                >
                  {copied ? 'Copied — paste it in a text or email' : 'Copy design details'}
                </button>
              </div>
            </section>
          </div>
        </div>
      </section>
    </>
  )
}

function PreviewLoading() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="flex items-center gap-3 text-stone-400 text-sm">
        <span className="w-4 h-4 rounded-full border-2 border-stone-500 border-t-oak-300 animate-spin" aria-hidden="true" />
        Loading 3D preview…
      </div>
    </div>
  )
}

function PreviewUnavailable() {
  return (
    <div className="absolute inset-0 flex items-center justify-center p-8 text-center">
      <p className="text-stone-400 text-sm max-w-xs">
        The 3D preview isn't available in this browser, but your choices still work — your project summary updates as you go.
      </p>
    </div>
  )
}
