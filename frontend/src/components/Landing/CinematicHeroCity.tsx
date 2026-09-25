import React, { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface CinematicHeroCityProps {
  replayKey: number
  onTimelineProgress: (elapsed: number) => void
}

// ── Cinematic Camera Rig (Exact 0.0 – 8.0s Flight Sequence) ─────────────────
function CinematicCameraRig({
  replayKey,
  onTimelineProgress,
}: {
  replayKey: number
  onTimelineProgress: (elapsed: number) => void
}) {
  const startTimeRef = useRef<number | null>(null)
  const lookTargetRef = useRef(new THREE.Vector3(0, 10, 0))

  useEffect(() => {
    startTimeRef.current = null
  }, [replayKey])

  useFrame(({ camera, clock }) => {
    if (startTimeRef.current === null) {
      startTimeRef.current = clock.getElapsedTime()
    }
    const elapsed = clock.getElapsedTime() - startTimeRef.current
    onTimelineProgress(elapsed)

    // 0.0 - 0.6s: Drone low-altitude approach
    // 0.6 - 1.8s: Sweep diagonally across the CBD
    // 1.8 - 3.0s: Pull up and orbit
    // 3.0 - 4.2s: Continue rising to hero altitude
    // 4.2 - 5.2s: Settle to hero position with light sweep
    // 5.2 - 6.5s: Stable framing, title reveals
    // 6.5s+: Ambient drift
    let camPos = new THREE.Vector3(80, 15, 100)
    let lookPos = new THREE.Vector3(0, 15, 0)

    if (elapsed < 0.6) {
      const p = elapsed / 0.6
      camPos.set(80 - p * 20, 15, 100 - p * 20)
      lookPos.set(0, 15, 0)
    } else if (elapsed < 1.8) {
      const p = (elapsed - 0.6) / 1.2
      const smoothP = p * p * (3 - 2 * p)
      camPos.set(
        THREE.MathUtils.lerp(60, 20, smoothP),
        THREE.MathUtils.lerp(15, 25, smoothP),
        THREE.MathUtils.lerp(80, 40, smoothP)
      )
      lookPos.set(
        THREE.MathUtils.lerp(0, -10, smoothP),
        15,
        THREE.MathUtils.lerp(0, -20, smoothP)
      )
    } else if (elapsed < 3.0) {
      const p = (elapsed - 1.8) / 1.2
      const smoothP = p * p * (3 - 2 * p)
      camPos.set(
        THREE.MathUtils.lerp(20, -30, smoothP),
        THREE.MathUtils.lerp(25, 50, smoothP),
        THREE.MathUtils.lerp(40, 50, smoothP)
      )
      lookPos.set(
        THREE.MathUtils.lerp(-10, 0, smoothP),
        15,
        THREE.MathUtils.lerp(-20, 0, smoothP)
      )
    } else if (elapsed < 4.2) {
      const p = (elapsed - 3.0) / 1.2
      const smoothP = p * p * (3 - 2 * p)
      camPos.set(
        THREE.MathUtils.lerp(-30, 0, smoothP),
        THREE.MathUtils.lerp(50, 65, smoothP),
        THREE.MathUtils.lerp(50, 90, smoothP)
      )
      lookPos.set(0, 15, THREE.MathUtils.lerp(0, -12, smoothP))
    } else if (elapsed < 5.2) {
      const p = (elapsed - 4.2) / 1.0
      const smoothP = p * p * (3 - 2 * p)
      camPos.set(
        0,
        THREE.MathUtils.lerp(65, 18, smoothP),
        THREE.MathUtils.lerp(90, 42, smoothP)
      )
      lookPos.set(0, 15, -12)
    } else {
      // 5.2s onwards: stable majestic hero shot with subtle cinematic drift
      const driftT = elapsed - 5.2
      const driftX = Math.sin(driftT * 0.15) * 4
      const driftY = 18 + Math.cos(driftT * 0.12) * 1.5
      const driftZ = 42 + Math.sin(driftT * 0.1) * 3
      camPos.set(driftX, driftY, driftZ)
      lookPos.set(0, 15, -12)
    }

    camera.position.lerp(camPos, 0.08)
    lookTargetRef.current.lerp(lookPos, 0.08)
    camera.lookAt(lookTargetRef.current)
  })

  return null
}

// ── Light Sweep Animation across Central Skyline (at 4.2 – 5.2s) ────────────
function SkylineLightSweep({ elapsed }: { elapsed: number }) {
  const sweepLightRef = useRef<THREE.SpotLight>(null)

  useFrame(() => {
    if (!sweepLightRef.current) return
    if (elapsed >= 4.0 && elapsed <= 6.2) {
      const p = (elapsed - 4.0) / 2.2
      sweepLightRef.current.position.x = -60 + p * 120
      sweepLightRef.current.intensity = Math.sin(p * Math.PI) * 4.5
    } else {
      sweepLightRef.current.intensity = 0
    }
  })

  return (
    <spotLight
      ref={sweepLightRef}
      position={[-60, 45, 10]}
      target-position={[0, 15, -10]}
      color="#07CCF4"
      angle={0.6}
      penumbra={0.8}
      intensity={0}
      distance={140}
    />
  )
}

// ── Dynamic Moving Traffic (Headlights & Taillights) ─────────────────────────
function MovingTrafficStream({ elapsed }: { elapsed: number }) {
  const carsCount = 300
  const instancedRef = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const cars = useMemo(() => {
    const list = []
    for (let i = 0; i < carsCount; i++) {
      const isNorthSouth = i % 2 === 0
      const isExpress = i % 5 === 0
      const lane = (i % 6) * 3 - 7.5
      const speed = isExpress ? 28 + (i % 4) * 4 : 14 + (i % 5) * 3
      const color = isExpress ? '#07CCF4' : (i % 3 === 0 ? '#FBBF24' : (i % 3 === 1 ? '#FFFFFF' : '#3B82F6'))
      list.push({
        isNorthSouth,
        lane,
        speed,
        offset: (i / carsCount) * 360 - 180,
        color: new THREE.Color(color),
      })
    }
    return list
  }, [carsCount])

  useFrame(() => {
    if (!instancedRef.current) return
    const activeFactor = Math.min(1, Math.max(0, (elapsed - 0.8) / 1.5))
    if (activeFactor <= 0) {
      instancedRef.current.visible = false
      return
    }
    instancedRef.current.visible = true

    cars.forEach((car, idx) => {
      let x = 0
      let z = 0
      let rotY = 0

      if (car.isNorthSouth) {
        x = car.lane
        z = ((car.offset + elapsed * car.speed) % 360) - 180
        rotY = 0
      } else {
        x = ((car.offset + elapsed * car.speed) % 360) - 180
        z = car.lane - 25
        rotY = Math.PI / 2
      }

      dummy.position.set(x, 0.4, z)
      dummy.rotation.set(0, rotY, 0)
      dummy.scale.set(1.4 * activeFactor, 0.6 * activeFactor, 3.2 * activeFactor)
      dummy.updateMatrix()
      instancedRef.current!.setMatrixAt(idx, dummy.matrix)
    })
    instancedRef.current.instanceMatrix.needsUpdate = true
  })

  const geom = useMemo(() => new THREE.BoxGeometry(1, 1, 1), [])
  const mat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#07CCF4',
      }),
    []
  )

  return <instancedMesh ref={instancedRef} args={[geom, mat, carsCount]} />
}

// ── Moving Elevated Metro Train ─────────────────────────────────────────────
function MovingMetroTrain({ elapsed }: { elapsed: number }) {
  const trainRef = useRef<THREE.Group>(null)

  useFrame(() => {
    if (!trainRef.current) return
    const speed = 26
    const posZ = ((elapsed * speed) % 320) - 160
    trainRef.current.position.set(-18, 5.2, posZ)
  })

  return (
    <group ref={trainRef}>
      {/* 3 Passenger carriages */}
      {[0, 1, 2].map((carIdx) => (
        <mesh key={carIdx} position={[0, 0, carIdx * 9 - 9]}>
          <boxGeometry args={[2.4, 2.2, 8]} />
          <meshStandardMaterial
            color="#0A1628"
            emissive="#07CCF4"
            emissiveIntensity={0.65}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
      ))}
      {/* Headlight beam */}
      <pointLight position={[0, 0.5, 6]} color="#63ECFE" intensity={3.5} distance={25} />
    </group>
  )
}

// ── Atmospheric Cyan Data Particles (Digital Twin Nodes) ─────────────────────
function AmbientCityParticles({ elapsed }: { elapsed: number }) {
  const count = 300
  const pointsRef = useRef<THREE.Points>(null)

  const [positions] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 220
      pos[i * 3 + 1] = 4 + Math.random() * 55
      pos[i * 3 + 2] = (Math.random() - 0.5) * 220
    }
    return [pos]
  }, [count])

  useFrame(({ clock }) => {
    if (!pointsRef.current) return
    const t = clock.getElapsedTime()
    pointsRef.current.rotation.y = t * 0.03
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={1.6}
        color="#07CCF4"
        transparent
        opacity={Math.min(0.75, elapsed * 0.25)}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

// ── Varied Architectural City Grid ──────────────────────────────────────────
function CityArchitecturalLandscape({ elapsed }: { elapsed: number }) {
  // Diverse building layouts: central skyscrapers, mid-rises, civic, airport
  const buildings = useMemo(() => {
    const list = []
    const seedRandom = (s: number) => {
      const x = Math.sin(s++) * 10000
      return x - Math.floor(x)
    }

    let seed = 42
    // Central CBD Skyscrapers (7x7 grid, 49 buildings)
    for (let row = -3; row <= 3; row++) {
      for (let col = -3; col <= 3; col++) {
        const height = 40 + seedRandom(seed++) * 50 // 40-90m
        list.push({
          x: col * 14 + (seedRandom(seed++) - 0.5) * 3, // tight 14m spacing
          z: row * 14 - 15 + (seedRandom(seed++) - 0.5) * 3,
          width: 8 + seedRandom(seed++) * 4,
          depth: 8 + seedRandom(seed++) * 4,
          height,
          isSkyscraper: true,
          hasSpire: seedRandom(seed++) > 0.4,
          glowColor: '#07CCF4',
        })
      }
    }

    // Mid-ring (24 buildings in a wider ring)
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2
      const radius = 50 + seedRandom(seed++) * 15
      const height = 18 + seedRandom(seed++) * 27 // 18-45m
      list.push({
        x: Math.cos(angle) * radius,
        z: Math.sin(angle) * radius - 15,
        width: 10 + seedRandom(seed++) * 5,
        depth: 10 + seedRandom(seed++) * 5,
        height,
        isSkyscraper: false,
        hasSpire: false,
        glowColor: seedRandom(seed++) > 0.5 ? '#00ACE7' : '#005AA6',
      })
    }

    // Outer residential (40 buildings in outer ring)
    for (let i = 0; i < 40; i++) {
      const angle = (i / 40) * Math.PI * 2
      const radius = 80 + seedRandom(seed++) * 30
      const height = 6 + seedRandom(seed++) * 14 // 6-20m
      list.push({
        x: Math.cos(angle) * radius,
        z: Math.sin(angle) * radius - 15,
        width: 12 + seedRandom(seed++) * 6,
        depth: 12 + seedRandom(seed++) * 6,
        height,
        isSkyscraper: false,
        hasSpire: false,
        glowColor: '#005AA6',
      })
    }

    // Industrial sector (15 buildings, one corner)
    for (let i = 0; i < 15; i++) {
      list.push({
        x: -90 + seedRandom(seed++) * 40,
        z: -90 + seedRandom(seed++) * 40,
        width: 15 + seedRandom(seed++) * 10,
        depth: 15 + seedRandom(seed++) * 10,
        height: 8 + seedRandom(seed++) * 8, // 8-16m
        isSkyscraper: false,
        hasSpire: false,
        glowColor: '#1E293B',
      })
    }

    // Waterfront (12 buildings along one edge)
    for (let i = 0; i < 12; i++) {
      list.push({
        x: -60 + seedRandom(seed++) * 120,
        z: 40 + seedRandom(seed++) * 20,
        width: 10 + seedRandom(seed++) * 6,
        depth: 10 + seedRandom(seed++) * 6,
        height: 20 + seedRandom(seed++) * 30, // 20-50m
        isSkyscraper: true,
        hasSpire: false,
        glowColor: '#00ACE7',
      })
    }

    return list
  }, [])

  // Emergence animation factor (0.0 to 1.8s)
  const emergence = Math.min(1, Math.max(0, (elapsed - 0.4) / 1.6))

  return (
    <group>
      {buildings.map((b, idx) => {
        const curHeight = b.height * emergence
        if (curHeight <= 0.1) return null
        const bandCount = Math.floor(curHeight / 3)

        return (
          <group key={idx} position={[b.x, curHeight / 2, b.z]}>
            {/* Main Building Massing */}
            <mesh>
              <boxGeometry args={[b.width, curHeight, b.depth]} />
              <meshStandardMaterial
                color="#060C1B"
                roughness={0.15}
                metalness={0.85}
                emissive={b.glowColor}
                emissiveIntensity={b.isSkyscraper ? 0.35 : 0.18}
              />
            </mesh>

            {/* Glowing Window Band Strata */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[b.width * 1.01, curHeight * 0.9, b.depth * 1.01]} />
              <meshStandardMaterial
                color="#020817"
                emissive={b.glowColor}
                emissiveIntensity={0.5}
                wireframe
                transparent
                opacity={0.35}
              />
            </mesh>

            {/* Added horizontal window bands for buildings > 15m */}
            {b.height > 15 && bandCount > 0 && Array.from({ length: bandCount }).map((_, i) => (
              <mesh key={`band_${i}`} position={[0, -curHeight / 2 + i * 3 + 1.5, 0]}>
                <boxGeometry args={[b.width * 1.02, 0.2, b.depth * 1.02]} />
                <meshBasicMaterial color={b.glowColor} transparent opacity={0.6} />
              </mesh>
            ))}

            {/* Base glow for buildings > 25m */}
            {b.height > 25 && (
              <mesh position={[0, -curHeight / 2 + 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[b.width * 1.5, b.depth * 1.5]} />
                <meshBasicMaterial color={b.glowColor} transparent opacity={0.3} />
              </mesh>
            )}

            {/* Roof Top Crown / Architectural Spire */}
            {b.hasSpire && curHeight > 30 && (
              <mesh position={[0, curHeight / 2 + 5, 0]}>
                <coneGeometry args={[1.2, 10, 8]} />
                <meshBasicMaterial color="#63ECFE" />
              </mesh>
            )}
          </group>
        )
      })}

      {/* Airport Sector (Runway Lights & Terminal) */}
      <group position={[70, 0.1, -40]}>
        {/* Runway Strip */}
        <mesh rotation={[-Math.PI / 2, 0, -0.4]}>
          <planeGeometry args={[18, 120]} />
          <meshStandardMaterial color="#0A0E1A" roughness={0.9} />
        </mesh>
        {/* Runway Centerline Lights */}
        {Array.from({ length: 12 }).map((_, i) => (
          <mesh
            key={i}
            position={[
              Math.sin(-0.4) * (i * 9 - 50),
              0.2,
              Math.cos(-0.4) * (i * 9 - 50),
            ]}
          >
            <sphereGeometry args={[0.4, 8, 8]} />
            <meshBasicMaterial color={i % 3 === 0 ? '#34D399' : '#07CCF4'} />
          </mesh>
        ))}
        {/* Airport Control Tower */}
        <mesh position={[-16, 12, 0]}>
          <cylinderGeometry args={[2, 2.8, 24, 12]} />
          <meshStandardMaterial color="#0E172A" emissive="#005AA6" emissiveIntensity={0.4} />
        </mesh>
        <mesh position={[-16, 25, 0]}>
          <cylinderGeometry args={[4.5, 3.5, 4, 12]} />
          <meshStandardMaterial color="#1E293B" emissive="#07CCF4" emissiveIntensity={0.8} />
        </mesh>
      </group>
    </group>
  )
}

// ── Glowing Transportation Network (Roads & Bridges) ─────────────────────────
function RoadAndTransitGrid({ elapsed }: { elapsed: number }) {
  const glowAlpha = Math.min(0.8, Math.max(0, (elapsed - 0.6) / 1.4))

  return (
    <group position={[0, 0.05, 0]}>
      {/* Ground Water Plate (Reflective Bay) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, -60]}>
        <planeGeometry args={[400, 160]} />
        <meshStandardMaterial
          color="#030712"
          roughness={0.08}
          metalness={0.95}
        />
      </mesh>

      {/* Main Ground Asphalt */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 20]}>
        <planeGeometry args={[400, 240]} />
        <meshStandardMaterial color="#060815" roughness={0.8} />
      </mesh>

      {/* Primary Glowing Arterial Avenues */}
      {[-50, -30, -10, 10, 30, 50].map((xPos) => (
        <mesh key={`n_s_${xPos}`} rotation={[-Math.PI / 2, 0, 0]} position={[xPos, 0.08, 0]}>
          <planeGeometry args={[10, 320]} />
          <meshBasicMaterial
            color="#005AA6"
            transparent
            opacity={glowAlpha * 0.6}
          />
        </mesh>
      ))}

      {/* Luminous Center Highway Ribbon */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
        <planeGeometry args={[1.5, 320]} />
        <meshBasicMaterial
          color="#07CCF4"
          transparent
          opacity={glowAlpha}
        />
      </mesh>

      {/* East-West Cross Expressways */}
      {[-50, -30, -10, 10, 30, 50].map((zPos) => (
        <mesh key={`e_w_${zPos}`} rotation={[-Math.PI / 2, 0, Math.PI / 2]} position={[0, 0.08, zPos]}>
          <planeGeometry args={[8, 320]} />
          <meshBasicMaterial
            color="#005AA6"
            transparent
            opacity={glowAlpha * 0.5}
          />
        </mesh>
      ))}

      {/* Glowing Intersections */}
      {[-50, -30, -10, 10, 30, 50].map((xPos) => 
        [-50, -30, -10, 10, 30, 50].map((zPos) => (
          <mesh key={`int_${xPos}_${zPos}`} position={[xPos, 0.12, zPos]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[3, 16]} />
            <meshBasicMaterial color="#07CCF4" transparent opacity={glowAlpha * 0.8} />
          </mesh>
        ))
      )}

      {/* Cable-stayed Suspension Bridge Crossing Water */}
      <group position={[0, 0, -60]}>
        {/* Bridge deck */}
        <mesh position={[0, 2, 0]}>
          <boxGeometry args={[14, 1.2, 110]} />
          <meshStandardMaterial color="#0F172A" roughness={0.3} metalness={0.8} />
        </mesh>
        {/* Bridge Pylons */}
        {[-30, 30].map((z, idx) => (
          <group key={idx} position={[0, 16, z]}>
            <mesh position={[-7, 0, 0]}>
              <boxGeometry args={[1.8, 32, 2.2]} />
              <meshStandardMaterial color="#1E293B" emissive="#07CCF4" emissiveIntensity={0.5} />
            </mesh>
            <mesh position={[7, 0, 0]}>
              <boxGeometry args={[1.8, 32, 2.2]} />
              <meshStandardMaterial color="#1E293B" emissive="#07CCF4" emissiveIntensity={0.5} />
            </mesh>
            {/* Top crossbeam */}
            <mesh position={[0, 12, 0]}>
              <boxGeometry args={[16, 2, 2.2]} />
              <meshStandardMaterial color="#1E293B" emissive="#07CCF4" emissiveIntensity={0.7} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Elevated Metro Guideway */}
      <group position={[-18, 4.2, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[3.2, 320]} />
          <meshStandardMaterial color="#0A101D" emissive="#0083D0" emissiveIntensity={0.4} />
        </mesh>
        {/* Guideway piers */}
        {Array.from({ length: 16 }).map((_, i) => (
          <mesh key={i} position={[0, -2.1, i * 20 - 150]}>
            <cylinderGeometry args={[0.7, 0.9, 4.2, 8]} />
            <meshStandardMaterial color="#1E293B" />
          </mesh>
        ))}
      </group>
    </group>
  )
}

// ── Master 3D Scene Assembly ────────────────────────────────────────────────
function CinematicScene({
  replayKey,
  onTimelineProgress,
}: {
  replayKey: number
  onTimelineProgress: (elapsed: number) => void
}) {
  const elapsedRef = useRef(0)

  const handleProgress = (t: number) => {
    elapsedRef.current = t
    onTimelineProgress(t)
  }

  return (
    <>
      {/* Deep Navy/Black Background & Atmospheric Fog */}
      <color attach="background" args={['#060815']} />
      <fog attach="fog" args={['#060815', 25, 200]} />

      {/* Ground Haze */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.5, 0]}>
        <planeGeometry args={[500, 500]} />
        <shaderMaterial
          transparent
          depthWrite={false}
          vertexShader={`
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            varying vec2 vUv;
            void main() {
              float d = distance(vUv, vec2(0.5));
              float alpha = smoothstep(0.1, 0.5, d);
              gl_FragColor = vec4(0.024, 0.031, 0.082, alpha * 0.95);
            }
          `}
        />
      </mesh>

      {/* Lighting: Luminous Blue/Cyan Directional & Ambient */}
      <ambientLight color="#001833" intensity={0.8} />
      <directionalLight position={[40, 90, 40]} color="#07CCF4" intensity={1.8} />
      <directionalLight position={[-60, 50, -40]} color="#005AA6" intensity={1.2} />
      <hemisphereLight args={['#07CCF4', '#060815', 0.6]} />

      {/* Camera Flight Controller */}
      <CinematicCameraRig replayKey={replayKey} onTimelineProgress={handleProgress} />

      {/* Ground & Infrastructure */}
      <RoadAndTransitGrid elapsed={elapsedRef.current} />

      {/* City Architecture */}
      <CityArchitecturalLandscape elapsed={elapsedRef.current} />

      {/* Moving Traffic */}
      <MovingTrafficStream elapsed={elapsedRef.current} />

      {/* Moving Elevated Metro */}
      <MovingMetroTrain elapsed={elapsedRef.current} />

      {/* Light Sweep at 4.2s */}
      <SkylineLightSweep elapsed={elapsedRef.current} />

      {/* Ambient Data Particles */}
      <AmbientCityParticles elapsed={elapsedRef.current} />
    </>
  )
}

export function CinematicHeroCity({ replayKey, onTimelineProgress }: CinematicHeroCityProps) {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#060815]">
      {/* HTML5 Video Layer (Option C implementation with poster fallback) */}
      <video
        autoPlay
        muted
        loop
        playsInline
        poster="/media/metacity-hero-poster.webp"
        className="absolute inset-0 w-full h-full object-cover opacity-25 pointer-events-none mix-blend-screen"
      >
        <source src="/media/metacity-hero.webm" type="video/webm" />
        <source src="/media/metacity-hero.mp4" type="video/mp4" />
      </video>

      {/* Interactive 3D Three.js Metropolis Scene with 6-Second Camera Animation */}
      <Canvas
        camera={{ position: [0, 160, 200], fov: 42, near: 1, far: 500 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.25 }}
        className="w-full h-full"
      >
        <CinematicScene replayKey={replayKey} onTimelineProgress={onTimelineProgress} />
      </Canvas>
    </div>
  )
}
