"""
METACITY — Simulation World Model
Coordinates chunks, districts, road & pedestrian networks, transit fleets, and businesses.
"""
from typing import Dict, List, Optional, Any
from app.simulation.world.chunk import WorldChunk
from app.simulation.transport.bus_system import BusSystem
from app.simulation.transport.metro_railway_system import MetroRailwaySystem
from app.simulation.businesses.business_manager import BusinessManager
from app.simulation.citizens.pedestrian_graph import PedestrianGraph


class World:
    def __init__(self, city_size: int = 8000, seed: int = 42):
        self.city_size = city_size
        self.seed = seed
        self.chunks: Dict[tuple, WorldChunk] = {}
        self.districts: Dict[str, Any] = {}
        self.road_graph: Any = None
        self.pedestrian_graph: PedestrianGraph = PedestrianGraph()
        self.infrastructure: Dict[str, dict] = {}
        self.citizens: Dict[str, Any] = {}
        self.households: Dict[str, Any] = {}
        self.vehicles: Dict[str, Any] = {}
        self.bus_system: BusSystem = BusSystem()
        self.metro_system: MetroRailwaySystem = MetroRailwaySystem()
        self.business_manager: BusinessManager = BusinessManager()

    def get_chunk(self, world_x: float, world_z: float) -> Optional[WorldChunk]:
        cx = int(world_x // 200)
        cz = int(world_z // 200)
        return self.chunks.get((cx, cz))

    def get_chunks_in_view(self, camera_x: float, camera_z: float, view_radius: float) -> List[WorldChunk]:
        chunks = []
        cx = int(camera_x // 200)
        cz = int(camera_z // 200)
        cr = int(view_radius // 200) + 1

        for x in range(cx - cr, cx + cr + 1):
            for z in range(cz - cr, cz + cr + 1):
                chunk = self.chunks.get((x, z))
                if chunk:
                    chunks.append(chunk)
        return chunks

    def get_district_at(self, world_x: float, world_z: float) -> Optional[Any]:
        for district in self.districts.values():
            x_min, z_min, x_max, z_max = district.bounds
            if x_min <= world_x <= x_max and z_min <= world_z <= z_max:
                return district
        return None

    def to_dict(self) -> dict:
        return {
            "city_size": self.city_size,
            "districts": [d.to_dict() for d in self.districts.values()],
            "infrastructure": list(self.infrastructure.values()),
        }

    def get_snapshot(self) -> dict:
        return {
            "citizens": [c.to_position_dict() for c in self.citizens.values()],
            "vehicles": list(self.vehicles.values()),
            "buses": self.bus_system.get_positions(),
        }
