import React, { useEffect } from 'react'
import { useSimulationStore } from '../../store/simulationStore'
import { cityApi } from '../../api/cityApi'

interface TopBarProps {
  onReturnToLanding?: () => void
}

export function TopBar({ onReturnToLanding }: TopBarProps = {}) {
  const state = useSimulationStore((s) => s.cityState)
  const toggleBudget = useSimulationStore((s) => s.toggleBudgetPanel)
  const isConnected = useSimulationStore((s) => s.isConnected)
  const plannerMode = useSimulationStore((s) => s.plannerMode)
  const setPlannerMode = useSimulationStore((s) => s.setPlannerMode)
  const setShowScenarioModal = useSimulationStore((s) => s.setShowScenarioModal)
  const setShowAICommandModal = useSimulationStore((s) => s.setShowAICommandModal)
  const setShowAskAIModal = useSimulationStore((s) => s.setShowAskAIModal)
  const setCityState = useSimulationStore((s) => s.setCityState)
  const undoCount = useSimulationStore((s) => s.undoCount)
  const redoCount = useSimulationStore((s) => s.redoCount)
  const setUndoRedoCounts = useSimulationStore((s) => s.setUndoRedoCounts)


  const handleUndo = async () => {
    const res = await cityApi.undoScenarioAction()
    if (res.success) {
      // Refresh city state & transactions
      const newState = await cityApi.getCityState()
      setCityState(newState)
      setUndoRedoCounts(res.remainingUndos ?? Math.max(0, undoCount - 1), redoCount + 1)
    }
  }

  const handleRedo = async () => {
    const res = await cityApi.redoScenarioAction()
    if (res.success) {
      const newState = await cityApi.getCityState()
      setCityState(newState)
      setUndoRedoCounts(undoCount + 1, res.remainingRedos ?? Math.max(0, redoCount - 1))
    }
  }

  // Global Keyboard Shortcuts: Ctrl+Z (Undo) and Ctrl+Y / Ctrl+Shift+Z (Redo)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          e.preventDefault()
          handleRedo()
        } else {
          e.preventDefault()
          handleUndo()
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault()
        handleRedo()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [undoCount, redoCount])

  if (!state) return null

  return (
    <header className="absolute top-0 left-0 w-full h-12 bg-black/85 backdrop-blur-md text-white flex items-center justify-between px-4 z-30 border-b border-white/10 shadow-lg select-none">
      {/* Brand & Connection status */}
      <div className="flex items-center space-x-3">
        <div
          onClick={onReturnToLanding}
          className="flex items-center space-x-2 cursor-pointer group"
          title="Return to Landing Page"
        >
          <span className="text-xl group-hover:scale-110 transition-transform">🏙️</span>
          <span className="font-extrabold text-sm tracking-wide bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent group-hover:text-cyan-300">
            METACITY
          </span>
          {onReturnToLanding && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-cyan-950/80 text-cyan-400 border border-cyan-800/80 hover:bg-cyan-900 transition-colors">
              ← LANDING
            </span>
          )}
          <span className="text-gray-500 text-xs hidden sm:inline">•</span>
          <span className="text-[11px] font-mono text-cyan-400/90 hidden sm:inline">
            8km × 8km
          </span>
        </div>

        <div className="flex items-center space-x-1.5 ml-2 bg-black/40 px-2 py-0.5 rounded-full border border-white/5">
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          <span className="text-[10px] text-gray-400 font-mono">{isConnected ? 'LIVE' : 'SYNCING'}</span>
        </div>
      </div>

      {/* Mode Switcher & Undo/Redo */}
      <div className="flex items-center space-x-3">
        {/* Planner Mode Toggle */}
        <button
          onClick={() => setPlannerMode(!plannerMode)}
          className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold transition-all border ${
            plannerMode
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-lg shadow-amber-500/20 animate-pulse'
              : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
          }`}
        >
          <span>{plannerMode ? '📐 PLANNER MODE' : '🔴 LIVE CITY'}</span>
        </button>

        {/* Undo / Redo */}
        <div className="flex items-center space-x-1 bg-white/5 p-0.5 rounded border border-white/10">
          <button
            onClick={handleUndo}
            title="Undo last action (Ctrl+Z)"
            className="px-2 py-1 hover:bg-white/10 text-xs rounded text-gray-300 hover:text-white flex items-center space-x-1"
          >
            <span>↩️</span>
            <span className="text-[10px] text-gray-400">Undo</span>
          </button>
          <div className="w-[1px] h-3 bg-white/20" />
          <button
            onClick={handleRedo}
            title="Redo action (Ctrl+Y)"
            className="px-2 py-1 hover:bg-white/10 text-xs rounded text-gray-300 hover:text-white flex items-center space-x-1"
          >
            <span>↪️</span>
            <span className="text-[10px] text-gray-400">Redo</span>
          </button>
        </div>

        {/* Impact Comparison Modal Button */}
        <button
          onClick={() => setShowScenarioModal(true)}
          className="flex items-center space-x-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 px-2.5 py-1 rounded text-xs font-semibold transition"
        >
          <span>📊</span>
          <span>Impact</span>
        </button>

        {/* AI Command Center Modal Button */}
        <button
          onClick={() => setShowAICommandModal(true)}
          className="flex items-center space-x-1.5 bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 px-2.5 py-1 rounded text-xs font-semibold transition"
          title="AI Autonomous Planner, Predictive Forecasts & City Health Reports"
        >
          <span>🤖</span>
          <span>AI Planner</span>
        </button>

        {/* Ask AI Natural Language Query Button */}
        <button
          onClick={() => setShowAskAIModal(true)}
          className="flex items-center space-x-1.5 bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 border border-blue-500/40 px-2.5 py-1 rounded text-xs font-semibold transition"
          title="Ask Grounded Natural Language Questions"
        >
          <span>💬</span>
          <span>Ask AI</span>
        </button>
      </div>

      {/* KPI Stats Bar */}
      <div className="flex items-center space-x-5 text-xs">
        {/* Population vs Active Agents */}
        <div className="flex items-center space-x-1.5">
          <span className="text-gray-400">Total Pop:</span>
          <span className="font-bold text-white">{state.population.toLocaleString()}</span>
          <span className="text-gray-500">|</span>
          <span className="text-gray-400">Agents:</span>
          <span className="font-bold text-yellow-400">{state.citizens?.length ?? 1000}</span>
        </div>

        {/* Budget with Ledger Toggle */}
        <button
          onClick={toggleBudget}
          className="flex items-center space-x-1.5 bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded border border-white/10 transition group"
        >
          <span className="text-gray-400 group-hover:text-gray-200">Budget:</span>
          <span className="font-bold text-green-400 font-mono">
            {(state.budget.balance / 1_000_000).toFixed(2)}M MC
          </span>
          <span className="text-[10px] text-emerald-300 font-semibold bg-emerald-950/60 px-1 py-0.5 rounded border border-emerald-600/40">
            Ledger
          </span>
        </button>

        {/* Satisfaction */}
        <div className="flex items-center space-x-1.5">
          <span className="text-gray-400">Satisfaction:</span>
          <span className="font-bold text-emerald-400">{Math.round(state.satisfaction * 100)}%</span>
        </div>

        {/* Simulation Clock */}
        <div className="flex items-center space-x-1.5 bg-white/5 px-2.5 py-1 rounded border border-white/5 font-mono text-[11px]">
          <span className="text-yellow-300">☀️</span>
          <span className="text-gray-200">{state.simTime || 'Day 1, 06:30'}</span>
        </div>
      </div>
    </header>
  )
}
