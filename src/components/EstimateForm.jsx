import { useId, useRef, useState } from 'react'
import { newToken } from '../data/api'
import { SERVICE_OPTIONS, sendInquiry } from '../data/inquiries'

// Same rules as public/api/inquiry.php, checked here first so people see
// mistakes before sending. The server re-checks everything.
function validate(v, kind) {
  const e = {}
  const digits = v.phone.replace(/\D/g, '')
  if (v.name.trim().length < 2) e.name = 'Please enter your name.'
  if (v.phone.trim() && (digits.length < 7 || digits.length > 15)) e.phone = 'Please enter a valid phone number.'
  if (v.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim())) e.email = 'Please enter a valid email address.'
  if (!v.phone.trim() && !v.email.trim()) e.phone = 'Please give us a phone number or email so we can reach you.'
  if (kind === 'contact' && v.message.trim().length < 5) e.message = 'Please tell us a little about your project.'
  return e
}

const ORDER = ['name', 'phone', 'email', 'service', 'message']

function Field({ id, label, hint, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-stone-800">
        {label} {hint && <span className="font-normal text-stone-500">{hint}</span>}
      </label>
      {children}
      {error && <p id={`${id}-error`} className="text-sm text-red-700">{error}</p>}
    </div>
  )
}

const inputClass = (error) =>
  `w-full rounded-lg border px-3.5 py-2.5 text-base bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-red-600/40 ${
    error ? 'border-red-600' : 'border-stone-300 focus:border-red-600'
  }`

// Estimate request form. kind="contact" (Contact page) or kind="project"
// (sends the rooms from My Project along with the message).
export default function EstimateForm({ kind = 'contact', rooms, defaultService = '', onSent, submitLabel }) {
  const uid = useId()
  const formRef = useRef(null)
  const [values, setValues] = useState({ name: '', phone: '', email: '', service: defaultService, message: '' })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | sending | sent | error
  const [failure, setFailure] = useState('')
  const [token, setToken] = useState(newToken)
  const id = (name) => `${uid}-${name}`

  const set = (name) => (e) => {
    const value = e.target.value
    setValues(v => ({ ...v, [name]: value }))
    if (errors[name]) setErrors(err => ({ ...err, [name]: undefined }))
  }

  const focusFirst = (errs) => {
    const first = ORDER.find(k => errs[k])
    if (first) formRef.current?.querySelector(`#${CSS.escape(id(first))}`)?.focus()
  }

  const submit = async (e) => {
    e.preventDefault()
    if (status === 'sending') return
    const errs = validate(values, kind)
    setErrors(errs)
    if (Object.keys(errs).length) { focusFirst(errs); return }

    setStatus('sending')
    setFailure('')
    try {
      await sendInquiry({
        kind,
        ...values,
        rooms: kind === 'project' ? JSON.stringify(rooms.map(r => [r.name, r.params])) : undefined,
        token,
        company: formRef.current.elements.company.value,
      })
      setStatus('sent')
      onSent?.(values)
    } catch (err) {
      setStatus('error')
      setFailure(err.message)
      if (err.fields && Object.keys(err.fields).length) {
        setErrors(err.fields)
        focusFirst(err.fields)
      }
    }
  }

  const reset = () => {
    setValues({ name: '', phone: '', email: '', service: defaultService, message: '' })
    setErrors({})
    setStatus('idle')
    setToken(newToken())
  }

  if (status === 'sent') {
    return (
      <div role="status" className="rounded-xl bg-green-50 ring-1 ring-green-200 p-6">
        <p className="font-display text-2xl font-semibold text-stone-900 mb-2">Thank you, {values.name.trim().split(' ')[0]}!</p>
        <p className="text-stone-700">
          {kind === 'project'
            ? 'We’ve received your project and will be in touch soon to schedule your free estimate.'
            : 'We’ve received your message and will be in touch soon.'}{' '}
          If it’s urgent, call or text <a href="tel:+13862878579" className="font-semibold text-red-700 underline">(386) 287-8579</a>.
        </p>
        {kind === 'contact' && (
          <button type="button" onClick={reset} className="mt-4 text-sm font-semibold text-stone-700 underline cursor-pointer">
            Send another message
          </button>
        )}
      </div>
    )
  }

  const describedBy = (name) => (errors[name] ? `${id(name)}-error` : undefined)

  return (
    <form ref={formRef} onSubmit={submit} noValidate className="flex flex-col gap-4">
      <Field id={id('name')} label="Name" error={errors.name}>
        <input id={id('name')} value={values.name} onChange={set('name')} autoComplete="name" maxLength={80}
          aria-invalid={!!errors.name} aria-describedby={describedBy('name')} className={inputClass(errors.name)} />
      </Field>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field id={id('phone')} label="Phone" error={errors.phone}>
          <input id={id('phone')} type="tel" value={values.phone} onChange={set('phone')} autoComplete="tel" maxLength={30}
            aria-invalid={!!errors.phone} aria-describedby={describedBy('phone')} className={inputClass(errors.phone)} />
        </Field>
        <Field id={id('email')} label="Email" hint="(optional)" error={errors.email}>
          <input id={id('email')} type="email" value={values.email} onChange={set('email')} autoComplete="email" maxLength={120}
            aria-invalid={!!errors.email} aria-describedby={describedBy('email')} className={inputClass(errors.email)} />
        </Field>
      </div>
      {kind === 'contact' && (
        <Field id={id('service')} label="Service" hint="(optional)">
          <select id={id('service')} value={values.service} onChange={set('service')} className={inputClass(false)}>
            <option value="">Select a service…</option>
            {SERVICE_OPTIONS.map(s => <option key={s}>{s}</option>)}
          </select>
        </Field>
      )}
      <Field id={id('message')} label={kind === 'project' ? 'Anything else we should know?' : 'Message'} hint={kind === 'project' ? '(optional)' : ''} error={errors.message}>
        <textarea id={id('message')} rows={4} value={values.message} onChange={set('message')} maxLength={2000}
          placeholder={kind === 'project' ? 'Timeline, questions, best time to call…' : 'Tell us about your project…'}
          aria-invalid={!!errors.message} aria-describedby={describedBy('message')} className={`${inputClass(errors.message)} resize-y`} />
      </Field>

      {/* Honeypot for bots: hidden from people and assistive tech. */}
      <div aria-hidden="true" className="absolute -left-[9999px] w-px h-px overflow-hidden">
        <label>Company <input name="company" tabIndex={-1} autoComplete="off" defaultValue="" /></label>
      </div>

      {status === 'error' && failure && (
        <p role="alert" className="rounded-lg bg-red-50 ring-1 ring-red-200 px-4 py-3 text-sm text-red-800">
          {failure}{!failure.includes('287-8579') && <> You can also call or text <a href="tel:+13862878579" className="font-semibold underline">(386) 287-8579</a>.</>}
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 disabled:opacity-60 text-white font-bold px-6 py-3.5 rounded-full tracking-wide transition-colors cursor-pointer"
      >
        {status === 'sending' ? 'Sending…' : (submitLabel || 'Send message')}
      </button>
      <p className="text-xs text-stone-500">We only use your details to reply about your project.</p>
    </form>
  )
}
