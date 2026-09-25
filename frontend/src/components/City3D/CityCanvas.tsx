import React, { useEffect } from 'react'
import { CityScene } from './CityScene'
import { cityApi } from '../../api/cityApi'
import { simulationWs } from '../../api/websocket'
import { useSimulationStore } from '../../store/simulationStore'
import { LoadingScreen } from '../Dashboard/LoadingScreen'

export function CityCanvas() {
  const setCityState = useSimulationStore((s) => s.setCityState)
  const applyDelta = useSimulationStore((s) => s.applyDelta)
  const setConnected = useSimulationStore((s) => s.setConnected)
  const isLoading = useSimulationStore((s) => s.isLoading)

  useEffect(() => {
    // 1. Initial full state fetch
    cityApi.getCityState().then((state) => {
      setCityState(state)
    })

    // 2. Connect WebSocket for live delta updates
    simulationWs.connect(
      'default',
      (delta) => {
        applyDelta(delta)
      },
      () => {
        setConnected(true)
      },
      () => {
        setConnected(false)
      }
    )

    return () => {
      simulationWs.disconnect()
    }
  }, [setCityState, applyDelta, setConnected])

  if (isLoading) return <LoadingScreen />

  return <CityScene />
}
