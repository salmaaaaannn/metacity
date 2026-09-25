import React, { useMemo, useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useSimulationStore, selectTransitLines, selectTransitStations } from '../../store/simulationStore'
import type { MetroStation } from '../../types/city'
import {
  createRailwayTrackGroup,
  createRailwayStationGroup,
} from '../../assets/city/railway/RailwayGeometries'
import { loadGLTFModel, getCachedModelSync } from '../../assets/GLTFAssetCache'

/**
 * Animated Heavy Rail Train with Locomotive and Passenger Coach
 */
function RailwayTrain({ route }: { route: Array<[number, number]> }) {
  const trainRef = useRef<THREE.Group>(null)
  const [locoGroup, setLocoGroup] = useState<THREE.Group | null>(() => {
    return getCachedModelSync('/assets/railway/trains/railway_locomotive.glb') || null
  })
  const [coachGroup, setCoachGroup] = useState<THREE.Group | null>(() => {
    return getCachedModelSync('/assets/railway/trains/railway_passenger_car.glb') || null
  })

  useEffect(() => {
    let active = true
    Promise.all([
      loadGLTFModel('/assets/railway/trains/railway_locomotive.glb', 'railway'),
      loadGLTFModel('/assets/railway/trains/railway_passenger_car.glb', 'railway'),
    ]).then(([loco, coach]) => {
      if (active) {
        setLocoGroup(loco)
        setCoachGroup(coach)
      }
    })
    return () => {
      active = false
    }
  }, [])

  const pathCurve = useMemo(() => {
    if (route.length < 2) return null
    const pts = route.map(([x, z]) => new THREE.Vector3(x, 0.4, z))
    return new THREE.CatmullRomCurve3(pts)
  }, [route])

  useFrame(({ clock }) => {
    if (!trainRef.current || !pathCurve) return
    const t = (clock.getElapsedTime() * 0.025) % 1.0
    const pos = pathCurve.getPointAt(t)
    const tangent = pathCurve.getTangentAt(t)
    trainRef.current.position.copy(pos)
    const angle = Math.atan2(tangent.x, tangent.z)
    trainRef.current.rotation.y = angle
  })

  if (!pathCurve) return null

  return (
    <group ref={trainRef}>
      {/* 1. Electric Locomotive */}
      <group position={[0, 0, 0]}>
        {locoGroup ? (
          <primitive object={locoGroup.clone()} />
        ) : (
          <mesh position={[0, 2.5, 0]}>
            <boxGeometry args={[4.2, 4.0, 22]} />
            <meshStandardMaterial color="#C62828" roughness={0.3} metalness={0.7} />
          </mesh>
        )}
      </group>

      {/* 2. Trailing Passenger Coach */}
      <group position={[0, 0, -25]}>
        {coachGroup ? (
          <primitive object={coachGroup.clone()} />
        ) : (
          <mesh position={[0, 2.5, 0]}>
            <boxGeometry args={[4.0, 3.8, 22]} />
            <meshStandardMaterial color="#ECEFF1" roughness={0.4} metalness={0.8} />
          </mesh>
        )}
      </group>
    </group>
  )
}

/**
 * Dedicated Realistic Heavy Railway Layer
 * Renders the city's heavy rail line with:
 * - Dual steel rails, timber sleepers (ties), and crushed-stone ballast bed
 * - Overhead electrification catenary masts with cantilever arms
 * - Realistic station platforms with passenger canopies and tactile safety edges
 * - Operational electric locomotive and passenger train set
 */
export function RailwayLayer() {
  const transitLines = useSimulationStore(selectTransitLines)
  const transitStations = useSimulationStore(selectTransitStations)
  const setSelectedInfrastructure = useSimulationStore((s) => s.setSelectedInfrastructure)

  // Find railway lines
  const railLines = useMemo(() => {
    return transitLines.filter(
      (line) => line.type === 'railway' || line.name?.toLowerCase().includes('railway')
    )
  }, [transitLines])

  // Find railway stations
  const railStations = useMemo(() => {
    const list: MetroStation[] = []
    railLines.forEach((line) => {
      if (line.stations) {
        list.push(...line.stations)
      }
    })
    if (transitStations.length > 0) {
      transitStations.forEach((st: MetroStation) => {
        if ((st as any).type === 'railway' || (st as any).station_type === 'railway') {
          if (!list.some((s) => s.id === st.id)) list.push(st)
        }
      })
    }
    return list
  }, [railLines, transitStations])

  return (
    <group name="railway_network_layer">
      {/* 1. Track Networks & Operational Trains */}
      {railLines.map((line) => {
        const points = (line.route || []).map(([x, z]) => new THREE.Vector3(x, 0, z))
        if (points.length < 2) return null

        const trackGroup = createRailwayTrackGroup(points)

        return (
          <group key={line.id}>
            {/* Ballast, Sleepers, Steel Rails & Catenaries */}
            <primitive object={trackGroup} />

            {/* Locomotive & Passenger Train */}
            <RailwayTrain route={line.route} />
          </group>
        )
      })}

      {/* 2. Railway Stations */}
      {railStations.map((st: MetroStation) => {
        const stationGroup = createRailwayStationGroup(st.name || 'Railway Station')

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
}
