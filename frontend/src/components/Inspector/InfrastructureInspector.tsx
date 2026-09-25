import React from 'react'
import { useSimulationStore } from '../../store/simulationStore'
import { cityApi } from '../../api/cityApi'

export function InfrastructureInspector() {
  const selectedInfrastructureId = useSimulationStore((s) => s.selectedInfrastructureId)
  const setSelectedInfrastructure = useSimulationStore((s) => s.setSelectedInfrastructure)
  const infrastructureList = useSimulationStore((s) => s.infrastructureList)
  const removeInfrastructureItem = useSimulationStore((s) => s.removeInfrastructureItem)
  const setInfrastructureList = useSimulationStore((s) => s.setInfrastructureList)
  const cityState = useSimulationStore((s) => s.cityState)
  const setCityState = useSimulationStore((s) => s.setCityState)

  const item = infrastructureList.find((it) => it.id === selectedInfrastructureId)

  if (!item) {
    return (
      <div className="p-4 text-xs text-gray-400 text-center">
        Select an infrastructure facility to inspect condition, capacity, and operational parameters.
      </div>
    )
  }

  const upgradeCost = Math.round(item.constructionCost * 0.45)
  const demolishCost = Math.round(item.constructionCost * 0.15)

  const handleUpgrade = async () => {
    const res = await cityApi.upgradeInfrastructure(item.id)
    if (res.success && res.item) {
      setInfrastructureList(
        infrastructureList.map((it) => (it.id === item.id ? res.item! : it))
      )
      if (cityState && res.remainingBalance !== undefined) {
        setCityState({
          ...cityState,
          budget: {
            ...cityState.budget,
            balance: res.remainingBalance,
          },
        })
      }
    }
  }

  const handleDemolish = async () => {
    const res = await cityApi.demolishInfrastructure(item.id)
    if (res.success) {
      removeInfrastructureItem(item.id)
      setSelectedInfrastructure(null)
      if (cityState && res.remainingBalance !== undefined) {
        setCityState({
          ...cityState,
          budget: {
            ...cityState.budget,
            balance: res.remainingBalance,
          },
        })
      }
    }
  }

  return (
    <div className="flex flex-col h-full space-y-4 text-xs text-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div>
          <div className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">
            {item.itemType.replace('_', ' ')}
          </div>
          <h3 className="text-sm font-extrabold text-white">{item.name}</h3>
        </div>
        <button
          onClick={() => setSelectedInfrastructure(null)}
          className="text-gray-400 hover:text-white text-xs px-1.5 py-0.5 rounded bg-white/5"
        >
          ✕
        </button>
      </div>

      {/* Attributes Card */}
      <div className="bg-white/5 p-3 rounded-xl border border-white/5 space-y-2.5">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Upgrade Level:</span>
          <span className="font-bold text-yellow-300 font-mono">Level {item.upgradeLevel ?? 1}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-400">Condition:</span>
          <span className="font-bold text-emerald-400 font-mono">
            {Math.round((item.condition ?? 1.0) * 100)}%
          </span>
        </div>
        {/* Condition Bar */}
        <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-400 rounded-full"
            style={{ width: `${Math.round((item.condition ?? 1.0) * 100)}%` }}
          />
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-400">Design Capacity:</span>
          <span className="font-bold text-white font-mono">{item.capacity.toLocaleString()}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-400">Service Radius:</span>
          <span className="font-bold text-blue-300 font-mono">{item.serviceRadius}m</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-400">Monthly Maint:</span>
          <span className="font-bold text-red-300 font-mono">
            {Math.round(item.monthlyMaintenance).toLocaleString()} MC/mo
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2 pt-2">
        <button
          onClick={handleUpgrade}
          className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold flex items-center justify-between text-xs transition shadow-md shadow-blue-600/30"
        >
          <span>⭐ Upgrade (+50% Capacity)</span>
          <span className="font-mono text-blue-200">{(upgradeCost / 1000).toFixed(0)}k MC</span>
        </button>

        <button
          onClick={handleDemolish}
          className="w-full py-2 px-3 bg-red-600/20 hover:bg-red-600/40 border border-red-500/40 text-red-300 rounded-lg font-bold flex items-center justify-between text-xs transition"
        >
          <span>💥 Demolish (15% fee)</span>
          <span className="font-mono text-red-400">{(demolishCost / 1000).toFixed(0)}k MC</span>
        </button>
      </div>
    </div>
  )
}
