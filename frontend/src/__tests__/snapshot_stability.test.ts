import { describe, it, expect } from 'vitest'
import {
  useSimulationStore,
  selectDistricts,
  selectBuildings,
  selectRoads,
  selectCitizens,
  selectVehicles,
  selectTransitLines,
  selectTransitStations,
  selectInfrastructureList,
  EMPTY_ARRAY,
  EMPTY_DISTRICTS,
  EMPTY_BUILDINGS,
} from '../store/simulationStore'
import { simulationWs } from '../api/websocket'

describe('Zustand getSnapshot Stability Tests', () => {
  it('returns strictly identical references when cityState is null', () => {
    const state = useSimulationStore.getState()

    // Repeated invocations must return the EXACT same reference
    const districts1 = selectDistricts(state)
    const districts2 = selectDistricts(state)
    expect(districts1).toBe(districts2)
    expect(districts1).toBe(EMPTY_DISTRICTS)

    const buildings1 = selectBuildings(state)
    const buildings2 = selectBuildings(state)
    expect(buildings1).toBe(buildings2)
    expect(buildings1).toBe(EMPTY_BUILDINGS)

    const roads1 = selectRoads(state)
    const roads2 = selectRoads(state)
    expect(roads1).toBe(roads2)

    const citizens1 = selectCitizens(state)
    const citizens2 = selectCitizens(state)
    expect(citizens1).toBe(citizens2)

    const vehicles1 = selectVehicles(state)
    const vehicles2 = selectVehicles(state)
    expect(vehicles1).toBe(vehicles2)

    const transit1 = selectTransitLines(state)
    const transit2 = selectTransitLines(state)
    expect(transit1).toBe(transit2)

    const stations1 = selectTransitStations(state)
    const stations2 = selectTransitStations(state)
    expect(stations1).toBe(stations2)

    const infra1 = selectInfrastructureList(state)
    const infra2 = selectInfrastructureList(state)
    expect(infra1).toBe(infra2)
  })

  it('preserves reference identity across store notifications without changes', () => {
    const snap1 = selectDistricts(useSimulationStore.getState())
    useSimulationStore.getState().setDebugMode(true)
    const snap2 = selectDistricts(useSimulationStore.getState())

    expect(snap1).toBe(snap2)
  })

  it('manages interior building selection cleanly without loops', () => {
    const store = useSimulationStore.getState()
    expect(store.interiorBuildingId).toBeNull()

    store.setInteriorBuilding('bldg_office_01')
    expect(useSimulationStore.getState().interiorBuildingId).toBe('bldg_office_01')

    store.setInteriorBuilding(null)
    expect(useSimulationStore.getState().interiorBuildingId).toBeNull()
  })
})

describe('WebSocket Client Stability Tests', () => {
  it('has controlled status tracking', () => {
    expect(simulationWs.getStatus()).toBeDefined()
  })

  it('safely handles disconnect without errors', () => {
    expect(() => simulationWs.disconnect()).not.toThrow()
    expect(simulationWs.getStatus()).toBe('STOPPED')
  })
})
