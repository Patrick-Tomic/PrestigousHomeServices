import { Component, Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react'
import Seo from '../components/Seo'
import { Link, useSearchParams } from 'react-router-dom'
import { addRoom, updateRoom, useProject } from '../components/designer/projectStore'
import { CartIcon, RoomIcon } from '../components/designer/icons'
import {
  BACKSPLASH, BATH_COUNTERS, CABINETS, COUNTERS, ENCLOSURES, FINISHES, FLOORS, GLASS, KITCHEN_LAYOUTS, PATIO_PANELS, PHONE, ROOM_TYPES,
  SHOWERS, SHOWER_TILES, TONES, TRIM, UPPERS, VANITIES, WASTE, YES_NO,
  FLOOR_SWATCH, area, bathroomLayout, cabinetCounts, defaultDesign, fitToRoom, parseDesign, serializeDesign, summaryLines, summaryText,
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

function Field({ label, children, last }) {
  return (
    <div className={last ? '' : 'mb-4'}>
      <p className="text-sm font-semibold text-stone-700 mb-2">{label}</p>
      {children}
    </div>
  )
}

function Note({ children }) {
  return <p className="text-xs text-oak-600 -mt-1 mb-4">{children}</p>
}

function Stat({ value, label }) {
  return (
    <div className="rounded-xl bg-stone-50 px-3 py-2.5">
      <p className="font-display text-2xl font-semibold text-stone-900 tabular-nums leading-none">{value}</p>
      <p className="text-[11px] text-stone-500 mt-1 leading-snug">{label}</p>
    </div>
  )
}

// Wall-tile previews for backsplash and shower tile buttons.
const tileSwatch = {
  subway: 'linear-gradient(#cfc9c1 2px, transparent 2px) 0 0 / 100% 10px, linear-gradient(90deg, #cfc9c1 2px, transparent 2px) 0 0 / 20px 20px, linear-gradient(90deg, #cfc9c1 2px, transparent 2px) 10px 10px / 20px 20px, #f7f6f3',
  stacked: 'linear-gradient(90deg, #cbc5bd 2px, transparent 2px) 0 0 / 7px 100%, linear-gradient(#cbc5bd 2px, transparent 2px) 0 0 / 100% 24px, #f1efea',
  marble: 'linear-gradient(135deg, transparent 0 40%, #cfc8be 41%, transparent 44%), linear-gradient(90deg, #d6d0c8 2px, transparent 2px) 0 0 / 50% 100%, #f6f4f1',
  none: 'repeating-linear-gradient(135deg, #f4f2ee 0 6px, #ebe7e1 6px 7px)',
}

// Buttons with a colour or texture swatch: finishes, counters, tile styles.
function SwatchChoice({ label, options, value, onChange, columns = 3, swatches }) {
  return (
    <div role="radiogroup" aria-label={label} className={`grid gap-2 ${columns === 4 ? 'grid-cols-4' : 'grid-cols-3'}`}>
      {Object.entries(options).map(([key, o]) => {
        const on = key === value
        const bg = swatches?.[key] ?? o.swatch ?? o.color
        return (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(key)}
            className={`flex flex-col items-center gap-1.5 px-1.5 py-2.5 rounded-xl text-[11px] leading-tight font-semibold text-center transition-all cursor-pointer ring-1 ${
              on ? 'ring-2 ring-red-600 bg-white shadow-md text-stone-900' : 'ring-stone-200 bg-stone-50 text-stone-600 hover:ring-stone-400'
            }`}
          >
            <span className="w-9 h-9 rounded-full ring-1 ring-black/10" style={{ background: bg }} aria-hidden="true" />
            {o.label}
          </button>
        )
      })}
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
  // A new room type resets size and floor to suit it; other choices carry over.
  const chooseType = (type) => setDesign(d => {
    const t = defaultDesign(type)
    return fitToRoom({ ...d, type, width: t.width, length: t.length, floor: t.floor })
  })

  // Editing a room from My Project (?edit=<id>), or designing a new one.
  const rooms = useProject()
  const [editId, setEditId] = useState(() => params.get('edit'))
  const editing = rooms.find(r => r.id === editId) || null
  // Confirmation after a save; it belongs to that exact design, so any
  // further change hides it.
  const [savedFor, setSavedFor] = useState(null)
  const saved = savedFor && savedFor.design === design ? savedFor : null

  // Keep the URL in step (debounced so slider drags don't spam history).
  useEffect(() => {
    const t = setTimeout(() => {
      const p = serializeDesign(design)
      if (editId) p.set('edit', editId)
      setParams(p, { replace: true })
    }, 300)
    return () => clearTimeout(t)
  }, [design, editId, setParams])

  const saveNew = () => {
    const room = addRoom(design)
    setEditId(room.id)
    setSavedFor({ name: room.name, updated: false, design })
  }
  const saveEdit = () => {
    updateRoom(editing.id, { design })
    setSavedFor({ name: editing.name, updated: true, design })
  }
  const startNew = () => {
    setEditId(null)
    setDesign(defaultDesign(design.type))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

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
  const bath = bathroomLayout(design)
  const kitchen = cabinetCounts(design)
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
      <Seo path="/design" />

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
                      <span className={on ? 'text-oak-300' : 'text-oak-500'}><RoomIcon type={key} /></span>
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
                      <span className="block h-12 rounded-lg mb-2 ring-1 ring-black/5" style={{ background: FLOOR_SWATCH[key] }} aria-hidden="true" />
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
              <>
                <Section num="04" title="Layout & cabinets">
                  <Field label="Layout">
                    <Choice label="Kitchen layout" options={KITCHEN_LAYOUTS} value={design.layout} onChange={(layout) => update({ layout })} columns={3} />
                  </Field>
                  <Field label="Upper storage">
                    <Choice label="Upper storage" options={UPPERS} value={design.uppers} onChange={(uppers) => update({ uppers })} columns={3} />
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Island">
                      <Choice label="Island" options={YES_NO} value={design.island} onChange={(island) => update({ island })} />
                    </Field>
                    <Field label="Pantry cabinet">
                      <Choice label="Pantry cabinet" options={YES_NO} value={design.pantry} onChange={(pantry) => update({ pantry })} />
                    </Field>
                  </div>
                  {design.island === 'yes' && !kitchen.islandFits && (
                    <Note>{design.layout === 'u' ? 'A U-shaped layout uses a peninsula instead of an island.' : 'An island needs a larger room. Try increasing the size.'}</Note>
                  )}
                  <Field label="Cabinet finish">
                    <SwatchChoice label="Cabinet finish" options={CABINETS} value={design.cabinets} onChange={(cabinets) => update({ cabinets })} />
                  </Field>
                  <Field label="Hardware" last>
                    <SwatchChoice label="Cabinet hardware" options={FINISHES} value={design.hardware} onChange={(hardware) => update({ hardware })} />
                  </Field>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Stat value={kitchen.base} label={`Base cabinets · ${kitchen.baseFt} linear ft`} />
                    <Stat value={design.uppers === 'cabinets' ? kitchen.uppers : '—'} label={design.uppers === 'cabinets' ? `Upper cabinets · ${kitchen.uppersFt} linear ft` : UPPERS[design.uppers].label} />
                  </div>
                </Section>
                <Section num="05" title="Countertop & backsplash">
                  <Field label="Countertop">
                    <SwatchChoice label="Countertop" options={COUNTERS} value={design.counter} onChange={(counter) => update({ counter })} columns={4} />
                  </Field>
                  <Field label="Backsplash" last>
                    <SwatchChoice label="Backsplash" options={BACKSPLASH} value={design.backsplash} onChange={(backsplash) => update({ backsplash })} columns={4} swatches={tileSwatch} />
                  </Field>
                </Section>
              </>
            )}

            {design.type === 'bathroom' && (
              <>
                <Section num="04" title="Shower design">
                  <Field label="Type">
                    <Choice label="Shower type" options={SHOWERS} value={design.shower} onChange={(shower) => update({ shower })} />
                  </Field>
                  <Field label="Shower tile">
                    <SwatchChoice label="Shower tile" options={SHOWER_TILES} value={design.showerTile} onChange={(showerTile) => update({ showerTile })} swatches={tileSwatch} />
                  </Field>
                  <Field label={design.shower === 'tub' ? 'Glass or curtain' : 'Glass'}>
                    <Choice label="Shower glass" options={GLASS} value={design.glass} onChange={(glass) => update({ glass })} columns={3} />
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Built-in niche">
                      <Choice label="Built-in niche" options={YES_NO} value={design.niche} onChange={(niche) => update({ niche })} />
                    </Field>
                    {design.shower === 'walkin' && (
                      <Field label="Tiled bench">
                        <Choice label="Tiled bench" options={YES_NO} value={design.bench} onChange={(bench) => update({ bench })} />
                      </Field>
                    )}
                  </div>
                  <Field label="Fixture finish" last>
                    <SwatchChoice label="Fixture finish" options={FINISHES} value={design.fixtures} onChange={(fixtures) => update({ fixtures })} />
                  </Field>
                </Section>
                <Section num="05" title="Vanity">
                  <Field label="Size">
                    <Choice label="Vanity size" options={VANITIES} value={design.vanity} onChange={(vanity) => update({ vanity })} />
                  </Field>
                  {!bath.vanityFits && (
                    <Note>This room is too small for a vanity alongside the shower and toilet. Try increasing the length.</Note>
                  )}
                  {bath.vanityFits && design.vanity === 'double' && !bath.doubleFits && (
                    <Note>A double vanity needs a longer room. Try increasing the length, or ask us about other layouts.</Note>
                  )}
                  <Field label="Cabinet finish">
                    <SwatchChoice label="Vanity finish" options={CABINETS} value={design.vanityFinish} onChange={(vanityFinish) => update({ vanityFinish })} />
                  </Field>
                  <Field label="Countertop" last>
                    <SwatchChoice label="Vanity countertop" options={BATH_COUNTERS} value={design.counter} onChange={(counter) => update({ counter })} />
                  </Field>
                </Section>
              </>
            )}

            {design.type === 'patio' && (
              <Section num="04" title="Enclosure">
                <Field label="Style">
                  <Choice label="Enclosure style" options={ENCLOSURES} value={design.enclosure} onChange={(enclosure) => update({ enclosure })} />
                </Field>
                <Field label="Panels" last>
                  <Choice label="Enclosure panels" options={PATIO_PANELS} value={design.panels} onChange={(panels) => update({ panels })} />
                </Field>
              </Section>
            )}

            {design.type !== 'patio' && (
              <Section num={design.type === 'kitchen' || design.type === 'bathroom' ? '06' : '04'} title="Finish & trim">
                <Choice label="Trim" options={TRIM} value={design.trim} onChange={(trim) => update({ trim })} />
              </Section>
            )}

            {/* Summary */}
            <section className="rounded-2xl bg-ink text-white p-5 md:p-6 shadow-xl shadow-stone-900/20">
              <div className="flex items-baseline justify-between gap-3 mb-4">
                <h2 className="font-display text-xl font-semibold">{editing ? editing.name : 'This room'}</h2>
                {editing && <span className="text-[11px] font-semibold tracking-wider uppercase text-oak-300">In your project</span>}
              </div>
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

              {/* Project actions */}
              <div className="flex flex-col gap-2.5">
                {editing ? (
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={saveEdit} className={primaryBtn}>Update room</button>
                    <button type="button" onClick={saveNew} className={secondaryBtn}>Save as new</button>
                  </div>
                ) : (
                  <button type="button" onClick={saveNew} className={primaryBtn}>
                    <CartIcon className="w-4 h-4" /> Add to my project
                  </button>
                )}
                <div aria-live="polite">
                  {saved && (
                    <div className="rounded-xl bg-white/5 ring-1 ring-white/10 px-4 py-3 text-sm animate-[fadeIn_300ms_ease-out_both]">
                      <p className="font-semibold text-white">
                        {saved.updated ? `${saved.name} updated.` : `${saved.name} added to your project.`}
                      </p>
                      <div className="flex flex-wrap gap-x-5 gap-y-1 mt-1.5">
                        <Link to="/project" className="text-oak-300 hover:text-oak-200 font-semibold">
                          View project ({rooms.length} room{rooms.length === 1 ? '' : 's'}) →
                        </Link>
                        <button type="button" onClick={startNew} className="text-stone-300 hover:text-white font-semibold cursor-pointer">
                          Design another room
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                {!saved && rooms.length > 0 && (
                  <Link to="/project" className="text-center text-sm text-stone-300 hover:text-white font-semibold py-1">
                    My project · {rooms.length} room{rooms.length === 1 ? '' : 's'} →
                  </Link>
                )}
              </div>

              <div className="border-t border-white/10 mt-5 pt-5 flex flex-col gap-2.5">
                <p className="text-xs text-stone-400">Just this room?</p>
                <Link to="/contact" className={secondaryBtn}>
                  Get a Free Estimate <span aria-hidden="true">→</span>
                </Link>
                {env.touch ? (
                  <a href={`sms:${PHONE}?&body=${encodeURIComponent(text)}`} className={secondaryBtn}>
                    Text this design to us
                  </a>
                ) : (
                  <a href={`tel:${PHONE}`} className={secondaryBtn}>
                    Call (386) 287-8579
                  </a>
                )}
                <button
                  type="button"
                  onClick={copy}
                  className="inline-flex items-center justify-center gap-2 text-stone-300 hover:text-white font-semibold px-6 py-2 text-sm transition-colors cursor-pointer"
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

const primaryBtn = 'inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold px-5 py-3.5 rounded-full tracking-wide transition-colors cursor-pointer'
const secondaryBtn = 'inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 ring-1 ring-inset ring-white/25 text-white font-bold px-5 py-3 rounded-full tracking-wide transition-colors cursor-pointer'

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
