import React, { useState, useEffect, Suspense, lazy } from 'react'

const LandingPage = lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })))
const CityApp = lazy(() => import('./components/CityApp').then(m => ({ default: m.CityApp })))

export function App() {
  const [route, setRoute] = useState<'landing' | 'city'>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname
      const hash = window.location.hash
      const search = window.location.search
      if (
        path === '/city' ||
        path.startsWith('/city/') ||
        hash === '#city' ||
        search.includes('view=city')
      ) {
        return 'city'
      }
    }
    return 'landing'
  })

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname
      const hash = window.location.hash
      const search = window.location.search
      if (
        path === '/city' ||
        path.startsWith('/city/') ||
        hash === '#city' ||
        search.includes('view=city')
      ) {
        setRoute('city')
      } else {
        setRoute('landing')
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const navigateToCity = () => {
    if (window.location.pathname !== '/city') {
      window.history.pushState({}, '', '/city')
    }
    setRoute('city')
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  const navigateToLanding = () => {
    if (window.location.pathname !== '/') {
      window.history.pushState({}, '', '/')
    }
    setRoute('landing')
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  if (route === 'city') {
    return (
      <Suspense fallback={<div className="w-screen h-screen bg-gray-950" />}>
        <CityApp onReturnToLanding={navigateToLanding} />
      </Suspense>
    )
  }

  return (
    <Suspense fallback={<div className="w-screen h-screen bg-[#060815]" />}>
      <LandingPage onEnterCity={navigateToCity} />
    </Suspense>
  )
}

export default App
