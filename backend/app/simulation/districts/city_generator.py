"""
METACITY — Complete City & Autonomous Population Generator
Instantiates 12 districts, 2,400+ buildings, pedestrian & road networks,
households, schools, workplaces, and 1,000 diverse autonomous citizens.
"""
import uuid
import random
from dataclasses import dataclass
from typing import List, Dict, Tuple, Optional, Any
from app.simulation.districts.district import District
from app.simulation.world.chunk import WorldChunk
from app.simulation.roads.road_graph import RoadGraph
from app.simulation.citizens.citizen import Citizen
from app.simulation.citizens.household import Household
from app.simulation.citizens.demographics import generate_demographic_profile
from app.simulation.citizens.pedestrian_graph import PedestrianGraph
from app.simulation.citizens.state_machine import CitizenState


@dataclass
class GeneratedCity:
    districts: List[District]
    chunks: Dict[tuple, WorldChunk]
    buildings: List[dict]
    citizens: List[Citizen]
    road_graph: RoadGraph
    pedestrian_graph: PedestrianGraph
    households: Dict[str, Household]


def generate_city(seed: int = 42, active_citizens: int = 1000) -> GeneratedCity:
    rng = random.Random(seed)

    # 1. Instantiate 12 districts with exact bounds
    districts = [
        District(str(uuid.uuid4()), "Central Business District", "cbd", 1.0, 85000, 2560000, 10000.0, 80000.0, 20000, 150000, 0.9, 0.9, 1.0, 0.8, 0.6, 1.0, (3200, 3200, 4800, 4800), "#1a237e"),
        District(str(uuid.uuid4()), "High-Density Residential", "residential_high", 0.9, 120000, 2560000, 7000.0, 60000.0, 120000, 20000, 0.8, 0.8, 0.9, 0.7, 0.7, 0.9, (2000, 2400, 3600, 4000), "#b71c1c"),
        District(str(uuid.uuid4()), "Medium-Density Residential", "residential_med", 0.7, 95000, 2560000, 5000.0, 50000.0, 95000, 10000, 0.8, 0.7, 0.8, 0.8, 0.8, 0.8, (4400, 3200, 6000, 4800), "#e53935"),
        District(str(uuid.uuid4()), "Low-Density Residential", "residential_low", 0.5, 45000, 4160000, 3000.0, 70000.0, 45000, 5000, 0.9, 0.8, 0.6, 0.9, 0.9, 0.7, (1000, 5600, 3600, 7200), "#ef9a9a"),
        District(str(uuid.uuid4()), "Industrial Zone", "industrial", 0.8, 12000, 4840000, 2000.0, 40000.0, 10000, 80000, 0.3, 0.4, 0.8, 0.5, 0.2, 0.8, (5600, 5600, 7800, 7800), "#33691e"),
        District(str(uuid.uuid4()), "University District", "education", 0.85, 35000, 3200000, 6000.0, 30000.0, 30000, 15000, 1.0, 0.8, 0.9, 0.8, 0.8, 0.9, (3200, 800, 5200, 2400), "#4527a0"),
        District(str(uuid.uuid4()), "Technology Park", "tech", 0.75, 28000, 3200000, 8000.0, 90000.0, 15000, 60000, 0.9, 0.8, 0.8, 0.9, 0.8, 0.9, (5200, 1600, 7200, 3200), "#00695c"),
        District(str(uuid.uuid4()), "Developing Outskirts", "developing", 0.3, 18000, 3200000, 1000.0, 25000.0, 25000, 5000, 0.4, 0.4, 0.4, 0.5, 0.7, 0.3, (400, 400, 2000, 2400), "#f57f17"),
        District(str(uuid.uuid4()), "Transport/Logistics Hub", "transport", 0.7, 8000, 2240000, 3000.0, 45000.0, 5000, 30000, 0.4, 0.5, 1.0, 0.6, 0.3, 0.9, (6400, 4000, 7800, 5600), "#37474f"),
        District(str(uuid.uuid4()), "Suburban District", "suburban", 0.5, 62000, 2560000, 4000.0, 65000.0, 62000, 8000, 0.8, 0.7, 0.6, 0.8, 0.8, 0.7, (1600, 4800, 3200, 6400), "#e65100"),
        District(str(uuid.uuid4()), "Riverfront District", "riverfront", 0.6, 22000, 3200000, 9000.0, 85000.0, 25000, 15000, 0.8, 0.8, 0.7, 0.8, 0.9, 0.8, (3200, 5600, 5200, 7200), "#006064"),
        District(str(uuid.uuid4()), "Rural/Peripheral Zone", "rural", 0.15, 9000, 12800000, 500.0, 35000.0, 15000, 5000, 0.3, 0.3, 0.3, 0.7, 0.9, 0.4, (0, 0, 800, 8000), "#558b2f"),
    ]

    # 2. Chunks & Buildings
    chunks = {}
    buildings = []
    residential_buildings: List[dict] = []
    office_buildings: List[dict] = []
    factory_buildings: List[dict] = []
    school_buildings: List[dict] = []

    for cx in range(40):
        for cz in range(40):
            wx = cx * 200
            wz = cz * 200
            dist = None
            for d in districts:
                if d.bounds[0] <= wx < d.bounds[2] and d.bounds[1] <= wz < d.bounds[3]:
                    dist = d
                    break

            chunk = WorldChunk(cx, cz, wx, wz, dist.id if dist else None, "urban" if dist else "rural")
            chunks[(cx, cz)] = chunk

            if dist:
                num_buildings = int(dist.development_level * 5)
                for _ in range(num_buildings):
                    bx = wx + rng.uniform(15, 185)
                    bz = wz + rng.uniform(15, 185)
                    h = rng.uniform(12, 35) * dist.development_level
                    w = rng.uniform(15, 45)

                    b_entry = {
                        "id": str(uuid.uuid4()),
                        "district_id": dist.id,
                        "building_type": dist.type,
                        "x": bx,
                        "z": bz,
                        "width": w,
                        "depth": w,
                        "height": h,
                        "floors": max(1, int(h / 4))
                    }
                    buildings.append(b_entry)
                    chunk.buildings.append(b_entry)

                    # Categorize for assignment
                    if dist.type in ["residential_high", "residential_med", "residential_low", "suburban"]:
                        residential_buildings.append(b_entry)
                    elif dist.type in ["cbd", "tech"]:
                        office_buildings.append(b_entry)
                    elif dist.type == "industrial":
                        factory_buildings.append(b_entry)
                    elif dist.type == "education":
                        school_buildings.append(b_entry)

    # Fallbacks if a list is empty
    if not residential_buildings:
        residential_buildings = buildings[:50]
    if not office_buildings:
        office_buildings = buildings[50:100]
    if not factory_buildings:
        factory_buildings = buildings[100:130]
    if not school_buildings:
        school_buildings = buildings[130:150]

    # 3. Road & Pedestrian Graphs
    road_graph = RoadGraph()
    ped_graph = PedestrianGraph()

    for x in range(0, 8000, 400):
        for z in range(0, 8000, 400):
            nid = f"n_{x}_{z}"
            road_graph.add_node(nid, x, z)
            ped_graph.add_node(f"ped_{x}_{z}", x, z)

            if x > 0:
                road_graph.add_edge(f"n_{x-400}_{z}", nid, "arterial", 2, 50, 400)
                road_graph.add_edge(nid, f"n_{x-400}_{z}", "arterial", 2, 50, 400)
                ped_graph.add_edge(f"ped_{x-400}_{z}", f"ped_{x}_{z}", 400)

            if z > 0:
                road_graph.add_edge(f"n_{x}_{z-400}", nid, "arterial", 2, 50, 400)
                road_graph.add_edge(nid, f"n_{x}_{z-400}", "arterial", 2, 50, 400)
                ped_graph.add_edge(f"ped_{x}_{z-400}", f"ped_{x}_{z}", 400)

    # 4. Households & Citizen Generation
    households: Dict[str, Household] = {}
    citizens: List[Citizen] = []

    # Map district id to district object
    dist_map = {d.id: d for d in districts}

    # Group citizens into households (1 to 4 members)
    citizen_idx = 0
    while citizen_idx < active_citizens:
        home_bldg = rng.choice(residential_buildings)
        hh_id = f"hh_{uuid.uuid4().hex[:8]}"
        d_id = home_bldg["district_id"]
        dist_obj = dist_map.get(d_id, districts[0])

        household = Household(
            id=hh_id,
            district_id=d_id,
            building_id=home_bldg["id"],
            home_x=home_bldg["x"],
            home_z=home_bldg["z"],
        )

        hh_size = rng.choices([1, 2, 3, 4], weights=[0.25, 0.35, 0.25, 0.15])[0]
        hh_size = min(hh_size, active_citizens - citizen_idx)

        for _ in range(hh_size):
            prof = generate_demographic_profile(seed, citizen_idx, dist_obj.average_income)
            cid = f"cit_{citizen_idx:04d}"

            # Workplace / School assignment
            work_bldg = None
            school_bldg = None
            occ = prof["occupation"]

            if occ in ["office_worker", "professional", "business_owner"]:
                work_bldg = rng.choice(office_buildings)
            elif occ in ["industrial_worker"]:
                work_bldg = rng.choice(factory_buildings)
            elif occ in ["service_worker"]:
                work_bldg = rng.choice(residential_buildings + office_buildings)
            elif occ in ["student", "child"]:
                school_bldg = rng.choice(school_buildings)

            work_x = work_bldg["x"] if work_bldg else None
            work_z = work_bldg["z"] if work_bldg else None
            school_x = school_bldg["x"] if school_bldg else None
            school_z = school_bldg["z"] if school_bldg else None

            cit = Citizen(
                id=cid,
                name=prof["name"],
                age=prof["age"],
                age_group=prof["age_group"],
                occupation=occ,
                sprite_type=prof["sprite_type"],
                district_id=d_id,
                income=prof["income"],
                household_id=hh_id,
                home_building_id=home_bldg["id"],
                home_x=home_bldg["x"],
                home_z=home_bldg["z"],
                workplace_building_id=work_bldg["id"] if work_bldg else None,
                work_x=work_x,
                work_z=work_z,
                school_building_id=school_bldg["id"] if school_bldg else None,
                school_x=school_x,
                school_z=school_z,
                current_x=home_bldg["x"],
                current_z=home_bldg["z"],
                current_state=CitizenState.AT_HOME,
                current_activity="home",
                preferences=prof["preferences"],
                satisfaction=rng.uniform(0.75, 0.95),
                stress=rng.uniform(0.1, 0.25),
                fatigue=rng.uniform(0.05, 0.2),
            )

            household.add_member(cid, prof["income"])
            citizens.append(cit)
            citizen_idx += 1

        # Car ownership for household
        # Higher income households have much higher car ownership probability
        car_prob = 0.4 if household.total_income > dist_obj.average_income else 0.15
        if rng.random() < car_prob:
            household.has_car = True
            household.vehicle_id = f"car_{hh_id}"
            # Mark car ownership on adult members with driver licenses
            for mid in household.member_ids:
                # Find matching citizen
                for c in citizens:
                    if c.id == mid and c.age >= 18:
                        c.vehicle_ownership = True
                        break

        households[hh_id] = household

    return GeneratedCity(districts, chunks, buildings, citizens, road_graph, ped_graph, households)
