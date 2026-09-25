"""
METACITY — Citizen Demographics & Profile Generator
Configurable demographic distributions and seeded personal attributes.
"""
from enum import Enum
import random
from dataclasses import dataclass, field
from typing import Dict, List, Tuple


class AgeGroup(str, Enum):
    CHILD = "child"            # 0 - 17
    STUDENT = "student"        # 18 - 24
    YOUNG_ADULT = "young_adult"# 25 - 34
    ADULT = "adult"            # 35 - 54
    SENIOR = "senior"          # 55 - 64
    ELDERLY = "elderly"        # 65+


class OccupationType(str, Enum):
    CHILD = "child"
    STUDENT = "student"
    OFFICE_WORKER = "office_worker"
    PROFESSIONAL = "professional"
    BUSINESS_OWNER = "business_owner"
    SERVICE_WORKER = "service_worker"
    INDUSTRIAL_WORKER = "industrial_worker"
    RETIRED = "retired"
    UNEMPLOYED = "unemployed"


# Configurable baseline population distribution (sums to 1.0)
DEMOGRAPHIC_DISTRIBUTION = {
    OccupationType.CHILD: 0.16,
    OccupationType.STUDENT: 0.12,
    OccupationType.INDUSTRIAL_WORKER: 0.14,
    OccupationType.OFFICE_WORKER: 0.18,
    OccupationType.PROFESSIONAL: 0.22,
    OccupationType.SERVICE_WORKER: 0.10,
    OccupationType.BUSINESS_OWNER: 0.04,
    OccupationType.RETIRED: 0.04,
}


@dataclass
class CitizenPreferences:
    car_weight: float = 0.5
    bus_weight: float = 0.5
    metro_weight: float = 0.5
    railway_weight: float = 0.5
    walk_weight: float = 0.5
    cost_sensitivity: float = 0.5
    comfort_preference: float = 0.5

    def to_dict(self) -> dict:
        return {
            "car_weight": round(self.car_weight, 2),
            "bus_weight": round(self.bus_weight, 2),
            "metro_weight": round(self.metro_weight, 2),
            "railway_weight": round(self.railway_weight, 2),
            "walk_weight": round(self.walk_weight, 2),
            "cost_sensitivity": round(self.cost_sensitivity, 2),
            "comfort_preference": round(self.comfort_preference, 2),
        }


FIRST_NAMES_MALE = ["James", "Marcus", "Alex", "David", "Liam", "Chen", "Rajesh", "Carlos", "Kenji", "Tariq"]
FIRST_NAMES_FEMALE = ["Emma", "Sarah", "Priya", "Elena", "Mei", "Zara", "Aisha", "Sofia", "Yuki", "Chloe"]
LAST_NAMES = ["Smith", "Patel", "Chen", "Garcia", "Kim", "Tanaka", "Silva", "Mueller", "Novak", "Khan", "Dubois"]


def generate_demographic_profile(seed: int, index: int, district_avg_income: float) -> dict:
    """Generate deterministic personal profile for a citizen."""
    rng = random.Random(seed * 10007 + index)

    # Determine occupation based on cumulative probability
    roll = rng.random()
    cum = 0.0
    selected_occ = OccupationType.OFFICE_WORKER
    for occ, prob in DEMOGRAPHIC_DISTRIBUTION.items():
        cum += prob
        if roll <= cum:
            selected_occ = occ
            break

    # Age & AgeGroup based on occupation
    if selected_occ == OccupationType.CHILD:
        age = rng.randint(5, 17)
        age_group = AgeGroup.CHILD
        sprite_type = "child"
        income = 0.0
    elif selected_occ == OccupationType.STUDENT:
        age = rng.randint(18, 24)
        age_group = AgeGroup.STUDENT
        sprite_type = "student"
        income = district_avg_income * rng.uniform(0.15, 0.35)
    elif selected_occ == OccupationType.RETIRED:
        age = rng.randint(65, 85)
        age_group = AgeGroup.ELDERLY
        sprite_type = "elderly"
        income = district_avg_income * rng.uniform(0.4, 0.7)
    else:
        age = rng.randint(24, 64)
        if age < 35:
            age_group = AgeGroup.YOUNG_ADULT
        elif age < 55:
            age_group = AgeGroup.ADULT
        else:
            age_group = AgeGroup.SENIOR

        if selected_occ == OccupationType.PROFESSIONAL:
            sprite_type = "professional"
            income = district_avg_income * rng.uniform(1.2, 2.0)
        elif selected_occ == OccupationType.BUSINESS_OWNER:
            sprite_type = "professional"
            income = district_avg_income * rng.uniform(1.5, 3.0)
        elif selected_occ == OccupationType.SERVICE_WORKER:
            sprite_type = "worker"
            income = district_avg_income * rng.uniform(0.6, 0.95)
        elif selected_occ == OccupationType.INDUSTRIAL_WORKER:
            sprite_type = "worker"
            income = district_avg_income * rng.uniform(0.7, 1.1)
        else:  # OFFICE_WORKER
            sprite_type = "professional"
            income = district_avg_income * rng.uniform(0.85, 1.3)

    is_female = rng.random() < 0.5
    first_name = rng.choice(FIRST_NAMES_FEMALE if is_female else FIRST_NAMES_MALE)
    last_name = rng.choice(LAST_NAMES)
    full_name = f"{first_name} {last_name}"

    # Transport preferences
    prefs = CitizenPreferences(
        car_weight=rng.uniform(0.2, 0.8),
        bus_weight=rng.uniform(0.3, 0.8),
        metro_weight=rng.uniform(0.4, 0.9),
        railway_weight=rng.uniform(0.3, 0.7),
        walk_weight=rng.uniform(0.3, 0.8),
        cost_sensitivity=rng.uniform(0.2, 0.9) if income < district_avg_income else rng.uniform(0.1, 0.5),
        comfort_preference=rng.uniform(0.4, 0.9),
    )

    return {
        "name": full_name,
        "age": age,
        "age_group": age_group.value,
        "occupation": selected_occ.value,
        "sprite_type": sprite_type,
        "income": round(income, 2),
        "preferences": prefs,
        "personality": {
            "patience": round(rng.uniform(0.2, 0.9), 2),
            "walk_tolerance_m": rng.randint(600, 1600) if age < 65 else rng.randint(300, 800),
        }
    }
