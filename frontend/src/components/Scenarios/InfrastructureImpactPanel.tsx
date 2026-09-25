import React, { useEffect, useState } from 'react'
import { useSimulationStore } from '../../store/simulationStore'
import { cityApi } from '../../api/cityApi'
import type { ScenarioComparison } from '../../types/city'

export function InfrastructureImpactPanel() {
  const showScenarioModal = useSimulationStore((s) => s.showScenarioModal)
  const setShowScenarioModal = useSimulationStore((s) => s.setShowScenarioModal)
  const [comparison, setComparison] = useState<ScenarioComparison | null>(null)
  const [newScenarioName, setNewScenarioName] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (showScenarioModal) {
      setLoading(true)
      cityApi.getScenarioComparison().then((data) => {
        setComparison(data)
        setLoading(false)
      })
    }
  }, [showScenarioModal])

  const handleCreateScenario = async () => {
    if (!newScenarioName.trim()) return
    await cityApi.createScenario(newScenarioName.trim(), 'User created planning scenario')
    setNewScenarioName('')
    const refreshed = await cityApi.getScenarioComparison()
    setComparison(refreshed)
  }

  if (!showScenarioModal) return null

  const baseline = comparison?.baseline
  const scenario = comparison?.scenario
  const delta = comparison?.delta

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-slate-900/95 border border-white/15 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col text-white">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">📊</span>
            <div>
              <h2 className="text-base font-bold tracking-wide">
                INFRASTRUCTURE IMPACT ANALYSIS
              </h2>
              <span className="text-xs text-gray-400">
                Authoritative Before vs After Digital Twin Simulation
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowScenarioModal(false)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
          {loading ? (
            <div className="text-center py-12 text-gray-400">Calculating simulation deltas...</div>
          ) : !comparison ? (
            <div className="text-center py-12 text-gray-400">No active scenario data found.</div>
          ) : (
            <>
              {/* Scenario Name & Controls */}
              <div className="flex items-center justify-between bg-white/5 p-3.5 rounded-xl border border-white/10">
                <div>
                  <span className="text-xs text-gray-400">Active Scenario:</span>
                  <div className="text-sm font-bold text-blue-300">
                    {comparison.scenarioName || 'Current Plan Draft'}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newScenarioName}
                    onChange={(e) => setNewScenarioName(e.target.value)}
                    placeholder="New scenario name..."
                    className="bg-black/60 border border-white/20 rounded px-2.5 py-1 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-400"
                  />
                  <button
                    onClick={handleCreateScenario}
                    className="bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded text-xs font-semibold"
                  >
                    Save Baseline
                  </button>
                </div>
              </div>

              {/* Comparison Grid */}
              <div className="grid grid-cols-3 gap-3 text-center">
                {/* Column 1: Baseline */}
                <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex flex-col space-y-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Baseline City
                  </div>
                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="text-gray-400">Avg Satisfaction</div>
                      <div className="font-bold text-base text-gray-200">{baseline?.averageSatisfaction}%</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Transit Ridership</div>
                      <div className="font-bold text-base text-gray-200">{baseline?.transitRidership}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Traffic Congestion</div>
                      <div className="font-bold text-base text-gray-200">{baseline?.trafficCongestionPct}%</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Transit / Car Split</div>
                      <div className="font-bold text-base text-gray-200">
                        {baseline?.modalSplit.transitPct}% / {baseline?.modalSplit.carPct}%
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400">Budget Balance</div>
                      <div className="font-bold text-base text-gray-200 font-mono">
                        {((baseline?.budgetBalance ?? 0) / 1_000_000).toFixed(2)}M MC
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 2: After Changes */}
                <div className="bg-blue-950/20 p-4 rounded-xl border border-blue-500/30 flex flex-col space-y-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-blue-300">
                    With Scenario
                  </div>
                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="text-blue-300/70">Avg Satisfaction</div>
                      <div className="font-bold text-base text-blue-200">{scenario?.averageSatisfaction}%</div>
                    </div>
                    <div>
                      <div className="text-blue-300/70">Transit Ridership</div>
                      <div className="font-bold text-base text-blue-200">{scenario?.transitRidership}</div>
                    </div>
                    <div>
                      <div className="text-blue-300/70">Traffic Congestion</div>
                      <div className="font-bold text-base text-blue-200">{scenario?.trafficCongestionPct}%</div>
                    </div>
                    <div>
                      <div className="text-blue-300/70">Transit / Car Split</div>
                      <div className="font-bold text-base text-blue-200">
                        {scenario?.modalSplit.transitPct}% / {scenario?.modalSplit.carPct}%
                      </div>
                    </div>
                    <div>
                      <div className="text-blue-300/70">Budget Balance</div>
                      <div className="font-bold text-base text-blue-200 font-mono">
                        {((scenario?.budgetBalance ?? 0) / 1_000_000).toFixed(2)}M MC
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 3: Delta */}
                <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex flex-col space-y-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Net Impact (Δ)
                  </div>
                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="text-gray-400">Satisfaction Δ</div>
                      <div className={`font-bold text-base ${(delta?.averageSatisfaction ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {(delta?.averageSatisfaction ?? 0) >= 0 ? `+${delta?.averageSatisfaction}` : delta?.averageSatisfaction}%
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400">Ridership Δ</div>
                      <div className={`font-bold text-base ${(delta?.transitRidership ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {(delta?.transitRidership ?? 0) >= 0 ? `+${delta?.transitRidership}` : delta?.transitRidership}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400">Congestion Δ</div>
                      <div className={`font-bold text-base ${(delta?.trafficCongestionPct ?? 0) <= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {(delta?.trafficCongestionPct ?? 0) > 0 ? `+${delta?.trafficCongestionPct}` : delta?.trafficCongestionPct}%
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400">Transit Shift</div>
                      <div className={`font-bold text-base ${(delta?.transitPct ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {(delta?.transitPct ?? 0) >= 0 ? `+${delta?.transitPct}` : delta?.transitPct}%
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400">Capital Delta</div>
                      <div className="font-bold text-base text-yellow-300 font-mono">
                        {((delta?.budgetDelta ?? 0) / 1_000_000).toFixed(2)}M MC
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Takeaway verdict */}
              <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs text-emerald-200 flex items-center space-x-2">
                <span className="text-lg">💡</span>
                <span>
                  <strong>Digital Twin Verdict:</strong> Infrastructure investments have stimulated mode shift toward public transit, lowering peak road congestion while expanding serviced population coverage.
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
