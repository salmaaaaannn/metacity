"""
METACITY — Infrastructure Manager
Authoritative manager for infrastructure placement validation, construction,
network updates, service registration, budget deduction, upgrades, and demolition.
"""
from typing import Dict, List, Optional, Tuple, Any
import math
import uuid
from app.simulation.infrastructure.infrastructure_item import InfrastructureItem, INFRASTRUCTURE_PROFILES
from app.simulation.infrastructure.event_dispatcher import EventDispatcher


class InfrastructureManager:
    def __init__(self, world: Any, budget: Any, event_dispatcher: Optional[EventDispatcher] = None):
        self.world = world
        self.budget = budget
        self.event_dispatcher = event_dispatcher or EventDispatcher()
        self.items: Dict[str, InfrastructureItem] = {}

    def validate_placement(
        self,
        item_type: str,
        x: float,
        z: float,
        end_x: Optional[float] = None,
        end_z: Optional[float] = None,
        subtype: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Authoritative validation of infrastructure placement.
        Returns validation status, costs, population served, and impact estimation.
        """
        # 1. Coordinate boundaries
        if not (0 <= x <= 8000 and 0 <= z <= 8000):
            return {"valid": False, "reason": "Coordinates outside world boundary (0 - 8000m)", "required": 0, "available": self.budget.balance}

        if end_x is not None and end_z is not None:
            if not (0 <= end_x <= 8000 and 0 <= end_z <= 8000):
                return {"valid": False, "reason": "End coordinates outside world boundary", "required": 0, "available": self.budget.balance}

        # 2. Cost calculation
        prof_key = subtype if subtype in INFRASTRUCTURE_PROFILES else item_type
        profile = INFRASTRUCTURE_PROFILES.get(prof_key, INFRASTRUCTURE_PROFILES.get(item_type, {}))
        if not profile:
            return {"valid": False, "reason": f"Unknown infrastructure type: {item_type}", "required": 0, "available": self.budget.balance}

        is_linear = end_x is not None and end_z is not None
        if is_linear:
            length = math.sqrt((end_x - x) ** 2 + (end_z - z) ** 2)
            if length < 20.0:
                return {"valid": False, "reason": "Segment too short (minimum 20m)", "required": 0, "available": self.budget.balance}
            cost_per_m = profile.get("construction_cost_per_m", 800.0)
            maint_per_m = profile.get("monthly_maintenance_per_m", 12.0)
            construction_cost = length * cost_per_m
            monthly_maint = length * maint_per_m
        else:
            length = 0.0
            construction_cost = profile.get("construction_cost", 500_000.0)
            monthly_maint = profile.get("monthly_maintenance", 20_000.0)

        # 3. Budget availability
        if self.budget.balance < construction_cost:
            return {
                "valid": False,
                "reason": "Insufficient budget",
                "required": round(construction_cost, 2),
                "available": round(self.budget.balance, 2)
            }

        # 4. River Crossing Validation (River runs roughly from x=4900 to x=5100, z=5500 to 7500)
        def _crosses_river(x1: float, z1: float, x2: float, z2: float) -> bool:
            rx1, rx2 = 4900.0, 5100.0
            rz1, rz2 = 5500.0, 7500.0
            if (rx1 <= x1 <= rx2 and rz1 <= z1 <= rz2) or (rx1 <= x2 <= rx2 and rz1 <= z2 <= rz2):
                return True
            min_x, max_x = min(x1, x2), max(x1, x2)
            min_z, max_z = min(z1, z2), max(z1, z2)
            if min_x <= rx1 and max_x >= rx2 and not (max_z < rz1 or min_z > rz2):
                return True
            return False

        is_river_zone = _crosses_river(x, z, end_x if end_x is not None else x, end_z if end_z is not None else z)
        if is_river_zone and item_type in ["road", "highway"] and item_type != "bridge":
            return {
                "valid": False,
                "reason": "Cannot build standard road across the river; use BRIDGE tool",
                "required": round(construction_cost, 2),
                "available": round(self.budget.balance, 2)
            }

        # 5. Service area & population served estimate
        service_radius = profile.get("service_radius", 600.0)
        district = self.world.get_district_at(x, z)
        district_id = district.id if district else "default"

        # Estimate population served based on density within radius
        pop_served = 0
        if district:
            area_served_ratio = min(1.0, (math.pi * (service_radius ** 2)) / district.area)
            pop_served = int(district.population * area_served_ratio)

        # 6. Expected impact simulation preview
        expected_impact = {
            "population_served": pop_served,
            "construction_cost": round(construction_cost, 2),
            "monthly_maintenance": round(monthly_maint, 2),
            "estimated_travel_time_delta_pct": -4.5 if item_type in ["metro_station", "highway", "bridge"] else -1.5,
            "estimated_traffic_congestion_delta_pct": -3.2 if item_type in ["metro_station", "highway", "bus_stop"] else 0.5,
            "estimated_ridership_delta": int(pop_served * 0.12) if item_type in ["metro_station", "bus_stop"] else 0,
        }

        return {
            "valid": True,
            "reason": "Valid placement location",
            "construction_cost": round(construction_cost, 2),
            "monthly_maintenance": round(monthly_maint, 2),
            "population_served": pop_served,
            "service_radius": service_radius,
            "district_id": district_id,
            "expected_impact": expected_impact,
        }

    def construct(
        self,
        item_type: str,
        x: float,
        z: float,
        name: str = "",
        end_x: Optional[float] = None,
        end_z: Optional[float] = None,
        subtype: Optional[str] = None
    ) -> Dict[str, Any]:
        """Construct infrastructure item after validation."""
        val = self.validate_placement(item_type, x, z, end_x, end_z, subtype)
        if not val["valid"]:
            return val

        cost = val["construction_cost"]
        maint = val["monthly_maintenance"]
        s_radius = val["service_radius"]
        district_id = val["district_id"]

        # Deduct cost from budget
        desc = f"Built {item_type.replace('_', ' ').title()}"
        if name:
            desc += f" ({name})"
        self.budget.deduct_construction(cost, desc, category="construction")

        # Create infrastructure item
        item_id = f"inf_{uuid.uuid4().hex[:8]}"
        item_name = name or f"{item_type.replace('_', ' ').title()} #{len(self.items) + 1}"
        item = InfrastructureItem(
            id=item_id,
            item_type=item_type,
            subtype=subtype or item_type,
            name=item_name,
            district_id=district_id,
            x=x,
            z=z,
            end_x=end_x,
            end_z=end_z,
            construction_cost=cost,
            monthly_maintenance=maint,
            service_radius=s_radius,
            capacity=INFRASTRUCTURE_PROFILES.get(item_type, {}).get("capacity", 200),
        )
        self.items[item_id] = item
        self.world.infrastructure[item_id] = item.to_dict()

        # Update specific simulation networks
        self._integrate_network(item)

        # Dispatch spatial event
        event_name = f"{item_type.upper()}_OPENED"
        self.event_dispatcher.publish(
            event_name,
            item_id=item_id,
            item_type=item_type,
            x=x,
            z=z,
            radius=s_radius,
            metadata={"name": item_name, "cost": cost}
        )

        # Trigger spatial re-evaluation for nearby citizens & businesses
        self._notify_affected_agents(item)

        return {
            "valid": True,
            "item": item.to_dict(),
            "remaining_balance": self.budget.balance,
            "expected_impact": val["expected_impact"],
        }

    def _integrate_network(self, item: InfrastructureItem) -> None:
        """Connect infrastructure into RoadGraph, BusSystem, or MetroRailwaySystem."""
        # 1. Linear Roads, Highways, Bridges
        if item.end_x is not None and item.end_z is not None:
            sx, sz = item.x, item.z
            ex, ez = item.end_x, item.end_z
            n1 = f"n_{int(sx)}_{int(sz)}"
            n2 = f"n_{int(ex)}_{int(ez)}"

            if hasattr(self.world, "road_graph") and self.world.road_graph:
                rg = self.world.road_graph
                if n1 not in rg.graph:
                    rg.add_node(n1, sx, sz, item.item_type)
                if n2 not in rg.graph:
                    rg.add_node(n2, ex, ez, item.item_type)

                length = math.sqrt((ex - sx) ** 2 + (ez - sz) ** 2)
                lanes = 4 if item.item_type in ["highway", "bridge", "arterial"] else 2
                speed = 110 if item.item_type == "highway" else (70 if item.item_type == "arterial" else 50)
                capacity = lanes * 600

                rg.add_edge(n1, n2, item.item_type, lanes, speed, length, capacity)
                rg.add_edge(n2, n1, item.item_type, lanes, speed, length, capacity)
                item.connected_network_ids = [n1, n2]

            if hasattr(self.world, "pedestrian_graph") and self.world.pedestrian_graph:
                self.world.pedestrian_graph.add_node(f"ped_{int(sx)}_{int(sz)}", sx, sz)
                self.world.pedestrian_graph.add_node(f"ped_{int(ex)}_{int(ez)}", ex, ez)
                self.world.pedestrian_graph.add_edge(f"ped_{int(sx)}_{int(sz)}", f"ped_{int(ex)}_{int(ez)}")

        # 2. Metro Stations
        elif item.item_type == "metro_station":
            if hasattr(self.world, "metro_system") and self.world.metro_system:
                self.world.metro_system.register_station(item.id)

        # 3. Bus Stops
        elif item.item_type == "bus_stop":
            if hasattr(self.world, "bus_system") and self.world.bus_system:
                bs = self.world.bus_system
                # Add to nearest route
                nearest_route_id = "R1"
                if bs.routes:
                    nearest_route_id = list(bs.routes.keys())[0]
                from app.simulation.transport.bus_system import BusStop
                stop = BusStop(id=item.id, name=item.name, x=item.x, z=item.z, route_id=nearest_route_id)
                bs.stops[item.id] = stop
                if nearest_route_id in bs.routes:
                    bs.routes[nearest_route_id]["stops"].append(item.id)
                    bs.routes[nearest_route_id]["waypoints"].append((item.x, item.z))

    def _notify_affected_agents(self, item: InfrastructureItem) -> None:
        """Notify citizens and businesses within service radius to adapt."""
        if not hasattr(self.world, "citizens"):
            return

        r_sq = item.service_radius ** 2
        for cit in self.world.citizens.values():
            dist_sq = (cit.current_x - item.x) ** 2 + (cit.current_z - item.z) ** 2
            if dist_sq <= r_sq:
                # If new metro station or bus stop, re-evaluate transport
                if item.item_type in ["metro_station", "bus_stop"]:
                    if cit.travel_mode in ["car", "walk"]:
                        # Switch to newly available transit
                        cit.travel_mode = "metro" if item.item_type == "metro_station" else "bus"
                        cit.decision_reason = f"Switched to {item.item_type.replace('_', ' ')}: rapid access near {item.name}"
                        cit.update_satisfaction(0.08)

                # If new service building (hospital, school, park)
                elif item.item_type in ["hospital", "school", "park", "police", "fire"]:
                    cit.update_satisfaction(0.05)

        # Notify businesses
        if hasattr(self.world, "business_manager"):
            for biz in self.world.business_manager.businesses.values():
                b_dist_sq = (biz.x - item.x) ** 2 + (biz.z - item.z) ** 2
                if b_dist_sq <= r_sq:
                    # Transit/service accessibility boosts business customer footfall & capacity
                    biz.capacity = int(biz.capacity * 1.15)

    def upgrade(self, item_id: str) -> Dict[str, Any]:
        """Upgrade existing infrastructure object."""
        item = self.items.get(item_id)
        if not item:
            return {"success": False, "reason": "Infrastructure item not found"}

        upgrade_cost = item.construction_cost * 0.5
        if self.budget.balance < upgrade_cost:
            return {"success": False, "reason": "Insufficient budget for upgrade", "required": upgrade_cost}

        self.budget.deduct_construction(upgrade_cost, f"Upgraded {item.name}", category="upgrade")
        item.upgrade_level += 1
        item.capacity = int(item.capacity * 1.5)
        item.condition = 1.0
        item.monthly_maintenance *= 1.25

        self.event_dispatcher.publish(
            "INFRASTRUCTURE_UPGRADED",
            item_id=item.id,
            item_type=item.item_type,
            x=item.x,
            z=item.z,
            radius=item.service_radius,
            metadata={"upgrade_level": item.upgrade_level}
        )
        return {"success": True, "item": item.to_dict(), "remaining_balance": self.budget.balance}

    def demolish(self, item_id: str, charge_cost: bool = True) -> Dict[str, Any]:
        """Demolish an infrastructure item, refunding a fraction and cleaning up networks."""
        item = self.items.get(item_id)
        if not item:
            return {"success": False, "reason": "Infrastructure item not found"}

        if charge_cost:
            demolish_cost = item.construction_cost * 0.15
            if self.budget.balance < demolish_cost:
                return {"success": False, "reason": "Insufficient budget for demolition cost", "required": demolish_cost}
            self.budget.deduct_construction(demolish_cost, f"Demolished {item.name}", category="demolition")

        # Network teardown
        if item.item_type in ["road", "highway", "bridge"] and item.connected_network_ids:
            if hasattr(self.world, "road_graph") and self.world.road_graph:
                rg = self.world.road_graph
                if len(item.connected_network_ids) >= 2:
                    n1, n2 = item.connected_network_ids[0], item.connected_network_ids[1]
                    rg.remove_edge(n1, n2)
                    rg.remove_edge(n2, n1)

        elif item.item_type == "bus_stop":
            if hasattr(self.world, "bus_system"):
                if item.id in self.world.bus_system.stops:
                    del self.world.bus_system.stops[item.id]

        del self.items[item_id]
        if item_id in self.world.infrastructure:
            del self.world.infrastructure[item_id]

        self.event_dispatcher.publish(
            f"{item.item_type.upper()}_CLOSED",
            item_id=item.id,
            item_type=item.item_type,
            x=item.x,
            z=item.z,
            radius=item.service_radius,
            metadata={"demolished": True}
        )
        return {"success": True, "item_id": item_id, "remaining_balance": self.budget.balance}

    def to_list(self) -> List[dict]:
        return [it.to_dict() for it in self.items.values()]
