"""
METACITY — AI Autonomous City Planner & Multi-Criteria Optimizer (Phase 5)
Generates, simulates, and ranks candidate urban interventions based on objective weights.
"""
from typing import Dict, List, Any, Optional
import uuid
from app.ai.scenarios.what_if_engine import WhatIfEngine

class AIPlanner:
    def __init__(self, what_if_engine: WhatIfEngine):
        self.what_if_engine = what_if_engine

    def generate_plan_candidates(
        self,
        goal: str,
        weights: Optional[Dict[str, float]] = None
    ) -> List[Dict[str, Any]]:
        weights = weights or {
            "travel_time_weight": 0.25,
            "cost_weight": 0.25,
            "pollution_weight": 0.15,
            "resilience_weight": 0.15,
            "satisfaction_weight": 0.20
        }

        # Catalog of candidate interventions per objective
        goal_lower = goal.lower()
        if "flood" in goal_lower or "disaster" in goal_lower or "resilience" in goal_lower:
            interventions = [
                ("add_flood_barrier", "Construct Riverfront Flood Embankment & Storm Pump Station"),
                ("build_hospital", "Build Emergency Response Medical Hub in Flood-Vulnerable Sector"),
                ("add_bypass_arterial", "Build Elevated Emergency Evacuation Corridor"),
            ]
        elif "transit" in goal_lower or "bus" in goal_lower or "metro" in goal_lower:
            interventions = [
                ("add_metro_station", "Construct High-Capacity Metro Station & Transit Interchange"),
                ("add_bypass_arterial", "Construct Dedicated Bus Rapid Transit (BRT) Lane Network"),
                ("build_clean_power", "Install Metro Traction Power Battery Backup Substation"),
            ]
        else: # Default: Congestion / Mobility / City growth
            interventions = [
                ("add_metro_station", "Add Rapid Transit Metro Station in Central Corridor"),
                ("add_bypass_arterial", "Construct 4-lane Ring Road Arterial Bypass"),
                ("add_flood_barrier", "Construct Green Buffer Park & Flood Runoff Corridor"),
                ("build_hospital", "Construct Comprehensive Health Center to reduce cross-city trips"),
            ]

        candidates = []
        for i, (itype, title) in enumerate(interventions):
            sim_res = self.what_if_engine.simulate_intervention(itype)
            deltas = sim_res["deltas"]
            cost = sim_res["capital_cost"]

            # Multi-criteria utility score (0-100)
            traffic_gain = max(0.0, -deltas["traffic_congestion_pct"]) * 2.0
            sat_gain = max(0.0, deltas["satisfaction_pct"]) * 3.5
            cost_penalty = min(30.0, (cost / 2_000_000.0) * 20.0)

            score = (
                (traffic_gain * weights.get("travel_time_weight", 0.25)) +
                (sat_gain * weights.get("satisfaction_weight", 0.20)) +
                (50.0 - (cost_penalty * weights.get("cost_weight", 0.25)))
            )
            score = round(max(10.0, min(99.0, score)), 1)

            candidates.append({
                "candidate_id": f"plan_{uuid.uuid4().hex[:6]}",
                "title": title,
                "intervention_type": itype,
                "capital_cost_mc": cost,
                "monthly_maintenance_mc": sim_res["monthly_maintenance"],
                "score": score,
                "simulated_deltas": deltas,
                "evidence": {
                    "congestion_change": f"{deltas['traffic_congestion_pct']}%",
                    "transit_ridership_delta": f"+{deltas['transit_ridership']} daily riders",
                    "satisfaction_delta": f"+{deltas['satisfaction_pct']}%",
                    "budget_impact": f"-${int(cost):,} MC"
                },
                "assumptions": [
                    "Citizen transport mode chooser reacts to new service radius within 48h",
                    "Network routing recalculates travel times using BPR volume-delay curves",
                    "Construction executes with zero disruption to adjacent road links"
                ],
                "risks": [
                    "High upfront capital outlay" if cost > 1_000_000 else "Minimal fiscal risk",
                    "Requires long-term municipal maintenance commitment"
                ]
            })

        # Sort candidates descending by score
        candidates.sort(key=lambda c: c["score"], reverse=True)
        return candidates
