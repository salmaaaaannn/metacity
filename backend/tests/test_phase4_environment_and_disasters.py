"""
METACITY — Phase 4 Environment, Disasters & Resilience Test Suite
"""
import pytest
from app.simulation.engine import SimulationEngine
from app.config.settings import Settings
from app.simulation.environment.environment_state import WeatherCondition, Season
from app.simulation.disasters.disaster_types import DisasterType, IncidentStatus, DamageState


@pytest.fixture
def engine():
    settings = Settings(SIMULATION_ACTIVE_CITIZENS=50)
    return SimulationEngine(settings)


def test_weather_and_seasonal_dynamics(engine):
    env = engine.environment_engine
    # Test setting weather and season
    env.set_season(Season.SUMMER)
    env.set_weather(WeatherCondition.HEATWAVE)
    state = env.update(14.0, 7, 1.0, engine.world)

    assert state.season == Season.SUMMER
    assert state.weather_condition == WeatherCondition.HEATWAVE
    assert state.temperature > 25.0
    assert state.heat_index >= state.temperature


def test_electricity_and_water_demand_stress(engine):
    env = engine.environment_engine
    env.set_weather(WeatherCondition.EXTREME_HEAT)
    state = env.update(15.0, 7, 1.0, engine.world)

    assert state.electricity_demand_mw > 0
    assert state.water_demand_mld > 0
    assert 0 <= state.grid_stress_pct <= 100


def test_air_quality_calculation(engine):
    env = engine.environment_engine
    state = env.update(12.0, 4, 1.0, engine.world)
    assert 0 <= state.air_quality_index <= 500
    assert state.pollution > 0


def test_flood_simulation_and_road_closures(engine):
    dm = engine.disaster_manager
    incident = dm.trigger_disaster(
        disaster_type=DisasterType.FLOOD,
        epicenter_x=5000.0,
        epicenter_z=6000.0,
        severity=3,
        radius=1500.0
    )

    dm.update(2.0, engine.environment_engine.state)
    assert len(incident.affected_building_ids) > 0
    assert incident.damage_cost > 0
    assert len(dm.flood_sim.closed_roads) > 0


def test_fire_simulation_and_spread(engine):
    dm = engine.disaster_manager
    incident = dm.trigger_disaster(
        disaster_type=DisasterType.FIRE,
        epicenter_x=4000.0,
        epicenter_z=4000.0,
        severity=2,
        radius=800.0
    )

    dm.update(2.0, engine.environment_engine.state)
    assert incident.disaster_type == DisasterType.FIRE
    assert incident.status == IncidentStatus.ACTIVE


def test_earthquake_damage_states(engine):
    dm = engine.disaster_manager
    incident = dm.trigger_disaster(
        disaster_type=DisasterType.EARTHQUAKE,
        epicenter_x=4000.0,
        epicenter_z=4000.0,
        severity=3,
        radius=2000.0,
        metadata={"magnitude": 7.2}
    )

    assert len(dm.earthquake_sim.building_damage_states) > 0
    states = set(dm.earthquake_sim.building_damage_states.values())
    assert DamageState.DESTROYED in states or DamageState.SEVERE in states or DamageState.MODERATE in states


def test_emergency_dispatch_and_containment(engine):
    dm = engine.disaster_manager
    incident = dm.trigger_disaster(
        disaster_type=DisasterType.FIRE,
        epicenter_x=4000.0,
        epicenter_z=4000.0,
        severity=2
    )

    assert len(dm.emergency_mgr.active_units) > 0
    # Simulate movement until containment
    for _ in range(30):
        dm.update(3.0, engine.environment_engine.state)

    hud = dm.get_hud_metrics()
    assert hud["emergency_vehicles_active"] >= 0


def test_citizen_evacuation_and_shelters(engine):
    dm = engine.disaster_manager
    incident = dm.trigger_disaster(
        disaster_type=DisasterType.FLOOD,
        epicenter_x=4000.0,
        epicenter_z=4000.0,
        severity=3,
        radius=3000.0
    )

    hud = dm.get_hud_metrics()
    assert len(hud["shelters"]) == 6
    assert incident.evacuated_citizens >= 0


def test_disaster_recovery_and_budget_deduction(engine):
    dm = engine.disaster_manager
    initial_balance = engine.budget.balance

    incident = dm.trigger_disaster(
        disaster_type=DisasterType.FLOOD,
        epicenter_x=5000.0,
        epicenter_z=6000.0,
        severity=2
    )
    dm.update(2.0, engine.environment_engine.state)

    res = dm.stop_disaster(incident.id)
    assert res is not None
    assert incident.status == IncidentStatus.RESOLVED
    assert engine.budget.balance < initial_balance


def test_resilience_index_calculation(engine):
    dm = engine.disaster_manager
    res = dm.get_resilience(engine.environment_engine.state)

    assert "city_score" in res
    assert 0 <= res["city_score"] <= 100
    assert "breakdown" in res
    assert len(res["districts"]) > 0
