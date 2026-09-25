import React, { useState } from 'react'

const INFRASTRUCTURE_NODES = [
  { id: 'road', name: 'Roads & Highways', icon: '🛣️', impact: 'Determines BPR travel times, vehicular routing, and commercial logistics flow.' },
  { id: 'metro', name: 'Rapid Transit Metro', icon: '🚇', impact: 'High-capacity subterranean transit slashing carbon footprint and peak road gridlock.' },
  { id: 'railway', name: 'Heavy Railway', icon: '🚆', impact: 'Inter-district transport connecting suburban perimeters to the central CBD hub.' },
  { id: 'hospital', name: 'Civic Healthcare', icon: '🏥', impact: 'Provides emergency medical dispatch radius and lifts citizen satisfaction & longevity.' },
  { id: 'airport', name: 'Aviation Infrastructure', icon: '✈️', impact: 'Global economic connectivity, regional commerce, freight logistics, and tourism.' },
  { id: 'utilities', name: 'Power & Water Grids', icon: '⚡', impact: 'Substations, solar farms, and water plants preventing blackouts during heatwaves.' },
]

export function Section3Infrastructure() {
  const [activeNode, setActiveNode] = useState<string>('metro')

  const selected = INFRASTRUCTURE_NODES.find((n) => n.id === activeNode) || INFRASTRUCTURE_NODES[0]

  return (
    <section id="sec-infrastructure" className="relative w-full py-28 sm:py-36 bg-[#060815] text-white overflow-hidden border-t border-white/5">
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-[11px] font-mono font-bold tracking-[0.2em] text-cyan-400 uppercase">
            03 / CONNECTED NETWORKS
          </span>
          <h2 className="mt-3 text-4xl sm:text-5xl md:text-6xl font-black tracking-tight uppercase leading-tight">
            INFRASTRUCTURE CHANGES EVERYTHING.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-400">
            Physical assets are topological nodes. Connecting a new arterial or metro line restructures traffic flow, land values, and employment catchment areas within seconds.
          </p>
        </div>

        {/* Infrastructure Node Selector Tabs */}
        <div className="mt-14 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {INFRASTRUCTURE_NODES.map((node) => {
            const isSelected = activeNode === node.id
            return (
              <button
                key={node.id}
                onClick={() => setActiveNode(node.id)}
                className={`flex flex-col items-center p-3.5 rounded-xl border transition-all duration-200 ${
                  isSelected
                    ? 'bg-cyan-950/60 border-cyan-400 shadow-[0_0_20px_rgba(7,204,244,0.3)] scale-[1.02]'
                    : 'bg-[#090E1F]/60 border-white/10 hover:border-cyan-500/30 text-slate-300'
                }`}
              >
                <span className="text-2xl mb-1">{node.icon}</span>
                <span className="font-mono text-xs font-bold text-white text-center line-clamp-1">{node.name}</span>
              </button>
            )
          })}
        </div>

        {/* Dynamic Topology Graphic with Network Connections */}
        <div className="mt-8 relative rounded-2xl overflow-hidden border border-cyan-500/20 shadow-2xl">
          <img
            src="/images/city-network.webp"
            alt="Infrastructure Connectivity Matrix"
            className="w-full h-[360px] sm:h-[440px] object-cover object-center"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#060815] via-transparent to-transparent opacity-90" />

          {/* Animated SVG Connection Lines Overlay */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-cyan-400/60 stroke-[1.5] fill-none">
            <line x1="20%" y1="50%" x2="50%" y2="40%" strokeDasharray="6,6" className="animate-pulse" />
            <line x1="50%" y1="40%" x2="80%" y2="55%" strokeDasharray="6,6" className="animate-pulse" />
            <line x1="50%" y1="40%" x2="50%" y2="80%" strokeDasharray="6,6" className="animate-pulse" />
            <circle cx="20%" cy="50%" r="4" fill="#07CCF4" />
            <circle cx="50%" cy="40%" r="6" fill="#63ECFE" />
            <circle cx="80%" cy="55%" r="4" fill="#07CCF4" />
          </svg>

          {/* Active Node Detail Card */}
          <div className="absolute bottom-6 left-6 right-6 bg-[#060815]/90 backdrop-blur-md p-4 sm:p-5 rounded-xl border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">{selected.icon}</span>
              <div>
                <h4 className="text-white font-extrabold text-sm uppercase">{selected.name}</h4>
                <p className="text-slate-300 text-[11px] mt-0.5">{selected.impact}</p>
              </div>
            </div>
            <div className="shrink-0 px-3 py-1.5 rounded bg-cyan-950/60 border border-cyan-800 text-cyan-300 font-bold text-center">
              SYSTEM LEVEL: AUTONOMOUS
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
