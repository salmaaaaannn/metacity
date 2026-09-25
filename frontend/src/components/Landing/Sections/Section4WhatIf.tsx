import React, { useState } from 'react'

const SCENARIO_STAGES = [
  { step: '01', title: 'BASELINE', desc: 'Authoritative snapshot of current city density, gridlock index, and municipal budget.' },
  { step: '02', title: 'ADD METRO', desc: 'Construct rapid transit line spanning District 1 (CBD) to District 2 (Residential).' },
  { step: '03', title: 'TRAFFIC CHANGES', desc: 'Corridor congestion plummets by 8.5%; modal split shifts +6.2% into public transit.' },
  { step: '04', title: 'POPULATION MOVES', desc: 'High-density residential clusters emerge around new stations; pedestrian footfall surges.' },
  { step: '05', title: 'BUSINESSES ADAPT', desc: 'Retail and office occupancy climbs +14%; tax yields boost municipal treasury balance.' },
  { step: '06', title: 'CITY EVOLVES', desc: 'Autonomous digital twin updates land valuation and environmental quality city-wide.' },
]

export function Section4WhatIf() {
  const [activeStep, setActiveStep] = useState(2)

  return (
    <section id="sec-whatif" className="relative w-full py-28 sm:py-36 bg-[#060815] text-white overflow-hidden border-t border-white/5">
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-[11px] font-mono font-bold tracking-[0.2em] text-cyan-400 uppercase">
            04 / COUNTERFACTUAL SANDBOX
          </span>
          <h2 className="mt-3 text-4xl sm:text-5xl md:text-6xl font-black tracking-tight uppercase leading-tight">
            WHAT IF?
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-400">
            METACITY's branching scenario engine lets planners test multi-million MC interventions in an isolated state clone before breaking ground in the real world.
          </p>
        </div>

        {/* Vertical / Horizontal Flow Pipeline */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-6 gap-3">
          {SCENARIO_STAGES.map((st, idx) => {
            const isSelected = activeStep === idx
            return (
              <div
                key={st.step}
                onClick={() => setActiveStep(idx)}
                className={`cursor-pointer rounded-xl p-4 border transition-all duration-300 flex flex-col justify-between ${
                  isSelected
                    ? 'bg-gradient-to-b from-cyan-950/70 to-blue-950/50 border-cyan-400 shadow-[0_0_25px_rgba(7,204,244,0.25)] scale-[1.03]'
                    : 'bg-[#090E1F]/50 border-white/10 hover:border-cyan-500/30'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold text-cyan-400">{st.step}</span>
                    {idx < SCENARIO_STAGES.length - 1 && (
                      <span className="text-slate-600 text-xs hidden md:inline">→</span>
                    )}
                  </div>
                  <h3 className="font-mono font-black text-xs sm:text-sm tracking-wide text-white uppercase">
                    {st.title}
                  </h3>
                </div>
                <p className="mt-3 text-[11px] text-slate-400 leading-snug font-normal">
                  {st.desc}
                </p>
              </div>
            )
          })}
        </div>

        {/* Live Simulation Sandbox Visual Indicator */}
        <div className="mt-10 bg-[#090E1F]/90 p-5 rounded-2xl border border-cyan-500/25 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🔄</span>
            <div>
              <span className="text-cyan-400 font-bold uppercase">ISOLATED MEMORY CLONE:</span>
              <p className="text-slate-300 text-[11px] mt-0.5">
                Authoritative simulation engine branches state in-memory without mutating the live city until committed.
              </p>
            </div>
          </div>
          <div className="shrink-0 px-3.5 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/40 text-cyan-300 font-bold">
            UNDO / REDO READY
          </div>
        </div>
      </div>
    </section>
  )
}
