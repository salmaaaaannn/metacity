"""
METACITY — Citizen Experience Memory & Adaptation
Tracks commute outcomes, transit reliability, and updates transport mode preferences.
"""
from dataclasses import dataclass, field
from typing import Dict, List, Optional


@dataclass
class TripExperience:
    mode: str
    origin_name: str
    dest_name: str
    duration_minutes: float
    expected_duration: float
    cost: float
    satisfaction: float
    delayed: bool
    timestamp_hour: float


@dataclass
class CitizenMemory:
    recent_trips: List[TripExperience] = field(default_factory=list)
    mode_penalties: Dict[str, float] = field(default_factory=lambda: {
        "walk": 0.0,
        "car": 0.0,
        "bus": 0.0,
        "metro": 0.0,
        "railway": 0.0,
    })
    last_trip_mode: Optional[str] = None
    total_trips: int = 0
    delays_count: int = 0

    def record_trip(
        self,
        mode: str,
        duration: float,
        expected: float,
        cost: float,
        hour: float,
        origin: str = "Home",
        dest: str = "Work",
    ) -> float:
        """Record a completed trip and return satisfaction impact (-0.3 to +0.2)."""
        self.total_trips += 1
        self.last_trip_mode = mode
        delayed = duration > (expected * 1.25)
        if delayed:
            self.delays_count += 1
            # Increase penalty for this mode temporarily (decayed over time)
            self.mode_penalties[mode] = min(1.0, self.mode_penalties.get(mode, 0.0) + 0.15)
            impact = -0.15
        else:
            # Good trip reduces penalty
            self.mode_penalties[mode] = max(0.0, self.mode_penalties.get(mode, 0.0) - 0.05)
            impact = 0.08

        exp = TripExperience(
            mode=mode,
            origin_name=origin,
            dest_name=dest,
            duration_minutes=round(duration, 1),
            expected_duration=round(expected, 1),
            cost=round(cost, 2),
            satisfaction=round(max(0.0, min(1.0, 0.8 + impact)), 2),
            delayed=delayed,
            timestamp_hour=hour,
        )
        self.recent_trips.append(exp)
        if len(self.recent_trips) > 10:
            self.recent_trips.pop(0)

        return impact

    def get_mode_penalty(self, mode: str) -> float:
        return self.mode_penalties.get(mode, 0.0)

    def to_dict(self) -> dict:
        return {
            "total_trips": self.total_trips,
            "delays_count": self.delays_count,
            "mode_penalties": {k: round(v, 2) for k, v in self.mode_penalties.items()},
            "last_trip_mode": self.last_trip_mode,
            "recent_trips_count": len(self.recent_trips),
        }
