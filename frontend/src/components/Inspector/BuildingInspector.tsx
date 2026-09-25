import React from 'react'
import { useSimulationStore } from '../../store/simulationStore'

interface InspectorContentProps {
  buildingId: string
}

function BuildingInspectorContent({ buildingId }: InspectorContentProps) {
  const setSelectedBuilding = useSimulationStore((s) => s.setSelectedBuilding)
  const setInteriorBuilding = useSimulationStore((s) => s.setInteriorBuilding)

  const building = useSimulationStore((s) =>
    s.cityState?.buildings ? s.cityState.buildings.find((b) => b.id === buildingId) ?? null : null
  )

  const districtId = building?.districtId
  const district = useSimulationStore((s) =>
    districtId && s.cityState?.districts ? s.cityState.districts.find((d) => d.id === districtId) ?? null : null
  )

  if (!building) return null

  const bType = (building.building_type || building.type || 'Standard').toUpperCase()
  const floors = building.floors || Math.max(1, Math.round((building.height || 15) / 3.5))
  const estimatedCapacity = floors * 24

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
            Building Digital Twin
          </span>
          <h2 className="font-bold text-base text-white truncate max-w-[200px]">{bType}</h2>
        </div>
        <button
          onClick={() => setSelectedBuilding(null)}
          className="text-gray-400 hover:text-white p-1 rounded hover:bg-white/10 transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Building Details */}
      <div className="space-y-3 flex-1 overflow-y-auto pr-1">
        {/* District & Location */}
        <div className="bg-white/5 p-3 rounded-lg border border-white/5 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-400">ID:</span>
            <span className="font-mono text-gray-200">{building.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">District:</span>
            <span className="text-white font-medium">{district?.name || 'Metropolitan Area'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Dev Level:</span>
            <span className="text-emerald-400 font-medium">
              {((district?.developmentLevel || 0.5) * 100).toFixed(0)}%
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Coordinates:</span>
            <span className="font-mono text-gray-300">
              ({Math.round(building.x)}, {Math.round(building.z)})
            </span>
          </div>
        </div>

        {/* Architectural Specs */}
        <div className="bg-white/5 p-3 rounded-lg border border-white/5 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-400">Height:</span>
            <span className="text-white font-bold">{building.height || 15}m</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Floors:</span>
            <span className="text-white font-bold">{floors}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Footprint:</span>
            <span className="text-gray-200">
              {Math.round(building.width || 20)}m × {Math.round(building.depth || 20)}m
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Capacity:</span>
            <span className="text-yellow-400 font-bold">~{estimatedCapacity} Occupants</span>
          </div>
        </div>

        {/* Utilities Status */}
        <div className="bg-white/5 p-3 rounded-lg border border-white/5 space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Power Grid:</span>
            <span className="text-green-400 font-medium">● Connected</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Water Supply:</span>
            <span className="text-green-400 font-medium">● Operational</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Road Access:</span>
            <span className="text-blue-400 font-medium">● Direct Arterial</span>
          </div>
        </div>

        {/* Enter Building Action Button */}
        <div className="pt-2">
          <button
            onClick={() => setInteriorBuilding(building.id)}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-98 text-white font-bold text-xs rounded-lg shadow-lg shadow-blue-500/20 flex items-center justify-center space-x-2 transition-all"
          >
            <span>🏢</span>
            <span>ENTER BUILDING (3D INTERIOR)</span>
          </button>
          <p className="text-[10px] text-gray-400 text-center mt-1.5">
            Explore reception, meeting rooms, patient wards, or furnished suites in 3D
          </p>
        </div>
      </div>
    </div>
  )
}

export function BuildingInspector() {
  const selectedBuildingId = useSimulationStore((s) => s.selectedBuildingId)

  if (!selectedBuildingId) return null

  return <BuildingInspectorContent buildingId={selectedBuildingId} />
}
