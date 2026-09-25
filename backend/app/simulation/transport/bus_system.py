"""
METACITY — Active Bus Simulation System
Manages bus routes, bus stops, moving bus fleet, passenger waiting queues,
boarding, alighting, and capacity tracking.
"""
from dataclasses import dataclass, field
from typing import List, Dict, Tuple, Optional, Any
import math
import uuid


@dataclass
class BusStop:
    id: str
    name: str
    x: float
    z: float
    route_id: str
    waiting_citizens: List[str] = field(default_factory=list)

    def add_waiting(self, citizen_id: str) -> None:
        if citizen_id not in self.waiting_citizens:
            self.waiting_citizens.append(citizen_id)

    def remove_waiting(self, citizen_id: str) -> None:
        if citizen_id in self.waiting_citizens:
            self.waiting_citizens.remove(citizen_id)


@dataclass
class BusVehicle:
    id: str
    route_id: str
    route_name: str
    current_x: float
    current_z: float
    heading: float = 0.0
    speed: float = 12.0  # m/s (~43 km/h)
    capacity: int = 40
    passengers: List[str] = field(default_factory=list)  # citizen ids
    current_stop_idx: int = 0
    waypoints: List[Tuple[float, float]] = field(default_factory=list)
    waypoint_idx: int = 0
    state: str = "travelling"  # 'travelling', 'at_stop', 'boarding'
    dwell_ticks_remaining: int = 0

    def to_position_dict(self) -> dict:
        return {
            "id": self.id,
            "x": round(self.current_x, 1),
            "z": round(self.current_z, 1),
            "type": "bus",
            "route_id": self.route_id,
            "route_name": self.route_name,
            "heading": round(self.heading, 2),
            "passengers": len(self.passengers),
            "capacity": self.capacity,
            "state": self.state,
        }


class BusSystem:
    def __init__(self):
        self.stops: Dict[str, BusStop] = {}
        self.buses: Dict[str, BusVehicle] = {}
        self.routes: Dict[str, dict] = {}
        self._initialize_routes()

    def _initialize_routes(self):
        """Creates 12 bus routes covering major corridors and connecting districts."""
        route_configs = [
            ("R1", "Route 1: CBD Loop", "#FF9800", [
                (3400, 3400, "CBD SW"), (3400, 4600, "CBD NW"),
                (4600, 4600, "CBD NE"), (4600, 3400, "CBD SE"), (3400, 3400, "CBD SW")
            ]),
            ("R2", "Route 2: High-Density Corridor", "#E91E63", [
                (2400, 2600, "High-Density W"), (3000, 3200, "High-Density Central"),
                (3600, 3600, "CBD West Gate"), (4000, 4000, "CBD Central"), (4800, 4400, "East CBD")
            ]),
            ("R3", "Route 3: University Express", "#9C27B0", [
                (4000, 4000, "CBD Central"), (4000, 2800, "Arts Hub"),
                (4000, 1600, "University Quad"), (4600, 1400, "University Research"), (5000, 1800, "Tech Gateway")
            ]),
            ("R4", "Route 4: Industrial Line", "#795548", [
                (4000, 4000, "CBD Central"), (5200, 4800, "South CBD"),
                (6000, 6000, "Industrial Entrance"), (6800, 6600, "Heavy Industry"), (7200, 7200, "Industrial Depot")
            ]),
            ("R5", "Route 5: Tech Park Radial", "#00BCD4", [
                (4000, 4000, "CBD Central"), (5000, 3400, "East Crossing"),
                (5800, 2400, "Tech Park SW"), (6600, 2200, "Tech Center"), (7000, 2800, "Innovation Park")
            ]),
            ("R6", "Route 6: Suburban Connector", "#FF5722", [
                (2000, 5200, "Suburban West"), (2600, 5600, "Suburban Center"),
                (3200, 5400, "Suburban East"), (3800, 4800, "South CBD Gate"), (4000, 4000, "CBD Central")
            ]),
            ("R7", "Route 7: Riverfront Promenade", "#009688", [
                (3600, 5800, "Riverfront North"), (4200, 6400, "Riverfront Pier"),
                (4800, 6800, "Riverfront Marina"), (5000, 6400, "Central Bridge"), (4000, 4000, "CBD Central")
            ]),
            ("R8", "Route 8: Outskirts Shuttle", "#8BC34A", [
                (800, 1200, "West Outskirts"), (1400, 1800, "Developing Hub"),
                (2200, 2400, "Outer Residential"), (3200, 3200, "CBD Approach"), (4000, 4000, "CBD Central")
            ]),
            ("R9", "Route 9: Logistics Shuttle", "#607D8B", [
                (6600, 4200, "Logistics Gate 1"), (7200, 4600, "Logistics Center"),
                (7400, 5200, "Freight Terminal"), (6800, 5600, "Industrial Junction")
            ]),
            ("R10", "Route 10: Ring Road Express", "#3F51B5", [
                (1200, 1200, "Ring NW"), (6800, 1200, "Ring NE"),
                (6800, 6800, "Ring SE"), (1200, 6800, "Ring SW"), (1200, 1200, "Ring NW")
            ]),
            ("R11", "Route 11: Low-Density Cross", "#CDDC39", [
                (1400, 6000, "Low-Density S"), (2200, 6400, "South Suburbs"),
                (3400, 6400, "Riverfront South"), (4000, 4000, "CBD Central")
            ]),
            ("R12", "Route 12: Civic Campus Loop", "#673AB7", [
                (3600, 3800, "City Hall"), (4000, 4200, "Central Square"),
                (4400, 3800, "Justice Center"), (4000, 3600, "Civic Plaza")
            ]),
        ]

        for rid, name, color, stop_defs in route_configs:
            route_stops = []
            waypoints = []
            for i, (sx, sz, sname) in enumerate(stop_defs):
                sid = f"{rid}_stop_{i}"
                stop = BusStop(id=sid, name=sname, x=sx, z=sz, route_id=rid)
                self.stops[sid] = stop
                route_stops.append(sid)
                waypoints.append((sx, sz))

            self.routes[rid] = {
                "id": rid,
                "name": name,
                "color": color,
                "stops": route_stops,
                "waypoints": waypoints,
            }

            # Spawn 2-3 buses per route
            num_buses = 2 if len(waypoints) <= 5 else 3
            for b_idx in range(num_buses):
                bid = f"bus_{rid}_{b_idx}"
                start_idx = (b_idx * (len(waypoints) // num_buses)) % len(waypoints)
                wx, wz = waypoints[start_idx]
                self.buses[bid] = BusVehicle(
                    id=bid,
                    route_id=rid,
                    route_name=name,
                    current_x=wx,
                    current_z=wz,
                    waypoints=waypoints,
                    waypoint_idx=start_idx,
                    current_stop_idx=start_idx,
                )

    def find_nearest_stop(self, x: float, z: float) -> Optional[BusStop]:
        if not self.stops:
            return None
        return min(self.stops.values(), key=lambda s: (s.x - x) ** 2 + (s.z - z) ** 2)

    def update(self, delta_time: float, citizens_map: Dict[str, Any]) -> None:
        """Advance buses, process boardings and alightings."""
        for bus in self.buses.values():
            if bus.dwell_ticks_remaining > 0:
                bus.dwell_ticks_remaining -= 1
                if bus.dwell_ticks_remaining == 0:
                    bus.state = "travelling"
                continue

            if not bus.waypoints:
                continue

            target_x, target_z = bus.waypoints[bus.waypoint_idx]
            dx = target_x - bus.current_x
            dz = target_z - bus.current_z
            dist = math.sqrt(dx * dx + dz * dz)
            step = bus.speed * delta_time

            if dist > 0.001:
                bus.heading = math.atan2(dx, dz)

            if dist <= step:
                bus.current_x = target_x
                bus.current_z = target_z
                # Arrived at a stop
                bus.state = "at_stop"
                bus.dwell_ticks_remaining = 3  # Dwell for a few ticks

                # Check which stop this is
                curr_stop_id = None
                for sid in self.routes.get(bus.route_id, {}).get("stops", []):
                    st = self.stops.get(sid)
                    if st and abs(st.x - target_x) < 5 and abs(st.z - target_z) < 5:
                        curr_stop_id = sid
                        break

                if curr_stop_id:
                    stop = self.stops[curr_stop_id]
                    # 1. Alight passengers who have reached near their destination
                    alighted = []
                    for cid in list(bus.passengers):
                        cit = citizens_map.get(cid)
                        if cit and cit.destination_x is not None:
                            d_dest = math.sqrt((cit.destination_x - bus.current_x) ** 2 + (cit.destination_z - bus.current_z) ** 2)
                            if d_dest < 800:  # Within walking range of destination
                                alighted.append(cid)
                                cit.current_x = bus.current_x
                                cit.current_z = bus.current_z
                                cit.active_vehicle_id = None
                                cit.transition_to(cit.current_state.WALKING, "Alighted bus; walking to final destination")
                                cit.set_route([(cit.destination_x, cit.destination_z)], cit.destination_type, cit.destination_x, cit.destination_z)
                    for cid in alighted:
                        bus.passengers.remove(cid)

                    # 2. Board waiting passengers
                    while stop.waiting_citizens and len(bus.passengers) < bus.capacity:
                        cid = stop.waiting_citizens.pop(0)
                        cit = citizens_map.get(cid)
                        if cit:
                            bus.passengers.append(cid)
                            cit.active_vehicle_id = bus.id
                            cit.current_x = bus.current_x
                            cit.current_z = bus.current_z
                            cit.transition_to(cit.current_state.RIDING_BUS, f"Riding {bus.route_name}")

                # Advance to next waypoint
                bus.waypoint_idx = (bus.waypoint_idx + 1) % len(bus.waypoints)
            else:
                bus.current_x += (dx / dist) * step
                bus.current_z += (dz / dist) * step

    def get_positions(self) -> List[dict]:
        return [b.to_position_dict() for b in self.buses.values()]
