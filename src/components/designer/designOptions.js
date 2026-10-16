// Everything the room designer can configure, drawn from the services the
// site offers (flooring types, bathroom and kitchen work, enclosed patios).
// The design lives in the URL query string so it can be shared or texted.

export const PHONE = '+13862878579'

export const ROOM_TYPES = {
  living: { label: 'Living Area', size: [16, 20], range: [8, 30], floor: 'hardwood' },
  bedroom: { label: 'Bedroom', size: [12, 14], range: [8, 24], floor: 'hardwood' },
  kitchen: { label: 'Kitchen', size: [12, 14], range: [8, 26], floor: 'tile' },
  bathroom: { label: 'Bathroom', size: [8, 10], range: [5, 16], floor: 'tile' },
  patio: { label: 'Enclosed Patio', size: [12, 16], range: [8, 26], floor: 'stone' },
}

export const FLOORS = {
  hardwood: { label: 'Hardwood', note: 'Warm, classic, refinishable' },
  laminate: { label: 'Laminate', note: 'Durable and budget-friendly' },
  tile: { label: 'Tile', note: 'Ceramic & porcelain, water-resistant' },
  stone: { label: 'Natural Stone', note: 'Travertine-style, one of a kind' },
}

// Tones multiply the floor texture; each material gets its own palette.
export const TONES = {
  light: { label: 'Light' },
  natural: { label: 'Natural' },
  dark: { label: 'Dark' },
}

export const TONE_COLORS = {
  hardwood: { light: '#ffffff', natural: '#d4a77c', dark: '#7a5136' },
  laminate: { light: '#ffffff', natural: '#d8c09f', dark: '#8a735d' },
  tile: { light: '#ffffff', natural: '#e3d3bd', dark: '#6b6864' },
  stone: { light: '#ffffff', natural: '#dccab0', dark: '#8d8276' },
}

export const CABINETS = {
  white: { label: 'White', color: '#f1eee8' },
  wood: { label: 'Natural Wood', color: '#a8794d' },
  charcoal: { label: 'Charcoal', color: '#3b3b3d' },
}

export const BACKSPLASH = {
  subway: { label: 'Subway tile' },
  none: { label: 'None' },
}

export const SHOWERS = {
  walkin: { label: 'Walk-in tile shower' },
  tub: { label: 'Tub & shower' },
}

export const VANITIES = {
  single: { label: 'Single vanity' },
  double: { label: 'Double vanity' },
}

export const FT = 0.3048

export function defaultDesign(type = 'living') {
  const t = ROOM_TYPES[type]
  return {
    type,
    width: t.size[0],
    length: t.size[1],
    floor: t.floor,
    tone: 'natural',
    cabinets: 'white',
    backsplash: 'subway',
    shower: 'walkin',
    vanity: 'single',
  }
}

const pick = (value, table, fallback) => (value in table ? value : fallback)
const clampInt = (v, [lo, hi], fallback) => {
  if (v === null || v === '') return fallback
  const n = Math.round(Number(v))
  return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : fallback
}

export function parseDesign(params) {
  const type = pick(params.get('room'), ROOM_TYPES, 'living')
  const d = defaultDesign(type)
  const { range } = ROOM_TYPES[type]
  return {
    type,
    width: clampInt(params.get('w'), range, d.width),
    length: clampInt(params.get('l'), range, d.length),
    floor: pick(params.get('floor'), FLOORS, d.floor),
    tone: pick(params.get('tone'), TONES, d.tone),
    cabinets: pick(params.get('cab'), CABINETS, d.cabinets),
    backsplash: pick(params.get('splash'), BACKSPLASH, d.backsplash),
    shower: pick(params.get('shower'), SHOWERS, d.shower),
    vanity: pick(params.get('vanity'), VANITIES, d.vanity),
  }
}

export function serializeDesign(d) {
  const p = { room: d.type, w: d.width, l: d.length, floor: d.floor, tone: d.tone }
  if (d.type === 'kitchen') Object.assign(p, { cab: d.cabinets, splash: d.backsplash })
  if (d.type === 'bathroom') Object.assign(p, { shower: d.shower, vanity: d.vanity })
  return new URLSearchParams(Object.entries(p).map(([k, v]) => [k, String(v)]))
}

// Bathroom layout: the shower/tub sits in the back-left corner and the vanity
// runs along the left wall in front of it, so a double vanity needs length.
export function bathroomLayout(d) {
  const L = d.length * FT
  const showerDepth = d.shower === 'tub' ? 0.76 : 1.2
  const room = L - showerDepth - 0.2
  const want = d.vanity === 'double' ? 1.5 : 0.76
  const vanityW = Math.min(want, Math.max(0.6, room))
  return { showerDepth, vanityW, doubleFits: room >= 1.5 }
}

export function area(d) {
  return d.width * d.length
}

// Standard allowance for cuts and waste; the real number comes from an
// on-site measurement at the free estimate.
export const WASTE = 0.1

export function summaryLines(d) {
  const lines = [
    ['Room', ROOM_TYPES[d.type].label],
    ['Size', `${d.width} ft × ${d.length} ft (${area(d)} sq ft)`],
    ['Flooring', `${FLOORS[d.floor].label}, ${TONES[d.tone].label.toLowerCase()} tone`],
  ]
  if (d.type === 'kitchen') {
    lines.push(['Cabinets', CABINETS[d.cabinets].label])
    lines.push(['Backsplash', BACKSPLASH[d.backsplash].label])
  }
  if (d.type === 'bathroom') {
    const { doubleFits } = bathroomLayout(d)
    lines.push(['Shower', SHOWERS[d.shower].label])
    lines.push(['Vanity', d.vanity === 'double' && !doubleFits ? 'Double vanity (room may be too short)' : VANITIES[d.vanity].label])
  }
  return lines
}

export function summaryText(d, url) {
  return [
    "Hi Prestigious Home Services! I designed a room on your website and I'd like a free estimate.",
    '',
    ...summaryLines(d).map(([k, v]) => `• ${k}: ${v}`),
    '',
    `My design: ${url}`,
  ].join('\n')
}
