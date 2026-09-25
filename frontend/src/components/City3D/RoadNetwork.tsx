import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useSimulationStore, selectRoads, selectInfrastructureList } from '../../store/simulationStore'
import { createRoadSegmentGroup } from '../../assets/city/roads/RoadGeometries'
import { createHighwaySegmentGroup } from '../../assets/city/highways/HighwayGeometries'
import { createBridgeSegmentGroup } from '../../assets/city/bridges/BridgeGeometries'

interface RoadData {
  id: string
  type: string
  startX: number
  startZ: number
  endX: number
  endZ: number
  width: number
  elevationY: number
}

// Memory-efficient road segment cache
const roadMeshCache = new Map<string, THREE.Group>()

function getCachedRoadSegment(r: RoadData, length: number): THREE.Group {
  const roundedLen = Math.round(length * 2) / 2
  const cacheKey = `${r.type}_${r.width}_${roundedLen}_${r.elevationY}`

  if (roadMeshCache.has(cacheKey)) {
    return roadMeshCache.get(cacheKey)!.clone()
  }

  let segmentGroup: THREE.Group
  if (r.type === 'bridge') {
    segmentGroup = createBridgeSegmentGroup(r.width, roundedLen, r.elevationY)
  } else if (r.type === 'highway' || r.type === 'expressway') {
    segmentGroup = createHighwaySegmentGroup(r.width, roundedLen, r.elevationY)
  } else {
    segmentGroup = createRoadSegmentGroup(r.width, roundedLen, r.type)
  }

  roadMeshCache.set(cacheKey, segmentGroup)
  return segmentGroup.clone()
}

/** Distance-culled local road layer — only renders local streets within 2000m of camera */
function LocalRoadLayer({ roads }: { roads: RoadData[] }) {
  const groupRef = useRef<THREE.Group>(null)
  const CULL_DIST_SQ = 2000 * 2000

  useFrame(({ camera }) => {
    if (!groupRef.current) return
    const camX = camera.position.x
    const camZ = camera.position.z

    groupRef.current.children.forEach((child) => {
      const dx = child.position.x - camX
      const dz = child.position.z - camZ
      const distSq = dx * dx + dz * dz
      child.visible = distSq < CULL_DIST_SQ
    })
  })

  return (
    <group ref={groupRef} name="local_roads_layer">
      {roads.map((r) => {
        const dx = r.endX - r.startX
        const dz = r.endZ - r.startZ
        const length = Math.sqrt(dx * dx + dz * dz)
        if (length < 1) return null

        const midX = (r.startX + r.endX) / 2
        const midZ = (r.startZ + r.endZ) / 2
        const angle = Math.atan2(dx, dz)
        const segmentGroup = getCachedRoadSegment(r, length)

        return (
          <primitive
            key={r.id}
            object={segmentGroup}
            position={[midX, 0, midZ]}
            rotation={[0, angle, 0]}
          />
        )
      })}
    </group>
  )
}

/**
 * Realistic 3D Road Network Renderer
 * Transforms flat prototype colored strips into full 3D urban infrastructure:
 * - Multi-lane highways with concrete Jersey median barriers and overhead sign gantries
 * - Cable-stayed bridges with river piers and guardrails
 * - Arterial and local roads with asphalt, curbs, sidewalks, lane stripes, and zebra crosswalks
 * - Local roads use distance-based culling for performance
 * - High-performance segment caching
 */
export function RoadNetwork() {
  const cityRoads = useSimulationStore(selectRoads)
  const infraItems = useSimulationStore(selectInfrastructureList)

  const { mainRoads, localRoads } = useMemo(() => {
    const main: RoadData[] = []
    const local: RoadData[] = []

    cityRoads.forEach((r) => {
      const isHighway = r.roadType === 'highway' || r.roadType === 'expressway'
      const isBridge = r.roadType === 'bridge'
      const isLocal = r.roadType === 'local'
      const road: RoadData = {
        id: r.id,
        type: r.roadType,
        startX: r.startX,
        startZ: r.startZ,
        endX: r.endX,
        endZ: r.endZ,
        width: isHighway ? 24 : isBridge ? 20 : isLocal ? 8 : r.width || 14,
        elevationY: isBridge ? 4.5 : isHighway ? 1.5 : 0.0,
      }
      if (isLocal) {
        local.push(road)
      } else {
        main.push(road)
      }
    })

    infraItems.forEach((it) => {
      if (['road', 'highway', 'bridge'].includes(it.itemType) && it.endX !== undefined && it.endZ !== undefined) {
        const isHighway = it.itemType === 'highway'
        const isBridge = it.itemType === 'bridge'
        main.push({
          id: it.id,
          type: it.itemType,
          startX: it.x,
          startZ: it.z,
          endX: it.endX,
          endZ: it.endZ,
          width: isHighway ? 24 : isBridge ? 20 : 14,
          elevationY: isBridge ? 4.5 : isHighway ? 1.5 : 0.0,
        })
      }
    })

    return { mainRoads: main, localRoads: local }
  }, [cityRoads, infraItems])

  return (
    <group name="road_network_layer">
      {/* Main roads: highways, arterials, bridges — always visible */}
      {mainRoads.map((r) => {
        const dx = r.endX - r.startX
        const dz = r.endZ - r.startZ
        const length = Math.sqrt(dx * dx + dz * dz)
        if (length < 1) return null

        const midX = (r.startX + r.endX) / 2
        const midZ = (r.startZ + r.endZ) / 2
        const angle = Math.atan2(dx, dz)
        const segmentGroup = getCachedRoadSegment(r, length)

        return (
          <primitive
            key={r.id}
            object={segmentGroup}
            position={[midX, 0, midZ]}
            rotation={[0, angle, 0]}
          />
        )
      })}

      {/* Local streets: distance-culled for performance */}
      <LocalRoadLayer roads={localRoads} />
    </group>
  )
}

