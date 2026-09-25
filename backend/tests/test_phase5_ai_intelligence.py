"""
METACITY — Phase 5 AI Intelligence, Analytics & What-If Planner Test Suite
"""
import pytest
from app.simulation.engine import SimulationEngine
from app.config.settings import Settings
from app.ai.llm.llm_provider import LLMProvider
from app.ai.recommendations.report_generator import generate_report


@pytest.fixture
def engine():
    settings = Settings(SIMULATION_ACTIVE_CITIZENS=50)
    return SimulationEngine(settings)


def test_city_analytics_snapshot_recording(engine):
    analytics = engine.analytics_engine
    snap = analytics.record_snapshot(engine)

    assert snap.population > 0
    assert snap.budget_balance > 0
    assert len(analytics.get_history()) == 1


def test_predictive_forecasting(engine):
    analytics = engine.analytics_engine
    for _ in range(6):
        analytics.record_snapshot(engine)

    forecaster = engine.forecasting_engine
    history = analytics.get_history(50)
    forecasts = forecaster.generate_all_forecasts(history)

    assert "traffic_congestion" in forecasts
    assert "electricity_demand" in forecasts
    assert "confidence_interval" in forecasts["traffic_congestion"]
    assert len(forecasts["traffic_congestion"]["confidence_interval"]) == 2


def test_what_if_engine_isolation(engine):
    initial_balance = engine.budget.balance
    what_if = engine.what_if_engine

    res = what_if.simulate_intervention("add_metro_station")

    # Authoritative balance must NOT have changed
    assert engine.budget.balance == initial_balance
    assert res["capital_cost"] == 1_500_000.0
    assert res["deltas"]["traffic_congestion_pct"] < 0
    assert res["deltas"]["transit_ridership"] > 0


def test_ai_planner_candidate_generation_and_ranking(engine):
    planner = engine.ai_planner
    candidates = planner.generate_plan_candidates("Reduce CBD congestion")

    assert len(candidates) >= 3
    # Check sorted by score descending
    scores = [c["score"] for c in candidates]
    assert scores == sorted(scores, reverse=True)
    for c in candidates:
        assert "evidence" in c
        assert "assumptions" in c


def test_llm_provider_grounded_queries(engine):
    provider = LLMProvider()
    res = provider.answer_query("Why is traffic high in CBD?", engine)

    assert "answer" in res
    assert "evidence" in res
    assert "traffic" in res["answer"].lower() or "congestion" in res["answer"].lower()


def test_ai_report_generation(engine):
    report_health = generate_report("health", engine)
    report_traffic = generate_report("traffic", engine)
    report_resilience = generate_report("resilience", engine)

    assert "title" in report_health
    assert "recommendations" in report_health
    assert len(report_traffic["recommendations"]) > 0
    assert "resilience_index" in report_resilience["metrics"]
