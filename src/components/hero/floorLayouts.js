// Generates the piece layout for each floor material. Every piece is one
// instance of a unit box: position, size, which window of the texture it
// samples, a colour tint, and the delay before it drops in.

function seeded(seed) {
  let s = seed
  return () => ((s = (s * 16807) % 2147483647) / 2147483647)
}

// Texture swatch size in world units (how much floor one texture covers).
const SWATCH = {
  hardwood: [4.2, 1.6],
  laminate: [4.8, 2.0],
  tile: [2.0, 2.0],
}

export const MATERIALS = {
  hardwood: { label: 'Hardwood', thickness: 0.08, gap: 0.014, subfloor: '#24170e' },
  tile: { label: 'Tile', thickness: 0.06, gap: 0.05, subfloor: '#bdb5a8' },
  laminate: { label: 'Laminate', thickness: 0.07, gap: 0.01, subfloor: '#2d2117' },
}

function plankRows({ width, depth, plankW, minL, maxL, fixedL, gap, rand }) {
  const pieces = []
  const rows = Math.ceil(depth / plankW)
  for (let r = 0; r < rows; r++) {
    const z = -depth / 2 + plankW * (r + 0.5)
    // Stagger the joints: start each row at a different point.
    let x = -width / 2 - (fixedL ? ((r * 0.37) % 1) * fixedL : rand() * maxL * 0.8)
    let col = 0
    while (x < width / 2) {
      const len = fixedL || minL + rand() * (maxL - minL)
      const x0 = Math.max(x, -width / 2)
      const x1 = Math.min(x + len, width / 2)
      if (x1 - x0 > 0.15) {
        pieces.push({ x: (x0 + x1) / 2, z, sx: x1 - x0 - gap, sz: plankW - gap, row: r, col })
      }
      x += len
      col++
    }
  }
  return pieces
}

function tileGrid({ width, depth, size, gap }) {
  const pieces = []
  const cols = Math.round(width / size)
  const rows = Math.round(depth / size)
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      pieces.push({
        x: -width / 2 + size * (c + 0.5),
        z: -depth / 2 + size * (r + 0.5),
        sx: size - gap,
        sz: size - gap,
        row: r,
        col: c,
      })
    }
  }
  return pieces
}

export function buildLayout(kind, { width, depth, lite }) {
  const rand = seeded(kind === 'hardwood' ? 11 : kind === 'tile' ? 29 : 47)
  const { gap } = MATERIALS[kind]

  let pieces
  if (kind === 'hardwood') {
    pieces = plankRows({ width, depth, plankW: lite ? 0.5 : 0.4, minL: 1.1, maxL: 2.6, gap, rand })
  } else if (kind === 'laminate') {
    pieces = plankRows({ width, depth, plankW: lite ? 0.75 : 0.62, fixedL: 2.4, gap, rand })
  } else {
    pieces = tileGrid({ width, depth, size: lite ? 1.0 : 0.9, gap })
  }

  const [sw, sh] = SWATCH[kind]
  // Drop order: back rows first, sweeping across each row, so the floor
  // visibly assembles toward the camera.
  const maxRow = Math.max(...pieces.map(p => p.row)) || 1
  return pieces.map((p) => {
    const uScale = p.sx / sw
    const vScale = p.sz / sh
    const along = (p.x + width / 2) / width
    const tint = kind === 'tile' ? 0.96 + rand() * 0.06 : kind === 'laminate' ? 0.9 + rand() * 0.14 : 0.78 + rand() * 0.36
    return {
      ...p,
      uv: [rand() * Math.max(0, 1 - uScale), rand() * Math.max(0, 1 - vScale), uScale, vScale],
      tint,
      // 0..1 normalized, scaled to seconds by the scene.
      order: (p.row / maxRow) * 0.72 + along * 0.22 + rand() * 0.06,
      tilt: (rand() - 0.5) * 0.5,
    }
  })
}
