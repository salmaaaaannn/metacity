import React from 'react'

interface Section7FinalCTAProps {
  onEnterCity: () => void
}

export function Section7FinalCTA({ onEnterCity }: Section7FinalCTAProps) {
  return (
    <section className="relative w-full py-32 sm:py-44 bg-[#060815] text-white overflow-hidden border-t border-white/5 flex flex-col items-center justify-center text-center">
      {/* Background Volumetric Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-cyan-500/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 relative z-10 flex flex-col items-center">
        {/* Brand Stamp */}
        <h2
          className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight text-[#F0FDFF]"
          style={{
            textShadow: '0 0 40px rgba(7,204,244,0.35)',
          }}
        >
          METACITY
        </h2>

        {/* Subtitle */}
        <div className="mt-4">
          <span className="text-xs sm:text-sm font-mono font-bold tracking-[0.2em] text-cyan-300 uppercase">
            AUTONOMOUS AI CITY DIGITAL TWIN
          </span>
        </div>

        {/* Tagline */}
        <p className="mt-4 text-base sm:text-lg text-slate-300 font-medium">
          Build a city. Let AI live in it.
        </p>

        {/* Primary Call to Action Button */}
        <div className="mt-10">
          <button
            onClick={onEnterCity}
            className="px-10 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-widest shadow-[0_0_35px_rgba(7,204,244,0.4)] hover:shadow-[0_0_55px_rgba(7,204,244,0.8)] hover:scale-105 transition-all duration-300 flex items-center space-x-2.5"
          >
            <span>ENTER METACITY</span>
            <span>→</span>
          </button>
        </div>

        {/* Minimal Footer */}
        <div className="mt-20 pt-8 border-t border-white/5 w-full flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-slate-500">
          <span>© 2026 METACITY · AUTONOMOUS LIVING DIGITAL TWIN</span>
          <span className="mt-2 sm:mt-0 text-slate-400">8KM × 8KM SIMULATION ENGINE v5.0</span>
        </div>
      </div>
    </section>
  )
}
