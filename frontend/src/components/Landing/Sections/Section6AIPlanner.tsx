import React, { useState } from 'react'

const PLAN_CONCEPTS = [
  {
    id: 'plan_1',
    title: 'Rapid Metro Arterial Extension',
    type: 'TRANSIT_EXPANSION',
    cost: '1,800,000 MC',
    congestionDelta: '-8.5%',
    ridershipDelta: '+3,500 trips',
    score: 91.5,
    evidence: 'Alleviates CBD East choke point; reduces vehicle commute times by 7 minutes.',
  },
  {
    id: 'plan_2',
    title: 'District Microgrid & Solar Substation Deployment',
    type: 'GREEN_ENERGY',
    cost: '1,200,000 MC',
    congestionDelta: '0.0%',
    ridershipDelta: '0 trips',
    score: 87.2,
    evidence: 'Supplies +80 MW peak cooling reserves; boosts municipal utility resilience by +14%.',
  },
  {
    id: 'plan_3',
    title: 'Flood Defense Levee & Riverfront Promenade',
    type: 'DISASTER_MITIGATION',
    cost: '2,400,000 MC',
    congestionDelta: '-2.1%',
    ridershipDelta: '+850 trips',
    score: 89.0,
    evidence: 'Shields Riverfront Sector from 100-year storm surges and raises adjacent land values.',
  },
]

export function Section6AIPlanner() {
  const [selectedPlan, setSelectedPlan] = useState('plan_1')

  return (
    <section id="sec-ai" className="relative w-full py-28 sm:py-36 bg-[#060815] text-white overflow-hidden border-t border-white/5">
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-[11px] font-mono font-bold tracking-[0.2em] text-cyan-400 uppercase">
            06 / GROUNDED INTELLIGENCE
          </span>
          <h2 className="mt-3 text-4xl sm:text-5xl md:text-6xl font-black tracking-tight uppercase leading-tight">
            LET AI PLAN THE CITY.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-400">
            METACITY integrates an autonomous multi-objective planner that evaluates Pareto trade-offs between capital costs, congestion reduction, and citizen satisfaction—grounded strictly in authoritative physics.
          </p>
        </div>

        {/* Plan Cards Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLAN_CONCEPTS.map((p) => {
            const isSelected = selectedPlan === p.id
            return (
              <div
                key={p.id}
                onClick={() => setSelectedPlan(p.id)}
                className={`cursor-pointer rounded-2xl p-5 border transition-all duration-300 flex flex-col justify-between ${
                  isSelected
                    ? 'bg-gradient-to-b from-cyan-950/70 via-[#0A1224] to-[#060815] border-cyan-400 shadow-[0_0_30px_rgba(7,204,244,0.25)] scale-[1.02]'
                    : 'bg-[#090E1F]/60 border-white/10 hover:border-cyan-500/30'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 border border-cyan-800 text-cyan-300 font-bold">
                      {p.type}
                    </span>
                    <span className="font-mono text-xs font-bold text-emerald-400">
                      Score: {p.score}
                    </span>
                  </div>
                  <h3 className="font-black text-base text-white tracking-tight mt-1">
                    {p.title}
                  </h3>
                  <p className="mt-3 text-xs text-slate-400 leading-relaxed font-normal">
                    {p.evidence}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 grid grid-cols-3 gap-2 font-mono text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">CAPITAL</span>
                    <span className="font-bold text-amber-300">{p.cost}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">TRAFFIC</span>
                    <span className="font-bold text-emerald-400">{p.congestionDelta}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">TRANSIT</span>
                    <span className="font-bold text-cyan-300">{p.ridershipDelta}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
