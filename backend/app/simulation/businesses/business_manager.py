"""
METACITY — Business Manager
Initializes businesses inside commercial, industrial, and office buildings,
manages employee job assignments, and routes customer traffic.
"""
from typing import Dict, List, Optional
import random
import uuid
from app.simulation.businesses.business import Business


BUSINESS_NAMES = {
    "office": ["Apex FinTech", "Quantum Dynamics", "Novus Media", "Aether Consulting", "Nexus Labs", "Skyline Legal"],
    "factory": ["Metacity Steelworks", "Vortex Robotics", "Apex Manufacturing", "Titan Chemical", "Solaria Assembly"],
    "restaurant": ["Bistro Lumina", "The Rusty Anchor", "Sakura Ramen", "Verde Trattoria", "Metro Diner", "Urban Spice"],
    "shop": ["Metropolis Books", "Nordic Apparel", "Circuit Hub", "Aura Boutique", "Zenith Sports"],
    "supermarket": ["Metro Fresh Market", "GreenLeaf Grocers", "Daily Supercenter"],
    "hospital": ["City General Hospital", "Civic Health Clinic", "St. Jude Care Center"],
    "service": ["Express Cleaners", "City Fitness Club", "Horizon Salon", "Apex Repair Co"],
}


class BusinessManager:
    def __init__(self):
        self.businesses: Dict[str, Business] = {}
        # Indexed by type and district for fast lookups
        self.by_type: Dict[str, List[str]] = {}
        self.by_district: Dict[str, List[str]] = {}

    def initialize_from_buildings(self, buildings: List[dict], seed: int = 42) -> None:
        rng = random.Random(seed * 3001)
        self.businesses.clear()
        self.by_type.clear()
        self.by_district.clear()

        for b in buildings:
            b_type = b.get("building_type", "office")
            b_id = b["id"]
            d_id = b.get("district_id", "")
            bx = b["x"]
            bz = b["z"]

            # Match building type to business type
            biz_type = None
            if b_type in ["cbd", "office", "tech"]:
                biz_type = "office"
            elif b_type == "industrial":
                biz_type = "factory"
            elif b_type in ["residential_high", "residential_med", "riverfront"]:
                # Ground-floor commercial
                if rng.random() < 0.25:
                    biz_type = rng.choice(["restaurant", "shop", "supermarket", "service"])
            elif b_type == "hospital":
                biz_type = "hospital"

            if not biz_type:
                continue

            names_pool = BUSINESS_NAMES.get(biz_type, ["Metacity Commerce"])
            biz_name = rng.choice(names_pool)
            biz_id = f"biz_{b_id[:8]}"

            capacity = 100 if biz_type == "office" else (200 if biz_type == "factory" else 40)

            biz = Business(
                id=biz_id,
                building_id=b_id,
                name=f"{biz_name} ({b.get('district_id', 'City')[:4]})",
                business_type=biz_type,
                district_id=d_id,
                x=bx,
                z=bz,
                capacity=capacity,
                daily_expenses=capacity * 25.0,
            )
            self.businesses[biz_id] = biz

            if biz_type not in self.by_type:
                self.by_type[biz_type] = []
            self.by_type[biz_type].append(biz_id)

            if d_id not in self.by_district:
                self.by_district[d_id] = []
            self.by_district[d_id].append(biz_id)

    def find_workplace_for_citizen(self, occupation: str, district_id: str) -> Optional[Business]:
        target_type = "office"
        if occupation == "industrial_worker":
            target_type = "factory"
        elif occupation == "service_worker":
            target_type = random.choice(["restaurant", "shop", "supermarket", "service"])
        elif occupation in ["professional", "business_owner", "office_worker"]:
            target_type = "office"

        candidates = self.by_type.get(target_type, [])
        if not candidates:
            return None

        # Prefer candidate in same or nearby district
        district_cands = [cid for cid in candidates if self.businesses[cid].district_id == district_id]
        chosen_id = random.choice(district_cands if district_cands else candidates)
        return self.businesses[chosen_id]

    def find_nearest_amenity(self, x: float, z: float, amenity_type: str = "restaurant") -> Optional[Business]:
        cands = self.by_type.get(amenity_type, [])
        if not cands:
            cands = list(self.businesses.keys())
        if not cands:
            return None
        return min(cands, key=lambda bid: (self.businesses[bid].x - x) ** 2 + (self.businesses[bid].z - z) ** 2)

    def to_list(self) -> List[dict]:
        return [b.to_dict() for b in self.businesses.values()]
