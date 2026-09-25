import React, { useState, useEffect } from 'react'
import { useSimulationStore } from '../../store/simulationStore'
import { CitizenInspector } from '../Inspector/CitizenInspector'
import { DistrictInspector } from '../Inspector/DistrictInspector'
import { InfrastructureInspector } from '../Inspector/InfrastructureInspector'
import { BuildingInspector } from '../Inspector/BuildingInspector'
import type { ToolType } from '../../types/city'

interface BuildItem {
  id: ToolType
  name: string
  icon: string
  category: 'residential' | 'commercial' | 'civic' | 'transit' | 'utilities'
  cost: string
  maint: string
  desc: string
}

const BUILD_CATALOG: BuildItem[] = [
  // Residential
  { id: 'residential', name: 'Apartment Complex', icon: '🏢', category: 'residential', cost: '650k MC', maint: '8k/mo', desc: 'Mid-to-high density residential living for working citizens.' },
  // Commercial & Office
  { id: 'commercial', name: 'Commercial Plaza', icon: '🛍️', category: 'commercial', cost: '750k MC', maint: '10k/mo', desc: 'Retail stores and dining venues providing local consumer goods.' },
  { id: 'office', name: 'Office Tower', icon: '🏬', category: 'commercial', cost: '1.8M MC', maint: '25k/mo', desc: 'High-density tech and corporate jobs boosting economic tax output.' },
  { id: 'industrial', name: 'Logistics Facility', icon: '🏭', category: 'commercial', cost: '1.4M MC', maint: '30k/mo', desc: 'Industrial logistics warehouse handling supply chain freight.' },
  // Civic & Services
  { id: 'hospital', name: 'General Hospital', icon: '🏥', category: 'civic', cost: '1.8M MC', maint: '22k/mo', desc: 'Healthcare hub improving life expectancy and district well-being.' },
  { id: 'school', name: 'Academy School', icon: '🏫', category: 'civic', cost: '950k MC', maint: '12k/mo', desc: 'Education facility upgrading citizen skills and earning power.' },
  { id: 'police', name: 'Police Precinct', icon: '🚓', category: 'civic', cost: '650k MC', maint: '8k/mo', desc: 'Suppresses crime within 1,800m service radius.' },
  { id: 'fire', name: 'Fire Station', icon: '🚒', category: 'civic', cost: '600k MC', maint: '7.5k/mo', desc: 'Emergency response ensuring fire safety and hazard mitigation.' },
  { id: 'park', name: 'Civic Park', icon: '🌳', category: 'civic', cost: '350k MC', maint: '3.5k/mo', desc: 'Public green reserve raising land value and contentment.' },
  // Transit & Roads
  { id: 'road', name: 'Standard Road', icon: '🛣️', category: 'transit', cost: '120k/km', maint: '1.2k/mo', desc: 'Two-lane urban road connecting city neighborhoods.' },
  { id: 'highway', name: 'Highway Corridor', icon: '🛣️', category: 'transit', cost: '450k/km', maint: '4.5k/mo', desc: 'High-speed 6-lane thoroughfare across the metropolis.' },
  { id: 'bridge', name: 'River Bridge', icon: '🌉', category: 'transit', cost: '1.2M/km', maint: '12k/mo', desc: 'Spans across water barriers connecting riverbanks.' },
  { id: 'metro_line', name: 'Metro Guideway', icon: '🚇', category: 'transit', cost: '850k/km', maint: '8.5k/mo', desc: 'Rapid rail transit route for high-volume citizen travel.' },
  { id: 'metro_station', name: 'Metro Station', icon: '🏛️', category: 'transit', cost: '1.25M MC', maint: '15k/mo', desc: 'Station serving as multimodal transit node.' },
  { id: 'bus_stop', name: 'Bus Shelter', icon: '🚏', category: 'transit', cost: '25k MC', maint: '250/mo', desc: 'Curbside transit link for bus lines.' },
  // Utilities
  { id: 'power_plant', name: 'Power Plant', icon: '⚡', category: 'utilities', cost: '2.5M MC', maint: '35k/mo', desc: 'High-capacity energy generation station.' },
  { id: 'water_plant', name: 'Water Treatment', icon: '💧', category: 'utilities', cost: '1.8M MC', maint: '24k/mo', desc: 'Purification and distribution water utility.' },
]

export function RightInspector() {
  const selectedCitizenId = useSimulationStore((s) => s.selectedCitizenId)
  const selectedDistrictId = useSimulationStore((s) => s.selectedDistrictId)
  const selectedInfrastructureId = useSimulationStore((s) => s.selectedInfrastructureId)
  const selectedBuildingId = useSimulationStore((s) => s.selectedBuildingId)
  const cityState = useSimulationStore((s) => s.cityState)

  const selectedTool = useSimulationStore((s) => s.selectedTool)
  const setSelectedTool = useSimulationStore((s) => s.setSelectedTool)
  const setPlannerMode = useSimulationStore((s) => s.setPlannerMode)

  const [activeTab, setActiveTab] = useState<'build' | 'inspect'>('inspect')
  const [buildCategoryFilter, setBuildCategoryFilter] = useState<string>('all')

  const hasSelection = Boolean(
    selectedBuildingId || selectedInfrastructureId || selectedCitizenId || selectedDistrictId
  )

  // Automatically switch to Inspect tab if an object in the world is selected
  useEffect(() => {
    if (hasSelection) {
      setActiveTab('inspect')
    }
  }, [hasSelection, selectedBuildingId, selectedInfrastructureId, selectedCitizenId, selectedDistrictId])

  const filteredBuildItems = BUILD_CATALOG.filter(
    (item) => buildCategoryFilter === 'all' || item.category === buildCategoryFilter
  )

  const handleSelectBuildItem = (toolId: ToolType) => {
    setSelectedTool(toolId)
    setPlannerMode(true)
  }

  return (
    <div className="absolute right-0 top-12 bottom-14 w-84 bg-black/85 backdrop-blur-md z-10 border-l border-white/10 text-white shadow-2xl flex flex-col pointer-events-auto select-none">
      {/* Tab Switcher Header */}
      <div className="flex border-b border-white/10 bg-white/5">
        <button
          onClick={() => setActiveTab('inspect')}
          className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center space-x-1.5 transition ${
            activeTab === 'inspect'
              ? 'bg-blue-600/30 text-blue-300 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <span>🔍</span>
          <span>INSPECT</span>
          {hasSelection && (
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse ml-1" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('build')}
          className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center space-x-1.5 transition ${
            activeTab === 'build'
              ? 'bg-emerald-600/30 text-emerald-300 border-b-2 border-emerald-400'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <span>🛠️</span>
          <span>BUILD</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {activeTab === 'build' ? (
          <div className="space-y-3">
            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1 pb-1">
              {[
                { id: 'all', label: 'All' },
                { id: 'residential', label: 'Housing' },
                { id: 'commercial', label: 'Work' },
                { id: 'civic', label: 'Services' },
                { id: 'transit', label: 'Transit' },
                { id: 'utilities', label: 'Utilities' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setBuildCategoryFilter(c.id)}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                    buildCategoryFilter === c.id
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white/5 hover:bg-white/10 text-gray-300'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Catalog Grid */}
            <div className="space-y-2">
              {filteredBuildItems.map((item) => {
                const isSelected = selectedTool === item.id
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectBuildItem(item.id)}
                    className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600/25 border-emerald-400 shadow-md shadow-emerald-500/20'
                        : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">{item.icon}</span>
                        <div>
                          <div className="font-bold text-xs text-white">{item.name}</div>
                          <div className="text-[10px] text-gray-400 leading-tight">{item.desc}</div>
                        </div>
                      </div>
                      <div className="text-right pl-2">
                        <div className="text-xs font-mono font-bold text-emerald-400">{item.cost}</div>
                        <div className="text-[10px] font-mono text-gray-400">{item.maint}</div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Demolish Action Card */}
            <div
              onClick={() => {
                setSelectedTool('demolish')
                setPlannerMode(false)
              }}
              className={`p-2.5 rounded-lg border cursor-pointer transition ${
                selectedTool === 'demolish'
                  ? 'bg-red-600/30 border-red-500 shadow-md shadow-red-500/20'
                  : 'bg-red-950/20 hover:bg-red-950/40 border-red-800/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">💥</span>
                  <div>
                    <div className="font-bold text-xs text-red-300">Demolish Tool</div>
                    <div className="text-[10px] text-gray-400">Click any structure to safely tear down</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-red-400 font-mono">15% fee</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Inspect Tab Content */
          <>
            {selectedBuildingId ? (
              <BuildingInspector />
            ) : selectedInfrastructureId ? (
              <InfrastructureInspector />
            ) : selectedCitizenId ? (
              <CitizenInspector />
            ) : selectedDistrictId ? (
              <DistrictInspector />
            ) : (
              <div className="flex flex-col space-y-4">
                <div className="border-b border-white/10 pb-2">
                  <h3 className="font-bold text-sm text-white">Metropolis Overview</h3>
                  <span className="text-[11px] text-gray-400">
                    Real-time digital twin summary across all 12 municipal districts.
                  </span>
                </div>

                <div className="bg-white/5 p-3 rounded-xl border border-white/5 space-y-2.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Population:</span>
                    <span className="font-bold text-white">
                      {cityState?.population?.toLocaleString() ?? '539,000'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Active AI Citizens:</span>
                    <span className="font-bold text-yellow-400">
                      {cityState?.citizens?.length ?? 1000}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Active Vehicles:</span>
                    <span className="font-bold text-blue-400">
                      {cityState?.vehicles?.length ?? 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Public Satisfaction:</span>
                    <span className="font-bold text-emerald-400">
                      {((cityState?.satisfaction ?? 0.8) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Active Districts:</span>
                    <span className="font-bold text-indigo-300">
                      {cityState?.districts?.length ?? 12}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-blue-200 space-y-1">
                  <div className="font-bold">💡 City Navigation</div>
                  <p className="text-[11px] text-gray-300">
                    • Right-Click & Drag to Orbit view angle<br />
                    • Middle-Click or Shift+Drag to Pan terrain<br />
                    • Scroll to Zoom smoothly without drift<br />
                    • Click any building to view 3D interior floors
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
