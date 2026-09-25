"""
METACITY — Precipitation & Soil Saturation
Computes precipitation rates and ground runoff dynamics.
"""
from app.simulation.environment.environment_state import WeatherCondition

def calculate_rainfall(weather: WeatherCondition) -> float:
    if weather == WeatherCondition.RAIN:
        return 8.5
    elif weather == WeatherCondition.HEAVY_RAIN:
        return 38.0
    elif weather == WeatherCondition.STORM:
        return 85.0
    return 0.0

def update_soil_moisture(current_moisture: float, rainfall_mm: float, hours: float) -> float:
    if rainfall_mm > 0:
        moisture = current_moisture + (rainfall_mm * 0.45 * hours)
    else:
        # Natural drainage & evaporation
        moisture = current_moisture - (1.2 * hours)
    return round(max(10.0, min(100.0, moisture)), 1)
