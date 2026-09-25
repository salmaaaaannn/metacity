import React, { useMemo, useState, useEffect } from 'react'
import * as THREE from 'three'
import { useSimulationStore } from '../../store/simulationStore'
import type { InfrastructureItem } from '../../types/city'
import { loadGLTFModel, getCachedModelSync } from '../../assets/GLTFAssetCache'
import { cityApi } from '../../api/cityApi'

const INFRA_ASSET_MAP: Record<string, string> = {
  hospital: '/assets/buildings/civic/hospital_center.glb',
  school: '/assets/buildings/civic/high_school.glb',
  police: '/assets/buildings/civic/police_station.glb',
  fire: '/assets/buildings/civic/fire_station.glb',
  power_plant: '/assets/environment/power_plant.glb',
  water_plant: '/assets/environment/water_tower.glb',
  solar_farm: '/assets/environment/power_plant.glb',
  recycling: '/assets/buildings/industrial/distribution_warehouse.glb',
  residential: '/assets/buildings/residential/modern_apartment_complex.glb',
  commercial: '/assets/buildings/commercial/shopping_mall.glb',
  office: '/assets/buildings/office/office_glass_tower.glb',
  industrial: '/assets/buildings/industrial/distribution_warehouse.glb',
  park: '/assets/environment/fountain.glb',
  metro_station: '/assets/transit/metro_station_modern.glb',
  bus_stop: '/assets/transit/bus_shelter.glb',
}

function PointInfrastructureMesh({
  item,
  isSelected,
  onClick,
}: {
  item: InfrastructureItem
  isSelected: boolean
  onClick: (item: InfrastructureItem) => void
}) {
  const assetPath = INFRA_ASSET_MAP[item.itemType] || '/assets/buildings/civic/police_station.glb'
  const [modelGroup, setModelGroup] = useState<THREE.Group | null>(() => getCachedModelSync(assetPath) || null)
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    let active = true
    loadGLTFModel(assetPath, 'civic', item.id).then((g) => {
      if (active) setModelGroup(g)
    })
    return () => {
      active = false
    }
  }, [assetPath, item.id])

  const serviceRadius = item.serviceRadius || 600

  return (
    <group
      position={[item.x, 0, item.z]}
      onClick={(e) => {
        e.stopPropagation()
        onClick(item)
      }}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
      }}
      onPointerOut={() => setHovered(false)}
    >
      {/* 3D Model Instance */}
      {modelGroup ? (
        <primitive object={modelGroup} />
      ) : (
        <mesh position={[0, 10, 0]} castShadow>
          <boxGeometry args={[30, 20, 30]} />
          <meshStandardMaterial
            color={item.itemType === 'hospital' ? '#EF4444' : item.itemType === 'school' ? '#3B82F6' : '#10B981'}
            roughness={0.4}
          />
        </mesh>
      )}

      {/* Selected Indicator Ring & Bounding Wireframe */}
      {isSelected && (
        <mesh position={[0, 15, 0]}>
          <boxGeometry args={[35, 30, 35]} />
          <meshBasicMaterial color="#38BDF8" wireframe />
        </mesh>
      )}

      {/* Service Radius Indicator Ring when hovered or selected */}
      {(isSelected || hovered) && (
        <mesh position={[0, 0.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[serviceRadius - 4, serviceRadius, 64]} />
          <meshBasicMaterial
            color={item.itemType === 'hospital' ? '#EF4444' : '#3B82F6'}
            transparent
            opacity={0.35}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  )
}

function LinearInfrastructureMesh({
  item,
  isSelected,
  onClick,
}: {
  item: InfrastructureItem
  isSelected: boolean
  onClick: (item: InfrastructureItem) => void
}) {
  const [hovered, setHovered] = useState(false)

  const sx = item.x
  const sz = item.z
  const ex = item.endX ?? item.x
  const ez = item.endZ ?? item.z

  const dx = ex - sx
  const dz = ez - sz
  const length = Math.sqrt(dx * dx + dz * dz)
  const midX = (sx + ex) / 2
  const midZ = (sz + ez) / 2
  const angle = Math.atan2(dx, dz)

  const isBridge = item.itemType === 'bridge'
  const isHighway = item.itemType === 'highway'
  const isMetro = item.itemType === 'metro_line'

  const width = isHighway ? 24 : isBridge ? 20 : isMetro ? 10 : 14
  const height = isBridge ? 8 : isMetro ? 6 : 0.6
  const posY = isBridge ? 4.5 : isMetro ? 3.5 : 0.35

  const deckColor = isBridge ? '#94A3B8' : isMetro ? '#475569' : isHighway ? '#1E293B' : '#334155'

  return (
    <group
      onClick={(e) => {
        e.stopPropagation()
        onClick(item)
      }}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
      }}
      onPointerOut={() => setHovered(false)}
    >
      {/* Road / Bridge Deck */}
      <mesh position={[midX, posY, midZ]} rotation={[0, angle, 0]} receiveShadow castShadow>
        <boxGeometry args={[width, height, length]} />
        <meshStandardMaterial
          color={deckColor}
          roughness={0.8}
          metalness={0.1}
          emissive={isSelected || hovered ? '#38BDF8' : '#000000'}
          emissiveIntensity={isSelected ? 0.3 : hovered ? 0.15 : 0}
        />
      </mesh>

      {/* Bridge Support Piers if elevated over river or valley */}
      {isBridge && (
        <>
          <mesh position={[sx, 2.5, sz]}>
            <cylinderGeometry args={[3, 3.5, 6, 12]} />
            <meshStandardMaterial color="#64748B" roughness={0.9} />
          </mesh>
          <mesh position={[midX, 2.5, midZ]}>
            <cylinderGeometry args={[3, 3.5, 6, 12]} />
            <meshStandardMaterial color="#64748B" roughness={0.9} />
          </mesh>
          <mesh position={[ex, 2.5, ez]}>
            <cylinderGeometry args={[3, 3.5, 6, 12]} />
            <meshStandardMaterial color="#64748B" roughness={0.9} />
          </mesh>
        </>
      )}

      {/* Metro Overhead Catenary Poles if metro_line */}
      {isMetro && (
        <mesh position={[midX, posY + 4, midZ]} rotation={[0, angle, 0]}>
          <boxGeometry args={[width * 1.1, 0.4, length]} />
          <meshBasicMaterial color="#0284C7" />
        </mesh>
      )}
    </group>
  )
}

export function InfrastructureLayer() {
  const infrastructureList = useSimulationStore((s) => s.infrastructureList)
  const selectedInfrastructureId = useSimulationStore((s) => s.selectedInfrastructureId)
  const setSelectedInfrastructure = useSimulationStore((s) => s.setSelectedInfrastructure)
  const selectedTool = useSimulationStore((s) => s.selectedTool)
  const removeInfrastructureItem = useSimulationStore((s) => s.removeInfrastructureItem)
  const cityState = useSimulationStore((s) => s.cityState)
  const setCityState = useSimulationStore((s) => s.setCityState)

  const handleClick = async (item: InfrastructureItem) => {
    // If Demolish Tool is selected, execute immediate demolition with confirmation
    if (selectedTool === 'demolish') {
      const confirmed = window.confirm(`Demolish ${item.name} (${item.itemType})?`)
      if (!confirmed) return

      const res = await cityApi.demolishInfrastructure(item.id)
      if (res.success) {
        removeInfrastructureItem(item.id)
        if (selectedInfrastructureId === item.id) {
          setSelectedInfrastructure(null)
        }
        if (cityState && res.remainingBalance !== undefined) {
          setCityState({
            ...cityState,
            budget: {
              ...cityState.budget,
              balance: res.remainingBalance,
            },
          })
        }
      }
      return
    }

    // Otherwise select the item for inspection
    setSelectedInfrastructure(item.id)
  }

  const { pointItems, linearItems } = useMemo(() => {
    const point: InfrastructureItem[] = []
    const linear: InfrastructureItem[] = []

    for (const it of infrastructureList) {
      if (['road', 'highway', 'bridge', 'metro_line'].includes(it.itemType) && it.endX !== undefined && it.endZ !== undefined) {
        linear.push(it)
      } else {
        point.push(it)
      }
    }
    return { pointItems: point, linearItems: linear }
  }, [infrastructureList])

  return (
    <group name="infrastructure_layer">
      {linearItems.map((item) => (
        <LinearInfrastructureMesh
          key={item.id}
          item={item}
          isSelected={selectedInfrastructureId === item.id}
          onClick={handleClick}
        />
      ))}
      {pointItems.map((item) => (
        <PointInfrastructureMesh
          key={item.id}
          item={item}
          isSelected={selectedInfrastructureId === item.id}
          onClick={handleClick}
        />
      ))}
    </group>
  )
}
