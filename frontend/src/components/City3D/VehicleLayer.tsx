import React, { useMemo, useState, useEffect } from 'react'
import * as THREE from 'three'
import { useSimulationStore, selectVehicles } from '../../store/simulationStore'
import type { VehiclePosition } from '../../types/city'
import { loadGLTFModel, getCachedModelSync } from '../../assets/GLTFAssetCache'
import { hashString } from '../../assets/AssetRegistry'

const VEHICLE_ASSET_PATHS = {
  sedan_blue: '/assets/vehicles/cars/sedan_blue.glb',
  sedan_red: '/assets/vehicles/cars/sedan_red.glb',
  taxi: '/assets/vehicles/cars/taxi_01.glb',
  suv: '/assets/vehicles/cars/suv_01.glb',
  van: '/assets/vehicles/cars/van_01.glb',
  bus: '/assets/vehicles/buses/city_bus.glb',
  delivery_truck: '/assets/vehicles/trucks/delivery_truck.glb',
  heavy_truck: '/assets/vehicles/trucks/heavy_truck.glb',
  police: '/assets/vehicles/police/police_car.glb',
  ambulance: '/assets/vehicles/ambulance/ambulance.glb',
  fire: '/assets/vehicles/fire/fire_truck.glb',
}

function getVehicleAssetKey(v: VehiclePosition): keyof typeof VEHICLE_ASSET_PATHS {
  if (v.type === 'bus') return 'bus'
  if (v.type === 'police') return 'police'
  if (v.type === 'ambulance') return 'ambulance'
  if (v.type === 'fire') return 'fire'
  if (v.type === 'truck') return 'heavy_truck'

  const hash = hashString(v.id)
  const rem = hash % 20

  if (rem === 0) return 'police'
  if (rem === 1) return 'ambulance'
  if (rem === 2) return 'fire'
  if (rem === 3 || rem === 4) return 'delivery_truck'
  if (rem === 5) return 'heavy_truck'
  if (rem === 6 || rem === 7) return 'taxi'
  if (rem === 8 || rem === 9 || rem === 10) return 'suv'
  if (rem === 11) return 'van'
  if (rem % 2 === 0) return 'sedan_blue'
  return 'sedan_red'
}

/**
 * Individual 3D Vehicle Instance
 */
function VehicleInstance({
  vehicle,
  isNight,
}: {
  vehicle: VehiclePosition
  isNight: boolean
}) {
  const assetKey = useMemo(() => getVehicleAssetKey(vehicle), [vehicle])
  const assetPath = VEHICLE_ASSET_PATHS[assetKey]

  const [modelGroup, setModelGroup] = useState<THREE.Group | null>(() => {
    return getCachedModelSync(assetPath) || null
  })

  useEffect(() => {
    let active = true
    loadGLTFModel(assetPath, 'vehicles').then((g) => {
      if (active) setModelGroup(g)
    })
    return () => {
      active = false
    }
  }, [assetPath])

  const rotationY = vehicle.heading ?? 0

  return (
    <group position={[vehicle.x, 0, vehicle.z]} rotation={[0, rotationY, 0]}>
      {modelGroup ? (
        <primitive object={modelGroup.clone()} />
      ) : (
        /* Fallback car mesh */
        <mesh position={[0, 0.75, 0]}>
          <boxGeometry args={[2.2, 1.2, 4.8]} />
          <meshStandardMaterial color="#1E88E5" roughness={0.3} metalness={0.7} />
        </mesh>
      )}

      {/* Nighttime Headlight Beam Projection */}
      {isNight && (
        <group position={[0, 0.8, 2.5]}>
          <pointLight color="#FFFDE7" intensity={2.0} distance={25} decay={2} />
        </group>
      )}
    </group>
  )
}

/**
 * Realistic Modular Vehicle Layer
 * Multi-class fleet: Sedans, SUVs, Taxis, Vans, Trucks, Police, Ambulances, Fire Engines, Buses.
 * Deterministic vehicle model assignment, realistic materials, and nighttime lighting.
 */
export function VehicleLayer() {
  const vehicles = useSimulationStore(selectVehicles)
  const simHour = useSimulationStore((s) => s.cityState?.simHour ?? 12)
  const timeOfDay = useSimulationStore((s) => s.timeOfDay)

  const isNight = useMemo(() => {
    if (timeOfDay === 'night') return true
    if (timeOfDay === 'day' || timeOfDay === 'sunset') return false
    return simHour < 6.0 || simHour >= 20.0
  }, [simHour, timeOfDay])

  return (
    <group name="vehicle_simulation_layer">
      {vehicles.map((v) => (
        <VehicleInstance key={v.id} vehicle={v} isNight={isNight} />
      ))}
    </group>
  )
}