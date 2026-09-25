"""
METACITY — Simulation Resilience Index Calculator (Phase 4)
Computes multi-criteria resilience scores per district and city-wide (0 - 100 scale).
Clearly designated as "METACITY SIMULATION RESILIENCE INDEX".
"""
from typing import Dict, List, Any

def calculate_city_resilience_index(
    world: Any,
    environment_state: Any,
    active_incidents_count: int
) -> Dict[str, Any]:
    # 1. Emergency service coverage (Hospitals, Police, Fire stations)
    civic_count = 0
    if hasattr(world, "infrastructure"):
        for item in world.infrastructure.values():
            if item.get("item_type") in ["hospital", "police", "fire", "metro_station"]:
                civic_count += 1
    emergency_coverage_score = min(100.0, 50.0 + (civic_count * 4.5))

    # 2. Utility redundancy (Power grid stress & water reserve)
    grid_stress = getattr(environment_state, "grid_stress_pct", 65.0)
    water_reserve = getattr(environment_state, "water_reserve_pct", 85.0)
    utility_score = max(20.0, min(100.0, (100.0 - grid_stress * 0.5) + (water_reserve * 0.5)))

    # 3. Evacuation readiness & shelter capacity
    evacuation_score = 80.0

    # 4. Infrastructure condition & road redundancy
    road_redundancy_score = 75.0
    if hasattr(world, "road_graph") and world.road_graph:
        num_edges = world.road_graph.graph.number_of_edges()
        road_redundancy_score = min(100.0, 40.0 + (num_edges * 0.05))

    # 5. Flood exposure factor
    water_level = getattr(environment_state, "water_level", 0.0)
    flood_penalty = min(30.0, water_level * 15.0)

    # 6. Incident penalty
    incident_penalty = active_incidents_count * 8.0

    # Composite weighted index
    composite = (
        (emergency_coverage_score * 0.25) +
        (utility_score * 0.25) +
        (evacuation_score * 0.20) +
        (road_redundancy_score * 0.20) +
        (10.0)
    ) - flood_penalty - incident_penalty

    composite_score = round(max(15.0, min(100.0, composite)), 1)

    # District breakdowns
    district_scores = {}
    if hasattr(world, "districts"):
        for did, dist in world.districts.items():
            base_d = composite_score + ((getattr(dist, "development_level", 0.5) - 0.5) * 20.0)
            district_scores[did] = round(max(20.0, min(100.0, base_d)), 1)

    return {
        "index_name": "METACITY SIMULATION RESILIENCE INDEX",
        "city_score": composite_score,
        "rating": "EXCELLENT" if composite_score >= 80 else "GOOD" if composite_score >= 65 else "MODERATE" if composite_score >= 45 else "VULNERABLE",
        "breakdown": {
            "emergency_coverage": round(emergency_coverage_score, 1),
            "utility_redundancy": round(utility_score, 1),
            "evacuation_readiness": round(evacuation_score, 1),
            "road_redundancy": round(road_redundancy_score, 1),
            "flood_exposure_penalty": round(flood_penalty, 1),
            "active_incident_penalty": round(incident_penalty, 1)
        },
        "districts": district_scores
    }
