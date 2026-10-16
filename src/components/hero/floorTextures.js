// Procedural floor textures (hero hardwood, plus the room designer's
// materials), drawn into canvases at runtime so nothing fetches an image.
// Each texture is a large swatch; every plank or tile samples a different
// window of it via a per-instance UV offset.

import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three'

// Small deterministic value noise — enough for grain without a library.
function makeNoise(seed = 1) {
  const SIZE = 256
  const perm = new Uint8Array(SIZE * 2)
  const vals = new Float32Array(SIZE)
  let s = seed
  const rand = () => ((s = (s * 16807) % 2147483647) / 2147483647)
  for (let i = 0; i < SIZE; i++) { perm[i] = i; vals[i] = rand() }
  for (let i = SIZE - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[perm[i], perm[j]] = [perm[j], perm[i]]
  }
  for (let i = 0; i < SIZE; i++) perm[i + SIZE] = perm[i]

  const lerp = (a, b, t) => a + (b - a) * t
  const fade = (t) => t * t * (3 - 2 * t)
  const at = (x, y) => vals[perm[(perm[x & 255] + y) & 511]]

  const noise = (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y)
    const xf = fade(x - xi), yf = fade(y - yi)
    return lerp(
      lerp(at(xi, yi), at(xi + 1, yi), xf),
      lerp(at(xi, yi + 1), at(xi + 1, yi + 1), xf),
      yf,
    )
  }
  const fbm = (x, y) => noise(x, y) * 0.6 + noise(x * 2.1, y * 2.1) * 0.28 + noise(x * 4.3, y * 4.3) * 0.12
  return { noise, fbm }
}

const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]

function toTexture(canvas) {
  const tex = new CanvasTexture(canvas)
  tex.colorSpace = SRGBColorSpace
  tex.wrapS = tex.wrapT = RepeatWrapping
  tex.anisotropy = 4
  return tex
}

// Wood: grain runs along the canvas width (the plank's length).
function drawWood(w, h, { light, dark, streak, rings, warp, contrast, seed }) {
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  const img = ctx.createImageData(w, h)
  const { noise, fbm } = makeNoise(seed)
  const L = hex(light), D = hex(dark), S = hex(streak)

  for (let y = 0; y < h; y++) {
    const v = y / h
    for (let x = 0; x < w; x++) {
      const u = x / w
      // Growth rings: stretched along u, warped by low-frequency noise.
      const g = v * rings + fbm(u * 3, v * 6) * warp
      const ring = g - Math.floor(g)
      const band = Math.pow(Math.abs(ring * 2 - 1), 3) * contrast
      // Fine pores / streaks that run with the grain.
      const pore = noise(u * 260, v * 70) > 0.86 ? 0.12 : 0
      const fleck = (noise(u * 6, v * 140) - 0.5) * 0.22
      const t = Math.min(1, Math.max(0, band + fleck))

      const i = (y * w + x) * 4
      for (let c = 0; c < 3; c++) {
        const base = L[c] + (D[c] - L[c]) * t
        img.data[i + c] = base + (S[c] - base) * pore
      }
      img.data[i + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)
  return toTexture(canvas)
}

export function createHardwoodTexture(lite) {
  const k = lite ? 0.5 : 1
  return drawWood(1024 * k, 384 * k, {
    light: '#c99d70', dark: '#94673f', streak: '#6b4626',
    rings: 5, warp: 1.4, contrast: 0.45, seed: 7,
  })
}

// ---------------------------------------------------------------------------
// Room designer materials. Drawn light and neutral so a tone colour can be
// multiplied on top (see TONE_COLORS in the designer).
// ---------------------------------------------------------------------------

// Porcelain tile with soft stone veining.
function drawTile(size, seed) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')
  const img = ctx.createImageData(size, size)
  const { fbm, noise } = makeNoise(seed)
  const base = hex('#f0ece6'), vein = hex('#b3aba1')
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / size, v = y / size
      const n = fbm(u * 3, v * 3)
      const veinLine = Math.pow(1 - Math.abs(Math.sin((u * 2.2 + v * 1.4 + n * 2.6) * Math.PI)), 14)
      const speck = (noise(u * 160, v * 160) - 0.5) * 0.04
      const t = Math.min(1, veinLine * 0.4 + (n - 0.5) * 0.1 + speck)
      const i = (y * size + x) * 4
      for (let c = 0; c < 3; c++) img.data[i + c] = base[c] + (vein[c] - base[c]) * t
      img.data[i + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)
  return toTexture(canvas)
}

// Travertine-style natural stone: mottled, with fine horizontal bedding.
function drawStone(size, seed) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')
  const img = ctx.createImageData(size, size)
  const { fbm, noise } = makeNoise(seed)
  const light = hex('#efe4d3'), dark = hex('#c7b49a'), pit = hex('#a8957c')
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / size, v = y / size
      const m = fbm(u * 4, v * 4)
      const bed = (Math.sin((v * 18 + fbm(u * 2, v * 2) * 3) * Math.PI) * 0.5 + 0.5) * 0.25
      const t = Math.min(1, Math.max(0, (m - 0.35) * 1.1 + bed))
      const p = noise(u * 90, v * 60) > 0.84 ? 0.5 : 0
      const i = (y * size + x) * 4
      for (let c = 0; c < 3; c++) {
        const b = light[c] + (dark[c] - light[c]) * t
        img.data[i + c] = b + (pit[c] - b) * p
      }
      img.data[i + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)
  return toTexture(canvas)
}

// Glossy white subway tile with grout, for kitchen backsplashes and showers.
export function createSubwayTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#cfc9c1'
  ctx.fillRect(0, 0, 256, 256)
  const rows = 8, cols = 4, g = 3
  const h = 256 / rows, w = 256 / cols
  for (let r = 0; r < rows; r++) {
    const off = r % 2 ? w / 2 : 0
    for (let c = -1; c <= cols; c++) {
      const x = c * w + off
      const grad = ctx.createLinearGradient(0, r * h, 0, (r + 1) * h)
      grad.addColorStop(0, '#fbfaf8')
      grad.addColorStop(1, '#eceae6')
      ctx.fillStyle = grad
      ctx.fillRect(x + g / 2, r * h + g / 2, w - g, h - g)
    }
  }
  return toTexture(canvas)
}

export function createFloorTexture(kind, lite) {
  const k = lite ? 0.5 : 1
  if (kind === 'hardwood') {
    return drawWood(1024 * k, 384 * k, {
      light: '#e9c9a1', dark: '#b98b5f', streak: '#8a6140',
      rings: 5, warp: 1.4, contrast: 0.45, seed: 7,
    })
  }
  if (kind === 'laminate') {
    return drawWood(768 * k, 320 * k, {
      light: '#e6d6bf', dark: '#c4ab8b', streak: '#a68d6e',
      rings: 6, warp: 0.9, contrast: 0.45, seed: 21,
    })
  }
  if (kind === 'tile') return drawTile(384 * k, 3)
  return drawStone(384 * k, 13)
}
