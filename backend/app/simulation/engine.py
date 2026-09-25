"""
METACITY — Core Simulation Engine (Phase 3)
Drives the autonomous AI city: clock advancement, citizen schedule updates,
state machine transitions, pedestrian/car movement, active transit fleets,
authoritative infrastructure editing, spatial event dispatching, scenario branching,
and WebSocket delta broadcasts.
"""
import asyncio
import time
import math
from typing import Dict, List, Callable, Optional, Any
from app.config.settings import Settings
from app.simulation.world.world import World
from app.simulation.clock.sim_clock import SimClock
from app.simulation.economy.budget import CityBudget
from app.simulation.citizens.citizen import Citizen
from app.simulation.citizens.state_machine import CitizenState
from app.simulation.citizens.citizen_scheduler import CitizenScheduler
from app.simulation.vehicles.vehicle import Vehicle
from app.simulation.districts.city_generator import generate_city
from app.simulation.districts.baseline_city import generate_baseline
from app.simulation.districts.district_metrics import calculate_district_metrics
from app.simulation.infrastructure.event_dispatcher import EventDispatcher
from app.simulation.infrastructure.infrastructure_manager import InfrastructureManager
from app.simulation.scenarios.scenario_manager import ScenarioManager
from app.simulation.environment.environment_engine import EnvironmentEngine
from app.simulation.disasters.disaster_manager import DisasterManager
from app.ai.analytics.city_analytics import CityAnalyticsEngine
from app.ai.prediction.forecasting import CityForecastingEngine
from app.ai.scenarios.what_if_engine import WhatIfEngine
from app.ai.planner.ai_planner import AIPlanner


class SimulationEngine:
    def __init__(self, settings: Settings):
        self.settings = settings
        self.world = World(
            city_size=settings.SIMULATION_CITY_SIZE,
            seed=settings.SIMULATION_SEED
        )
        self.clock = SimClock(seed=settings.SIMULATION_SEED)
        self.budget = CityBudget()
        self.citizens: Dict[str, Citizen] = {}
        self.vehicles: Dict[str, Vehicle] = {}
        self.is_running = False
        self.tick_callbacks: List[Callable] = []
        self.citizen_scheduler = CitizenScheduler()

        # Infrastructure & Scenarios
        self.event_dispatcher = EventDispatcher()
        self.infrastructure_manager = InfrastructureManager(self.world, self.budget, self.event_dispatcher)
        self.world.infrastructure_manager = self.infrastructure_manager
        self.scenario_manager = ScenarioManager(self)

        # Phase 4: Environment & Disasters
        self.environment_engine = EnvironmentEngine(seed=settings.SIMULATION_SEED)
        self.disaster_manager = DisasterManager(self.world, self.budget)

        # Phase 5: AI Analytics, Forecasting, What-If & Planner
        self.analytics_engine = CityAnalyticsEngine()
        self.forecasting_engine = CityForecastingEngine()
        self.what_if_engine = WhatIfEngine(self)
        self.ai_planner = AIPlanner(self.what_if_engine)

        # Cached city structures
        self._buildings: List[dict] = []
        self._roads: List[dict] = []
        self._transit_lines: List[dict] = []
        self._transit_stations: List[dict] = []
        self._infrastructure: List[dict] = []

        self._initialize_world()
        self.scenario_manager.capture_baseline()

    def _initialize_world(self):
        city = generate_city(
            self.settings.SIMULATION_SEED,
            self.settings.SIMULATION_ACTIVE_CITIZENS
        )

        for dist in city.districts:
            self.world.districts[dist.id] = dist

        self.world.chunks = city.chunks
        self._buildings = city.buildings
        self.world.road_graph = city.road_graph
        self.world.pedestrian_graph = city.pedestrian_graph
        self.world.households = city.households

        # Initialize businesses
        self.world.business_manager.initialize_from_buildings(self._buildings, self.settings.SIMULATION_SEED)

        # Assign workplace jobs to workers and service personnel
        for c in city.citizens:
            if c.occupation in ["office_worker", "professional", "industrial_worker", "service_worker", "business_owner"]:
                biz = self.world.business_manager.find_workplace_for_citizen(c.occupation, c.district_id)
                if biz:
                    biz.add_employee(c.id)
                    c.workplace_building_id = biz.building_id
                    c.work_x = biz.x
                    c.work_z = biz.z

            self.citizens[c.id] = c
            self.world.citizens[c.id] = c

        # Baseline infrastructure (highways, bridges, metro lines, railway)
        baseline = generate_baseline()
        self._roads = baseline.roads
        self._transit_lines = baseline.transit_lines
        self._transit_stations = baseline.transit_stations
        self._infrastructure = baseline.infrastructure

        # Register baseline infrastructure into world
        for infra in self._infrastructure:
            self.world.infrastructure[infra["id"]] = infra

        # Register stations with metro/railway system
        for st in self._transit_stations:
            self.world.metro_system.register_station(st["id"])

        # Add highway and arterial edges into road graph
        for road in self._roads:
            sx, sz = road["start_x"], road["start_z"]
            ex, ez = road["end_x"], road["end_z"]
            n1 = f"n_{int(sx)}_{int(sz)}"
            n2 = f"n_{int(ex)}_{int(ez)}"
            if n1 not in self.world.road_graph.graph:
                self.world.road_graph.add_node(n1, sx, sz, road.get("road_type", "road"))
            if n2 not in self.world.road_graph.graph:
                self.world.road_graph.add_node(n2, ex, ez, road.get("road_type", "road"))
            length = math.sqrt((ex - sx) ** 2 + (ez - sz) ** 2)
            lanes = road.get("lanes", 2)
            speed_limit = road.get("speed_limit", 60)
            self.world.road_graph.add_edge(n1, n2, road.get("road_type", "arterial"), lanes, speed_limit, length, lanes * 600)
            self.world.road_graph.add_edge(n2, n1, road.get("road_type", "arterial"), lanes, speed_limit, length, lanes * 600)

        # Budget calculation — assign returned values so to_dict() is populated from startup
        self.budget.income = self.budget.calculate_income(self.world)
        self.budget.expenses = self.budget.calculate_expenses(self.world)
        self.budget.net_monthly = self.budget.income.total - self.budget.expenses.total

    async def start(self) -> None:
        self.is_running = True
        asyncio.create_task(self._loop())

    async def stop(self) -> None:
        self.is_running = False

    async def _loop(self):
        tick_interval = 1.0 / self.settings.SIMULATION_TICK_RATE
        while self.is_running:
            start_time = time.time()
            await self.tick()
            elapsed = time.time() - start_time
            sleep_time = max(0, tick_interval - elapsed)
            await asyncio.sleep(sleep_time)

    async def tick(self) -> None:
        if self.clock.paused:
            return

        real_seconds_per_tick = 1.0 / self.settings.SIMULATION_TICK_RATE
        self.clock.advance(real_seconds_per_tick)
        sim_multiplier = self.clock.speed * real_seconds_per_tick

        # 1. Update citizen schedules and activity goals
        for citizen in self.citizens.values():
            self.citizen_scheduler.update_citizen(citizen, self.clock.sim_hour, self.world)

        # 2. Advance pedestrian & driving citizen movement
        for citizen in self.citizens.values():
            if citizen.current_state == CitizenState.WALKING:
                step_dist = citizen.walking_speed * sim_multiplier * 2.5
                arrived = citizen.move_step(step_dist)
                if arrived:
                    if citizen.destination_type == "work":
                        citizen.transition_to(CitizenState.WORKING, "Arrived at workplace")
                    elif citizen.destination_type == "school":
                        citizen.transition_to(CitizenState.STUDYING, "Arrived at school")
                    elif citizen.destination_type == "home":
                        citizen.transition_to(CitizenState.AT_HOME, "Arrived back home")
                    elif citizen.destination_type in ["shop", "restaurant"]:
                        citizen.transition_to(CitizenState.SHOPPING, "Browsing inside store")
                    elif citizen.destination_type == "park":
                        citizen.transition_to(CitizenState.IN_PARK, "Enjoying park greenery")

            elif citizen.current_state == CitizenState.DRIVING:
                car_speed = 18.0 * sim_multiplier
                arrived = citizen.move_step(car_speed)

                car_id = f"car_{citizen.id}"
                self.vehicles[car_id] = Vehicle(
                    id=car_id,
                    vehicle_type="car",
                    current_x=citizen.current_x,
                    current_z=citizen.current_z,
                    destination_x=citizen.destination_x or citizen.current_x,
                    destination_z=citizen.destination_z or citizen.current_z,
                    speed=18.0,
                    path=[],
                    path_index=0,
                    passenger_count=1,
                    capacity=4,
                    route_id=None,
                    heading=citizen.facing_angle
                )

                if arrived:
                    if car_id in self.vehicles:
                        del self.vehicles[car_id]
                    if citizen.destination_type == "work":
                        citizen.transition_to(CitizenState.WORKING, "Parked car; entered office")
                    elif citizen.destination_type == "home":
                        citizen.transition_to(CitizenState.AT_HOME, "Parked car at home")
                    else:
                        citizen.transition_to(CitizenState.AT_HOME, "Trip complete")

        # 3. Update active bus fleet and passenger boarding/alighting
        self.world.bus_system.update(sim_multiplier, self.citizens)

        # 4. Update Metro & Railway passenger simulation
        self.world.metro_system.update(sim_multiplier, self._transit_stations, self.citizens)

        # 5. Clean up completed car entities
        driving_ids = {f"car_{c.id}" for c in self.citizens.values() if c.current_state == CitizenState.DRIVING}
        for vid in list(self.vehicles.keys()):
            if vid.startswith("car_") and vid not in driving_ids:
                del self.vehicles[vid]

        # 6. Environment & Disasters Simulation (Phase 4)
        elapsed_hours = (sim_multiplier) / 3600.0
        self.environment_engine.update(self.clock.sim_hour, self.clock.sim_month, elapsed_hours, self.world)
        self.disaster_manager.update(sim_multiplier, self.environment_engine.state)

        # 7. Record Analytics Snapshots periodically (Phase 5)
        if self.clock.tick % 5 == 0:
            self.analytics_engine.record_snapshot(self)

        # 8. Monthly budget update
        if (self.clock.sim_day == 1
                and 0 <= self.clock.sim_hour < (1.0 / self.settings.SIMULATION_TICK_RATE / 3600)):
            self.budget.apply_monthly_tick(self.world)

        # 9. Broadcast delta update to WebSocket subscribers
        delta = self.get_delta()
        for cb in list(self.tick_callbacks):
            try:
                await cb(delta)
            except Exception:
                pass

    def get_state_snapshot(self) -> dict:
        """Full city snapshot for initial frontend mount."""
        total_pop = sum(d.population for d in self.world.districts.values())

        all_vehicles = [v.to_position_dict() for v in self.vehicles.values()]
        all_vehicles.extend(self.world.bus_system.get_positions())

        # Combine baseline infrastructure + user constructed items
        all_infra = list(self.world.infrastructure.values())

        env_dict = self.environment_engine.to_dict()
        disaster_hud = self.disaster_manager.get_hud_metrics()
        resilience = self.disaster_manager.get_resilience(self.environment_engine.state)

        return {
            "city_id": "default",
            "city_name": "METACITY",
            "population": total_pop,
            "active_citizens_count": len(self.citizens),
            "satisfaction": self._calc_city_satisfaction(),
            "sim_time": self.clock.get_time_string(),
            "sim_day": self.clock.sim_day,
            "sim_hour": round(self.clock.sim_hour, 2),
            "season": self.environment_engine.state.season.value,
            "weather": self.environment_engine.state.weather_condition.value,
            "environment": env_dict,
            "disasters": disaster_hud,
            "resilience": resilience,
            "budget": self.budget.to_dict(),
            "districts": [d.to_dict() for d in self.world.districts.values()],
            "buildings": self._buildings,
            "roads": self._roads,
            "transit_lines": self._transit_lines,
            "transit_stations": self._transit_stations,
            "infrastructure": all_infra,
            "citizens": [c.to_position_dict() for c in self.citizens.values()],
            "vehicles": all_vehicles,
            "transit_metrics": self.world.metro_system.get_metrics(),
        }

    def get_delta(self) -> dict:
        """Lightweight delta update streamed via WebSocket."""
        all_vehicles = [v.to_position_dict() for v in self.vehicles.values()]
        all_vehicles.extend(self.world.bus_system.get_positions())

        all_incidents = [i.to_dict() for i in self.disaster_manager.incidents.values()]
        active_incidents = [i for i in all_incidents if i.get("status") == "ACTIVE"]

        return {
            "type": "delta",
            "tick": self.clock.tick,
            "sim_time": self.clock.get_time_string(),
            "sim_hour": round(self.clock.sim_hour, 2),
            "season": self.environment_engine.state.season.value,
            "weather": self.environment_engine.state.weather_condition.value,
            "environment": self.environment_engine.to_dict(),
            "active_disasters_count": len(active_incidents),
            "disasters": {
                "active_incidents_count": len(active_incidents),
                "incidents": all_incidents,
                "affected_population": sum(
                    i.get("evacuated_citizens", 0) for i in all_incidents
                ),
                "affected_buildings_count": sum(
                    len(i.get("affected_building_ids", [])) for i in all_incidents
                ),
                "closed_roads_count": len(self.disaster_manager.flood_sim.closed_roads),
                "closed_roads": list(self.disaster_manager.flood_sim.closed_roads),
                "evacuated_citizens": len(self.disaster_manager.evacuation_mgr.evacuated_citizen_ids),
                "emergency_vehicles_active": len(self.disaster_manager.emergency_mgr.active_units),
                "emergency_units": self.disaster_manager.emergency_mgr.get_active_units(),
                "total_estimated_damage": round(
                    sum(i.get("damage_cost", 0) for i in all_incidents), 2
                ),
                "shelters": self.disaster_manager.evacuation_mgr.get_shelters_list(),
            },
            "closed_roads": list(self.disaster_manager.flood_sim.closed_roads),
            "emergency_units": self.disaster_manager.emergency_mgr.get_active_units(),
            "population": sum(d.population for d in self.world.districts.values()),
            "satisfaction": self._calc_city_satisfaction(),
            "budget": self.budget.to_dict(),
            "citizens": [c.to_position_dict() for c in self.citizens.values()],
            "vehicles": all_vehicles,
            "infrastructure_count": len(self.world.infrastructure),
        }


    def get_district_details(self, district_id: str) -> Optional[dict]:
        dist = self.world.districts.get(district_id)
        if not dist:
            return None
        return calculate_district_metrics(
            district_id,
            dist,
            list(self.citizens.values()),
            list(self.world.business_manager.businesses.values()),
            self.world.road_graph
        )

    def _calc_city_satisfaction(self) -> float:
        if not self.citizens:
            return 0.8
        scores = [c.satisfaction for c in self.citizens.values()]
        return round(sum(scores) / len(scores), 2)

    def set_speed(self, speed: float) -> None:
        self.clock.speed = speed
        self.clock.paused = (speed == 0)

    def pause(self) -> None:
        self.clock.paused = True

    def resume(self) -> None:
        self.clock.paused = False

    def add_tick_callback(self, cb: Callable) -> None:
        self.tick_callbacks.append(cb)

    def remove_tick_callback(self, cb: Callable) -> None:
        if cb in self.tick_callbacks:
            self.tick_callbacks.remove(cb)
