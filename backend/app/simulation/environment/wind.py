"""
METACITY — Atmospheric Wind Vector Simulation
"""
import random
from app.simulation.environment.environment_state import WeatherCondition

def calculate_wind(weather: WeatherCondition, current_dir: float, seed: int = 42) -> tuple[float, float]:
    rng = random.Random(seed)
    if weather == WeatherCondition.STORM:
        speed = rng.uniform(70.0, 110.0)
    elif weather in [WeatherCondition.HEAVY_RAIN, WeatherCondition.RAIN]:
        speed = rng.uniform(25.0, 45.0)
    elif weather in [WeatherCondition.HEATWAVE, WeatherCondition.EXTREME_HEAT]:
        speed = rng.uniform(2.0, 8.0)
    else:
        speed = rng.uniform(8.0, 20.0)

    # Slow drift in wind direction (degrees)
    dir_delta = rng.uniform(-15.0, 15.0)
    new_dir = (current_dir + dir_delta) % 360.0

    return round(speed, 1), round(new_dir, 1)
