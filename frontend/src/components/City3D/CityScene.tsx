import React, { useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { Sky } from '@react-three/drei'
import * as THREE from 'three'
import { useSimulationStore } from '../../store/simulationStore'
import { CameraController } from '../../systems/camera/CameraController'
import { GroundPlane } from './GroundPlane'
import { ChunkManager } from '../../systems/world/ChunkManager'
import { CitizenLayer } from './CitizenLayer'
import { RoadNetwork } from './RoadNetwork'
import { MetroLines } from './MetroLines'
import { RailwayLayer } from './RailwayLayer'
import { DistrictOverlay } from './DistrictOverlay'
import { VehicleLayer } from './VehicleLayer'
import { StreetFurnitureLayer } from './StreetFurnitureLayer'
import { VegetationLayer } from './VegetationLayer'
import { VisualDebugOverlay } from './VisualDebugOverlay'
import { PlacementGhost } from './PlacementGhost'
import { PlacementController } from './PlacementController'
import { InfrastructureLayer } from './InfrastructureLayer'
import { LandmarkLabels } from './LandmarkLabels'
import { DisasterVisualLayer } from './DisasterVisualLayer'
import { AirportLayer } from './AirportLayer'


/**
 * Lighting & Environment Rig with Dynamic Day/Night Cycle
 * Computes sun angle, atmospheric sky scattering, and ambient lighting based on sim_hour.
 */
function EnvironmentRig() {
  const simHour = useSimulationStore((s) => s.cityState?.simHour ?? 12)
  const timeOfDay = useSimulationStore((s) => s.timeOfDay)

  // Effective hour taking manual override into account
  const currentHour = useMemo(() => {
    if (timeOfDay === 'day') return 12
    if (timeOfDay === 'sunset') return 19
    if (timeOfDay === 'night') return 23
    return simHour
  }, [simHour, timeOfDay])

  // Sun position calculation across 24 hours
  // 6:00 = Sunrise, 12:00 = Noon (zenith), 18:00 = Sunset, 24:00 = Midnight
  const sunElevation = Math.sin(((currentHour - 6) / 24) * Math.PI * 2)
  const sunAzimuth = Math.cos(((currentHour - 6) / 24) * Math.PI * 2)

  const sunX = sunAzimuth * 4000 + 4000
  const sunY = Math.max(10, sunElevation * 2500)
  const sunZ = sunAzimuth * 3000 + 4000

  const isNight = currentHour < 5.5 || currentHour >= 20.5
  const isDusk = (currentHour >= 18.0 && currentHour < 20.5) || (currentHour >= 5.5 && currentHour < 7.0)

  // Lighting parameters
  const sunColor = isDusk ? '#FFA726' : isNight ? '#5C6BC0' : '#FFFDE7'
  const sunIntensity = isNight ? 0.25 : isDusk ? 0.85 : 1.4
  const ambientIntensity = isNight ? 0.2 : isDusk ? 0.45 : 0.65
  const ambientColor = isNight ? '#1A237E' : isDusk ? '#FFE0B2' : '#FFFFFF'

  return (
    <>
      {/* Sky atmospheric dome */}
      <Sky
        distance={450000}
        sunPosition={[sunX - 4000, sunY, sunZ - 4000]}
        inclination={isNight ? 0.95 : 0.6}
        azimuth={0.25}
        turbidity={isDusk ? 12 : 8}
        rayleigh={isDusk ? 4 : 1.5}
      />

      {/* Global Ambient Fill */}
      <ambientLight color={ambientColor} intensity={ambientIntensity} />

      {/* Main Directional Sunlight / Moonlight */}
      <directionalLight
        position={[sunX, sunY, sunZ]}
        intensity={sunIntensity}
        color={sunColor}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={12000}
        shadow-camera-left={-4000}
        shadow-camera-right={4000}
        shadow-camera-top={4000}
        shadow-camera-bottom={-4000}
      />

      {/* Secondary Soft Hemisphere Light (Ground reflection) */}
      <hemisphereLight
        args={[
          isNight ? '#0D47A1' : '#E3F2FD',
          isNight ? '#000000' : '#4E342E',
          isNight ? 0.15 : 0.35,
        ]}
      />
    </>
  )
}

function FogRig() {
  const simHour = useSimulationStore((s) => s.cityState?.simHour ?? 12)
  const timeOfDay = useSimulationStore((s) => s.timeOfDay)
  const isNight = timeOfDay === 'night' || (timeOfDay === 'auto' && (simHour < 5.5 || simHour >= 20.5))
  const isDusk = timeOfDay === 'sunset' || (timeOfDay === 'auto' && ((simHour >= 18.0 && simHour < 20.5) || (simHour >= 5.5 && simHour < 7.0)))

  const fogColor = isNight ? '#0B0F19' : isDusk ? '#E08E45' : '#D0E3FF'
  return <fog attach="fog" args={[fogColor, 2500, 15000]} />
}

/**
 * Main 3D City Scene
 * Integrates all realistic modular layers into a performant digital twin world.
 */
export function CityScene() {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas
        camera={{ fov: 45, position: [5000, 1000, 5000], near: 1, far: 25000 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.15 }}
      >
        {/* Dynamic Day/Night Lighting & Environment */}
        <EnvironmentRig />
        <FogRig />

        {/* Camera Control System (Isometric & Street-Level) */}
        <CameraController />

        {/* Terrain, Zoned District Plates & Animated River */}
        <GroundPlane />

        {/* Modular Architectural Buildings */}
        <ChunkManager />

        {/* 3D Roads, Highways & Bridges */}
        <RoadNetwork />

        {/* Rapid Transit Metro Guideways & Stations */}
        <MetroLines />

        {/* Heavy Railway Network */}
        <RailwayLayer />

        {/* Physical Infrastructure & Constructed Facilities */}
        <InfrastructureLayer />

        {/* Street Furniture (Streetlights, Traffic Signals, Benches) */}
        <StreetFurnitureLayer />

        {/* Vegetation & Public Parks */}
        <VegetationLayer />

        {/* Autonomous AI Citizen Sprites */}
        <CitizenLayer />

        {/* Multi-Class Vehicle Fleet */}
        <VehicleLayer />

        {/* Floating Landmark Badges */}
        <LandmarkLabels />

        {/* Dynamic Multi-Hazard Disaster Simulation & Response Visual Layer */}
        <DisasterVisualLayer />

        {/* Airport Complex — terminal, runways, control tower, aircraft */}
        <AirportLayer />

        {/* District Demographic & Zoning Overlay */}
        <DistrictOverlay />


        {/* Developer Visual Debug Mode (Chunk grid, road graph - Off by default) */}
        <VisualDebugOverlay />

        {/* Infrastructure Editor & Construction Controller */}
        <PlacementGhost />
        <PlacementController />
      </Canvas>
    </div>
  )
}
