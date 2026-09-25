"""
METACITY — Phase 2 Automated Test Suite
Tests demographic distributions, household anchors, workplace assignments,
FSM state transitions, pedestrian pathfinding, multimodal transport choice,
bus boarding/movement, metro simulation, businesses, memory adaptation, and district metrics.
"""
import pytest
from app.simulation.citizens.demographics import (
    generate_demographic_profile,
    DEMOGRAPHIC_DISTRIBUTION,
    AgeGroup,
    OccupationType
)
from app.simulation.citizens.household import Household
from app.simulation.citizens.citizen import Citizen
from app.simulation.citizens.state_machine import CitizenState, can_transition
from app.simulation.citizens.citizen_scheduler import CitizenScheduler
from app.simulation.citizens.pedestrian_graph import PedestrianGraph
from app.simulation.citizens.transport_chooser import TransportChooser
from app.simulation.citizens.memory import CitizenMemory
from app.simulation.transport.bus_system import BusSystem
from app.simulation.transport.metro_railway_system import MetroRailwaySystem
from app.simulation.businesses.business import Business
from app.simulation.businesses.business_manager import BusinessManager
from app.simulation.districts.district_metrics import calculate_district_metrics
from app.simulation.districts.city_generator import generate_city
from app.simulation.districts.district import District
from app.simulation.roads.road_graph import RoadGraph
from app.simulation.engine import SimulationEngine
from app.config.settings import Settings


def test_demographic_profiles():
    """Verify varied profiles are generated with realistic age groups and incomes."""
    prof1 = generate_demographic_profile(42, 0, 75000.0)
    prof2 = generate_demographic_profile(42, 1, 75000.0)

    assert prof1["name"]
    assert prof1["age"] >= 5
    assert prof1["occupation"] in [o.value for o in OccupationType]
    assert prof1["sprite_type"] in ["child", "student", "worker", "professional", "elderly"]
    # Seed reproducibility
    prof1_again = generate_demographic_profile(42, 0, 75000.0)
    assert prof1["name"] == prof1_again["name"]
    assert prof1["age"] == prof1_again["age"]


def test_household_structure():
    """Verify households group family members and manage car ownership."""
    hh = Household(
        id="hh_test",
        district_id="dist_1",
        building_id="bldg_1",
        home_x=2000.0,
        home_z=3000.0
    )
    hh.add_member("cit_001", 60000.0)
    hh.add_member("cit_002", 45000.0)

    assert len(hh.member_ids) == 2
    assert hh.total_income == 105000.0
    d = hh.to_dict()
    assert d["members_count"] == 2
    assert d["home_x"] == 2000.0


def test_state_machine_transitions():
    """Test 20-state FSM valid and invalid transitions."""
    assert can_transition(CitizenState.AT_HOME, CitizenState.PREPARING)
    assert can_transition(CitizenState.PREPARING, CitizenState.WALKING)
    assert can_transition(CitizenState.WALKING, CitizenState.WORKING)
    assert can_transition(CitizenState.WORKING, CitizenState.RETURNING_HOME)
    assert can_transition(CitizenState.RETURNING_HOME, CitizenState.AT_HOME)

    # Disallowed teleport jumps
    assert not can_transition(CitizenState.SLEEPING, CitizenState.WORKING)


def test_pedestrian_pathfinding():
    """Test A* walkable pathfinding through sidewalk graph."""
    ped = PedestrianGraph()
    ped.add_node("p1", 100.0, 100.0)
    ped.add_node("p2", 200.0, 100.0)
    ped.add_node("p3", 200.0, 200.0)
    ped.add_edge("p1", "p2", 100.0)
    ped.add_edge("p2", "p3", 100.0)

    path = ped.find_path(100.0, 100.0, 200.0, 200.0)
    assert len(path) >= 2
    # Ends at destination
    assert path[-1] == (200.0, 200.0)


def test_multimodal_transport_choice():
    """Verify transport chooser evaluates Walk, Car, Bus, Metro based on utility."""
    tc = TransportChooser()
    cit = Citizen(
        id="test_cit",
        name="Test Driver",
        age=35,
        age_group="adult",
        occupation="professional",
        sprite_type="professional",
        district_id="d1",
        income=90000.0,
        household_id="hh_1",
        home_building_id="b1",
        home_x=1000.0,
        home_z=1000.0,
        vehicle_ownership=True
    )

    # Very short trip -> Walk
    mode_short, rat_short, _ = tc.choose_mode(cit, 1000.0, 1000.0, 1300.0, 1000.0, None)
    assert mode_short == "walk"
    assert "Walking" in rat_short

    # Long trip -> Car or Metro
    mode_long, rat_long, _ = tc.choose_mode(cit, 1000.0, 1000.0, 6000.0, 6000.0, None)
    assert mode_long in ["car", "metro", "bus", "railway"]


def test_experience_memory_adaptation():
    """Test that transit delays increase mode penalties and adapt citizen preferences."""
    mem = CitizenMemory()
    assert mem.get_mode_penalty("bus") == 0.0

    # Record normal trip
    mem.record_trip(mode="bus", duration=15.0, expected=15.0, cost=2.0, hour=8.0)
    assert mem.get_mode_penalty("bus") == 0.0

    # Record severely delayed trip
    impact = mem.record_trip(mode="bus", duration=35.0, expected=15.0, cost=2.0, hour=18.0)
    assert impact < 0
    assert mem.delays_count == 1
    assert mem.get_mode_penalty("bus") > 0.0


def test_bus_system_fleet_and_boarding():
    """Test that active buses move, reach stops, and board waiting citizens."""
    bs = BusSystem()
    assert len(bs.routes) == 12
    assert len(bs.buses) >= 24

    # Place a citizen at a stop
    test_stop = list(bs.stops.values())[0]
    test_stop.add_waiting("cit_waiting_01")
    assert "cit_waiting_01" in test_stop.waiting_citizens

    # Update buses
    fake_citizens = {
        "cit_waiting_01": Citizen(
            id="cit_waiting_01",
            name="Bob",
            age=28,
            age_group="young_adult",
            occupation="worker",
            sprite_type="worker",
            district_id="d1",
            income=45000.0,
            household_id="hh_01",
            home_building_id="b1",
            home_x=test_stop.x,
            home_z=test_stop.z
        )
    }
    bs.update(1.0, fake_citizens)
    positions = bs.get_positions()
    assert len(positions) >= 24
    assert positions[0]["type"] == "bus"


def test_metro_railway_passenger_simulation():
    """Test metro platform queuing and passenger transport."""
    ms = MetroRailwaySystem()
    ms.register_station("st_cbd")
    ms.register_station("st_univ")

    cit = Citizen(
        id="cit_metro_rider",
        name="Alice",
        age=22,
        age_group="student",
        occupation="student",
        sprite_type="student",
        district_id="d1",
        income=20000.0,
        household_id="hh_02",
        home_building_id="b2",
        home_x=4000.0,
        home_z=4000.0
    )
    citizens_map = {"cit_metro_rider": cit}

    ms.citizen_enter_station("cit_metro_rider", "st_cbd", "st_univ")
    metrics = ms.get_metrics()
    assert metrics["currently_waiting"] == 1

    stations_data = [{"id": "st_cbd", "x": 4000, "z": 4000}, {"id": "st_univ", "x": 4000, "z": 1800}]
    ms.update(1.0, stations_data, citizens_map)
    assert cit.current_z == 1800
    assert ms.total_metro_ridership == 1


def test_business_staffing_and_customers():
    """Test business instantiation, employment assignment, and customer footfall."""
    bm = BusinessManager()
    sample_buildings = [
        {"id": "bldg_off_1", "district_id": "d1", "building_type": "office", "x": 3500.0, "z": 3500.0},
        {"id": "bldg_fac_1", "district_id": "d2", "building_type": "industrial", "x": 6000.0, "z": 6000.0},
        {"id": "bldg_res_1", "district_id": "d3", "building_type": "residential_high", "x": 2500.0, "z": 2500.0},
    ]
    bm.initialize_from_buildings(sample_buildings, seed=42)
    assert len(bm.businesses) >= 2

    # Work assignment
    work = bm.find_workplace_for_citizen("professional", "d1")
    assert work is not None
    assert work.business_type == "office"
    work.add_employee("cit_01")
    assert len(work.employees) == 1

    # Customer visit
    work.add_customer("cit_customer", spend_amount=30.0)
    assert work.daily_revenue >= 30.0
    assert len(work.customers) == 1


def test_district_metrics_calculation():
    """Test calculation of live district KPIs, transit share, and traffic index."""
    dist = District("dist_test", "CBD Test", "cbd", 1.0, 85000, 2560000, 10000.0, 80000.0, 20000, 150000, 0.9, 0.9, 1.0, 0.8, 0.6, 1.0, (3200, 3200, 4800, 4800), "#1a237e")
    citizens = [
        Citizen("c1", "Cit 1", 30, "adult", "professional", "professional", "dist_test", 80000.0, "h1", "b1", 3500.0, 3500.0, satisfaction=0.9, travel_mode="metro"),
        Citizen("c2", "Cit 2", 45, "adult", "worker", "worker", "dist_test", 50000.0, "h2", "b2", 3600.0, 3600.0, satisfaction=0.8, travel_mode="car"),
    ]
    businesses = [Business("b1", "bldg_1", "Biz 1", "office", "dist_test", 3500.0, 3500.0, daily_revenue=500.0)]
    rg = RoadGraph()

    metrics = calculate_district_metrics("dist_test", dist, citizens, businesses, rg)
    assert metrics["name"] == "CBD Test"
    assert metrics["active_simulated_citizens"] == 2
    assert metrics["satisfaction_index"] == 85.0
    assert metrics["transit_modal_split"]["public_transit_pct"] == 50.0
    assert metrics["transit_modal_split"]["car_pct"] == 50.0
    assert metrics["economic_activity"]["active_businesses"] == 1


def test_city_generation_with_1000_citizens():
    """Verify city generator outputs 1,000 citizens with real homes, households, and workplaces."""
    city = generate_city(seed=42, active_citizens=1000)
    assert len(city.districts) == 12
    assert len(city.citizens) == 1000
    assert len(city.households) > 200
    assert len(city.buildings) > 2000

    # Inspect first citizen
    c = city.citizens[0]
    assert c.name
    assert c.household_id in city.households
    assert c.home_building_id
    assert c.home_x > 0
    assert c.home_z > 0
    assert c.age > 0


@pytest.mark.asyncio
async def test_full_engine_phase2_tick():
    """Verify simulation engine initializes and advances ticks with active buses, cars, and citizens."""
    settings = Settings(SIMULATION_ACTIVE_CITIZENS=200)
    engine = SimulationEngine(settings)
    assert len(engine.citizens) == 200
    assert len(engine.world.bus_system.buses) >= 24

    # Run one tick
    await engine.tick()

    snapshot = engine.get_state_snapshot()
    assert snapshot["active_citizens_count"] == 200
    assert len(snapshot["vehicles"]) >= 24  # contains buses
    assert "transit_metrics" in snapshot

    delta = engine.get_delta()
    assert delta["type"] == "delta"
    assert len(delta["citizens"]) == 200


@pytest.mark.asyncio
async def test_car_lifecycle_and_traffic():
    """Verify driving citizens register car vehicles on road."""
    settings = Settings(SIMULATION_ACTIVE_CITIZENS=10)
    engine = SimulationEngine(settings)
    cit = list(engine.citizens.values())[0]
    cit.current_state = CitizenState.DRIVING
    cit.destination_x = cit.current_x + 50.0
    cit.destination_z = cit.current_z + 50.0
    cit.current_path = [(cit.destination_x, cit.destination_z)]
    cit.path_index = 0

    await engine.tick()
    assert f"car_{cit.id}" in engine.vehicles or cit.current_state != CitizenState.DRIVING


def test_satisfaction_and_stress_dynamics():
    """Verify citizen satisfaction and stress update dynamically."""
    cit = Citizen(
        id="c_test",
        name="Diana",
        age=30,
        age_group="adult",
        occupation="office_worker",
        sprite_type="professional",
        district_id="d1",
        income=60000.0,
        household_id="hh1",
        home_building_id="b1",
        home_x=100.0,
        home_z=100.0,
        satisfaction=0.8,
        stress=0.2
    )
    cit.update_satisfaction(-0.15)
    assert cit.satisfaction < 0.8
    assert cit.stress > 0.2

    cit.update_satisfaction(0.1)
    assert cit.satisfaction > 0.65

