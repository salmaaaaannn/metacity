"""
METACITY — Phase 3 Infrastructure & Autonomous Response Test Suite
Tests placement validation, dynamic road/bridge/metro construction, demolition,
budget deductions, transaction ledgers, spatial citizen adaptation, scenarios, and undo/redo.
"""
import pytest
from app.simulation.engine import SimulationEngine
from app.config.settings import Settings
from app.simulation.infrastructure.infrastructure_manager import InfrastructureManager
from app.simulation.infrastructure.event_dispatcher import EventDispatcher
from app.simulation.scenarios.scenario_manager import ScenarioManager


@pytest.fixture
def engine():
    settings = Settings(SIMULATION_ACTIVE_CITIZENS=100)
    return SimulationEngine(settings)


def test_infrastructure_validation_success(engine):
    """Test valid coordinate, zoning, and budget checks."""
    im = engine.infrastructure_manager
    res = im.validate_placement("hospital", 3500.0, 3500.0)
    assert res["valid"] is True
    assert res["construction_cost"] == 3_500_000.0
    assert res["monthly_maintenance"] == 180_000.0
    assert res["population_served"] > 0
    assert "expected_impact" in res


def test_infrastructure_validation_insufficient_budget(engine):
    """Test validation rejection when budget is insufficient."""
    im = engine.infrastructure_manager
    engine.budget.balance = 50_000.0  # Drain balance
    res = im.validate_placement("hospital", 3500.0, 3500.0)
    assert res["valid"] is False
    assert "budget" in res["reason"].lower()
    assert res["required"] == 3_500_000.0


def test_infrastructure_validation_out_of_bounds(engine):
    """Test validation rejection for coordinates beyond 8000m."""
    im = engine.infrastructure_manager
    res = im.validate_placement("park", 9500.0, 4000.0)
    assert res["valid"] is False
    assert "boundary" in res["reason"].lower()


def test_river_crossing_validation(engine):
    """Test that building normal road across the river is rejected, but bridge is accepted."""
    im = engine.infrastructure_manager
    # River zone: x ~ 5000, z=6000
    res_road = im.validate_placement("road", 4800.0, 6000.0, end_x=5200.0, end_z=6000.0)
    assert res_road["valid"] is False
    assert "bridge" in res_road["reason"].lower()

    # Bridge tool is accepted
    res_bridge = im.validate_placement("bridge", 4800.0, 6000.0, end_x=5200.0, end_z=6000.0)
    assert res_bridge["valid"] is True


def test_road_construction_and_graph_update(engine):
    """Test constructing an arterial connects nodes in RoadGraph and enables A* routing."""
    im = engine.infrastructure_manager
    rg = engine.world.road_graph

    res = im.construct("arterial", 2000.0, 2000.0, name="Arterial Test Link", end_x=2400.0, end_z=2000.0)
    assert res["valid"] is True
    item = res["item"]
    assert item["type"] == "arterial"

    # Verify road graph has edges
    n1 = f"n_2000_2000"
    n2 = f"n_2400_2000"
    assert rg.graph.has_edge(n1, n2)
    assert rg.graph.has_edge(n2, n1)

    # Verify pathfinding across the new segment
    path = rg.find_path(2000.0, 2000.0, 2400.0, 2000.0)
    assert len(path) >= 2


def test_road_demolition_and_graph_removal(engine):
    """Test demolishing a road segment removes edges from RoadGraph."""
    im = engine.infrastructure_manager
    rg = engine.world.road_graph

    # Build road first
    build_res = im.construct("road", 3000.0, 1000.0, end_x=3400.0, end_z=1000.0)
    item_id = build_res["item"]["id"]
    n1 = "n_3000_1000"
    n2 = "n_3400_1000"
    assert rg.graph.has_edge(n1, n2)

    # Demolish road
    dem_res = im.demolish(item_id)
    assert dem_res["success"] is True
    assert not rg.graph.has_edge(n1, n2)


def test_highway_construction(engine):
    """Test highway creation with 6 lanes and 110 km/h speed limit."""
    im = engine.infrastructure_manager
    res = im.construct("highway", 1000.0, 1000.0, end_x=1800.0, end_z=1000.0)
    assert res["valid"] is True
    rg = engine.world.road_graph
    edge_data = rg.graph["n_1000_1000"]["n_1800_1000"]
    assert edge_data["road_type"] == "highway"
    assert edge_data["speed_limit"] == 110


def test_bridge_construction_across_river(engine):
    """Test bridge construction across river zone and connection to network."""
    im = engine.infrastructure_manager
    res = im.construct("bridge", 4800.0, 6200.0, end_x=5200.0, end_z=6200.0, name="Harbor Bridge")
    assert res["valid"] is True
    assert res["item"]["type"] == "bridge"


def test_metro_station_construction_and_registration(engine):
    """Test metro station construction registers with transit system."""
    im = engine.infrastructure_manager
    res = im.construct("metro_station", 3600.0, 3600.0, name="Civic Metro Station")
    assert res["valid"] is True
    sid = res["item"]["id"]
    assert sid in engine.world.metro_system.station_queues


def test_bus_stop_creation(engine):
    """Test bus stop creation attaches to bus network."""
    im = engine.infrastructure_manager
    res = im.construct("bus_stop", 4100.0, 4100.0, name="Commerce Bus Stop")
    assert res["valid"] is True
    sid = res["item"]["id"]
    assert sid in engine.world.bus_system.stops


def test_hospital_construction_and_service_radius(engine):
    """Test hospital construction with service radius of 2200m."""
    im = engine.infrastructure_manager
    res = im.construct("hospital", 2500.0, 3000.0, name="Mercy General")
    assert res["valid"] is True
    assert res["item"]["service_radius"] == 2200.0


def test_school_construction(engine):
    """Test school placement with 900 capacity."""
    im = engine.infrastructure_manager
    res = im.construct("school", 2200.0, 2800.0, name="Oakwood Academy")
    assert res["valid"] is True
    assert res["item"]["capacity"] == 900


def test_budget_deduction_and_transaction_ledger(engine):
    """Test construction immediately deducts budget and logs a ledger transaction."""
    init_balance = engine.budget.balance
    im = engine.infrastructure_manager
    im.construct("park", 4000.0, 4000.0, name="Central Green")

    expected_cost = 350_000.0
    assert engine.budget.balance == init_balance - expected_cost
    assert len(engine.budget.transactions) >= 1
    last_tx = engine.budget.transactions[-1]
    assert last_tx.amount == -expected_cost
    assert last_tx.category == "construction"


def test_dynamic_maintenance_growth(engine):
    """Test that constructing new infrastructure increases recurring monthly expenses."""
    init_expenses = engine.budget.calculate_expenses(engine.world).total
    im = engine.infrastructure_manager
    im.construct("hospital", 3000.0, 3000.0)  # +180,000 monthly maintenance

    new_expenses = engine.budget.calculate_expenses(engine.world).total
    assert new_expenses > init_expenses
    assert new_expenses == init_expenses + 180_000.0


def test_infrastructure_upgrade(engine):
    """Test upgrading infrastructure increases capacity and upgrade level."""
    im = engine.infrastructure_manager
    build_res = im.construct("hospital", 3000.0, 3000.0)
    item_id = build_res["item"]["id"]
    init_cap = build_res["item"]["capacity"]

    up_res = im.upgrade(item_id)
    assert up_res["success"] is True
    assert up_res["item"]["upgrade_level"] == 2
    assert up_res["item"]["capacity"] == int(init_cap * 1.5)


def test_citizen_spatial_event_reaction(engine):
    """Test that opening a metro station causes nearby citizens to re-evaluate and switch to metro."""
    im = engine.infrastructure_manager

    # Place a citizen close to target location with 'car' mode
    cit = list(engine.citizens.values())[0]
    cit.current_x = 3500.0
    cit.current_z = 3500.0
    cit.travel_mode = "car"

    im.construct("metro_station", 3550.0, 3550.0, name="Transit Plaza")
    # Spatial filter (within 1200m) should have updated citizen
    assert cit.travel_mode == "metro"
    assert "rapid access" in cit.decision_reason


def test_business_capacity_boost_near_station(engine):
    """Test that opening a transit station boosts nearby commercial capacity."""
    im = engine.infrastructure_manager
    biz = list(engine.world.business_manager.businesses.values())[0]
    init_cap = biz.capacity

    # Build metro station right next to business
    im.construct("metro_station", biz.x + 20.0, biz.z + 20.0, name="Market Station")
    assert biz.capacity > init_cap


def test_scenario_creation_and_baseline_capture(engine):
    """Test scenario creation captures baseline metrics."""
    sm = engine.scenario_manager
    scen = sm.create_scenario("Green Transit Corridors", "Expanding metro and bus coverage")
    assert scen.name == "Green Transit Corridors"
    assert "population" in scen.metrics_before
    assert "budget_balance" in scen.metrics_before


def test_scenario_undo_action(engine):
    """Test undoing an infrastructure construction reverts network and refunds budget."""
    sm = engine.scenario_manager
    im = engine.infrastructure_manager
    init_balance = engine.budget.balance

    build_res = im.construct("park", 2000.0, 2000.0)
    item_id = build_res["item"]["id"]
    sm.record_action(
        "ADD", "park",
        {"x": 2000.0, "z": 2000.0},
        {"item_id": item_id},
        cost=350_000.0
    )
    assert item_id in im.items

    undo_res = sm.undo()
    assert undo_res["success"] is True
    assert item_id not in im.items
    assert engine.budget.balance == init_balance


def test_scenario_redo_action(engine):
    """Test redoing an action re-applies construction."""
    sm = engine.scenario_manager
    im = engine.infrastructure_manager

    build_res = im.construct("school", 2500.0, 2500.0)
    item_id = build_res["item"]["id"]
    sm.record_action(
        "ADD", "school",
        {"x": 2500.0, "z": 2500.0},
        {"item_id": item_id},
        cost=1_200_000.0
    )

    sm.undo()
    redo_res = sm.redo()
    assert redo_res["success"] is True


def test_before_after_comparison_metrics(engine):
    """Test before-vs-after comparison computes simulation deltas."""
    sm = engine.scenario_manager
    sm.create_scenario("Test Scenario")
    comp = sm.get_comparison()
    assert "before" in comp
    assert "after" in comp
    assert "change" in comp
    assert "traffic_congestion_delta" in comp["change"]
    assert "transit_ridership_delta" in comp["change"]
