import React, { useState } from 'react'
import { useSimulationStore } from '../../store/simulationStore'
import type { ToolType } from '../../types/city'

interface ToolDef {
  id: ToolType
  name: string
  icon: string
  cost: string
  maintenance: string
  desc: string
}

const TOOL_CATEGORIES: { id: string; name: string; icon: string; tools: ToolDef[] }[] = [
  {
    id: 'transport',
    name: 'Transport',
    icon: '🚆',
    tools: [
      { id: 'road', name: 'Standard Road', icon: '🛣️', cost: '120k/km', maintenance: '1.2k/mo', desc: 'Two-lane urban road for vehicles and bus routes.' },
      { id: 'highway', name: 'Highway', icon: '🛣️', cost: '450k/km', maintenance: '4.5k/mo', desc: 'Four-lane high-speed corridor for cross-city travel.' },
      { id: 'bridge', name: 'River Bridge', icon: '🌉', cost: '1.2M/km', maintenance: '12k/mo', desc: 'Engineered bridge structure allowing transit over the river.' },
      { id: 'metro_line', name: 'Metro Line', icon: '🚇', cost: '850k/km', maintenance: '8.5k/mo', desc: 'Underground/elevated rapid transit tracks.' },
      { id: 'metro_station', name: 'Metro Station', icon: '🏛️', cost: '1.5M', maintenance: '15k/mo', desc: 'High-capacity rapid transit station serving surrounding districts.' },
      { id: 'bus_stop', name: 'Bus Stop', icon: '🚏', cost: '25k', maintenance: '250/mo', desc: 'Curbside stop connecting citizens to municipal bus network.' },
    ],
  },
  {
    id: 'services',
    name: 'Services',
    icon: '🏥',
    tools: [
      { id: 'hospital', name: 'Hospital', icon: '🏥', cost: '1.8M', maintenance: '22k/mo', desc: 'Regional medical center improving district healthcare access and lifespan.' },
      { id: 'school', name: 'Academy / School', icon: '🏫', cost: '950k', maintenance: '12k/mo', desc: 'Educational institution boosting productivity and tax revenues.' },
      { id: 'police', name: 'Police Precinct', icon: '🚓', cost: '650k', maintenance: '8k/mo', desc: 'Enforces civic safety, reducing crime and stress in 1,200m radius.' },
      { id: 'fire', name: 'Fire Station', icon: '🚒', cost: '600k', maintenance: '7.5k/mo', desc: 'Provides rapid emergency response and disaster resilience.' },
      { id: 'park', name: 'Civic Park', icon: '🌳', cost: '350k', maintenance: '3.5k/mo', desc: 'Green sanctuary uplifting citizen happiness and environmental quality.' },
    ],
  },
  {
    id: 'utilities',
    name: 'Utilities',
    icon: '⚡',
    tools: [
      { id: 'power_plant', name: 'Power Plant', icon: '🏭', cost: '2.5M', maintenance: '35k/mo', desc: 'Industrial energy facility supplying power to entire sectors.' },
      { id: 'solar_farm', name: 'Solar Array', icon: '☀️', cost: '1.2M', maintenance: '6k/mo', desc: 'Clean renewable power with zero emissions.' },
      { id: 'water_plant', name: 'Water Treatment', icon: '💧', cost: '1.8M', maintenance: '24k/mo', desc: 'Purification and distribution facility providing fresh water.' },
      { id: 'recycling', name: 'Recycling Facility', icon: '♻️', cost: '800k', maintenance: '10k/mo', desc: 'Advanced waste processing reducing environmental pollution.' },
    ],
  },
  {
    id: 'zoning',
    name: 'Zoning',
    icon: '🏗️',
    tools: [
      { id: 'residential', name: 'Residential Zone', icon: '🏡', cost: '150k', maintenance: '1.5k/mo', desc: 'Designates land for citizen homes and apartments.' },
      { id: 'commercial', name: 'Commercial Zone', icon: '🛍️', cost: '200k', maintenance: '2k/mo', desc: 'Stores, restaurants, and entertainment venues generating sales tax.' },
      { id: 'office', name: 'Tech & Office', icon: '🏢', cost: '300k', maintenance: '3k/mo', desc: 'Corporate towers for high-income professional jobs.' },
      { id: 'industrial', name: 'Industrial Zone', icon: '🏭', cost: '250k', maintenance: '2.5k/mo', desc: 'Heavy manufacturing and logistics providing industrial output.' },
    ],
  },
  {
    id: 'operations',
    name: 'Operations',
    icon: '🔧',
    tools: [
      { id: 'select', name: 'Inspect & Select', icon: '🖱️', cost: 'Free', maintenance: '0', desc: 'Select citizens, buildings, or infrastructure to inspect details.' },
      { id: 'upgrade', name: 'Upgrade Tool', icon: '⭐', cost: 'Variable', maintenance: '+25%', desc: 'Click existing infrastructure to upgrade capacity by +50%.' },
      { id: 'demolish', name: 'Demolish Tool', icon: '💥', cost: '15% fee', maintenance: '0', desc: 'Safely tear down infrastructure and clean up network routing.' },
    ],
  },
]

export function LeftToolbar() {
  const selectedTool = useSimulationStore((s) => s.selectedTool)
  const setSelectedTool = useSimulationStore((s) => s.setSelectedTool)
  const setPlannerMode = useSimulationStore((s) => s.setPlannerMode)
  const plannerMode = useSimulationStore((s) => s.plannerMode)

  const [activeCategory, setActiveCategory] = useState<string>('transport')
  const [hoveredTool, setHoveredTool] = useState<ToolDef | null>(null)

  const handleToolClick = (tool: ToolDef) => {
    setSelectedTool(tool.id)
    if (tool.id !== 'select' && !plannerMode) {
      setPlannerMode(true)
    }
  }

  const currentCategory = TOOL_CATEGORIES.find((c) => c.id === activeCategory)

  return (
    <div className="absolute left-0 top-12 bottom-16 flex z-20 pointer-events-auto">
      {/* Category Sidebar */}
      <div className="w-14 bg-black/85 backdrop-blur-md border-r border-white/10 flex flex-col items-center py-3 space-y-3 shadow-xl">
        {TOOL_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            title={cat.name}
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all ${
              activeCategory === cat.id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105 border border-blue-400/50'
                : 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white'
            }`}
          >
            {cat.icon}
          </button>
        ))}
      </div>

      {/* Tools Drawer */}
      <div className="w-64 bg-black/90 backdrop-blur-lg border-r border-white/10 p-3 flex flex-col justify-between shadow-2xl text-white">
        <div>
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10">
            <span className="font-bold text-sm tracking-wide text-gray-200">
              {currentCategory?.name.toUpperCase()} TOOLS
            </span>
            <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30 font-semibold">
              {plannerMode ? 'PLANNER ACTIVE' : 'OBSERVING'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {currentCategory?.tools.map((tool) => {
              const isSelected = selectedTool === tool.id
              return (
                <button
                  key={tool.id}
                  onClick={() => handleToolClick(tool)}
                  onMouseEnter={() => setHoveredTool(tool)}
                  onMouseLeave={() => setHoveredTool(null)}
                  className={`p-2.5 rounded-lg flex flex-col items-center justify-center text-center transition-all ${
                    isSelected
                      ? 'bg-blue-600/30 border-2 border-blue-400 text-white shadow-md shadow-blue-500/20'
                      : 'bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white'
                  }`}
                >
                  <span className="text-2xl mb-1">{tool.icon}</span>
                  <span className="text-xs font-semibold leading-tight line-clamp-1">{tool.name}</span>
                  <span className="text-[10px] text-green-400 font-mono mt-0.5">{tool.cost}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Dynamic Tool Info / Tooltip Box */}
        {hoveredTool ? (
          <div className="bg-white/5 p-3 rounded-lg border border-white/10 text-xs mt-3 space-y-1.5 animate-fade-in">
            <div className="flex justify-between items-center">
              <span className="font-bold text-blue-300">{hoveredTool.name}</span>
              <span className="text-emerald-400 font-mono font-semibold">{hoveredTool.cost}</span>
            </div>
            <p className="text-[11px] text-gray-300 leading-relaxed">{hoveredTool.desc}</p>
            <div className="text-[10px] text-gray-400 flex justify-between pt-1 border-t border-white/10">
              <span>Maint: <strong className="text-gray-200">{hoveredTool.maintenance}</strong></span>
              <span>Authoritative</span>
            </div>
          </div>
        ) : (
          <div className="bg-white/5 p-2.5 rounded-lg border border-white/5 text-[11px] text-gray-400 mt-3 text-center">
            Click any tool to place in 3D city view. Double-click or drag for roads/lines.
          </div>
        )}
      </div>
    </div>
  )
}
