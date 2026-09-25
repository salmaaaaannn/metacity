"""
METACITY — Disaster Cascade & Secondary Hazard Engine (Phase 4)
Models multi-system domino failure chains across urban infrastructure.
"""
from typing import Dict, List, Optional, Any
from app.simulation.disasters.disaster_types import DisasterIncident, DisasterType, IncidentStatus

class DisasterCascadeEngine:
    def __init__(self):
        self.cascade_events: List[Dict[str, Any]] = []

    def evaluate_cascades(
        self,
        active_incidents: Dict[str, DisasterIncident],
        environment: Any,
        world: Any
    ) -> List[Dict[str, Any]]:
        new_effects = []

        for inc in list(active_incidents.values()):
            if inc.status != IncidentStatus.ACTIVE:
                continue

            # Cascade 1: STORM with rainfall > 50mm causes secondary flood
            if inc.disaster_type == DisasterType.STORM and inc.severity >= 3:
                if not any(i.disaster_type == DisasterType.FLOOD for i in active_incidents.values()):
                    cascade = {
                        "cause_incident_id": inc.id,
                        "type": "SECONDARY_FLOOD",
                        "description": "Severe storm precipitation triggered stormwater drainage overload and flash flooding.",
                        "spawn_disaster": DisasterType.FLOOD,
                        "severity": inc.severity - 1,
                        "x": inc.epicenter_x,
                        "z": inc.epicenter_z
                    }
                    new_effects.append(cascade)
                    self.cascade_events.append(cascade)

            # Cascade 2: Heavy EARTHQUAKE (magnitude > 6.5) ruptures gas mains causing secondary fire
            elif inc.disaster_type == DisasterType.EARTHQUAKE and inc.severity >= 3:
                if not any(i.disaster_type == DisasterType.FIRE for i in active_incidents.values()):
                    cascade = {
                        "cause_incident_id": inc.id,
                        "type": "SEISMIC_INDUCED_FIRE",
                        "description": "Earthquake tremors ruptured gas pipelines and power conduits, igniting structural fires.",
                        "spawn_disaster": DisasterType.FIRE,
                        "severity": inc.severity - 1,
                        "x": inc.epicenter_x + 350.0,
                        "z": inc.epicenter_z + 250.0
                    }
                    new_effects.append(cascade)
                    self.cascade_events.append(cascade)

        return new_effects
