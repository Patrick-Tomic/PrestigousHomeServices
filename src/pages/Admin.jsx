import { useState, useEffect, useRef } from 'react'
import { Helmet } from 'react-helmet-async'
import { CATEGORIES, callApi, fetchUploadedPhotos } from '../data/gallery'

const SESSION_KEY = 'gallery-admin-password'
const MAX_SIDE = 2000

function readSession() {
  try { return sessionStorage.getItem(SESSION_KEY) || '' } catch { return '' }
}
function writeSession(value) {
  try {
    if (value) sessionStorage.setItem(SESSION_KEY, value)
    else sessionStorage.removeItem(SESSION_KEY)
  } catch { /* storage unavailable */ }
}

// Phone photos are often 5–12 MB. Shrink them to a web-friendly size and
// re-encode as JPEG, which also strips EXIF data such as GPS location.
async function prepareImage(file) {
  let bitmap
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  } catch {
    throw new Error('This file type can’t be read. Please use a JPG or PNG photo.')
  }
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  return new Promise((resolve, reject) =>
    canvas.toBlob(b => (b ? resolve(b) : reject(new Error('Could not process this photo.'))), 'image/jpeg', 0.85)
  )
}

function Login({ onLogin }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await callApi({ action: 'login', password })
      onLogin(password)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="max-w-sm mx-auto bg-white border border-stone-200 rounded-lg shadow-sm p-6 flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-bold text-stone-800">Sign in</h2>
        <p className="text-sm text-stone-500 mt-1">Enter the admin password to manage gallery photos.</p>
      </div>
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        autoComplete="current-password"
        placeholder="Password"
        className="border border-stone-300 rounded-md px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500"
        autoFocus
        required
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        disabled={busy || !password}
        className="bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold py-2.5 rounded-md transition-colors"
      >
        {busy ? 'Checking…' : 'Sign in'}
      </button>
    </form>
  )
}

function Uploader({ password, onUploaded, onAuthError }) {
  const [items, setItems] = useState([])
  const [category, setCategory] = useState(CATEGORIES[0])
  const [busy, setBusy] = useState(false)
  const inputRef = useRef(null)
  const itemsRef = useRef(items)
  useEffect(() => { itemsRef.current = items })

  // Free preview URLs when leaving the page.
  useEffect(() => () => itemsRef.current.forEach(i => URL.revokeObjectURL(i.preview)), [])

  const addFiles = (files) => {
    const next = [...files]
      .filter(f => f.type.startsWith('image/') || /\.(heic|heif)$/i.test(f.name))
      .map(file => ({
        key: `${file.name}-${file.size}-${Math.random()}`,
        file,
        preview: URL.createObjectURL(file),
        category,
        label: '',
        status: 'ready',
        error: '',
      }))
    setItems(prev => [...prev, ...next])
  }

  const update = (key, patch) => setItems(prev => prev.map(i => (i.key === key ? { ...i, ...patch } : i)))
  const remove = (key) => setItems(prev => {
    const item = prev.find(i => i.key === key)
    if (item) URL.revokeObjectURL(item.preview)
    return prev.filter(i => i.key !== key)
  })

  const uploadAll = async () => {
    setBusy(true)
    for (const item of items.filter(i => i.status !== 'done')) {
      update(item.key, { status: 'uploading', error: '' })
      try {
        const photo = await prepareImage(item.file)
        const { photo: saved } = await callApi({
          action: 'upload',
          password,
          category: item.category,
          label: item.label,
          photo: new File([photo], 'photo.jpg', { type: 'image/jpeg' }),
        })
        update(item.key, { status: 'done' })
        onUploaded(saved)
      } catch (err) {
        if (err.message === 'Wrong password.') { onAuthError(); return }
        update(item.key, { status: 'error', error: err.message })
      }
    }
    setBusy(false)
  }

  const clearDone = () => items.filter(i => i.status === 'done').forEach(i => remove(i.key))
  const pending = items.filter(i => i.status !== 'done').length

  return (
    <section className="bg-white border border-stone-200 rounded-lg shadow-sm p-5 sm:p-6">
      <h2 className="text-xl font-bold text-stone-800 mb-4">Add photos</h2>

      <label className="block text-sm font-semibold text-stone-700 mb-1" htmlFor="default-category">
        Category for new photos
      </label>
      <select
        id="default-category"
        value={category}
        onChange={e => setCategory(e.target.value)}
        className="w-full sm:w-64 border border-stone-300 rounded-md px-3 py-2 mb-4 bg-white"
      >
        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
      </select>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); addFiles(e.dataTransfer.files) }}
        className="w-full border-2 border-dashed border-stone-300 hover:border-red-500 rounded-lg py-10 px-4 text-center transition-colors"
      >
        <span className="block font-bold text-stone-800">Tap to choose photos</span>
        <span className="block text-sm text-stone-500 mt-1">or drag them here · you can pick several at once</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={e => { addFiles(e.target.files); e.target.value = '' }}
      />

      {items.length > 0 && (
        <ul className="mt-5 flex flex-col gap-3">
          {items.map(item => (
            <li key={item.key} className="flex gap-3 items-start border border-stone-200 rounded-md p-3">
              <img src={item.preview} alt="" className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded bg-stone-100 shrink-0" />
              <div className="flex-1 min-w-0 flex flex-col gap-2">
                <input
                  value={item.label}
                  onChange={e => update(item.key, { label: e.target.value })}
                  placeholder="Caption, e.g. Walk-in shower remodel"
                  maxLength={80}
                  disabled={item.status === 'uploading' || item.status === 'done'}
                  className="border border-stone-300 rounded-md px-3 py-2 text-sm w-full disabled:bg-stone-50"
                />
                <div className="flex items-center gap-2 flex-wrap">
                  <select
                    value={item.category}
                    onChange={e => update(item.key, { category: e.target.value })}
                    disabled={item.status === 'uploading' || item.status === 'done'}
                    className="border border-stone-300 rounded-md px-2 py-1.5 text-sm bg-white disabled:bg-stone-50"
                  >
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                  {item.status === 'uploading' && <span className="text-sm text-stone-500">Uploading…</span>}
                  {item.status === 'done' && <span className="text-sm text-green-700 font-semibold">✓ Added to gallery</span>}
                  {item.status === 'error' && <span className="text-sm text-red-600">{item.error}</span>}
                </div>
              </div>
              {item.status !== 'uploading' && item.status !== 'done' && (
                <button
                  type="button"
                  onClick={() => remove(item.key)}
                  className="text-stone-400 hover:text-red-600 text-2xl leading-none px-1"
                  aria-label="Remove from upload list"
                >
                  ×
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {items.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={uploadAll}
            disabled={busy || pending === 0}
            className="bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-md transition-colors"
          >
            {busy ? 'Uploading…' : `Upload ${pending} photo${pending === 1 ? '' : 's'}`}
          </button>
          {items.some(i => i.status === 'done') && !busy && (
            <button type="button" onClick={clearDone} className="text-sm text-stone-500 hover:text-stone-800">
              Clear finished
            </button>
          )}
        </div>
      )}
    </section>
  )
}

function ManagePhotos({ photos, loading, onDelete }) {
  const [deleting, setDeleting] = useState(null)
  const [error, setError] = useState('')

  const handleDelete = async (photo) => {
    if (!window.confirm(`Remove “${photo.label}” from the gallery? This can’t be undone.`)) return
    setDeleting(photo.id)
    setError('')
    try {
      await onDelete(photo)
    } catch (err) {
      setError(err.message)
    } finally {
      setDeleting(null)
    }
  }

  return (
    <section className="bg-white border border-stone-200 rounded-lg shadow-sm p-5 sm:p-6">
      <h2 className="text-xl font-bold text-stone-800">Uploaded photos</h2>
      <p className="text-sm text-stone-500 mt-1 mb-4">Newest first. These appear at the top of the gallery.</p>
      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      {loading ? (
        <p className="text-stone-400 text-sm">Loading…</p>
      ) : photos.length === 0 ? (
        <p className="text-stone-400 text-sm">No photos uploaded yet.</p>
      ) : (
        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {photos.map(photo => (
            <li key={photo.id} className="border border-stone-200 rounded-md overflow-hidden">
              <img src={photo.src} alt={photo.label} loading="lazy" className="w-full aspect-video object-cover bg-stone-100" />
              <div className="p-2">
                <p className="text-xs font-bold text-red-600 uppercase tracking-wider">{photo.category}</p>
                <p className="text-sm text-stone-800 truncate">{photo.label}</p>
                <button
                  type="button"
                  onClick={() => handleDelete(photo)}
                  disabled={deleting === photo.id}
                  className="mt-1 text-sm text-stone-500 hover:text-red-600 disabled:opacity-50"
                >
                  {deleting === photo.id ? 'Removing…' : 'Remove'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default function Admin() {
  const [password, setPassword] = useState(readSession)
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!password) return
    fetchUploadedPhotos().then(list => { setPhotos(list); setLoading(false) })
  }, [password])

  const login = (value) => { writeSession(value); setPassword(value) }
  const logout = () => { writeSession(''); setPassword('') }

  const addPhoto = (photo) =>
    setPhotos(prev => [{ ...photo, src: `/uploads/gallery/${photo.file}` }, ...prev])

  const deletePhoto = async (photo) => {
    try {
      await callApi({ action: 'delete', password, id: photo.id })
    } catch (err) {
      if (err.message === 'Wrong password.') logout()
      throw err
    }
    setPhotos(prev => prev.filter(p => p.id !== photo.id))
  }

  return (
    <>
      <Helmet>
        <title>Gallery Admin | Prestigious Home Services, LLC.</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <section className="bg-stone-900 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Gallery Admin</h1>
            <div className="w-16 h-1 bg-red-600" />
          </div>
          {password && (
            <button onClick={logout} className="text-sm text-stone-400 hover:text-white">Sign out</button>
          )}
        </div>
      </section>

      <div className="bg-stone-50 py-10">
        <div className="max-w-4xl mx-auto px-4 flex flex-col gap-6">
          {password ? (
            <>
              <Uploader password={password} onUploaded={addPhoto} onAuthError={logout} />
              <ManagePhotos photos={photos} loading={loading} onDelete={deletePhoto} />
            </>
          ) : (
            <Login onLogin={login} />
          )}
        </div>
      </div>
    </>
  )
}
