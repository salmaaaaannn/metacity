import React, { useEffect } from 'react'
import { useSimulationStore, selectDistricts } from '../../store/simulationStore'
import type { OverlayMode } from '../../types/city'
import { TimelineControls } from './TimelineControls'

const OVERLAY_OPTIONS: { id: OverlayMode; label: string; icon: string }[] = [
  { id: 'normal', label: 'Realistic', icon: '🏙️' },
  { id: 'traffic', label: 'Traffic', icon: '🚦' },
  { id: 'resilience', label: 'Resilience', icon: '🛡️' },
  { id: 'flood_risk', label: 'Flood Risk', icon: '🌊' },
  { id: 'fire_risk', label: 'Fire Risk', icon: '🔥' },
  { id: 'pollution', label: 'Pollution', icon: '🏭' },
  { id: 'power_demand', label: 'Power', icon: '⚡' },
  { id: 'water_demand', label: 'Water', icon: '💧' },
]

export function BottomControls() {
  const simSpeed = useSimulationStore((s) => s.simSpeed)
  const setSimSpeed = useSimulationStore((s) => s.setSimSpeed)
  const isPaused = useSimulationStore((s) => s.isPaused)
  const setPaused = useSimulationStore((s) => s.setPaused)
  const overlayMode = useSimulationStore((s) => s.overlayMode)
  const setOverlayMode = useSimulationStore((s) => s.setOverlayMode)
  const toggleBudget = useSimulationStore((s) => s.toggleBudgetPanel)
  const setShowScenarioModal = useSimulationStore((s) => s.setShowScenarioModal)

  const debugMode = useSimulationStore((s) => s.debugMode)
  const setDebugMode = useSimulationStore((s) => s.setDebugMode)
  const streetViewMode = useSimulationStore((s) => s.streetViewMode)
  const setStreetViewMode = useSimulationStore((s) => s.setStreetViewMode)
  const timeOfDay = useSimulationStore((s) => s.timeOfDay)
  const setTimeOfDay = useSimulationStore((s) => s.setTimeOfDay)

  const selectedDistrictId = useSimulationStore((s) => s.selectedDistrictId)
  const districts = useSimulationStore(selectDistricts)

  const activeDistrict = districts.find((d) => d.id === selectedDistrictId) || districts[0]

  // Global keybind: Space to toggle pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT' || (e.target as HTMLElement)?.tagName === 'TEXTAREA') return
      if (e.code === 'Space') {
        e.preventDefault()
        setPaused(!isPaused)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isPaused, setPaused])

  const speeds = [1, 5, 10, 50]

  return (
    <div className="absolute bottom-0 left-0 w-full h-14 bg-black/85 backdrop-blur-md z-20 flex items-center justify-between px-4 border-t border-white/10 text-white shadow-2xl select-none">
      {/* Simulation Speed & Play/Pause */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setPaused(!isPaused)}
          className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm transition ${
            isPaused
              ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30'
              : 'bg-white/10 hover:bg-white/20 text-white'
          }`}
          title={isPaused ? 'Resume Simulation' : 'Pause Simulation'}
        >
          {isPaused ? '▶️' : '⏸️'}
        </button>

        <div className="flex items-center space-x-1 bg-white/5 p-1 rounded-lg border border-white/10">
          {speeds.map((s) => (
            <button
              key={s}
              onClick={() => {
                setSimSpeed(s)
                if (isPaused) setPaused(false)
              }}
              className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition ${
                simSpeed === s && !isPaused
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>

        {/* Phase 5 Interactive Simulation Timeline Scrubber */}
        <TimelineControls />
      </div>

      {/* Heatmap Overlay Selector */}
      <div className="flex items-center space-x-1 bg-white/5 p-1 rounded-lg border border-white/10 text-xs">
        <span className="text-gray-400 text-[11px] px-2 font-medium">Overlays:</span>
        {OVERLAY_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setOverlayMode(opt.id)}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition flex items-center space-x-1 ${
              overlayMode === opt.id
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>{opt.icon}</span>
            <span>{opt.label}</span>
          </button>
        ))}
      </div>

      {/* Active District Status Pill */}
      {activeDistrict && (
        <div className="hidden lg:flex items-center space-x-2 bg-white/5 px-3 py-1 rounded-lg border border-white/10 text-xs">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: activeDistrict.color || '#3B82F6' }} />
          <span className="font-bold text-gray-200">{activeDistrict.name}</span>
          <span className="text-gray-500">|</span>
          <span className="text-gray-400 text-[11px]">Dev: <strong className="text-emerald-400">{Math.round(activeDistrict.developmentLevel * 100)}%</strong></span>
          <span className="text-gray-500">|</span>
          <span className="text-gray-400 text-[11px]">Pop: <strong className="text-white">{activeDistrict.population.toLocaleString()}</strong></span>
        </div>
      )}

      {/* Day / Sunset / Night Lighting Controls */}
      <div className="flex items-center space-x-1 bg-white/5 p-1 rounded-lg border border-white/10 text-xs">
        <span className="text-gray-400 text-[11px] px-1.5 font-medium">Lighting:</span>
        {(['auto', 'day', 'sunset', 'night'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTimeOfDay(t)}
            className={`px-2 py-0.5 rounded text-[11px] font-medium uppercase transition ${
              timeOfDay === t
                ? 'bg-amber-500 text-black font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {t === 'auto' ? '⏳ Auto' : t === 'day' ? '☀️ Day' : t === 'sunset' ? '🌅 Dusk' : '🌙 Night'}
          </button>
        ))}
      </div>

      {/* View Modes & Quick Launchers */}
      <div className="flex items-center space-x-2">
        {/* Street-Level Pedestrian View Mode Toggle */}
        <button
          onClick={() => setStreetViewMode(!streetViewMode)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
            streetViewMode
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/40'
              : 'bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white'
          }`}
          title="Toggle Street-Level Pedestrian Inspection View"
        >
          <span>🚶</span>
          <span>{streetViewMode ? 'Street View (ON)' : 'Street View'}</span>
        </button>

        {/* Visual Debug Mode Toggle */}
        <button
          onClick={() => setDebugMode(!debugMode)}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
            debugMode
              ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/40'
              : 'bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white'
          }`}
          title="Toggle Visual Debug Mode (Chunk Grid, Road Graph Nodes)"
        >
          <span>🛠️ Debug</span>
        </button>

        <button
          onClick={() => setShowScenarioModal(true)}
          className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-semibold text-gray-200 hover:text-white flex items-center space-x-1.5 transition"
        >
          <span>📊</span>
          <span>Scenarios</span>
        </button>

        <button
          onClick={toggleBudget}
          className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 rounded-lg text-xs font-bold text-emerald-300 flex items-center space-x-1.5 transition"
        >
          <span>💰</span>
          <span>Treasury</span>
        </button>
      </div>
    </div>
  )
}
