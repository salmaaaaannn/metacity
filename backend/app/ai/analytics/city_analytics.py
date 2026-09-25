"""
METACITY — City Analytics Engine & Historical Metric Snapshots (Phase 5)
Maintains continuous time-series snapshots for trend analysis and predictive forecasting.
"""
from dataclasses import dataclass, asdict
from typing import Dict, List, Any, Optional
import time

@dataclass
class MetricSnapshot:
    timestamp: float
    tick: int
    sim_time: str
    population: int
    traffic_congestion_pct: float
    avg_travel_time_min: float
    transit_ridership: int
    budget_balance: float
    monthly_net: float
    electricity_demand_mw: float
    water_demand_mld: float
    air_quality_index: int
    satisfaction_pct: float
    active_incidents_count: int
    resilience_score: float

class CityAnalyticsEngine:
    def __init__(self, max_history: int = 500):
        self.max_history = max_history
        self.snapshots: List[MetricSnapshot] = []

    def record_snapshot(self, engine: Any) -> MetricSnapshot:
        world = engine.world
        env_state = getattr(engine, "environment_engine", None)
        env = env_state.state if env_state else None
        disaster_mgr = getattr(engine, "disaster_manager", None)

        pop = sum(d.population for d in world.districts.values()) if hasattr(world, "districts") else 539000
        sat = engine._calc_city_satisfaction() if hasattr(engine, "_calc_city_satisfaction") else 0.82

        # Congestion calculation
        congestion = 32.5
        if hasattr(world, "road_graph") and world.road_graph:
            edges = world.road_graph.graph.edges(data=True)
            vols = [d.get("volume", 0) for _, _, d in edges]
            caps = [d.get("capacity", 1000) for _, _, d in edges]
            if caps and sum(caps) > 0:
                congestion = round((sum(vols) / sum(caps)) * 100, 1)

        # Transit ridership
        ridership = 0
        if hasattr(world, "metro_system"):
            ridership += getattr(world.metro_system, "total_metro_ridership", 0)
        if hasattr(world, "bus_system"):
            for b in world.bus_system.buses.values():
                ridership += len(b.passengers)

        active_inc = len(disaster_mgr.incidents) if disaster_mgr else 0
        resilience = 78.5
        if disaster_mgr:
            res_data = disaster_mgr.get_resilience(env)
            resilience = res_data.get("city_score", 78.5)

        snap = MetricSnapshot(
            timestamp=time.time(),
            tick=engine.clock.tick,
            sim_time=engine.clock.get_time_string(),
            population=pop,
            traffic_congestion_pct=congestion,
            avg_travel_time_min=round(18.5 + (congestion * 0.15), 1),
            transit_ridership=ridership,
            budget_balance=round(engine.budget.balance, 2),
            monthly_net=round(getattr(engine.budget, "net_monthly", 250000.0), 2),
            electricity_demand_mw=getattr(env, "electricity_demand_mw", 1450.0),
            water_demand_mld=getattr(env, "water_demand_mld", 380.0),
            air_quality_index=getattr(env, "air_quality_index", 45),
            satisfaction_pct=round(sat * 100, 1),
            active_incidents_count=active_inc,
            resilience_score=resilience
        )

        self.snapshots.append(snap)
        if len(self.snapshots) > self.max_history:
            self.snapshots.pop(0)

        return snap

    def get_history(self, limit: int = 50) -> List[Dict[str, Any]]:
        return [asdict(s) for s in self.snapshots[-limit:]]
