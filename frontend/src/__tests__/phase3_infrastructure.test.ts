import { describe, it, expect, beforeEach } from 'vitest'
import { useSimulationStore } from '../store/simulationStore'
import type { InfrastructureItem, BudgetTransaction, ScenarioComparison } from '../types/city'

describe('Phase 3 Infrastructure & Planning Store', () => {
  beforeEach(() => {
    useSimulationStore.setState({
      plannerMode: false,
      selectedTool: 'select',
      placementGhost: null,
      infrastructureList: [],
      transactions: [],
      undoCount: 0,
      redoCount: 0,
      showScenarioModal: false,
    })
  })

  it('toggles planner mode and sets default tool', () => {
    const store = useSimulationStore.getState()
    expect(store.plannerMode).toBe(false)
    expect(store.selectedTool).toBe('select')

    store.setPlannerMode(true)
    const updated = useSimulationStore.getState()
    expect(updated.plannerMode).toBe(true)
    expect(updated.selectedTool).toBe('road')

    store.setPlannerMode(false)
    expect(useSimulationStore.getState().plannerMode).toBe(false)
    expect(useSimulationStore.getState().selectedTool).toBe('select')
  })

  it('updates placement ghost preview coordinates and validation state', () => {
    const store = useSimulationStore.getState()
    store.setPlacementGhost({
      x: 3500,
      z: 4200,
      valid: true,
      reason: 'Valid placement location',
      validationData: {
        valid: true,
        reason: 'Valid placement location',
        constructionCost: 1500000,
        monthlyMaintenance: 15000,
        populationServed: 4500,
      },
    })

    const ghost = useSimulationStore.getState().placementGhost
    expect(ghost).not.toBeNull()
    expect(ghost?.x).toBe(3500)
    expect(ghost?.z).toBe(4200)
    expect(ghost?.valid).toBe(true)
    expect(ghost?.validationData?.constructionCost).toBe(1500000)
  })

  it('adds and removes infrastructure items', () => {
    const store = useSimulationStore.getState()
    const mockItem: InfrastructureItem = {
      id: 'infra_metro_1',
      itemType: 'metro_station',
      name: 'North District Metro Hub',
      x: 3200,
      z: 4000,
      districtId: 'd01',
      condition: 1.0,
      capacity: 2500,
      constructionCost: 1500000,
      monthlyMaintenance: 15000,
      upgradeLevel: 1,
      serviceRadius: 800,
    }

    store.addInfrastructureItem(mockItem)
    expect(useSimulationStore.getState().infrastructureList).toHaveLength(1)
    expect(useSimulationStore.getState().infrastructureList[0].name).toBe('North District Metro Hub')

    store.setSelectedInfrastructure('infra_metro_1')
    expect(useSimulationStore.getState().selectedInfrastructureId).toBe('infra_metro_1')

    store.removeInfrastructureItem('infra_metro_1')
    expect(useSimulationStore.getState().infrastructureList).toHaveLength(0)
    expect(useSimulationStore.getState().selectedInfrastructureId).toBeNull()
  })

  it('handles undo/redo count updates', () => {
    const store = useSimulationStore.getState()
    store.setUndoRedoCounts(3, 1)
    expect(useSimulationStore.getState().undoCount).toBe(3)
    expect(useSimulationStore.getState().redoCount).toBe(1)
  })

  it('stores and retrieves budget transactions in ledger', () => {
    const store = useSimulationStore.getState()
    const mockTx: BudgetTransaction = {
      id: 'tx_01',
      timestamp: Date.now() / 1000,
      amount: -1500000,
      category: 'construction',
      description: 'Built Metro Station',
      balanceAfter: 48500000,
    }

    store.setTransactions([mockTx])
    expect(useSimulationStore.getState().transactions).toHaveLength(1)
    expect(useSimulationStore.getState().transactions[0].category).toBe('construction')
    expect(useSimulationStore.getState().transactions[0].amount).toBe(-1500000)
  })

  it('manages scenario comparison data', () => {
    const store = useSimulationStore.getState()
    const mockComp: ScenarioComparison = {
      scenarioName: 'Metro Expansion Plan',
      baseline: {
        population: 539000,
        averageSatisfaction: 76,
        transitRidership: 120,
        trafficCongestionPct: 34.5,
        modalSplit: { transitPct: 35, carPct: 45, walkPct: 20 },
        budgetBalance: 50000000,
        monthlyNet: 1500000,
      },
      scenario: {
        population: 539000,
        averageSatisfaction: 81,
        transitRidership: 185,
        trafficCongestionPct: 29.1,
        modalSplit: { transitPct: 48, carPct: 32, walkPct: 20 },
        budgetBalance: 48500000,
        monthlyNet: 1485000,
      },
      delta: {
        population: 0,
        averageSatisfaction: 5,
        transitRidership: 65,
        trafficCongestionPct: -5.4,
        transitPct: 13,
        carPct: -13,
        budgetDelta: -1500000,
        monthlyNetDelta: -15000,
      },
    }

    store.setComparisonData(mockComp)
    expect(useSimulationStore.getState().comparisonData?.scenarioName).toBe('Metro Expansion Plan')
    expect(useSimulationStore.getState().comparisonData?.delta.transitPct).toBe(13)
    expect(useSimulationStore.getState().comparisonData?.delta.trafficCongestionPct).toBe(-5.4)
  })
})
