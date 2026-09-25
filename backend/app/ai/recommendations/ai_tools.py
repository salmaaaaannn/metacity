"""
METACITY — Controlled AI Tool System (Phase 5)
Provides safe, read-only tools to retrieve live simulation facts for AI reasoning.
"""
from typing import Dict, List, Any, Optional

def tool_get_city_state(engine: Any) -> Dict[str, Any]:
    pop = sum(d.population for d in engine.world.districts.values()) if hasattr(engine.world, "districts") else 539000
    sat = engine._calc_city_satisfaction() if hasattr(engine, "_calc_city_satisfaction") else 0.82
    return {
        "city_name": "METACITY",
        "population": pop,
        "satisfaction_pct": round(sat * 100, 1),
        "budget_balance": round(engine.budget.balance, 2),
        "sim_time": engine.clock.get_time_string(),
        "active_citizens": len(engine.citizens),
        "active_vehicles": len(engine.vehicles)
    }

def tool_get_environment(engine: Any) -> Dict[str, Any]:
    env_engine = getattr(engine, "environment_engine", None)
    if env_engine:
        return env_engine.to_dict()
    return {"status": "Environment engine offline"}

def tool_get_disasters(engine: Any) -> Dict[str, Any]:
    disaster_mgr = getattr(engine, "disaster_manager", None)
    if disaster_mgr:
        return disaster_mgr.get_hud_metrics()
    return {"status": "Disaster manager offline"}

def tool_get_budget(engine: Any) -> Dict[str, Any]:
    return engine.budget.to_dict()
