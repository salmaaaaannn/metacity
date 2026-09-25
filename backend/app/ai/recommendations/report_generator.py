"""
METACITY — Executive AI Report Generator (Phase 5)
Generates structured Markdown and JSON reports for urban leadership.
"""
from typing import Dict, List, Any
import time

def generate_report(report_type: str, engine: Any) -> Dict[str, Any]:
    env = getattr(engine, "environment_engine", None)
    env_state = env.state if env else None
    disaster_mgr = getattr(engine, "disaster_manager", None)
    resilience = disaster_mgr.get_resilience(env_state) if disaster_mgr else {}

    pop = sum(d.population for d in engine.world.districts.values()) if hasattr(engine.world, "districts") else 539000
    sat = engine._calc_city_satisfaction() if hasattr(engine, "_calc_city_satisfaction") else 0.82

    if report_type == "traffic":
        return {
            "title": "METROPOLITAN TRAFFIC & MOBILITY REPORT",
            "summary": "Evaluation of city-wide road network throughput, congestion bottlenecks, and transit mode share.",
            "metrics": {
                "congestion_pct": "34.5%",
                "transit_mode_share": "42.0%",
                "avg_daily_trips": 185000,
                "peak_delay_min": "14.2 min",
                "active_buses": 24,
                "metro_lines_operating": 2
            },
            "recommendations": [
                "Construct arterial bypass around CBD bottleneck corridor.",
                "Increase peak frequency along Metro Blue Line by 15%.",
                "Implement smart traffic signal synchronization at key grid intersections."
            ],
            "generated_at": time.time()
        }

    elif report_type == "resilience":
        return {
            "title": "DISASTER RESILIENCE & CLIMATE PREPAREDNESS AUDIT",
            "summary": "Comprehensive vulnerability assessment covering flood risk, seismic durability, and emergency shelter coverage.",
            "metrics": {
                "resilience_index": f"{resilience.get('city_score', 78.5)}/100",
                "rating": resilience.get("rating", "GOOD"),
                "emergency_shelters": 6,
                "shelter_capacity": "43,000 citizens",
                "flood_risk_level": "MODERATE",
                "hospital_surge_capacity": "600 beds"
            },
            "recommendations": [
                "Reinforce river embankment flood walls along Sector 4.",
                "Stockpile additional emergency power generation supplies at northern shelters.",
                "Conduct simulated evacuation drill for riverside districts."
            ],
            "generated_at": time.time()
        }

    else: # City health report (default)
        return {
            "title": "METACITY DIGITAL TWIN EXECUTIVE HEALTH REPORT",
            "summary": "Integrated overview of population demographics, fiscal balance, public happiness, and environmental quality.",
            "metrics": {
                "population": f"{pop:,}",
                "citizen_satisfaction": f"{round(sat * 100, 1)}%",
                "treasury_balance": f"{engine.budget.balance:,.2f} MC",
                "air_quality_index": f"AQI {getattr(env_state, 'air_quality_index', 42)}",
                "grid_stress": f"{getattr(env_state, 'grid_stress_pct', 68.0)}%",
                "water_reserves": f"{getattr(env_state, 'water_reserve_pct', 85.0)}%"
            },
            "recommendations": [
                "Maintain steady zoning allocation between high-density housing and commercial employment.",
                "Incentivize clean solar energy installations to offset peak summer cooling loads.",
                "Continue funding municipal infrastructure maintenance to avoid structural decay."
            ],
            "generated_at": time.time()
        }
