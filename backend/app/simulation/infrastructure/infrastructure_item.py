"""
METACITY — Physical Infrastructure Item Model
Defines infrastructure objects, costs, service radii, capacities, and condition.
"""
from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any
import uuid


INFRASTRUCTURE_PROFILES: Dict[str, dict] = {
    # Transportation
    "road": {
        "construction_cost_per_m": 800.0,
        "monthly_maintenance_per_m": 12.0,
        "capacity": 1200,
        "speed_limit": 50,
        "lanes": 2,
        "service_radius": 300.0,
    },
    "arterial": {
        "construction_cost_per_m": 1600.0,
        "monthly_maintenance_per_m": 25.0,
        "capacity": 2400,
        "speed_limit": 70,
        "lanes": 4,
        "service_radius": 500.0,
    },
    "highway": {
        "construction_cost_per_m": 3500.0,
        "monthly_maintenance_per_m": 50.0,
        "capacity": 4800,
        "speed_limit": 110,
        "lanes": 6,
        "service_radius": 1000.0,
    },
    "bridge": {
        "construction_cost_per_m": 5000.0,
        "monthly_maintenance_per_m": 80.0,
        "capacity": 2400,
        "speed_limit": 60,
        "lanes": 4,
        "service_radius": 600.0,
    },
    "metro_station": {
        "construction_cost": 1_250_000.0,
        "monthly_maintenance": 48_000.0,
        "capacity": 6000,
        "service_radius": 1200.0,
    },
    "metro_track": {
        "construction_cost_per_m": 2500.0,
        "monthly_maintenance_per_m": 30.0,
        "capacity": 10000,
        "service_radius": 200.0,
    },
    "bus_stop": {
        "construction_cost": 25_000.0,
        "monthly_maintenance": 1_200.0,
        "capacity": 150,
        "service_radius": 600.0,
    },
    "bus_depot": {
        "construction_cost": 850_000.0,
        "monthly_maintenance": 35_000.0,
        "capacity": 50,
        "service_radius": 2500.0,
    },
    "railway": {
        "construction_cost_per_m": 3000.0,
        "monthly_maintenance_per_m": 40.0,
        "capacity": 8000,
        "service_radius": 400.0,
    },
    "railway_station": {
        "construction_cost": 2_500_000.0,
        "monthly_maintenance": 85_000.0,
        "capacity": 12000,
        "service_radius": 2000.0,
    },

    # Public Services
    "hospital": {
        "construction_cost": 3_500_000.0,
        "monthly_maintenance": 180_000.0,
        "capacity": 600,
        "service_radius": 2200.0,
    },
    "school": {
        "construction_cost": 1_200_000.0,
        "monthly_maintenance": 65_000.0,
        "capacity": 900,
        "service_radius": 1400.0,
    },
    "police": {
        "construction_cost": 950_000.0,
        "monthly_maintenance": 55_000.0,
        "capacity": 150,
        "service_radius": 1800.0,
    },
    "fire": {
        "construction_cost": 850_000.0,
        "monthly_maintenance": 45_000.0,
        "capacity": 80,
        "service_radius": 1600.0,
    },
    "park": {
        "construction_cost": 350_000.0,
        "monthly_maintenance": 15_000.0,
        "capacity": 2500,
        "service_radius": 1000.0,
    },

    # Utilities
    "power_plant": {
        "construction_cost": 6_500_000.0,
        "monthly_maintenance": 220_000.0,
        "capacity": 250000,
        "service_radius": 4500.0,
    },
    "substation": {
        "construction_cost": 450_000.0,
        "monthly_maintenance": 20_000.0,
        "capacity": 60000,
        "service_radius": 1500.0,
    },
    "water_plant": {
        "construction_cost": 4_200_000.0,
        "monthly_maintenance": 140_000.0,
        "capacity": 180000,
        "service_radius": 4000.0,
    },
    "water_pipe": {
        "construction_cost_per_m": 400.0,
        "monthly_maintenance_per_m": 5.0,
        "capacity": 50000,
        "service_radius": 400.0,
    },

    # Zoning / Buildings
    "commercial": {
        "construction_cost": 750_000.0,
        "monthly_maintenance": 10_000.0,
        "capacity": 120,
        "service_radius": 500.0,
    },
    "residential": {
        "construction_cost": 650_000.0,
        "monthly_maintenance": 8_000.0,
        "capacity": 180,
        "service_radius": 300.0,
    },
    "office": {
        "construction_cost": 1_800_000.0,
        "monthly_maintenance": 25_000.0,
        "capacity": 350,
        "service_radius": 600.0,
    },
    "industrial": {
        "construction_cost": 1_400_000.0,
        "monthly_maintenance": 30_000.0,
        "capacity": 280,
        "service_radius": 800.0,
    },
}


@dataclass
class InfrastructureItem:
    id: str
    item_type: str
    subtype: str
    name: str
    district_id: str
    x: float
    z: float
    end_x: Optional[float] = None
    end_z: Optional[float] = None
    construction_cost: float = 0.0
    monthly_maintenance: float = 0.0
    operating_cost: float = 0.0
    condition: float = 1.0  # 0.0 to 1.0
    capacity: int = 100
    current_usage: int = 0
    service_radius: float = 600.0
    connected_network_ids: List[str] = field(default_factory=list)
    created_sim_tick: int = 0
    upgrade_level: int = 1

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "type": self.item_type,
            "subtype": self.subtype,
            "name": self.name,
            "district_id": self.district_id,
            "x": round(self.x, 1),
            "z": round(self.z, 1),
            "end_x": round(self.end_x, 1) if self.end_x is not None else None,
            "end_z": round(self.end_z, 1) if self.end_z is not None else None,
            "construction_cost": self.construction_cost,
            "monthly_maintenance": self.monthly_maintenance,
            "condition": round(self.condition, 2),
            "capacity": self.capacity,
            "current_usage": self.current_usage,
            "service_radius": self.service_radius,
            "upgrade_level": self.upgrade_level,
            "connected_network_ids": self.connected_network_ids,
        }
