// "The Floor Comes Together" — the 3D hero scene. Loaded lazily by Hero.jsx
// after first paint, so none of three.js is in the main bundle.

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import {
  AdditiveBlending,
  BoxGeometry,
  Color,
  InstancedBufferAttribute,
  MathUtils,
  MeshStandardMaterial,
  NeutralToneMapping,
  Object3D,
  PlaneGeometry,
  PMREMGenerator,
  Vector3,
} from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { createFloorTextures, createWindowLightTexture } from './floorTextures'
import { buildLayout, MATERIALS } from './floorLayouts'

const KINDS = Object.keys(MATERIALS)
const FLOOR = { full: { width: 17, depth: 10 }, lite: { width: 8, depth: 7 } }
const BACKGROUND = '#14110f'

const DROP = 1.6
const DUR_IN = 0.75
const DUR_OUT = 0.42

const clamp01 = (t) => Math.min(1, Math.max(0, t))
const easeOutBack = (t, s = 1.1) => 1 + (s + 1) * (t - 1) ** 3 + s * (t - 1) ** 2
const easeOutCubic = (t) => 1 - (1 - t) ** 3

const SURFACE = {
  hardwood: { roughness: 0.42, envMapIntensity: 0.6 },
  tile: { roughness: 0.1, envMapIntensity: 1.4 },
  laminate: { roughness: 0.82, envMapIntensity: 0.25 },
}

// Gives every instance its own window into the shared texture.
function patchInstanceUv(shader) {
  shader.vertexShader = 'attribute vec4 aUv;\n' + shader.vertexShader.replace(
    '#include <uv_vertex>',
    '#include <uv_vertex>\n#ifdef USE_MAP\n\tvMapUv = vMapUv * aUv.zw + aUv.xy;\n#endif',
  )
}

const dummy = new Object3D()
const tint = new Color()

function FloorPieces({ kind, active, lite, reduced, texture }) {
  const meshRef = useRef(null)
  const { thickness } = MATERIALS[kind]
  const size = lite ? FLOOR.lite : FLOOR.full
  const pieces = useMemo(() => buildLayout(kind, { ...size, lite }), [kind, size, lite])

  const geometry = useMemo(() => {
    const g = new BoxGeometry(1, 1, 1)
    const uv = new Float32Array(pieces.length * 4)
    pieces.forEach((p, i) => uv.set(p.uv, i * 4))
    g.setAttribute('aUv', new InstancedBufferAttribute(uv, 4))
    return g
  }, [pieces])

  const material = useMemo(() => {
    const m = new MeshStandardMaterial({ map: texture, metalness: 0, ...SURFACE[kind] })
    m.onBeforeCompile = patchInstanceUv
    return m
  }, [kind, texture])

  useEffect(() => () => { geometry.dispose(); material.dispose() }, [geometry, material])

  // Phase machine: 'in' drops pieces into place, 'out' lifts and shrinks them away.
  const anim = useRef({ phase: active ? 'in' : 'hidden', start: null, done: false, first: active })

  useEffect(() => {
    const a = anim.current
    if (active) {
      a.phase = 'in'
    } else {
      a.first = false
      if (a.phase !== 'hidden') a.phase = 'out'
    }
    a.start = null
    a.done = false
  }, [active])

  // Start every instance collapsed so nothing flashes at the origin.
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
    if (a.phase === 'hidden') {
      mesh.visible = false
      a.done = true
      return
    }
    mesh.visible = true
    const now = clock.elapsedTime
    if (a.start === null) a.start = now
    const elapsed = now - a.start
    const inSpread = a.first ? 2.1 : 1.25
    const lead = a.first ? 0.25 : 0.22
    let finished = true

    for (let i = 0; i < pieces.length; i++) {
      const p = pieces[i]
      let lift = 0, tilt = 0, scale
      if (a.phase === 'in') {
        const t = reduced ? 1 : clamp01((elapsed - lead - p.order * inSpread) / DUR_IN)
        if (t < 1) finished = false
        if (t === 0) {
          scale = 0
        } else {
          lift = DROP * (1 - easeOutBack(t))
          scale = 1 - (1 - Math.min(1, t / 0.3)) ** 2
          tilt = p.tilt * (1 - easeOutCubic(t))
        }
      } else {
        const t = reduced ? 1 : clamp01((elapsed - p.order * 0.8) / DUR_OUT)
        if (t < 1) finished = false
        const e = t * t
        lift = 0.18 * e
        scale = 1 - e
      }
      dummy.position.set(p.x, thickness / 2 + lift, p.z)
      dummy.rotation.set(tilt, 0, tilt * 0.35)
      dummy.scale.set(p.sx * scale, thickness * scale, p.sz * scale)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true

    if (finished) {
      a.done = true
      a.first = false
      if (a.phase === 'out') {
        a.phase = 'hidden'
        mesh.visible = false
      }
    }
  })

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, pieces.length]}
      castShadow={!lite}
      receiveShadow={!lite}
      frustumCulled={false}
    />
  )
}

// The surface under the pieces: dark subfloor for wood, grout for tile.
function Subfloor({ kind, lite }) {
  const ref = useRef(null)
  const target = useMemo(() => new Color(), [])
  const { width, depth } = lite ? FLOOR.lite : FLOOR.full
  useFrame((_, dt) => {
    target.set(MATERIALS[kind].subfloor)
    ref.current.color.lerp(target, 1 - Math.exp(-dt * 4))
  })
  return (
    <mesh rotation-x={-Math.PI / 2} position-y={0.002} receiveShadow={!lite}>
      <planeGeometry args={[width + 0.06, depth + 0.06]} />
      <meshStandardMaterial ref={ref} color={MATERIALS.hardwood.subfloor} roughness={0.9} />
    </mesh>
  )
}

// A faint, sheared patch of sunlight from an off-screen window.
function WindowLight({ kind, lite, reduced }) {
  const ref = useRef(null)
  const changed = useRef({ at: null, kind })
  const texture = useMemo(() => createWindowLightTexture(), [])
  const geometry = useMemo(() => {
    const g = new PlaneGeometry(2.4, 3.4)
    const pos = g.attributes.position
    for (let i = 0; i < pos.count; i++) pos.setX(i, pos.getX(i) + pos.getY(i) * 0.55)
    return g
  }, [])
  useEffect(() => () => { texture.dispose(); geometry.dispose() }, [texture, geometry])

  useFrame(({ clock }, dt) => {
    const c = changed.current
    if (c.kind !== kind || c.at === null) { c.kind = kind; c.at = clock.elapsedTime }
    const since = clock.elapsedTime - c.at
    const visible = reduced ? 1 : MathUtils.smoothstep(since, c.at < 0.5 ? 2.0 : 0.9, c.at < 0.5 ? 3.2 : 1.9)
    const mat = ref.current.material
    mat.opacity = (kind === 'tile' ? 0.16 : kind === 'laminate' ? 0.2 : 0.26) * visible
    const y = MATERIALS[kind].thickness + 0.003
    ref.current.position.y = MathUtils.damp(ref.current.position.y, y, 6, dt)
  })

  return (
    <mesh ref={ref} geometry={geometry} rotation={[-Math.PI / 2, 0, 0.5]} position={lite ? [-0.6, 0.083, 0.4] : [-1.6, 0.083, 0.4]} scale={lite ? 1 : 1.35}>
      <meshBasicMaterial
        map={texture}
        color="#ffb46e"
        transparent
        opacity={0}
        blending={AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  )
}

// Procedural studio reflections (no HDR download) so tile can actually gleam.
function StudioEnvironment() {
  const get = useThree(s => s.get)
  useEffect(() => {
    const { gl, scene } = get()
    const pmrem = new PMREMGenerator(gl)
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = env
    scene.environmentIntensity = 0.35
    return () => { scene.environment = null; env.dispose(); pmrem.dispose() }
  }, [get])
  return null
}

// Mouse parallax (a few degrees) plus a pull-up-and-away as the hero scrolls out.
function CameraRig({ lite, reduced }) {
  const pointer = useRef({ x: 0, y: 0 })
  const look = useMemo(() => new Vector3(), [])
  const base = lite
    ? { target: [0, 0, 1.8], radius: 9.5, polar: 0.8, azimuth: 0.18 }
    : { target: [-2.2, 0, 1.2], radius: 9.6, polar: 0.95, azimuth: 0.32 }
  const live = useRef({ radius: base.radius, polar: base.polar, azimuth: base.azimuth })

  useEffect(() => {
    if (reduced || lite) return
    const onMove = (e) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [reduced, lite])

  useFrame(({ camera }, dt) => {
    const scroll = reduced ? 0 : clamp01(window.scrollY / window.innerHeight)
    const l = live.current
    const goal = {
      radius: base.radius * (1 + scroll * 0.45),
      polar: base.polar - scroll * 0.38 + pointer.current.y * 0.03,
      azimuth: base.azimuth + pointer.current.x * 0.05,
    }
    for (const k in goal) l[k] = MathUtils.damp(l[k], goal[k], 3.5, dt)

    look.set(...base.target)
    camera.position.set(
      look.x + l.radius * Math.sin(l.polar) * Math.sin(l.azimuth),
      look.y + l.radius * Math.cos(l.polar),
      look.z + l.radius * Math.sin(l.polar) * Math.cos(l.azimuth),
    )
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

export default function HeroScene({ kind, paused, lite, reduced, onReady }) {
  const [dpr, setDpr] = useState(lite ? 1.5 : Math.min(2, window.devicePixelRatio || 1))
  const textures = useMemo(() => createFloorTextures(lite), [lite])
  useEffect(() => () => Object.values(textures).forEach(t => t.dispose()), [textures])

  return (
    <Canvas
      dpr={[1, dpr]}
      shadows={!lite}
      frameloop={paused ? 'never' : 'always'}
      gl={{ antialias: !lite, powerPreference: 'high-performance', toneMapping: NeutralToneMapping, toneMappingExposure: 1.1 }}
      camera={{ fov: lite ? 38 : 32, near: 0.5, far: 60, position: [0, 7, 9] }}
    >
      <PerformanceMonitor onDecline={() => setDpr(1)} />
      <color attach="background" args={[BACKGROUND]} />
      <fog attach="fog" args={[BACKGROUND, lite ? 8 : 8.5, lite ? 17 : 19]} />

      <ambientLight intensity={0.45} color="#ffe6cc" />
      <directionalLight
        position={[-5, 8, -2.5]}
        intensity={2.4}
        color="#ffd6a3"
        castShadow={!lite}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-camera-left={-11}
        shadow-camera-right={11}
        shadow-camera-top={11}
        shadow-camera-bottom={-11}
        shadow-camera-near={1}
        shadow-camera-far={25}
      />
      <directionalLight position={[6, 4, 8]} intensity={0.35} color="#b9c6ff" />
      <StudioEnvironment />
      <CameraRig lite={lite} reduced={reduced} />

      <group rotation-y={lite ? -0.15 : -0.32} position-x={lite ? 0 : 2.4}>
        {/* Surrounding room floor that fades into the fog */}
        <mesh rotation-x={-Math.PI / 2} receiveShadow={!lite}>
          <planeGeometry args={[60, 60]} />
          <meshStandardMaterial color="#1b1612" roughness={1} />
        </mesh>
        {/* Baked contact shadow on mobile, where real-time shadows are off */}
        {lite && (
          <mesh rotation-x={-Math.PI / 2} position-y={0.001}>
            <planeGeometry args={[FLOOR.lite.width + 0.6, FLOOR.lite.depth + 0.6]} />
            <meshBasicMaterial color="#000" transparent opacity={0.35} depthWrite={false} />
          </mesh>
        )}
        <Subfloor kind={kind} lite={lite} />
        {KINDS.map(k => (
          <FloorPieces key={k} kind={k} active={k === kind} lite={lite} reduced={reduced} texture={textures[k]} />
        ))}
        <WindowLight kind={kind} lite={lite} reduced={reduced} />
      </group>

      <ReadySignal onReady={onReady} />
    </Canvas>
  )
}
