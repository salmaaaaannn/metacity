import React, { useState, useEffect } from 'react'

const LOADING_STAGES = [
  'Initializing 3D World...',
  'Loading terrain & river networks...',
  'Loading architectural building assets...',
  'Loading roads & highways...',
  'Loading transit & metro lines...',
  'Loading street furniture & vegetation...',
  'Synchronizing autonomous citizens...',
]

export function LoadingScreen() {
  const [currentStage, setCurrentStage] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStage((prev) => {
        if (prev < LOADING_STAGES.length - 1) {
          return prev + 1
        }
        return prev
      })
    }, 320)

    return () => clearInterval(interval)
  }, [])

  const progress = Math.round(((currentStage + 1) / LOADING_STAGES.length) * 100)

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-slate-950 text-white select-none">
      <div className="w-full max-w-md p-8 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-md text-center">
        {/* Logo Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold tracking-widest uppercase mb-4">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          Autonomous Digital Twin
        </div>

        {/* Title */}
        <h1 className="text-4xl font-extrabold tracking-wider bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-400 bg-clip-text text-transparent mb-2">
          METACITY
        </h1>
        <p className="text-sm text-slate-400 mb-6">
          Living Autonomous AI City & Infrastructure
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden mb-4 p-0.5 border border-slate-700/50">
          <div
            className="bg-gradient-to-r from-cyan-500 to-blue-600 h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Loading Steps */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="text-cyan-300 font-mono flex items-center gap-1.5">
            <svg
              className="animate-spin h-3.5 w-3.5 text-cyan-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
            {LOADING_STAGES[currentStage]}
          </span>
          <span className="font-mono text-slate-500">{progress}%</span>
        </div>
      </div>
    </div>
  )
}
