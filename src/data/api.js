// POSTs form fields to one of the PHP endpoints in public/api/ and returns
// its JSON. Errors carry `fields` (per-field messages) and `status`.

export async function postApi(url, fields) {
  const body = new FormData()
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined && value !== null) body.append(key, value)
  }

  let res
  try {
    res = await fetch(url, { method: 'POST', body })
  } catch {
    throw Object.assign(new Error('Could not reach the server. Check your connection and try again.'), { network: true })
  }

  // Only trust real answers from the PHP endpoints. Without PHP (e.g. `npm
  // run dev` on its own, or a host without PHP) the request comes back as the
  // site's HTML page with a 200, which must not count as success.
  const isJson = (res.headers.get('content-type') || '').includes('application/json')
  const data = isJson ? await res.json().catch(() => null) : null
  if (!data) {
    throw new Error(import.meta.env.DEV
      ? 'The PHP server isn’t running. Start it in a second terminal with `npm run php`, then try again.'
      : 'The server didn’t respond correctly. Please try again, or call or text (386) 287-8579.')
  }
  if (!res.ok) {
    throw Object.assign(new Error(data.error || `Server error (${res.status}).`), { fields: data.fields || {}, status: res.status })
  }
  return data
}

// One random id per form, so a double submit or retry isn't stored twice.
export const newToken = () =>
  (crypto.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`)
