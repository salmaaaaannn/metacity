import React from 'react'
import * as THREE from 'three'
import { useSimulationStore, selectDistricts, selectResilience } from '../../store/simulationStore'

export function DistrictOverlay() {
  const districts = useSimulationStore(selectDistricts)
  const overlayMode = useSimulationStore((s) => s.overlayMode)
  const selectedDistrictId = useSimulationStore((s) => s.selectedDistrictId)
  const setSelectedDistrict = useSimulationStore((s) => s.setSelectedDistrict)
  const resilience = useSimulationStore(selectResilience)

  return (
    <group name="district_overlay_layer">
      {districts.map((d) => {
        const [x0, z0, x1, z1] = d.bounds
        const width = x1 - x0
        const depth = z1 - z0
        const centerX = x0 + width / 2
        const centerZ = z0 + depth / 2
        const isSelected = d.id === selectedDistrictId

        // Color based on overlay mode or district theme
        let color = d.color || '#3B82F6'
        let opacity = isSelected ? 0.35 : overlayMode !== 'normal' ? 0.28 : 0.08

        if (overlayMode === 'traffic' || overlayMode === 'predicted_congestion') {
          color = d.developmentLevel > 0.8 ? '#EF4444' : d.developmentLevel > 0.5 ? '#F59E0B' : '#10B981'
        } else if (overlayMode === 'satisfaction') {
          color = '#10B981'
        } else if (overlayMode === 'flood_risk') {
          // Riverfront and low-elevation districts
          color = d.type === 'riverfront' || d.type === 'rural' ? '#0284C7' : d.type === 'developing' ? '#38BDF8' : '#64748B'
          opacity = d.type === 'riverfront' ? 0.45 : 0.22
        } else if (overlayMode === 'fire_risk') {
          // Dense urban / industrial
          color = d.type === 'cbd' || d.type === 'industrial' ? '#DC2626' : d.type === 'residential_high' ? '#F97316' : '#22C55E'
          opacity = 0.32
        } else if (overlayMode === 'earthquake_risk') {
          color = d.developmentLevel > 0.75 ? '#EAB308' : '#94A3B8'
          opacity = 0.28
        } else if (overlayMode === 'pollution') {
          color = d.type === 'industrial' ? '#7F1D1D' : d.type === 'transport' ? '#B45309' : d.type === 'cbd' ? '#D97706' : '#15803D'
          opacity = 0.35
        } else if (overlayMode === 'power_demand') {
          color = d.type === 'cbd' || d.type === 'tech' ? '#F59E0B' : d.type === 'industrial' ? '#EA580C' : '#3B82F6'
          opacity = 0.3
        } else if (overlayMode === 'water_demand') {
          color = d.type.startsWith('residential') ? '#06B6D4' : '#64748B'
          opacity = 0.3
        } else if (overlayMode === 'resilience') {
          const score = resilience?.districts?.[d.id] ?? (d.infrastructureQuality * 100)
          color = score > 85 ? '#10B981' : score > 75 ? '#3B82F6' : score > 65 ? '#F59E0B' : '#EF4444'
          opacity = 0.35
        }

        return (
          <group key={d.id} position={[centerX, 0.2, centerZ]}>
            <mesh
              rotation={[-Math.PI / 2, 0, 0]}
              onClick={(e) => {
                e.stopPropagation()
                setSelectedDistrict(d.id)
              }}
            >
              <planeGeometry args={[width, depth]} />
              <meshBasicMaterial
                color={color}
                transparent
                opacity={opacity}
                side={THREE.DoubleSide}
                depthWrite={false}
              />
            </mesh>

            {/* Selected district glowing outline */}
            {isSelected && (
              <lineSegments rotation={[-Math.PI / 2, 0, 0]}>
                <edgesGeometry args={[new THREE.PlaneGeometry(width, depth)]} />
                <lineBasicMaterial color="#60A5FA" linewidth={2} />
              </lineSegments>
            )}
          </group>
        )
      })}
    </group>
  )
}