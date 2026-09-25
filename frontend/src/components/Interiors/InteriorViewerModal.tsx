import React, { useMemo, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { useSimulationStore } from '../../store/simulationStore'
import {
  createOfficeInterior,
  createHospitalInterior,
  createSchoolInterior,
  createShopInterior,
  createHomeInterior,
} from './InteriorScenes'

// Module-level scene cache so Three.js groups are created once per archetype
const interiorSceneCache: Record<string, THREE.Group> = {}

function getCachedInteriorScene(type: string): THREE.Group {
  if (!interiorSceneCache[type]) {
    switch (type) {
      case 'hospital':
        interiorSceneCache[type] = createHospitalInterior()
        break
      case 'school':
        interiorSceneCache[type] = createSchoolInterior()
        break
      case 'shop':
        interiorSceneCache[type] = createShopInterior()
        break
      case 'home':
        interiorSceneCache[type] = createHomeInterior()
        break
      case 'office':
      default:
        interiorSceneCache[type] = createOfficeInterior()
        break
    }
  }
  return interiorSceneCache[type].clone()
}

interface ModalContentProps {
  buildingId: string
}

function InteriorViewerModalContent({ buildingId }: ModalContentProps) {
  const setInteriorBuilding = useSimulationStore((s) => s.setInteriorBuilding)

  // Stable single-building selector
  const building = useSimulationStore((s) =>
    s.cityState?.buildings ? s.cityState.buildings.find((b) => b.id === buildingId) ?? null : null
  )

  const districtId = building?.districtId
  const district = useSimulationStore((s) =>
    districtId && s.cityState?.districts ? s.cityState.districts.find((d) => d.id === districtId) ?? null : null
  )

  // Development diagnostics logging
  useEffect(() => {
    console.log(`[Interior] opened: ${buildingId}`)
    return () => {
      console.log(`[Interior] closed: ${buildingId}`)
    }
  }, [buildingId])

  // Determine interior archetype scene
  const { sceneGroup, archetypeTitle, description } = useMemo(() => {
    if (!building) {
      return {
        sceneGroup: getCachedInteriorScene('office'),
        archetypeTitle: 'Corporate Office Floor',
        description: 'Open-plan workstations, executive meeting room, and reception.',
      }
    }

    const bType = (building.building_type || building.type || '').toLowerCase()

    if (bType.includes('hospital') || bType.includes('medical') || bType.includes('clinic')) {
      return {
        sceneGroup: getCachedInteriorScene('hospital'),
        archetypeTitle: 'Metropolitan Hospital Ward & Emergency Triage',
        description: 'Triage reception desk, patient beds, and vital signs telemetry monitors.',
      }
    }

    if (bType.includes('school') || bType.includes('education') || bType.includes('university')) {
      return {
        sceneGroup: getCachedInteriorScene('school'),
        archetypeTitle: 'Educational Classroom & Lecture Hall',
        description: 'Student desks, teacher chalkboard, and interactive learning environment.',
      }
    }

    if (bType.includes('commercial') || bType.includes('retail') || bType.includes('shop') || bType.includes('store')) {
      return {
        sceneGroup: getCachedInteriorScene('shop'),
        archetypeTitle: 'Commercial Supermarket & Retail Store',
        description: 'Stocked merchandise aisles, product displays, and checkout registers.',
      }
    }

    if (bType.includes('residential') || bType.includes('house') || bType.includes('apartment')) {
      return {
        sceneGroup: getCachedInteriorScene('home'),
        archetypeTitle: 'Residential Apartment Living Suite',
        description: 'Furnished living room with TV, kitchen island, and bedroom suite.',
      }
    }

    // Default: Office
    return {
      sceneGroup: getCachedInteriorScene('office'),
      archetypeTitle: 'Corporate Office & Tech Workplace',
      description: 'Open-plan workstations with dual monitors, conference room, and water cooler.',
    }
  }, [building?.id, building?.building_type, building?.type])

  if (!building) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[80vh] bg-gray-900 border border-white/10 rounded-xl overflow-hidden shadow-2xl flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-950/80 border-b border-white/10">
          <div>
            <div className="flex items-center space-x-3">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                INTERIOR 3D TWIN
              </span>
              <h2 className="text-lg font-bold text-white tracking-wide">{archetypeTitle}</h2>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Building: <span className="text-gray-200 font-mono">{building.id}</span> • District:{' '}
              <span className="text-gray-200">{district?.name || 'Metropolitan Area'}</span> • Height:{' '}
              <span className="text-gray-200">{building.height || 15}m ({building.floors || 3} Floors)</span>
            </p>
          </div>

          <button
            onClick={() => setInteriorBuilding(null)}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-medium rounded-lg border border-white/10 transition-all flex items-center space-x-2"
          >
            <span>Exit to City View ✕</span>
          </button>
        </div>

        {/* 3D Interior Viewport */}
        <div className="flex-1 relative bg-gradient-to-b from-gray-950 to-gray-900">
          <Canvas
            camera={{ fov: 45, position: [0, 8, 16], near: 0.1, far: 100 }}
            gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
          >
            <ambientLight intensity={0.7} />
            <directionalLight position={[10, 15, 10]} intensity={1.2} castShadow />
            <hemisphereLight args={['#FFFFFF', '#37474F', 0.5]} />

            <OrbitControls
              enableDamping
              dampingFactor={0.05}
              maxPolarAngle={Math.PI / 2 - 0.05}
              minDistance={3}
              maxDistance={35}
            />

            <primitive object={sceneGroup} />
          </Canvas>

          {/* Description Overlay Bottom */}
          <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md p-3 rounded-lg border border-white/10 text-xs text-gray-300 flex justify-between items-center">
            <span>💡 <strong>Architectural Overview:</strong> {description}</span>
            <span className="text-gray-400 text-[11px]">Click & drag to orbit • Scroll to zoom</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Root Interior Viewer Modal
 * Only subscribes to the primitive `interiorBuildingId` and unmounts content completely when closed.
 * Completely immune to getSnapshot instability.
 */
export function InteriorViewerModal() {
  const interiorBuildingId = useSimulationStore((s) => s.interiorBuildingId)

  if (!interiorBuildingId) {
    return null
  }

  return <InteriorViewerModalContent buildingId={interiorBuildingId} />
}
