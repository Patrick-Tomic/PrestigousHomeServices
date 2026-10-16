// "The Floor Comes Together" — the 3D hero scene: the interior of an empty,
// freshly finished room at golden hour. The hardwood floor lays itself plank
// by plank toward the camera, then sunlight comes through a tall window and
// stretches across the boards. The bare back wall is the clean surface the
// headline sits on. Loaded lazily by Hero.jsx after first paint, so none of
// three.js is in the main bundle.

import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  InstancedBufferAttribute,
  MathUtils,
  MeshStandardMaterial,
  Object3D,
  PMREMGenerator,
  SRGBColorSpace,
  Vector3,
} from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { createHardwoodTexture } from './floorTextures'
import { buildPlanks, PLANK } from './floorLayouts'

// Room bounds (metres). The camera stands near the front, looking at the
// back-left; the window is in the right wall.
const ROOM = { x0: -5, x1: 4, z0: -4, z1: 7, h: 3.2 }
const WIN = { z0: -2.8, z1: 1.6, y0: 0.25, y1: 2.7 }
const WALL = '#e6dfd4'
const FRAME = '#262321'

const FLOOR_START = 0.2
const FLOOR_SPREAD = 1.7
const DROP = 1.2
const DUR_IN = 0.7
const SUN_START = 1.7 // sunlight fades in as the last boards land
const SUN_DUR = 1.4

const clamp01 = (t) => Math.min(1, Math.max(0, t))
const easeOutBack = (t, s = 1.1) => 1 + (s + 1) * (t - 1) ** 3 + s * (t - 1) ** 2
const easeOutCubic = (t) => 1 - (1 - t) ** 3

// Gives every plank its own window into the shared texture, with the grain
// running along the plank's length.
function patchInstanceUv(shader) {
  shader.vertexShader = 'attribute vec4 aUv;\n' + shader.vertexShader.replace(
    '#include <uv_vertex>',
    '#include <uv_vertex>\n#ifdef USE_MAP\n\tvMapUv = vMapUv.yx * aUv.zw + aUv.xy;\n#endif',
  )
}

const rounded = (x, y, z, r) => new RoundedBoxGeometry(x, y, z, 3, Math.min(r, Math.min(x, y, z) / 2 - 1e-4))

function canvasTexture(w, h, draw) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  draw(c.getContext('2d'), w, h)
  const t = new CanvasTexture(c)
  t.colorSpace = SRGBColorSpace
  return t
}

const dummy = new Object3D()
const tint = new Color()

// ---------------------------------------------------------------------------
// Floor
// ---------------------------------------------------------------------------

function Floor({ lite, reduced }) {
  const meshRef = useRef(null)
  const width = ROOM.x1 - ROOM.x0
  const depth = ROOM.z1 - ROOM.z0
  const { thickness } = PLANK
  const pieces = useMemo(() => buildPlanks({ width, depth, plankW: lite ? 0.36 : 0.3 }), [width, depth, lite])
  const texture = useMemo(() => createHardwoodTexture(lite), [lite])

  // Rounded geometry at the average plank size, so instance scaling barely
  // distorts the bevel that catches the light along each board.
  const avg = useMemo(() => [
    pieces.reduce((s, p) => s + p.sx, 0) / pieces.length,
    pieces.reduce((s, p) => s + p.sz, 0) / pieces.length,
  ], [pieces])

  const geometry = useMemo(() => {
    const g = rounded(avg[0], thickness, avg[1], 0.016)
    const uv = new Float32Array(pieces.length * 4)
    pieces.forEach((p, i) => uv.set(p.uv, i * 4))
    g.setAttribute('aUv', new InstancedBufferAttribute(uv, 4))
    return g
  }, [pieces, avg, thickness])

  const material = useMemo(() => {
    const m = new MeshStandardMaterial({ map: texture, roughness: 0.38, metalness: 0, envMapIntensity: 0.5 })
    m.onBeforeCompile = patchInstanceUv
    return m
  }, [texture])

  useEffect(() => () => { geometry.dispose(); material.dispose(); texture.dispose() }, [geometry, material, texture])

  const anim = useRef({ start: null, done: false })

  // Start every plank collapsed so nothing flashes at the origin.
  useLayoutEffect(() => {
    const mesh = meshRef.current
    dummy.position.set(0, 0, 0)
    dummy.rotation.set(0, 0, 0)
    dummy.scale.setScalar(0)
    dummy.updateMatrix()
    pieces.forEach((p, i) => {
      mesh.setMatrixAt(i, dummy.matrix)
      mesh.setColorAt(i, tint.setRGB(p.tint, p.tint * 0.985, p.tint * 0.97))
    })
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }, [pieces])

  useFrame(({ clock }) => {
    const mesh = meshRef.current
    const a = anim.current
    if (!mesh || a.done) return
    if (a.start === null) a.start = clock.elapsedTime
    const elapsed = clock.elapsedTime - a.start
    let finished = true

    for (let i = 0; i < pieces.length; i++) {
      const p = pieces[i]
      const t = reduced ? 1 : clamp01((elapsed - FLOOR_START - p.order * FLOOR_SPREAD) / DUR_IN)
      if (t < 1) finished = false
      let lift = 0, tilt = 0, scale = 0
      if (t > 0) {
        lift = DROP * (1 - easeOutBack(t))
        scale = 1 - (1 - Math.min(1, t / 0.3)) ** 2
        tilt = p.tilt * (1 - easeOutCubic(t))
      }
      dummy.position.set(p.x, thickness / 2 + lift, p.z)
      dummy.rotation.set(tilt * 0.35, 0, tilt)
      dummy.scale.set((p.sx / avg[0]) * scale, scale, (p.sz / avg[1]) * scale)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
    a.done = finished
  })

  return (
    <group position={[(ROOM.x0 + ROOM.x1) / 2, 0, (ROOM.z0 + ROOM.z1) / 2]}>
      {/* Subfloor seen in the seams between boards */}
      <mesh rotation-x={-Math.PI / 2} position-y={0.001}>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color="#24170e" roughness={0.9} />
      </mesh>
      <instancedMesh ref={meshRef} args={[geometry, material, pieces.length]} frustumCulled={false} />
    </group>
  )
}

// ---------------------------------------------------------------------------
// Room shell: walls, ceiling, baseboards, window
// ---------------------------------------------------------------------------

function Box({ size, position, color, radius = 0, roughness = 0.9 }) {
  const geometry = useMemo(() => (radius ? rounded(...size, radius) : null), [size, radius])
  useEffect(() => () => geometry?.dispose(), [geometry])
  return (
    <mesh position={position} geometry={geometry ?? undefined}>
      {!geometry && <boxGeometry args={size} />}
      <meshStandardMaterial color={color} roughness={roughness} />
    </mesh>
  )
}

// Soft darkening where the floor meets the walls (baked ambient occlusion).
function FloorOcclusion() {
  const texture = useMemo(() => canvasTexture(4, 64, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h)
    g.addColorStop(0, 'rgba(0,0,0,0.55)')
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
  }), [])
  useEffect(() => () => texture.dispose(), [texture])
  const y = PLANK.thickness + 0.002
  const w = ROOM.x1 - ROOM.x0
  const d = ROOM.z1 - ROOM.z0
  const strip = (key, args, position, rotZ) => (
    <mesh key={key} position={position} rotation={[-Math.PI / 2, 0, rotZ]}>
      <planeGeometry args={args} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} />
    </mesh>
  )
  return (
    <>
      {strip('back', [w, 0.7], [(ROOM.x0 + ROOM.x1) / 2, y, ROOM.z0 + 0.35], 0)}
      {strip('left', [d, 0.7], [ROOM.x0 + 0.35, y, (ROOM.z0 + ROOM.z1) / 2], -Math.PI / 2)}
      {strip('right', [d, 0.5], [ROOM.x1 - 0.25, y, (ROOM.z0 + ROOM.z1) / 2], Math.PI / 2)}
    </>
  )
}

function Room() {
  const { x0, x1, z0, z1, h } = ROOM
  const cx = (x0 + x1) / 2
  const cz = (z0 + z1) / 2
  const w = x1 - x0
  const d = z1 - z0
  const T = 0.2
  const wx = x1 + T / 2
  const by = PLANK.thickness + 0.065

  return (
    <group>
      {/* Walls and ceiling */}
      <Box size={[w + 2 * T, h, T]} position={[cx, h / 2, z0 - T / 2]} color={WALL} />
      <Box size={[T, h, d + 2 * T]} position={[x0 - T / 2, h / 2, cz]} color={WALL} />
      <Box size={[w + 2 * T, h, T]} position={[cx, h / 2, z1 + T / 2]} color={WALL} />
      <Box size={[w + 2 * T, T, d + 2 * T]} position={[cx, h + T / 2, cz]} color="#ece6dc" />

      {/* Right wall, built around the window opening */}
      <Box size={[T, h, WIN.z0 - z0 + T]} position={[wx, h / 2, (z0 - T + WIN.z0) / 2]} color={WALL} />
      <Box size={[T, h, z1 + T - WIN.z1]} position={[wx, h / 2, (WIN.z1 + z1 + T) / 2]} color={WALL} />
      <Box size={[T, WIN.y0, WIN.z1 - WIN.z0]} position={[wx, WIN.y0 / 2, (WIN.z0 + WIN.z1) / 2]} color={WALL} />
      <Box size={[T, h - WIN.y1, WIN.z1 - WIN.z0]} position={[wx, (WIN.y1 + h) / 2, (WIN.z0 + WIN.z1) / 2]} color={WALL} />

      {/* Baseboards */}
      <Box size={[w, 0.13, 0.03]} position={[cx, by, z0 + 0.015]} color="#f3eee6" radius={0.01} roughness={0.6} />
      <Box size={[0.03, 0.13, d]} position={[x0 + 0.015, by, cz]} color="#f3eee6" radius={0.01} roughness={0.6} />
      <Box size={[0.03, 0.13, WIN.z0 - z0]} position={[x1 - 0.015, by, (z0 + WIN.z0) / 2]} color="#f3eee6" radius={0.01} roughness={0.6} />
      <Box size={[0.03, 0.13, z1 - WIN.z1]} position={[x1 - 0.015, by, (WIN.z1 + z1) / 2]} color="#f3eee6" radius={0.01} roughness={0.6} />

      <Window />
      <FloorOcclusion />
    </group>
  )
}

// Tall three-pane window with slim black frames and a bright sky beyond.
function Window() {
  const { z0, z1, y0, y1 } = WIN
  const fx = ROOM.x1 + 0.12
  const hgt = y1 - y0
  const zc = (z0 + z1) / 2
  const sky = useMemo(() => canvasTexture(4, 128, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h)
    g.addColorStop(0, '#fff8ec')
    g.addColorStop(0.6, '#ffe7c4')
    g.addColorStop(1, '#f6c98f')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
  }), [])
  useEffect(() => () => sky.dispose(), [sky])

  const mullions = [z0 + 0.025, z0 + (z1 - z0) / 3, z0 + (2 * (z1 - z0)) / 3, z1 - 0.025]
  return (
    <group>
      <mesh position={[ROOM.x1 + 0.6, (y0 + y1) / 2 + 0.3, zc]} rotation-y={-Math.PI / 2}>
        <planeGeometry args={[(z1 - z0) + 1.5, hgt + 1.5]} />
        <meshBasicMaterial map={sky} toneMapped={false} />
      </mesh>
      {mullions.map((z) => (
        <Box key={z} size={[0.06, hgt, 0.05]} position={[fx, (y0 + y1) / 2, z]} color={FRAME} radius={0.02} roughness={0.5} />
      ))}
      <Box size={[0.06, 0.05, z1 - z0]} position={[fx, y0 + 0.025, zc]} color={FRAME} radius={0.02} roughness={0.5} />
      <Box size={[0.06, 0.05, z1 - z0]} position={[fx, y1 - 0.025, zc]} color={FRAME} radius={0.02} roughness={0.5} />
    </group>
  )
}

// ---------------------------------------------------------------------------
// Sunlight: soft window light plus the pane-shaped patch on the floor
// ---------------------------------------------------------------------------

// Where the sun through the window lands: it travels into the room (-x),
// down, and slightly toward the camera (+z).
const SUN_DIR = { down: 0.72, toward: 0.36 }

function sunPatchGeometry() {
  const { z0, z1, y0, y1 } = WIN
  const land = (y) => ({ x: ROOM.x1 - y / SUN_DIR.down, dz: (y / SUN_DIR.down) * SUN_DIR.toward })
  const near = land(y0), far = land(y1)
  const y = PLANK.thickness + 0.004
  const g = new BufferGeometry()
  g.setAttribute('position', new BufferAttribute(new Float32Array([
    near.x, y, z0 + near.dz,
    near.x, y, z1 + near.dz,
    far.x, y, z1 + far.dz,
    far.x, y, z0 + far.dz,
  ]), 3))
  g.setAttribute('uv', new BufferAttribute(new Float32Array([0, 0, 0, 1, 1, 1, 1, 0]), 2))
  g.setIndex([0, 2, 1, 0, 3, 2])
  return g
}

function Sunlight({ reduced }) {
  const lamp = useRef(null)
  const target = useMemo(() => new Object3D(), [])
  const patch = useRef(null)
  const start = useRef(null)
  const geometry = useMemo(() => sunPatchGeometry(), [])
  // Three panes with mullion gaps, brightest near the window. Drawn small so
  // GPU upscaling softens the edges.
  const texture = useMemo(() => canvasTexture(48, 96, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, w, 0)
    g.addColorStop(0, 'rgba(255,255,255,1)')
    g.addColorStop(1, 'rgba(255,255,255,0.45)')
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = g
    const pad = 3, gap = 3
    const pane = (h - pad * 2 - gap * 2) / 3
    for (let i = 0; i < 3; i++) ctx.fillRect(pad, pad + i * (pane + gap), w - pad * 2, pane)
  }), [])
  useEffect(() => () => { geometry.dispose(); texture.dispose() }, [geometry, texture])

  useFrame(({ clock }) => {
    if (start.current === null) start.current = clock.elapsedTime
    const t = reduced ? 1 : MathUtils.smoothstep(clock.elapsedTime - start.current, SUN_START, SUN_START + SUN_DUR)
    lamp.current.intensity = 8 + t * 42
    patch.current.material.opacity = t * 0.3
  })

  return (
    <>
      {/* Soft window light pouring into the room: a spotlight with full
          penumbra, set above ceiling height so it falls only downward (far
          cheaper than an area light's lookup tables). */}
      <spotLight
        ref={lamp}
        position={[ROOM.x1 + 2.6, ROOM.h + 1.4, (WIN.z0 + WIN.z1) / 2]}
        target={target}
        angle={0.85}
        penumbra={1}
        decay={1.1}
        color="#ffdcae"
        intensity={6}
      />
      <primitive object={target} position={[ROOM.x0 + 3, 0, (WIN.z0 + WIN.z1) / 2 + 1]} />
      <mesh ref={patch} geometry={geometry}>
        <meshBasicMaterial map={texture} color="#ffd7a6" transparent opacity={0} blending={AdditiveBlending} depthWrite={false} />
      </mesh>
    </>
  )
}

// ---------------------------------------------------------------------------
// Environment, camera
// ---------------------------------------------------------------------------

// Procedural reflections (no HDR download) for the satin floor finish.
function StudioEnvironment() {
  const get = useThree(s => s.get)
  useEffect(() => {
    const { gl, scene } = get()
    const pmrem = new PMREMGenerator(gl)
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = env
    scene.environmentIntensity = 0.22
    return () => { scene.environment = null; env.dispose(); pmrem.dispose() }
  }, [get])
  return null
}

// Standing in the room: a slow drift, gentle mouse parallax (a few degrees),
// and a pull-up-and-back as the hero scrolls out.
function CameraRig({ lite, reduced }) {
  const pointer = useRef({ x: 0, y: 0 })
  const view = lite
    ? { pos: [0.4, 1.6, 6.0], look: [3.0, 0.95, -3] }
    : { pos: [1.4, 1.5, 5.6], look: [0.1, 1.05, -3] }
  const look = useMemo(() => new Vector3(), [])
  const live = useRef(null)

  useEffect(() => {
    if (reduced || lite) return
    const onMove = (e) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [reduced, lite])

  useFrame(({ camera, clock }, dt) => {
    const scroll = reduced ? 0 : clamp01(window.scrollY / window.innerHeight)
    const drift = reduced ? 0 : Math.sin(clock.elapsedTime * 0.12)
    const goal = {
      px: view.pos[0] + drift * 0.12 - pointer.current.x * 0.12,
      py: view.pos[1] + scroll * 1.0,
      pz: view.pos[2] + scroll * 1.0,
      lx: view.look[0] + drift * 0.25 + pointer.current.x * 0.35,
      ly: view.look[1] - pointer.current.y * 0.18 - scroll * 0.7,
    }
    if (!live.current) live.current = { ...goal }
    const l = live.current
    for (const k in goal) l[k] = MathUtils.damp(l[k], goal[k], 2.5, dt)
    camera.position.set(l.px, l.py, l.pz)
    look.set(l.lx, l.ly, view.look[2])
    camera.lookAt(look)
  })
  return null
}

function ReadySignal({ onReady }) {
  const sent = useRef(false)
  useFrame(() => {
    if (sent.current) return
    sent.current = true
    onReady?.()
  })
  return null
}

export default function HeroScene({ paused, lite, reduced, onReady }) {
  return (
    <Canvas
      dpr={Math.min(window.devicePixelRatio || 1, 2)}
      frameloop={paused ? 'never' : 'always'}
      gl={{
        antialias: true,
        powerPreference: 'high-performance',
        toneMapping: ACESFilmicToneMapping,
        toneMappingExposure: 1.0,
        outputColorSpace: SRGBColorSpace,
      }}
      camera={{ fov: lite ? 58 : 46, near: 0.1, far: 40, position: [2.7, 1.5, 5.5] }}
    >
      <color attach="background" args={['#15110e']} />
      <hemisphereLight args={['#fff1e0', '#4a3a2e', 0.32]} />
      <StudioEnvironment />
      <CameraRig lite={lite} reduced={reduced} />

      <Room />
      <Floor lite={lite} reduced={reduced} />
      <Sunlight reduced={reduced} />

      <ReadySignal onReady={onReady} />
    </Canvas>
  )
}
