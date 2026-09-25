"""
METACITY — Spatial Flood Simulation Model
Calculates riverbank overflow, low-elevation drainage saturation, and road closures.
"""
import math
from typing import Dict, List, Set, Any
from app.simulation.disasters.disaster_types import DisasterIncident, DisasterType, IncidentStatus

# River coordinates roughly x=4900..5100, z=5500..7500
RIVER_CENTER_X = 5000.0
RIVER_Z_MIN = 5500.0
RIVER_Z_MAX = 7500.0

class FloodSimulator:
    def __init__(self):
        self.flooded_chunks: Dict[str, float] = {}  # chunk_key -> flood depth (m)
        self.closed_roads: Set[str] = set()

    def update(
        self,
        incident: DisasterIncident,
        world: Any,
        dt_seconds: float
    ) -> Dict[str, Any]:
        if incident.status != IncidentStatus.ACTIVE:
            return {"flooded_chunks_count": len(self.flooded_chunks), "closed_roads": list(self.closed_roads)}

        severity = incident.severity
        radius = incident.radius
        ep_x = incident.epicenter_x
        ep_z = incident.epicenter_z

        # Depth reaches up to 2.5m at severity 4
        target_depth = severity * 0.65

        # 1. Flood propagation along nearby terrain & river chunks
        affected_roads = []
        affected_buildings = []

        if hasattr(world, "road_graph") and world.road_graph:
            for n1, n2, data in world.road_graph.graph.edges(data=True):
                node1 = world.road_graph.graph.nodes.get(n1)
                node2 = world.road_graph.graph.nodes.get(n2)
                if not node1 or not node2 or 'pos' not in node1 or 'pos' not in node2:
                    continue
                pos1 = node1['pos']
                pos2 = node2['pos']
                mid_x = (pos1[0] + pos2[0]) / 2
                mid_z = (pos1[1] + pos2[1]) / 2

                dist = math.sqrt((mid_x - ep_x) ** 2 + (mid_z - ep_z) ** 2)
                road_id = f"{n1}_{n2}"
                if dist <= radius:
                    affected_roads.append(road_id)
                    if severity >= 2:
                        self.closed_roads.add(road_id)
                        # Lower speed limit dramatically
                        data["speed_limit"] = 5.0
                    else:
                        data["speed_limit"] = 15.0

        incident.affected_road_ids = affected_roads[:50]

        # 2. Check buildings in flooded zone
        if hasattr(world, "chunks"):
            for chunk_key, chunk in world.chunks.items():
                cx = chunk.chunk_x * 200 + 100
                cz = chunk.chunk_z * 200 + 100
                dist = math.sqrt((cx - ep_x) ** 2 + (cz - ep_z) ** 2)
                if dist <= radius:
                    self.flooded_chunks[str(chunk_key)] = target_depth
                    for b in chunk.buildings:
                        bid = b.get("id") if isinstance(b, dict) else getattr(b, "id", str(b))
                        affected_buildings.append(bid)

        incident.affected_building_ids = affected_buildings[:100]
        incident.damage_cost = max(150_000.0 * severity, len(affected_buildings) * 45_000.0 * (severity / 2.0))

        return {
            "flooded_chunks_count": len(self.flooded_chunks),
            "closed_roads_count": len(self.closed_roads),
            "closed_roads": list(self.closed_roads),
            "depth": target_depth
        }
