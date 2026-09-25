import React, { useEffect, useState } from 'react'
import { useSimulationStore } from '../../store/simulationStore'
import type { CitizenDetail } from '../../types/city'

const BASE_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000'

export function CitizenInspector() {
  const selectedCitizenId = useSimulationStore((s) => s.selectedCitizenId)
  const setSelectedCitizen = useSimulationStore((s) => s.setSelectedCitizen)
  const isFollowing = useSimulationStore((s) => s.isFollowingCitizen)
  const setFollowing = useSimulationStore((s) => s.setFollowingCitizen)

  const [detail, setDetail] = useState<CitizenDetail | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!selectedCitizenId) {
      setDetail(null)
      return
    }

    setLoading(true)
    fetch(`${BASE_URL}/citizens/${selectedCitizenId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Citizen not found')
        return res.json()
      })
      .then((data: CitizenDetail) => {
        setDetail(data)
        setLoading(false)
      })
      .catch(() => {
        // Fallback mock detail if offline
        setDetail({
          id: selectedCitizenId,
          name: 'Elena Rostova',
          age: 32,
          age_group: 'adult',
          occupation: 'professional',
          sprite_type: 'professional',
          district_id: 'cbd',
          income: 85000,
          money: 640,
          household_id: 'hh_4021',
          home_building_id: 'bldg_res_12',
          home_coords: [3400, 3600],
          workplace_building_id: 'bldg_cbd_04',
          workplace_coords: [4000, 4200],
          current_state: 'COMMUTING',
          current_activity: 'commuting',
          destination_type: 'work',
          destination_coords: [4000, 4200],
          travel_mode: 'metro',
          decision_reason: 'Metro chosen: lowest estimated travel utility and avoids morning surface road traffic.',
          has_car: true,
          satisfaction: 88,
          stress: 16,
          fatigue: 24,
          health: 92,
          preferences: {
            car_weight: 0.5,
            bus_weight: 0.6,
            metro_weight: 0.85,
            railway_weight: 0.4,
            walk_weight: 0.7,
            cost_sensitivity: 0.3,
            comfort_preference: 0.8,
          },
          memory: {
            total_trips: 18,
            delays_count: 1,
            last_trip_mode: 'metro',
            mode_penalties: { bus: 0.1, car: 0.0, metro: 0.0, walk: 0.0 },
          },
          position: [3800, 4000],
        })
        setLoading(false)
      })
  }, [selectedCitizenId])

  if (!selectedCitizenId) return null

  return (
    <div className="flex flex-col h-full text-xs overflow-y-auto space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center space-x-2">
          <span className="text-xl">👤</span>
          <div>
            <h3 className="font-bold text-white text-sm">{detail?.name || 'Citizen'}</h3>
            <span className="text-gray-400 capitalize">{detail?.occupation?.replace('_', ' ')}</span>
          </div>
        </div>
        <button
          onClick={() => setSelectedCitizen(null)}
          className="text-gray-400 hover:text-white px-2 py-1 rounded hover:bg-white/10"
        >
          ✕
        </button>
      </div>

      {loading && <div className="text-blue-400 py-2">Loading profile...</div>}

      {detail && (
        <>
          {/* Follow Camera Action */}
          <button
            onClick={() => setFollowing(!isFollowing)}
            className={`w-full py-2 px-3 rounded font-bold transition flex items-center justify-center space-x-2 ${
              isFollowing
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50'
                : 'bg-white/10 hover:bg-white/20 text-gray-200'
            }`}
          >
            <span>{isFollowing ? '🎥 FOLLOWING CITIZEN' : '🔍 FOLLOW CITIZEN'}</span>
          </button>

          {/* Core Info Grid */}
          <div className="grid grid-cols-2 gap-2 bg-white/5 p-2 rounded border border-white/5">
            <div>
              <span className="text-gray-400 block">Age / Group</span>
              <span className="font-semibold text-white">{detail.age} ({detail.age_group})</span>
            </div>
            <div>
              <span className="text-gray-400 block">Annual Income</span>
              <span className="font-semibold text-green-400">{detail.income.toLocaleString()} MC</span>
            </div>
            <div>
              <span className="text-gray-400 block">Household</span>
              <span className="font-mono text-gray-300">{detail.household_id}</span>
            </div>
            <div>
              <span className="text-gray-400 block">Personal Car</span>
              <span className={detail.has_car ? 'text-blue-400' : 'text-gray-400'}>
                {detail.has_car ? 'Yes' : 'No'}
              </span>
            </div>
          </div>

          {/* Current State & Decision */}
          <div className="bg-white/5 p-2 rounded border border-white/5 space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Current State:</span>
              <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono font-bold">
                {detail.current_state}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Activity:</span>
              <span className="text-white capitalize">{detail.current_activity}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Transport Mode:</span>
              <span className="text-yellow-400 font-bold uppercase">{detail.travel_mode}</span>
            </div>
            <div className="pt-1 text-gray-300 italic border-t border-white/5">
              "{detail.decision_reason}"
            </div>
          </div>

          {/* Satisfaction & Wellbeing */}
          <div className="space-y-1.5 bg-white/5 p-2 rounded border border-white/5">
            <div className="flex justify-between text-gray-300">
              <span>Satisfaction:</span>
              <span className="font-bold text-green-400">{detail.satisfaction}%</span>
            </div>
            <div className="w-full bg-white/10 h-1.5 rounded overflow-hidden">
              <div className="bg-green-500 h-full" style={{ width: `${detail.satisfaction}%` }} />
            </div>

            <div className="flex justify-between text-gray-300">
              <span>Stress:</span>
              <span className="font-bold text-red-400">{detail.stress}%</span>
            </div>
            <div className="w-full bg-white/10 h-1.5 rounded overflow-hidden">
              <div className="bg-red-500 h-full" style={{ width: `${detail.stress}%` }} />
            </div>

            <div className="flex justify-between text-gray-300">
              <span>Fatigue:</span>
              <span className="font-bold text-orange-400">{detail.fatigue}%</span>
            </div>
            <div className="w-full bg-white/10 h-1.5 rounded overflow-hidden">
              <div className="bg-orange-500 h-full" style={{ width: `${detail.fatigue}%` }} />
            </div>
          </div>

          {/* Memory & Adaptation */}
          <div className="bg-white/5 p-2 rounded border border-white/5 space-y-1">
            <span className="font-bold text-white block">Experience Memory</span>
            <div className="flex justify-between text-gray-400">
              <span>Total recorded trips:</span>
              <span className="text-white">{detail.memory.total_trips}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Experienced delays:</span>
              <span className="text-red-400 font-bold">{detail.memory.delays_count}</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
