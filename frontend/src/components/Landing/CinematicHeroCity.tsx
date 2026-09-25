import React, { useMemo, useRef, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrthographicCamera } from '@react-three/drei'
import * as THREE from 'three'

interface CinematicHeroCityProps {
  elapsedTime?: number
  replayKey?: number
  onTimelineProgress?: (t: number) => void
}

function ProceduralCityGrid() {
  const groupRef = useRef<THREE.Group>(null)
  const coreMeshRef = useRef<THREE.InstancedMesh>(null)
  const wireMeshRef = useRef<THREE.InstancedMesh>(null)
  const mountTimeRef = useRef(0)

  // Crimson Nexus Grid Math
  const { count, instances } = useMemo(() => {
    const GRID_SIZE = 25
    const SPACING = 2.5
    const total = GRID_SIZE * GRID_SIZE
    
    const instances = []
    
    for (let x = -Math.floor(GRID_SIZE/2); x <= Math.floor(GRID_SIZE/2); x++) {
      for (let z = -Math.floor(GRID_SIZE/2); z <= Math.floor(GRID_SIZE/2); z++) {
        const distFromCenter = Math.sqrt(x*x + z*z)
        
        // Downtown in center, suburbs on edge
        const maxH = 25
        const spread = 8
        const baseH = Math.exp(-(distFromCenter*distFromCenter) / (spread*spread)) * maxH
        
        // Add variation
        const noise = Math.random() * 3
        const h = Math.max(0.5, baseH + noise)
        
        // Delay animation based on distance from center to create the "ripple" effect
        const delay = distFromCenter * 0.15
        
        // Critical buildings (Red) vs Normal (Cyan)
        const isCritical = Math.random() > 0.94
        const color = new THREE.Color(isCritical ? '#FF2E4D' : '#00E5FF')

        instances.push({
          px: x * SPACING,
          pz: z * SPACING,
          targetH: h,
          delay,
          color,
          w: SPACING * 0.75, // Guarantee padding between blocks
          d: SPACING * 0.75
        })
      }
    }
    
    return { count: total, instances }
  }, [])

  // Data Pulses (Traffic)
  const pulseMeshRef = useRef<THREE.InstancedMesh>(null)
  const { pulseCount, pulses } = useMemo(() => {
    const pCount = 150
    const pArray = []
    const GRID_SIZE = 25
    const SPACING = 2.5
    const halfGrid = (GRID_SIZE * SPACING) / 2
    
    for (let i = 0; i < pCount; i++) {
      const isXAxis = Math.random() > 0.5
      const linePos = (Math.floor(Math.random() * GRID_SIZE) - Math.floor(GRID_SIZE/2)) * SPACING
      const startPos = (Math.random() * GRID_SIZE * SPACING) - halfGrid
      const speed = (Math.random() * 8 + 4) * (Math.random() > 0.5 ? 1 : -1)
      
      const color = new THREE.Color(Math.random() > 0.3 ? '#00E5FF' : '#FFB020')
      
      pArray.push({
        x: isXAxis ? startPos : linePos,
        z: isXAxis ? linePos : startPos,
        isXAxis,
        speed,
        color
      })
    }
    return { pulseCount: pCount, pulses: pArray }
  }, [])

  useEffect(() => {
    mountTimeRef.current = Date.now()

    if (wireMeshRef.current && coreMeshRef.current) {
      instances.forEach((inst, i) => {
        wireMeshRef.current!.setColorAt(i, inst.color)
      })
      wireMeshRef.current.instanceColor!.needsUpdate = true
    }

    if (pulseMeshRef.current) {
      pulses.forEach((p, i) => {
        pulseMeshRef.current!.setColorAt(i, p.color)
      })
      pulseMeshRef.current.instanceColor!.needsUpdate = true
    }
  }, [instances, pulses])

  const tempMatrix = new THREE.Matrix4()
  const tempPos = new THREE.Vector3()
  const tempScale = new THREE.Vector3()
  const tempQuat = new THREE.Quaternion()

  useFrame(() => {
    const t = (Date.now() - mountTimeRef.current) / 1000

    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.05
    }

    // Update Buildings
    if (coreMeshRef.current && wireMeshRef.current) {
      for (let i = 0; i < count; i++) {
        const inst = instances[i]
        
        let currentH = 0.01 
        if (t > inst.delay) {
          const progress = Math.min((t - inst.delay) / 1.5, 1.0)
          const easeOutCubic = 1 - Math.pow(1 - progress, 3)
          currentH = Math.max(0.01, inst.targetH * easeOutCubic)
        }

        tempPos.set(inst.px, currentH / 2, inst.pz)
        tempScale.set(inst.w, currentH, inst.d)
        tempMatrix.compose(tempPos, tempQuat, tempScale)
        
        coreMeshRef.current.setMatrixAt(i, tempMatrix)
        wireMeshRef.current.setMatrixAt(i, tempMatrix)
      }
      
      coreMeshRef.current.instanceMatrix.needsUpdate = true
      wireMeshRef.current.instanceMatrix.needsUpdate = true
    }

    // Update Data Pulses
    if (pulseMeshRef.current) {
      const halfGrid = (25 * 2.5) / 2
      for (let i = 0; i < pulseCount; i++) {
        const p = pulses[i]
        
        // Move pulse
        if (p.isXAxis) {
          p.x += p.speed * 0.016 // Approx 60fps delta
          if (p.x > halfGrid) p.x = -halfGrid
          if (p.x < -halfGrid) p.x = halfGrid
        } else {
          p.z += p.speed * 0.016
          if (p.z > halfGrid) p.z = -halfGrid
          if (p.z < -halfGrid) p.z = halfGrid
        }

        // Only show pulse if the center buildings have started animating
        const pulseScale = t > 0.5 ? 0.3 : 0.01

        tempPos.set(p.x, 0.2, p.z)
        tempScale.set(pulseScale, pulseScale, pulseScale)
        tempMatrix.compose(tempPos, tempQuat, tempScale)
        pulseMeshRef.current.setMatrixAt(i, tempMatrix)
      }
      pulseMeshRef.current.instanceMatrix.needsUpdate = true
    }
  })

  return (
    <group ref={groupRef}>
      {/* 1. Base Grid Layer (Border Line #2A3441) */}
      <gridHelper args={[100, 40, '#2A3441', '#2A3441']} position={[0, -0.01, 0]} />

      {/* 2. Building Core (Carbon Black / Graphite) */}
      <instancedMesh ref={coreMeshRef} args={[undefined, undefined, count]} castShadow receiveShadow>
        <boxGeometry />
        <meshStandardMaterial color="#0B0F14" metalness={0.8} roughness={0.2} />
      </instancedMesh>

      {/* 3. Building Edges/Digital Wireframe (Electric Cyan & Primary Red) */}
      <instancedMesh ref={wireMeshRef} args={[undefined, undefined, count]}>
        <boxGeometry />
        <meshBasicMaterial 
          wireframe={true} 
          transparent={true} 
          opacity={0.5} 
          blending={THREE.AdditiveBlending}
        />
      </instancedMesh>

      {/* 4. Data Pulses (Traffic) */}
      <instancedMesh ref={pulseMeshRef} args={[undefined, undefined, pulseCount]}>
        <boxGeometry />
        <meshBasicMaterial 
          transparent={true}
          opacity={0.8}
          blending={THREE.AdditiveBlending}
        />
      </instancedMesh>
    </group>
  )
}

export function CinematicHeroCity(props: CinematicHeroCityProps) {
  // Enforce 100vw/100vh absolute sizing to prevent layout breaks on mobile
  return (
    <div className="absolute inset-0 w-screen h-screen bg-[#05080c] z-0 overflow-hidden" style={{ width: '100vw', height: '100vh' }}>
      {/* Safe 3D Canvas layer */}
      <Canvas 
        className="absolute inset-0 pointer-events-none"
        gl={{ powerPreference: 'high-performance', antialias: false }}
        dpr={[1, 2]}
      >
        {/* Isometric wide-angle camera positioned to prevent clipping */}
        <OrthographicCamera 
          makeDefault 
          position={[60, 60, 60]} 
          zoom={18} 
          near={-500} 
          far={1000} 
          onUpdate={c => c.lookAt(0, 0, 0)}
        />
        
        <ambientLight intensity={1.5} />
        <directionalLight position={[10, 20, 10]} intensity={3} color="#ffffff" castShadow />
        <directionalLight position={[-10, -10, 10]} intensity={2} color="#00E5FF" />
        
        <React.Suspense fallback={null}>
          <ProceduralCityGrid />
        </React.Suspense>
      </Canvas>
    </div>
  )
}
