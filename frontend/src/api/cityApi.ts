/**
 * METACITY City API Client
 * Calls the FastAPI backend and falls back to rich mock data
 * when the backend is unavailable.
 */
import type {
  CityState,
  District,
  Building,
  Road,
  TransitLine,
  CitizenPosition,
  VehiclePosition,
  CityBudget,
  InfrastructureItem,
  InfrastructureValidationResponse,
  Scenario,
  ScenarioComparison,
  BudgetTransaction
} from '../types/city'

const BASE_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000'

// ── Camel-case normalisation helpers ────────────────────────────────────────

function normDistrict(d: Record<string, unknown>): District {
  return {
    id: d.id as string,
    name: d.name as string,
    type: d.type as District['type'],
    developmentLevel: (d.development_level ?? d.developmentLevel ?? 0.5) as number,
    population: (d.population ?? 0) as number,
    area: (d.area ?? 0) as number,
    landValue: (d.land_value ?? d.landValue ?? 0) as number,
    averageIncome: (d.average_income ?? d.averageIncome ?? 0) as number,
    housingCapacity: (d.housing_capacity ?? d.housingCapacity ?? 0) as number,
    employmentCapacity: (d.employment_capacity ?? d.employmentCapacity ?? 0) as number,
    educationAccess: (d.education_access ?? d.educationAccess ?? 0.5) as number,
    healthcareAccess: (d.healthcare_access ?? d.healthcareAccess ?? 0.5) as number,
    transportAccess: (d.transport_access ?? d.transportAccess ?? 0.5) as number,
    safety: (d.safety ?? 0.5) as number,
    environmentQuality: (d.environment_quality ?? d.environmentQuality ?? 0.5) as number,
    infrastructureQuality: (d.infrastructure_quality ?? d.infrastructureQuality ?? 0.5) as number,
    bounds: (d.bounds ?? [0, 0, 100, 100]) as [number, number, number, number],
    color: (d.color ?? '#888888') as string,
  }
}

function normBuilding(b: Record<string, unknown>): Building {
  return {
    id: b.id as string,
    districtId: (b.district_id ?? b.districtId ?? '') as string,
    type: (b.building_type ?? b.type ?? 'office') as string,
    x: b.x as number,
    z: b.z as number,
    width: (b.width ?? 20) as number,
    depth: (b.depth ?? 20) as number,
    height: (b.height ?? 10) as number,
    floors: (b.floors ?? 1) as number,
    color: (b.color ?? BUILDING_COLORS[(b.building_type ?? b.type ?? 'default') as string] ?? '#546E7A') as string,
  }
}

function normRoad(r: Record<string, unknown>): Road {
  return {
    id: r.id as string,
    roadType: (r.road_type ?? r.roadType ?? 'local') as Road['roadType'],
    startX: (r.start_x ?? r.startX ?? 0) as number,
    startZ: (r.start_z ?? r.startZ ?? 0) as number,
    endX: (r.end_x ?? r.endX ?? 0) as number,
    endZ: (r.end_z ?? r.endZ ?? 0) as number,
    lanes: (r.lanes ?? 2) as number,
    width: (r.width ?? 8) as number,
  }
}

function normTransitLine(t: Record<string, unknown>): TransitLine {
  const stations = ((t.stations ?? []) as Record<string, unknown>[]).map(s => ({
    id: s.id as string,
    name: s.name as string,
    lineId: (s.line_id ?? s.lineId ?? '') as string,
    x: s.x as number,
    z: s.z as number,
    capacity: (s.capacity ?? 500) as number,
  }))
  return {
    id: t.id as string,
    name: t.name as string,
    type: (t.line_type ?? t.type ?? 'metro') as TransitLine['type'],
    color: (t.color ?? '#888888') as string,
    stations,
    route: (t.route ?? []) as [number, number][],
  }
}

function normBudget(b: Record<string, unknown>): CityBudget {
  const income = (b.income ?? {}) as Record<string, number>
  const expenses = (b.expenses ?? {}) as Record<string, number>
  return {
    balance: (b.balance ?? 50_000_000) as number,
    income: {
      propertyTax: income.property_tax ?? income.propertyTax ?? 0,
      businessTax: income.business_tax ?? income.businessTax ?? 0,
      transportFares: income.transport_fares ?? income.transportFares ?? 0,
      serviceFees: income.service_fees ?? income.serviceFees ?? 0,
      industrialTax: income.industrial_tax ?? income.industrialTax ?? 0,
      total: income.total ?? 0,
    },
    expenses: {
      roadMaintenance: expenses.road_maintenance ?? expenses.roadMaintenance ?? 0,
      highwayMaintenance: expenses.highway_maintenance ?? expenses.highwayMaintenance ?? 0,
      bridgeMaintenance: expenses.bridge_maintenance ?? expenses.bridgeMaintenance ?? 0,
      metroOperation: expenses.metro_operation ?? expenses.metroOperation ?? 0,
      busOperation: expenses.bus_operation ?? expenses.busOperation ?? 0,
      hospitalOperation: expenses.hospital_operation ?? expenses.hospitalOperation ?? 0,
      schoolOperation: expenses.school_operation ?? expenses.schoolOperation ?? 0,
      policeOperation: expenses.police_operation ?? expenses.policeOperation ?? 0,
      fireOperation: expenses.fire_operation ?? expenses.fireOperation ?? 0,
      utilities: expenses.utilities ?? 0,
      wasteMaintenance: expenses.waste_management ?? expenses.wasteMaintenance ?? 0,
      total: expenses.total ?? 0,
    },
    netMonthly: (b.net_monthly ?? b.netMonthly ?? 0) as number,
    currency: (b.currency ?? 'MC') as string,
  }
}

function normCitizen(c: Record<string, unknown>): CitizenPosition {
  return {
    id: c.id as string,
    x: (c.current_x ?? c.x ?? 0) as number,
    z: (c.current_z ?? c.z ?? 0) as number,
    activity: (c.current_activity ?? c.activity ?? 'idle') as string,
    spriteType: (c.sprite_type ?? c.spriteType ?? 'worker') as CitizenPosition['spriteType'],
  }
}

function normVehicle(v: Record<string, unknown>): VehiclePosition {
  return {
    id: v.id as string,
    x: (v.current_x ?? v.x ?? 0) as number,
    z: (v.current_z ?? v.z ?? 0) as number,
    type: (v.vehicle_type ?? v.type ?? 'car') as VehiclePosition['type'],
    heading: (v.heading ?? 0) as number,
  }
}

// ── Building colour palette ──────────────────────────────────────────────────
const BUILDING_COLORS: Record<string, string> = {
  cbd: '#1565C0',
  office: '#1565C0',
  residential_high: '#C62828',
  residential_med: '#E53935',
  residential_low: '#EF9A9A',
  industrial: '#33691E',
  education: '#4527A0',
  tech: '#00695C',
  hospital: '#ECEFF1',
  school: '#F57F17',
  park: '#2E7D32',
  police: '#1A237E',
  fire_station: '#B71C1C',
  transport: '#37474F',
  suburban: '#E65100',
  riverfront: '#006064',
  developing: '#F57F17',
  rural: '#558B2F',
  default: '#546E7A',
}

// ── Full city state normaliser ───────────────────────────────────────────────
function normCityState(raw: Record<string, unknown>): CityState {
  const rawDistricts = (raw.districts ?? []) as Record<string, unknown>[]
  const rawBuildings = (raw.buildings ?? []) as Record<string, unknown>[]
  const rawRoads = (raw.roads ?? []) as Record<string, unknown>[]
  const rawLines = (raw.transit_lines ?? raw.transitLines ?? []) as Record<string, unknown>[]
  const rawStations = (raw.transit_stations ?? raw.transitStations ?? []) as Record<string, unknown>[]
  const rawCitizens = (raw.citizens ?? []) as Record<string, unknown>[]
  const rawVehicles = (raw.vehicles ?? []) as Record<string, unknown>[]

  // Attach stations to their lines
  const lineMap = new Map<string, Record<string, unknown>[]>()
  for (const st of rawStations) {
    const lid = (st.line_id ?? st.lineId ?? '') as string
    if (!lineMap.has(lid)) lineMap.set(lid, [])
    lineMap.get(lid)!.push(st)
  }
  const lines = rawLines.map(l => normTransitLine({ ...l, stations: lineMap.get(l.id as string) ?? [] }))

  return {
    cityId: (raw.city_id ?? 'default') as string,
    cityName: (raw.city_name ?? 'METACITY') as string,
    population: (raw.population ?? 539000) as number,
    satisfaction: (raw.satisfaction ?? 0.75) as number,
    simTime: (raw.sim_time ?? raw.time_string ?? 'Day 1, 06:00') as string,
    simDay: (raw.sim_day ?? 1) as number,
    simHour: (raw.sim_hour ?? 6) as number,
    weather: (raw.weather ?? 'sunny') as string,
    budget: normBudget((raw.budget ?? {}) as Record<string, unknown>),
    districts: rawDistricts.map(normDistrict),
    buildings: rawBuildings.map(normBuilding),
    roads: rawRoads.map(normRoad),
    transitLines: lines,
    citizens: rawCitizens.map(normCitizen),
    vehicles: rawVehicles.map(normVehicle),
  }
}

// ── API Client ───────────────────────────────────────────────────────────────
export const cityApi = {
  getCityState: async (_cityId: string = 'default'): Promise<CityState> => {
    try {
      const res = await fetch(`${BASE_URL}/cities/default/state`, {
        signal: AbortSignal.timeout(5000),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const raw = await res.json() as Record<string, unknown>
      const state = normCityState(raw)
      // If backend returned no districts/buildings, merge mock
      if (state.districts.length === 0) state.districts = MOCK_CITY_STATE.districts
      if (state.buildings.length === 0) state.buildings = MOCK_CITY_STATE.buildings
      if (state.roads.length === 0) state.roads = MOCK_CITY_STATE.roads
      if (state.transitLines.length === 0) state.transitLines = MOCK_CITY_STATE.transitLines
      if (state.citizens.length === 0) state.citizens = MOCK_CITY_STATE.citizens
      return state
    } catch {
      console.warn('[METACITY] Backend unavailable — using mock city data')
      return MOCK_CITY_STATE
    }
  },

  validatePlacement: async (
    itemType: string,
    x: number,
    z: number,
    endX?: number,
    endZ?: number
  ): Promise<InfrastructureValidationResponse> => {
    try {
      const res = await fetch(`${BASE_URL}/infrastructure/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_type: itemType,
          x,
          z,
          end_x: endX ?? null,
          end_z: endZ ?? null,
        }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      return {
        valid: data.valid,
        reason: data.reason,
        constructionCost: data.construction_cost,
        monthlyMaintenance: data.monthly_maintenance,
        populationServed: data.population_served,
        serviceRadius: data.service_radius,
        districtId: data.district_id,
        expectedImpact: data.expected_impact ? {
          populationServed: data.expected_impact.population_served,
          constructionCost: data.expected_impact.construction_cost,
          monthlyMaintenance: data.expected_impact.monthly_maintenance,
          estimatedTravelTimeDeltaPct: data.expected_impact.estimated_travel_time_delta_pct,
          estimatedTrafficCongestionDeltaPct: data.expected_impact.estimated_traffic_congestion_delta_pct,
          estimatedRidershipDelta: data.expected_impact.estimated_ridership_delta,
        } : undefined,
        required: data.required,
        available: data.available,
      }
    } catch {
      return {
        valid: true,
        reason: 'Local validation (fallback)',
        constructionCost: 250000,
        monthlyMaintenance: 3500,
        populationServed: 1200,
      }
    }
  },

  constructInfrastructure: async (
    itemType: string,
    x: number,
    z: number,
    name?: string,
    endX?: number,
    endZ?: number,
    subtype?: string
  ): Promise<{ success: boolean; item?: InfrastructureItem; remainingBalance?: number; reason?: string }> => {
    try {
      const res = await fetch(`${BASE_URL}/infrastructure/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_type: itemType,
          x,
          z,
          name: name || '',
          end_x: endX ?? null,
          end_z: endZ ?? null,
          subtype: subtype ?? null,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Placement rejected' }))
        return { success: false, reason: err.detail || 'Validation failed' }
      }
      const data = await res.json()
      return {
        success: true,
        item: {
          id: data.item.id,
          itemType: data.item.item_type,
          subtype: data.item.subtype,
          name: data.item.name,
          x: data.item.x,
          z: data.item.z,
          endX: data.item.end_x,
          endZ: data.item.end_z,
          districtId: data.item.district_id,
          condition: data.item.condition,
          capacity: data.item.capacity,
          constructionCost: data.item.construction_cost,
          monthlyMaintenance: data.item.monthly_maintenance,
          upgradeLevel: data.item.upgrade_level,
          serviceRadius: data.item.service_radius,
          connectedNetworkIds: data.item.connected_network_ids,
        },
        remainingBalance: data.remaining_balance,
      }
    } catch (err: any) {
      return { success: false, reason: err?.message || 'Network error' }
    }
  },

  upgradeInfrastructure: async (id: string): Promise<{ success: boolean; item?: InfrastructureItem; remainingBalance?: number; reason?: string }> => {
    try {
      const res = await fetch(`${BASE_URL}/infrastructure/${id}/upgrade`, {
        method: 'PATCH',
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Upgrade failed' }))
        return { success: false, reason: err.detail }
      }
      const data = await res.json()
      return {
        success: true,
        item: {
          id: data.item.id,
          itemType: data.item.item_type,
          name: data.item.name,
          x: data.item.x,
          z: data.item.z,
          endX: data.item.end_x,
          endZ: data.item.end_z,
          districtId: data.item.district_id,
          condition: data.item.condition,
          capacity: data.item.capacity,
          constructionCost: data.item.construction_cost,
          monthlyMaintenance: data.item.monthly_maintenance,
          upgradeLevel: data.item.upgrade_level,
          serviceRadius: data.item.service_radius,
        },
        remainingBalance: data.remaining_balance,
      }
    } catch (err: any) {
      return { success: false, reason: err?.message }
    }
  },

  demolishInfrastructure: async (id: string): Promise<{ success: boolean; itemId?: string; remainingBalance?: number; reason?: string }> => {
    try {
      const res = await fetch(`${BASE_URL}/infrastructure/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Demolish failed' }))
        return { success: false, reason: err.detail }
      }
      const data = await res.json()
      return {
        success: true,
        itemId: data.item_id,
        remainingBalance: data.remaining_balance,
      }
    } catch (err: any) {
      return { success: false, reason: err?.message }
    }
  },

  getInfrastructure: async (): Promise<InfrastructureItem[]> => {
    try {
      const res = await fetch(`${BASE_URL}/infrastructure/`)
      if (!res.ok) return []
      const data = await res.json()
      return (data.infrastructure || []).map((it: any) => ({
        id: it.id,
        itemType: it.item_type,
        subtype: it.subtype,
        name: it.name,
        x: it.x,
        z: it.z,
        endX: it.end_x,
        endZ: it.end_z,
        districtId: it.district_id,
        condition: it.condition,
        capacity: it.capacity,
        constructionCost: it.construction_cost,
        monthlyMaintenance: it.monthly_maintenance,
        upgradeLevel: it.upgrade_level,
        serviceRadius: it.service_radius,
      }))
    } catch {
      return []
    }
  },

  getScenarios: async (): Promise<Scenario[]> => {
    try {
      const res = await fetch(`${BASE_URL}/scenarios/`)
      if (!res.ok) return []
      const data = await res.json()
      return data.scenarios || []
    } catch {
      return []
    }
  },

  createScenario: async (name: string, description: string = ''): Promise<Scenario | null> => {
    try {
      const res = await fetch(`${BASE_URL}/scenarios/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      })
      if (!res.ok) return null
      const data = await res.json()
      return data.scenario
    } catch {
      return null
    }
  },

  getScenarioComparison: async (scenarioId?: string): Promise<ScenarioComparison | null> => {
    try {
      const url = scenarioId ? `${BASE_URL}/scenarios/comparison?scenario_id=${scenarioId}` : `${BASE_URL}/scenarios/comparison`
      const res = await fetch(url)
      if (!res.ok) return null
      const data = await res.json()
      return data.comparison
    } catch {
      return null
    }
  },

  undoScenarioAction: async (): Promise<{ success: boolean; remainingUndos?: number; reason?: string }> => {
    try {
      const res = await fetch(`${BASE_URL}/scenarios/undo`, { method: 'POST' })
      if (!res.ok) return { success: false, reason: 'Undo failed' }
      const data = await res.json()
      return { success: data.success, remainingUndos: data.remaining_undos, reason: data.reason }
    } catch (err: any) {
      return { success: false, reason: err?.message }
    }
  },

  redoScenarioAction: async (): Promise<{ success: boolean; remainingRedos?: number; reason?: string }> => {
    try {
      const res = await fetch(`${BASE_URL}/scenarios/redo`, { method: 'POST' })
      if (!res.ok) return { success: false, reason: 'Redo failed' }
      const data = await res.json()
      return { success: data.success, remainingRedos: data.remaining_redos, reason: data.reason }
    } catch (err: any) {
      return { success: false, reason: err?.message }
    }
  },

  getBudgetTransactions: async (): Promise<BudgetTransaction[]> => {
    try {
      const res = await fetch(`${BASE_URL}/budget/transactions`)
      if (!res.ok) return []
      const data = await res.json()
      return (data.transactions || []).map((tx: any) => ({
        id: tx.id,
        timestamp: tx.timestamp,
        amount: tx.amount,
        category: tx.category,
        description: tx.description,
        balanceAfter: tx.balance_after,
      }))
    } catch {
      return []
    }
  },

  // ── Phase 4: Environment & Disasters ──────────────────────────────────────
  getEnvironment: async (): Promise<any | null> => {
    try {
      const res = await fetch(`${BASE_URL}/environment/`)
      if (!res.ok) return null
      return await res.json()
    } catch {
      return MOCK_ENVIRONMENT_STATE
    }
  },

  setWeather: async (weather: string): Promise<boolean> => {
    try {
      const res = await fetch(`${BASE_URL}/environment/weather`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weather }),
      })
      return res.ok
    } catch {
      return false
    }
  },

  setSeason: async (season: string): Promise<boolean> => {
    try {
      const res = await fetch(`${BASE_URL}/environment/season`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ season }),
      })
      return res.ok
    } catch {
      return false
    }
  },

  getDisasters: async (): Promise<any | null> => {
    try {
      const res = await fetch(`${BASE_URL}/disasters/`)
      if (!res.ok) return null
      return await res.json()
    } catch {
      return MOCK_DISASTER_HUD
    }
  },

  triggerDisaster: async (
    disasterType: string,
    epicenterX: number = 4000,
    epicenterZ: number = 4000,
    severity: number = 2,
    radius: number = 1200,
    durationSeconds: number = 180
  ): Promise<{ success: boolean; incident?: any; reason?: string }> => {
    try {
      const res = await fetch(`${BASE_URL}/disasters/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          disaster_type: disasterType,
          epicenter_x: epicenterX,
          epicenter_z: epicenterZ,
          severity,
          radius,
          duration_seconds: durationSeconds,
        }),
      })
      if (!res.ok) return { success: false, reason: 'Disaster trigger rejected' }
      const data = await res.json()
      return { success: true, incident: data.incident }
    } catch (err: any) {
      return { success: false, reason: err?.message || 'Network error' }
    }
  },

  pauseDisaster: async (incidentId: string): Promise<boolean> => {
    try {
      const res = await fetch(`${BASE_URL}/disasters/${incidentId}/pause`, { method: 'POST' })
      return res.ok
    } catch {
      return false
    }
  },

  stopDisaster: async (incidentId: string): Promise<boolean> => {
    try {
      const res = await fetch(`${BASE_URL}/disasters/${incidentId}/stop`, { method: 'POST' })
      return res.ok
    } catch {
      return false
    }
  },

  resetDisasters: async (): Promise<boolean> => {
    try {
      const res = await fetch(`${BASE_URL}/disasters/reset`, { method: 'POST' })
      return res.ok
    } catch {
      return false
    }
  },

  getResilience: async (): Promise<any | null> => {
    try {
      const res = await fetch(`${BASE_URL}/disasters/resilience`)
      if (!res.ok) return null
      return await res.json()
    } catch {
      return MOCK_RESILIENCE_METRICS
    }
  },

  // ── Phase 5: AI City Intelligence ──────────────────────────────────────────
  getAnalyticsHistory: async (limit: number = 50): Promise<any[]> => {
    try {
      const res = await fetch(`${BASE_URL}/ai/analytics/history?limit=${limit}`)
      if (!res.ok) return []
      return await res.json()
    } catch {
      return []
    }
  },

  getPredictions: async (): Promise<any> => {
    try {
      const res = await fetch(`${BASE_URL}/ai/predictions`)
      if (!res.ok) return null
      return await res.json()
    } catch {
      return MOCK_PREDICTIONS
    }
  },

  generateAIPlan: async (goal: string, weights?: Record<string, number>): Promise<any[]> => {
    try {
      const res = await fetch(`${BASE_URL}/ai/planner/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal, weights }),
      })
      if (!res.ok) return []
      const data = await res.json()
      return data.candidates || []
    } catch {
      return MOCK_AI_PLAN_CANDIDATES
    }
  },

  queryAI: async (question: string): Promise<{ answer: string; grounded_metrics: Record<string, any>; confidence: number }> => {
    try {
      const res = await fetch(`${BASE_URL}/ai/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      })
      if (!res.ok) throw new Error('Query failed')
      return await res.json()
    } catch {
      return {
        answer: `METACITY Intelligence Fallback: Analyzed city state for "${question}". Population is 539,000 across 12 balanced districts with 76% satisfaction. Grid reserve is operating at 30% surplus and traffic corridors are within nominal tolerances.`,
        grounded_metrics: { population: 539000, satisfaction: 0.76, budget_balance: 50200000 },
        confidence: 0.88,
      }
    }
  },

  getAIReport: async (reportType: string): Promise<any> => {
    try {
      const res = await fetch(`${BASE_URL}/ai/reports/${reportType}`)
      if (!res.ok) return null
      return await res.json()
    } catch {
      return {
        report_type: reportType,
        generated_at: new Date().toISOString(),
        summary: `Comprehensive evaluation of ${reportType} shows stable municipal indicators across all 12 districts with zero uncontained systemic vulnerabilities.`,
        kpis: { health: 'OPTIMAL', score: 85, recommendation_priority: 'MEDIUM' }
      }
    }
  },
}

// ── Rich mock city state (renders without backend) ───────────────────────────
const MOCK_DISTRICTS: District[] = [
  { id: 'd01', name: 'Central Business District', type: 'cbd', developmentLevel: 1.0, population: 85000, area: 2560000, landValue: 10000, averageIncome: 80000, housingCapacity: 20000, employmentCapacity: 150000, educationAccess: 0.9, healthcareAccess: 0.9, transportAccess: 1.0, safety: 0.8, environmentQuality: 0.6, infrastructureQuality: 1.0, bounds: [3200, 3200, 4800, 4800], color: '#1a237e' },
  { id: 'd02', name: 'High-Density Residential', type: 'residential_high', developmentLevel: 0.9, population: 120000, area: 2560000, landValue: 7000, averageIncome: 60000, housingCapacity: 120000, employmentCapacity: 20000, educationAccess: 0.8, healthcareAccess: 0.8, transportAccess: 0.9, safety: 0.7, environmentQuality: 0.7, infrastructureQuality: 0.9, bounds: [2000, 2400, 3600, 4000], color: '#b71c1c' },
  { id: 'd03', name: 'Medium-Density Residential', type: 'residential_med', developmentLevel: 0.7, population: 95000, area: 2560000, landValue: 5000, averageIncome: 50000, housingCapacity: 95000, employmentCapacity: 10000, educationAccess: 0.8, healthcareAccess: 0.7, transportAccess: 0.8, safety: 0.8, environmentQuality: 0.8, infrastructureQuality: 0.8, bounds: [4400, 3200, 6000, 4800], color: '#e53935' },
  { id: 'd04', name: 'Low-Density Residential', type: 'residential_low', developmentLevel: 0.5, population: 45000, area: 4160000, landValue: 3000, averageIncome: 70000, housingCapacity: 45000, employmentCapacity: 5000, educationAccess: 0.9, healthcareAccess: 0.8, transportAccess: 0.6, safety: 0.9, environmentQuality: 0.9, infrastructureQuality: 0.7, bounds: [1000, 5600, 3600, 7200], color: '#ef9a9a' },
  { id: 'd05', name: 'Industrial Zone', type: 'industrial', developmentLevel: 0.8, population: 12000, area: 4840000, landValue: 2000, averageIncome: 40000, housingCapacity: 10000, employmentCapacity: 80000, educationAccess: 0.3, healthcareAccess: 0.4, transportAccess: 0.8, safety: 0.5, environmentQuality: 0.2, infrastructureQuality: 0.8, bounds: [5600, 5600, 7800, 7800], color: '#33691e' },
  { id: 'd06', name: 'University District', type: 'education', developmentLevel: 0.85, population: 35000, area: 3200000, landValue: 6000, averageIncome: 30000, housingCapacity: 30000, employmentCapacity: 15000, educationAccess: 1.0, healthcareAccess: 0.8, transportAccess: 0.9, safety: 0.8, environmentQuality: 0.8, infrastructureQuality: 0.9, bounds: [3200, 800, 5200, 2400], color: '#4527a0' },
  { id: 'd07', name: 'Technology Park', type: 'tech', developmentLevel: 0.75, population: 28000, area: 3200000, landValue: 8000, averageIncome: 90000, housingCapacity: 15000, employmentCapacity: 60000, educationAccess: 0.9, healthcareAccess: 0.8, transportAccess: 0.8, safety: 0.9, environmentQuality: 0.8, infrastructureQuality: 0.9, bounds: [5200, 1600, 7200, 3200], color: '#00695c' },
  { id: 'd08', name: 'Developing Outskirts', type: 'developing', developmentLevel: 0.3, population: 18000, area: 3200000, landValue: 1000, averageIncome: 25000, housingCapacity: 25000, employmentCapacity: 5000, educationAccess: 0.4, healthcareAccess: 0.4, transportAccess: 0.4, safety: 0.5, environmentQuality: 0.7, infrastructureQuality: 0.3, bounds: [400, 400, 2000, 2400], color: '#f57f17' },
  { id: 'd09', name: 'Transport/Logistics Hub', type: 'transport', developmentLevel: 0.7, population: 8000, area: 2240000, landValue: 3000, averageIncome: 45000, housingCapacity: 5000, employmentCapacity: 30000, educationAccess: 0.4, healthcareAccess: 0.5, transportAccess: 1.0, safety: 0.6, environmentQuality: 0.3, infrastructureQuality: 0.9, bounds: [6400, 4000, 7800, 5600], color: '#37474f' },
  { id: 'd10', name: 'Suburban District', type: 'suburban', developmentLevel: 0.5, population: 62000, area: 2560000, landValue: 4000, averageIncome: 65000, housingCapacity: 62000, employmentCapacity: 8000, educationAccess: 0.8, healthcareAccess: 0.7, transportAccess: 0.6, safety: 0.8, environmentQuality: 0.8, infrastructureQuality: 0.7, bounds: [1600, 4800, 3200, 6400], color: '#e65100' },
  { id: 'd11', name: 'Riverfront District', type: 'riverfront', developmentLevel: 0.6, population: 22000, area: 3200000, landValue: 9000, averageIncome: 85000, housingCapacity: 25000, employmentCapacity: 15000, educationAccess: 0.8, healthcareAccess: 0.8, transportAccess: 0.7, safety: 0.8, environmentQuality: 0.9, infrastructureQuality: 0.8, bounds: [3200, 5600, 5200, 7200], color: '#006064' },
  { id: 'd12', name: 'Rural/Peripheral Zone', type: 'rural', developmentLevel: 0.15, population: 9000, area: 12800000, landValue: 500, averageIncome: 35000, housingCapacity: 15000, employmentCapacity: 5000, educationAccess: 0.3, healthcareAccess: 0.3, transportAccess: 0.3, safety: 0.7, environmentQuality: 0.9, infrastructureQuality: 0.4, bounds: [0, 0, 800, 8000], color: '#558b2f' },
]

function generateMockBuildings(): Building[] {
  const buildings: Building[] = []
  let idx = 0
  for (const d of MOCK_DISTRICTS) {
    const [x0, z0, x1, z1] = d.bounds
    const count = Math.floor(d.developmentLevel * 30)
    for (let i = 0; i < count; i++) {
      const type = d.type
      const maxH = d.type === 'cbd' ? 180 : d.type === 'residential_high' ? 80 : d.type === 'industrial' ? 20 : 40
      const minH = d.type === 'cbd' ? 40 : d.type === 'industrial' ? 8 : 5
      buildings.push({
        id: `mb_${idx++}`,
        districtId: d.id,
        type,
        x: x0 + Math.random() * (x1 - x0),
        z: z0 + Math.random() * (z1 - z0),
        width: 15 + Math.random() * 40,
        depth: 15 + Math.random() * 40,
        height: minH + Math.random() * (maxH - minH),
        floors: Math.max(1, Math.floor((minH + Math.random() * (maxH - minH)) / 4)),
        color: BUILDING_COLORS[type] ?? '#546E7A',
      })
    }
  }
  return buildings
}

function generateMockRoads(): Road[] {
  const roads: Road[] = []
  // Highway ring
  const ring = [[800, 800], [7200, 800], [7200, 7200], [800, 7200], [800, 800]]
  for (let i = 0; i < ring.length - 1; i++) {
    roads.push({ id: `hr_${i}`, roadType: 'highway', startX: ring[i][0], startZ: ring[i][1], endX: ring[i+1][0], endZ: ring[i+1][1], lanes: 4, width: 20 })
  }
  // Arterials
  const arterials: [number, number, number, number][] = [
    [800, 3200, 7200, 3200], [800, 5600, 7200, 5600],
    [3200, 800, 3200, 7200], [5600, 800, 5600, 7200],
    [4000, 800, 4000, 7200], [800, 4000, 7200, 4000],
  ]
  arterials.forEach(([sx, sz, ex, ez], i) => {
    roads.push({ id: `ar_${i}`, roadType: 'arterial', startX: sx, startZ: sz, endX: ex, endZ: ez, lanes: 3, width: 12 })
  })
  return roads
}

function generateMockTransitLines(): TransitLine[] {
  return [
    {
      id: 'metro_a', name: 'Metro Line A', type: 'metro', color: '#f44336',
      route: [[4000,4600],[3800,4000],[3600,3200],[4000,1800],[4400,1600],[5600,2000],[6400,2400],[7000,2800]],
      stations: [
        { id: 'ma1', name: 'CBD Central', lineId: 'metro_a', x: 4000, z: 4600, capacity: 500 },
        { id: 'ma2', name: 'CBD West', lineId: 'metro_a', x: 3800, z: 4000, capacity: 500 },
        { id: 'ma3', name: 'Civic Center', lineId: 'metro_a', x: 3600, z: 3200, capacity: 400 },
        { id: 'ma4', name: 'University Main', lineId: 'metro_a', x: 4000, z: 1800, capacity: 600 },
        { id: 'ma5', name: 'Tech Park', lineId: 'metro_a', x: 5600, z: 2000, capacity: 400 },
        { id: 'ma6', name: 'Tech Central', lineId: 'metro_a', x: 6400, z: 2400, capacity: 400 },
      ]
    },
    {
      id: 'metro_b', name: 'Metro Line B', type: 'metro', color: '#2196f3',
      route: [[6800,7000],[6400,6400],[5200,5600],[4800,5200],[4400,4800],[4000,4400],[4000,4000],[3600,5200],[3600,6400]],
      stations: [
        { id: 'mb1', name: 'Industrial Terminal', lineId: 'metro_b', x: 6800, z: 7000, capacity: 400 },
        { id: 'mb2', name: 'Factory Gate', lineId: 'metro_b', x: 6400, z: 6400, capacity: 350 },
        { id: 'mb3', name: 'CBD Main', lineId: 'metro_b', x: 4000, z: 4000, capacity: 600 },
        { id: 'mb4', name: 'Riverfront Central', lineId: 'metro_b', x: 3600, z: 6400, capacity: 400 },
      ]
    },
    {
      id: 'metro_c', name: 'Metro Line C', type: 'metro', color: '#4caf50',
      route: [[2000,6000],[2400,5600],[2800,5200],[3200,4800],[3600,4400],[4000,4000],[3600,3200],[2800,2000],[1600,1600]],
      stations: [
        { id: 'mc1', name: 'Suburban West', lineId: 'metro_c', x: 2000, z: 6000, capacity: 300 },
        { id: 'mc2', name: 'Suburban North', lineId: 'metro_c', x: 2400, z: 5600, capacity: 300 },
        { id: 'mc3', name: 'CBD Hub', lineId: 'metro_c', x: 4000, z: 4000, capacity: 600 },
        { id: 'mc4', name: 'Outskirts', lineId: 'metro_c', x: 1600, z: 1600, capacity: 200 },
      ]
    },
    {
      id: 'railway', name: 'Metacity Railway', type: 'railway', color: '#795548',
      route: [[1200,4400],[2800,4400],[4000,4000],[5600,4400],[7000,4800]],
      stations: [
        { id: 'rw1', name: 'West Terminal', lineId: 'railway', x: 1200, z: 4400, capacity: 800 },
        { id: 'rw2', name: 'Central Station', lineId: 'railway', x: 4000, z: 4000, capacity: 1000 },
        { id: 'rw3', name: 'Transport Hub', lineId: 'railway', x: 7000, z: 4800, capacity: 800 },
      ]
    },
  ]
}

function generateMockCitizens(): CitizenPosition[] {
  const citizens: CitizenPosition[] = []
  const types: CitizenPosition['spriteType'][] = ['professional', 'worker', 'student', 'elderly', 'child']
  for (let i = 0; i < 150; i++) {
    const d = MOCK_DISTRICTS[Math.floor(Math.random() * MOCK_DISTRICTS.length)]
    citizens.push({
      id: `mc_${i}`,
      x: d.bounds[0] + Math.random() * (d.bounds[2] - d.bounds[0]),
      z: d.bounds[1] + Math.random() * (d.bounds[3] - d.bounds[1]),
      activity: ['working', 'commuting', 'shopping', 'leisure', 'home'][Math.floor(Math.random() * 5)],
      spriteType: types[Math.floor(Math.random() * types.length)],
    })
  }
  return citizens
}

function generateMockVehicles(): VehiclePosition[] {
  const vehicles: VehiclePosition[] = []
  const vtypes: VehiclePosition['type'][] = ['car', 'bus', 'truck']
  const roads = generateMockRoads()
  for (let i = 0; i < 30; i++) {
    const road = roads[Math.floor(Math.random() * roads.length)]
    const t = Math.random()
    vehicles.push({
      id: `mv_${i}`,
      x: road.startX + t * (road.endX - road.startX),
      z: road.startZ + t * (road.endZ - road.startZ),
      type: vtypes[Math.floor(Math.random() * vtypes.length)],
      heading: Math.atan2(road.endZ - road.startZ, road.endX - road.startX),
    })
  }
  return vehicles
}

export const MOCK_ENVIRONMENT_STATE = {
  temperature: 24.5,
  humidity: 55.0,
  rainfall: 0.0,
  wind_speed: 12.4,
  wind_direction: 45.0,
  visibility: 10000.0,
  air_quality_index: 42.0,
  water_level: 2.1,
  soil_moisture: 35.0,
  pollution: 15.0,
  heat_index: 25.1,
  season: 'SPRING',
  weather_condition: 'CLEAR',
  electricity_demand_mw: 420.5,
  electricity_supply_mw: 550.0,
  grid_stress_pct: 76.4,
  water_demand_mld: 110.2,
  water_supply_mld: 150.0,
  water_reserve_pct: 73.5,
}

export const MOCK_DISASTER_HUD = {
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
  shelters: [
    { id: 'sh_1', name: 'Downtown Civic Shelter', district_id: 'd01', x: 4000, z: 4000, capacity: 5000, occupancy: 0, supplies_pct: 100 },
    { id: 'sh_2', name: 'North High Evacuation Center', district_id: 'd02', x: 2800, z: 3200, capacity: 4000, occupancy: 0, supplies_pct: 95 },
    { id: 'sh_3', name: 'Westfield Arena Shelter', district_id: 'd03', x: 5200, z: 4000, capacity: 4500, occupancy: 0, supplies_pct: 98 },
    { id: 'sh_4', name: 'Suburban Community Hall', district_id: 'd10', x: 2400, z: 5600, capacity: 3000, occupancy: 0, supplies_pct: 100 },
    { id: 'sh_5', name: 'Tech Park Campus Complex', district_id: 'd07', x: 6200, z: 2400, capacity: 3500, occupancy: 0, supplies_pct: 92 },
    { id: 'sh_6', name: 'University Field House', district_id: 'd06', x: 4200, z: 1600, capacity: 6000, occupancy: 0, supplies_pct: 100 },
  ],
}

export const MOCK_RESILIENCE_METRICS = {
  index_name: 'METACITY SIMULATION RESILIENCE INDEX',
  city_score: 84.5,
  rating: 'HIGH RESILIENCE',
  breakdown: {
    emergency_coverage: 88.0,
    utility_redundancy: 82.5,
    evacuation_readiness: 90.0,
    road_redundancy: 81.0,
    flood_exposure_penalty: 2.0,
    active_incident_penalty: 0.0,
  },
  districts: {
    d01: 89.2,
    d02: 85.0,
    d03: 84.1,
    d04: 80.5,
    d05: 78.0,
    d06: 88.4,
    d07: 86.2,
    d08: 72.0,
    d09: 83.5,
    d10: 82.0,
    d11: 79.5,
    d12: 70.0,
  },
}

export const MOCK_PREDICTIONS = {
  congestion_forecast: {
    peak_hour: '17:30',
    peak_congestion_pct: 42.5,
    bottlenecks: ['CBD Arterial East', 'Highway Ring Northbound'],
  },
  power_demand_forecast_mw: [410, 425, 450, 475, 490, 460, 430, 415],
  water_demand_forecast_mld: [105, 110, 115, 120, 118, 112, 108, 106],
  infrastructure_failure_risks: [
    { asset_id: 'r_hwy_1', asset_name: 'Highway Overpass 3', risk_level: 'MEDIUM', reason: 'High heavy-vehicle load and aging joints' },
    { asset_id: 'p_sub_4', asset_name: 'Substation West', risk_level: 'LOW', reason: 'Recent maintenance performed' },
  ],
}

export const MOCK_AI_PLAN_CANDIDATES = [
  {
    candidate_id: 'cand_1',
    title: 'Rapid Metro Extension & Bus Priority Lane',
    intervention_type: 'TRANSIT_EXPANSION',
    capital_cost_mc: 1800000,
    monthly_maintenance_mc: 25000,
    score: 91.5,
    simulated_deltas: {
      traffic_congestion_pct: -8.5,
      transit_ridership: 3500,
      transit_pct: 6.2,
      car_pct: -5.8,
      satisfaction_pct: 4.8,
      budget_delta: -1800000,
      monthly_maint_delta: 25000,
    },
    evidence: {
      corridor: 'District d01 -> District d02',
      current_travel_time: '18 mins',
      projected_travel_time: '11 mins',
      carbon_abatement: '120 metric tons/month',
    },
    assumptions: ['Stable electricity tariff', 'Sufficient tunneling clearance'],
    risks: ['Disruption during construction along Arterial 2'],
  },
  {
    candidate_id: 'cand_2',
    title: 'District Microgrid & Solar Substation Deployment',
    intervention_type: 'GREEN_ENERGY',
    capital_cost_mc: 1200000,
    monthly_maintenance_mc: 12000,
    score: 87.2,
    simulated_deltas: {
      traffic_congestion_pct: 0.0,
      transit_ridership: 0,
      transit_pct: 0.0,
      car_pct: 0.0,
      satisfaction_pct: 3.5,
      budget_delta: -1200000,
      monthly_maint_delta: 12000,
    },
    evidence: {
      energy_surplus: '+80 MW peak generation',
      resilience_boost: '+14% utility redundancy',
      emissions_reduction: '15% lower district footprint',
    },
    assumptions: ['Average solar irradiance >= 4.5 kWh/m2/day'],
    risks: ['Battery storage degradation after 10 sim-years'],
  },
]

export const MOCK_CITY_STATE: CityState = {
  cityId: 'default',
  cityName: 'METACITY',
  population: 539000,
  satisfaction: 0.76,
  simTime: 'Day 1, 06:30',
  simDay: 1,
  simHour: 6.5,
  weather: 'sunny',
  environment: MOCK_ENVIRONMENT_STATE as any,
  disasters: MOCK_DISASTER_HUD as any,
  resilience: MOCK_RESILIENCE_METRICS as any,
  budget: {
    balance: 50_200_000,
    income: {
      propertyTax: 1_280_000,
      businessTax: 920_000,
      transportFares: 450_000,
      serviceFees: 50_000,
      industrialTax: 500_000,
      total: 3_200_000,
    },
    expenses: {
      roadMaintenance: 180_000,
      highwayMaintenance: 120_000,
      bridgeMaintenance: 45_000,
      metroOperation: 350_000,
      busOperation: 95_000,
      hospitalOperation: 280_000,
      schoolOperation: 210_000,
      policeOperation: 150_000,
      fireOperation: 120_000,
      utilities: 95_000,
      wasteMaintenance: 65_000,
      total: 1_710_000,
    },
    netMonthly: 1_490_000,
    currency: 'MC',
  },
  districts: MOCK_DISTRICTS,
  buildings: generateMockBuildings(),
  roads: generateMockRoads(),
  transitLines: generateMockTransitLines(),
  citizens: generateMockCitizens(),
  vehicles: generateMockVehicles(),
}

