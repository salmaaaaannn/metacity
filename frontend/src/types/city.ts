export interface District {
  id: string
  name: string
  type: 'cbd' | 'residential_high' | 'residential_med' | 'residential_low' | 'industrial' | 'education' | 'tech' | 'developing' | 'transport' | 'suburban' | 'riverfront' | 'rural'
  developmentLevel: number
  population: number
  area: number
  landValue: number
  averageIncome: number
  housingCapacity: number
  employmentCapacity: number
  educationAccess: number
  healthcareAccess: number
  transportAccess: number
  safety: number
  environmentQuality: number
  infrastructureQuality: number
  bounds: [number, number, number, number]
  color: string
}

export interface Building {
  id: string
  districtId: string
  type: string
  building_type?: string
  x: number
  z: number
  width: number
  depth: number
  height: number
  floors: number
  color: string
}

export interface Road {
  id: string
  roadType: 'local' | 'collector' | 'arterial' | 'highway' | 'expressway' | 'bridge'
  startX: number
  startZ: number
  endX: number
  endZ: number
  lanes: number
  width: number
}

export interface MetroStation {
  id: string
  name: string
  lineId: string
  x: number
  z: number
  capacity: number
}

export interface TransitLine {
  id: string
  name: string
  type: 'metro' | 'railway' | 'bus'
  color: string
  stations: MetroStation[]
  route: Array<[number, number]>
}

export interface CitizenPosition {
  id: string
  x: number
  z: number
  activity: string
  state?: string
  spriteType: 'professional' | 'worker' | 'student' | 'elderly' | 'child'
  facing?: number
  mode?: string
}

export interface CitizenDetail {
  id: string
  name: string
  age: number
  age_group: string
  occupation: string
  sprite_type: string
  district_id: string
  income: number
  money: number
  household_id: string
  home_building_id: string
  home_coords: [number, number]
  workplace_building_id?: string
  workplace_coords?: [number, number]
  school_building_id?: string
  school_coords?: [number, number]
  current_state: string
  current_activity: string
  destination_type?: string
  destination_coords?: [number, number]
  travel_mode: string
  decision_reason: string
  has_car: boolean
  active_vehicle_id?: string
  satisfaction: number
  stress: number
  fatigue: number
  health: number
  preferences: {
    car_weight: number
    bus_weight: number
    metro_weight: number
    railway_weight: number
    walk_weight: number
    cost_sensitivity: number
    comfort_preference: number
  }
  memory: {
    total_trips: number
    delays_count: number
    last_trip_mode?: string
    mode_penalties: Record<string, number>
  }
  position: [number, number]
}

export interface DistrictMetrics {
  id: string
  name: string
  type: string
  development_level: number
  statistical_population: number
  active_simulated_citizens: number
  satisfaction_index: number
  stress_index: number
  traffic_congestion_index: number
  transit_modal_split: {
    public_transit_pct: number
    car_pct: number
    walk_pct: number
  }
  economic_activity: {
    active_businesses: number
    employed_workers: number
    active_shoppers_diners: number
    daily_revenue: number
  }
  services: {
    education_access: number
    healthcare_access: number
    transport_access: number
    safety: number
    environment_quality: number
  }
  housing_capacity: number
  employment_capacity: number
  color: string
}

export interface VehiclePosition {
  id: string
  x: number
  z: number
  type: 'car' | 'bus' | 'truck' | 'police' | 'ambulance' | 'fire' | string
  heading: number
  route_id?: string
  route_name?: string
  passengers?: number
  capacity?: number
  state?: string
}

export interface BudgetIncome {
  propertyTax: number
  businessTax: number
  transportFares: number
  serviceFees: number
  industrialTax: number
  total: number
}

export interface BudgetExpenses {
  roadMaintenance: number
  highwayMaintenance: number
  bridgeMaintenance: number
  metroOperation: number
  busOperation: number
  hospitalOperation: number
  schoolOperation: number
  policeOperation: number
  fireOperation: number
  utilities: number
  wasteMaintenance: number
  total: number
}

export interface CityBudget {
  balance: number
  income: BudgetIncome
  expenses: BudgetExpenses
  netMonthly: number
  currency: string
}

export interface EnvironmentState {
  temperature: number
  humidity: number
  rainfall: number
  wind_speed: number
  wind_direction: number
  visibility: number
  air_quality_index: number
  water_level: number
  soil_moisture: number
  pollution: number
  heat_index: number
  season: 'SPRING' | 'SUMMER' | 'AUTUMN' | 'WINTER'
  weather_condition: 'CLEAR' | 'CLOUDY' | 'RAIN' | 'HEAVY_RAIN' | 'STORM' | 'HEATWAVE' | 'FOG' | 'EXTREME_HEAT'
  electricity_demand_mw: number
  electricity_supply_mw: number
  grid_stress_pct: number
  water_demand_mld: number
  water_supply_mld: number
  water_reserve_pct: number
}

export interface DisasterIncident {
  id: string
  disaster_type: 'FLOOD' | 'FIRE' | 'EARTHQUAKE' | 'HEATWAVE' | 'STORM'
  severity: number
  status: 'ACTIVE' | 'CONTAINED' | 'RECOVERING' | 'RESOLVED'
  epicenter_x: number
  epicenter_z: number
  radius: number
  duration_seconds: number
  elapsed_seconds: number
  affected_building_ids: string[]
  affected_road_ids: string[]
  evacuated_citizens: number
  damage_cost: number
  repair_progress: number
  response_times?: {
    fire_eta_minutes: number
    police_eta_minutes: number
    medical_eta_minutes: number
    nearest_fire_station: string
    nearest_police: string
    nearest_hospital: string
  }
  metadata?: Record<string, any>
}

export interface EmergencyUnit {
  id: string
  unit_type: string
  x: number
  z: number
  status: string
  target_incident_id: string
}

export interface EmergencyShelter {
  id: string
  name: string
  district_id: string
  x: number
  z: number
  capacity: number
  occupancy: number
  supplies_pct: number
}

export interface DisasterHUDData {
  active_incidents_count: number
  incidents: DisasterIncident[]
  affected_population: number
  affected_buildings_count: number
  closed_roads_count: number
  closed_roads: string[]
  evacuated_citizens: number
  emergency_vehicles_active: number
  emergency_units: EmergencyUnit[]
  total_estimated_damage: number
  shelters: EmergencyShelter[]
}

export interface ResilienceMetrics {
  index_name: string
  city_score: number
  rating: string
  breakdown: {
    emergency_coverage: number
    utility_redundancy: number
    evacuation_readiness: number
    road_redundancy: number
    flood_exposure_penalty: number
    active_incident_penalty: number
  }
  districts: Record<string, number>
}

export interface AIPlanCandidate {
  candidate_id: string
  title: string
  intervention_type: string
  capital_cost_mc: number
  monthly_maintenance_mc: number
  score: number
  simulated_deltas: {
    traffic_congestion_pct: number
    transit_ridership: number
    transit_pct: number
    car_pct: number
    satisfaction_pct: number
    budget_delta: number
    monthly_maint_delta: number
  }
  evidence: Record<string, string>
  assumptions: string[]
  risks: string[]
}

export interface CityState {
  cityId: string
  cityName: string
  population: number
  activeCitizensCount?: number
  satisfaction: number
  budget: CityBudget
  simTime: string
  simDay: number
  simHour: number
  weather: string
  season?: string
  environment?: EnvironmentState
  disasters?: DisasterHUDData
  resilience?: ResilienceMetrics
  districts: District[]
  buildings: Building[]
  roads: Road[]
  transitLines: TransitLine[]
  transitStations?: MetroStation[]
  citizens: CitizenPosition[]
  vehicles: VehiclePosition[]
}

export interface SimulationDelta {
  type: 'delta'
  tick: number
  simTime: string
  simHour: number
  season?: string
  weather?: string
  environment?: EnvironmentState
  active_disasters_count?: number
  closed_roads?: string[]
  emergency_units?: EmergencyUnit[]
  citizens?: CitizenPosition[]
  vehicles?: VehiclePosition[]
  budget?: Partial<CityBudget>
  population?: number
  satisfaction?: number
}

export type ToolType =
  | 'select'
  // Transport (6)
  | 'road'
  | 'highway'
  | 'bridge'
  | 'metro_line'
  | 'metro_station'
  | 'bus_stop'
  // Services (5)
  | 'hospital'
  | 'school'
  | 'police'
  | 'fire'
  | 'park'
  // Utilities (4)
  | 'power_plant'
  | 'water_plant'
  | 'solar_farm'
  | 'recycling'
  // Zoning (4)
  | 'residential'
  | 'commercial'
  | 'office'
  | 'industrial'
  // Operations (3)
  | 'inspect'
  | 'demolish'
  | 'upgrade'

export type OverlayMode =
  | 'normal'
  | 'traffic'
  | 'satisfaction'
  | 'population'
  | 'utilization'
  | 'healthcare'
  | 'education'
  | 'power'
  | 'water'
  | 'disaster_risk'
  | 'flood_risk'
  | 'fire_risk'
  | 'earthquake_risk'
  | 'pollution'
  | 'power_demand'
  | 'water_demand'
  | 'resilience'
  | 'predicted_congestion'
  | 'development_level'
  | 'land_value'

export interface InfrastructureItem {
  id: string
  itemType: string
  subtype?: string
  name: string
  x: number
  z: number
  endX?: number
  endZ?: number
  districtId: string
  condition: number
  capacity: number
  constructionCost: number
  monthlyMaintenance: number
  upgradeLevel: number
  serviceRadius: number
  connectedNetworkIds?: string[]
  metadata?: Record<string, unknown>
  createdAt?: number
}

export interface ExpectedImpact {
  populationServed: number
  constructionCost: number
  monthlyMaintenance: number
  estimatedTravelTimeDeltaPct: number
  estimatedTrafficCongestionDeltaPct: number
  estimatedRidershipDelta: number
}

export interface InfrastructureValidationResponse {
  valid: boolean
  reason: string
  constructionCost?: number
  monthlyMaintenance?: number
  populationServed?: number
  serviceRadius?: number
  districtId?: string
  expectedImpact?: ExpectedImpact
  required?: number
  available?: number
}

export interface BudgetTransaction {
  id: string
  timestamp: number
  amount: number
  category: 'construction' | 'upgrade' | 'demolition' | 'tax' | 'maintenance' | 'transit_fare' | 'refund'
  description: string
  balanceAfter: number
}

export interface ScenarioAction {
  actionId: string
  actionType: 'ADD' | 'REMOVE' | 'UPGRADE'
  itemType: string
  params: Record<string, any>
  cost: number
  timestamp: number
}

export interface ScenarioMetrics {
  population: number
  averageSatisfaction: number
  transitRidership: number
  trafficCongestionPct: number
  modalSplit: {
    transitPct: number
    carPct: number
    walkPct: number
  }
  budgetBalance: number
  monthlyNet: number
}

export interface Scenario {
  id: string
  name: string
  description: string
  createdAt: number
  changes: ScenarioAction[]
  budgetDelta: number
  metricsBefore?: ScenarioMetrics
  metricsAfter?: ScenarioMetrics
}

export interface ScenarioComparison {
  scenarioName: string
  baseline: ScenarioMetrics
  scenario: ScenarioMetrics
  delta: {
    population: number
    averageSatisfaction: number
    transitRidership: number
    trafficCongestionPct: number
    transitPct: number
    carPct: number
    budgetDelta: number
    monthlyNetDelta: number
  }
}
