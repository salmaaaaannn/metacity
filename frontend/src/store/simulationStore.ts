import { create } from 'zustand'
import type {
  CityState,
  SimulationDelta,
  ToolType,
  OverlayMode,
  CitizenDetail,
  DistrictMetrics,
  InfrastructureItem,
  InfrastructureValidationResponse,
  Scenario,
  ScenarioComparison,
  BudgetTransaction,
  District,
  Building,
  Road,
  CitizenPosition,
  VehiclePosition,
  TransitLine,
  MetroStation,
  EnvironmentState,
  DisasterHUDData,
  ResilienceMetrics,
  AIPlanCandidate,
} from '../types/city'

export interface PlacementGhostState {
  x: number
  z: number
  endX?: number
  endZ?: number
  valid: boolean
  reason?: string
  validationData?: InfrastructureValidationResponse
}

interface SimulationStore {
  // City state
  cityState: CityState | null
  isLoading: boolean
  isConnected: boolean

  // UI & Tool state
  plannerMode: boolean
  selectedTool: ToolType
  selectedObjectId: string | null
  selectedBuildingId: string | null
  interiorBuildingId: string | null
  selectedCitizenId: string | null
  selectedDistrictId: string | null
  selectedInfrastructureId: string | null
  citizenDetail: CitizenDetail | null
  districtMetrics: DistrictMetrics | null
  isFollowingCitizen: boolean

  // Infrastructure & Editor state
  placementGhost: PlacementGhostState | null
  infrastructureList: InfrastructureItem[]
  transactions: BudgetTransaction[]
  scenariosList: Scenario[]
  activeScenario: Scenario | null
  comparisonData: ScenarioComparison | null
  showScenarioModal: boolean
  undoCount: number
  redoCount: number

  // Phase 4: Environment & Disasters
  showDisasterLabModal: boolean
  environment: EnvironmentState | null
  disasters: DisasterHUDData | null
  resilience: ResilienceMetrics | null

  // Phase 5: AI & Intelligence
  showAICommandModal: boolean
  showAskAIModal: boolean
  aiCandidates: AIPlanCandidate[]
  timelineMode: 'past' | 'now' | 'forecast'
  timelineHourOffset: number

  overlayMode: OverlayMode
  simSpeed: number
  isPaused: boolean
  showBudgetPanel: boolean
  debugMode: boolean
  streetViewMode: boolean
  timeOfDay: 'auto' | 'day' | 'sunset' | 'night'

  // Actions
  setDebugMode: (debug: boolean) => void
  setStreetViewMode: (enabled: boolean) => void
  setTimeOfDay: (time: 'auto' | 'day' | 'sunset' | 'night') => void
  setCityState: (state: CityState) => void
  applyDelta: (delta: SimulationDelta) => void
  setPlannerMode: (enabled: boolean) => void
  setSelectedTool: (tool: ToolType) => void
  setSelectedObject: (id: string | null) => void
  setSelectedBuilding: (id: string | null) => void
  setInteriorBuilding: (id: string | null) => void
  setSelectedCitizen: (id: string | null) => void
  setSelectedDistrict: (id: string | null) => void
  setSelectedInfrastructure: (id: string | null) => void
  setPlacementGhost: (ghost: PlacementGhostState | null) => void
  setInfrastructureList: (items: InfrastructureItem[]) => void
  addInfrastructureItem: (item: InfrastructureItem) => void
  removeInfrastructureItem: (id: string) => void
  setCitizenDetail: (detail: CitizenDetail | null) => void
  setDistrictMetrics: (metrics: DistrictMetrics | null) => void
  setFollowingCitizen: (following: boolean) => void
  setOverlayMode: (mode: OverlayMode) => void
  setSimSpeed: (speed: number) => void
  setPaused: (paused: boolean) => void
  setConnected: (connected: boolean) => void
  setLoading: (loading: boolean) => void
  toggleBudgetPanel: () => void
  setTransactions: (txs: BudgetTransaction[]) => void
  setScenariosList: (scenarios: Scenario[]) => void
  setActiveScenario: (scenario: Scenario | null) => void
  setComparisonData: (data: ScenarioComparison | null) => void
  setShowScenarioModal: (show: boolean) => void
  setUndoRedoCounts: (undo: number, redo: number) => void

  // Phase 4 & 5 Actions
  setShowDisasterLabModal: (show: boolean) => void
  setEnvironment: (env: EnvironmentState | null) => void
  setDisasters: (hud: DisasterHUDData | null) => void
  setResilience: (resilience: ResilienceMetrics | null) => void
  setShowAICommandModal: (show: boolean) => void
  setShowAskAIModal: (show: boolean) => void
  setAICandidates: (candidates: AIPlanCandidate[]) => void
  setTimelineMode: (mode: 'past' | 'now' | 'forecast') => void
  setTimelineHourOffset: (offset: number) => void
}

export const useSimulationStore = create<SimulationStore>((set) => ({
  cityState: null,
  isLoading: true,
  isConnected: false,

  plannerMode: false,
  selectedTool: 'select',
  selectedObjectId: null,
  selectedBuildingId: null,
  interiorBuildingId: null,
  selectedCitizenId: null,
  selectedDistrictId: null,
  selectedInfrastructureId: null,
  citizenDetail: null,
  districtMetrics: null,
  isFollowingCitizen: false,

  placementGhost: null,
  infrastructureList: [],
  transactions: [],
  scenariosList: [],
  activeScenario: null,
  comparisonData: null,
  showScenarioModal: false,
  undoCount: 0,
  redoCount: 0,

  showDisasterLabModal: false,
  environment: null,
  disasters: null,
  resilience: null,
  showAICommandModal: false,
  showAskAIModal: false,
  aiCandidates: [],
  timelineMode: 'now',
  timelineHourOffset: 0,

  overlayMode: 'normal',
  simSpeed: 1,
  isPaused: false,
  showBudgetPanel: false,
  debugMode: false,
  streetViewMode: false,
  timeOfDay: 'auto',

  setDebugMode: (debug) => set({ debugMode: debug }),
  setStreetViewMode: (enabled) => set({ streetViewMode: enabled }),
  setTimeOfDay: (time) => set({ timeOfDay: time }),

  setCityState: (state) => set({
    cityState: state,
    isLoading: false,
    environment: state.environment ?? null,
    disasters: state.disasters ?? null,
    resilience: state.resilience ?? null,
  }),

  applyDelta: (delta) => set((prev) => {
    if (!prev.cityState) return {}
    // Prefer the full disasters object from delta (contains incidents with epicenter positions)
    const updatedDisasters = (delta as any).disasters
      ? { ...((prev.disasters || prev.cityState.disasters) || {}), ...(delta as any).disasters }
      : delta.active_disasters_count !== undefined ? {
        ...(prev.disasters || prev.cityState.disasters || {
          active_incidents_count: 0,
          incidents: [],
          affected_population: 0,
          affected_buildings_count: 0,
          closed_roads_count: 0,
          closed_roads: [],
          evacuated_citizens: 0,
          emergency_vehicles_active: 0,
          emergency_units: [],
          total_estimated_damage: 0,
          shelters: [],
        }),
        active_incidents_count: delta.active_disasters_count,
        closed_roads: delta.closed_roads ?? prev.cityState.disasters?.closed_roads ?? [],
        emergency_units: delta.emergency_units ?? prev.cityState.disasters?.emergency_units ?? [],
      } : (prev.disasters || prev.cityState.disasters)

    const updatedEnv = delta.environment ?? prev.environment ?? prev.cityState.environment

    return {
      environment: updatedEnv,
      disasters: updatedDisasters,
      cityState: {
        ...prev.cityState,
        simTime: delta.simTime || prev.cityState.simTime,
        simHour: delta.simHour ?? prev.cityState.simHour,
        season: delta.season ?? prev.cityState.season,
        weather: delta.weather ?? prev.cityState.weather,
        environment: updatedEnv,
        disasters: updatedDisasters,
        population: delta.population ?? prev.cityState.population,
        satisfaction: delta.satisfaction ?? prev.cityState.satisfaction,
        citizens: delta.citizens || prev.cityState.citizens,
        vehicles: delta.vehicles || prev.cityState.vehicles,
        budget: delta.budget ? { ...prev.cityState.budget, ...delta.budget } as any : prev.cityState.budget,
      }
    }
  }),


  setPlannerMode: (enabled) => set({
    plannerMode: enabled,
    selectedTool: enabled ? 'road' : 'select',
    placementGhost: null,
  }),
  setSelectedTool: (tool) => set({ selectedTool: tool, placementGhost: null }),
  setSelectedObject: (id) => set({ selectedObjectId: id }),
  setSelectedBuilding: (id) => set({
    selectedBuildingId: id,
    selectedCitizenId: null,
    selectedDistrictId: null,
    selectedInfrastructureId: null,
  }),
  setInteriorBuilding: (id) => set({ interiorBuildingId: id }),
  setSelectedCitizen: (id) => set({
    selectedCitizenId: id,
    selectedBuildingId: null,
    selectedDistrictId: null,
    selectedInfrastructureId: null,
    isFollowingCitizen: id ? true : false,
  }),
  setSelectedDistrict: (id) => set({
    selectedDistrictId: id,
    selectedCitizenId: null,
    selectedInfrastructureId: null,
    isFollowingCitizen: false,
  }),
  setSelectedInfrastructure: (id) => set({
    selectedInfrastructureId: id,
    selectedCitizenId: null,
    selectedDistrictId: null,
    isFollowingCitizen: false,
  }),
  setPlacementGhost: (ghost) => set({ placementGhost: ghost }),
  setInfrastructureList: (items) => set({ infrastructureList: items }),
  addInfrastructureItem: (item) => set((s) => ({ infrastructureList: [...s.infrastructureList, item] })),
  removeInfrastructureItem: (id) => set((s) => ({
    infrastructureList: s.infrastructureList.filter((it) => it.id !== id),
    selectedInfrastructureId: s.selectedInfrastructureId === id ? null : s.selectedInfrastructureId,
  })),
  setCitizenDetail: (detail) => set({ citizenDetail: detail }),
  setDistrictMetrics: (metrics) => set({ districtMetrics: metrics }),
  setFollowingCitizen: (following) => set({ isFollowingCitizen: following }),
  setOverlayMode: (mode) => set({ overlayMode: mode }),
  setSimSpeed: (speed) => set({ simSpeed: speed }),
  setPaused: (paused) => set({ isPaused: paused }),
  setConnected: (connected) => set({ isConnected: connected }),
  setLoading: (loading) => set({ isLoading: loading }),
  toggleBudgetPanel: () => set((s) => ({ showBudgetPanel: !s.showBudgetPanel })),
  setTransactions: (txs) => set({ transactions: txs }),
  setScenariosList: (scenarios) => set({ scenariosList: scenarios }),
  setActiveScenario: (scenario) => set({ activeScenario: scenario }),
  setComparisonData: (data) => set({ comparisonData: data }),
  setShowScenarioModal: (show) => set({ showScenarioModal: show }),
  setUndoRedoCounts: (undo, redo) => set({ undoCount: undo, redoCount: redo }),

  setShowDisasterLabModal: (show) => set({ showDisasterLabModal: show }),
  setEnvironment: (env) => set({ environment: env }),
  setDisasters: (hud) => set({ disasters: hud }),
  setResilience: (resilience) => set({ resilience }),
  setShowAICommandModal: (show) => set({ showAICommandModal: show }),
  setShowAskAIModal: (show) => set({ showAskAIModal: show }),
  setAICandidates: (candidates) => set({ aiCandidates: candidates }),
  setTimelineMode: (mode) => set({ timelineMode: mode }),
  setTimelineHourOffset: (offset) => set({ timelineHourOffset: offset }),
}))

// =======================================================================
// STABLE SELECTORS & SHARED EMPTY REFERENCES (Prevents getSnapshot Loops)
// =======================================================================
export const EMPTY_ARRAY: readonly any[] = Object.freeze([])
export const EMPTY_DISTRICTS: readonly District[] = Object.freeze([])
export const EMPTY_BUILDINGS: readonly Building[] = Object.freeze([])
export const EMPTY_ROADS: readonly Road[] = Object.freeze([])
export const EMPTY_CITIZENS: readonly CitizenPosition[] = Object.freeze([])
export const EMPTY_VEHICLES: readonly VehiclePosition[] = Object.freeze([])
export const EMPTY_TRANSIT_LINES: readonly TransitLine[] = Object.freeze([])
export const EMPTY_TRANSIT_STATIONS: readonly MetroStation[] = Object.freeze([])
export const EMPTY_INFRASTRUCTURE: readonly InfrastructureItem[] = Object.freeze([])

export const selectDistricts = (s: SimulationStore): District[] =>
  s.cityState?.districts ?? (EMPTY_DISTRICTS as District[])

export const selectBuildings = (s: SimulationStore): Building[] =>
  s.cityState?.buildings ?? (EMPTY_BUILDINGS as Building[])

export const selectRoads = (s: SimulationStore): Road[] =>
  s.cityState?.roads ?? (EMPTY_ROADS as Road[])

export const selectCitizens = (s: SimulationStore): CitizenPosition[] =>
  s.cityState?.citizens ?? (EMPTY_CITIZENS as CitizenPosition[])

export const selectVehicles = (s: SimulationStore): VehiclePosition[] =>
  s.cityState?.vehicles ?? (EMPTY_VEHICLES as VehiclePosition[])

export const selectTransitLines = (s: SimulationStore): TransitLine[] =>
  s.cityState?.transitLines ?? (EMPTY_TRANSIT_LINES as TransitLine[])

export const selectTransitStations = (s: SimulationStore): MetroStation[] =>
  s.cityState?.transitStations ?? (EMPTY_TRANSIT_STATIONS as MetroStation[])

export const selectInfrastructureList = (s: SimulationStore): InfrastructureItem[] =>
  s.infrastructureList ?? (EMPTY_INFRASTRUCTURE as InfrastructureItem[])

export const selectDisasters = (s: SimulationStore): DisasterHUDData | null =>
  s.disasters ?? s.cityState?.disasters ?? null

export const selectEnvironment = (s: SimulationStore): EnvironmentState | null =>
  s.environment ?? s.cityState?.environment ?? null

export const selectResilience = (s: SimulationStore): ResilienceMetrics | null =>
  s.resilience ?? s.cityState?.resilience ?? null


