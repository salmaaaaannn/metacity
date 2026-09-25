"""
METACITY — Household Model
Clusters citizens into family/living units sharing homes, residential buildings, and vehicles.
"""
from dataclasses import dataclass, field
from typing import List, Optional
import uuid


@dataclass
class Household:
    id: str
    district_id: str
    building_id: str
    home_x: float
    home_z: float
    member_ids: List[str] = field(default_factory=list)
    has_car: bool = False
    vehicle_id: Optional[str] = None
    total_income: float = 0.0

    def add_member(self, citizen_id: str, income: float) -> None:
        if citizen_id not in self.member_ids:
            self.member_ids.append(citizen_id)
            self.total_income += income

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "district_id": self.district_id,
            "building_id": self.building_id,
            "home_x": self.home_x,
            "home_z": self.home_z,
            "members_count": len(self.member_ids),
            "member_ids": self.member_ids,
            "has_car": self.has_car,
            "vehicle_id": self.vehicle_id,
            "total_income": round(self.total_income, 2),
        }
