// Furniture and fixtures for each room type, built from rounded boxes,
// cylinders and spheres. Everything is placed against the two visible walls
// (back wall at z = -L/2, left wall at x = -W/2) so the cutaway stays open.
// Furniture is there for scale; the fixtures reflect the options chosen.

import { CABINETS, FT, bathroomLayout } from './designOptions'

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

function kitchen(W, L, d) {
  const cab = CABINETS[d.cabinets].color
  const zb = -L / 2 + 0.3
  const fridgeW = 0.8
  const x0 = -W / 2 + fridgeW + 0.02
  const units = Math.max(2, Math.floor(Math.min(W - fridgeW - 0.3, 4.2) / 0.6))
  const run = units * 0.6
  const parts = [
    box([fridgeW, 1.95, 0.7], [-W / 2 + fridgeW / 2, F + 0.975, -L / 2 + 0.36], C.steel, { radius: 0.03, metal: 0.6, rough: 0.3 }),
    box([run + 0.04, 0.04, 0.64], [x0 + run / 2, F + 0.9, zb + 0.02], C.quartz, { radius: 0.012, rough: 0.25 }),
  ]
  for (let i = 0; i < units; i++) {
    const x = x0 + 0.3 + i * 0.6
    parts.push(box([0.59, 0.84, 0.58], [x, F + 0.44, zb], cab, { radius: 0.015, rough: 0.5 }))
    parts.push(box([0.59, 0.72, 0.34], [x, F + 1.86, -L / 2 + 0.17], cab, { radius: 0.015, rough: 0.5 }))
    parts.push(box([0.14, 0.02, 0.02], [x, F + 0.78, zb + 0.3], C.steel, { radius: 0.008, metal: 0.8, rough: 0.3 }))
  }
  // Sink and cooktop
  parts.push(box([0.5, 0.012, 0.38], [x0 + 0.9, F + 0.926, zb + 0.04], '#8d9295', { radius: 0.03, metal: 0.7, rough: 0.25 }))
  parts.push(cyl(0.015, 0.28, [x0 + 0.9, F + 1.06, zb - 0.2], C.steel, { metal: 0.8, rough: 0.25 }))
  if (units >= 4) parts.push(box([0.58, 0.012, 0.5], [x0 + run - 0.6, F + 0.926, zb + 0.02], '#161616', { radius: 0.02, rough: 0.2 }))
  if (d.backsplash === 'subway') {
    parts.push(box([run, 0.58, 0.012], [x0 + run / 2, F + 1.21, -L / 2 + 0.006], '#ffffff', { map: 'subway', mapRepeat: [run / 0.6, 0.58 / 0.6], radius: 0, rough: 0.15, cast: false }))
  }
  // Island when there's room for it
  if (W >= 3.4 && L >= 3.7) {
    const iw = Math.min(2.0, run * 0.7)
    const zi = zb + 0.3 + 1.1 + 0.45
    parts.push(box([iw, 0.86, 0.85], [x0 + run / 2, F + 0.45, zi], cab, { radius: 0.02, rough: 0.5 }))
    parts.push(box([iw + 0.1, 0.04, 0.95], [x0 + run / 2, F + 0.9, zi], C.quartz, { radius: 0.012, rough: 0.25 }))
  }
  parts.push(...leftWindow(W, Math.max(-L / 2 + 1.4, Math.min(0.4, L / 2 - 1)), 1.1, 1.05, 1.0))
  return parts
}

function bathroom(W, L, d) {
  const { showerDepth, vanityW } = bathroomLayout(d)
  const parts = []
  const wallTile = (size, pos) => box(size, pos, '#ffffff', {
    map: 'subway', mapRepeat: [Math.max(size[0], size[2]) / 0.6, size[1] / 0.6], radius: 0, rough: 0.15, cast: false,
  })

  if (d.shower === 'tub') {
    const tw = Math.min(1.52, W - 0.9)
    parts.push(
      box([tw, 0.55, 0.76], [-W / 2 + tw / 2, F + 0.275, -L / 2 + 0.38], C.porcelain, { radius: 0.06, rough: 0.2 }),
      box([tw - 0.16, 0.02, 0.6], [-W / 2 + tw / 2, F + 0.545, -L / 2 + 0.38], '#dfe5e8', { radius: 0.05, rough: 0.15 }),
      wallTile([tw, 1.55, 0.012], [-W / 2 + tw / 2, F + 0.55 + 0.775, -L / 2 + 0.006]),
      wallTile([0.012, 1.55, 0.76], [-W / 2 + 0.006, F + 0.55 + 0.775, -L / 2 + 0.38]),
      cyl(0.06, 0.03, [-W / 2 + 0.35, F + 1.95, -L / 2 + 0.1], C.steel, { metal: 0.8, rough: 0.25, rot: [Math.PI / 2, 0, 0] }),
    )
  } else {
    const sw = Math.min(1.0, W - 1.0)
    parts.push(
      wallTile([sw, 2.1, 0.012], [-W / 2 + sw / 2, F + 1.05, -L / 2 + 0.006]),
      wallTile([0.012, 2.1, showerDepth], [-W / 2 + 0.006, F + 1.05, -L / 2 + showerDepth / 2]),
      box([sw * 0.8, 1.95, 0.012], [-W / 2 + sw * 0.4, F + 0.995, -L / 2 + showerDepth], '#d8e6ec', { opacity: 0.22, radius: 0, rough: 0.05, cast: false }),
      box([sw * 0.8, 0.03, 0.03], [-W / 2 + sw * 0.4, F + 1.985, -L / 2 + showerDepth], C.charcoal, { radius: 0.01 }),
      cyl(0.09, 0.02, [-W / 2 + sw / 2, F + 2.0, -L / 2 + 0.2], C.charcoal, { rough: 0.3 }),
      cyl(0.012, 0.2, [-W / 2 + sw / 2, F + 2.02, -L / 2 + 0.1], C.charcoal, { rot: [Math.PI / 2, 0, 0] }),
    )
  }

  // Toilet beside the shower/tub on the back wall
  const showerW = d.shower === 'tub' ? Math.min(1.52, W - 0.9) : Math.min(1.0, W - 1.0)
  const tx = Math.min(-W / 2 + showerW + 0.42, W / 2 - 0.3)
  parts.push(
    box([0.42, 0.38, 0.18], [tx, F + 0.62, -L / 2 + 0.1], C.porcelain, { radius: 0.04, rough: 0.2 }),
    { ...cyl(0.19, 0.4, [tx, F + 0.2, -L / 2 + 0.42], C.porcelain, { rough: 0.2 }), size: [0.19, 0.4, 0.25] },
    { ...cyl(0.2, 0.03, [tx, F + 0.415, -L / 2 + 0.42], C.white, { rough: 0.3 }), size: [0.2, 0.03, 0.26] },
  )

  // Vanity along the left wall, in front of the shower
  const z0 = -L / 2 + showerDepth + 0.15
  const zc = z0 + vanityW / 2
  const sinks = vanityW >= 1.4 ? [zc - vanityW / 4, zc + vanityW / 4] : [zc]
  parts.push(
    box([0.55, 0.8, vanityW], [-W / 2 + 0.275, F + 0.4, zc], C.walnut, { radius: 0.02, rough: 0.55 }),
    box([0.57, 0.04, vanityW + 0.02], [-W / 2 + 0.285, F + 0.82, zc], C.quartz, { radius: 0.012, rough: 0.25 }),
    ...sinks.flatMap(z => [
      { ...cyl(0.17, 0.01, [-W / 2 + 0.3, F + 0.845, z], '#e3e7e9', { rough: 0.15 }), size: [0.17, 0.01, 0.2] },
      box([0.12, 0.025, 0.025], [-W / 2 + 0.07, F + 0.9, z], C.steel, { metal: 0.8, rough: 0.25, radius: 0.008 }),
      box([0.015, 0.75, Math.min(0.62, vanityW / sinks.length - 0.1)], [-W / 2 + 0.008, F + 1.5, z], '#dbe3e7', { metal: 0.9, rough: 0.05, radius: 0.004 }),
    ]),
  )
  return parts
}

function patio(W, L) {
  const parts = []
  // Enclosure: knee wall, posts, top rail and glass on the two visible sides
  const sides = [
    { len: W, pos: (t) => [-W / 2 + t, 0, -L / 2], axis: 'x' },
    { len: L, pos: (t) => [-W / 2, 0, -L / 2 + t], axis: 'z' },
  ]
  for (const s of sides) {
    const n = Math.max(2, Math.round(s.len / 1.2))
    const step = s.len / n
    const mid = s.pos(s.len / 2)
    parts.push(box(s.axis === 'x' ? [s.len, 0.55, 0.12] : [0.12, 0.55, s.len], [mid[0], F + 0.275, mid[2]], C.white, { radius: 0.02 }))
    parts.push(box(s.axis === 'x' ? [s.len, 0.08, 0.1] : [0.1, 0.08, s.len], [mid[0], 2.35, mid[2]], C.white, { radius: 0.02 }))
    parts.push(box(s.axis === 'x' ? [s.len, 1.75, 0.01] : [0.01, 1.75, s.len], [mid[0], F + 0.55 + 0.875, mid[2]], '#cfe2ea', { opacity: 0.16, radius: 0, rough: 0.05, cast: false }))
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
  return patio(W, L)
}
