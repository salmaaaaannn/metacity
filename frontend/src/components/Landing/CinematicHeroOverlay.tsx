import React, { useState, useEffect, useRef } from 'react'

function AnimatedCounter({ target, duration = 1500, prefix = '', suffix = '' }: { target: number; duration?: number; prefix?: string; suffix?: string }) {
  const [value, setValue] = useState(0)
  const startTimeRef = useRef<number | null>(null)
  
  useEffect(() => {
    startTimeRef.current = null
    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp
      const progress = Math.min((timestamp - startTimeRef.current) / duration, 1)
      setValue(Math.floor(target * progress))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [target, duration])
  
  return <>{prefix}{value.toLocaleString()}{suffix}</>
}

interface CinematicHeroOverlayProps {
  elapsed: number
  onEnterCity: () => void
  onReplay: () => void
}

export function CinematicHeroOverlay({
  elapsed,
  onEnterCity,
  onReplay,
}: CinematicHeroOverlayProps) {
  // Title reveal timeline: starts rising at 5.2s
  const showTitle = elapsed >= 5.0
  // Minimal floating telemetry chips reveal gently starting at 2.5s
  const showChips = elapsed >= 2.5

  return (
    <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between p-6 sm:p-10 select-none">
      <style>{`
        @keyframes scanLine {
          0% { background-position: 0% -100%; }
          100% { background-position: 0% 200%; }
        }
      `}</style>
      {/* ── Top Minimal Floating Digital Twin Telemetry Chips ─────────── */}
      <div
        className={`w-full flex items-center justify-between transition-opacity duration-1000 ${
          showChips ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Left: Simulation Live Badge */}
        <div className="flex items-center space-x-2 bg-[#060815]/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-cyan-500/20 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#07CCF4]" />
          <span className="text-cyan-300 font-bold tracking-wider">LIVE SIMULATION</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400 text-[11px]">REAL-TIME 60 FPS</span>
        </div>

        {/* Right: Key Floating Metrics Chips (Minimal Labels) */}
        <div className="hidden md:flex items-center space-x-3 text-xs font-mono">
          <div className="bg-[#060815]/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-slate-300">
            <span className="text-cyan-400 font-bold mr-1.5"><AnimatedCounter target={539} suffix="K" /></span>
            <span className="text-slate-400 text-[10px] tracking-wider uppercase">POPULATION</span>
          </div>

          <div className="bg-[#060815]/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-slate-300">
            <span className="text-cyan-400 font-bold mr-1.5">8 × 8 KM</span>
            <span className="text-slate-400 text-[10px] tracking-wider uppercase">CITY SCALE</span>
          </div>

          <div className="bg-[#060815]/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-slate-300">
            <span className="text-cyan-400 font-bold mr-1.5"><AnimatedCounter target={1000} suffix="+" /></span>
            <span className="text-slate-400 text-[10px] tracking-wider uppercase">ACTIVE AGENTS</span>
          </div>
        </div>
      </div>

      {/* ── Center / Lower Hero Title Reveal (Rises from Below at 5.2s) ── */}
      <div className="flex flex-col items-center justify-center text-center my-auto pt-16">
        <div
          className={`transition-all duration-1000 ease-out transform ${
            showTitle
              ? 'translate-y-0 opacity-100 blur-0 scale-100'
              : 'translate-y-20 opacity-0 blur-[10px] scale-95'
          }`}
        >
          {/* Main Title with Luminous Cyan Shadow */}
          <h1
            className="text-7xl sm:text-8xl md:text-9xl font-black tracking-tight text-[#F0FDFF] flex justify-center"
            style={{
              textShadow: '0 0 30px rgba(7,204,244,0.3), 0 0 70px rgba(7,204,244,0.15)',
            }}
          >
            {"METACITY".split("").map((char, i) => (
              <span
                key={i}
                className="inline-block transition-all duration-1000 ease-out"
                style={{
                  transitionDelay: `${i * 80}ms`,
                  opacity: showTitle ? 1 : 0,
                  transform: showTitle ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.5)',
                  filter: showTitle ? 'blur(0px)' : 'blur(8px)',
                }}
              >
                {char}
              </span>
            ))}
          </h1>

          {/* Subtitle with 0.18em Letter Spacing */}
          <div className="mt-3 sm:mt-4">
            <span 
              className="text-xs sm:text-sm md:text-base font-mono font-bold uppercase tracking-[0.18em]"
              style={{
                color: 'transparent',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                backgroundImage: 'linear-gradient(180deg, #67e8f9 0%, #67e8f9 45%, #ffffff 50%, #67e8f9 55%, #67e8f9 100%)',
                backgroundSize: '100% 200%',
                animation: 'scanLine 4s infinite linear'
              }}
            >
              AUTONOMOUS AI CITY DIGITAL TWIN
            </span>
          </div>

          {/* Minimal Tagline */}
          <p className="mt-3 text-sm sm:text-base text-slate-300 font-medium tracking-wide">
            Build a city. Let AI live in it.
          </p>

          {/* Hero Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 pointer-events-auto">
            {/* Primary Button: ENTER METACITY */}
            <button
              onClick={onEnterCity}
              className="group relative px-8 py-3.5 rounded-xl bg-[#060815]/80 hover:bg-[#07CCF4]/20 border border-cyan-400/60 hover:border-cyan-300 text-white font-bold text-xs uppercase tracking-widest shadow-[0_0_25px_rgba(7,204,244,0.3)] hover:shadow-[0_0_40px_rgba(7,204,244,0.6)] hover:scale-105 transition-all duration-300 backdrop-blur-md flex items-center space-x-2"
            >
              <span>ENTER METACITY</span>
              <span className="text-cyan-400 group-hover:translate-x-1 transition-transform">→</span>
            </button>

            {/* Secondary Button: WATCH THE CITY (Replays Sequence) */}
            <button
              onClick={onReplay}
              className="px-6 py-3.5 rounded-xl bg-transparent hover:bg-white/5 border border-white/20 hover:border-cyan-400/50 text-slate-300 hover:text-white font-medium text-xs uppercase tracking-wider transition-all duration-200 flex items-center space-x-2 backdrop-blur-sm"
              title="Replay 6-second cinematic fly-in sequence"
            >
              <span>▶</span>
              <span>WATCH THE CITY</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Bottom Floating Coordinate & Prompt ──────────────────────── */}
      <div
        className={`w-full flex items-center justify-between text-[11px] font-mono text-slate-500 transition-opacity duration-1000 ${
          showTitle ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <span>COORD: 4000.00N, 4000.00E · METRO GRID v5.0</span>
        <span className="animate-bounce text-slate-400">SCROLL TO EXPLORE ↓</span>
      </div>
    </div>
  )
}
