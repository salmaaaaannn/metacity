"""
METACITY — Master Disaster & Emergency Manager (Phase 4)
Integrates Flood, Fire, Earthquake, Cascades, Emergency Dispatch, Evacuation, and Recovery.
"""
from typing import Dict, List, Optional, Any
from app.simulation.disasters.disaster_types import DisasterIncident, DisasterType, DamageState, IncidentStatus
from app.simulation.disasters.flood_simulation import FloodSimulator
from app.simulation.disasters.fire_simulation import FireSimulator
from app.simulation.disasters.earthquake_simulation import EarthquakeSimulator
from app.simulation.disasters.emergency_manager import EmergencyManager
from app.simulation.disasters.evacuation_manager import EvacuationManager
from app.simulation.disasters.disaster_cascade import DisasterCascadeEngine
from app.simulation.disasters.recovery_system import RecoverySystem
from app.simulation.disasters.resilience_index import calculate_city_resilience_index

import math

class DisasterManager:
    def __init__(self, world: Any, budget: Any):
        self.world = world
        self.budget = budget
        self.incidents: Dict[str, DisasterIncident] = {}
        self.flood_sim = FloodSimulator()
        self.fire_sim = FireSimulator()
        self.earthquake_sim = EarthquakeSimulator()
        self.emergency_mgr = EmergencyManager()
        self.evacuation_mgr = EvacuationManager()
        self.cascade_engine = DisasterCascadeEngine()
        self.recovery_sys = RecoverySystem(budget)

    def calculate_response_times(self, epicenter_x: float, epicenter_z: float) -> Dict[str, Any]:
        fire_station, police_station, hospital = None, None, None
        min_fire_dist, min_police_dist, min_hosp_dist = float('inf'), float('inf'), float('inf')

        # Fallbacks (matching emergency_mgr fallbacks)
        stations = [
            {"x": 3800.0, "z": 4800.0, "item_type": "police", "id": "default_police"},
            {"x": 3600.0, "z": 4400.0, "item_type": "hospital", "id": "default_hospital"},
            {"x": 4000.0, "z": 4000.0, "item_type": "fire", "id": "default_fire"}
        ]

        if hasattr(self.world, "infrastructure") and getattr(self.world, "infrastructure"):
            stations_list = list(self.world.infrastructure.values())
            # only use actual stations if they contain any
            if any(st.get("item_type") in ["police", "hospital", "fire"] for st in stations_list):
                stations = stations_list

        for st in stations:
            itype = st.get("item_type", "")
            sx, sz = st.get("x", 4000.0), st.get("z", 4000.0)
            dist = math.sqrt((sx - epicenter_x)**2 + (sz - epicenter_z)**2)
            
            if itype == "fire" and dist < min_fire_dist:
                min_fire_dist = dist
                fire_station = st
            elif itype == "police" and dist < min_police_dist:
                min_police_dist = dist
                police_station = st
            elif itype == "hospital" and dist < min_hosp_dist:
                min_hosp_dist = dist
                hospital = st

        # Speed average = 750 m/min
        speed = 750.0
        penalty = 1.3 if len(self.flood_sim.closed_roads) > 0 else 1.0
        
        fire_eta = (min_fire_dist / speed) * penalty if fire_station and min_fire_dist != float('inf') else 0.0
        police_eta = (min_police_dist / speed) * penalty if police_station and min_police_dist != float('inf') else 0.0
        hosp_eta = (min_hosp_dist / speed) * penalty if hospital and min_hosp_dist != float('inf') else 0.0

        return {
            "fire_eta_minutes": round(fire_eta, 2),
            "police_eta_minutes": round(police_eta, 2),
            "medical_eta_minutes": round(hosp_eta, 2),
            "nearest_fire_station": fire_station.get("id", "Unknown") if fire_station else "None",
            "nearest_police": police_station.get("id", "Unknown") if police_station else "None",
            "nearest_hospital": hospital.get("id", "Unknown") if hospital else "None"
        }

    def trigger_disaster(
        self,
        disaster_type: DisasterType,
        epicenter_x: float = 4000.0,
        epicenter_z: float = 4000.0,
        severity: int = 2,
        radius: float = 1200.0,
        duration_seconds: float = 180.0,
        metadata: Optional[Dict[str, Any]] = None
    ) -> DisasterIncident:
        metadata = metadata or {}
        metadata["response_times"] = self.calculate_response_times(epicenter_x, epicenter_z)
        
        incident = DisasterIncident(
            disaster_type=disaster_type,
            severity=severity,
            epicenter_x=epicenter_x,
            epicenter_z=epicenter_z,
            radius=radius,
            duration_seconds=duration_seconds,
            metadata=metadata
        )
        self.incidents[incident.id] = incident

        # Initial immediate effects
        if disaster_type == DisasterType.EARTHQUAKE:
            self.earthquake_sim.trigger(incident, self.world)

        # Dispatch emergency units
        self.emergency_mgr.dispatch_for_incident(incident, self.world)

        # Trigger citizen evacuation warnings
        self.evacuation_mgr.handle_evacuation_warning(incident, self.world)

        return incident

    def pause_disaster(self, incident_id: str) -> bool:
        inc = self.incidents.get(incident_id)
        if inc:
            inc.status = IncidentStatus.CONTAINED
            return True
        return False

    def stop_disaster(self, incident_id: str) -> Optional[Dict[str, Any]]:
        inc = self.incidents.get(incident_id)
        if not inc:
            return None
        res = self.recovery_sys.process_recovery(inc, self.world, self.evacuation_mgr)
        return res

    def reset_all(self) -> None:
        for inc in list(self.incidents.values()):
            self.stop_disaster(inc.id)
        self.incidents.clear()
        self.flood_sim.flooded_chunks.clear()
        self.flood_sim.closed_roads.clear()
        self.fire_sim.burning_buildings.clear()
        self.earthquake_sim.building_damage_states.clear()

    def update(self, dt_seconds: float, environment_state: Any) -> None:
        wind_speed = getattr(environment_state, "wind_speed", 12.0)
        wind_dir = getattr(environment_state, "wind_direction", 45.0)

        for inc in list(self.incidents.values()):
            if inc.status == IncidentStatus.RESOLVED:
                continue

            inc.elapsed_seconds += dt_seconds

            # Continuous simulation updates
            if inc.disaster_type == DisasterType.FLOOD:
                self.flood_sim.update(inc, self.world, dt_seconds)
            elif inc.disaster_type == DisasterType.FIRE:
                self.fire_sim.update(inc, self.world, wind_speed, wind_dir, dt_seconds)

            # Auto containment / resolution when duration expires
            if inc.elapsed_seconds >= inc.duration_seconds and inc.status == IncidentStatus.ACTIVE:
                self.stop_disaster(inc.id)

        # Update dispatched emergency units
        self.emergency_mgr.update(dt_seconds, self.incidents)

        # Check cascading triggers
        cascades = self.cascade_engine.evaluate_cascades(self.incidents, environment_state, self.world)
        for cas in cascades:
            if cas.get("spawn_disaster"):
                self.trigger_disaster(
                    disaster_type=cas["spawn_disaster"],
                    epicenter_x=cas.get("x", 4000.0),
                    epicenter_z=cas.get("z", 4000.0),
                    severity=cas.get("severity", 2),
                    metadata={"cascade_from": cas.get("cause_incident_id")}
                )

    def get_hud_metrics(self) -> Dict[str, Any]:
        active_list = [inc for inc in self.incidents.values() if inc.status == IncidentStatus.ACTIVE]
        affected_pop = sum(inc.evacuated_citizens for inc in self.incidents.values())
        affected_bldgs = sum(len(inc.affected_building_ids) for inc in self.incidents.values())
        total_damage = sum(inc.damage_cost for inc in self.incidents.values())

        incidents_data = []
        for inc in self.incidents.values():
            inc_dict = inc.to_dict()
            if "response_times" in inc.metadata:
                inc_dict["response_times"] = inc.metadata["response_times"]
            else:
                inc_dict["response_times"] = self.calculate_response_times(inc.epicenter_x, inc.epicenter_z)
            incidents_data.append(inc_dict)

        return {
            "active_incidents_count": len(active_list),
            "incidents": incidents_data,
            "affected_population": affected_pop,
            "affected_buildings_count": affected_bldgs,
            "closed_roads_count": len(self.flood_sim.closed_roads),
            "closed_roads": list(self.flood_sim.closed_roads),
            "evacuated_citizens": len(self.evacuation_mgr.evacuated_citizen_ids),
            "emergency_vehicles_active": len(self.emergency_mgr.active_units),
            "emergency_units": self.emergency_mgr.get_active_units(),
            "total_estimated_damage": round(total_damage, 2),
            "shelters": self.evacuation_mgr.get_shelters_list()
        }

    def get_resilience(self, environment_state: Any) -> Dict[str, Any]:
        active_count = len([i for i in self.incidents.values() if i.status == IncidentStatus.ACTIVE])
        return calculate_city_resilience_index(self.world, environment_state, active_count)
