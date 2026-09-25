from app.simulation.economy.budget import CityBudget
from app.simulation.world.world import World
from app.simulation.districts.district import District

def test_budget_calculation():
    world = World()
    d1 = District("d1", "Test", "cbd", 1.0, 1000, 100, 1000, 50000, 1000, 1000, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, (0,0,10,10), "#000")
    world.districts["d1"] = d1
    
    budget = CityBudget()
    inc = budget.calculate_income(world)
    assert inc.property_tax == 1000 * 50000 * 0.08
    assert inc.business_tax == 1000 * 500 * 1.0
    
    exp = budget.calculate_expenses(world)
    assert exp.total > 0
    
    budget.apply_monthly_tick(world)
    assert budget.net_monthly == inc.total - exp.total
