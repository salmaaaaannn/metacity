import React from 'react'

export function Section1Decisions() {
  return (
    <section id="sec-decisions" className="relative w-full py-28 sm:py-36 bg-[#060815] text-white overflow-hidden border-t border-white/5">
      {/* Background Graphic Flare */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-[11px] font-mono font-bold tracking-[0.2em] text-cyan-400 uppercase">
            01 / MACRO DYNAMICS
          </span>
          <h2 className="mt-3 text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white uppercase leading-tight">
            ONE CITY.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500">
              THOUSANDS OF DECISIONS.
            </span>
          </h2>
          <p className="mt-5 text-sm sm:text-base text-slate-400 leading-relaxed font-normal">
            Every road placed, zone rezoned, or utility dispatched cascades through 539,000 simulated inhabitants. METACITY calculates structural equilibrium in real time across economic, demographic, and physical layers.
          </p>
        </div>

        {/* Cinematic City Image Showcase */}
        <div className="mt-14 relative rounded-2xl overflow-hidden border border-cyan-500/20 shadow-[0_0_50px_rgba(7,204,244,0.15)] group">
          <img
            src="/images/city-aerial.webp"
            alt="METACITY 8km x 8km Aerial Topology"
            className="w-full h-[380px] sm:h-[480px] object-cover object-center group-hover:scale-105 transition-transform duration-700"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#060815] via-transparent to-transparent opacity-80" />

          {/* Floating Telemetry Annotation Overlays */}
          <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
            <div className="flex items-center space-x-2 bg-[#060815]/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-cyan-500/30">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-cyan-300 font-bold">TOPOLOGICAL MESH:</span>
              <span className="text-white">8,000m × 8,000m</span>
            </div>

            <div className="flex items-center space-x-2 bg-[#060815]/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-slate-300">
              <span>ACTIVE DISTRICTS:</span>
              <span className="text-emerald-400 font-bold">12 ZONED SECTORS</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
