import React, { useState, useEffect } from 'react'

interface CinematicLoaderProps {
  onComplete: () => void
}

const STEPS = [
  { id: 'grid', label: 'CITY GRID' },
  { id: 'infra', label: 'INFRASTRUCTURE' },
  { id: 'agents', label: 'AI AGENTS' },
  { id: 'engine', label: 'SIMULATION ENGINE' },
]

export function CinematicLoader({ onComplete }: CinematicLoaderProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isFading, setIsFading] = useState(false)

  useEffect(() => {
    // Quick progression completing in ~1.2s total without artificial blocking
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < STEPS.length) {
          return prev + 1
        }
        clearInterval(stepInterval)
        return prev
      })
    }, 120)

    const finishTimeout = setTimeout(() => {
      setIsFading(true)
      setTimeout(onComplete, 400)
    }, 600)

    return () => {
      clearInterval(stepInterval)
      clearTimeout(finishTimeout)
    }
  }, [onComplete])

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#060815] text-white transition-opacity duration-500 select-none ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center max-w-sm w-full px-6">
        {/* Glowing Geometric Pulse Icon */}
        <div className="relative w-12 h-12 mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-xl border border-cyan-500/30 animate-ping opacity-30" />
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-400/60 shadow-[0_0_25px_rgba(7,204,244,0.4)] flex items-center justify-center">
            <span className="font-mono text-cyan-400 font-extrabold text-sm tracking-tighter">MC</span>
          </div>
        </div>

        {/* Status Heading */}
        <h2 className="text-xs font-mono font-bold tracking-[0.25em] text-cyan-400/90 mb-5 uppercase">
          INITIALIZING METACITY
        </h2>

        {/* Step-by-step checklist */}
        <div className="w-full space-y-2 font-mono text-[11px] text-slate-400">
          {STEPS.map((step, idx) => {
            const isDone = currentStep > idx
            const isCurrent = currentStep === idx
            return (
              <div
                key={step.id}
                className="flex items-center justify-between py-1 border-b border-white/5 transition-colors duration-200"
              >
                <span className={isDone ? 'text-slate-200' : isCurrent ? 'text-cyan-300' : 'text-slate-600'}>
                  {step.label}
                </span>
                <span className="font-bold">
                  {isDone ? (
                    <span className="text-cyan-400">✓</span>
                  ) : isCurrent ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping inline-block" />
                  ) : (
                    <span className="text-slate-700">·</span>
                  )}
                </span>
              </div>
            )
          })}
        </div>

        {/* Final Brand Stamp */}
        <div className="mt-8 text-center">
          <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">
            AUTONOMOUS DIGITAL TWIN
          </span>
        </div>
      </div>
      
      <button 
        onClick={onComplete}
        className="absolute bottom-6 right-6 text-[10px] font-mono text-slate-500 hover:text-slate-300 transition-colors px-2 py-1 bg-white/5 hover:bg-white/10 rounded border border-white/10"
      >
        SKIP
      </button>
    </div>
  )
}
