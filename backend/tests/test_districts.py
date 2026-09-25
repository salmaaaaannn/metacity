from app.simulation.districts.city_generator import generate_city

def test_generate_city():
    city = generate_city(42, 100)
    
    assert len(city.districts) == 12
    assert len(city.citizens) == 100
    assert len(city.chunks) == 40 * 40
    
    populations = [d.population for d in city.districts]
    assert sum(populations) > 0
