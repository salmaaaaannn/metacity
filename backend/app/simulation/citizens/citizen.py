"""
METACITY — Citizen Agent Model
Autonomous AI agent representing an individual citizen with demographics,
household ties, state machine, preferences, memory, and physical navigation.
"""
from dataclasses import dataclass, field
from typing import Optional, List, Tuple, Dict, Any
import math
import uuid
from app.simulation.citizens.state_machine import CitizenState, can_transition
from app.simulation.citizens.demographics import CitizenPreferences
from app.simulation.citizens.memory import CitizenMemory


@dataclass
class Citizen:
    id: str
    name: str
    age: int
    age_group: str
    occupation: str
    sprite_type: str
    district_id: str
    income: float

    # Location & Structural anchors
    household_id: str
    home_building_id: str
    home_x: float
    home_z: float
    workplace_building_id: Optional[str] = None
    work_x: Optional[float] = None
    work_z: Optional[float] = None
    school_building_id: Optional[str] = None
    school_x: Optional[float] = None
    school_z: Optional[float] = None

    # Current physical position
    current_x: float = 0.0
    current_z: float = 0.0
    destination_x: Optional[float] = None
    destination_z: Optional[float] = None
    destination_type: Optional[str] = None
    facing_angle: float = 0.0  # radians

    # State & activity
    current_state: CitizenState = CitizenState.AT_HOME
    current_activity: str = "home"
    travel_mode: str = "walk"  # 'walk', 'car', 'bus', 'metro', 'railway'
    active_vehicle_id: Optional[str] = None
    transit_line_id: Optional[str] = None
    transit_stop_id: Optional[str] = None
    decision_reason: str = "At home relaxing."

    # Navigation path: list of (x, z) points
    current_path: List[Tuple[float, float]] = field(default_factory=list)
    path_index: int = 0
    walking_speed: float = 3.0  # m/s (approx 10.8 km/h for sim visual clarity)

    # Wellbeing & psychology
    satisfaction: float = 0.85
    stress: float = 0.15
    fatigue: float = 0.10
    health: float = 0.90
    money: float = 500.0

    # Personality & memory
    vehicle_ownership: bool = False
    preferred_transport: str = "bus"
    preferences: CitizenPreferences = field(default_factory=CitizenPreferences)
    memory: CitizenMemory = field(default_factory=CitizenMemory)

    def transition_to(self, new_state: CitizenState, reason: str = "") -> bool:
        """Attempt to transition state machine."""
        if can_transition(self.current_state, new_state):
            self.current_state = new_state
            if reason:
                self.decision_reason = reason
            return True
        return False

    def set_route(self, path: List[Tuple[float, float]], destination_type: str, dest_x: float, dest_z: float) -> None:
        """Assign physical movement waypoints toward destination."""
        self.current_path = path if path else [(dest_x, dest_z)]
        self.path_index = 0
        self.destination_x = dest_x
        self.destination_z = dest_z
        self.destination_type = destination_type

    def move_step(self, step_distance: float) -> bool:
        """
        Advance one simulation step along current_path.
        Returns True when final destination waypoint has been reached.
        """
        if not self.current_path or self.path_index >= len(self.current_path):
            return True

        target_x, target_z = self.current_path[self.path_index]
        dx = target_x - self.current_x
        dz = target_z - self.current_z
        dist = math.sqrt(dx * dx + dz * dz)

        if dist > 0.001:
            self.facing_angle = math.atan2(dx, dz)

        if dist <= step_distance:
            self.current_x = target_x
            self.current_z = target_z
            self.path_index += 1
            if self.path_index >= len(self.current_path):
                return True
        else:
            self.current_x += (dx / dist) * step_distance
            self.current_z += (dz / dist) * step_distance

        return False

    def update_satisfaction(self, delta: float) -> None:
        self.satisfaction = max(0.05, min(1.0, self.satisfaction + delta))
        if delta < 0:
            self.stress = min(1.0, self.stress + abs(delta) * 1.5)
        else:
            self.stress = max(0.0, self.stress - delta * 0.8)

    def to_position_dict(self) -> dict:
        """Lightweight payload for 60 FPS frontend delta streaming."""
        return {
            "id": self.id,
            "x": round(self.current_x, 1),
            "z": round(self.current_z, 1),
            "state": self.current_state.value,
            "activity": self.current_activity,
            "sprite_type": self.sprite_type,
            "facing": round(self.facing_angle, 2),
            "mode": self.travel_mode,
        }

    def to_detail_dict(self) -> dict:
        """Complete biography payload for the Citizen Inspector."""
        return {
            "id": self.id,
            "name": self.name,
            "age": self.age,
            "age_group": self.age_group,
            "occupation": self.occupation,
            "sprite_type": self.sprite_type,
            "district_id": self.district_id,
            "income": round(self.income, 2),
            "money": round(self.money, 2),
            "household_id": self.household_id,
            "home_building_id": self.home_building_id,
            "home_coords": [round(self.home_x, 1), round(self.home_z, 1)],
            "workplace_building_id": self.workplace_building_id,
            "workplace_coords": [round(self.work_x, 1), round(self.work_z, 1)] if self.work_x is not None else None,
            "school_building_id": self.school_building_id,
            "school_coords": [round(self.school_x, 1), round(self.school_z, 1)] if self.school_x is not None else None,
            "current_state": self.current_state.value,
            "current_activity": self.current_activity,
            "destination_type": self.destination_type,
            "destination_coords": [round(self.destination_x, 1), round(self.destination_z, 1)] if self.destination_x is not None else None,
            "travel_mode": self.travel_mode,
            "decision_reason": self.decision_reason,
            "has_car": self.vehicle_ownership,
            "active_vehicle_id": self.active_vehicle_id,
            "satisfaction": round(self.satisfaction * 100, 1),
            "stress": round(self.stress * 100, 1),
            "fatigue": round(self.fatigue * 100, 1),
            "health": round(self.health * 100, 1),
            "preferences": self.preferences.to_dict(),
            "memory": self.memory.to_dict(),
            "position": [round(self.current_x, 1), round(self.current_z, 1)],
        }

    def to_dict(self) -> dict:
        return self.to_detail_dict()
