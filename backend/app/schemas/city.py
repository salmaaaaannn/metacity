from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class DistrictSchema(BaseModel):
    id: str
    name: str
    type: str
    development_level: float
    population: int
    area: float
    land_value: float
    average_income: float
    housing_capacity: int
    employment_capacity: int
    education_access: float
    healthcare_access: float
    transport_access: float
    safety: float
    environment_quality: float
    infrastructure_quality: float
    bounds: tuple
    color: str

class InfrastructureSchema(BaseModel):
    id: str
    type: str
    subtype: Optional[str] = None
    name: Optional[str] = None
    position: Dict[str, float]
    metadata: Dict[str, Any] = Field(default_factory=dict)

class BuildingSchema(BaseModel):
    id: str
    district_id: str
    building_type: str
    x: float
    z: float
    width: float
    depth: float
    height: float
    floors: int

class RoadSchema(BaseModel):
    id: str
    road_type: str
    start_node_id: str
    end_node_id: str
    lanes: int
    speed_limit: float

class TransitLineSchema(BaseModel):
    id: str
    name: str
    line_type: str
    color: str
    capacity: int

class TransitStationSchema(BaseModel):
    id: str
    line_id: str
    name: str
    x: float
    z: float

class CitizenSchema(BaseModel):
    id: str
    age: int
    occupation: str
    income: float
    preferred_transport: str
    vehicle_ownership: bool
    current_x: float
    current_z: float
    current_activity: str

class BudgetSchema(BaseModel):
    balance: float
    net_monthly: float
    income: Optional[Dict[str, float]] = None
    expenses: Optional[Dict[str, float]] = None

class CitySchema(BaseModel):
    districts: List[DistrictSchema]
    infrastructure: List[InfrastructureSchema]
    buildings: List[BuildingSchema]
    roads: List[RoadSchema]
    budget: BudgetSchema

class SimulationStateSchema(BaseModel):
    tick: int
    time_string: str
    speed: float
    budget: BudgetSchema
    citizens: List[Dict[str, Any]]
    vehicles: List[Dict[str, Any]]

class SimulationDeltaSchema(BaseModel):
    tick: int
    time_string: str
    budget_net_monthly: float
    citizens_updates: List[Dict[str, Any]]
    vehicles_updates: List[Dict[str, Any]]
