import React, { useMemo, useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useSimulationStore, selectTransitLines, selectInfrastructureList } from '../../store/simulationStore'
import {
  createElevatedMetroGuideway,
  createModernElevatedStation,
  createUndergroundMetroEntrance,
} from '../../assets/city/metro/MetroGeometries'
import { createBusStopShelterGroup } from '../../assets/city/buses/BusModels'
import { loadGLTFModel, getCachedModelSync } from '../../assets/GLTFAssetCache'

/**
 * Animated Metro Train traversing an elevated line
 */
function MetroTrain({ route }: { route: Array<[number, number]> }) {
  const trainRef = useRef<THREE.Group>(null)
  const [modelGroup, setModelGroup] = useState<THREE.Group | null>(() => {
    return getCachedModelSync('/assets/metro/trains/metro_train_car.glb') || null
  })

  useEffect(() => {
    let active = true
    loadGLTFModel('/assets/metro/trains/metro_train_car.glb', 'metro').then((g) => {
      if (active) setModelGroup(g)
    })
    return () => {
      active = false
    }
  }, [])

  const pathCurve = useMemo(() => {
    if (route.length < 2) return null
    const pts = route.map(([x, z]) => new THREE.Vector3(x, 6.2, z))
    return new THREE.CatmullRomCurve3(pts)
  }, [route])

  useFrame(({ clock }) => {
    if (!trainRef.current || !pathCurve) return
    const t = (clock.getElapsedTime() * 0.04) % 1.0
    const pos = pathCurve.getPointAt(t)
    const tangent = pathCurve.getTangentAt(t)
    trainRef.current.position.copy(pos)
    const angle = Math.atan2(tangent.x, tangent.z)
    trainRef.current.rotation.y = angle
  })

  if (!pathCurve) return null

  return (
    <group ref={trainRef}>
      {modelGroup ? (
        <primitive object={modelGroup.clone()} />
      ) : (
        <mesh position={[0, 1.5, 0]}>
          <boxGeometry args={[3.8, 3.2, 18]} />
          <meshStandardMaterial color="#00BCD4" roughness={0.3} metalness={0.8} />
        </mesh>
      )}
    </group>
  )
}

/**
 * Realistic Metro & Rapid Transit System
 * Integrates:
 * - Elevated precast concrete guideway beams with cylindrical T-piers
 * - Modern aerial stations with curved glass canopy roofs, screen doors, and LED signs
 * - Underground metro street entrance portals with glass canopies and illuminated totems
 * - Active animated rapid transit metro trains traversing routes
 * - Detailed modern glass bus shelters with benches and timetable signs
 */
export function MetroLines() {
  const transitLines = useSimulationStore(selectTransitLines)
  const infraItems = useSimulationStore(selectInfrastructureList)
  const setSelectedInfrastructure = useSimulationStore((s) => s.setSelectedInfrastructure)
  const simHour = useSimulationStore((s) => s.cityState?.simHour ?? 12)
  const timeOfDay = useSimulationStore((s) => s.timeOfDay)

  const isNight = useMemo(() => {
    if (timeOfDay === 'night') return true
    if (timeOfDay === 'day' || timeOfDay === 'sunset') return false
    return simHour < 6.0 || simHour >= 20.0
  }, [simHour, timeOfDay])

  // Filter metro lines (exclude heavy railway lines)
  const metroLines = useMemo(() => {
    return transitLines.filter(
      (line) => line.type !== 'railway' && !line.name?.toLowerCase().includes('railway')
    )
  }, [transitLines])

  // Dynamically constructed metro stations and bus stops
  const dynamicStations = useMemo(() => {
    return infraItems.filter((it) => it.itemType === 'metro_station' || it.itemType === 'bus_stop')
  }, [infraItems])

  return (
    <group name="transit_metro_layer">
      {/* 1. Metro Lines (Elevated Guideways + Stations + Animated Trains) */}
      {metroLines.map((line) => {
        const points = (line.route || []).map(([x, z]) => new THREE.Vector3(x, 0, z))
        if (points.length < 2) return null

        const lineColor = line.color || '#00BCD4'
        const guidewayGroup = createElevatedMetroGuideway(points, 6.0, lineColor)

        return (
          <group key={line.id}>
            {/* Elevated Concrete Guideway */}
            <primitive object={guidewayGroup} />

            {/* Animated Metro Train running on this route */}
            <MetroTrain route={line.route} />

            {/* Stations on this Line */}
            {line.stations.map((st, idx) => {
              const isUnderground = idx % 3 === 0
              const stationGroup = isUnderground
                ? createUndergroundMetroEntrance(st.name || 'Metro Station', lineColor, isNight)
                : createModernElevatedStation(st.name || 'Metro Station', lineColor, isNight)

              return (
                <group
                  key={st.id}
                  position={[st.x, 0, st.z]}
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedInfrastructure(st.id)
                  }}
                >
                  <primitive object={stationGroup} />
                </group>
              )
            })}
          </group>
        )
      })}

      {/* 2. Dynamically Constructed Stations & Bus Stops */}
      {dynamicStations.map((st) => {
        const isMetro = st.itemType === 'metro_station'
        const color = isMetro ? '#00E5FF' : '#FFD600'

        const content = isMetro
          ? createModernElevatedStation(st.name || 'Metro Station', color, isNight)
          : createBusStopShelterGroup()

        return (
          <group
            key={st.id}
            position={[st.x, 0, st.z]}
            onClick={(e) => {
              e.stopPropagation()
              setSelectedInfrastructure(st.id)
            }}
          >
            <primitive object={content} />
          </group>
        )
      })}
    </group>
  )
}
