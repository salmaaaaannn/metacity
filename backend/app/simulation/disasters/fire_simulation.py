"""
METACITY — Urban Fire Propagation & Hazard Modeling
Simulates structural fire spread, wind direction drift, and thermal damage.
"""
import math
from typing import Dict, List, Set, Any
from app.simulation.disasters.disaster_types import DisasterIncident, IncidentStatus

class FireSimulator:
    def __init__(self):
        self.burning_buildings: Set[str] = set()
        self.smoke_radius: float = 300.0

    def update(
        self,
        incident: DisasterIncident,
        world: Any,
        wind_speed: float,
        wind_direction_deg: float,
        dt_seconds: float
    ) -> Dict[str, Any]:
        if incident.status != IncidentStatus.ACTIVE:
            return {"burning_buildings_count": len(self.burning_buildings)}

        ep_x = incident.epicenter_x
        ep_z = incident.epicenter_z
        radius = incident.radius
        severity = incident.severity

        # Wind drift: shifts the fire propagation cone along wind vector
        wind_rad = math.radians(wind_direction_deg)
        drift_x = math.sin(wind_rad) * (wind_speed * 4.0)
        drift_z = math.cos(wind_rad) * (wind_speed * 4.0)
        effective_center_x = ep_x + drift_x
        effective_center_z = ep_z + drift_z

        self.smoke_radius = radius * 1.8

        affected_bldgs = []
        if hasattr(world, "chunks"):
            for chunk in world.chunks.values():
                cx = chunk.chunk_x * 200 + 100
                cz = chunk.chunk_z * 200 + 100
                dist = math.sqrt((cx - effective_center_x) ** 2 + (cz - effective_center_z) ** 2)
                if dist <= radius:
                    for b in chunk.buildings:
                        bid = b.get("id") if isinstance(b, dict) else getattr(b, "id", str(b))
                        b_type = (b.get('building_type') if isinstance(b, dict) else getattr(b, 'type', '')).lower()
                        # Flammability check: Industrial & residential have higher ignition probability
                        burn_chance = 0.85 if 'industrial' in b_type or 'residential' in b_type else 0.55
                        if severity >= 2 and burn_chance > 0.6:
                            self.burning_buildings.add(bid)
                        affected_bldgs.append(bid)

        incident.affected_building_ids = list(self.burning_buildings)[:80]
        incident.damage_cost = max(200_000.0 * severity, len(self.burning_buildings) * 120_000.0 * (severity / 2.0))

        return {
            "burning_buildings_count": len(self.burning_buildings),
            "smoke_radius": self.smoke_radius,
            "fire_front_x": round(effective_center_x, 1),
            "fire_front_z": round(effective_center_z, 1)
        }
