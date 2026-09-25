import React, { useMemo, useState, useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useSimulationStore, selectRoads } from '../../store/simulationStore'
import { loadGLTFModel, getCachedModelSync } from '../../assets/GLTFAssetCache'
import {
  createStreetlightGroup,
  createTrafficSignalGroup,
  createBenchGroup,
  createFireHydrantGroup,
} from '../../assets/city/street/StreetFurniture'

interface FurnitureItem {
  id: string
  type: 'streetlight' | 'traffic_signal' | 'bench' | 'hydrant'
  x: number
  y: number
  z: number
  rotY: number
}

/**
 * Realistic Street Furniture & Traffic Signals Layer
 * Renders cobra-head streetlights with night illumination, intersection traffic signals,
 * wooden park benches, and municipal fire hydrants with GLB asset support and distance culling.
 */
export function StreetFurnitureLayer() {
  const cityRoads = useSimulationStore(selectRoads)
  const simHour = useSimulationStore((s) => s.cityState?.simHour ?? 12)
  const timeOfDay = useSimulationStore((s) => s.timeOfDay)
  const camera = useThree((s) => s.camera)

  const isNight = useMemo(() => {
    if (timeOfDay === 'night') return true
    if (timeOfDay === 'day' || timeOfDay === 'sunset') return false
    return simHour < 6.0 || simHour >= 20.0
  }, [simHour, timeOfDay])

  // Preload furniture GLB models
  const [glbLight, setGlbLight] = useState<THREE.Group | null>(() => getCachedModelSync('/assets/street/lights/streetlight.glb') || null)
  const [glbSignal, setGlbSignal] = useState<THREE.Group | null>(() => getCachedModelSync('/assets/street/traffic_lights/traffic_light.glb') || null)
  const [glbBench, setGlbBench] = useState<THREE.Group | null>(() => getCachedModelSync('/assets/street/benches/park_bench.glb') || null)
  const [glbHydrant, setGlbHydrant] = useState<THREE.Group | null>(() => getCachedModelSync('/assets/street/barriers/fire_hydrant.glb') || null)

  useEffect(() => {
    let active = true
    Promise.all([
      loadGLTFModel('/assets/street/lights/streetlight.glb', 'street'),
      loadGLTFModel('/assets/street/traffic_lights/traffic_light.glb', 'street'),
      loadGLTFModel('/assets/street/benches/park_bench.glb', 'street'),
      loadGLTFModel('/assets/street/barriers/fire_hydrant.glb', 'street'),
    ]).then(([light, signal, bench, hydrant]) => {
      if (active) {
        setGlbLight(light)
        setGlbSignal(signal)
        setGlbBench(bench)
        setGlbHydrant(hydrant)
      }
    })
    return () => {
      active = false
    }
  }, [])

  // Generate streetlights and traffic signals along road segments
  const furnitureItems = useMemo(() => {
    const items: FurnitureItem[] = []

    cityRoads.forEach((r) => {
      const dx = r.endX - r.startX
      const dz = r.endZ - r.startZ
      const len = Math.sqrt(dx * dx + dz * dz)
      if (len < 10) return

      const angle = Math.atan2(dx, dz)
      const perpX = -Math.sin(angle + Math.PI / 2)
      const perpZ = -Math.cos(angle + Math.PI / 2)
      const halfW = (r.width || 12) / 2 + 1.5

      // Streetlights every 50m along road
      const numLights = Math.floor(len / 50)
      for (let i = 0; i <= numLights; i++) {
        const t = (i + 0.5) / Math.max(1, numLights + 1)
        const x = r.startX + dx * t
        const z = r.startZ + dz * t

        const side = i % 2 === 0 ? 1 : -1
        items.push({
          id: `light_${r.id}_${i}`,
          type: 'streetlight',
          x: x + perpX * halfW * side,
          y: 0,
          z: z + perpZ * halfW * side,
          rotY: angle + (side === 1 ? 0 : Math.PI),
        })

        if (i % 3 === 0 && r.roadType !== 'highway' && r.roadType !== 'expressway') {
          items.push({
            id: `bench_${r.id}_${i}`,
            type: 'bench',
            x: x - perpX * (halfW + 1.2) * side,
            y: 0.15,
            z: z - perpZ * (halfW + 1.2) * side,
            rotY: angle,
          })
        }
      }

      // Traffic Signal at start and end of road segments near intersections
      if (r.roadType !== 'highway' && r.roadType !== 'expressway') {
        items.push({
          id: `signal_start_${r.id}`,
          type: 'traffic_signal',
          x: r.startX + perpX * (halfW + 1.0),
          y: 0,
          z: r.startZ + perpZ * (halfW + 1.0),
          rotY: angle,
        })
        items.push({
          id: `signal_end_${r.id}`,
          type: 'traffic_signal',
          x: r.endX - perpX * (halfW + 1.0),
          y: 0,
          z: r.endZ - perpZ * (halfW + 1.0),
          rotY: angle + Math.PI,
        })
      }
    })

    return items
  }, [cityRoads])

  // Distance culling: render street props within 2500m of camera
  const visibleItems = useMemo(() => {
    const camX = camera.position.x
    const camZ = camera.position.z
    const maxDistSq = 2500 * 2500

    return furnitureItems.filter((it) => {
      const dx = it.x - camX
      const dz = it.z - camZ
      return dx * dx + dz * dz < maxDistSq
    })
  }, [furnitureItems, camera.position.x, camera.position.z])

  return (
    <group name="street_furniture_layer">
      {visibleItems.map((item) => {
        let object: THREE.Group
        if (item.type === 'streetlight') {
          object = glbLight ? glbLight.clone() : createStreetlightGroup(isNight)
        } else if (item.type === 'traffic_signal') {
          object = glbSignal ? glbSignal.clone() : createTrafficSignalGroup()
        } else if (item.type === 'bench') {
          object = glbBench ? glbBench.clone() : createBenchGroup()
        } else {
          object = glbHydrant ? glbHydrant.clone() : createFireHydrantGroup()
        }

        return (
          <group
            key={item.id}
            position={[item.x, item.y, item.z]}
            rotation={[0, item.rotY, 0]}
          >
            <primitive object={object} />
            {/* Night street light glow */}
            {isNight && item.type === 'streetlight' && (
              <pointLight color="#FFE082" intensity={1.8} distance={18} position={[0, 8.5, 2.5]} />
            )}
          </group>
        )
      })}
    </group>
  )
}
