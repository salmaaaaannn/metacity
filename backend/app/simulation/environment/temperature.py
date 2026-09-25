"""
METACITY — Temperature & Heat Index Simulation
Computes diurnal thermal variations, seasonal baselines, and apparent heat index.
"""
import math
from app.simulation.environment.environment_state import Season, WeatherCondition

SEASONAL_BASELINES = {
    Season.SPRING: 18.0,
    Season.SUMMER: 28.0,
    Season.AUTUMN: 16.0,
    Season.WINTER: 4.0,
}

def calculate_temperature(sim_hour: float, season: Season, weather: WeatherCondition) -> float:
    base = SEASONAL_BASELINES.get(season, 20.0)
    # Diurnal cycle: Min at 05:00, Max at 14:00 (amplitude ~ 6°C)
    radian = ((sim_hour - 5.0) / 24.0) * 2.0 * math.pi
    diurnal_variation = -math.cos(radian) * 6.0

    weather_mod = 0.0
    if weather == WeatherCondition.RAIN:
        weather_mod = -3.0
    elif weather == WeatherCondition.HEAVY_RAIN or weather == WeatherCondition.STORM:
        weather_mod = -5.5
    elif weather == WeatherCondition.HEATWAVE:
        weather_mod = 8.5
    elif weather == WeatherCondition.EXTREME_HEAT:
        weather_mod = 14.0
    elif weather == WeatherCondition.FOG:
        weather_mod = -2.0

    temp = base + diurnal_variation + weather_mod
    return round(temp, 1)

def calculate_heat_index(temperature_c: float, humidity_pct: float) -> float:
    """Calculates apparent temperature incorporating relative humidity."""
    t = temperature_c
    r = humidity_pct / 100.0
    if t < 20.0:
        return round(t, 1)
    # Simplified Steadman formula for apparent thermal stress
    apparent = t + (5.0 / 9.0) * ((r * 6.11 * math.exp(5417.7530 * (1/273.16 - 1/(273.15 + t)))) - 10.0)
    return round(max(t, apparent), 1)
