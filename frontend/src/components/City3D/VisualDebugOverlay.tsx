import React, { useMemo } from 'react'
import * as THREE from 'three'
import { useSimulationStore, selectDistricts, selectInfrastructureList } from '../../store/simulationStore'

/**
 * Visual Debug Overlay (Default: OFF)
 * Renders chunk boundaries (40x40 grid), district bounding outlines, and infrastructure service radii.
 */
export function VisualDebugOverlay() {
  const debugMode = useSimulationStore((s) => s.debugMode)
  const districts = useSimulationStore(selectDistricts)
  const infraItems = useSimulationStore(selectInfrastructureList)

  // 40 x 40 Chunks Grid Lines
  const gridHelper = useMemo(() => {
    // 8000m total size, 40 divisions = 200m per chunk
    const grid = new THREE.GridHelper(8000, 40, '#00E5FF', '#37474F')
    grid.position.set(4000, 0.2, 4000)
    return grid
  }, [])

  if (!debugMode) return null

  return (
    <group name="visual_debug_overlay">
      {/* 1. 40x40 Chunk Grid */}
      <primitive object={gridHelper} />

      {/* 2. District Bounding Boxes */}
      {districts.map((d) => {
        const [xMin, zMin, xMax, zMax] = d.bounds
        const w = xMax - xMin
        const l = zMax - zMin
        const cx = (xMin + xMax) / 2
        const cz = (zMin + zMax) / 2

        return (
          <group key={d.id} position={[cx, 1.0, cz]}>
            <lineSegments>
              <edgesGeometry args={[new THREE.BoxGeometry(w, 20, l)]} />
              <lineBasicMaterial color="#FF9100" linewidth={2} />
            </lineSegments>
          </group>
        )
      })}

      {/* 3. Infrastructure Service Radii */}
      {infraItems.map((it) => {
        const radius = (it as any).serviceRadius || 400
        return (
          <mesh
            key={it.id}
            position={[it.x, 0.4, it.z]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <ringGeometry args={[radius - 4, radius, 32]} />
            <meshBasicMaterial color="#00E676" side={THREE.DoubleSide} transparent opacity={0.6} />
          </mesh>
        )
      })}
    </group>
  )
}
