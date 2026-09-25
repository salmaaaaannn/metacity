import { describe, it, expect } from 'vitest'
import { useSimulationStore } from '../store/simulationStore'

describe('Inspectors State Integration', () => {
  it('opens and closes citizen inspector via state', () => {
    useSimulationStore.getState().setSelectedCitizen('cit_0001')
    expect(useSimulationStore.getState().selectedCitizenId).toBe('cit_0001')
    expect(useSimulationStore.getState().isFollowingCitizen).toBe(true)

    useSimulationStore.getState().setSelectedCitizen(null)
    expect(useSimulationStore.getState().selectedCitizenId).toBeNull()
  })

  it('switches between citizen and district inspectors mutually exclusively', () => {
    useSimulationStore.getState().setSelectedCitizen('cit_0002')
    expect(useSimulationStore.getState().selectedCitizenId).toBe('cit_0002')
    expect(useSimulationStore.getState().selectedDistrictId).toBeNull()

    useSimulationStore.getState().setSelectedDistrict('cbd')
    expect(useSimulationStore.getState().selectedDistrictId).toBe('cbd')
    expect(useSimulationStore.getState().selectedCitizenId).toBeNull()
    expect(useSimulationStore.getState().isFollowingCitizen).toBe(false)
  })
})
