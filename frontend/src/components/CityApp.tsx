import React, { useEffect, Suspense, lazy } from 'react'
import { TopBar } from './Dashboard/TopBar'
import { LeftToolbar } from './Dashboard/LeftToolbar'
import { RightInspector } from './Dashboard/RightInspector'
import { BottomControls } from './Dashboard/BottomControls'
import { Minimap } from './Dashboard/Minimap'
import { CityCanvas } from './City3D/CityCanvas'
import { ValidationFeedback } from './Scenarios/ValidationFeedback'
import { AppErrorBoundary } from './common/AppErrorBoundary'
import { DisasterHUD } from './Disasters/DisasterHUD'
import { preloadCoreAssets } from '../assets/GLTFAssetCache'
import { cityApi } from '../api/cityApi'
import { useSimulationStore } from '../store/simulationStore'

const BudgetPanel = lazy(() => import('./Budget/BudgetPanel').then(m => ({ default: m.BudgetPanel })))
const InfrastructureImpactPanel = lazy(() => import('./Scenarios/InfrastructureImpactPanel').then(m => ({ default: m.InfrastructureImpactPanel })))
const InteriorViewerModal = lazy(() => import('./Interiors/InteriorViewerModal').then(m => ({ default: m.InteriorViewerModal })))
const DisasterLabModal = lazy(() => import('./Disasters/DisasterLabModal').then(m => ({ default: m.DisasterLabModal })))
const AICommandCenterModal = lazy(() => import('./AI/AICommandCenterModal').then(m => ({ default: m.AICommandCenterModal })))
const AskMetacityAI = lazy(() => import('./AI/AskMetacityAI').then(m => ({ default: m.AskMetacityAI })))

interface CityAppProps {
  onReturnToLanding?: () => void
}

export function CityApp({ onReturnToLanding }: CityAppProps) {
  const setInfrastructureList = useSimulationStore((s) => s.setInfrastructureList)

  // Warm up asset cache and load existing infrastructure on start
  useEffect(() => {
    preloadCoreAssets()
    cityApi.getInfrastructure().then((items) => {
      if (items.length > 0) {
        setInfrastructureList(items)
      }
    })
  }, [setInfrastructureList])

  return (
    <div className="w-screen h-screen relative overflow-hidden bg-gray-950 font-sans select-none">
      {/* 3D Simulation Viewport */}
      <div className="absolute inset-0 z-0">
        <CityCanvas />
      </div>

      {/* Main UI Overlay Layers */}
      <TopBar onReturnToLanding={onReturnToLanding} />
      <LeftToolbar />
      <RightInspector />
      <BottomControls />

      {/* Minimap — click to navigate */}
      <Minimap />

      {/* Phase 4 Heads-Up Disaster & Resilience Gauge Display */}
      <DisasterHUD />

      {/* Floating Dynamic Feedback */}
      <ValidationFeedback />

      {/* Full-Screen Modals & Drawers */}
      <Suspense fallback={null}><BudgetPanel /></Suspense>
      <Suspense fallback={null}><InfrastructureImpactPanel /></Suspense>
      <Suspense fallback={null}><DisasterLabModal /></Suspense>
      <Suspense fallback={null}><AICommandCenterModal /></Suspense>
      <Suspense fallback={null}><AskMetacityAI /></Suspense>
      <AppErrorBoundary fallbackTitle="Interior 3D Viewer">
        <Suspense fallback={null}><InteriorViewerModal /></Suspense>
      </AppErrorBoundary>
    </div>
  )
}
