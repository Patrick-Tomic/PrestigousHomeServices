// Procedural floor textures, drawn into canvases at runtime so the hero
// never fetches an image. Each texture is a large swatch; every plank/tile
// samples a different window of it (see the per-instance UV in HeroScene).

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

// Tile: warm porcelain with soft stone veining.
function drawTile(size, seed) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')
  const img = ctx.createImageData(size, size)
  const { fbm, noise } = makeNoise(seed)
  const base = hex('#ebe5db'), vein = hex('#a89d8f')

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / size, v = y / size
      const n = fbm(u * 3, v * 3)
      const veinLine = Math.pow(1 - Math.abs(Math.sin((u * 2.2 + v * 1.4 + n * 2.6) * Math.PI)), 14)
      const speck = (noise(u * 160, v * 160) - 0.5) * 0.05
      const t = Math.min(1, veinLine * 0.45 + (n - 0.5) * 0.12 + speck)
      const i = (y * size + x) * 4
      for (let c = 0; c < 3; c++) img.data[i + c] = base[c] + (vein[c] - base[c]) * t
      img.data[i + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)
  return toTexture(canvas)
}

// Sunlight through a window: four panes with mullions. Drawn tiny on purpose —
// bilinear upscaling on the GPU gives the soft, out-of-focus edge for free.
export function createWindowLightTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 40
  canvas.height = 56
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, 40, 56)
  ctx.fillStyle = '#fff'
  const pad = 5, gap = 3
  const pw = (40 - pad * 2 - gap) / 2
  const ph = (56 - pad * 2 - gap) / 2
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 2; c++) {
      ctx.fillRect(pad + c * (pw + gap), pad + r * (ph + gap), pw, ph)
    }
  }
  const tex = new CanvasTexture(canvas)
  tex.colorSpace = SRGBColorSpace
  return tex
}

export function createFloorTextures(lite) {
  const k = lite ? 0.5 : 1
  return {
    hardwood: drawWood(1024 * k, 384 * k, {
      light: '#d39a5c', dark: '#8a5428', streak: '#5e3416',
      rings: 7, warp: 1.7, contrast: 0.7, seed: 7,
    }),
    laminate: drawWood(768 * k, 320 * k, {
      light: '#dcc4a0', dark: '#b48f68', streak: '#9a7752',
      rings: 6, warp: 0.9, contrast: 0.5, seed: 21,
    }),
    tile: drawTile(384 * k, 3),
  }
}
