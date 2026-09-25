"""
METACITY — Emergency Management & Multi-Agency Dispatch System (Phase 4)
Handles Police, Fire, Ambulance, and Disaster Response vehicle routing and suppression.
"""
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any
import math
import uuid
import time
from app.simulation.disasters.disaster_types import DisasterIncident, IncidentStatus

@dataclass
class EmergencyUnit:
    id: str
    unit_type: str  # 'fire_engine', 'police_cruiser', 'ambulance', 'rescue_van'
    current_x: float
    current_z: float
    target_incident_id: str
    status: str     # 'en_route', 'on_scene', 'returning'
    speed: float = 24.0

class EmergencyManager:
    def __init__(self):
        self.active_units: Dict[str, EmergencyUnit] = {}
        self.dispatch_logs: List[Dict[str, Any]] = []

    def dispatch_for_incident(self, incident: DisasterIncident, world: Any) -> List[EmergencyUnit]:
        dispatched = []
        num_units = max(2, incident.severity * 2)

        # Find nearest civic stations
        stations = []
        if hasattr(world, "infrastructure"):
            for item in world.infrastructure.values():
                itype = item.get("item_type", "")
                if incident.disaster_type.value == "FIRE" and itype == "fire":
                    stations.append(item)
                elif incident.disaster_type.value == "FLOOD" and itype in ["police", "fire"]:
                    stations.append(item)
                elif incident.disaster_type.value == "EARTHQUAKE" and itype in ["hospital", "police", "fire"]:
                    stations.append(item)

        # Fallback origins if no placed civic infrastructure near
        if not stations:
            stations = [
                {"x": 3800.0, "z": 4800.0, "item_type": "police"},
                {"x": 3600.0, "z": 4400.0, "item_type": "hospital"},
                {"x": 4000.0, "z": 4000.0, "item_type": "fire"}
            ]

        for i in range(num_units):
            st = stations[i % len(stations)]
            u_type = "fire_engine" if incident.disaster_type.value == "FIRE" else "ambulance" if i % 2 == 0 else "police_cruiser"
            unit_id = f"emg_{uuid.uuid4().hex[:6]}"
            unit = EmergencyUnit(
                id=unit_id,
                unit_type=u_type,
                current_x=st.get("x", 4000.0),
                current_z=st.get("z", 4000.0),
                target_incident_id=incident.id,
                status="en_route"
            )
            self.active_units[unit_id] = unit
            dispatched.append(unit)

        self.dispatch_logs.append({
            "timestamp": time.time(),
            "incident_id": incident.id,
            "disaster_type": incident.disaster_type.value,
            "units_dispatched": len(dispatched),
            "priority": "CRITICAL" if incident.severity >= 3 else "HIGH"
        })

        return dispatched

    def update(self, dt_seconds: float, incidents: Dict[str, DisasterIncident]) -> None:
        for unit in list(self.active_units.values()):
            inc = incidents.get(unit.target_incident_id)
            if not inc or inc.status == IncidentStatus.RESOLVED:
                del self.active_units[unit.id]
                continue

            # Move towards incident epicenter
            dx = inc.epicenter_x - unit.current_x
            dz = inc.epicenter_z - unit.current_z
            dist = math.sqrt(dx * dx + dz * dz)

            if dist < 45.0:
                unit.status = "on_scene"
                # On-scene units accelerate containment & repair
                inc.repair_progress = min(1.0, inc.repair_progress + (0.015 * dt_seconds))
                if inc.repair_progress >= 0.7:
                    inc.status = IncidentStatus.CONTAINED
            else:
                unit.status = "en_route"
                step = unit.speed * dt_seconds * 1.5
                unit.current_x += (dx / dist) * step
                unit.current_z += (dz / dist) * step

    def get_active_units(self) -> List[Dict[str, Any]]:
        return [
            {
                "id": u.id,
                "unit_type": u.unit_type,
                "x": round(u.current_x, 1),
                "z": round(u.current_z, 1),
                "status": u.status,
                "target_incident_id": u.target_incident_id
            }
            for u in self.active_units.values()
        ]
