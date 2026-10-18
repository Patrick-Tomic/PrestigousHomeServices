import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminApi } from '../../data/inquiries'
import { parseDesign, summaryLines } from '../designer/designOptions'
import { encodeProject } from '../designer/projectStore'

const STATUSES = [
  { id: 'new', label: 'New', tone: 'bg-red-100 text-red-800' },
  { id: 'contacted', label: 'Contacted', tone: 'bg-amber-100 text-amber-900' },
  { id: 'closed', label: 'Closed', tone: 'bg-stone-200 text-stone-700' },
]

const when = (iso) => new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })

function Rooms({ rooms }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="mt-3 rounded-lg bg-stone-50 ring-1 ring-stone-200">
      <button type="button" onClick={() => setOpen(o => !o)} aria-expanded={open} className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold text-stone-800">
        {rooms.length} designed room{rooms.length === 1 ? '' : 's'}: {rooms.map(r => r.name).join(', ')}
        <span aria-hidden="true">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="px-3 pb-3 flex flex-col gap-3">
          {rooms.map((r, i) => (
            <div key={i} className="text-sm">
              <p className="font-semibold text-stone-900">{r.name}</p>
              <ul className="text-stone-700">
                {summaryLines(parseDesign(new URLSearchParams(r.params))).filter(([k]) => k !== 'Room').map(([k, v]) => (
                  <li key={k}><span className="text-stone-500">{k}:</span> {v}</li>
                ))}
              </ul>
              <Link to={`/design?${r.params}`} target="_blank" className="text-red-700 font-semibold hover:underline">Open in designer ↗</Link>
            </div>
          ))}
          <Link to={`/project?share=${encodeProject(rooms)}`} target="_blank" className="text-sm text-red-700 font-semibold hover:underline">
            View the whole project ↗
          </Link>
        </div>
      )}
    </div>
  )
}

function InquiryCard({ inquiry, onStatus, onDelete }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const status = STATUSES.find(s => s.id === inquiry.status) || STATUSES[0]
  const first = inquiry.name.split(' ')[0]

  const run = async (fn) => {
    setBusy(true)
    setError('')
    try { await fn() } catch (err) { setError(err.message) } finally { setBusy(false) }
  }

  return (
    <li className="bg-white border border-stone-200 rounded-lg shadow-sm p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-stone-900 text-lg">{inquiry.name}</p>
          <p className="text-sm text-stone-500">
            {when(inquiry.createdAt)} · {inquiry.kind === 'project' ? 'Project estimate request' : 'Message'}
            {inquiry.service && ` · ${inquiry.service}`}
          </p>
        </div>
        <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${status.tone}`}>{status.label}</span>
      </div>

      <div className="flex flex-wrap gap-2 mt-3">
        {inquiry.phone && <a href={`tel:${inquiry.phone.replace(/[^\d+]/g, '')}`} className="text-sm font-semibold bg-ink text-white rounded-full px-3.5 py-1.5">Call {inquiry.phone}</a>}
        {inquiry.phone && <a href={`sms:${inquiry.phone.replace(/[^\d+]/g, '')}`} className="text-sm font-semibold ring-1 ring-stone-300 rounded-full px-3.5 py-1.5 text-stone-800">Text</a>}
        {inquiry.email && <a href={`mailto:${inquiry.email}?subject=${encodeURIComponent('Your free estimate — Prestigious Home Services')}&body=${encodeURIComponent(`Hi ${first},\n\n`)}`} className="text-sm font-semibold ring-1 ring-stone-300 rounded-full px-3.5 py-1.5 text-stone-800">Email {inquiry.email}</a>}
      </div>

      {inquiry.message && <p className="mt-3 text-stone-800 whitespace-pre-line">{inquiry.message}</p>}
      {inquiry.rooms?.length > 0 && <Rooms rooms={inquiry.rooms} />}

      <div className="flex flex-wrap items-center gap-4 mt-4 pt-3 border-t border-stone-100">
        <label className="text-sm text-stone-600 flex items-center gap-2">
          Status
          <select
            value={inquiry.status}
            disabled={busy}
            onChange={e => run(() => onStatus(inquiry, e.target.value))}
            className="border border-stone-300 rounded-md px-2 py-1 text-sm bg-white"
          >
            {STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </label>
        <button
          type="button"
          disabled={busy}
          onClick={() => window.confirm(`Delete the inquiry from ${inquiry.name}? This can’t be undone.`) && run(() => onDelete(inquiry))}
          className="text-sm text-stone-500 hover:text-red-700 disabled:opacity-50"
        >
          Delete
        </button>
        {error && <p className="text-sm text-red-700">{error}</p>}
      </div>
    </li>
  )
}

// Estimate requests from the Contact form and "Send my project".
export default function InquiryInbox({ password, onAuthError, onNewCount }) {
  const [inquiries, setInquiries] = useState(null)
  const [emailConfigured, setEmailConfigured] = useState(true)
  const [filter, setFilter] = useState('open')
  const [error, setError] = useState('')

  const call = useCallback(async (fields) => {
    try {
      return await adminApi({ ...fields, password })
    } catch (err) {
      if (err.status === 401) onAuthError()
      throw err
    }
  }, [password, onAuthError])

  const apply = (data) => {
    setError('')
    setInquiries(data.inquiries)
    setEmailConfigured(data.emailConfigured)
  }
  const fail = (err) => {
    setError(err.message)
    setInquiries(list => list ?? [])
  }
  const load = () => call({ action: 'inquiries' }).then(apply, fail)

  useEffect(() => {
    let alive = true
    call({ action: 'inquiries' }).then(
      data => { if (alive) apply(data) },
      err => { if (alive) fail(err) },
    )
    return () => { alive = false }
  }, [call])
  useEffect(() => { onNewCount(inquiries ? inquiries.filter(i => i.status === 'new').length : 0) }, [inquiries, onNewCount])

  const setStatus = async (inquiry, status) => {
    await call({ action: 'inquiry-status', id: inquiry.id, status })
    setInquiries(list => list.map(i => (i.id === inquiry.id ? { ...i, status } : i)))
  }
  const remove = async (inquiry) => {
    await call({ action: 'inquiry-delete', id: inquiry.id })
    setInquiries(list => list.filter(i => i.id !== inquiry.id))
  }

  const counts = inquiries
    ? { open: inquiries.filter(i => i.status !== 'closed').length, closed: inquiries.filter(i => i.status === 'closed').length, all: inquiries.length }
    : { open: 0, closed: 0, all: 0 }
  const shown = (inquiries || []).filter(i => filter === 'all' || (filter === 'open' ? i.status !== 'closed' : i.status === 'closed'))

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex gap-1 p-1 rounded-full bg-white ring-1 ring-stone-200" role="group" aria-label="Filter inquiries">
          {[['open', 'Open'], ['closed', 'Closed'], ['all', 'All']].map(([id, label]) => (
            <button key={id} type="button" aria-pressed={filter === id} onClick={() => setFilter(id)}
              className={`px-3.5 py-1.5 rounded-full text-sm font-semibold ${filter === id ? 'bg-ink text-white' : 'text-stone-600 hover:text-stone-900'}`}>
              {label} <span className="opacity-70 tabular-nums">{counts[id]}</span>
            </button>
          ))}
        </div>
        <button type="button" onClick={load} className="text-sm font-semibold text-stone-600 hover:text-stone-900">Refresh</button>
      </div>

      {!emailConfigured && (
        <p className="text-sm text-stone-600 bg-white ring-1 ring-stone-200 rounded-lg px-4 py-3">
          Tip: to also get each request by email, add <code className="text-xs bg-stone-100 px-1 rounded">notify_email</code> to <code className="text-xs bg-stone-100 px-1 rounded">api/config.php</code> on the server.
        </p>
      )}
      {error && <p role="alert" className="text-sm text-red-800 bg-red-50 ring-1 ring-red-200 rounded-lg px-4 py-3">{error}</p>}

      {inquiries === null ? (
        <p className="text-stone-500 text-sm">Loading…</p>
      ) : shown.length === 0 ? (
        <div className="bg-white border border-dashed border-stone-300 rounded-lg p-8 text-center">
          <p className="font-semibold text-stone-800">{filter === 'closed' ? 'No closed inquiries.' : 'No open inquiries right now.'}</p>
          <p className="text-sm text-stone-500 mt-1">Requests from the Contact form and the room designer appear here.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {shown.map(i => <InquiryCard key={i.id} inquiry={i} onStatus={setStatus} onDelete={remove} />)}
        </ul>
      )}
    </section>
  )
}
