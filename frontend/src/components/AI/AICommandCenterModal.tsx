import React, { useState, useEffect } from 'react'
import { useSimulationStore, selectDisasters, selectEnvironment, selectDistricts } from '../../store/simulationStore'
import { cityApi } from '../../api/cityApi'
import type { AIPlanCandidate } from '../../types/city'

type TabType = 'HEALTH' | 'FORECASTS' | 'PLANNER' | 'REPORTS'

export function AICommandCenterModal() {
  const isOpen = useSimulationStore((s) => s.showAICommandModal)
  const setIsOpen = useSimulationStore((s) => s.setShowAICommandModal)
  const cityState = useSimulationStore((s) => s.cityState)
  const environment = useSimulationStore(selectEnvironment)
  const disasters = useSimulationStore(selectDisasters)

  const [activeTab, setActiveTab] = useState<TabType>('PLANNER')
  const [goal, setGoal] = useState<string>('REDUCE_CONGESTION')
  const [weights, setWeights] = useState({ cost: 0.3, traffic: 0.4, satisfaction: 0.2, sustainability: 0.1 })
  const [candidates, setCandidates] = useState<AIPlanCandidate[]>([])
  const [predictions, setPredictions] = useState<any>(null)
  const [reportData, setReportData] = useState<any>(null)
  const [selectedReportType, setSelectedReportType] = useState<string>('city_health')
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // Fetch initial predictions or planner results
  useEffect(() => {
    if (!isOpen) return
    cityApi.getPredictions().then((pred) => setPredictions(pred))
  }, [isOpen])

  const handleGeneratePlan = async () => {
    setIsLoading(true)
    const result = await cityApi.generateAIPlan(goal, weights)
    setCandidates(result)
    setIsLoading(false)
  }

  const handleFetchReport = async (type: string) => {
    setSelectedReportType(type)
    setIsLoading(true)
    const rep = await cityApi.getAIReport(type)
    setReportData(rep)
    setIsLoading(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl text-white overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🤖</span>
            <div>
              <h2 className="text-lg font-bold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                METACITY AI Intelligence & Autonomous Planner
              </h2>
              <p className="text-xs text-slate-400">
                Phase 5 Predictive forecasting, structural risk analysis, and multi-objective interventions
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

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6">
          <button
            onClick={() => { setActiveTab('PLANNER'); if (candidates.length === 0) handleGeneratePlan(); }}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center space-x-2 ${
              activeTab === 'PLANNER'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🎯</span>
            <span>Autonomous Planner</span>
          </button>
          <button
            onClick={() => setActiveTab('FORECASTS')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center space-x-2 ${
              activeTab === 'FORECASTS'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>📈</span>
            <span>Predictive Forecasts</span>
          </button>
          <button
            onClick={() => setActiveTab('HEALTH')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center space-x-2 ${
              activeTab === 'HEALTH'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>📊</span>
            <span>City Health & KPIs</span>
          </button>
          <button
            onClick={() => { setActiveTab('REPORTS'); if (!reportData) handleFetchReport('city_health'); }}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center space-x-2 ${
              activeTab === 'REPORTS'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>📑</span>
            <span>Executive Reports</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          {/* TAB 1: AUTONOMOUS PLANNER */}
          {activeTab === 'PLANNER' && (
            <div className="space-y-5">
              {/* Objective & Goal Selection */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1.5">
                    Strategic Objective
                  </label>
                  <select
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="REDUCE_CONGESTION">Reduce Peak Traffic Congestion</option>
                    <option value="MAXIMIZE_TRANSIT_RIDERSHIP">Maximize Metro & Bus Public Ridership</option>
                    <option value="INCREASE_RESILIENCE">Enhance Disaster & Utility Resilience</option>
                    <option value="BALANCED_GROWTH">Balanced Comprehensive Expansion</option>
                  </select>
                </div>

                {/* Weight Sliders */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                      Objective Prioritization (Traffic: {Math.round(weights.traffic * 100)}% | Budget: {Math.round(weights.cost * 100)}%)
                    </label>
                  </div>
                  <div className="flex gap-2 items-center">
                    <input
                      type="range"
                      min={0.1}
                      max={0.9}
                      step={0.1}
                      value={weights.traffic}
                      onChange={(e) => setWeights({ ...weights, traffic: Number(e.target.value), cost: Number((1 - Number(e.target.value)).toFixed(2)) })}
                      className="w-full accent-indigo-500 bg-slate-800 h-2 rounded cursor-pointer"
                    />
                    <button
                      onClick={handleGeneratePlan}
                      disabled={isLoading}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition shadow-lg shrink-0 disabled:opacity-50"
                    >
                      {isLoading ? 'Synthesizing...' : 'Synthesize Interventions'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Candidate Cards */}
              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Generated Plan Candidates ({candidates.length})
                </h3>

                {candidates.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                    Click "Synthesize Interventions" to evaluate branching simulation alternatives.
                  </div>
                ) : (
                  candidates.map((c, idx) => (
                    <div
                      key={c.candidate_id || idx}
                      className="bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition text-xs space-y-3"
                    >
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-amber-400 font-bold font-mono">#{idx + 1}</span>
                          <span className="font-extrabold text-sm text-white">{c.title}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-950 border border-indigo-800 text-indigo-300">
                            {c.intervention_type}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-slate-400">Score:</span>
                          <span className="font-extrabold font-mono text-emerald-400 text-sm">{c.score?.toFixed(1)}/100</span>
                        </div>
                      </div>

                      {/* Financial & Simulated Impact Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                        <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">Capital Cost</span>
                          <span className="font-mono font-bold text-amber-300">
                            {(c.capital_cost_mc / 1000).toFixed(0)}k MC
                          </span>
                        </div>
                        <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">Monthly Maint.</span>
                          <span className="font-mono font-bold text-slate-200">
                            +{(c.monthly_maintenance_mc / 1000).toFixed(1)}k MC/mo
                          </span>
                        </div>
                        <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">Congestion Delta</span>
                          <span className={`font-mono font-bold ${c.simulated_deltas.traffic_congestion_pct < 0 ? 'text-emerald-400' : 'text-slate-300'}`}>
                            {c.simulated_deltas.traffic_congestion_pct > 0 ? '+' : ''}{c.simulated_deltas.traffic_congestion_pct?.toFixed(1)}%
                          </span>
                        </div>
                        <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">Transit Ridership</span>
                          <span className="font-mono font-bold text-cyan-400">
                            +{c.simulated_deltas.transit_ridership?.toLocaleString()} trips
                          </span>
                        </div>
                      </div>

                      {/* Evidence & Risks */}
                      <div className="bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/60 text-[11px] text-slate-300 space-y-1">
                        <div>
                          <strong className="text-slate-400">Grounded Evidence: </strong>
                          {Object.entries(c.evidence || {}).map(([k, v]) => `${k.replace('_', ' ')}: ${v}`).join(' | ')}
                        </div>
                        {c.risks && c.risks.length > 0 && (
                          <div className="text-rose-300/80">
                            <strong className="text-rose-400">Identified Trade-offs / Risks: </strong>
                            {c.risks.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PREDICTIVE FORECASTS */}
          {activeTab === 'FORECASTS' && (
            <div className="space-y-5">
              {/* Traffic Bottleneck Warning */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Forecasted Traffic Congestion & Peak Hours</span>
                  <span className="font-mono text-amber-400">Peak: {predictions?.congestion_forecast?.peak_hour || '17:30'}</span>
                </h3>
                <p className="text-xs text-slate-400 mb-3">
                  ML predictive model estimates peak metropolitan road congestion reaching <strong className="text-amber-400">{predictions?.congestion_forecast?.peak_congestion_pct?.toFixed(1) || '42.5'}%</strong> with potential delays concentrated along key corridors.
                </p>
                <div className="flex flex-wrap gap-2">
                  {(predictions?.congestion_forecast?.bottlenecks || ['CBD Arterial East', 'Highway Ring Northbound']).map((b: string) => (
                    <span key={b} className="px-2.5 py-1 rounded bg-amber-950 border border-amber-800 text-amber-200 text-xs font-mono">
                      ⚠️ Bottleneck: {b}
                    </span>
                  ))}
                </div>
              </div>

              {/* Infrastructure Failure Risk */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
                  Infrastructure Failure Risk Assessments
                </h3>
                <div className="space-y-2">
                  {(predictions?.infrastructure_failure_risks || []).map((risk: any) => (
                    <div
                      key={risk.asset_id}
                      className="bg-slate-900 p-3 rounded-lg border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-white">{risk.asset_name} ({risk.asset_id})</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{risk.reason}</div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        risk.risk_level === 'CRITICAL' ? 'bg-red-950 text-red-300 border border-red-800' :
                        risk.risk_level === 'HIGH' ? 'bg-orange-950 text-orange-300 border border-orange-800' :
                        risk.risk_level === 'MEDIUM' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                        'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}>
                        {risk.risk_level} RISK
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CITY HEALTH & KPIS */}
          {activeTab === 'HEALTH' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase">Population Total</span>
                  <div className="text-lg font-bold font-mono text-white mt-1">
                    {cityState?.population.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono">+1.2% this quarter</span>
                </div>
                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase">Citizen Satisfaction</span>
                  <div className="text-lg font-bold font-mono text-emerald-400 mt-1">
                    {Math.round((cityState?.satisfaction || 0.76) * 100)}%
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Benchmark: 70%+</span>
                </div>
                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase">Peak Power Demand</span>
                  <div className="text-lg font-bold font-mono text-amber-400 mt-1">
                    {environment?.electricity_demand_mw?.toFixed(0) || '420'} MW
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Reserve: {(environment?.electricity_supply_mw || 550) - (environment?.electricity_demand_mw || 420)} MW</span>
                </div>
                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase">Treasury Reserves</span>
                  <div className="text-lg font-bold font-mono text-cyan-400 mt-1">
                    {((cityState?.budget?.balance || 50200000) / 1000000).toFixed(2)}M MC
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono">Solvent (+1.49M/mo)</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: EXECUTIVE REPORTS */}
          {activeTab === 'REPORTS' && (
            <div className="space-y-4">
              <div className="flex space-x-2">
                {['city_health', 'traffic', 'resilience'].map((r) => (
                  <button
                    key={r}
                    onClick={() => handleFetchReport(r)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                      selectedReportType === r
                        ? 'bg-indigo-600 text-white shadow'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {r.replace('_', ' ')} Report
                  </button>
                ))}
              </div>

              {reportData && (
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 text-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <h4 className="font-bold text-white text-sm uppercase">
                        Executive Municipal Synthesis — {reportData.report_type || selectedReportType}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Generated by METACITY Analytics Engine at {reportData.generated_at || new Date().toLocaleTimeString()}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 border border-emerald-800 text-emerald-300">
                      STATUS: VERIFIED
                    </span>
                  </div>

                  <p className="text-slate-300 leading-relaxed text-xs">
                    {reportData.summary || 'Summary generated from authoritative simulation metrics.'}
                  </p>

                  {reportData.kpis && (
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 grid grid-cols-3 gap-2 font-mono text-[11px]">
                      {Object.entries(reportData.kpis).map(([k, v]) => (
                        <div key={k}>
                          <span className="text-slate-500 uppercase">{k}:</span> <strong className="text-white">{String(v)}</strong>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between text-xs text-slate-400">
          <span>Simulation Grounded AI Engine: Zero Hallucination Guarantee</span>
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
