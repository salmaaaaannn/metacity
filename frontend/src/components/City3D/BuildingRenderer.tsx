import React, { useMemo } from 'react'
import * as THREE from 'three'
import { useSimulationStore, selectDistricts, selectDisasters } from '../../store/simulationStore'
import type { Building, District } from '../../types/city'
import {
  determineBuildingArchetype,
  getBuildingGeometry,
  getMaterialForArchetype,
  type ArchetypeCategory,
} from '../../assets/city/buildings/ProceduralBuildingFactory'
import {
  METACITY_LANDMARKS,
  createCentralTowerGroup,
  createCityHallGroup,
  createGrandStationGroup,
} from '../../assets/city/landmarks/LandmarkModels'
import {
  getDamageGeometry,
  severityToDamageLevel,
  damagedConcreteMaterial,
  rubbleMaterial,
  rebarMaterial,
} from '../../assets/city/damage/DamageVisualSystem'

interface BuildingRendererProps {
  buildings: Building[]
  lodLevel?: 0 | 1 | 2
}

import { AssetBuilding } from './AssetBuilding'

/**
 * Deterministic hash for consistent variation
 */
function hashStr(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}

/**
 * Individual building mesh rendered via ProceduralBuildingFactory.
 * Renders immediately, synchronously — no async loading, no fallback grey box.
 */
export function ProceduralBuilding({
  building,
  isNight,
  isSelected,
  onSelect,
  lodLevel,
  damageSeverity,
}: {
  building: Building
  isNight: boolean
  isSelected: boolean
  onSelect: (id: string) => void
  lodLevel: 0 | 1 | 2
  damageSeverity?: number
}) {
  const arch = useMemo(() => determineBuildingArchetype(building), [building])
  
  const h = building.height || 15
  const w = building.width || 20
  const d = building.depth || 20

  const damageLevel = damageSeverity ? severityToDamageLevel(damageSeverity) : 0
  const isDamaged = damageLevel > 0

  const geom = useMemo(() => {
    if (isDamaged) {
      return getDamageGeometry(w, d, h, damageLevel as 1 | 2 | 3) as any
    }
    return getBuildingGeometry(building, arch)
  }, [building, arch, isDamaged, damageLevel, w, d, h])

  const mats = useMemo(() => {
    if (isDamaged) {
      return { body: damagedConcreteMaterial, details: rubbleMaterial, accent: rebarMaterial }
    }
    return getMaterialForArchetype(arch, isNight)
  }, [arch, isNight, isDamaged])

  const rotY = useMemo(() => {
    const hashVal = hashStr(building.id || `${building.x}_${building.z}`)
    return (hashVal % 4) * (Math.PI / 2)
  }, [building.id, building.x, building.z])

  return (
    <group
      position={[building.x, 0, building.z]}
      rotation={[0, rotY, 0]}
      onClick={(e) => {
        e.stopPropagation()
        onSelect(building.id)
      }}
    >
      {/* Selection highlight wireframe */}
      {isSelected && (
        <mesh position={[0, h / 2, 0]}>
          <boxGeometry args={[w * 1.1, h * 1.05, d * 1.1]} />
          <meshBasicMaterial color="#00E5FF" wireframe />
        </mesh>
      )}

      {/* Main body geometry */}
      <mesh geometry={geom.body} material={mats.body} castShadow receiveShadow />

      {/* Architectural details or debris */}
      {isDamaged ? (
        geom.debris && <mesh geometry={geom.debris} material={mats.details} castShadow />
      ) : (
        lodLevel < 2 && geom.details && (
          <mesh geometry={geom.details} material={mats.details} castShadow />
        )
      )}

      {/* Rooftop / crane / spire — only in LOD 0 */}
      {!isDamaged && lodLevel === 0 && geom.spireOrCrane && (
        <mesh
          geometry={geom.spireOrCrane}
          material={mats.accent || mats.details}
          castShadow
        />
      )}
    </group>
  )
}

/**
 * High-Performance Building Renderer
 *
 * Architecture:
 * - ALL buildings render via ProceduralBuildingFactory synchronously (zero async, zero grey boxes)
 * - Geometry is cached per (archetype, w, d, h) bucket — no redundant allocations
 * - LOD 0: Full details + spires/cranes
 * - LOD 1: Body + details only (no spires)
 * - LOD 2: Body only (simple massing)
 * - Hero landmarks overlay 3 special procedural groups
 */
export function BuildingRenderer({ buildings, lodLevel = 0 }: BuildingRendererProps) {
  const districts = useSimulationStore(selectDistricts)
  const disasters = useSimulationStore(selectDisasters)
  const simHour = useSimulationStore((s) => s.cityState?.simHour ?? 12)
  const timeOfDay = useSimulationStore((s) => s.timeOfDay)
  const selectedBuildingId = useSimulationStore((s) => s.selectedBuildingId)
  const setSelectedBuilding = useSimulationStore((s) => s.setSelectedBuilding)

  const damagedBuildingMap = useMemo(() => {
    const map = new Map<string, number>() // buildingId -> severity
    if (disasters?.incidents) {
      disasters.incidents.forEach(inc => {
        if (inc.status === 'ACTIVE' || inc.status === 'CONTAINED' || inc.status === 'RECOVERING') {
          inc.affected_building_ids?.forEach(bid => {
            map.set(bid, Math.max(map.get(bid) || 0, inc.severity))
          })
        }
      })
    }
    return map
  }, [disasters])

  const isNight = useMemo(() => {
    if (timeOfDay === 'night') return true
    if (timeOfDay === 'day' || timeOfDay === 'sunset') return false
    return simHour < 6.0 || simHour >= 20.0
  }, [simHour, timeOfDay])

  // Group buildings by archetype category for organized rendering
  const categorizedBuildings = useMemo(() => {
    const map: Record<ArchetypeCategory, Building[]> = {
      skyscraper: [],
      apartment_high: [],
      apartment_mid: [],
      suburban_house: [],
      warehouse: [],
      factory: [],
      hospital: [],
      school: [],
      construction: [],
      commercial_retail: [],
      government: [],
      transit_hub: [],
      park_pavilion: [],
    }

    buildings.forEach((b) => {
      const arch = determineBuildingArchetype(b)
      if (map[arch]) {
        map[arch].push(b)
      } else {
        map.suburban_house.push(b)
      }
    })

    return map
  }, [buildings])

  // Render hero landmarks
  const landmarkMeshes = useMemo(() => {
    return METACITY_LANDMARKS.map((lm) => {
      let content: THREE.Group
      if (lm.type === 'central_tower') {
        content = createCentralTowerGroup(isNight)
      } else if (lm.type === 'city_hall') {
        content = createCityHallGroup()
      } else {
        content = createGrandStationGroup()
      }

      return (
        <primitive
          key={lm.id}
          object={content}
          position={[lm.x, 0, lm.z]}
        />
      )
    })
  }, [isNight])

  const archetypes: ArchetypeCategory[] = [
    'skyscraper',
    'apartment_high',
    'apartment_mid',
    'suburban_house',
    'warehouse',
    'factory',
    'hospital',
    'school',
    'construction',
    'commercial_retail',
    'government',
    'transit_hub',
    'park_pavilion',
  ]

  return (
    <group name="building_rendering_layer">
      {/* 1. Hero Landmarks — always rendered at full detail */}
      <group name="landmarks_group">{landmarkMeshes}</group>

      {/* 2. All Buildings — grouped by archetype, using Asset Pipeline with Procedural Fallback */}
      {archetypes.map((arch) => {
        const list = categorizedBuildings[arch]
        if (!list || list.length === 0) return null

        return (
          <group key={arch} name={`archetype_${arch}`}>
            {list.map((b) => (
              <AssetBuilding
                key={b.id}
                building={b}
                isNight={isNight}
                isSelected={b.id === selectedBuildingId}
                onSelect={(id) => setSelectedBuilding(id)}
                lodLevel={lodLevel}
                damageSeverity={damagedBuildingMap.get(b.id)}
              />
            ))}
          </group>
        )
      })}
    </group>
  )
}
