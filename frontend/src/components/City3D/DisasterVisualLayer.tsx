import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useSimulationStore, selectDisasters, selectRoads } from '../../store/simulationStore'

export function DisasterVisualLayer() {
  const disasters = useSimulationStore(selectDisasters)
  const roads = useSimulationStore(selectRoads)

  const shockwaveRef = useRef<THREE.Group>(null)
  const waterRef = useRef<THREE.Mesh>(null)
  const fireParticlesRef = useRef<THREE.Points>(null)

  const incidents = disasters?.incidents || []
  const closedRoadIds = new Set(disasters?.closed_roads || [])
  const emergencyUnits = disasters?.emergency_units || []

  // Animate dynamic elements (seismic wave expansion, rising smoke/fire, water ripple)
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()

    // Shockwave pulse
    if (shockwaveRef.current) {
      shockwaveRef.current.children.forEach((ring, idx) => {
        const scale = 1 + ((t * 0.8 + idx * 0.4) % 1.5)
        ring.scale.set(scale, scale, scale)
        const mat = (ring as THREE.Mesh).material as THREE.MeshBasicMaterial
        if (mat) {
          mat.opacity = Math.max(0, 0.7 - (scale - 1) * 0.5)
        }
      })
    }

    // Flood water undulating height
    if (waterRef.current) {
      waterRef.current.position.y = 1.2 + Math.sin(t * 1.5) * 0.4
    }

    // Fire & smoke particles flicker
    if (fireParticlesRef.current) {
      fireParticlesRef.current.rotation.y = t * 0.1
    }
  })

  return (
    <group name="disaster_visual_layer">
      {/* 1. Active Disaster Incidents */}
      {incidents.map((inc) => {
        const isFlood = inc.disaster_type === 'FLOOD'
        const isFire = inc.disaster_type === 'FIRE'
        const isQuake = inc.disaster_type === 'EARTHQUAKE'

        return (
          <group key={inc.id} position={[inc.epicenter_x, 0, inc.epicenter_z]}>
            {/* FLOOD: Rising translucent water disk */}
            {isFlood && (
              <mesh ref={waterRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 1.2, 0]}>
                <circleGeometry args={[inc.radius, 48]} />
                <meshStandardMaterial
                  color="#0284C7"
                  transparent
                  opacity={0.65}
                  roughness={0.1}
                  metalness={0.2}
                  depthWrite={false}
                />
              </mesh>
            )}

            {/* FIRE: Fiery core and billowing smoke column */}
            {isFire && (
              <group position={[0, 0, 0]}>
                {/* Fire Glow Dome */}
                <mesh position={[0, 15, 0]}>
                  <sphereGeometry args={[inc.radius * 0.25, 16, 16]} />
                  <meshBasicMaterial color="#FF5722" transparent opacity={0.6} />
                </mesh>
                {/* Smoke Column cylinder */}
                <mesh position={[0, 60, 0]}>
                  <cylinderGeometry args={[inc.radius * 0.35, inc.radius * 0.15, 120, 16]} />
                  <meshStandardMaterial
                    color="#2D3748"
                    transparent
                    opacity={0.55}
                    roughness={0.9}
                    depthWrite={false}
                  />
                </mesh>
              </group>
            )}

            {/* EARTHQUAKE: Seismic radiating shockwave rings */}
            {isQuake && (
              <group ref={shockwaveRef} position={[0, 0.4, 0]}>
                {[0, 1, 2].map((ringIdx) => (
                  <mesh key={ringIdx} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[inc.radius * 0.3, inc.radius * 0.35, 36]} />
                    <meshBasicMaterial color="#EAB308" transparent opacity={0.6} side={THREE.DoubleSide} />
                  </mesh>
                ))}
              </group>
            )}
          </group>
        )
      })}

      {/* 2. Closed Road Warning Strobe Markers */}
      {roads
        .filter((r) => closedRoadIds.has(r.id))
        .map((r) => {
          const midX = (r.startX + r.endX) / 2
          const midZ = (r.startZ + r.endZ) / 2
          return (
            <group key={`closed_${r.id}`} position={[midX, 2, midZ]}>
              <mesh position={[0, 1, 0]}>
                <boxGeometry args={[6, 2, 1]} />
                <meshStandardMaterial color="#DC2626" />
              </mesh>
              <pointLight color="#EF4444" intensity={2} distance={25} />
            </group>
          )
        })}

      {/* 3. Emergency Fleet Response Beacons */}
      {emergencyUnits.map((u) => (
        <group key={u.id} position={[u.x, 3, u.z]}>
          <mesh position={[0, 1, 0]}>
            <sphereGeometry args={[2, 8, 8]} />
            <meshBasicMaterial color={u.unit_type === 'FIRE' ? '#EF4444' : '#3B82F6'} />
          </mesh>
          <pointLight
            color={u.unit_type === 'FIRE' ? '#EF4444' : '#60A5FA'}
            intensity={2.5}
            distance={30}
          />
        </group>
      ))}
    </group>
  )
}
