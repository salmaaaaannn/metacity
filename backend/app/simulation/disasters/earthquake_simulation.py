"""
METACITY — Deterministic Seismic Earthquake Simulation
Computes radial seismic wave attenuation and structural damage states.
"""
import math
import random
from typing import Dict, List, Any
from app.simulation.disasters.disaster_types import DisasterIncident, DamageState, IncidentStatus

class EarthquakeSimulator:
    def __init__(self, seed: int = 42):
        self.rng = random.Random(seed)
        self.building_damage_states: Dict[str, DamageState] = {}
        self.damaged_roads: List[str] = []

    def trigger(
        self,
        incident: DisasterIncident,
        world: Any
    ) -> Dict[str, Any]:
        magnitude = incident.metadata.get("magnitude", 6.8)
        radius = incident.radius
        ep_x = incident.epicenter_x
        ep_z = incident.epicenter_z

        affected_bldgs = []
        destroyed_count = 0
        severe_count = 0

        # Assess buildings deterministically based on distance from epicenter
        if hasattr(world, "chunks"):
            for chunk in world.chunks.values():
                cx = chunk.chunk_x * 200 + 100
                cz = chunk.chunk_z * 200 + 100
                dist = math.sqrt((cx - ep_x) ** 2 + (cz - ep_z) ** 2)
                if dist <= radius:
                    # Normalized seismic intensity (0.0 to 1.0)
                    intensity = (1.0 - (dist / radius)) * (magnitude / 8.0)
                    for b in chunk.buildings:
                        bid = b.get("id") if isinstance(b, dict) else getattr(b, "id", str(b))
                        affected_bldgs.append(bid)
                        # Determine damage state based on structural resilience & intensity
                        if intensity > 0.85:
                            self.building_damage_states[bid] = DamageState.DESTROYED
                            destroyed_count += 1
                        elif intensity > 0.65:
                            self.building_damage_states[bid] = DamageState.SEVERE
                            severe_count += 1
                        elif intensity > 0.40:
                            self.building_damage_states[bid] = DamageState.MODERATE
                        elif intensity > 0.20:
                            self.building_damage_states[bid] = DamageState.MINOR
                        else:
                            self.building_damage_states[bid] = DamageState.NONE

        # Road fissures in intense inner radius
        damaged_roads = []
        if hasattr(world, "road_graph") and world.road_graph:
            for n1, n2, data in world.road_graph.graph.edges(data=True):
                node1 = world.road_graph.graph.nodes.get(n1)
                node2 = world.road_graph.graph.nodes.get(n2)
                if node1 and node2 and 'pos' in node1 and 'pos' in node2:
                    pos1 = node1['pos']
                    pos2 = node2['pos']
                    mid_x = (pos1[0] + pos2[0]) / 2
                    mid_z = (pos1[1] + pos2[1]) / 2
                    dist = math.sqrt((mid_x - ep_x) ** 2 + (mid_z - ep_z) ** 2)
                    if dist <= radius * 0.4:
                        damaged_roads.append(f"{n1}_{n2}")
                        data["speed_limit"] = 10.0

        incident.affected_building_ids = affected_bldgs[:120]
        incident.affected_road_ids = damaged_roads
        incident.damage_cost = (destroyed_count * 250_000.0) + (severe_count * 100_000.0) + (len(affected_bldgs) * 20_000.0)

        return {
            "magnitude": magnitude,
            "total_damaged_buildings": len(affected_bldgs),
            "destroyed_count": destroyed_count,
            "severe_count": severe_count,
            "damaged_roads_count": len(damaged_roads)
        }
