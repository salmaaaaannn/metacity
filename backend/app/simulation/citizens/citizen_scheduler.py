"""
METACITY — Citizen Daily Scheduler & Activity Engine
Orchestrates realistic 24-hour schedules per occupation and age group,
triggers state machine transitions, selects destinations, and initiates routing.
"""
from typing import Dict, List, Tuple, Optional, Any
import math
from app.simulation.citizens.citizen import Citizen
from app.simulation.citizens.state_machine import CitizenState
from app.simulation.citizens.transport_chooser import TransportChooser


class CitizenScheduler:
    DAILY_SCHEDULES = {
        "child": [
            (0.0, 7.0, "sleeping", CitizenState.SLEEPING, "home"),
            (7.0, 7.75, "preparing", CitizenState.PREPARING, "home"),
            (7.75, 8.25, "commuting", CitizenState.COMMUTING, "school"),
            (8.25, 12.0, "studying", CitizenState.STUDYING, "school"),
            (12.0, 13.0, "eating", CitizenState.EATING, "school"),
            (13.0, 15.25, "studying", CitizenState.STUDYING, "school"),
            (15.25, 17.5, "in_park", CitizenState.IN_PARK, "park"),
            (17.5, 18.25, "commuting", CitizenState.RETURNING_HOME, "home"),
            (18.25, 21.0, "home", CitizenState.AT_HOME, "home"),
            (21.0, 24.0, "sleeping", CitizenState.SLEEPING, "home"),
        ],
        "student": [
            (0.0, 7.25, "sleeping", CitizenState.SLEEPING, "home"),
            (7.25, 8.0, "preparing", CitizenState.PREPARING, "home"),
            (8.0, 8.75, "commuting", CitizenState.COMMUTING, "school"),
            (8.75, 12.25, "studying", CitizenState.STUDYING, "school"),
            (12.25, 13.25, "eating", CitizenState.EATING, "restaurant"),
            (13.25, 16.5, "studying", CitizenState.STUDYING, "school"),
            (16.5, 19.0, "leisure", CitizenState.IN_PARK, "park"),
            (19.0, 19.75, "commuting", CitizenState.RETURNING_HOME, "home"),
            (19.75, 23.0, "home", CitizenState.AT_HOME, "home"),
            (23.0, 24.0, "sleeping", CitizenState.SLEEPING, "home"),
        ],
        "professional": [
            (0.0, 6.5, "sleeping", CitizenState.SLEEPING, "home"),
            (6.5, 7.25, "preparing", CitizenState.PREPARING, "home"),
            (7.25, 8.25, "commuting", CitizenState.COMMUTING, "work"),
            (8.25, 12.5, "working", CitizenState.WORKING, "work"),
            (12.5, 13.5, "eating", CitizenState.EATING, "restaurant"),
            (13.5, 17.75, "working", CitizenState.WORKING, "work"),
            (17.75, 19.0, "shopping", CitizenState.SHOPPING, "shop"),
            (19.0, 19.75, "commuting", CitizenState.RETURNING_HOME, "home"),
            (19.75, 23.0, "relaxing", CitizenState.RELAXING, "home"),
            (23.0, 24.0, "sleeping", CitizenState.SLEEPING, "home"),
        ],
        "office_worker": [
            (0.0, 6.75, "sleeping", CitizenState.SLEEPING, "home"),
            (6.75, 7.5, "preparing", CitizenState.PREPARING, "home"),
            (7.5, 8.5, "commuting", CitizenState.COMMUTING, "work"),
            (8.5, 12.25, "working", CitizenState.WORKING, "work"),
            (12.25, 13.25, "eating", CitizenState.EATING, "restaurant"),
            (13.25, 17.5, "working", CitizenState.WORKING, "work"),
            (17.5, 18.75, "shopping", CitizenState.SHOPPING, "shop"),
            (18.75, 19.5, "commuting", CitizenState.RETURNING_HOME, "home"),
            (19.5, 22.5, "home", CitizenState.AT_HOME, "home"),
            (22.5, 24.0, "sleeping", CitizenState.SLEEPING, "home"),
        ],
        "industrial_worker": [
            (0.0, 5.5, "sleeping", CitizenState.SLEEPING, "home"),
            (5.5, 6.25, "preparing", CitizenState.PREPARING, "home"),
            (6.25, 7.0, "commuting", CitizenState.COMMUTING, "work"),
            (7.0, 11.5, "working", CitizenState.WORKING, "work"),
            (11.5, 12.5, "eating", CitizenState.EATING, "work"),
            (12.5, 15.5, "working", CitizenState.WORKING, "work"),
            (15.5, 16.25, "commuting", CitizenState.RETURNING_HOME, "home"),
            (16.25, 18.5, "leisure", CitizenState.IN_PARK, "park"),
            (18.5, 21.5, "home", CitizenState.AT_HOME, "home"),
            (21.5, 24.0, "sleeping", CitizenState.SLEEPING, "home"),
        ],
        "service_worker": [
            (0.0, 8.5, "sleeping", CitizenState.SLEEPING, "home"),
            (8.5, 9.25, "preparing", CitizenState.PREPARING, "home"),
            (9.25, 10.0, "commuting", CitizenState.COMMUTING, "work"),
            (10.0, 14.5, "working", CitizenState.WORKING, "work"),
            (14.5, 15.5, "eating", CitizenState.EATING, "restaurant"),
            (15.5, 20.0, "working", CitizenState.WORKING, "work"),
            (20.0, 20.75, "commuting", CitizenState.RETURNING_HOME, "home"),
            (20.75, 24.0, "home", CitizenState.AT_HOME, "home"),
        ],
        "business_owner": [
            (0.0, 6.5, "sleeping", CitizenState.SLEEPING, "home"),
            (6.5, 7.25, "preparing", CitizenState.PREPARING, "home"),
            (7.25, 8.0, "commuting", CitizenState.COMMUTING, "work"),
            (8.0, 13.0, "working", CitizenState.WORKING, "work"),
            (13.0, 14.25, "eating", CitizenState.EATING, "restaurant"),
            (14.25, 18.5, "working", CitizenState.WORKING, "work"),
            (18.5, 20.5, "talking", CitizenState.TALKING, "restaurant"),
            (20.5, 21.25, "commuting", CitizenState.RETURNING_HOME, "home"),
            (21.25, 23.5, "home", CitizenState.AT_HOME, "home"),
            (23.5, 24.0, "sleeping", CitizenState.SLEEPING, "home"),
        ],
        "retired": [
            (0.0, 7.0, "sleeping", CitizenState.SLEEPING, "home"),
            (7.0, 8.5, "home", CitizenState.AT_HOME, "home"),
            (8.5, 10.5, "in_park", CitizenState.IN_PARK, "park"),
            (10.5, 12.0, "shopping", CitizenState.SHOPPING, "shop"),
            (12.0, 14.0, "eating", CitizenState.EATING, "home"),
            (14.0, 17.0, "relaxing", CitizenState.RELAXING, "home"),
            (17.0, 19.0, "talking", CitizenState.TALKING, "park"),
            (19.0, 22.0, "home", CitizenState.AT_HOME, "home"),
            (22.0, 24.0, "sleeping", CitizenState.SLEEPING, "home"),
        ],
    }

    def __init__(self):
        self.transport_chooser = TransportChooser()

    def get_scheduled_activity(self, citizen: Citizen, sim_hour: float) -> Tuple[str, CitizenState, str]:
        schedule = self.DAILY_SCHEDULES.get(citizen.occupation, self.DAILY_SCHEDULES["office_worker"])
        for start, end, activity, state, dest_type in schedule:
            if start <= sim_hour < end:
                return activity, state, dest_type
        return "sleeping", CitizenState.SLEEPING, "home"

    def update_citizen(self, citizen: Citizen, sim_hour: float, world: Any) -> None:
        """Check schedule, update state, and calculate destination and route if transitioning."""
        activity, target_state, dest_type = self.get_scheduled_activity(citizen, sim_hour)

        # Only transition when scheduled activity changes
        if citizen.current_activity != activity:
            citizen.current_activity = activity

            # Determine destination coordinates
            dest_coords = self._resolve_destination(citizen, dest_type, world)
            if not dest_coords:
                return

            dest_x, dest_z = dest_coords

            # Choose transport mode if departing
            if dest_type in ["work", "school", "home", "shop", "park", "restaurant"]:
                chosen_mode, rationale, details = self.transport_chooser.choose_mode(
                    citizen, citizen.current_x, citizen.current_z, dest_x, dest_z, world
                )
                citizen.travel_mode = chosen_mode
                citizen.decision_reason = rationale

                # Set up state based on transport mode
                if chosen_mode == "car":
                    citizen.transition_to(CitizenState.DRIVING, rationale)
                    # Vehicle trip will be handled by road graph path
                    path = [(dest_x, dest_z)]
                    if hasattr(world, "road_graph"):
                        road_path = world.road_graph.find_path(citizen.current_x, citizen.current_z, dest_x, dest_z)
                        if road_path:
                            path = road_path
                    citizen.set_route(path, dest_type, dest_x, dest_z)

                elif chosen_mode == "bus":
                    # Find nearest bus stop
                    if hasattr(world, "bus_system"):
                        stop = world.bus_system.find_nearest_stop(citizen.current_x, citizen.current_z)
                        if stop:
                            stop.add_waiting(citizen.id)
                            citizen.transit_stop_id = stop.id
                            citizen.transition_to(CitizenState.WAITING_FOR_BUS, f"Waiting at {stop.name}")
                            citizen.set_route([(stop.x, stop.z)], "bus_stop", stop.x, stop.z)
                        else:
                            citizen.transition_to(CitizenState.WALKING, "No bus stop near; walking")
                            citizen.set_route([(dest_x, dest_z)], dest_type, dest_x, dest_z)
                    else:
                        citizen.transition_to(CitizenState.WALKING, "Walking to destination")
                        citizen.set_route([(dest_x, dest_z)], dest_type, dest_x, dest_z)

                elif chosen_mode in ["metro", "railway"]:
                    # Metro station queue
                    citizen.transition_to(CitizenState.WAITING_FOR_METRO, f"Using {chosen_mode} transit")
                    citizen.set_route([(dest_x, dest_z)], dest_type, dest_x, dest_z)

                else:  # 'walk'
                    citizen.transition_to(CitizenState.WALKING, rationale)
                    path = [(dest_x, dest_z)]
                    if hasattr(world, "pedestrian_graph") and world.pedestrian_graph:
                        ped_path = world.pedestrian_graph.find_path(citizen.current_x, citizen.current_z, dest_x, dest_z)
                        if ped_path:
                            path = ped_path
                    citizen.set_route(path, dest_type, dest_x, dest_z)
            else:
                citizen.transition_to(target_state, f"Engaged in {activity}")

    def _resolve_destination(self, citizen: Citizen, dest_type: str, world: Any) -> Optional[Tuple[float, float]]:
        if dest_type == "home":
            return citizen.home_x, citizen.home_z
        elif dest_type == "work":
            if citizen.work_x is not None:
                return citizen.work_x, citizen.work_z
            return citizen.home_x + 200, citizen.home_z + 200
        elif dest_type == "school":
            if citizen.school_x is not None:
                return citizen.school_x, citizen.school_z
            return citizen.home_x + 150, citizen.home_z + 150
        elif dest_type in ["restaurant", "shop"]:
            # Find nearest commercial business from world
            if hasattr(world, "business_manager"):
                biz = world.business_manager.find_nearest_amenity(citizen.current_x, citizen.current_z, dest_type)
                if biz:
                    biz.add_customer(citizen.id)
                    return biz.x, biz.z
            return citizen.home_x + 120, citizen.home_z + 120
        elif dest_type == "park":
            # Nearby park offset
            return citizen.home_x + 80, citizen.home_z + 80
        return citizen.home_x, citizen.home_z
