import React from 'react'
import { Html } from '@react-three/drei'
import { METACITY_LANDMARKS } from '../../assets/city/landmarks/LandmarkModels'
import { useSimulationStore } from '../../store/simulationStore'

export function LandmarkLabels() {
  const streetViewMode = useSimulationStore((s) => s.streetViewMode)
  const setSelectedDistrict = useSimulationStore((s) => s.setSelectedDistrict)

  if (streetViewMode) return null

  return (
    <group name="landmark_labels">
      {METACITY_LANDMARKS.map((lm) => {
        const height = lm.type === 'central_tower' ? 145 : lm.type === 'grand_hospital' ? 45 : 35
        const icon =
          lm.type === 'central_tower'
            ? '🏙️'
            : lm.type === 'city_hall'
            ? '🏛️'
            : lm.type === 'grand_station'
            ? '🚆'
            : '🏥'

        return (
          <group key={lm.id} position={[lm.x, height, lm.z]}>
            <Html
              center
              distanceFactor={850}
              zIndexRange={[10, 0]}
              style={{
                pointerEvents: 'auto',
                transition: 'all 0.2s ease',
              }}
            >
              <div
                className="group flex items-center space-x-1.5 px-2.5 py-1 bg-black/75 hover:bg-black/90 backdrop-blur-md border border-white/20 hover:border-blue-400 rounded-full text-white text-[11px] font-semibold shadow-lg shadow-black/50 cursor-pointer transform -translate-y-2 hover:scale-110 whitespace-nowrap transition-all"
                onClick={(e) => {
                  e.stopPropagation()
                  // Focus or select
                }}
              >
                <span className="text-sm">{icon}</span>
                <span className="text-gray-200 group-hover:text-white font-medium">{lm.name}</span>
              </div>
            </Html>
          </group>
        )
      })}
    </group>
  )
}
