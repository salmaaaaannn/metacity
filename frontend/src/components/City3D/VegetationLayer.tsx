import React, { useMemo, useState, useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useSimulationStore, selectDistricts, selectInfrastructureList, selectRoads } from '../../store/simulationStore'
import { loadGLTFModel, getCachedModelSync } from '../../assets/GLTFAssetCache'
import {
  createDeciduousTreeGroup,
  createPineTreeGroup,
  createParkFountainGroup,
} from '../../assets/city/vegetation/VegetationFactory'

interface TreePlacement {
  id: string
  x: number
  z: number
  scale: number
  treeType: 'oak' | 'pine' | 'birch'
}

/**
 * Realistic Vegetation & Public Parks Layer
 * Renders street trees, suburban gardens, pine forests in rural zones,
 * and decorative park fountains with GLB assets and district-aware density.
 */
export function VegetationLayer() {
  const districts = useSimulationStore(selectDistricts)
  const infraItems = useSimulationStore(selectInfrastructureList)
  const cityRoads = useSimulationStore(selectRoads)
  const camera = useThree((s) => s.camera)

  // Preload tree GLB models
  const [glbOak, setGlbOak] = useState<THREE.Group | null>(() => getCachedModelSync('/assets/environment/trees/tree_oak.glb') || null)
  const [glbPine, setGlbPine] = useState<THREE.Group | null>(() => getCachedModelSync('/assets/environment/trees/tree_pine.glb') || null)
  const [glbBirch, setGlbBirch] = useState<THREE.Group | null>(() => getCachedModelSync('/assets/environment/trees/tree_birch.glb') || null)
  const [glbFountain, setGlbFountain] = useState<THREE.Group | null>(() => getCachedModelSync('/assets/environment/props/park_fountain.glb') || null)

  useEffect(() => {
    let active = true
    Promise.all([
      loadGLTFModel('/assets/environment/trees/tree_oak.glb', 'environment'),
      loadGLTFModel('/assets/environment/trees/tree_pine.glb', 'environment'),
      loadGLTFModel('/assets/environment/trees/tree_birch.glb', 'environment'),
      loadGLTFModel('/assets/environment/props/park_fountain.glb', 'environment'),
    ]).then(([oak, pine, birch, fountain]) => {
      if (active) {
        setGlbOak(oak)
        setGlbPine(pine)
        setGlbBirch(birch)
        setGlbFountain(fountain)
      }
    })
    return () => {
      active = false
    }
  }, [])

  // 1. Street Trees along roads with district-specific density
  const treePlacements = useMemo(() => {
    const trees: TreePlacement[] = []
    let counter = 0

    // Trees along urban roads
    cityRoads.forEach((r) => {
      if (r.roadType === 'highway' || r.roadType === 'bridge') return
      const dx = r.endX - r.startX
      const dz = r.endZ - r.startZ
      const len = Math.sqrt(dx * dx + dz * dz)
      if (len < 20) return

      const angle = Math.atan2(dx, dz)
      const perpX = -Math.sin(angle + Math.PI / 2)
      const perpZ = -Math.cos(angle + Math.PI / 2)
      const offset = (r.width || 12) / 2 + 3.2

      const numTrees = Math.floor(len / 40)
      for (let i = 0; i < numTrees; i++) {
        const t = (i + 0.5) / (numTrees + 1)
        const x = r.startX + dx * t
        const z = r.startZ + dz * t

        const type: 'oak' | 'birch' = counter % 3 === 0 ? 'birch' : 'oak'

        // Left side
        trees.push({
          id: `tree_${counter++}`,
          x: x + perpX * offset,
          z: z + perpZ * offset,
          scale: 0.85 + ((counter % 5) * 0.08),
          treeType: type,
        })

        // Right side
        trees.push({
          id: `tree_${counter++}`,
          x: x - perpX * offset,
          z: z - perpZ * offset,
          scale: 0.9 + (((counter + 2) % 5) * 0.08),
          treeType: type,
        })
      }
    })

    // Green belt & rural forests in outer/rural zones
    districts.forEach((d) => {
      const isRural = d.type.includes('rural') || d.type.includes('outskirt')
      const isSuburban = d.type.includes('suburban') || d.type.includes('residential_low')
      const isIndustrial = d.type.includes('industrial')

      const count = isRural ? 35 : isSuburban ? 20 : isIndustrial ? 8 : 4
      const [xMin, zMin, xMax, zMax] = d.bounds

      for (let i = 0; i < count; i++) {
        const rx = xMin + 40 + (i * 12345.67) % (xMax - xMin - 80)
        const rz = zMin + 40 + (i * 98765.43) % (zMax - zMin - 80)
        trees.push({
          id: `tree_env_${counter++}`,
          x: rx,
          z: rz,
          scale: 0.8 + ((i % 5) * 0.12),
          treeType: isRural ? 'pine' : (i % 2 === 0 ? 'oak' : 'birch'),
        })
      }
    })

    return trees
  }, [cityRoads, districts])

  // Distance culling: render trees within 3000m of camera
  const visibleTrees = useMemo(() => {
    const camX = camera.position.x
    const camZ = camera.position.z
    const maxDistSq = 3000 * 3000

    return treePlacements.filter((t) => {
      const dx = t.x - camX
      const dz = t.z - camZ
      return dx * dx + dz * dz < maxDistSq
    })
  }, [treePlacements, camera.position.x, camera.position.z])

  // 2. Park Facilities with decorative fountains
  const parkFountains = useMemo(() => {
    return infraItems.filter((it) => it.itemType === 'park')
  }, [infraItems])

  return (
    <group name="vegetation_environment_layer">
      {/* 1. Realistic Trees */}
      {visibleTrees.map((t) => {
        let object: THREE.Group
        if (t.treeType === 'pine') {
          object = glbPine ? glbPine.clone() : createPineTreeGroup(t.scale)
        } else if (t.treeType === 'birch') {
          object = glbBirch ? glbBirch.clone() : createDeciduousTreeGroup(t.scale)
        } else {
          object = glbOak ? glbOak.clone() : createDeciduousTreeGroup(t.scale)
        }

        return (
          <group
            key={t.id}
            position={[t.x, 0, t.z]}
            scale={[t.scale, t.scale, t.scale]}
          >
            <primitive object={object} />
          </group>
        )
      })}

      {/* 2. Park Fountains */}
      {parkFountains.map((p) => {
        const fountain = glbFountain ? glbFountain.clone() : createParkFountainGroup()
        return (
          <group key={p.id} position={[p.x, 0, p.z]}>
            <primitive object={fountain} />
          </group>
        )
      })}
    </group>
  )
}
