import { describe, it, expect, beforeEach } from 'vitest'
import { useSimulationStore } from '../store/simulationStore'
import { MOCK_CITY_STATE } from '../api/cityApi'

describe('SimulationStore', () => {
  beforeEach(() => {
    useSimulationStore.setState({
      cityState: null,
      selectedCitizenId: null,
      selectedDistrictId: null,
      isFollowingCitizen: false,
    })
  })

  it('sets city state properly', () => {
    useSimulationStore.getState().setCityState(MOCK_CITY_STATE)
    const state = useSimulationStore.getState().cityState
    expect(state).not.toBeNull()
    expect(state?.cityName).toBe('METACITY')
    expect(state?.population).toBe(539000)
    expect(state?.districts.length).toBe(12)
  })

  it('applies simulation delta update', () => {
    useSimulationStore.getState().setCityState(MOCK_CITY_STATE)
    useSimulationStore.getState().applyDelta({
      type: 'delta',
      tick: 42,
      simTime: 'Day 1, 09:30',
      simHour: 9.5,
      satisfaction: 0.89,
    })

    const state = useSimulationStore.getState().cityState
    expect(state?.simTime).toBe('Day 1, 09:30')
    expect(state?.simHour).toBe(9.5)
    expect(state?.satisfaction).toBe(0.89)
  })

  it('handles citizen selection and follow mode', () => {
    useSimulationStore.getState().setSelectedCitizen('cit_0042')
    expect(useSimulationStore.getState().selectedCitizenId).toBe('cit_0042')
    expect(useSimulationStore.getState().isFollowingCitizen).toBe(true)

    useSimulationStore.getState().setFollowingCitizen(false)
    expect(useSimulationStore.getState().isFollowingCitizen).toBe(false)
  })

  it('handles district selection', () => {
    useSimulationStore.getState().setSelectedDistrict('cbd')
    expect(useSimulationStore.getState().selectedDistrictId).toBe('cbd')
    expect(useSimulationStore.getState().selectedCitizenId).toBeNull()
  })
})