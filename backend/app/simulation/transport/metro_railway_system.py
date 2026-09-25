"""
METACITY — Metro & Railway Passenger Simulation
Tracks station passenger volumes, train passage, boarding, and ridership revenue.
"""
from dataclasses import dataclass, field
from typing import Dict, List, Tuple, Optional, Any
import math


@dataclass
class TransitPassenger:
    citizen_id: str
    origin_station_id: str
    destination_station_id: str
    board_sim_time: float


class MetroRailwaySystem:
    def __init__(self):
        # station_id -> list of waiting citizen_ids
        self.station_queues: Dict[str, List[str]] = {}
        # active riders: citizen_id -> destination_station_id
        self.active_riders: Dict[str, str] = {}
        self.total_metro_ridership: int = 0
        self.total_railway_ridership: int = 0

    def register_station(self, station_id: str):
        if station_id not in self.station_queues:
            self.station_queues[station_id] = []

    def citizen_enter_station(self, citizen_id: str, origin_station_id: str, dest_station_id: str) -> None:
        self.register_station(origin_station_id)
        if citizen_id not in self.station_queues[origin_station_id]:
            self.station_queues[origin_station_id].append(citizen_id)
            self.active_riders[citizen_id] = dest_station_id

    def update(self, delta_seconds: float, stations_data: List[dict], citizens_map: Dict[str, Any]) -> None:
        """
        Simulates train arrivals at stations every interval,
        transporting passengers to their target station.
        """
        station_coords = {s["id"]: (s["x"], s["z"]) for s in stations_data}

        # For every station, if queue has passengers, board them into next train run
        for st_id, queue in list(self.station_queues.items()):
            if not queue:
                continue

            # Every cycle, move a batch of waiting passengers toward their destinations
            boarded = queue[:10]  # batch up to 10 per tick
            for cid in boarded:
                queue.remove(cid)
                dest_st_id = self.active_riders.get(cid)
                cit = citizens_map.get(cid)
                if cit and dest_st_id in station_coords:
                    dest_x, dest_z = station_coords[dest_st_id]
                    # Transport citizen to destination station
                    cit.current_x = dest_x
                    cit.current_z = dest_z
                    cit.active_vehicle_id = None
                    self.total_metro_ridership += 1

                    # Transition to walking to final destination
                    cit.transition_to(cit.current_state.WALKING, "Exited metro station; walking to destination")
                    if cit.destination_x is not None:
                        cit.set_route([(cit.destination_x, cit.destination_z)], cit.destination_type, cit.destination_x, cit.destination_z)

                if cid in self.active_riders:
                    del self.active_riders[cid]

    def get_metrics(self) -> dict:
        total_waiting = sum(len(q) for q in self.station_queues.values())
        return {
            "total_metro_ridership": self.total_metro_ridership,
            "total_railway_ridership": self.total_railway_ridership,
            "currently_waiting": total_waiting,
            "active_riders": len(self.active_riders),
        }
