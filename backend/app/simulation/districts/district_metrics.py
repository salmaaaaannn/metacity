"""
METACITY — District Metrics Calculator
Computes live aggregate performance indices, modal splits, traffic levels,
and commercial activity for every district.
"""
from typing import Dict, List, Any


def calculate_district_metrics(
    district_id: str,
    district_obj: Any,
    citizens: List[Any],
    businesses: List[Any],
    road_graph: Any,
) -> dict:
    """Calculate live metrics for District Inspector."""
    # Filter citizens currently in or residing in this district
    district_citizens = [c for c in citizens if c.district_id == district_id]
    count = len(district_citizens)

    if count > 0:
        avg_satisfaction = sum(c.satisfaction for c in district_citizens) / count
        avg_stress = sum(c.stress for c in district_citizens) / count
        # Transit usage
        transit_users = sum(1 for c in district_citizens if c.travel_mode in ["bus", "metro", "railway"])
        car_users = sum(1 for c in district_citizens if c.travel_mode == "car")
        pedestrians = sum(1 for c in district_citizens if c.travel_mode == "walk")
        transit_share = transit_users / count
        car_share = car_users / count
        walk_share = pedestrians / count
    else:
        avg_satisfaction = 0.8
        avg_stress = 0.2
        transit_share = 0.4
        car_share = 0.3
        walk_share = 0.3

    # Business footfall in this district
    dist_biz = [b for b in businesses if b.district_id == district_id]
    total_customers = sum(len(b.customers) for b in dist_biz)
    total_employees = sum(len(b.employees) for b in dist_biz)
    biz_revenue = sum(b.daily_revenue for b in dist_biz)

    # Traffic index from road volume / capacity in bounds
    x_min, z_min, x_max, z_max = district_obj.bounds
    volumes = []
    capacities = []
    if road_graph and hasattr(road_graph, "graph"):
        for u, v, d in road_graph.graph.edges(data=True):
            pos_u = road_graph.graph.nodes[u].get("pos")
            if pos_u and x_min <= pos_u[0] <= x_max and z_min <= pos_u[1] <= z_max:
                volumes.append(d.get("volume", 0))
                capacities.append(d.get("capacity", 1000))

    if volumes and sum(capacities) > 0:
        traffic_ratio = min(1.0, sum(volumes) / sum(capacities))
    else:
        traffic_ratio = min(0.9, district_obj.development_level * 0.75)

    return {
        "id": district_id,
        "name": district_obj.name,
        "type": district_obj.type,
        "development_level": round(district_obj.development_level, 2),
        "statistical_population": district_obj.population,
        "active_simulated_citizens": count,
        "satisfaction_index": round(avg_satisfaction * 100, 1),
        "stress_index": round(avg_stress * 100, 1),
        "traffic_congestion_index": round(traffic_ratio * 100, 1),
        "transit_modal_split": {
            "public_transit_pct": round(transit_share * 100, 1),
            "car_pct": round(car_share * 100, 1),
            "walk_pct": round(walk_share * 100, 1),
        },
        "economic_activity": {
            "active_businesses": len(dist_biz),
            "employed_workers": total_employees,
            "active_shoppers_diners": total_customers,
            "daily_revenue": round(biz_revenue, 2),
        },
        "services": {
            "education_access": round(district_obj.education_access * 100, 1),
            "healthcare_access": round(district_obj.healthcare_access * 100, 1),
            "transport_access": round(district_obj.transport_access * 100, 1),
            "safety": round(district_obj.safety * 100, 1),
            "environment_quality": round(district_obj.environment_quality * 100, 1),
        },
        "housing_capacity": district_obj.housing_capacity,
        "employment_capacity": district_obj.employment_capacity,
        "color": district_obj.color,
    }
