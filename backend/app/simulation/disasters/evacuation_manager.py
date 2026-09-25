"""
METACITY — Citizen Evacuation & Emergency Shelter Network (Phase 4)
"""
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any
import math
from app.simulation.disasters.disaster_types import DisasterIncident, IncidentStatus

@dataclass
class EmergencyShelter:
    id: str
    name: str
    district_id: str
    x: float
    z: float
    capacity: int = 5000
    occupancy: int = 0
    supplies_pct: float = 100.0

class EvacuationManager:
    def __init__(self):
        # 6 Strategic Municipal Disaster Shelters
        self.shelters: Dict[str, EmergencyShelter] = {
            "shelter_north": EmergencyShelter("shelter_north", "Northern Civic Arena", "d_north", 2500.0, 2000.0, capacity=8000),
            "shelter_cbd": EmergencyShelter("shelter_cbd", "Metacity Convention Hall", "d_cbd", 4200.0, 4200.0, capacity=12000),
            "shelter_west": EmergencyShelter("shelter_west", "Westside Sports Complex", "d_west", 1800.0, 5000.0, capacity=6000),
            "shelter_east": EmergencyShelter("shelter_east", "Eastern Technical Pavilion", "d_east", 6200.0, 3800.0, capacity=7500),
            "shelter_south": EmergencyShelter("shelter_south", "Southern Regional High", "d_south", 3500.0, 6800.0, capacity=5000),
            "shelter_river": EmergencyShelter("shelter_river", "Riverfront Safe Haven", "d_river", 4800.0, 5200.0, capacity=4500),
        }
        self.evacuated_citizen_ids: set[str] = set()

    def find_nearest_shelter(self, x: float, z: float) -> Optional[EmergencyShelter]:
        best = None
        min_d = float('inf')
        for s in self.shelters.values():
            if s.occupancy < s.capacity:
                d = math.sqrt((s.x - x) ** 2 + (s.z - z) ** 2)
                if d < min_d:
                    min_d = d
                    best = s
        return best

    def handle_evacuation_warning(self, incident: DisasterIncident, world: Any) -> int:
        if not hasattr(world, "citizens"):
            return 0

        evac_count = 0
        ep_x = incident.epicenter_x
        ep_z = incident.epicenter_z
        radius = incident.radius

        for citizen in world.citizens.values():
            dist = math.sqrt((citizen.current_x - ep_x) ** 2 + (citizen.current_z - ep_z) ** 2)
            if dist <= radius and citizen.id not in self.evacuated_citizen_ids:
                shelter = self.find_nearest_shelter(citizen.current_x, citizen.current_z)
                if shelter:
                    self.evacuated_citizen_ids.add(citizen.id)
                    shelter.occupancy += 1
                    citizen.destination_x = shelter.x
                    citizen.destination_z = shelter.z
                    citizen.destination_type = "shelter"
                    citizen.decision_reason = f"Evacuating to {shelter.name} due to {incident.disaster_type.value}"
                    evac_count += 1

        incident.evacuated_citizens = len(self.evacuated_citizen_ids)
        return evac_count

    def return_citizens_home(self, incident: DisasterIncident, world: Any) -> None:
        """Called when incident is resolved so citizens can return safely."""
        if not hasattr(world, "citizens"):
            return

        for cid in list(self.evacuated_citizen_ids):
            cit = world.citizens.get(cid)
            if cit:
                cit.destination_x = cit.home_x
                cit.destination_z = cit.home_z
                cit.destination_type = "home"
                cit.decision_reason = "Returning home: all clear declared."
        self.evacuated_citizen_ids.clear()
        for s in self.shelters.values():
            s.occupancy = 0

    def get_shelters_list(self) -> List[Dict[str, Any]]:
        return [
            {
                "id": s.id,
                "name": s.name,
                "district_id": s.district_id,
                "x": s.x,
                "z": s.z,
                "capacity": s.capacity,
                "occupancy": s.occupancy,
                "supplies_pct": s.supplies_pct
            }
            for s in self.shelters.values()
        ]
