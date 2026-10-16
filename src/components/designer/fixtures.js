// Furniture and fixtures for each room type, built from rounded boxes,
// cylinders and spheres. Everything is placed against the two visible walls
// (back wall at z = -L/2, left wall at x = -W/2) so the cutaway stays open.
// Furniture is there for scale; the fixtures reflect the options chosen.

import { SURFACE_SIZE } from '../hero/floorTextures'
import { CABINETS, COUNTERS, FINISHES, FT, UNIT, bathroomLayout, kitchenLayout } from './designOptions'

export const FLOOR_TOP = 0.03
export const WALL_H = 2.6

const C = {
  white: '#f3f1ed',
  porcelain: '#f7f7f5',
  oak: '#9a7048',
  walnut: '#5e4330',
  charcoal: '#2f2e2d',
  steel: '#c9ccce',
  fabric: '#9b958c',
  fabricLight: '#b8b2a8',
  linen: '#e9e4dc',
  blue: '#aeb9c2',
  rug: '#d6ccbe',
  leaf: '#5f7a4f',
  pot: '#c9b9a6',
  quartz: '#ecebe7',
  wicker: '#a88b67',
}

const box = (size, pos, color, extra = {}) => ({ geo: 'box', size, pos, color, radius: 0.02, ...extra })
const cyl = (r, h, pos, color, extra = {}) => ({ geo: 'cyl', size: [r, h, r], pos, color, ...extra })
const ball = (r, pos, color, extra = {}) => ({ geo: 'sphere', size: [r, r, r], pos, color, ...extra })
const F = FLOOR_TOP

function plant(x, z, s = 1) {
  return [
    cyl(0.17 * s, 0.42 * s, [x, F + 0.21 * s, z], C.pot, { rough: 0.8 }),
    ball(0.34 * s, [x, F + 0.42 * s + 0.3 * s, z], C.leaf, { rough: 0.95 }),
    ball(0.24 * s, [x + 0.12 * s, F + 0.42 * s + 0.55 * s, z - 0.05], C.leaf, { rough: 0.95 }),
  ]
}

// A window on the left wall: frame plus a softly glowing sky pane.
function leftWindow(W, z, width, sill, height) {
  const x = -W / 2 + 0.008
  return [
    box([0.02, height + 0.1, width + 0.1], [x, sill + height / 2, z], C.charcoal, { radius: 0.008 }),
    box([0.024, height, width], [x + 0.004, sill + height / 2, z], '#fff1dc', { glow: 0.9, radius: 0.004, cast: false }),
    box([0.03, 0.04, width], [x + 0.008, sill + height / 2, z], C.charcoal, { radius: 0.006 }),
  ]
}

function armchair(x, z, rotY) {
  const parts = [
    box([0.85, 0.42, 0.85], [0, F + 0.21, 0], C.fabric, { radius: 0.08 }),
    box([0.85, 0.42, 0.18], [0, F + 0.62, -0.33], C.fabric, { radius: 0.07 }),
    box([0.16, 0.24, 0.85], [-0.345, F + 0.54, 0], C.fabric, { radius: 0.06 }),
    box([0.16, 0.24, 0.85], [0.345, F + 0.54, 0], C.fabric, { radius: 0.06 }),
  ]
  return parts.map(p => ({ ...p, group: { pos: [x, 0, z], rotY } }))
}

function living(W, L) {
  const sw = Math.min(2.3, W * 0.55)
  const zs = -L / 2 + 0.5
  const xs = 0.15
  const parts = [
    // Sofa
    box([sw, 0.42, 0.95], [xs, F + 0.21, zs], C.fabric, { radius: 0.08 }),
    box([sw, 0.46, 0.2], [xs, F + 0.64, zs - 0.37], C.fabric, { radius: 0.08 }),
    box([0.2, 0.26, 0.95], [xs - sw / 2 + 0.1, F + 0.55, zs], C.fabric, { radius: 0.07 }),
    box([0.2, 0.26, 0.95], [xs + sw / 2 - 0.1, F + 0.55, zs], C.fabric, { radius: 0.07 }),
    ...[-1, 0, 1].map(i => box([(sw - 0.44) / 3 - 0.03, 0.12, 0.66], [xs + i * ((sw - 0.44) / 3), F + 0.48, zs + 0.08], C.fabricLight, { radius: 0.05 })),
    // Rug and coffee table
    box([Math.min(2.6, W * 0.62), 0.012, Math.min(1.8, L * 0.4)], [xs, F + 0.006, zs + 1.35], C.rug, { radius: 0.005, cast: false, rough: 1 }),
    box([1.1, 0.05, 0.6], [xs, F + 0.42, zs + 1.3], C.oak, { radius: 0.02, rough: 0.5 }),
    box([0.9, 0.37, 0.42], [xs, F + 0.2, zs + 1.3], C.charcoal, { radius: 0.03 }),
    ...plant(-W / 2 + 0.4, -L / 2 + 0.4),
    ...leftWindow(W, Math.min(0.6, L / 2 - 1), Math.min(1.6, L * 0.3), 0.9, 1.3),
  ]
  if (W >= 3.6) parts.push(...armchair(xs + sw / 2 + 0.9, zs + 1.3, -Math.PI / 2))
  return parts
}

function bedroom(W, L) {
  const bw = Math.min(1.6, W * 0.5)
  const zb = -L / 2 + 1.1
  const parts = [
    box([bw + 1.2, 0.012, 1.6], [0, F + 0.006, zb + 0.7], C.rug, { radius: 0.005, cast: false, rough: 1 }),
    box([bw + 0.18, 1.1, 0.1], [0, F + 0.55, -L / 2 + 0.06], C.walnut, { radius: 0.04, rough: 0.6 }),
    box([bw + 0.1, 0.3, 2.15], [0, F + 0.15, zb], C.walnut, { radius: 0.04, rough: 0.6 }),
    box([bw, 0.24, 2.05], [0, F + 0.42, zb], C.linen, { radius: 0.08 }),
    box([bw + 0.04, 0.08, 1.35], [0, F + 0.56, zb + 0.36], C.blue, { radius: 0.04 }),
    box([bw * 0.42, 0.14, 0.38], [-bw * 0.24, F + 0.6, -L / 2 + 0.4], C.white, { radius: 0.06 }),
    box([bw * 0.42, 0.14, 0.38], [bw * 0.24, F + 0.6, -L / 2 + 0.4], C.white, { radius: 0.06 }),
  ]
  for (const side of [-1, 1]) {
    const x = side * (bw / 2 + 0.38)
    parts.push(
      box([0.5, 0.55, 0.42], [x, F + 0.275, -L / 2 + 0.28], C.oak, { radius: 0.03, rough: 0.55 }),
      cyl(0.06, 0.28, [x, F + 0.69, -L / 2 + 0.28], C.charcoal),
      cyl(0.15, 0.2, [x, F + 0.92, -L / 2 + 0.28], '#fff0d9', { glow: 0.6 }),
    )
  }
  parts.push(...leftWindow(W, Math.min(0.4, L / 2 - 1), Math.min(1.4, L * 0.3), 0.9, 1.3))
  if (W >= 3.4) parts.push(...plant(W / 2 - 0.5, -L / 2 + 0.4, 0.9))
  return parts
}

// A tiled or slab surface on a wall. `map` names a texture in SURFACE_SIZE;
// the repeat keeps tiles at their real size whatever the surface size.
function surface(map, size, pos, extra = {}) {
  const tile = SURFACE_SIZE[map]
  const across = Math.max(size[0], size[2])
  return box(size, pos, '#ffffff', {
    map, mapRepeat: [across / tile, size[1] / tile], radius: 0, rough: 0.15, cast: false, ...extra,
  })
}

// Countertop: solid colour, or a slab texture repeated across its top.
function counter(d, size, pos) {
  const c = COUNTERS[d.counter]
  const extra = { radius: 0.012, rough: d.counter === 'butcher' ? 0.55 : d.counter === 'granite' ? 0.2 : 0.25 }
  if (!c.map) return box(size, pos, c.color, extra)
  const t = SURFACE_SIZE[c.map]
  return box(size, pos, c.color, { ...extra, map: c.map, mapRepeat: [size[0] / t, size[2] / t] })
}

const finish = (key) => {
  const f = FINISHES[key]
  return { color: f.color, metal: f.metal, rough: f.rough }
}
const metalBox = (size, pos, f, extra = {}) => box(size, pos, f.color, { metal: f.metal, rough: f.rough, radius: 0.006, ...extra })
const metalCyl = (r, h, pos, f, extra = {}) => cyl(r, h, pos, f.color, { metal: f.metal, rough: f.rough, ...extra })
const GLASS = { opacity: 0.2, radius: 0, rough: 0.05, cast: false }
const GLASS_COLOR = '#d8e6ec'

// ---------------------------------------------------------------------------
// Kitchen
// ---------------------------------------------------------------------------

function kitchen(W, L, d) {
  const k = kitchenLayout(d)
  const cab = CABINETS[d.cabinets].color
  const hw = finish(d.hardware)
  const cabinet = { radius: 0.015, rough: 0.5 }
  const steel = { metal: 0.7, rough: 0.3, radius: 0.02 }
  const parts = []
  const D = 0.6
  const xL = -W / 2, zB = -L / 2
  const x0 = xL + 0.02
  const zBack = zB + D / 2
  const zS0 = zB + D
  const cy = F + 0.9
  const hasSide = k.side > 0
  const runLen = k.back * UNIT
  const sideLen = k.side * UNIT
  const unitX = (i) => x0 + UNIT * (i + 0.5)
  const unitZ = (i) => zS0 + UNIT * (i + 0.5)
  const handleX = (x, z) => metalBox([0.14, 0.02, 0.02], [x, F + 0.78, z], hw)
  const handleZ = (x, z) => metalBox([0.02, 0.02, 0.14], [x, F + 0.78, z], hw)
  const cooktop = (pos, alongZ) => box(alongZ ? [0.5, 0.012, 0.56] : [0.56, 0.012, 0.5], pos, '#161616', { radius: 0.02, rough: 0.2 })

  // Back run
  for (let i = 0; i < k.back; i++) {
    parts.push(box([UNIT - 0.01, 0.84, D - 0.02], [unitX(i), F + 0.44, zBack], cab, cabinet))
    if (!(hasSide && i === 0)) parts.push(handleX(unitX(i), zBack + D / 2 - 0.005))
  }
  parts.push(counter(d, [runLen + 0.03, 0.04, D + 0.04], [x0 + runLen / 2, cy, zBack + 0.02]))

  // Sink and faucet
  const sx = unitX(k.sinkIdx)
  parts.push(
    box([0.5, 0.012, 0.38], [sx, cy + 0.016, zBack + 0.04], '#8d9295', { radius: 0.03, metal: 0.7, rough: 0.25 }),
    metalCyl(0.015, 0.32, [sx, cy + 0.18, zB + 0.09], hw),
    metalBox([0.022, 0.022, 0.17], [sx, cy + 0.34, zB + 0.17], hw),
  )

  // Cooktop and hood on the back run
  if (k.cookIdx >= 0) {
    const cx = unitX(k.cookIdx)
    parts.push(cooktop([cx, cy + 0.016, zBack + 0.02], false))
    parts.push(box([0.6, 0.18, 0.5], [cx, F + 1.66, zB + 0.25], C.steel, steel))
    parts.push(box([0.28, WALL_H - 0.12 - F - 1.75, 0.24], [cx, (F + 1.75 + WALL_H - 0.12) / 2, zB + 0.12], C.steel, steel))
  }

  // Side run on the left wall; cooktop and hood at its front end
  if (hasSide) {
    for (let i = 0; i < k.side; i++) {
      parts.push(box([D - 0.02, 0.84, UNIT - 0.01], [xL + D / 2, F + 0.44, unitZ(i)], cab, cabinet))
      parts.push(handleZ(xL + D - 0.005, unitZ(i)))
    }
    parts.push(counter(d, [D + 0.04, 0.04, sideLen], [xL + D / 2 + 0.02, cy, zS0 + sideLen / 2]))
    if (k.cookOnSide) {
      const cz = unitZ(k.side - 1)
      parts.push(cooktop([xL + D / 2 + 0.02, cy + 0.016, cz], true))
      parts.push(box([0.5, 0.18, 0.6], [xL + 0.25, F + 1.66, cz], C.steel, steel))
      parts.push(box([0.24, WALL_H - 0.12 - F - 1.75, 0.28], [xL + 0.12, (F + 1.75 + WALL_H - 0.12) / 2, cz], C.steel, steel))
    }
  }

  // Tall units: fridge (+ pantry) at the end of the back run, or at the
  // front of the left wall for U-shaped.
  const tall = [{ w: 0.8, h: 1.95, fridge: true }]
  if (k.pantry) tall.push({ w: UNIT, h: 2.2 })
  let along = d.layout === 'u' ? zS0 + sideLen + 0.02 : x0 + runLen + 0.02
  for (const t of tall) {
    const c = along + t.w / 2
    const depth = t.fridge ? 0.7 : D
    const color = t.fridge ? C.steel : cab
    const look = t.fridge ? { metal: 0.6, rough: 0.3, radius: 0.03 } : cabinet
    const handleH = t.fridge ? 0.7 : 0.35
    if (d.layout === 'u') {
      parts.push(box([depth, t.h, t.w - 0.01], [xL + depth / 2, F + t.h / 2, c], color, look))
      parts.push(metalBox([0.02, handleH, 0.02], [xL + depth + 0.015, F + 1.15, c + t.w / 2 - 0.08], hw))
    } else {
      parts.push(box([t.w - 0.01, t.h, depth], [c, F + t.h / 2, zB + depth / 2], color, look))
      parts.push(metalBox([0.02, handleH, 0.02], [c - t.w / 2 + 0.08, F + 1.15, zB + depth + 0.015], hw))
    }
    along += t.w + 0.01
  }

  // Peninsula on the open side (U-shaped), with a seating overhang
  if (k.pen > 0) {
    const px = x0 + runLen - D / 2
    const penLen = k.pen * UNIT
    for (let i = 0; i < k.pen; i++) {
      parts.push(box([D - 0.02, 0.84, UNIT - 0.01], [px, F + 0.44, unitZ(i)], cab, cabinet))
      parts.push(handleZ(px - D / 2 + 0.005, unitZ(i)))
    }
    parts.push(counter(d, [D + 0.28, 0.04, penLen + 0.04], [px + 0.12, cy, zS0 + penLen / 2]))
  }

  // Upper storage on the back wall, skipping the hood
  const runs = []
  for (let i = 0; i < k.back; i++) {
    if (i === k.cookIdx) continue
    const last = runs[runs.length - 1]
    if (last && last[1] === i - 1) last[1] = i
    else runs.push([i, i])
  }
  if (d.uppers === 'cabinets') {
    for (let i = 0; i < k.back; i++) {
      if (i === k.cookIdx) continue
      parts.push(box([UNIT - 0.01, 0.72, 0.34], [unitX(i), F + 1.86, zB + 0.17], cab, cabinet))
      parts.push(metalBox([0.12, 0.02, 0.02], [unitX(i), F + 1.55, zB + 0.345], hw))
    }
  } else if (d.uppers === 'shelves') {
    for (const [i0, i1] of runs) {
      const len = (i1 - i0 + 1) * UNIT - 0.08
      const cx = (unitX(i0) + unitX(i1)) / 2
      for (const y of [1.5, 1.92]) {
        parts.push(box([len, 0.04, 0.26], [cx, F + y, zB + 0.13], C.oak, { radius: 0.01, rough: 0.55 }))
      }
      // A few dishes and jars on each shelf run
      const n = Math.min(3, i1 - i0 + 1)
      for (let j = 0; j < n; j++) {
        const x = cx - len / 2 + (len / (n + 1)) * (j + 1)
        parts.push(j % 2
          ? cyl(0.06, 0.18, [x, F + 1.61, zB + 0.13], C.porcelain, { rough: 0.3 })
          : box([0.22, 0.05, 0.2], [x, F + 1.545, zB + 0.13], C.porcelain, { radius: 0.02, rough: 0.3 }))
        parts.push(cyl(0.05, 0.14, [x + 0.05, F + 2.01, zB + 0.13], j % 2 ? C.pot : C.porcelain, { rough: 0.4 }))
      }
    }
  }

  // Backsplash: runs between counter and uppers (taller with no uppers),
  // broken around the hood.
  const splashMap = d.backsplash === 'marble' ? 'marbleSlab' : d.backsplash
  if (d.backsplash !== 'none') {
    const h = d.uppers === 'cabinets' ? 0.56 : 0.9
    for (const [i0, i1] of runs) {
      const len = (i1 - i0 + 1) * UNIT
      parts.push(surface(splashMap, [len, h, 0.012], [(unitX(i0) + unitX(i1)) / 2, cy + 0.02 + h / 2, zB + 0.006]))
    }
    if (k.cookIdx >= 0) parts.push(surface(splashMap, [UNIT, 0.6, 0.012], [unitX(k.cookIdx), cy + 0.32, zB + 0.006]))
    if (hasSide) parts.push(surface(splashMap, [0.012, 0.56, sideLen], [xL + 0.006, cy + 0.3, zS0 + sideLen / 2]))
  }

  // Window: over the side run (clear of the hood), or on the left wall
  const sill = cy + 0.65
  const winLen = (k.cookOnSide ? k.side - 1 : k.side) * UNIT
  if (hasSide && winLen >= 0.9) {
    parts.push(...leftWindow(W, zS0 + winLen / 2, Math.min(1.2, winLen - 0.25), sill, Math.min(0.85, 2.45 - sill)))
  } else if (!hasSide) {
    parts.push(...leftWindow(W, Math.min(0.4, L / 2 - 1), 1.1, 1.05, 1.0))
  }

  // Island with seating
  if (k.island) {
    const iw = k.islandUnits * UNIT
    const minX = hasSide ? xL + D + 1.05 + iw / 2 : -Infinity
    const ix = Math.min(W / 2 - 0.9 - iw / 2, Math.max(minX, xL + 0.9 + iw / 2, x0 + runLen / 2))
    const iz = zB + D + 1.05 + 0.42
    for (let i = 0; i < k.islandUnits; i++) {
      const x = ix - iw / 2 + UNIT * (i + 0.5)
      parts.push(box([UNIT - 0.01, 0.84, 0.84], [x, F + 0.44, iz], cab, cabinet))
      parts.push(handleX(x, iz - 0.425))
    }
    parts.push(counter(d, [iw + 0.1, 0.04, 1.1], [ix, cy, iz + 0.12]))
    for (let i = 0; i < k.islandUnits - 1; i++) {
      const x = ix - iw / 2 + UNIT * (i + 1)
      parts.push(cyl(0.17, 0.05, [x, F + 0.65, iz + 0.8], C.walnut, { rough: 0.6 }))
      parts.push(metalCyl(0.025, 0.62, [x, F + 0.31, iz + 0.8], hw))
      parts.push(metalCyl(0.16, 0.015, [x, F + 0.008, iz + 0.8], hw))
    }
  }
  return parts
}

// ---------------------------------------------------------------------------
// Bathroom
// ---------------------------------------------------------------------------

// Toilet: tank against the wall, oval bowl and seat. `facing` is the wall it
// backs onto: 'back' (faces +z) or 'left' (faces +x).
function toilet(x, z, facing, fx) {
  const onLeft = facing === 'left'
  const tank = onLeft ? [0.18, 0.38, 0.42] : [0.42, 0.38, 0.18]
  const out = onLeft ? [1, 0] : [0, 1]
  const at = (d, y) => [x + out[0] * d, F + y, z + out[1] * d]
  const oval = onLeft ? [0.25, 1, 0.19] : [0.19, 1, 0.25]
  return [
    box(tank, at(0.09, 0.62), C.porcelain, { radius: 0.04, rough: 0.2 }),
    { ...cyl(1, 0.4, at(0.41, 0.2), C.porcelain, { rough: 0.2 }), size: [oval[0], 0.4, oval[2]] },
    { ...cyl(1, 0.03, at(0.41, 0.415), C.white, { rough: 0.3 }), size: [oval[0] * 1.05, 0.03, oval[2] * 1.05] },
    metalBox(onLeft ? [0.02, 0.015, 0.06] : [0.06, 0.015, 0.02], onLeft ? [x + 0.19, F + 0.76, z + 0.14] : [x + 0.14, F + 0.76, z + 0.19], fx),
  ]
}

function bathroom(W, L, d) {
  const b = bathroomLayout(d)
  const fx = finish(d.fixtures)
  const tile = d.showerTile
  const xL = -W / 2, zB = -L / 2
  const sw = b.showerW
  const sd = b.showerDepth
  const xR = xL + sw            // right edge of the alcove
  const hx = xL + sw / 2
  const parts = []

  // Tiled partition closing the alcove on the right
  if (b.partition) {
    parts.push(surface(tile, [0.1, 2.1, sd], [xR + 0.05, F + 1.05, zB + sd / 2], { cast: true }))
  }

  if (b.isTub) {
    // Tub with a real basin: rim walls, apron and a recessed floor
    const T = 0.08, H = 0.55, depth = 0.76
    const tub = { radius: 0.035, rough: 0.18 }
    parts.push(
      box([sw, 0.12, depth], [hx, F + 0.06, zB + depth / 2], C.porcelain, tub),
      box([sw, H, T], [hx, F + H / 2, zB + T / 2], C.porcelain, tub),
      box([sw, H, T], [hx, F + H / 2, zB + depth - T / 2], C.porcelain, tub),
      box([T, H, depth - 2 * T], [xL + T / 2, F + H / 2, zB + depth / 2], C.porcelain, tub),
      box([T, H, depth - 2 * T], [xR - T / 2, F + H / 2, zB + depth / 2], C.porcelain, tub),
      box([sw - 2 * T, 0.01, depth - 2 * T], [hx, F + 0.125, zB + depth / 2], '#e4e8ea', { radius: 0.004, rough: 0.15 }),
      surface(tile, [sw, 1.55, 0.012], [hx, F + H + 0.775, zB + 0.006]),
      surface(tile, [0.012, 1.55, depth], [xL + 0.006, F + H + 0.775, zB + depth / 2]),
    )
    // Plumbing on the end wall: spout, valve, shower head
    const pz = zB + depth / 2
    parts.push(
      metalBox([0.16, 0.04, 0.045], [xL + 0.08, F + 0.68, pz], fx),
      metalCyl(0.075, 0.015, [xL + 0.014, F + 1.0, pz], fx, { rot: [0, 0, Math.PI / 2] }),
      metalBox([0.03, 0.11, 0.022], [xL + 0.035, F + 0.97, pz], fx),
      metalCyl(0.012, 0.26, [xL + 0.13, F + 2.02, pz], fx, { rot: [0, 0, Math.PI / 2] }),
      metalCyl(0.1, 0.015, [xL + 0.26, F + 2.0, pz], fx),
    )
  } else {
    parts.push(
      surface(tile, [sw, 2.1, 0.012], [hx, F + 1.05, zB + 0.006]),
      surface(tile, [0.012, 2.1, sd], [xL + 0.006, F + 1.05, zB + sd / 2]),
      metalBox([sw * 0.6, 0.004, 0.06], [hx, F + 0.003, zB + 0.16], fx), // linear drain
      metalCyl(0.11, 0.015, [hx, F + 2.0, zB + 0.25], fx),
      metalCyl(0.012, 0.25, [hx, F + 2.03, zB + 0.125], fx, { rot: [Math.PI / 2, 0, 0] }),
      metalCyl(0.075, 0.015, [hx, F + 1.1, zB + 0.014], fx, { rot: [Math.PI / 2, 0, 0] }),
      metalBox([0.022, 0.11, 0.03], [hx, F + 1.07, zB + 0.035], fx),
    )
  }

  // Built-in niche on the back wall
  if (d.niche === 'yes') {
    const ny = b.isTub ? F + 1.2 : F + 1.35
    const nx = b.isTub ? hx + sw * 0.15 : hx + sw * 0.25
    parts.push(
      metalBox([0.4, 0.58, 0.016], [nx, ny, zB + 0.014], fx, { cast: false }),
      box([0.36, 0.54, 0.02], [nx, ny, zB + 0.016], '#c9c2b8', { radius: 0, rough: 0.35, cast: false }),
      box([0.36, 0.012, 0.05], [nx, ny, zB + 0.03], GLASS_COLOR, { ...GLASS, opacity: 0.45 }),
    )
  }

  // Tiled bench along the left wall (walk-in only)
  if (d.bench === 'yes' && !b.isTub) {
    const bd = Math.min(0.9, sd - 0.3)
    parts.push(surface(tile, [0.4, 0.44, bd], [xL + 0.2, F + 0.22, zB + 0.1 + bd / 2], { cast: true }))
    parts.push(surface(tile, [0.42, 0.03, bd + 0.02], [xL + 0.21, F + 0.455, zB + 0.1 + bd / 2], { cast: true }))
  }

  // Glass across the alcove front, or a curtain
  const front = b.isTub ? zB + 0.76 - 0.04 : zB + sd
  const base = b.isTub ? F + 0.55 : F
  const gh = b.isTub ? 1.45 : 1.95
  const fit = (w, cx) => box([w, gh, 0.01], [cx, base + gh / 2, front], GLASS_COLOR, GLASS)
  if (d.glass === 'panel') {
    // Fixed screen: at the shower-head end for a tub, from the partition for a walk-in
    const pw = b.isTub ? Math.min(0.8, sw * 0.55) : sw * 0.6
    const px = b.isTub ? xL + pw / 2 + 0.02 : xR - pw / 2
    parts.push(fit(pw, px), metalBox([pw, 0.025, 0.03], [px, base + 0.0125, front], fx))
    const free = b.isTub ? px + pw / 2 - 0.01 : px - pw / 2 + 0.01
    parts.push(metalBox([0.015, 0.015, b.isTub ? 0.7 : sd], [free, base + gh - 0.02, front - (b.isTub ? 0.7 : sd) / 2], fx))
  } else if (d.glass === 'door') {
    // Fixed panel by the wall plus a door, or two sliding panels on a tub
    const half = sw / 2
    const panels = b.isTub
      ? [[half + 0.04, xL + (half + 0.04) / 2, 0], [half + 0.04, xR - (half + 0.04) / 2, 0.025]]
      : [[sw * 0.42, xL + sw * 0.21, 0], [sw * 0.58 - 0.01, xL + sw * 0.71, 0]]
    for (const [w, cx, off] of panels) {
      parts.push(box([w, gh - 0.03, 0.01], [cx, base + (gh - 0.03) / 2, front + off], GLASS_COLOR, GLASS))
    }
    parts.push(metalBox([sw, 0.03, 0.04], [hx, base + gh, front + 0.0125], fx))
    if (b.isTub) parts.push(metalBox([sw, 0.02, 0.04], [hx, base + 0.01, front + 0.0125], fx))
    const hxPos = b.isTub ? xR - half + 0.08 : xL + sw * 0.42 + 0.1
    parts.push(metalBox([0.02, 0.3, 0.02], [hxPos, base + gh / 2, front + (b.isTub ? 0.05 : 0.025)], fx))
  } else {
    // Curtain rod across the front; with an open end it returns to the back wall
    parts.push(
      metalCyl(0.012, sw, [hx, F + 2.0, front], fx, { rot: [0, 0, Math.PI / 2] }),
      box([sw * 0.3, b.isTub ? 1.42 : 1.88, 0.05], [xR - sw * 0.17, F + 2.0 - (b.isTub ? 0.71 : 0.94), front], C.linen, { radius: 0.02, rough: 0.95 }),
    )
    if (!b.partition) {
      parts.push(metalCyl(0.012, front - zB, [xR - 0.01, F + 2.0, (front + zB) / 2], fx, { rot: [Math.PI / 2, 0, 0] }))
    }
  }

  // Vanity along the left wall, in front of the alcove
  const z0 = zB + sd + 0.2
  const vw = b.vanityW
  const zc = z0 + vw / 2
  if (vw > 0) {
    const sinks = vw >= 1.4 ? [zc - vw / 4, zc + vw / 4] : [zc]
    const mirror = Math.min(0.62, vw / sinks.length - 0.12)
    parts.push(
      box([0.55, 0.8, vw], [xL + 0.275, F + 0.4, zc], CABINETS[d.vanityFinish].color, { radius: 0.02, rough: 0.55 }),
      counter(d, [0.57, 0.04, vw + 0.02], [xL + 0.285, F + 0.82, zc]),
      metalBox([0.02, 0.02, 0.12], [xL + 0.555, F + 0.66, zc], fx),
      ...sinks.flatMap(z => [
        { ...cyl(1, 0.012, [xL + 0.3, F + 0.846, z], '#e3e7e9', { rough: 0.15 }), size: [0.17, 0.012, 0.2] },
        metalCyl(0.014, 0.2, [xL + 0.07, F + 0.94, z], fx),
        metalBox([0.13, 0.02, 0.022], [xL + 0.13, F + 1.03, z], fx),
        metalBox([0.014, 0.8, mirror + 0.04], [xL + 0.007, F + 1.5, z], fx, { cast: false }),
        box([0.016, 0.76, mirror], [xL + 0.01, F + 1.5, z], '#dbe3e7', { metal: 0.9, rough: 0.05, radius: 0.004, cast: false }),
      ]),
    )
  }

  // Toilet beside the alcove, or on the left wall past the vanity
  if (b.toiletOnBack) {
    const tx = Math.min(xR + (b.partition ? 0.1 : 0) + 0.38, W / 2 - 0.3)
    parts.push(...toilet(tx, zB, 'back', fx))
    if (tx + 0.95 < W / 2) {
      parts.push(metalBox([0.6, 0.02, 0.02], [tx + 0.68, F + 1.15, zB + 0.05], fx))
      parts.push(box([0.4, 0.5, 0.03], [tx + 0.68, F + 0.92, zB + 0.065], C.linen, { radius: 0.015, rough: 0.95 }))
    }
  } else {
    parts.push(...toilet(xL, z0 + vw + (vw > 0 ? 0.05 : 0) + 0.4, 'left', fx))
  }
  return parts
}

// ---------------------------------------------------------------------------
// Enclosed patio
// ---------------------------------------------------------------------------

function patio(W, L, d) {
  const parts = []
  const knee = d.enclosure === 'knee' ? 0.55 : 0.06
  const sides = [
    { len: W, pos: (t) => [-W / 2 + t, 0, -L / 2], axis: 'x' },
    { len: L, pos: (t) => [-W / 2, 0, -L / 2 + t], axis: 'z' },
  ]
  for (const s of sides) {
    const n = Math.max(2, Math.round(s.len / 1.2))
    const step = s.len / n
    const mid = s.pos(s.len / 2)
    const sized = (a, h, b) => (s.axis === 'x' ? [s.len, h, a] : [b, h, s.len])
    parts.push(box(sized(0.12, knee, 0.12), [mid[0], F + knee / 2, mid[2]], C.white, { radius: 0.02 }))
    parts.push(box(sized(0.1, 0.08, 0.1), [mid[0], 2.35, mid[2]], C.white, { radius: 0.02 }))
    const ph = 2.31 - F - knee
    parts.push(d.panels === 'screen'
      ? box(sized(0.008, ph, 0.008), [mid[0], F + knee + ph / 2, mid[2]], '#2f3335', { opacity: 0.42, radius: 0, rough: 0.95, cast: false })
      : box(sized(0.01, ph, 0.01), [mid[0], F + knee + ph / 2, mid[2]], '#cfe2ea', { ...GLASS, opacity: 0.16 }))
    if (d.panels === 'screen') parts.push(box(sized(0.05, 0.05, 0.05), [mid[0], F + 1.0, mid[2]], C.white, { radius: 0.015 }))
    for (let i = 0; i <= n; i++) {
      const p = s.pos(i * step)
      parts.push(box([0.08, 2.35 - F, 0.08], [p[0], F + (2.35 - F) / 2, p[2]], C.white, { radius: 0.02 }))
    }
  }
  // Seating
  const cx = 0.2, cz = 0.1
  parts.push(cyl(0.38, 0.04, [cx, F + 0.5, cz], C.wicker, { rough: 0.7 }), cyl(0.06, 0.48, [cx, F + 0.24, cz], C.charcoal))
  parts.push(...armchair(cx - 1.0, cz, Math.PI / 2).map(p => ({ ...p, color: C.wicker })))
  parts.push(...armchair(cx + 1.0, cz, -Math.PI / 2).map(p => ({ ...p, color: C.wicker })))
  parts.push(...plant(-W / 2 + 0.45, -L / 2 + 0.45, 1.1))
  if (W >= 3.6) parts.push(...plant(W / 2 - 0.5, -L / 2 + 0.45, 0.8))
  return parts
}

export function buildFixtures(d) {
  const W = d.width * FT
  const L = d.length * FT
  if (d.type === 'living') return living(W, L)
  if (d.type === 'bedroom') return bedroom(W, L)
  if (d.type === 'kitchen') return kitchen(W, L, d)
  if (d.type === 'bathroom') return bathroom(W, L, d)
  return patio(W, L, d)
}
