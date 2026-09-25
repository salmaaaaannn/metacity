import React, { useState, useEffect } from 'react'
import { useSimulationStore, selectDisasters, selectDistricts } from '../../store/simulationStore'
import { cityApi } from '../../api/cityApi'

const DISASTER_PRESETS = [
  { type: 'FLOOD', name: 'River Overflow Flood', icon: '🌊', color: 'from-blue-600 to-cyan-700', desc: 'Inundates low-elevation terrain and closes submerged roads.' },
  { type: 'FIRE', name: 'Wind-Driven Structural Fire', icon: '🔥', color: 'from-orange-600 to-red-700', desc: 'Propagates across dense structures downwind.' },
  { type: 'EARTHQUAKE', name: 'Tectonic Seismic Rupture', icon: '🌋', color: 'from-amber-600 to-yellow-800', desc: 'Radial shockwaves cause structural degradation and road fissures.' },
  { type: 'STORM', name: 'Severe Coastal Gale', icon: '⛈️', color: 'from-slate-600 to-indigo-800', desc: 'High wind vectors and torrential rain triggering cascade flood events.' },
  { type: 'HEATWAVE', name: 'Extreme Thermal Dome', icon: '☀️', color: 'from-red-600 to-rose-800', desc: 'Cooling surge stresses power grid and accelerates drought.' },
]

const WEATHER_OPTIONS = ['CLEAR', 'CLOUDY', 'RAIN', 'HEAVY_RAIN', 'STORM', 'HEATWAVE', 'FOG']
const SEASONS = ['SPRING', 'SUMMER', 'AUTUMN', 'WINTER']

export function DisasterLabModal() {
  const isOpen = useSimulationStore((s) => s.showDisasterLabModal)
  const setIsOpen = useSimulationStore((s) => s.setShowDisasterLabModal)
  const setCityState = useSimulationStore((s) => s.setCityState)
  const disasters = useSimulationStore(selectDisasters)
  const districts = useSimulationStore(selectDistricts)

  const [selectedType, setSelectedType] = useState<string>('FLOOD')
  const [severity, setSeverity] = useState<number>(3)
  const [radius, setRadius] = useState<number>(1500)
  const [duration, setDuration] = useState<number>(180)
  const [targetDistrictId, setTargetDistrictId] = useState<string>(districts[0]?.id || 'd01')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null)

  // Poll disasters when modal is open
  useEffect(() => {
    if (!isOpen) return
    const interval = setInterval(async () => {
      const data = await cityApi.getDisasters()
      if (data) {
        useSimulationStore.getState().setDisasters(data)
      }
    }, 2000)
    return () => clearInterval(interval)
  }, [isOpen])

  if (!isOpen) return null

  const handleTrigger = async () => {
    setIsSubmitting(true)
    setFeedbackMsg(null)
    const targetDistrict = districts.find((d) => d.id === targetDistrictId)
    const epX = targetDistrict ? (targetDistrict.bounds[0] + targetDistrict.bounds[2]) / 2 : 4000
    const epZ = targetDistrict ? (targetDistrict.bounds[1] + targetDistrict.bounds[3]) / 2 : 4000

    const res = await cityApi.triggerDisaster(selectedType, epX, epZ, severity, radius, duration)
    setIsSubmitting(false)
    if (res.success) {
      setFeedbackMsg(`Successfully initiated ${selectedType} incident!`)
      const updated = await cityApi.getDisasters()
      if (updated) useSimulationStore.getState().setDisasters(updated)
    } else {
      setFeedbackMsg(`Failed to trigger: ${res.reason || 'Unknown error'}`)
    }
  }

  const handlePause = async (id: string) => {
    await cityApi.pauseDisaster(id)
    const updated = await cityApi.getDisasters()
    if (updated) useSimulationStore.getState().setDisasters(updated)
  }

  const handleStop = async (id: string) => {
    await cityApi.stopDisaster(id)
    const updated = await cityApi.getDisasters()
    if (updated) useSimulationStore.getState().setDisasters(updated)
  }

  const handleReset = async () => {
    await cityApi.resetDisasters()
    const updated = await cityApi.getDisasters()
    if (updated) useSimulationStore.getState().setDisasters(updated)
    const refreshedCity = await cityApi.getCityState()
    setCityState(refreshedCity)
    setFeedbackMsg('All active disaster conditions reset.')
  }

  const handleWeatherChange = async (w: string) => {
    await cityApi.setWeather(w)
    const refreshedCity = await cityApi.getCityState()
    setCityState(refreshedCity)
  }

  const handleSeasonChange = async (s: string) => {
    await cityApi.setSeason(s)
    const refreshedCity = await cityApi.getCityState()
    setCityState(refreshedCity)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl text-white overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h2 className="text-lg font-bold tracking-tight bg-gradient-to-r from-amber-400 to-rose-400 bg-clip-text text-transparent">
                Disaster & Climate Resilience Laboratory
              </h2>
              <p className="text-xs text-slate-400">
                Phase 4 Multi-hazard physical simulator, cascade management, and municipal dispatch
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          {feedbackMsg && (
            <div className="bg-indigo-950/80 border border-indigo-500/50 text-indigo-200 text-xs px-4 py-2.5 rounded-lg flex items-center justify-between">
              <span>{feedbackMsg}</span>
              <button onClick={() => setFeedbackMsg(null)} className="text-indigo-400 hover:text-white">✕</button>
            </div>
          )}

          {/* Preset Selector */}
          <div>
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
              1. Select Hazard Type
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {DISASTER_PRESETS.map((p) => {
                const isSelected = selectedType === p.type
                return (
                  <button
                    key={p.type}
                    onClick={() => setSelectedType(p.type)}
                    className={`flex flex-col items-center p-3 rounded-xl border text-center transition-all ${
                      isSelected
                        ? `bg-gradient-to-b ${p.color} border-white/60 shadow-lg scale-[1.02]`
                        : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 hover:border-slate-500'
                    }`}
                  >
                    <span className="text-2xl mb-1.5">{p.icon}</span>
                    <span className="font-bold text-xs">{p.type}</span>
                    <span className="text-[10px] text-slate-300/80 line-clamp-1 mt-0.5">{p.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Trigger Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950/50 p-4 rounded-xl border border-slate-800">
            {/* Target District */}
            <div>
              <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1.5">
                Epicenter District
              </label>
              <select
                value={targetDistrictId}
                onChange={(e) => setTargetDistrictId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                {districts.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.type})
                  </option>
                ))}
              </select>
            </div>

            {/* Severity */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                  Severity Scale
                </label>
                <span className="text-xs font-mono font-bold text-amber-400">Level {severity}</span>
              </div>
              <input
                type="range"
                min={1}
                max={5}
                value={severity}
                onChange={(e) => setSeverity(Number(e.target.value))}
                className="w-full accent-amber-500 bg-slate-800 h-2 rounded cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>Minor (1)</span>
                <span>Moderate (3)</span>
                <span>Catastrophic (5)</span>
              </div>
            </div>

            {/* Radius */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                  Impact Radius
                </label>
                <span className="text-xs font-mono font-bold text-cyan-400">{radius} meters</span>
              </div>
              <input
                type="range"
                min={500}
                max={3000}
                step={250}
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="w-full accent-cyan-500 bg-slate-800 h-2 rounded cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>Local (500m)</span>
                <span>Regional (3000m)</span>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center space-x-2">
              <button
                onClick={handleTrigger}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg transition flex items-center space-x-2 disabled:opacity-50"
              >
                <span>⚡</span>
                <span>Trigger Simulation Event</span>
              </button>

              <button
                onClick={handleReset}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium text-xs px-4 py-2.5 rounded-xl border border-slate-700 transition"
              >
                Reset All Incidents
              </button>
            </div>

            {/* Climate Overrides Quick Bar */}
            <div className="flex items-center space-x-2 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
              <span className="text-slate-400 font-mono text-[11px]">Climate:</span>
              <select
                onChange={(e) => handleWeatherChange(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs"
              >
                {WEATHER_OPTIONS.map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
              <select
                onChange={(e) => handleSeasonChange(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs"
              >
                {SEASONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Live Incident Status Table */}
          <div className="pt-2">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center justify-between">
              <span>Active Disaster Incidents</span>
              <span className="text-amber-400 font-mono text-[11px]">
                {disasters?.active_incidents_count || 0} In Progress
              </span>
            </h3>

            {(!disasters?.incidents || disasters.incidents.length === 0) ? (
              <div className="bg-slate-950/40 border border-dashed border-slate-800 rounded-xl p-8 text-center text-slate-500 text-xs">
                No active disaster incidents in progress. The city operates in normal status.
              </div>
            ) : (
              <div className="space-y-2.5">
                {disasters.incidents.map((inc) => (
                  <div
                    key={inc.id}
                    className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">
                        {inc.disaster_type === 'FLOOD' ? '🌊' : inc.disaster_type === 'FIRE' ? '🔥' : inc.disaster_type === 'EARTHQUAKE' ? '🌋' : '⚠️'}
                      </span>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-white uppercase">{inc.disaster_type}</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-red-950 border border-red-800 text-red-300">
                            Severity {inc.severity}
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                            {inc.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Radius: {Math.round(inc.radius)}m | Damage Cost: {(inc.damage_cost / 1000).toFixed(0)}k MC | Evacuated: {inc.evacuated_citizens}
                        </p>
                      </div>
                    </div>

                    {/* Progress & Controls */}
                    <div className="flex items-center space-x-3">
                      <div className="w-32">
                        <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                          <span>Repair</span>
                          <span>{Math.round((inc.repair_progress || 0) * 100)}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 transition-all duration-300"
                            style={{ width: `${(inc.repair_progress || 0) * 100}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex space-x-1.5">
                        <button
                          onClick={() => handlePause(inc.id)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-medium text-[11px]"
                        >
                          Pause
                        </button>
                        <button
                          onClick={() => handleStop(inc.id)}
                          className="px-2.5 py-1 bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-200 rounded font-medium text-[11px]"
                        >
                          Resolve
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Damage Assessment & Recovery */}
          {disasters?.incidents && disasters.incidents.length > 0 && (
            <div className="pt-4 border-t border-slate-800/80">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
                Damage Assessment & Recovery
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {disasters.incidents.map((inc) => (
                  <div key={`recovery-${inc.id}`} className="bg-slate-950/50 backdrop-blur border border-slate-700/60 rounded-xl p-4 flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-[11px] font-bold text-white uppercase">{inc.disaster_type} Impact</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{inc.id}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-slate-400">Est. Damage</div>
                        <div className="text-xs font-bold text-rose-400 font-mono">{(inc.damage_cost || 0).toLocaleString()} MC</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                      <div>
                        <span className="text-slate-500 block mb-0.5">Affected Bldgs</span>
                        <span className="text-slate-200 font-mono font-bold">{inc.affected_building_ids?.length || 0}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block mb-0.5">Closed Roads</span>
                        <span className="text-slate-200 font-mono font-bold">{inc.affected_road_ids?.length || 0}</span>
                      </div>
                    </div>

                    <div className="mt-1">
                        <div className="flex justify-between text-[10px] text-slate-400 mb-1.5">
                          <span>Recovery Progress</span>
                          <span>{Math.round((inc.repair_progress || 0) * 100)}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-cyan-500 transition-all duration-300 shadow-[0_0_8px_rgba(6,182,212,0.6)]"
                            style={{ width: `${(inc.repair_progress || 0) * 100}%` }}
                          />
                        </div>
                    </div>

                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleStop(inc.id)}
                        className="flex-1 bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-800/80 text-cyan-300 text-[10px] font-bold py-2 rounded-lg transition flex items-center justify-center gap-1.5 shadow-md"
                      >
                        <span>🏗️</span> Rebuild All
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Are you sure you want to demolish damaged structures? This action cannot be undone.')) {
                            handleStop(inc.id)
                          }
                        }}
                        className="flex-1 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 text-slate-300 hover:text-white text-[10px] font-bold py-2 rounded-lg transition flex items-center justify-center gap-1.5"
                      >
                        <span>🔨</span> Demolish Damaged
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span>Authoritative Digital Twin Model: Deterministic Physics + Multi-Hazard Cascade</span>
          <button
            onClick={() => setIsOpen(false)}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
