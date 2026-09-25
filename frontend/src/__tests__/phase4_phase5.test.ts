import { describe, it, expect, beforeEach } from 'vitest'
import {
  useSimulationStore,
  selectDisasters,
  selectEnvironment,
  selectResilience,
} from '../store/simulationStore'
import { cityApi, MOCK_CITY_STATE, MOCK_ENVIRONMENT_STATE, MOCK_DISASTER_HUD, MOCK_RESILIENCE_METRICS } from '../api/cityApi'

describe('METACITY Phase 4 & 5 Frontend Integration', () => {
  beforeEach(() => {
    useSimulationStore.setState({
      cityState: JSON.parse(JSON.stringify(MOCK_CITY_STATE)),
      showDisasterLabModal: false,
      showAICommandModal: false,
      showAskAIModal: false,
      environment: null,
      disasters: null,
      resilience: null,
      timelineMode: 'now',
      timelineHourOffset: 0,
      aiCandidates: [],
    })
  })

  it('initializes and selects environment and disaster states safely', () => {
    const store = useSimulationStore.getState()
    expect(store.showDisasterLabModal).toBe(false)
    expect(store.showAICommandModal).toBe(false)
    expect(store.timelineMode).toBe('now')

    const env = selectEnvironment(store)
    expect(env).toBeDefined()
    expect(env?.season).toBe('SPRING')
    expect(env?.temperature).toBeGreaterThan(0)

    const disasters = selectDisasters(store)
    expect(disasters).toBeDefined()
    expect(disasters?.active_incidents_count).toBe(0)

    const resilience = selectResilience(store)
    expect(resilience).toBeDefined()
    expect(resilience?.city_score).toBeGreaterThan(50)
  })

  it('updates timeline mode and scrub offsets', () => {
    const { setTimelineMode, setTimelineHourOffset } = useSimulationStore.getState()

    setTimelineMode('forecast')
    setTimelineHourOffset(12)

    const updated = useSimulationStore.getState()
    expect(updated.timelineMode).toBe('forecast')
    expect(updated.timelineHourOffset).toBe(12)

    setTimelineMode('past')
    setTimelineHourOffset(-6)
    expect(useSimulationStore.getState().timelineMode).toBe('past')
    expect(useSimulationStore.getState().timelineHourOffset).toBe(-6)
  })

  it('updates modal visibility states for Disaster Lab, AI Command, and Ask AI', () => {
    const {
      setShowDisasterLabModal,
      setShowAICommandModal,
      setShowAskAIModal,
    } = useSimulationStore.getState()

    setShowDisasterLabModal(true)
    expect(useSimulationStore.getState().showDisasterLabModal).toBe(true)

    setShowAICommandModal(true)
    expect(useSimulationStore.getState().showAICommandModal).toBe(true)

    setShowAskAIModal(true)
    expect(useSimulationStore.getState().showAskAIModal).toBe(true)
  })

  it('applies simulation delta with environment and disaster changes', () => {
    const { applyDelta } = useSimulationStore.getState()

    applyDelta({
      type: 'delta',
      tick: 42,
      simTime: 'Day 2, 14:00',
      simHour: 14.0,
      weather: 'STORM',
      season: 'AUTUMN',
      environment: {
        ...MOCK_ENVIRONMENT_STATE,
        weather_condition: 'STORM',
        season: 'AUTUMN',
        temperature: 18.5,
        wind_speed: 65.0,
      } as any,
      active_disasters_count: 1,
      closed_roads: ['hr_0'],
      emergency_units: [
        { id: 'u1', unit_type: 'FIRE', x: 4000, z: 4000, status: 'EN_ROUTE', target_incident_id: 'inc_1' },
      ],
    })

    const updated = useSimulationStore.getState()
    expect(updated.cityState?.simHour).toBe(14.0)
    expect(updated.cityState?.weather).toBe('STORM')
    expect(updated.cityState?.season).toBe('AUTUMN')
    expect(updated.environment?.temperature).toBe(18.5)
    expect(updated.disasters?.active_incidents_count).toBe(1)
    expect(updated.disasters?.closed_roads).toContain('hr_0')
    expect(updated.disasters?.emergency_units.length).toBe(1)
  })

  it('falls back to mock AI query and plan candidate synthesis when backend is offline', async () => {
    const queryRes = await cityApi.queryAI('What is the current population and satisfaction?')
    expect(queryRes).toBeDefined()
    expect(queryRes.answer).toContain('539,000')
    expect(queryRes.grounded_metrics).toBeDefined()

    const planCandidates = await cityApi.generateAIPlan('REDUCE_CONGESTION')
    expect(planCandidates.length).toBeGreaterThan(0)
    expect(planCandidates[0].title).toBeDefined()
    expect(planCandidates[0].capital_cost_mc).toBeGreaterThan(0)
  })
})
