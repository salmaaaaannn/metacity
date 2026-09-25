import React from 'react'

interface CinematicHeroOverlayProps {
  onEnterCity: () => void
  elapsed?: number
  onReplay?: () => void
}

export function CinematicHeroOverlay({ onEnterCity }: CinematicHeroOverlayProps) {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-center items-center z-20 overflow-hidden">
      <style>{`
        .cinematic-fade { 
          opacity: 0;
          animation: fadeScale 1.5s ease-out 4.0s forwards; 
        }
        
        @keyframes fadeScale {
          from { opacity: 0; transform: scale(0.95) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>

      {/* Typography Block */}
      <div className="cinematic-fade flex flex-col items-center pointer-events-auto select-none mt-16 md:mt-0">
        
        <h1 className="text-[#F5F7FA] text-6xl md:text-8xl lg:text-[140px] font-black tracking-tighter leading-none drop-shadow-2xl">
          METACITY
        </h1>
        
        <h2 className="text-[#00E5FF] text-3xl md:text-5xl lg:text-7xl font-bold tracking-[0.2em] mt-2 mb-8 drop-shadow-[0_0_20px_rgba(0,229,255,0.6)]">
          NEXUS
        </h2>
        
        <p className="text-[#9BA7B4] uppercase tracking-[0.4em] text-xs md:text-sm font-medium mb-12 text-center max-w-xl px-4">
          Build virtually. Plan smarter.
        </p>
        
        <button 
          onClick={onEnterCity}
          className="bg-transparent border border-[#2A3441] hover:border-[#00E5FF] hover:bg-[#00E5FF]/10 text-white px-10 py-4 rounded font-mono text-xs uppercase tracking-widest transition-all transform hover:scale-105 backdrop-blur-sm"
        >
          Initialize System
        </button>
      </div>
    </div>
  )
}
