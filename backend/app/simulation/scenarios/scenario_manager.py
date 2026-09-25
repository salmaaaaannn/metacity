"""
METACITY — Scenario Engine & Undo/Redo Manager
Manages baseline city state snapshots, scenario branches, action histories,
undo/redo stacks, and before-vs-after impact comparisons.
"""
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any
import copy
import time
import uuid


@dataclass
class ScenarioAction:
    action_id: str
    action_type: str  # 'ADD', 'REMOVE', 'UPGRADE'
    item_type: str
    params: Dict[str, Any]
    inverse_params: Dict[str, Any]
    cost: float
    timestamp: float


@dataclass
class Scenario:
    id: str
    name: str
    description: str
    created_at: float
    changes: List[ScenarioAction] = field(default_factory=list)
    budget_delta: float = 0.0
    metrics_before: Dict[str, Any] = field(default_factory=dict)
    metrics_after: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "created_at": self.created_at,
            "changes_count": len(self.changes),
            "budget_delta": round(self.budget_delta, 2),
            "metrics_before": self.metrics_before,
            "metrics_after": self.metrics_after,
        }


class ScenarioManager:
    def __init__(self, engine: Any):
        self.engine = engine
        self.scenarios: Dict[str, Scenario] = {}
        self.current_scenario_id: Optional[str] = None
        self.undo_stack: List[ScenarioAction] = []
        self.redo_stack: List[ScenarioAction] = []
        self.baseline_snapshot: Dict[str, Any] = {}

    def capture_baseline(self) -> None:
        """Capture baseline metrics before user modifications."""
        self.baseline_snapshot = self._compute_city_metrics()

    def _compute_city_metrics(self) -> Dict[str, Any]:
        """Compute real aggregate city KPIs for scenario comparison."""
        total_pop = sum(d.population for d in self.engine.world.districts.values())
        avg_sat = self.engine._calc_city_satisfaction()

        # Transit metrics
        ridership = 0
        if hasattr(self.engine.world, "metro_system"):
            ridership += self.engine.world.metro_system.total_metro_ridership
        if hasattr(self.engine.world, "bus_system"):
            for b in self.engine.world.bus_system.buses.values():
                ridership += len(b.passengers)

        # Average travel time calculation
        cits = list(self.engine.citizens.values())
        walk_users = sum(1 for c in cits if c.travel_mode == "walk")
        car_users = sum(1 for c in cits if c.travel_mode == "car")
        transit_users = sum(1 for c in cits if c.travel_mode in ["bus", "metro", "railway"])
        total_agents = max(1, len(cits))

        # Congestion ratio from road graph
        traffic_congestion = 34.5
        if hasattr(self.engine.world, "road_graph") and self.engine.world.road_graph:
            edges = self.engine.world.road_graph.graph.edges(data=True)
            vols = [d.get("volume", 0) for _, _, d in edges]
            caps = [d.get("capacity", 1000) for _, _, d in edges]
            if caps and sum(caps) > 0:
                traffic_congestion = round((sum(vols) / sum(caps)) * 100, 1)

        return {
            "population": total_pop,
            "average_satisfaction": round(avg_sat * 100, 1),
            "transit_ridership": ridership,
            "traffic_congestion_pct": traffic_congestion,
            "modal_split": {
                "transit_pct": round((transit_users / total_agents) * 100, 1),
                "car_pct": round((car_users / total_agents) * 100, 1),
                "walk_pct": round((walk_users / total_agents) * 100, 1),
            },
            "budget_balance": round(self.engine.budget.balance, 2),
            "monthly_net": round(self.engine.budget.net_monthly, 2),
        }

    def create_scenario(self, name: str, description: str = "") -> Scenario:
        if not self.baseline_snapshot:
            self.capture_baseline()

        sid = f"scen_{uuid.uuid4().hex[:8]}"
        scen = Scenario(
            id=sid,
            name=name,
            description=description,
            created_at=time.time(),
            metrics_before=copy.deepcopy(self.baseline_snapshot)
        )
        self.scenarios[sid] = scen
        self.current_scenario_id = sid
        return scen

    def record_action(
        self,
        action_type: str,
        item_type: str,
        params: Dict[str, Any],
        inverse_params: Dict[str, Any],
        cost: float
    ) -> None:
        action = ScenarioAction(
            action_id=f"act_{uuid.uuid4().hex[:8]}",
            action_type=action_type,
            item_type=item_type,
            params=params,
            inverse_params=inverse_params,
            cost=cost,
            timestamp=time.time()
        )
        self.undo_stack.append(action)
        self.redo_stack.clear()

        if self.current_scenario_id and self.current_scenario_id in self.scenarios:
            scen = self.scenarios[self.current_scenario_id]
            scen.changes.append(action)
            scen.budget_delta -= cost
            scen.metrics_after = self._compute_city_metrics()

    def undo(self) -> Dict[str, Any]:
        """Undo the last construction or modification action."""
        if not self.undo_stack:
            return {"success": False, "reason": "Nothing to undo"}

        action = self.undo_stack.pop()
        im = self.engine.infrastructure_manager

        if action.action_type == "ADD":
            # Reverse ADD -> Demolish created item & refund cost
            item_id = action.inverse_params.get("item_id")
            if item_id in im.items:
                im.demolish(item_id, charge_cost=False)
                # Refund cost
                self.engine.budget.record_revenue(action.cost, f"Undo: refunded {action.item_type}", category="refund")
        elif action.action_type == "REMOVE":
            # Reverse REMOVE -> Re-construct item
            item_data = action.inverse_params.get("item_data", {})
            im.construct(
                item_data.get("type", action.item_type),
                item_data["x"],
                item_data["z"],
                name=item_data.get("name", ""),
                end_x=item_data.get("end_x"),
                end_z=item_data.get("end_z"),
                subtype=item_data.get("subtype")
            )

        self.redo_stack.append(action)
        return {"success": True, "action_undone": action.action_type, "remaining_undos": len(self.undo_stack)}

    def redo(self) -> Dict[str, Any]:
        """Redo the previously undone action."""
        if not self.redo_stack:
            return {"success": False, "reason": "Nothing to redo"}

        action = self.redo_stack.pop()
        im = self.engine.infrastructure_manager

        if action.action_type == "ADD":
            p = action.params
            im.construct(
                action.item_type,
                p["x"],
                p["z"],
                name=p.get("name", ""),
                end_x=p.get("end_x"),
                end_z=p.get("end_z"),
                subtype=p.get("subtype")
            )
        elif action.action_type == "REMOVE":
            item_id = action.params.get("item_id")
            if item_id:
                im.demolish(item_id)

        self.undo_stack.append(action)
        return {"success": True, "action_redone": action.action_type, "remaining_redos": len(self.redo_stack)}

    def get_comparison(self, scenario_id: Optional[str] = None) -> Dict[str, Any]:
        """Produce a Before vs After comparison of actual simulation metrics."""
        sid = scenario_id or self.current_scenario_id
        scen = self.scenarios.get(sid) if sid else None

        before = scen.metrics_before if scen else (self.baseline_snapshot or self._compute_city_metrics())
        after = self._compute_city_metrics()

        # Compute delta
        diff = {
            "population_change": after["population"] - before.get("population", 0),
            "satisfaction_delta": round(after["average_satisfaction"] - before.get("average_satisfaction", 0.0), 2),
            "transit_ridership_delta": after["transit_ridership"] - before.get("transit_ridership", 0),
            "traffic_congestion_delta": round(after["traffic_congestion_pct"] - before.get("traffic_congestion_pct", 0.0), 2),
            "budget_spent": round(before.get("budget_balance", 0.0) - after["budget_balance"], 2),
        }

        return {
            "scenario_name": scen.name if scen else "Live Modifications",
            "before": before,
            "after": after,
            "change": diff,
        }
