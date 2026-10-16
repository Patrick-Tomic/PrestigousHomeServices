// Plank layout for the hero room's hardwood floor. Planks run along z (away
// from the camera) in staggered columns; each is one instance of a rounded
// box with its own position, length, texture window, tint and drop delay.

function seeded(seed) {
  let s = seed
  return () => ((s = (s * 16807) % 2147483647) / 2147483647)
}

// Texture swatch size in world units (how much floor one texture covers).
const SWATCH = [4.2, 1.6]

export const PLANK = { thickness: 0.05, gap: 0.007 }

export function buildPlanks({ width, depth, plankW: target = 0.3, minL = 1.0, maxL = 2.2 }) {
  const rand = seeded(11)
  const { gap } = PLANK
  const cols = Math.max(1, Math.round(width / target))
  const plankW = width / cols
  const pieces = []

  for (let c = 0; c < cols; c++) {
    const x = -width / 2 + plankW * (c + 0.5)
    // Stagger the joints: start each column at a different point.
    let z = -depth / 2 - rand() * maxL * 0.8
    while (z < depth / 2) {
      const len = minL + rand() * (maxL - minL)
      const z0 = Math.max(z, -depth / 2)
      const z1 = Math.min(z + len, depth / 2)
      if (z1 - z0 > 0.15) pieces.push({ x, z: (z0 + z1) / 2, sx: plankW - gap, sz: z1 - z0 - gap })
      z += len
    }
  }

  return pieces.map((p) => {
    // The grain runs along the plank's length (z), see patchInstanceUv.
    const uScale = p.sz / SWATCH[0]
    const vScale = p.sx / SWATCH[1]
    return {
      ...p,
      uv: [rand() * Math.max(0, 1 - uScale), rand() * Math.max(0, 1 - vScale), uScale, vScale],
      tint: 0.86 + rand() * 0.22,
      // 0..1: back of the room first, so the floor lays itself toward you.
      order: ((p.z + depth / 2) / depth) * 0.9 + rand() * 0.1,
      tilt: (rand() - 0.5) * 0.5,
    }
  })
}
