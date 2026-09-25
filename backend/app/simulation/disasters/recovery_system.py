"""
METACITY — Post-Disaster Recovery & Reconstruction System (Phase 4)
Orchestrates debris removal, repairs, municipal budget deductions, and network restoration.
"""
from typing import Dict, List, Any
from app.simulation.disasters.disaster_types import DisasterIncident, IncidentStatus

class RecoverySystem:
    def __init__(self, budget: Any):
        self.budget = budget
        self.recovery_records: List[Dict[str, Any]] = []

    def process_recovery(
        self,
        incident: DisasterIncident,
        world: Any,
        evacuation_mgr: Any
    ) -> Dict[str, Any]:
        incident.status = IncidentStatus.RECOVERING

        # Deduct repair and reconstruction expenses from city budget
        repair_cost = incident.damage_cost * 0.65
        if repair_cost > 0:
            self.budget.deduct_construction(
                repair_cost,
                f"Disaster Recovery & Reconstruction ({incident.disaster_type.value})",
                category="maintenance"
            )

        # Restore road networks
        if hasattr(world, "road_graph") and world.road_graph:
            for road_id in incident.affected_road_ids:
                parts = road_id.split("_")
                if len(parts) >= 2:
                    n1, n2 = parts[0], parts[1]
                    if world.road_graph.graph.has_edge(n1, n2):
                        world.road_graph.graph[n1][n2]["speed_limit"] = 50.0

        # Return evacuated citizens
        evacuation_mgr.return_citizens_home(incident, world)

        incident.status = IncidentStatus.RESOLVED
        incident.repair_progress = 1.0

        record = {
            "incident_id": incident.id,
            "disaster_type": incident.disaster_type.value,
            "damage_cost": round(incident.damage_cost, 2),
            "repair_cost": round(repair_cost, 2),
            "affected_buildings": len(incident.affected_building_ids),
            "affected_roads": len(incident.affected_road_ids),
            "remaining_budget": round(self.budget.balance, 2)
        }
        self.recovery_records.append(record)
        return record
