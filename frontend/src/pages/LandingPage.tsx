import React, { useState, useCallback } from 'react'
import { CinematicNavbar } from '../components/Landing/CinematicNavbar'
import { CinematicHeroCity } from '../components/Landing/CinematicHeroCity'
import { CinematicHeroOverlay } from '../components/Landing/CinematicHeroOverlay'
import { CinematicLoader } from '../components/Landing/CinematicLoader'
import { Section1Decisions } from '../components/Landing/Sections/Section1Decisions'
import { Section2LivingCity } from '../components/Landing/Sections/Section2LivingCity'
import { Section3Infrastructure } from '../components/Landing/Sections/Section3Infrastructure'
import { Section4WhatIf } from '../components/Landing/Sections/Section4WhatIf'
import { Section5Disasters } from '../components/Landing/Sections/Section5Disasters'
import { Section6AIPlanner } from '../components/Landing/Sections/Section6AIPlanner'
import { Section7FinalCTA } from '../components/Landing/Sections/Section7FinalCTA'

interface LandingPageProps {
  onEnterCity: () => void
}

export function LandingPage({ onEnterCity }: LandingPageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [replayKey, setReplayKey] = useState(0)
  const [heroElapsed, setHeroElapsed] = useState(0)

  const handleTimelineProgress = useCallback((t: number) => {
    setHeroElapsed(t)
  }, [])

  const handleReplay = useCallback(() => {
    setHeroElapsed(0)
    setReplayKey((prev) => prev + 1)
  }, [])

  return (
    <div className="w-full min-h-screen bg-[#060815] text-slate-100 overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* ── 1. High-Tech 1.2s Initialization Sequence ─────────────────── */}
      {isLoading && <CinematicLoader onComplete={() => setIsLoading(false)} />}

      {/* ── 2. Top Minimalist Translucent Navbar ───────────────────────── */}
      <CinematicNavbar onEnterCity={onEnterCity} />

      {/* ── 3. Full-Screen (100vh) Cinematic 3D Hero ──────────────────── */}
      <section className="relative w-full h-screen min-h-[640px] overflow-hidden bg-[#060815]">
        {/* Living 3D City + Option C Video Layer with 6-Second Camera Animation */}
        <CinematicHeroCity
          replayKey={replayKey}
          onTimelineProgress={handleTimelineProgress}
        />

        {/* Minimalist Floating HUD & Title Rising from Below */}
        <CinematicHeroOverlay
          elapsed={heroElapsed}
          onEnterCity={onEnterCity}
          onReplay={handleReplay}
        />
      </section>

      {/* ── 4. The 7 Cinematic Story Scroll Sections ──────────────────── */}
      <Section1Decisions />
      <Section2LivingCity />
      <Section3Infrastructure />
      <Section4WhatIf />
      <Section5Disasters />
      <Section6AIPlanner />
      <Section7FinalCTA onEnterCity={onEnterCity} />
    </div>
  )
}

export default LandingPage
