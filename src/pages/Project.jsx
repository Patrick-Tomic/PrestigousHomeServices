import { useEffect, useMemo, useRef, useState } from 'react'
import Seo from '../components/Seo'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  FLOORS, FLOOR_COLOR, PHONE, ROOM_TYPES, WASTE, area, projectText, projectTotals, summaryLines,
} from '../components/designer/designOptions'
import {
  decodeProject, duplicateRoom, encodeProject, importRooms, removeRoom, restoreRoom, roomDesign, updateRoom, useProject,
} from '../components/designer/projectStore'
import { CartIcon, RoomIcon } from '../components/designer/icons'
import EstimateForm from '../components/EstimateForm'

const media = (q) => window.matchMedia(q).matches

const primaryBtn = 'inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold px-5 py-3.5 rounded-full tracking-wide transition-colors cursor-pointer'
const secondaryBtn = 'inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 ring-1 ring-inset ring-white/25 text-white font-bold px-5 py-3 rounded-full tracking-wide transition-colors cursor-pointer'
const smallBtn = 'inline-flex items-center gap-1.5 text-sm font-semibold text-stone-600 hover:text-red-600 transition-colors cursor-pointer'

// Copy text, falling back to a prompt where the clipboard API is blocked.
function useCopy() {
  const [copied, setCopied] = useState(null)
  const timer = useRef(null)
  useEffect(() => () => clearTimeout(timer.current), [])
  const copy = async (key, text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(key)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(null), 2200)
    } catch {
      window.prompt('Copy this:', text)
    }
  }
  return [copied, copy]
}

function RoomCard({ room, index, readOnly, onRemove }) {
  const d = room.design
  const lines = summaryLines(d).filter(([k]) => k !== 'Room')
  const needed = Math.ceil(area(d) * (1 + WASTE))
  const [name, setName] = useState(room.name)

  return (
    <article className="rounded-2xl bg-white ring-1 ring-stone-200/80 overflow-hidden">
      <div className="flex items-stretch">
        <div className="w-1.5 shrink-0" style={{ background: FLOOR_COLOR[d.floor] }} aria-hidden="true" />
        <div className="flex-1 p-5 md:p-6 min-w-0">
          <div className="flex items-start gap-3 mb-4">
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-oak-100 text-oak-600 ring-1 ring-oak-200 shrink-0">
              <RoomIcon type={d.type} />
            </span>
            <div className="flex-1 min-w-0">
              {readOnly ? (
                <h2 className="font-display text-xl font-semibold text-stone-900 truncate">{room.name}</h2>
              ) : (
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => updateRoom(room.id, { name: name.trim() || ROOM_TYPES[d.type].label })}
                  onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur() }}
                  maxLength={40}
                  aria-label={`Name for room ${index + 1}`}
                  className="w-full font-display text-xl font-semibold text-stone-900 bg-transparent rounded-md px-1 -mx-1 hover:bg-stone-50 focus:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-red-600/40"
                />
              )}
              <p className="text-xs text-stone-500 mt-0.5">
                {ROOM_TYPES[d.type].label} · {d.width} × {d.length} ft · {area(d)} sq ft
              </p>
            </div>
          </div>

          <dl className="grid sm:grid-cols-2 gap-x-6 text-sm">
            {lines.filter(([k]) => k !== 'Size').map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3 py-1.5 border-b border-stone-100">
                <dt className="text-stone-500">{k}</dt>
                <dd className="text-right font-medium text-stone-800">{v}</dd>
              </div>
            ))}
            <div className="flex justify-between gap-3 py-1.5 border-b border-stone-100">
              <dt className="text-stone-500">Flooring needed</dt>
              <dd className="text-right font-medium text-stone-800">≈ {needed} sq ft</dd>
            </div>
          </dl>

          {!readOnly && (
            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4">
              <Link to={`/design?${room.params}&edit=${room.id}`} className={smallBtn}>Edit in designer →</Link>
              <button type="button" onClick={() => duplicateRoom(room.id)} className={smallBtn}>Duplicate</button>
              <button type="button" onClick={() => onRemove(room, index)} className={smallBtn}>Remove</button>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}

function Totals({ rooms }) {
  const t = projectTotals(rooms.map(r => r.design))
  return (
    <>
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="rounded-xl bg-white/5 ring-1 ring-white/10 px-4 py-3">
          <p className="font-display text-3xl font-semibold tabular-nums leading-none">{t.rooms}</p>
          <p className="text-xs text-stone-400 mt-1">Room{t.rooms === 1 ? '' : 's'}</p>
        </div>
        <div className="rounded-xl bg-white/5 ring-1 ring-white/10 px-4 py-3">
          <p className="font-display text-3xl font-semibold tabular-nums leading-none">{t.sqft}</p>
          <p className="text-xs text-stone-400 mt-1">Total sq ft</p>
        </div>
      </div>
      <p className="text-xs font-semibold tracking-wider uppercase text-oak-300 mb-1">Flooring needed</p>
      <dl className="divide-y divide-white/10 text-sm">
        {t.flooring.map(f => (
          <div key={f.floor} className="flex items-center justify-between gap-3 py-2">
            <dt className="flex items-center gap-2 text-stone-300">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: FLOOR_COLOR[f.floor] }} aria-hidden="true" />
              {FLOORS[f.floor].label}
            </dt>
            <dd className="font-medium">≈ {f.needed} sq ft</dd>
          </div>
        ))}
      </dl>
      <p className="text-[11px] text-stone-500 mt-1">
        Includes about {Math.round(WASTE * 100)}% extra for cuts and waste. Exact quantities are confirmed when we measure.
      </p>
    </>
  )
}

export default function Project() {
  const saved = useProject()
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const [touch] = useState(() => media('(pointer: coarse)'))
  const [copied, copy] = useCopy()
  const [removed, setRemoved] = useState(null)

  // A shared project link (?share=…) is shown read-only until saved.
  const shareCode = params.get('share')
  const shared = useMemo(() => (shareCode ? decodeProject(shareCode) : null), [shareCode])
  const viewing = shared && shared.length ? shared : null
  const list = viewing || saved
  const rooms = useMemo(() => list.map(r => ({ ...r, design: roomDesign(r) })), [list])

  const shareUrl = `${window.location.origin}/project?share=${encodeProject(list)}`
  const text = rooms.length ? projectText(rooms, shareUrl) : ''

  const remove = (room, index) => {
    removeRoom(room.id)
    setRemoved({ room, index })
  }
  const saveShared = () => {
    importRooms(viewing)
    setParams({}, { replace: true })
  }

  return (
    <>
      <Seo path="/project" />

      <section className="bg-ink text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-red-600" aria-hidden="true" />
        <div className="max-w-6xl mx-auto px-6 py-14 md:py-16">
          <p className="text-oak-300 font-semibold tracking-[0.3em] uppercase text-xs mb-4">Plan Your Project</p>
          <h1 className="font-display text-4xl md:text-6xl font-semibold leading-tight mb-4">
            {viewing ? 'Shared Project' : 'My Project'}
          </h1>
          <p className="text-stone-300 text-lg max-w-2xl leading-relaxed">
            {viewing
              ? 'Someone shared these room designs with you. Save them to your own project to edit or add to them.'
              : 'Every room you design lives here. Add as many as you like, then send the whole project to us for one free estimate.'}
          </p>
        </div>
      </section>

      <section className="bg-cream py-8 md:py-12 min-h-[50vh]">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          {viewing && (
            <div className="mb-6 rounded-2xl bg-oak-100 ring-1 ring-oak-200 p-4 md:p-5 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
              <p className="text-sm text-stone-800">
                <span className="font-semibold">{viewing.length} room{viewing.length === 1 ? '' : 's'}</span> in this shared project.
              </p>
              <div className="flex gap-3">
                <button type="button" onClick={saveShared} className="inline-flex items-center gap-2 bg-ink hover:bg-stone-800 text-white font-bold px-5 py-2.5 rounded-full text-sm cursor-pointer">
                  <CartIcon className="w-4 h-4" /> Save to my project
                </button>
                <button type="button" onClick={() => navigate('/project')} className="text-sm font-semibold text-stone-700 hover:text-stone-900 px-2 cursor-pointer">
                  Not now
                </button>
              </div>
            </div>
          )}

          {rooms.length === 0 ? (
            <div className="max-w-lg mx-auto text-center py-16">
              <span className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white ring-1 ring-stone-200 text-oak-500 mb-6">
                <CartIcon className="w-7 h-7" />
              </span>
              <h2 className="font-display text-3xl font-semibold text-stone-900 mb-3">Your project is empty</h2>
              <p className="text-stone-600 mb-8">
                Design a room — pick the size, flooring and finishes — then add it here. You can add a kitchen, bathrooms, living areas and more.
              </p>
              <Link to="/design" className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold px-7 py-3.5 rounded-full tracking-wide transition-colors">
                Design a room <span aria-hidden="true">→</span>
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-[minmax(0,1fr)_380px] gap-6 lg:gap-8 items-start">
              <div className="flex flex-col gap-4">
                {rooms.map((r, i) => (
                  <RoomCard key={r.id} room={r} index={i} readOnly={!!viewing} onRemove={remove} />
                ))}
                {!viewing && (
                  <Link
                    to="/design"
                    className="rounded-2xl border-2 border-dashed border-stone-300 hover:border-red-600 hover:text-red-600 text-stone-600 font-semibold py-8 text-center transition-colors"
                  >
                    + Design another room
                  </Link>
                )}
              </div>

              <div className="flex flex-col gap-4">
              {/* Send the whole project: goes straight to the owner's inbox */}
              {!viewing && (
                <section id="send" className="rounded-2xl bg-white ring-1 ring-stone-200 p-5 md:p-6 shadow-sm scroll-mt-24" aria-labelledby="send-title">
                  <h2 id="send-title" className="font-display text-xl font-semibold text-stone-900 mb-1">Get a free estimate</h2>
                  <p className="text-sm text-stone-600 mb-5">
                    Send all {rooms.length} room{rooms.length === 1 ? '' : 's'} to us with your contact details.
                  </p>
                  <EstimateForm kind="project" rooms={list} submitLabel="Send my project" />
                </section>
              )}
              <aside className="rounded-2xl bg-ink text-white p-5 md:p-6 shadow-xl shadow-stone-900/20">
                <h2 className="font-display text-xl font-semibold mb-4">Project summary</h2>
                <Totals rooms={rooms} />
                <div className="flex flex-col gap-2.5 mt-6">
                  {viewing && <Link to="/contact" className={primaryBtn}>Get a Free Estimate <span aria-hidden="true">→</span></Link>}
                  {touch ? (
                    <a href={`sms:${PHONE}?&body=${encodeURIComponent(text)}`} className={secondaryBtn}>Text my project to us</a>
                  ) : (
                    <a href={`tel:${PHONE}`} className={secondaryBtn}>Call (386) 287-8579</a>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => copy('text', text)} className="text-sm font-semibold text-stone-300 hover:text-white py-2 cursor-pointer">
                      {copied === 'text' ? 'Copied ✓' : 'Copy details'}
                    </button>
                    <button type="button" onClick={() => copy('link', shareUrl)} className="text-sm font-semibold text-stone-300 hover:text-white py-2 cursor-pointer">
                      {copied === 'link' ? 'Link copied ✓' : 'Copy share link'}
                    </button>
                  </div>
                </div>
              </aside>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Undo toast after removing a room */}
      <div aria-live="polite" className="fixed bottom-4 inset-x-0 flex justify-center pointer-events-none z-40 px-4">
        {removed && (
          <div className="pointer-events-auto flex items-center gap-4 bg-ink text-white rounded-full pl-5 pr-2 py-2 shadow-2xl animate-[fadeIn_250ms_ease-out_both]">
            <span className="text-sm">Removed {removed.room.name}.</span>
            <button
              type="button"
              onClick={() => { restoreRoom(removed.room, removed.index); setRemoved(null) }}
              className="text-sm font-bold text-oak-300 hover:text-oak-200 px-3 py-1.5 cursor-pointer"
            >
              Undo
            </button>
            <button type="button" onClick={() => setRemoved(null)} aria-label="Dismiss" className="text-stone-400 hover:text-white px-2 cursor-pointer">×</button>
          </div>
        )}
      </div>
    </>
  )
}
