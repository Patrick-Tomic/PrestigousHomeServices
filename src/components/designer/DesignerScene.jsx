// 3D preview for the room designer: a cutaway room (back and left walls)
// sized to the chosen dimensions, with the chosen floor and the fixtures for
// the room type. Changing the floor flips the boards/tiles over in a wave.
// Loaded lazily by the Design page, so three.js stays out of the main bundle.

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import {
  ACESFilmicToneMapping,
  BoxGeometry,
  Color,
  CylinderGeometry,
  InstancedBufferAttribute,
  MathUtils,
  MeshStandardMaterial,
  Object3D,
  PMREMGenerator,
  SRGBColorSpace,
  SphereGeometry,
  Vector3,
} from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { createFloorTexture, createSurfaceTextures } from '../hero/floorTextures'
import { FLOORS, FT, TONE_COLORS } from './designOptions'
import { buildFloor, PATTERNS } from './floorPattern'
import { buildFixtures, FLOOR_TOP, WALL_H } from './fixtures'

const KINDS = Object.keys(FLOORS)
const WALL = '#ebe5dc'
const SUBFLOOR = { hardwood: '#2a1c12', laminate: '#2d2318', tile: '#cdc6bb', stone: '#c9bfb1' }

const DROP = 0.9
const DUR_IN = 0.6
const FLIP = 0.3
const FLIP_SPREAD = 0.9

const clamp01 = (t) => Math.min(1, Math.max(0, t))
const easeOutBack = (t, s = 1.2) => 1 + (s + 1) * (t - 1) ** 3 + s * (t - 1) ** 2
const easeOutCubic = (t) => 1 - (1 - t) ** 3
const easeInCubic = (t) => t * t * t

const rounded = (x, y, z, r) => new RoundedBoxGeometry(x, y, z, 3, Math.min(r, Math.min(x, y, z) / 2 - 1e-4))

// Per-instance texture window. Boards swap u/v so the grain runs along z.
const uvPatch = (swap) => (shader) => {
  shader.vertexShader = 'attribute vec4 aUv;\n' + shader.vertexShader.replace(
    '#include <uv_vertex>',
    `#include <uv_vertex>\n#ifdef USE_MAP\n\tvMapUv = vMapUv${swap ? '.yx' : ''} * aUv.zw + aUv.xy;\n#endif`,
  )
}

const dummy = new Object3D()
const tint = new Color()

// ---------------------------------------------------------------------------
// Floor
// ---------------------------------------------------------------------------

function FloorLayer({ kind, active, tone, W, L, shadows, texture, reduced }) {
  const meshRef = useRef(null)
  const { thickness, gap } = PATTERNS[kind]
  const pieces = useMemo(() => buildFloor(kind, { width: W, depth: L }), [kind, W, L])
  const swap = kind === 'hardwood' || kind === 'laminate'

  const avg = useMemo(() => [
    pieces.reduce((s, p) => s + p.sx, 0) / pieces.length,
    pieces.reduce((s, p) => s + p.sz, 0) / pieces.length,
  ], [pieces])

  const geometry = useMemo(() => {
    const g = rounded(avg[0], thickness, avg[1], Math.min(0.006, gap))
    const uv = new Float32Array(pieces.length * 4)
    pieces.forEach((p, i) => uv.set(p.uv, i * 4))
    g.setAttribute('aUv', new InstancedBufferAttribute(uv, 4))
    return g
  }, [pieces, avg, thickness, gap])

  const material = useMemo(() => {
    const m = new MeshStandardMaterial({
      map: texture,
      color: TONE_COLORS[kind][tone],
      roughness: kind === 'tile' ? 0.14 : kind === 'laminate' ? 0.7 : kind === 'stone' ? 0.6 : 0.42,
      envMapIntensity: kind === 'tile' ? 1.2 : 0.5,
    })
    m.onBeforeCompile = uvPatch(swap)
    m.customProgramCacheKey = () => (swap ? 'uv-swap' : 'uv')
    return m
  }, [kind, tone, texture, swap])

  useEffect(() => () => geometry.dispose(), [geometry])
  useEffect(() => () => material.dispose(), [material])

  // Phases: 'drop' (first view), 'flipIn' / 'flipOut' (material change),
  // 'settled', 'hidden'.
  const anim = useRef({ phase: active ? 'drop' : 'hidden', start: null, done: false })

  useEffect(() => {
    const a = anim.current
    if (active) {
      if (a.phase !== 'drop') a.phase = 'flipIn'
    } else if (a.phase !== 'hidden') {
      a.phase = 'flipOut'
    }
    a.start = null
    a.done = false
  }, [active])

  // New dimensions: re-lay the visible floor instantly (no animation while
  // a slider is being dragged); keep hidden layers collapsed.
  useLayoutEffect(() => {
    const mesh = meshRef.current
    const a = anim.current
    pieces.forEach((p, i) => mesh.setColorAt(i, tint.setRGB(p.tint, p.tint * 0.988, p.tint * 0.975)))
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    if (a.phase === 'settled' || a.phase === 'flipIn') {
      a.phase = 'settled'
      a.done = false
    } else if (a.phase === 'hidden') {
      dummy.scale.setScalar(0)
      dummy.updateMatrix()
      pieces.forEach((_, i) => mesh.setMatrixAt(i, dummy.matrix))
      mesh.instanceMatrix.needsUpdate = true
    }
  }, [pieces])

  useFrame(({ clock }) => {
    const mesh = meshRef.current
    const a = anim.current
    if (!mesh || a.done) return
    if (a.phase === 'hidden') {
      mesh.visible = false
      a.done = true
      return
    }
    mesh.visible = true
    if (a.start === null) a.start = clock.elapsedTime
    const elapsed = clock.elapsedTime - a.start
    let finished = true

    for (let i = 0; i < pieces.length; i++) {
      const p = pieces[i]
      let lift = 0, angle = 0, scale = 1
      if (a.phase === 'drop') {
        const t = reduced ? 1 : clamp01((elapsed - p.order * 1.2) / DUR_IN)
        if (t < 1) finished = false
        if (t === 0) scale = 0
        else {
          lift = DROP * (1 - easeOutBack(t))
          scale = 1 - (1 - Math.min(1, t / 0.3)) ** 2
        }
      } else if (a.phase === 'flipIn' || a.phase === 'flipOut') {
        // The old piece turns edge-on, then the new one turns face-up.
        const delay = p.order * FLIP_SPREAD + (a.phase === 'flipIn' ? FLIP : 0)
        const t = reduced ? 1 : clamp01((elapsed - delay) / FLIP)
        if (t < 1) finished = false
        if (a.phase === 'flipIn') {
          if (t === 0) scale = 0
          else angle = -(1 - easeOutCubic(t)) * (Math.PI / 2)
        } else {
          angle = easeInCubic(t) * (Math.PI / 2)
          if (t === 1) scale = 0
        }
        lift = Math.abs(Math.sin(angle)) * (p.sz / 2)
      }
      dummy.position.set(p.x, thickness / 2 + lift, p.z)
      dummy.rotation.set(angle, 0, 0)
      dummy.scale.set((p.sx / avg[0]) * scale, scale, (p.sz / avg[1]) * scale)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true

    if (finished) {
      a.done = true
      if (a.phase === 'flipOut') {
        a.phase = 'hidden'
        mesh.visible = false
      } else {
        a.phase = 'settled'
      }
    }
  })

  return (
    <instancedMesh
      key={pieces.length}
      ref={meshRef}
      args={[geometry, material, pieces.length]}
      castShadow={shadows}
      receiveShadow={shadows}
      frustumCulled={false}
    />
  )
}

function Floor({ design, W, L, shadows, lite, reduced }) {
  const textures = useMemo(() => Object.fromEntries(KINDS.map(k => [k, createFloorTexture(k, lite)])), [lite])
  useEffect(() => () => Object.values(textures).forEach(t => t.dispose()), [textures])

  const sub = useRef(null)
  const target = useMemo(() => new Color(), [])
  useFrame((_, dt) => {
    target.set(SUBFLOOR[design.floor])
    sub.current.color.lerp(target, 1 - Math.exp(-dt * 5))
  })

  const slab = useMemo(() => rounded(W + 0.3, 0.14, L + 0.3, 0.04), [W, L])
  useEffect(() => () => slab.dispose(), [slab])

  return (
    <group>
      <mesh geometry={slab} position={[-0.06, -0.07, -0.06]} receiveShadow={shadows}>
        <meshStandardMaterial color="#2b2520" roughness={0.85} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={0.001} receiveShadow={shadows}>
        <planeGeometry args={[W, L]} />
        <meshStandardMaterial ref={sub} color={SUBFLOOR[design.floor]} roughness={0.9} />
      </mesh>
      {KINDS.map(k => (
        <FloorLayer
          key={k}
          kind={k}
          active={k === design.floor}
          tone={design.tone}
          W={W}
          L={L}
          shadows={shadows}
          texture={textures[k]}
          reduced={reduced}
        />
      ))}
    </group>
  )
}

// ---------------------------------------------------------------------------
// Walls and fixtures
// ---------------------------------------------------------------------------

function Walls({ W, L, shadows, crown }) {
  const t = 0.12
  const back = useMemo(() => rounded(W + t, WALL_H, t, 0.02), [W])
  const left = useMemo(() => rounded(t, WALL_H, L, 0.02), [L])
  useEffect(() => () => { back.dispose(); left.dispose() }, [back, left])
  return (
    <group>
      <mesh geometry={back} position={[-t / 2, WALL_H / 2, -L / 2 - t / 2]} receiveShadow={shadows} castShadow={shadows}>
        <meshStandardMaterial color={WALL} roughness={0.9} />
      </mesh>
      <mesh geometry={left} position={[-W / 2 - t / 2, WALL_H / 2, 0]} receiveShadow={shadows} castShadow={shadows}>
        <meshStandardMaterial color={WALL} roughness={0.9} />
      </mesh>
      {/* Baseboards */}
      <mesh position={[0, FLOOR_TOP + 0.05, -L / 2 + 0.008]}>
        <boxGeometry args={[W, 0.1, 0.016]} />
        <meshStandardMaterial color="#f6f2ec" roughness={0.6} />
      </mesh>
      <mesh position={[-W / 2 + 0.008, FLOOR_TOP + 0.05, 0]}>
        <boxGeometry args={[0.016, 0.1, L]} />
        <meshStandardMaterial color="#f6f2ec" roughness={0.6} />
      </mesh>
      {crown && <CrownMolding W={W} L={L} />}
    </group>
  )
}

// Two stepped, rounded profiles along the top of each visible wall.
function CrownMolding({ W, L }) {
  const pieces = useMemo(() => [
    rounded(W, 0.11, 0.05, 0.015), rounded(W, 0.04, 0.095, 0.015),
    rounded(0.05, 0.11, L, 0.015), rounded(0.095, 0.04, L, 0.015),
  ], [W, L])
  useEffect(() => () => pieces.forEach(g => g.dispose()), [pieces])
  const pos = [
    [0, WALL_H - 0.055, -L / 2 + 0.025], [0, WALL_H - 0.02, -L / 2 + 0.0475],
    [-W / 2 + 0.025, WALL_H - 0.055, 0], [-W / 2 + 0.0475, WALL_H - 0.02, 0],
  ]
  return pieces.map((g, i) => (
    <mesh key={i} geometry={g} position={pos[i]}>
      <meshStandardMaterial color="#f6f2ec" roughness={0.55} />
    </mesh>
  ))
}

const UNIT_CYL = new CylinderGeometry(1, 1, 1, 40)
const UNIT_SPHERE = new SphereGeometry(1, 32, 20)

function Part({ part, index, textures, shadows, reduced }) {
  const ref = useRef(null)
  const { geo, size, radius = 0.02 } = part
  const sizeKey = size.join(',')

  const geometry = useMemo(() => {
    if (geo === 'cyl') return UNIT_CYL
    if (geo === 'sphere') return UNIT_SPHERE
    const [x, y, z] = sizeKey.split(',').map(Number)
    return radius > 0 ? rounded(x, y, z, radius) : new BoxGeometry(x, y, z)
  }, [geo, sizeKey, radius])
  useEffect(() => () => { if (geometry !== UNIT_CYL && geometry !== UNIT_SPHERE) geometry.dispose() }, [geometry])

  const repeatKey = part.mapRepeat?.join(',')
  const map = useMemo(() => {
    if (!part.map) return null
    const t = textures[part.map].clone()
    const [rx, ry] = repeatKey.split(',').map(Number)
    t.repeat.set(rx, ry)
    t.needsUpdate = true
    return t
  }, [part.map, textures, repeatKey])
  useEffect(() => () => map?.dispose(), [map])

  const scale = geo === 'box' ? [1, 1, 1] : size
  const anim = useRef({ start: null, done: reduced })

  // Each piece pops into place, staggered, when it first appears.
  useFrame(({ clock }) => {
    const a = anim.current
    if (a.done || !ref.current) return
    if (a.start === null) a.start = clock.elapsedTime + index * 0.025
    const t = clamp01((clock.elapsedTime - a.start) / 0.45)
    const e = Math.max(0.001, easeOutBack(t, 1.4))
    ref.current.scale.set(scale[0] * e, scale[1] * e, scale[2] * e)
    ref.current.position.set(part.pos[0], part.pos[1] + (1 - easeOutCubic(t)) * 0.35, part.pos[2])
    if (t >= 1) a.done = true
  })

  const opacity = part.opacity ?? 1
  const mesh = (
    <mesh
      ref={ref}
      geometry={geometry}
      position={part.pos}
      rotation={part.rot || [0, 0, 0]}
      scale={scale}
      castShadow={shadows && part.cast !== false && opacity === 1}
      receiveShadow={shadows && opacity === 1}
    >
      <meshStandardMaterial
        color={part.color}
        map={map}
        roughness={part.rough ?? 0.8}
        metalness={part.metal ?? 0}
        emissive={part.glow ? part.color : '#000000'}
        emissiveIntensity={part.glow ?? 0}
        transparent={opacity < 1}
        opacity={opacity}
        depthWrite={opacity === 1}
        envMapIntensity={opacity < 1 ? 2 : 1}
      />
    </mesh>
  )
  return part.group
    ? <group position={part.group.pos} rotation-y={part.group.rotY}>{mesh}</group>
    : mesh
}

function Fixtures({ design, shadows, reduced }) {
  const parts = useMemo(() => buildFixtures(design), [design])
  const textures = useMemo(() => createSurfaceTextures(), [])
  useEffect(() => () => Object.values(textures).forEach(t => t.dispose()), [textures])
  return (
    <group>
      {parts.map((p, i) => (
        <Part key={`${design.type}-${i}-${p.geo}-${p.map ?? ''}-${p.opacity ?? 1}`} part={p} index={i} textures={textures} shadows={shadows} reduced={reduced} />
      ))}
    </group>
  )
}

// ---------------------------------------------------------------------------
// Environment, camera
// ---------------------------------------------------------------------------

function StudioEnvironment() {
  const get = useThree(s => s.get)
  useEffect(() => {
    const { gl, scene } = get()
    const pmrem = new PMREMGenerator(gl)
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = env
    scene.environmentIntensity = 0.4
    return () => { scene.environment = null; env.dispose(); pmrem.dispose() }
  }, [get])
  return null
}

const TARGET = [0, 0.8, 0]
const fitDistance = (W, L) => Math.max(W, L) * 1.45 + 3.8

// When the room is resized, ease the camera in or out to keep it framed,
// then hand control back to the orbit controls.
function CameraFit({ W, L }) {
  const controls = useThree(s => s.controls)
  const goal = useRef(null)
  const dir = useMemo(() => new Vector3(), [])
  const center = useMemo(() => new Vector3(...TARGET), [])
  const dist = fitDistance(W, L)

  useEffect(() => { goal.current = dist }, [dist])

  useFrame(({ camera }, dt) => {
    if (goal.current === null || !controls) return
    dir.copy(camera.position).sub(center)
    const d = dir.length()
    const next = MathUtils.damp(d, goal.current, 6, dt)
    camera.position.copy(center).addScaledVector(dir.normalize(), next)
    controls.update()
    if (Math.abs(next - goal.current) < 0.01) goal.current = null
  })
  return null
}

export default function DesignerScene({ design, lite, reduced, paused }) {
  const W = design.width * FT
  const L = design.length * FT
  const shadows = !lite
  const [d0] = useState(() => fitDistance(W, L))
  const start = [
    TARGET[0] + d0 * Math.sin(1.02) * Math.sin(0.72),
    TARGET[1] + d0 * Math.cos(1.02),
    TARGET[2] + d0 * Math.sin(1.02) * Math.cos(0.72),
  ]
  const span = Math.max(W, L)

  return (
    <Canvas
      dpr={Math.min(window.devicePixelRatio || 1, 2)}
      shadows={shadows}
      frameloop={paused ? 'never' : 'always'}
      gl={{
        antialias: true,
        alpha: true,
        toneMapping: ACESFilmicToneMapping,
        toneMappingExposure: 1.0,
        outputColorSpace: SRGBColorSpace,
      }}
      camera={{ fov: 35, near: 0.1, far: 120, position: start }}
    >
      <hemisphereLight args={['#fff6ec', '#4a3d33', 0.85]} />
      <directionalLight
        position={[span * 0.6 + 2, 7, span * 0.7 + 3]}
        intensity={2.2}
        color="#fff0dc"
        castShadow={shadows}
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0003}
        shadow-normalBias={0.02}
        shadow-camera-left={-span}
        shadow-camera-right={span}
        shadow-camera-top={span}
        shadow-camera-bottom={-span}
        shadow-camera-near={0.5}
        shadow-camera-far={40}
      />
      <directionalLight position={[-4, 5, -6]} intensity={0.6} color="#c6d4ff" />
      <StudioEnvironment />

      <Floor design={design} W={W} L={L} shadows={shadows} lite={lite} reduced={reduced} />
      {design.type !== 'patio' && <Walls W={W} L={L} shadows={shadows} crown={design.trim === 'crown'} />}
      <Fixtures design={design} shadows={shadows} reduced={reduced} />

      <OrbitControls
        makeDefault
        target={TARGET}
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minPolarAngle={0.3}
        maxPolarAngle={1.32}
        minAzimuthAngle={-0.2}
        maxAzimuthAngle={1.75}
        minDistance={fitDistance(W, L) * 0.45}
        maxDistance={fitDistance(W, L) * 1.6}
      />
      <CameraFit W={W} L={L} />
    </Canvas>
  )
}
