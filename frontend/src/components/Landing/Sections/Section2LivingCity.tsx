import React from 'react'

const AGENT_ACTIVITIES = [
  { action: 'WORK', icon: '💼', desc: 'Commute to employment hubs and commercial districts along optimal transit paths.' },
  { action: 'TRAVEL', icon: '🚆', desc: 'Choose between walking, buses, rapid transit metro, or private vehicles using BPR cost models.' },
  { action: 'SHOP', icon: '🛍️', desc: 'Patronize localized businesses and shopping centers based on disposable household income.' },
  { action: 'EAT', icon: '🍽️', desc: 'Visit dining facilities and social nodes, adjusting routines according to leisure preferences.' },
  { action: 'COMMUNICATE', icon: '📡', desc: 'Exchange sentiment, social cohesion indices, and collective civic feedback across 12 sectors.' },
  { action: 'ADAPT', icon: '🧠', desc: 'Dynamically re-route around flooded streets, congestion bottlenecks, or infrastructure closures.' },
]

export function Section2LivingCity() {
  return (
    <section id="sec-living" className="relative w-full py-28 sm:py-36 bg-[#060815] text-white overflow-hidden border-t border-white/5">
      {/* Subtle Glow */}
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-[11px] font-mono font-bold tracking-[0.2em] text-cyan-400 uppercase">
            02 / AUTONOMOUS POPULATION
          </span>
          <h2 className="mt-3 text-4xl sm:text-5xl md:text-6xl font-black tracking-tight uppercase leading-tight">
            THE CITY IS ALIVE.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-400">
            Citizens in METACITY are not cosmetic dots. 1,000 active behavioral agents operate on a 20-state finite state machine with individual memory, fatigue, and satisfaction metrics.
          </p>
        </div>

        {/* 6 Action Pillars */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {AGENT_ACTIVITIES.map((act) => (
            <div
              key={act.action}
              className="bg-[#090E1F]/80 border border-white/10 hover:border-cyan-400/50 rounded-xl p-4 text-center flex flex-col items-center justify-between transition-all duration-300 hover:scale-[1.03] group shadow-lg"
            >
              <div className="w-12 h-12 rounded-xl bg-cyan-950/40 border border-cyan-500/20 flex items-center justify-center text-2xl group-hover:shadow-[0_0_20px_rgba(7,204,244,0.3)] group-hover:border-cyan-400 transition-all">
                {act.icon}
              </div>
              <h3 className="mt-3 font-mono font-black text-sm tracking-wider text-cyan-300">
                {act.action}
              </h3>
              <p className="mt-2 text-[11px] text-slate-400 leading-snug font-normal">
                {act.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Ambient Citizen Showcase Image */}
        <div className="mt-14 rounded-2xl overflow-hidden border border-white/10 relative shadow-2xl">
          <img
            src="/images/city-night.webp"
            alt="Living Citizen Dynamics across Metropolis"
            className="w-full h-[280px] sm:h-[340px] object-cover object-center opacity-85"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#060815] via-transparent to-[#060815]/90" />
          <div className="absolute inset-0 flex items-center justify-center text-center p-6">
            <div className="bg-[#060815]/85 backdrop-blur-md px-6 py-4 rounded-xl border border-cyan-500/30 max-w-lg">
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block mb-1">
                AGENT ENGINE SPECIFICATION
              </span>
              <p className="text-xs sm:text-sm font-mono text-slate-200">
                "Every citizen tracks home, work, commute stress, disposable income, and personal resilience across day & night cycles."
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
