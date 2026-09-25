import React from 'react'
import { useSimulationStore } from '../../store/simulationStore'

export function TimelineControls() {
  const timelineMode = useSimulationStore((s) => s.timelineMode)
  const setTimelineMode = useSimulationStore((s) => s.setTimelineMode)
  const timelineHourOffset = useSimulationStore((s) => s.timelineHourOffset)
  const setTimelineHourOffset = useSimulationStore((s) => s.setTimelineHourOffset)
  const simTime = useSimulationStore((s) => s.cityState?.simTime ?? 'Day 1, 06:30')

  return (
    <div className="flex items-center space-x-2 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10 text-xs text-white select-none">
      <span className="text-[10px] uppercase font-mono text-gray-400">Timeline:</span>

      {/* Mode Buttons */}
      <div className="flex items-center space-x-1 bg-black/40 p-0.5 rounded border border-white/5">
        <button
          onClick={() => {
            setTimelineMode('past')
            if (timelineHourOffset >= 0) setTimelineHourOffset(-6)
          }}
          className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
            timelineMode === 'past'
              ? 'bg-amber-600 text-white shadow'
              : 'text-gray-400 hover:text-white'
          }`}
          title="Inspect Historical Analytics Replay"
        >
          Past
        </button>

        <button
          onClick={() => {
            setTimelineMode('now')
            setTimelineHourOffset(0)
          }}
          className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
            timelineMode === 'now'
              ? 'bg-emerald-600 text-white shadow animate-pulse'
              : 'text-gray-400 hover:text-white'
          }`}
          title="Authoritative Live Simulation State"
        >
          Now
        </button>

        <button
          onClick={() => {
            setTimelineMode('forecast')
            if (timelineHourOffset <= 0) setTimelineHourOffset(6)
          }}
          className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
            timelineMode === 'forecast'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-gray-400 hover:text-white'
          }`}
          title="AI Predictive Simulation Forecast"
        >
          Forecast
        </button>
      </div>

      {/* Offset Scrubber (when not in 'now' mode) */}
      {timelineMode !== 'now' ? (
        <div className="flex items-center space-x-1.5 pl-1">
          <input
            type="range"
            min={timelineMode === 'past' ? -24 : 1}
            max={timelineMode === 'past' ? -1 : 24}
            value={timelineHourOffset}
            onChange={(e) => setTimelineHourOffset(Number(e.target.value))}
            className="w-16 accent-indigo-400 bg-slate-800 h-1.5 rounded cursor-pointer"
          />
          <span className="font-mono text-[10px] text-indigo-300 w-10 text-right">
            {timelineHourOffset > 0 ? `+${timelineHourOffset}h` : `${timelineHourOffset}h`}
          </span>
        </div>
      ) : (
        <span className="font-mono text-[10px] text-emerald-400 pl-1">
          Live ({simTime.split(',')[1]?.trim() || '06:30'})
        </span>
      )}
    </div>
  )
}
