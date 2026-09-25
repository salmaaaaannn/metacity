import React, { useMemo, useState, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { useSimulationStore, selectBuildings } from '../../store/simulationStore'
import { BuildingRenderer } from '../../components/City3D/BuildingRenderer'
import type { Building } from '../../types/city'

const CHUNK_SIZE = 200 // 200m x 200m per chunk (40x40 grid for 8000m x 8000m city)
const MAX_CHUNKS = 40
const LOD0_DIST_SQ = 1400 * 1400 // < 1.4km: High Detail GLB Assets
const LOD1_DIST_SQ = 3400 * 3400 // < 3.4km: Medium Detail
const CULL_DIST_SQ = 5800 * 5800 // > 5.8km: Culled

/**
 * 40x40 Spatial Chunk Streaming Manager
 * Partitions 2,400+ buildings across spatial grid chunks, applies frustum/distance culling,
 * and passes prioritized LOD levels for high frame rate rendering.
 */
export function ChunkManager() {
  const buildings = useSimulationStore(selectBuildings)
  const camera = useThree((s) => s.camera)

  // 1. Spatial binning of buildings into 40x40 chunk grid
  const chunkMap = useMemo(() => {
    const map = new Map<string, Building[]>()

    buildings.forEach((b) => {
      const cx = Math.min(MAX_CHUNKS - 1, Math.max(0, Math.floor(b.x / CHUNK_SIZE)))
      const cz = Math.min(MAX_CHUNKS - 1, Math.max(0, Math.floor(b.z / CHUNK_SIZE)))
      const key = `${cx}_${cz}`

      if (!map.has(key)) {
        map.set(key, [])
      }
      map.get(key)!.push(b)
    })

    return map
  }, [buildings])

  // Track active visible building collections
  const [activeBuildings, setActiveBuildings] = useState<{
    lod0: Building[]
    lod1: Building[]
    lod2: Building[]
  }>({ lod0: [], lod1: [], lod2: [] })

  // Recompute visible chunks periodically as camera navigates
  useFrame(({ clock }) => {
    // Check every 15 frames (~250ms) to avoid per-frame array allocations
    if (clock.getElapsedTime() % 0.25 > 0.05) return

    const camX = camera.position.x
    const camZ = camera.position.z

    const lod0List: Building[] = []
    const lod1List: Building[] = []
    const lod2List: Building[] = []

    chunkMap.forEach((chunkBuildings, key) => {
      const [cxStr, czStr] = key.split('_')
      const chunkCenterX = (parseInt(cxStr, 10) + 0.5) * CHUNK_SIZE
      const chunkCenterZ = (parseInt(czStr, 10) + 0.5) * CHUNK_SIZE

      const dx = chunkCenterX - camX
      const dz = chunkCenterZ - camZ
      const distSq = dx * dx + dz * dz

      if (distSq > CULL_DIST_SQ) {
        // Culled outside view distance
        return
      }

      if (distSq < LOD0_DIST_SQ) {
        lod0List.push(...chunkBuildings)
      } else if (distSq < LOD1_DIST_SQ) {
        lod1List.push(...chunkBuildings)
      } else {
        lod2List.push(...chunkBuildings)
      }
    })

    // If camera is very high (overview mode), ensure visible buildings are always displayed
    if (lod0List.length === 0 && lod1List.length === 0 && lod2List.length === 0) {
      setActiveBuildings({
        lod0: [],
        lod1: buildings.slice(0, 1000),
        lod2: buildings.slice(1000),
      })
    } else {
      setActiveBuildings({
        lod0: lod0List,
        lod1: lod1List,
        lod2: lod2List,
      })
    }
  })

  // Initial populate
  useEffect(() => {
    setActiveBuildings({
      lod0: buildings.slice(0, 250),
      lod1: buildings.slice(250, 1200),
      lod2: buildings.slice(1200),
    })
  }, [buildings])

  return (
    <group name="spatial_chunk_manager">
      {/* High Detail (LOD 0) Chunks */}
      {activeBuildings.lod0.length > 0 && (
        <BuildingRenderer buildings={activeBuildings.lod0} lodLevel={0} />
      )}

      {/* Medium Detail (LOD 1) Chunks */}
      {activeBuildings.lod1.length > 0 && (
        <BuildingRenderer buildings={activeBuildings.lod1} lodLevel={1} />
      )}

      {/* Low Detail (LOD 2) Chunks */}
      {activeBuildings.lod2.length > 0 && (
        <BuildingRenderer buildings={activeBuildings.lod2} lodLevel={2} />
      )}
    </group>
  )
}
