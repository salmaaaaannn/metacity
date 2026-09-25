import React, { useState } from 'react'

const DISASTER_ITEMS = [
  { id: 'flood', name: 'River Overflow Flood', icon: '🌊', color: 'from-blue-600 to-cyan-700', impact: 'Inundates low-elevation terrain; closes submerged roads and shifts transit corridors.' },
  { id: 'fire', name: 'Wind-Driven Fire', icon: '🔥', color: 'from-orange-600 to-red-700', impact: 'Propagates across dense structures downwind; dispatches municipal fire response engines.' },
  { id: 'earthquake', name: 'Tectonic Seismic Rupture', icon: '🌋', color: 'from-amber-600 to-yellow-800', impact: 'Radial shockwaves cause structural degradation and secondary gas pipeline leaks.' },
  { id: 'storm', name: 'Severe Coastal Gale', icon: '⛈️', color: 'from-slate-600 to-indigo-800', impact: 'High wind vectors and torrential downpour triggering multi-hazard flood cascades.' },
  { id: 'power', name: 'Grid Stress & Blackout', icon: '⚡', color: 'from-red-600 to-rose-800', impact: 'Extreme summer cooling load causes substation trippage and traffic signal failure.' },
]

export function Section5Disasters() {
  const [selectedDisaster, setSelectedDisaster] = useState('flood')

  const active = DISASTER_ITEMS.find((d) => d.id === selectedDisaster) || DISASTER_ITEMS[0]

  return (
    <section id="sec-disasters" className="relative w-full py-28 sm:py-36 bg-[#060815] text-white overflow-hidden border-t border-white/5">
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-[11px] font-mono font-bold tracking-[0.2em] text-cyan-400 uppercase">
            05 / RESILIENCE & CASCADES
          </span>
          <h2 className="mt-3 text-4xl sm:text-5xl md:text-6xl font-black tracking-tight uppercase leading-tight">
            SIMULATE DISASTERS.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-400">
            Stress-test emergency fleets, municipal shelters, and evacuation routing under extreme multi-hazard cascades. Compute the 0–100 METACITY Simulation Resilience Index.
          </p>
        </div>

        {/* Hazard Selector Cards */}
        <div className="mt-14 grid grid-cols-2 sm:grid-cols-5 gap-3">
          {DISASTER_ITEMS.map((item) => {
            const isSelected = selectedDisaster === item.id
            return (
              <button
                key={item.id}
                onClick={() => setSelectedDisaster(item.id)}
                className={`p-4 rounded-xl border flex flex-col items-center text-center transition-all duration-300 ${
                  isSelected
                    ? `bg-gradient-to-b ${item.color} border-white shadow-[0_0_25px_rgba(7,204,244,0.3)] scale-[1.03]`
                    : 'bg-[#090E1F]/60 border-white/10 hover:border-slate-500'
                }`}
              >
                <span className="text-3xl mb-2">{item.icon}</span>
                <span className="font-mono text-xs font-bold uppercase">{item.name}</span>
              </button>
            )
          })}
        </div>

        {/* Selected Hazard Physics Panel */}
        <div className="mt-8 bg-[#090E1F]/90 border border-cyan-500/25 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="flex items-center space-x-4">
            <span className="text-4xl">{active.icon}</span>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-black text-lg text-white uppercase">{active.name}</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 border border-cyan-800 text-cyan-300">
                  PHYSICAL ENGINE: AUTHORITATIVE
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-300 max-w-xl">{active.impact}</p>
            </div>
          </div>

          <div className="shrink-0 flex items-center space-x-4 font-mono text-xs">
            <div className="text-right">
              <span className="text-slate-400 block text-[10px]">RESILIENCE RATING</span>
              <span className="font-extrabold text-emerald-400 text-sm">84.5 / 100</span>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="text-right">
              <span className="text-slate-400 block text-[10px]">MUNICIPAL SHELTERS</span>
              <span className="font-extrabold text-cyan-300 text-sm">6 READY</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
