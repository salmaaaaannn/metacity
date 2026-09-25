import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useSimulationStore, selectDistricts } from '../../store/simulationStore'
import { createDistrictGroundPlates } from '../../assets/city/terrain/DistrictGround'
import {
  createRiverEnvironmentGroup,
  createWaterMaterial,
} from '../../assets/city/terrain/WaterSurface'

/**
 * Realistic Zoned Ground & River System
 * Replaces the flat prototype green box with:
 * - Base natural terrain
 * - District-specific ground paving & lawns (CBD pavers, industrial asphalt, suburban grass)
 * - Animated river surface with stone quay retaining walls and pedestrian promenades
 */
export function GroundPlane() {
  const districts = useSimulationStore(selectDistricts)
  const waterMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null)

  if (!waterMaterialRef.current) {
    waterMaterialRef.current = createWaterMaterial()
  }

  // Subtle animated wave effect on river water
  useFrame(({ clock }) => {
    if (waterMaterialRef.current) {
      const t = clock.getElapsedTime()
      // Gently pulse roughness and color for subtle wave shimmer
      waterMaterialRef.current.roughness = 0.08 + Math.sin(t * 1.5) * 0.02
    }
  })

  // District ground plates
  const districtPlates = useMemo(() => {
    return createDistrictGroundPlates(districts)
  }, [districts])

  // River environment
  const riverGroup = useMemo(() => {
    return createRiverEnvironmentGroup(waterMaterialRef.current!)
  }, [])

  return (
    <group name="ground_and_terrain_layer">
      {/* 1. Base Natural Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[4000, -0.15, 4000]} receiveShadow>
        <planeGeometry args={[8000, 8000]} />
        <meshStandardMaterial color="#24381F" roughness={0.95} metalness={0.02} />
      </mesh>

      {/* 2. Zoned District Ground Plates */}
      <primitive object={districtPlates} />

      {/* 3. Realistic River & Quays */}
      <primitive object={riverGroup} />
    </group>
  )
}
