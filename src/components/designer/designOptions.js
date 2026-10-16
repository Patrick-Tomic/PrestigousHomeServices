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

// Little CSS previews of each floor material for the swatch buttons.
export const FLOOR_SWATCH = {
  hardwood: 'repeating-linear-gradient(90deg, #b7895d 0 12px, #a67a50 12px 13px, #c39568 13px 25px, #9c6f47 25px 26px), linear-gradient(#b7895d, #b7895d)',
  laminate: 'repeating-linear-gradient(90deg, #d8c3a3 0 19px, #bfa680 19px 20px), linear-gradient(#d8c3a3, #d8c3a3)',
  tile: 'linear-gradient(90deg, #cbc3b7 2px, transparent 2px) 0 0 / 24px 24px, linear-gradient(#cbc3b7 2px, transparent 2px) 0 0 / 24px 24px, #f0ece6',
  stone: 'linear-gradient(90deg, #c7b49a 2px, transparent 2px) 0 0 / 28px 14px, linear-gradient(90deg, #c7b49a 2px, transparent 2px) 14px 14px / 28px 14px, linear-gradient(#c7b49a 2px, transparent 2px) 0 0 / 28px 14px, #e2d4be',
}

// Solid colours for small markers (dots, card edges) where a pattern can't read.
export const FLOOR_COLOR = { hardwood: '#b7895d', laminate: '#d2b994', tile: '#cfc6b9', stone: '#c9b393' }

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
  subway: { label: 'Subway' },
  stacked: { label: 'Stacked' },
  marble: { label: 'Marble' },
  none: { label: 'None' },
}

export const KITCHEN_LAYOUTS = {
  single: { label: 'Single wall' },
  l: { label: 'L-shaped' },
  u: { label: 'U-shaped' },
}

export const UPPERS = {
  cabinets: { label: 'Upper cabinets' },
  shelves: { label: 'Open shelves' },
  none: { label: 'None' },
}

export const COUNTERS = {
  quartz: { label: 'White quartz', color: '#efeeea', swatch: '#efeeea' },
  marble: { label: 'Marble', color: '#ffffff', map: 'marbleSlab', swatch: 'linear-gradient(135deg, #f6f4f1 0 35%, #d9d3ca 36%, #f6f4f1 39% 62%, #cfc8be 63%, #f6f4f1 66%)' },
  butcher: { label: 'Butcher block', color: '#b27b47', swatch: 'repeating-linear-gradient(90deg, #b27b47 0 6px, #9c6a3b 6px 7px, #c08852 7px 13px)' },
  granite: { label: 'Dark granite', color: '#2c2b2b', swatch: 'radial-gradient(circle at 30% 40%, #595655 0 2px, transparent 3px) 0 0 / 9px 9px, #2c2b2b' },
}

// Wood counters aren't offered for wet rooms.
export const BATH_COUNTERS = Object.fromEntries(Object.entries(COUNTERS).filter(([k]) => k !== 'butcher'))

// Keeps options valid for the room type (e.g. after switching rooms).
export function fitToRoom(d) {
  return d.type === 'bathroom' && !(d.counter in BATH_COUNTERS) ? { ...d, counter: 'quartz' } : d
}

// Metal finishes for faucets, shower fixtures and cabinet hardware.
export const FINISHES = {
  black: { label: 'Matte black', color: '#1e1e1e', metal: 0.2, rough: 0.55, swatch: '#1e1e1e' },
  chrome: { label: 'Chrome', color: '#dfe2e4', metal: 1, rough: 0.12, swatch: 'linear-gradient(135deg, #f7f8f9, #a9afb4)' },
  gold: { label: 'Brushed gold', color: '#caa56b', metal: 1, rough: 0.32, swatch: 'linear-gradient(135deg, #ecd5a5, #ad8649)' },
}

export const SHOWERS = {
  walkin: { label: 'Walk-in tile shower' },
  tub: { label: 'Tub & shower' },
}

export const SHOWER_TILES = {
  subway: { label: 'Subway' },
  stacked: { label: 'Stacked' },
  marble: { label: 'Large marble' },
}

export const GLASS = {
  panel: { label: 'Glass panel' },
  door: { label: 'Glass door' },
  open: { label: 'Curtain' },
}

export const VANITIES = {
  single: { label: 'Single vanity' },
  double: { label: 'Double vanity' },
}

export const TRIM = {
  base: { label: 'Baseboards' },
  crown: { label: 'Baseboards + crown' },
}

export const ENCLOSURES = {
  knee: { label: 'Knee wall + glass' },
  full: { label: 'Floor to ceiling' },
}

export const PATIO_PANELS = {
  glass: { label: 'Glass' },
  screen: { label: 'Screen mesh' },
}

export const YES_NO = { yes: { label: 'Yes' }, no: { label: 'No' } }

export const FT = 0.3048

// Every option beyond type/size/floor: URL param, value table, default, and
// which room types use it.
export const OPTIONS = {
  cabinets: { param: 'cab', table: CABINETS, def: 'white', rooms: ['kitchen'] },
  hardware: { param: 'hw', table: FINISHES, def: 'black', rooms: ['kitchen'] },
  layout: { param: 'layout', table: KITCHEN_LAYOUTS, def: 'l', rooms: ['kitchen'] },
  uppers: { param: 'uppers', table: UPPERS, def: 'cabinets', rooms: ['kitchen'] },
  island: { param: 'island', table: YES_NO, def: 'yes', rooms: ['kitchen'] },
  pantry: { param: 'pantry', table: YES_NO, def: 'no', rooms: ['kitchen'] },
  counter: { param: 'counter', table: COUNTERS, def: 'quartz', rooms: ['kitchen', 'bathroom'] },
  backsplash: { param: 'splash', table: BACKSPLASH, def: 'subway', rooms: ['kitchen'] },
  shower: { param: 'shower', table: SHOWERS, def: 'walkin', rooms: ['bathroom'] },
  showerTile: { param: 'stile', table: SHOWER_TILES, def: 'marble', rooms: ['bathroom'] },
  glass: { param: 'glass', table: GLASS, def: 'panel', rooms: ['bathroom'] },
  niche: { param: 'niche', table: YES_NO, def: 'yes', rooms: ['bathroom'] },
  bench: { param: 'bench', table: YES_NO, def: 'no', rooms: ['bathroom'] },
  fixtures: { param: 'fix', table: FINISHES, def: 'black', rooms: ['bathroom'] },
  vanity: { param: 'vanity', table: VANITIES, def: 'single', rooms: ['bathroom'] },
  vanityFinish: { param: 'vfin', table: CABINETS, def: 'wood', rooms: ['bathroom'] },
  trim: { param: 'trim', table: TRIM, def: 'base', rooms: ['living', 'bedroom', 'kitchen', 'bathroom'] },
  enclosure: { param: 'encl', table: ENCLOSURES, def: 'knee', rooms: ['patio'] },
  panels: { param: 'panels', table: PATIO_PANELS, def: 'glass', rooms: ['patio'] },
}

export function defaultDesign(type = 'living') {
  const t = ROOM_TYPES[type]
  const d = { type, width: t.size[0], length: t.size[1], floor: t.floor, tone: 'natural' }
  for (const [k, o] of Object.entries(OPTIONS)) d[k] = o.def
  return d
}

const pick = (value, table, fallback) => (value in table ? value : fallback)
const clampInt = (v, [lo, hi], fallback) => {
  if (v === null || v === '') return fallback
  const n = Math.round(Number(v))
  return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : fallback
}
const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n))

export function parseDesign(params) {
  const type = pick(params.get('room'), ROOM_TYPES, 'living')
  const d = defaultDesign(type)
  const { range } = ROOM_TYPES[type]
  d.width = clampInt(params.get('w'), range, d.width)
  d.length = clampInt(params.get('l'), range, d.length)
  d.floor = pick(params.get('floor'), FLOORS, d.floor)
  d.tone = pick(params.get('tone'), TONES, d.tone)
  for (const [k, o] of Object.entries(OPTIONS)) d[k] = pick(params.get(o.param), o.table, o.def)
  return fitToRoom(d)
}

export function serializeDesign(d) {
  const p = [['room', d.type], ['w', d.width], ['l', d.length], ['floor', d.floor], ['tone', d.tone]]
  for (const [k, o] of Object.entries(OPTIONS)) if (o.rooms.includes(d.type)) p.push([o.param, d[k]])
  return new URLSearchParams(p.map(([k, v]) => [k, String(v)]))
}

// Bathroom layout. The shower or tub is an alcove in the back-left corner,
// closed on the right by a tiled partition when there's room beside it. The
// toilet goes on the back wall beside the alcove if it fits, otherwise on the
// left wall past the vanity. The vanity runs along the left wall in front of
// the alcove, so a double vanity needs length.
export function bathroomLayout(d) {
  const W = d.width * FT
  const L = d.length * FT
  const isTub = d.shower === 'tub'
  const showerW = isTub ? Math.min(1.52, W) : W < 1.8 ? W : clamp(W - 0.9, 0.9, 1.2)
  const showerDepth = isTub ? 0.76 : Math.min(1.2, L - 1.2)
  // Walk-ins get a tiled partition; a tub only needs one for sliding doors.
  const partition = W - showerW > 0.3 && (!isTub || d.glass === 'door')
  const toiletOnBack = W - showerW - 0.12 >= 0.75
  // Left-wall run in front of the alcove: vanity, then the toilet if it
  // couldn't go on the back wall.
  const run = L - showerDepth - 0.2
  const room = run - (toiletOnBack ? 0.05 : 0.8)
  const vanityFits = room >= 0.6
  const want = d.vanity === 'double' ? 1.5 : 0.76
  const vanityW = vanityFits ? Math.min(want, room) : 0
  return { W, L, isTub, showerW, showerDepth, partition, toiletOnBack, vanityFits, vanityW, doubleFits: room >= 1.5 }
}

// Kitchen layout in 24" (0.6 m) cabinet units. Single wall and L-shaped put
// the fridge (and pantry) at the right end of the back wall; U-shaped runs
// cabinets along the whole back wall, adds a peninsula on the open side and
// moves the tall units to the front of the left wall. The cooktop goes on the
// side run when it's long enough (front end, so the window and hood never
// meet); otherwise on the back run, a couple of units from the sink.
export const UNIT = 0.6
const DEPTH = 0.6

export function kitchenLayout(d) {
  const W = d.width * FT
  const L = d.length * FT
  const isU = d.layout === 'u'
  const hasSide = d.layout !== 'single'
  const fridgeW = 0.8
  // The pantry only fits if it leaves at least two base units beside it.
  const pantryFits = isU
    ? L - DEPTH - fridgeW - UNIT - 0.1 >= 2 * UNIT
    : W - 0.1 - fridgeW - UNIT >= 2 * UNIT
  const pantry = d.pantry === 'yes' && pantryFits
  const tallW = fridgeW + (pantry ? UNIT : 0)
  // U-shaped keeps 0.35 m clear for the peninsula's seating overhang.
  const back = clamp(Math.floor((W - 0.1 - (isU ? 0.35 : tallW)) / UNIT), 1, 8)
  const sideRoom = isU ? L - DEPTH - tallW - 0.1 : Math.min(L * 0.6, L - DEPTH - 1.0)
  const side = hasSide ? clamp(Math.floor(sideRoom / UNIT), 0, 6) : 0
  const pen = isU ? clamp(Math.floor(Math.min(L * 0.5, L - DEPTH - 1.0) / UNIT), 1, 4) : 0
  const islandFits = !isU && W >= 3.4 && L >= (hasSide ? 3.9 : 3.6)
  const island = d.island === 'yes' && islandFits
  const islandUnits = island ? clamp(Math.floor(Math.min(2.4, W - (hasSide ? 2.4 : 1.6)) / UNIT), 2, 4) : 0
  // Short back runs hand the cooktop to the side run so the sink isn't
  // squeezed into the corner cabinet.
  const cookOnSide = side >= 3 || (hasSide && side >= 2 && back <= 3)
  const corner = hasSide ? 1 : 0
  const sinkIdx = Math.min(back - 1, cookOnSide ? Math.max(corner, Math.floor(back / 2)) : Math.max(corner, Math.floor(back / 2) - 1))
  const cookIdx = cookOnSide ? -1 : Math.min(back - 1, sinkIdx + 2)
  return {
    W, L, tallW, pantry, pantryFits, back, side, pen, island, islandFits, islandUnits,
    cookOnSide, sinkIdx, cookIdx: cookIdx === sinkIdx ? -1 : cookIdx,
  }
}

export function cabinetCounts(d) {
  const k = kitchenLayout(d)
  const base = k.back + k.side + k.pen + k.islandUnits
  const uppers = d.uppers === 'cabinets' ? k.back - (k.cookIdx >= 0 ? 1 : 0) : 0
  return { ...k, base, uppers, baseFt: base * 2, uppersFt: uppers * 2 }
}

export function area(d) {
  return d.width * d.length
}

// Standard allowance for cuts and waste; the real number comes from an
// on-site measurement at the free estimate.
export const WASTE = 0.1

export function summaryLines(d) {
  const label = (k) => OPTIONS[k].table[d[k]].label
  const lines = [
    ['Room', ROOM_TYPES[d.type].label],
    ['Size', `${d.width} ft × ${d.length} ft (${area(d)} sq ft)`],
    ['Flooring', `${FLOORS[d.floor].label}, ${TONES[d.tone].label.toLowerCase()} tone`],
  ]
  if (d.type === 'kitchen') {
    const c = cabinetCounts(d)
    lines.push(['Layout', label('layout')])
    lines.push(['Base cabinets', `${c.base} × 24" (≈ ${c.baseFt} linear ft)${c.island ? ', incl. island' : ''}`])
    lines.push(['Upper storage', d.uppers === 'cabinets' ? `${c.uppers} × 24" upper cabinets` : label('uppers')])
    if (d.island === 'yes' && !c.islandFits) lines.push(['Island', 'Needs a larger room'])
    if (d.pantry === 'yes') lines.push(['Pantry', c.pantry ? 'Tall pantry cabinet' : 'Needs a larger room'])
    lines.push(['Cabinets', `${label('cabinets')}, ${label('hardware').toLowerCase()} hardware`])
    lines.push(['Countertop', label('counter')])
    lines.push(['Backsplash', d.backsplash === 'none' ? 'None' : `${label('backsplash')} tile`])
  }
  if (d.type === 'bathroom') {
    const { doubleFits, vanityFits } = bathroomLayout(d)
    const extras = [d.niche === 'yes' && 'niche', d.bench === 'yes' && d.shower === 'walkin' && 'bench'].filter(Boolean)
    lines.push(['Shower', label('shower')])
    lines.push(['Shower tile', `${label('showerTile')}${extras.length ? ` with ${extras.join(' & ')}` : ''}`])
    lines.push(['Enclosure', d.glass === 'open' ? 'Shower curtain' : d.glass === 'door' ? 'Glass enclosure with door' : 'Frameless glass panel'])
    lines.push(['Fixtures', label('fixtures')])
    lines.push(['Vanity', !vanityFits ? 'Needs a larger room' : `${d.vanity === 'double' && !doubleFits ? 'Double (room may be too short)' : label('vanity')}, ${label('vanityFinish').toLowerCase()}`])
    lines.push(['Countertop', label('counter')])
  }
  if (OPTIONS.trim.rooms.includes(d.type)) lines.push(['Trim', label('trim')])
  if (d.type === 'patio') {
    lines.push(['Enclosure', label('enclosure')])
    lines.push(['Panels', label('panels')])
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

// Project-wide totals: floor area and flooring needed per material.
export function projectTotals(designs) {
  const byFloor = {}
  let sqft = 0
  for (const d of designs) {
    const a = area(d)
    sqft += a
    byFloor[d.floor] = (byFloor[d.floor] || 0) + a
  }
  const flooring = Object.entries(byFloor).map(([floor, a]) => ({
    floor, label: FLOORS[floor].label, sqft: a, needed: Math.ceil(a * (1 + WASTE)),
  }))
  return { rooms: designs.length, sqft, flooring }
}

export function projectText(rooms, url) {
  const designs = rooms.map(r => r.design)
  const t = projectTotals(designs)
  const lines = [
    `Hi Prestigious Home Services! I planned a ${t.rooms}-room project on your website and I'd like a free estimate.`,
    '',
  ]
  rooms.forEach((r, i) => {
    lines.push(`${i + 1}. ${r.name}`)
    for (const [k, v] of summaryLines(r.design)) if (k !== 'Room') lines.push(`   • ${k}: ${v}`)
    lines.push('')
  })
  lines.push(`Total: ${t.sqft} sq ft across ${t.rooms} room${t.rooms === 1 ? '' : 's'}`)
  for (const f of t.flooring) lines.push(`• ${f.label}: ≈ ${f.needed} sq ft needed`)
  lines.push('', `My project: ${url}`)
  return lines.join('\n')
}
