// Floor layouts for the room designer, at real-world sizes (metres). Every
// piece is one instance: position, size, texture window, tint, and its place
// in the diagonal flip wave used when the material changes.

function seeded(seed) {
  let s = seed
  return () => ((s = (s * 16807) % 2147483647) / 2147483647)
}

export const PATTERNS = {
  // 5" planks, random lengths
  hardwood: { thickness: 0.03, gap: 0.004, swatch: [2.4, 0.9], tint: [0.82, 0.3] },
  // 7.5" boards, 4 ft long, regular 1/3 stagger
  laminate: { thickness: 0.028, gap: 0.003, swatch: [2.8, 1.1], tint: [0.9, 0.14] },
  // 24" square porcelain
  tile: { thickness: 0.024, gap: 0.006, swatch: [1.2, 1.2], tint: [0.96, 0.06] },
  // 12" × 24" stone in a running bond
  stone: { thickness: 0.026, gap: 0.006, swatch: [1.4, 1.4], tint: [0.9, 0.16] },
}

// Columns of boards running along z, joints staggered.
function boards({ width, depth, boardW, lengths, fixed, gap, rand }) {
  const cols = Math.max(1, Math.round(width / boardW))
  const w = width / cols
  const out = []
  for (let c = 0; c < cols; c++) {
    const x = -width / 2 + w * (c + 0.5)
    let z = -depth / 2 - (fixed ? ((c * 0.34) % 1) * fixed : rand() * lengths[1] * 0.8)
    while (z < depth / 2) {
      const len = fixed || lengths[0] + rand() * (lengths[1] - lengths[0])
      const z0 = Math.max(z, -depth / 2)
      const z1 = Math.min(z + len, depth / 2)
      if (z1 - z0 > 0.05) out.push({ x, z: (z0 + z1) / 2, sx: w - gap, sz: z1 - z0 - gap })
      z += len
    }
  }
  return out
}

// A grid of tiles; `bond` offsets every other row by half a tile.
function tiles({ width, depth, tw, td, bond, gap }) {
  const out = []
  const rows = Math.ceil(depth / td)
  for (let r = 0; r < rows; r++) {
    const z0 = -depth / 2 + r * td
    const z1 = Math.min(z0 + td, depth / 2)
    let x = -width / 2 - (bond && r % 2 ? tw / 2 : 0)
    while (x < width / 2) {
      const x0 = Math.max(x, -width / 2)
      const x1 = Math.min(x + tw, width / 2)
      if (x1 - x0 > 0.04 && z1 - z0 > 0.04) {
        out.push({ x: (x0 + x1) / 2, z: (z0 + z1) / 2, sx: x1 - x0 - gap, sz: z1 - z0 - gap })
      }
      x += tw
    }
  }
  return out
}

export function buildFloor(kind, { width, depth }) {
  const rand = seeded({ hardwood: 11, laminate: 47, tile: 29, stone: 5 }[kind])
  const { gap, swatch, tint } = PATTERNS[kind]
  const pieces =
    kind === 'hardwood' ? boards({ width, depth, boardW: 0.127, lengths: [0.6, 1.8], gap, rand })
    : kind === 'laminate' ? boards({ width, depth, boardW: 0.19, fixed: 1.22, gap, rand })
    : kind === 'tile' ? tiles({ width, depth, tw: 0.61, td: 0.61, gap })
    : tiles({ width, depth, tw: 0.61, td: 0.305, bond: true, gap })

  // Boards carry their grain along z (the shader swaps u/v for them).
  const alongZ = kind === 'hardwood' || kind === 'laminate'
  return pieces.map((p) => {
    const u = (alongZ ? p.sz : p.sx) / swatch[0]
    const v = (alongZ ? p.sx : p.sz) / swatch[1]
    return {
      ...p,
      uv: [rand() * Math.max(0, 1 - u), rand() * Math.max(0, 1 - v), u, v],
      tint: tint[0] + rand() * tint[1],
      order: ((p.x + width / 2) / width) * 0.5 + ((p.z + depth / 2) / depth) * 0.45 + rand() * 0.05,
    }
  })
}
