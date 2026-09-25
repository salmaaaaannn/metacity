import React, { useState } from 'react'
import { useSimulationStore, selectDisasters, selectEnvironment, selectResilience } from '../../store/simulationStore'

export function DisasterHUD() {
  const disasters = useSimulationStore(selectDisasters)
  const environment = useSimulationStore(selectEnvironment)
  const resilience = useSimulationStore(selectResilience)
  const setShowDisasterLab = useSimulationStore((s) => s.setShowDisasterLabModal)

  const [showResilienceDetails, setShowResilienceDetails] = useState<boolean>(false)

  const activeCount = disasters?.active_incidents_count || 0
  const isEmergency = activeCount > 0

  return (
    <div className="absolute top-14 left-4 z-20 flex flex-col space-y-2 pointer-events-none select-none max-w-sm">
      {/* Primary Climate & Resilience Status Pill */}
      <div className="pointer-events-auto bg-black/80 backdrop-blur-md border border-white/10 rounded-xl p-2.5 shadow-xl text-white flex items-center justify-between gap-3">
        {/* Weather / Temperature */}
        <div className="flex items-center space-x-2">
          <span className="text-xl">
            {environment?.weather_condition === 'RAIN' || environment?.weather_condition === 'HEAVY_RAIN'
              ? '🌧️'
              : environment?.weather_condition === 'STORM'
              ? '⛈️'
              : environment?.weather_condition === 'HEATWAVE' || environment?.weather_condition === 'EXTREME_HEAT'
              ? '🔥'
              : environment?.weather_condition === 'FOG'
              ? '🌫️'
              : '🌤️'}
          </span>
          <div>
            <div className="flex items-center space-x-1.5 text-xs font-bold">
              <span>{environment?.temperature?.toFixed(1) ?? '24.5'}°C</span>
              <span className="text-[10px] text-gray-400 font-normal">({environment?.season ?? 'SPRING'})</span>
            </div>
            <div className="text-[10px] text-gray-400 font-mono">
              AQI: <strong className={environment && environment.air_quality_index > 100 ? 'text-rose-400' : 'text-emerald-400'}>{environment?.air_quality_index?.toFixed(0) ?? '42'}</strong> | Grid: <strong className={environment && environment.grid_stress_pct > 85 ? 'text-amber-400' : 'text-cyan-400'}>{environment?.grid_stress_pct?.toFixed(0) ?? '76'}%</strong>
            </div>
          </div>
        </div>

        {/* Resilience Index Gauge Button */}
        <button
          onClick={() => setShowResilienceDetails(!showResilienceDetails)}
          className="relative px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex flex-col items-center transition"
          title="METACITY Simulation Resilience Index (Click for district breakdown)"
        >
          <span className="text-[9px] uppercase font-mono text-gray-400 tracking-wider">Resilience</span>
          <span className="text-xs font-mono font-extrabold text-emerald-400">
            {resilience?.city_score?.toFixed(1) ?? '84.5'}/100
          </span>
        </button>

        {/* Lab Launcher */}
        <button
          onClick={() => setShowDisasterLab(true)}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1 transition shadow-md ${
            isEmergency
              ? 'bg-red-600 hover:bg-red-500 text-white animate-pulse'
              : 'bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40'
          }`}
        >
          <span>{isEmergency ? '🚨' : '⚠️'}</span>
          <span>{isEmergency ? `${activeCount} Hazards` : 'Disaster Lab'}</span>
        </button>
      </div>

      {/* Resilience Breakdown Popover */}
      {showResilienceDetails && resilience && (
        <div className="pointer-events-auto bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl p-3.5 shadow-2xl text-white text-xs space-y-2.5 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-emerald-400 text-xs tracking-wide">
              {resilience.index_name}
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-950 border border-emerald-800 text-emerald-300">
              {resilience.rating}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
            <div>Emergency Coverage: <strong className="text-white font-mono">{resilience.breakdown.emergency_coverage.toFixed(0)}%</strong></div>
            <div>Utility Redundancy: <strong className="text-white font-mono">{resilience.breakdown.utility_redundancy.toFixed(0)}%</strong></div>
            <div>Evacuation Ready: <strong className="text-white font-mono">{resilience.breakdown.evacuation_readiness.toFixed(0)}%</strong></div>
            <div>Road Redundancy: <strong className="text-white font-mono">{resilience.breakdown.road_redundancy.toFixed(0)}%</strong></div>
          </div>

          {resilience.breakdown.active_incident_penalty > 0 && (
            <div className="text-[10px] text-rose-400 bg-rose-950/40 border border-rose-900/50 px-2 py-1 rounded font-mono">
              Active Hazard Impact Penalty: -{resilience.breakdown.active_incident_penalty.toFixed(1)} pts
            </div>
          )}
        </div>
      )}

      {/* Active Incident Warning Alert Bar */}
      {isEmergency && (
        <div className="pointer-events-auto bg-red-950/90 backdrop-blur-md border border-red-500/60 rounded-xl p-3 shadow-2xl text-white space-y-1.5 animate-in slide-in-from-top duration-200">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-red-300 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>ACTIVE DISASTER EMERGENCY</span>
            </span>
            <span className="font-mono text-[10px] bg-red-900 px-1.5 py-0.5 rounded text-red-200 font-bold">
              {activeCount} Active
            </span>
          </div>

          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-red-200/90 pt-0.5">
            <div>Evacuated: <strong className="text-white font-mono">{disasters?.evacuated_citizens?.toLocaleString() ?? 0}</strong></div>
            <div>Damaged: <strong className="text-white font-mono">{disasters?.affected_buildings_count ?? 0} bldgs</strong></div>
            <div>Closed Roads: <strong className="text-white font-mono">{disasters?.closed_roads_count ?? 0}</strong></div>
            <div>Response Fleet: <strong className="text-white font-mono">{disasters?.emergency_vehicles_active ?? 0} units</strong></div>
          </div>

          {/* Emergency Response ETAs */}
          {(disasters?.incidents?.[0]?.metadata?.response_times || disasters?.incidents?.[0]?.response_times) && (
            <div className="mt-2 pt-2 border-t border-red-500/30">
              <div className="text-[10px] font-bold text-red-300 mb-1 tracking-wider">EMERGENCY RESPONSE ETA</div>
              <div className="flex justify-between items-center text-[11px] font-mono bg-red-950/50 p-1.5 rounded">
                {(() => {
                  const r = disasters.incidents[0].metadata?.response_times || disasters.incidents[0].response_times
                  const getColor = (eta: number) => {
                    if (eta < 5) return '#10B981'
                    if (eta <= 10) return '#F59E0B'
                    return '#EF4444'
                  }
                  return (
                    <>
                      <div className="flex items-center space-x-1">
                        <span>🚒</span>
                        <strong style={{ color: getColor(r.fire_eta_minutes) }}>{r.fire_eta_minutes.toFixed(1)} min</strong>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>🚑</span>
                        <strong style={{ color: getColor(r.medical_eta_minutes) }}>{r.medical_eta_minutes.toFixed(1)} min</strong>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>🚔</span>
                        <strong style={{ color: getColor(r.police_eta_minutes) }}>{r.police_eta_minutes.toFixed(1)} min</strong>
                      </div>
                    </>
                  )
                })()}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
