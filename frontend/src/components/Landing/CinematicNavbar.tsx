import React, { useState, useEffect } from 'react'

interface CinematicNavbarProps {
  onEnterCity: () => void
}

export function CinematicNavbar({ onEnterCity }: CinematicNavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#060815]/90 backdrop-blur-md border-b border-white/10 py-3 shadow-[0_4px_30px_rgba(0,0,0,0.8)]'
          : 'bg-gradient-to-b from-[#060815]/80 to-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Brand */}
        <div
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center space-x-2.5 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-400/50 shadow-[0_0_15px_rgba(7,204,244,0.3)] flex items-center justify-center group-hover:border-cyan-300 transition-colors">
            <span className="font-mono text-cyan-400 font-extrabold text-xs">MC</span>
          </div>
          <span className="font-black text-base tracking-wider text-white group-hover:text-cyan-300 transition-colors">
            METACITY
          </span>
          <span className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono bg-cyan-950/60 border border-cyan-800/60 text-cyan-300 rounded">
            TWIN v5.0
          </span>
        </div>

        {/* Section Links */}
        <div className="hidden lg:flex items-center space-x-6 text-xs font-mono text-slate-300">
          <button
            onClick={() => scrollToSection('sec-decisions')}
            className="hover:text-cyan-400 transition"
          >
            01. Decisions
          </button>
          <button
            onClick={() => scrollToSection('sec-living')}
            className="hover:text-cyan-400 transition"
          >
            02. Living City
          </button>
          <button
            onClick={() => scrollToSection('sec-infrastructure')}
            className="hover:text-cyan-400 transition"
          >
            03. Infrastructure
          </button>
          <button
            onClick={() => scrollToSection('sec-whatif')}
            className="hover:text-cyan-400 transition"
          >
            04. What If
          </button>
          <button
            onClick={() => scrollToSection('sec-disasters')}
            className="hover:text-cyan-400 transition"
          >
            05. Disasters
          </button>
          <button
            onClick={() => scrollToSection('sec-ai')}
            className="hover:text-cyan-400 transition"
          >
            06. AI Planner
          </button>
        </div>

        {/* Action Button */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onEnterCity}
            className="px-4 py-2 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/50 hover:border-cyan-300 text-cyan-300 hover:text-white font-bold text-xs font-mono uppercase tracking-wider shadow-[0_0_15px_rgba(7,204,244,0.2)] hover:shadow-[0_0_20px_rgba(7,204,244,0.4)] transition-all"
          >
            Enter City →
          </button>
        </div>
      </div>
    </nav>
  )
}
