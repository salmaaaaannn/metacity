import React, { useEffect, useState } from 'react'
import { useSimulationStore } from '../../store/simulationStore'
import type { DistrictMetrics } from '../../types/city'

const BASE_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000'

export function DistrictInspector() {
  const selectedDistrictId = useSimulationStore((s) => s.selectedDistrictId)
  const setSelectedDistrict = useSimulationStore((s) => s.setSelectedDistrict)
  const [metrics, setMetrics] = useState<DistrictMetrics | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!selectedDistrictId) {
      setMetrics(null)
      return
    }

    setLoading(true)
    fetch(`${BASE_URL}/districts/${selectedDistrictId}`)
      .then((res) => {
        if (!res.ok) throw new Error('District not found')
        return res.json()
      })
      .then((data: DistrictMetrics) => {
        setMetrics(data)
        setLoading(false)
      })
      .catch(() => {
        // Fallback mock metrics if offline
        setMetrics({
          id: selectedDistrictId,
          name: 'Central Business District',
          type: 'cbd',
          development_level: 1.0,
          statistical_population: 85000,
          active_simulated_citizens: 164,
          satisfaction_index: 82.5,
          stress_index: 18.0,
          traffic_congestion_index: 68.4,
          transit_modal_split: {
            public_transit_pct: 54.0,
            car_pct: 32.0,
            walk_pct: 14.0,
          },
          economic_activity: {
            active_businesses: 42,
            employed_workers: 820,
            active_shoppers_diners: 140,
            daily_revenue: 125000,
          },
          services: {
            education_access: 90,
            healthcare_access: 95,
            transport_access: 100,
            safety: 85,
            environment_quality: 60,
          },
          housing_capacity: 20000,
          employment_capacity: 150000,
          color: '#1a237e',
        })
        setLoading(false)
      })
  }, [selectedDistrictId])

  if (!selectedDistrictId) return null

  return (
    <div className="flex flex-col h-full text-xs overflow-y-auto space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center space-x-2">
          <span className="text-xl">🏙️</span>
          <div>
            <h3 className="font-bold text-white text-sm">{metrics?.name || 'District'}</h3>
            <span className="text-blue-400 capitalize">Dev Level: {(metrics?.development_level ?? 0) * 100}%</span>
          </div>
        </div>
        <button
          onClick={() => setSelectedDistrict(null)}
          className="text-gray-400 hover:text-white px-2 py-1 rounded hover:bg-white/10"
        >
          ✕
        </button>
      </div>

      {loading && <div className="text-blue-400 py-2">Loading district data...</div>}

      {metrics && (
        <>
          {/* Population & Agents */}
          <div className="grid grid-cols-2 gap-2 bg-white/5 p-2 rounded border border-white/5">
            <div>
              <span className="text-gray-400 block">Total Population</span>
              <span className="font-bold text-white text-sm">{metrics.statistical_population.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-gray-400 block">Active AI Agents</span>
              <span className="font-bold text-yellow-400 text-sm">{metrics.active_simulated_citizens}</span>
            </div>
            <div>
              <span className="text-gray-400 block">Satisfaction</span>
              <span className="font-bold text-green-400">{metrics.satisfaction_index}%</span>
            </div>
            <div>
              <span className="text-gray-400 block">Traffic Congestion</span>
              <span className="font-bold text-orange-400">{metrics.traffic_congestion_index}%</span>
            </div>
          </div>

          {/* Modal Split */}
          <div className="bg-white/5 p-2 rounded border border-white/5 space-y-1.5">
            <span className="font-bold text-white block">Transit Modal Split</span>
            <div className="flex justify-between text-gray-300">
              <span>Public Transit (Metro/Bus):</span>
              <span className="font-bold text-blue-400">{metrics.transit_modal_split.public_transit_pct}%</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Private Car:</span>
              <span className="font-bold text-red-400">{metrics.transit_modal_split.car_pct}%</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Walking:</span>
              <span className="font-bold text-green-400">{metrics.transit_modal_split.walk_pct}%</span>
            </div>
          </div>

          {/* Economic Activity */}
          <div className="bg-white/5 p-2 rounded border border-white/5 space-y-1.5">
            <span className="font-bold text-white block">Commercial Activity</span>
            <div className="flex justify-between text-gray-400">
              <span>Active Businesses:</span>
              <span className="text-white font-semibold">{metrics.economic_activity.active_businesses}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Employed Workforce:</span>
              <span className="text-white font-semibold">{metrics.economic_activity.employed_workers}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Daily Shoppers/Diners:</span>
              <span className="text-yellow-400 font-semibold">{metrics.economic_activity.active_shoppers_diners}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Commercial Revenue:</span>
              <span className="text-green-400 font-semibold">{metrics.economic_activity.daily_revenue.toLocaleString()} MC</span>
            </div>
          </div>

          {/* Infrastructure & Services */}
          <div className="bg-white/5 p-2 rounded border border-white/5 space-y-1">
            <span className="font-bold text-white block">Services & Access</span>
            <div className="flex justify-between text-gray-400">
              <span>Transit Access:</span>
              <span className="text-white">{metrics.services.transport_access}%</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Education Access:</span>
              <span className="text-white">{metrics.services.education_access}%</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Healthcare Access:</span>
              <span className="text-white">{metrics.services.healthcare_access}%</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Public Safety:</span>
              <span className="text-white">{metrics.services.safety}%</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
