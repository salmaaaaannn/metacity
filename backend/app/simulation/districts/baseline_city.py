"""
Baseline infrastructure generator for METACITY.
Creates the pre-built city infrastructure: highways, metro lines,
railway, bus routes, bridges, and facilities.
"""
from dataclasses import dataclass, field
from typing import List, Dict, Any
import uuid


@dataclass
class BaselineInfrastructure:
    infrastructure: List[dict] = field(default_factory=list)
    transit_lines: List[dict] = field(default_factory=list)
    transit_stations: List[dict] = field(default_factory=list)
    roads: List[dict] = field(default_factory=list)


def generate_baseline() -> BaselineInfrastructure:
    """Generate the complete pre-built METACITY baseline infrastructure."""
    infra = BaselineInfrastructure()

    # ── HIGHWAY RING ROAD ────────────────────────────────────────────────
    # Rectangular ring at ~(800,800) to (7200,7200)
    ring_corners = [
        (800, 800), (7200, 800), (7200, 7200), (800, 7200), (800, 800)
    ]
    for i in range(len(ring_corners) - 1):
        sx, sz = ring_corners[i]
        ex, ez = ring_corners[i + 1]
        infra.roads.append({
            "id": str(uuid.uuid4()),
            "road_type": "highway",
            "start_x": sx, "start_z": sz,
            "end_x": ex, "end_z": ez,
            "lanes": 4,
            "width": 20,
            "speed_limit": 120,
        })

    # ── EXPRESSWAY RADIALS FROM CBD (4000,4000) ──────────────────────────
    radials = [
        (4000, 4000, 4000, 800),   # North to University
        (4000, 4000, 7200, 4000),  # East to Tech/Transport
        (4000, 4000, 800, 4000),   # West
    ]
    for sx, sz, ex, ez in radials:
        infra.roads.append({
            "id": str(uuid.uuid4()),
            "road_type": "expressway",
            "start_x": sx, "start_z": sz,
            "end_x": ex, "end_z": ez,
            "lanes": 4,
            "width": 16,
            "speed_limit": 100,
        })

    # ── ARTERIAL CORRIDORS ───────────────────────────────────────────────
    arterials = [
        # CBD to High-Density Residential (west)
        (3200, 4000, 2000, 4000, "arterial"),
        # CBD to Medium-Density Residential (east)
        (4800, 4000, 6000, 4000, "arterial"),
        # CBD to University (north)
        (4000, 3200, 4000, 2400, "arterial"),
        # CBD to Riverfront (south)
        (4000, 4800, 4000, 6400, "arterial"),
        # Industrial to Transport Hub
        (6400, 5600, 6800, 5600, "arterial"),
        # Suburban connector
        (2400, 5600, 2400, 4800, "arterial"),
        # Cross-city east-west
        (800, 3200, 7200, 3200, "collector"),
        # Cross-city north-south
        (3200, 800, 3200, 7200, "collector"),
    ]
    for sx, sz, ex, ez, rtype in arterials:
        infra.roads.append({
            "id": str(uuid.uuid4()),
            "road_type": rtype,
            "start_x": sx, "start_z": sz,
            "end_x": ex, "end_z": ez,
            "lanes": 3 if rtype == "arterial" else 2,
            "width": 12 if rtype == "arterial" else 8,
            "speed_limit": 60 if rtype == "arterial" else 50,
        })

    # ── RIVER BRIDGES (river at x≈5000, z=5500 to 7500) ─────────────────
    bridges = [
        (5000, 5600, 5000, 5800, "Bridge North"),
        (5000, 6400, 5000, 6600, "Bridge Central"),
        (5000, 7000, 5000, 7200, "Bridge South"),
    ]
    for sx, sz, ex, ez, name in bridges:
        infra.roads.append({
            "id": str(uuid.uuid4()),
            "road_type": "bridge",
            "name": name,
            "start_x": sx, "start_z": sz,
            "end_x": ex, "end_z": ez,
            "lanes": 2,
            "width": 10,
            "speed_limit": 60,
        })
        infra.infrastructure.append({
            "id": str(uuid.uuid4()),
            "type": "bridge",
            "name": name,
            "x": (sx + ex) / 2,
            "z": (sz + ez) / 2,
            "condition": 1.0,
            "capacity": 1000,
            "maintenance_cost": 45000,
        })

    # ── METRO LINE A (Red): CBD → University → Tech Park ─────────────────
    metro_a_stations = [
        (4000, 4600, "CBD Central"),
        (3800, 4000, "CBD West Gate"),
        (3600, 3200, "Civic Center"),
        (3800, 2400, "Arts District"),
        (4000, 1800, "University Main"),
        (4400, 1600, "University East"),
        (5000, 1800, "Innovation Sq"),
        (5600, 2000, "Tech Park South"),
        (6400, 2400, "Tech Park Central"),
        (7000, 2800, "Tech Park North"),
        (6800, 3200, "Business Hub"),
        (6400, 3600, "Tech Boulevard"),
    ]
    line_a_id = str(uuid.uuid4())
    infra.transit_lines.append({
        "id": line_a_id,
        "name": "Metro Line A",
        "line_type": "metro",
        "color": "#f44336",
        "capacity": 400,
        "frequency_minutes": 4,
        "route": [[x, z] for x, z, _ in metro_a_stations],
    })
    for x, z, name in metro_a_stations:
        sid = str(uuid.uuid4())
        infra.transit_stations.append({
            "id": sid,
            "line_id": line_a_id,
            "name": name,
            "station_type": "metro",
            "x": x, "z": z,
            "capacity": 500,
            "service_radius": 600,
        })

    # ── METRO LINE B (Blue): Industrial → CBD → Riverfront ───────────────
    metro_b_stations = [
        (6800, 7000, "Industrial Terminal"),
        (6400, 6400, "Factory Gate"),
        (5600, 6000, "Logistics Hub"),
        (5200, 5600, "South Cross"),
        (4800, 5200, "South CBD"),
        (4400, 4800, "CBD South"),
        (4000, 4400, "CBD Main"),
        (4000, 4000, "CBD Hub"),
        (3600, 5200, "Riverfront North"),
        (3600, 6400, "Riverfront Central"),
    ]
    line_b_id = str(uuid.uuid4())
    infra.transit_lines.append({
        "id": line_b_id,
        "name": "Metro Line B",
        "line_type": "metro",
        "color": "#2196f3",
        "capacity": 350,
        "frequency_minutes": 5,
        "route": [[x, z] for x, z, _ in metro_b_stations],
    })
    for x, z, name in metro_b_stations:
        infra.transit_stations.append({
            "id": str(uuid.uuid4()),
            "line_id": line_b_id,
            "name": name,
            "station_type": "metro",
            "x": x, "z": z,
            "capacity": 400,
            "service_radius": 600,
        })

    # ── METRO LINE C (Green): Suburban → CBD → Developing ────────────────
    metro_c_stations = [
        (2000, 6000, "Suburban West"),
        (2400, 5600, "Suburban North"),
        (2800, 5200, "Suburb Gate"),
        (3200, 4800, "West CBD"),
        (3600, 4400, "CBD West"),
        (4000, 4000, "CBD Hub"),  # interchange with B
        (3600, 3200, "North Gate"),
        (3200, 2400, "Development South"),
        (2800, 2000, "Developing Center"),
        (1600, 1600, "Outskirts"),
    ]
    line_c_id = str(uuid.uuid4())
    infra.transit_lines.append({
        "id": line_c_id,
        "name": "Metro Line C",
        "line_type": "metro",
        "color": "#4caf50",
        "capacity": 300,
        "frequency_minutes": 6,
        "route": [[x, z] for x, z, _ in metro_c_stations],
    })
    for x, z, name in metro_c_stations:
        infra.transit_stations.append({
            "id": str(uuid.uuid4()),
            "line_id": line_c_id,
            "name": name,
            "station_type": "metro",
            "x": x, "z": z,
            "capacity": 300,
            "service_radius": 500,
        })

    # ── RAILWAY LINE ─────────────────────────────────────────────────────
    railway_stations = [
        (1200, 4400, "West Terminal"),
        (2800, 4400, "Suburban Station"),
        (4000, 4000, "Central Station"),
        (5600, 4400, "East Junction"),
        (7000, 4800, "Transport Hub Station"),
    ]
    railway_id = str(uuid.uuid4())
    infra.transit_lines.append({
        "id": railway_id,
        "name": "Metacity Railway",
        "line_type": "railway",
        "color": "#795548",
        "capacity": 800,
        "frequency_minutes": 15,
        "route": [[x, z] for x, z, _ in railway_stations],
    })
    for x, z, name in railway_stations:
        infra.transit_stations.append({
            "id": str(uuid.uuid4()),
            "line_id": railway_id,
            "name": name,
            "station_type": "railway",
            "x": x, "z": z,
            "capacity": 800,
            "service_radius": 800,
        })

    # ── FACILITIES PER DISTRICT ──────────────────────────────────────────
    facilities = [
        # Hospitals
        {"type": "hospital", "name": "CBD Medical Center",     "x": 3600, "z": 4400, "capacity": 500},
        {"type": "hospital", "name": "North General Hospital", "x": 2800, "z": 3200, "capacity": 400},
        {"type": "hospital", "name": "Industrial Clinic",      "x": 6400, "z": 6400, "capacity": 200},
        {"type": "hospital", "name": "Suburban Hospital",      "x": 2400, "z": 5600, "capacity": 350},
        # Schools
        {"type": "school", "name": "CBD Primary",             "x": 3800, "z": 4200, "capacity": 800},
        {"type": "school", "name": "Residential School A",    "x": 2400, "z": 3200, "capacity": 600},
        {"type": "school", "name": "Suburban Elementary",     "x": 2000, "z": 5200, "capacity": 700},
        {"type": "school", "name": "Outskirts School",        "x": 1200, "z": 1600, "capacity": 400},
        # Universities
        {"type": "university", "name": "Metacity University", "x": 4000, "z": 1600, "capacity": 15000},
        {"type": "university", "name": "Tech Institute",      "x": 6000, "z": 2400, "capacity": 8000},
        # Police
        {"type": "police", "name": "CBD Police HQ",          "x": 4200, "z": 4200, "capacity": 200},
        {"type": "police", "name": "North Precinct",          "x": 2800, "z": 2800, "capacity": 100},
        {"type": "police", "name": "Industrial Precinct",     "x": 6800, "z": 6800, "capacity": 80},
        {"type": "police", "name": "Suburban Station",        "x": 2400, "z": 6000, "capacity": 80},
        # Fire Stations
        {"type": "fire_station", "name": "CBD Fire Dept",    "x": 3400, "z": 4600, "capacity": 50},
        {"type": "fire_station", "name": "Industrial Fire",  "x": 6000, "z": 6000, "capacity": 40},
        {"type": "fire_station", "name": "Suburban Fire",    "x": 2000, "z": 5800, "capacity": 40},
        # Power Plants
        {"type": "power_plant", "name": "North Power Plant", "x": 1200, "z": 1200, "capacity": 200000},
        {"type": "power_plant", "name": "East Power Plant",  "x": 7200, "z": 1600, "capacity": 150000},
        {"type": "substation", "name": "CBD Substation",     "x": 3200, "z": 3600, "capacity": 50000},
        {"type": "substation", "name": "Industrial Sub",     "x": 6400, "z": 5200, "capacity": 40000},
        # Water
        {"type": "water_treatment", "name": "North Water Plant", "x": 800,  "z": 7200, "capacity": 100000},
        {"type": "water_treatment", "name": "South Water Plant", "x": 7600, "z": 400,  "capacity": 80000},
        # Parks
        {"type": "park", "name": "CBD Central Park",         "x": 4000, "z": 4000, "capacity": 5000},
        {"type": "park", "name": "Riverfront Park",          "x": 4200, "z": 6400, "capacity": 3000},
        {"type": "park", "name": "University Green",         "x": 4000, "z": 2000, "capacity": 2000},
        {"type": "park", "name": "Suburban Park",            "x": 2200, "z": 5400, "capacity": 2000},
        # Waste
        {"type": "waste_facility", "name": "Industrial Waste", "x": 7400, "z": 7400, "capacity": 50000},
        # ── AIRPORT COMPLEX (northeast edge, x:6400–7900, z:200–2200) ──────
        {"type": "airport_terminal", "name": "METACITY International Terminal", "x": 7000, "z": 1200, "capacity": 12000},
        {"type": "control_tower",    "name": "Airport Control Tower",           "x": 7400, "z": 1000, "capacity": 50},
        {"type": "airport_hangar",   "name": "Main Hangar A",                   "x": 6800, "z": 600,  "capacity": 20},
        {"type": "airport_hangar",   "name": "Cargo Hangar B",                  "x": 7200, "z": 600,  "capacity": 15},
        {"type": "airport_parking",  "name": "Airport Long-Stay Parking",       "x": 6600, "z": 1800, "capacity": 3000},
    ]
    for f in facilities:
        infra.infrastructure.append({
            "id": str(uuid.uuid4()),
            "type": f["type"],
            "name": f["name"],
            "x": f["x"],
            "z": f["z"],
            "capacity": f.get("capacity", 100),
            "condition": 1.0,
            "maintenance_cost": _facility_maintenance(f["type"]),
        })

    # ── AIRPORT RUNWAYS (east-west oriented) ─────────────────────────────
    # Main runway: 3500m east-west (x: 6000–7800, z: 800)
    infra.roads.append({
        "id": str(uuid.uuid4()),
        "road_type": "runway",
        "start_x": 6000, "start_z": 800,
        "end_x": 7800, "end_z": 800,
        "lanes": 1,
        "width": 60,
        "speed_limit": 250,
    })
    # Secondary runway: 2800m (x: 6200–7600, z: 1600)
    infra.roads.append({
        "id": str(uuid.uuid4()),
        "road_type": "runway",
        "start_x": 6200, "start_z": 1600,
        "end_x": 7600, "end_z": 1600,
        "lanes": 1,
        "width": 45,
        "speed_limit": 200,
    })
    # Taxiway connecting runways to terminal apron
    infra.roads.append({
        "id": str(uuid.uuid4()),
        "road_type": "taxiway",
        "start_x": 7000, "start_z": 800,
        "end_x": 7000, "end_z": 1200,
        "lanes": 1,
        "width": 30,
        "speed_limit": 50,
    })
    infra.roads.append({
        "id": str(uuid.uuid4()),
        "road_type": "taxiway",
        "start_x": 7000, "start_z": 1600,
        "end_x": 7000, "end_z": 1200,
        "lanes": 1,
        "width": 30,
        "speed_limit": 50,
    })
    # Airport access road (connects to ring highway at x=7200)
    infra.roads.append({
        "id": str(uuid.uuid4()),
        "road_type": "arterial",
        "start_x": 7200, "start_z": 800,
        "end_x": 7200, "end_z": 1800,
        "lanes": 3,
        "width": 14,
        "speed_limit": 80,
    })

    # ── LOCAL STREET GRIDS PER DISTRICT (SimCity-style) ────────────────
    # Every building must be within ~100m of a local road.
    # Grid spacing varies by district density.
    district_configs = [
        # (name, type, xMin, zMin, xMax, zMax, gridSpacing)
        ("CBD",                  "cbd",              3200, 3200, 4800, 4800, 100),
        ("High-Density Res",     "residential_high", 1600, 3200, 3200, 4800, 200),
        ("Med-Density Res",      "residential_med",  4800, 3200, 6400, 4800, 200),
        ("Low-Density Res",      "residential_low",  1200, 4800, 2400, 6400, 300),
        ("Industrial",           "industrial",       5600, 5600, 7200, 7200, 250),
        ("Education/University", "education",        3200, 1200, 4800, 2800, 200),
        ("Tech Park",            "tech",             5600, 1600, 7200, 3600, 100),
        ("Developing",           "developing",       800,  800,  2400, 2400, 300),
        ("Transport Hub",        "transport",        6400, 4400, 7200, 5600, 200),
        ("Suburban",             "suburban",         1600, 5200, 3200, 6800, 300),
        ("Riverfront",           "riverfront",       3200, 5600, 4800, 7200, 200),
        ("Rural",                "rural",            800,  6400, 1600, 7600, 400),
    ]

    for dist_name, dist_type, x_min, z_min, x_max, z_max, spacing in district_configs:
        # North-South local streets
        x = x_min + spacing
        while x < x_max:
            infra.roads.append({
                "id": str(uuid.uuid4()),
                "road_type": "local",
                "start_x": x, "start_z": z_min,
                "end_x": x, "end_z": z_max,
                "lanes": 1,
                "width": 8,
                "speed_limit": 30,
            })
            x += spacing

        # East-West local streets
        z = z_min + spacing
        while z < z_max:
            infra.roads.append({
                "id": str(uuid.uuid4()),
                "road_type": "local",
                "start_x": x_min, "start_z": z,
                "end_x": x_max, "end_z": z,
                "lanes": 1,
                "width": 8,
                "speed_limit": 30,
            })
            z += spacing

    return infra



def _facility_maintenance(facility_type: str) -> float:
    costs = {
        "hospital": 280000,
        "school": 85000,
        "university": 350000,
        "police": 120000,
        "fire_station": 100000,
        "power_plant": 200000,
        "substation": 50000,
        "water_treatment": 80000,
        "park": 25000,
        "waste_facility": 65000,
        "bridge": 45000,
        # Airport infrastructure
        "airport_terminal": 850000,
        "control_tower": 120000,
        "airport_hangar": 95000,
        "airport_parking": 40000,
    }
    return costs.get(facility_type, 30000)

