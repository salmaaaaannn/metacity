import React from 'react'
import { useSimulationStore } from '../../store/simulationStore'

export function ValidationFeedback() {
  const ghost = useSimulationStore((s) => s.placementGhost)
  const selectedTool = useSimulationStore((s) => s.selectedTool)
  const plannerMode = useSimulationStore((s) => s.plannerMode)

  if (!plannerMode || !ghost || selectedTool === 'select') return null

  const { valid, reason, validationData, x, z, endX, endZ } = ghost
  const cost = validationData?.constructionCost ?? 0
  const maint = validationData?.monthlyMaintenance ?? 0
  const pop = validationData?.populationServed ?? 0
  const impact = validationData?.expectedImpact

  return (
    <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30 pointer-events-none select-none">
      <div
        className={`px-5 py-3 rounded-xl backdrop-blur-md border shadow-2xl transition-all duration-200 flex flex-col items-center space-y-1.5 ${
          valid
            ? 'bg-slate-900/90 border-emerald-500/50 shadow-emerald-500/10'
            : 'bg-red-950/90 border-red-500/60 shadow-red-500/20'
        }`}
      >
        {/* Header line */}
        <div className="flex items-center space-x-2">
          <span className="text-base">{valid ? '✅' : '⚠️'}</span>
          <span className="font-extrabold text-sm uppercase tracking-wide text-white">
            {selectedTool.replace('_', ' ')}
          </span>
          <span className="text-xs text-gray-400">
            at ({Math.round(x)}, {Math.round(z)})
            {endX !== undefined && endZ !== undefined ? ` ➔ (${Math.round(endX)}, ${Math.round(endZ)})` : ''}
          </span>
        </div>

        {/* Status reason */}
        <div className="text-xs font-semibold">
          {valid ? (
            <span className="text-emerald-400">Ready to build — Click to place</span>
          ) : (
            <span className="text-red-300 font-bold">{reason || 'Placement blocked'}</span>
          )}
        </div>

        {/* Metrics Pill Grid */}
        <div className="flex items-center space-x-3 pt-1 border-t border-white/10 text-[11px]">
          <div className="flex items-center space-x-1">
            <span className="text-gray-400">Cost:</span>
            <span className="font-mono font-bold text-yellow-300">
              {cost >= 1_000_000 ? `${(cost / 1_000_000).toFixed(2)}M MC` : `${(cost / 1_000).toFixed(0)}k MC`}
            </span>
          </div>

          <div className="flex items-center space-x-1">
            <span className="text-gray-400">Maint:</span>
            <span className="font-mono text-gray-200">{Math.round(maint).toLocaleString()} MC/mo</span>
          </div>

          {pop > 0 && (
            <div className="flex items-center space-x-1">
              <span className="text-gray-400">Pop Served:</span>
              <span className="font-mono text-blue-300 font-semibold">{pop.toLocaleString()}</span>
            </div>
          )}

          {impact && (
            <div className="flex items-center space-x-2 text-[10px] text-emerald-300 bg-emerald-900/40 px-2 py-0.5 rounded border border-emerald-500/30">
              <span>Traffic: {impact.estimatedTrafficCongestionDeltaPct}%</span>
              <span>•</span>
              <span>Time: {impact.estimatedTravelTimeDeltaPct}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
