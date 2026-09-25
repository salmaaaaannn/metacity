import React, { useState, useEffect } from 'react'
import * as THREE from 'three'
import { Html } from '@react-three/drei'
import { useSimulationStore } from '../../store/simulationStore'
import { loadGLTFModel, getCachedModelSync } from '../../assets/GLTFAssetCache'

const GHOST_ASSET_MAP: Record<string, string> = {
  hospital: '/assets/buildings/civic/hospital_center.glb',
  school: '/assets/buildings/civic/high_school.glb',
  police: '/assets/buildings/civic/police_station.glb',
  fire: '/assets/buildings/civic/fire_station.glb',
  power_plant: '/assets/environment/power_plant.glb',
  water_plant: '/assets/environment/water_tower.glb',
  residential: '/assets/buildings/residential/modern_apartment_complex.glb',
  commercial: '/assets/buildings/commercial/shopping_mall.glb',
  office: '/assets/buildings/office/office_glass_tower.glb',
  industrial: '/assets/buildings/industrial/distribution_warehouse.glb',
  park: '/assets/environment/fountain.glb',
  metro_station: '/assets/transit/metro_station_modern.glb',
  bus_stop: '/assets/transit/bus_shelter.glb',
}

export function PlacementGhost() {
  const ghost = useSimulationStore((s) => s.placementGhost)
  const selectedTool = useSimulationStore((s) => s.selectedTool)
  const plannerMode = useSimulationStore((s) => s.plannerMode)

  const assetPath = GHOST_ASSET_MAP[selectedTool]
  const [modelGroup, setModelGroup] = useState<THREE.Group | null>(() =>
    assetPath ? getCachedModelSync(assetPath) || null : null
  )

  useEffect(() => {
    if (!assetPath) {
      setModelGroup(null)
      return
    }
    let active = true
    loadGLTFModel(assetPath, 'civic', `ghost_${selectedTool}`).then((g) => {
      if (active) setModelGroup(g)
    })
    return () => {
      active = false
    }
  }, [assetPath, selectedTool])

  if (!plannerMode || !ghost || selectedTool === 'select' || selectedTool === 'demolish') {
    return null
  }

  const { x, z, endX, endZ, valid, reason, validationData } = ghost
  const color = valid ? '#10B981' : '#EF4444'
  const serviceRadius = validationData?.serviceRadius || 600

  const isLinear = ['road', 'highway', 'bridge', 'metro_line'].includes(selectedTool)

  if (isLinear && endX !== undefined && endZ !== undefined) {
    const dx = endX - x
    const dz = endZ - z
    const length = Math.sqrt(dx * dx + dz * dz)
    const midX = (x + endX) / 2
    const midZ = (z + endZ) / 2
    const angle = Math.atan2(dx, dz)
    const width = selectedTool === 'highway' ? 24 : selectedTool === 'bridge' ? 18 : 12

    return (
      <group name="placement_ghost_linear">
        <mesh position={[midX, 1.0, midZ]} rotation={[0, angle, 0]}>
          <boxGeometry args={[width, 1.5, length]} />
          <meshStandardMaterial
            color={color}
            transparent
            opacity={0.65}
            roughness={0.3}
            metalness={0.1}
          />
        </mesh>
        {/* Start and end pins */}
        <mesh position={[x, 3, z]}>
          <cylinderGeometry args={[4, 1, 6, 16]} />
          <meshBasicMaterial color={color} />
        </mesh>
        <mesh position={[endX, 3, endZ]}>
          <cylinderGeometry args={[4, 1, 6, 16]} />
          <meshBasicMaterial color={color} />
        </mesh>

        {/* Dynamic length & validation pill */}
        <Html position={[midX, 15, midZ]} center distanceFactor={700}>
          <div
            className={`px-3 py-1 rounded-full text-[11px] font-bold text-white shadow-xl backdrop-blur-md border ${
              valid
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
                : 'bg-red-950/80 border-red-500/50 text-red-200'
            }`}
          >
            {Math.round(length)}m • {valid ? 'Click to Construct' : reason || 'Invalid'}
          </div>
        </Html>
      </group>
    )
  }

  // Point item ghost preview
  const boxWidth =
    selectedTool === 'hospital' || selectedTool === 'school'
      ? 50
      : selectedTool === 'power_plant' || selectedTool === 'water_plant'
      ? 60
      : selectedTool === 'metro_station'
      ? 30
      : selectedTool === 'bus_stop'
      ? 10
      : 35
  const boxHeight = selectedTool === 'bus_stop' ? 4 : selectedTool === 'metro_station' ? 15 : 25

  return (
    <group name="placement_ghost_point">
      {/* 3D Model Ghost or Holographic Geometry */}
      <group position={[x, 0, z]}>
        {modelGroup ? (
          <primitive object={modelGroup} />
        ) : (
          <mesh position={[0, boxHeight / 2, 0]}>
            <boxGeometry args={[boxWidth, boxHeight, boxWidth]} />
            <meshStandardMaterial color={color} transparent opacity={0.55} />
          </mesh>
        )}

        {/* Wireframe Outline */}
        <mesh position={[0, boxHeight / 2, 0]}>
          <boxGeometry args={[boxWidth * 1.05, boxHeight * 1.05, boxWidth * 1.05]} />
          <meshBasicMaterial color={valid ? '#34D399' : '#F87171'} wireframe />
        </mesh>
      </group>

      {/* Floating Status Pill */}
      <Html position={[x, boxHeight + 12, z]} center distanceFactor={700}>
        <div
          className={`px-3 py-1 rounded-full text-[11px] font-bold shadow-xl backdrop-blur-md border whitespace-nowrap ${
            valid
              ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
              : 'bg-red-950/80 border-red-500/50 text-red-200'
          }`}
        >
          {selectedTool.replace('_', ' ').toUpperCase()} • {valid ? 'Click to Build' : reason || 'Blocked'}
        </div>
      </Html>

      {/* Service Radius Ring on ground */}
      {serviceRadius > 0 && (
        <mesh position={[x, 0.5, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[serviceRadius - 4, serviceRadius, 64]} />
          <meshBasicMaterial
            color={valid ? '#3B82F6' : '#EF4444'}
            transparent
            opacity={0.35}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  )
}
