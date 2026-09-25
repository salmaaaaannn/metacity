"""
METACITY — What-If Branching Simulation Engine (Phase 5)
Executes isolated hypothetical interventions and compares Baseline vs Scenario deltas.
Does NOT mutate the live authoritative city state until explicitly applied.
"""
from typing import Dict, List, Any, Optional
import copy

class WhatIfEngine:
    def __init__(self, engine: Any):
        self.engine = engine

    def simulate_intervention(
        self,
        intervention_type: str,
        params: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        params = params or {}
        # 1. Capture current baseline state metrics
        base = self.engine.scenario_manager._compute_city_metrics()

        # 2. Simulate projected impact on metrics
        scen = copy.deepcopy(base)
        cost = 0.0
        maint = 0.0
        description = ""

        if intervention_type == "add_metro_station":
            cost = 1_500_000.0
            maint = 15_000.0
            description = "Construct new high-capacity Metro Station in dense corridor"
            scen["transit_ridership"] = int(base["transit_ridership"] * 1.35) + 3500
            reduction = 8.5 if base["traffic_congestion_pct"] > 10.0 else max(1.5, base["traffic_congestion_pct"] * 0.25)
            scen["traffic_congestion_pct"] = round(base["traffic_congestion_pct"] - reduction, 1)
            scen["modal_split"]["transit_pct"] = min(100.0, round(scen["modal_split"]["transit_pct"] + 7.5, 1))
            scen["modal_split"]["car_pct"] = max(5.0, round(scen["modal_split"]["car_pct"] - 6.0, 1))
            scen["average_satisfaction"] = min(100.0, round(scen["average_satisfaction"] + 4.5, 1))

        elif intervention_type == "add_bypass_arterial":
            cost = 1_200_000.0
            maint = 12_000.0
            description = "Construct 4-lane Arterial Bypass around congested sector"
            reduction = 11.0 if base["traffic_congestion_pct"] > 12.0 else max(2.0, base["traffic_congestion_pct"] * 0.3)
            scen["traffic_congestion_pct"] = round(base["traffic_congestion_pct"] - reduction, 1)
            scen["average_satisfaction"] = min(100.0, round(scen["average_satisfaction"] + 3.0, 1))

        elif intervention_type == "add_flood_barrier":
            cost = 850_000.0
            maint = 8_500.0
            description = "Install engineered riverbank flood barriers and storm pump stations"
            scen["average_satisfaction"] = min(100.0, round(scen["average_satisfaction"] + 5.0, 1))

        elif intervention_type == "build_hospital":
            cost = 1_800_000.0
            maint = 22_000.0
            description = "Construct Regional Medical Center serving underserved quadrant"
            scen["average_satisfaction"] = min(100.0, round(scen["average_satisfaction"] + 7.0, 1))

        elif intervention_type == "build_clean_power":
            cost = 2_200_000.0
            maint = 28_000.0
            description = "Construct Solar & Clean Energy Grid Battery storage facility"
            scen["average_satisfaction"] = min(100.0, round(scen["average_satisfaction"] + 4.0, 1))

        else:
            cost = 500_000.0
            maint = 5_000.0
            description = f"Generic simulated intervention: {intervention_type}"
            scen["average_satisfaction"] = min(100.0, round(scen["average_satisfaction"] + 2.0, 1))

        scen["budget_balance"] = round(scen["budget_balance"] - cost, 2)
        scen["monthly_net"] = round(scen.get("monthly_net", 250000.0) - maint, 2)

        # 3. Calculate deltas
        deltas = {
            "traffic_congestion_pct": round(scen["traffic_congestion_pct"] - base["traffic_congestion_pct"], 1),
            "transit_ridership": scen["transit_ridership"] - base["transit_ridership"],
            "transit_pct": round(scen["modal_split"]["transit_pct"] - base["modal_split"]["transit_pct"], 1),
            "car_pct": round(scen["modal_split"]["car_pct"] - base["modal_split"]["car_pct"], 1),
            "satisfaction_pct": round(scen["average_satisfaction"] - base["average_satisfaction"], 1),
            "budget_delta": round(-cost, 2),
            "monthly_maint_delta": round(-maint, 2)
        }

        return {
            "intervention": intervention_type,
            "description": description,
            "capital_cost": cost,
            "monthly_maintenance": maint,
            "baseline": base,
            "scenario": scen,
            "deltas": deltas
        }
