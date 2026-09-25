"""
METACITY — Air Quality & Pollution Model
Calculates Air Quality Index (AQI 0-500) and particulate pollution.
"""
from typing import Any

def calculate_air_quality(
    traffic_volume: int,
    industrial_buildings_count: int,
    wind_speed: float,
    rainfall_mm: float
) -> tuple[int, float]:
    # Baseline pollution
    base_pm = 15.0

    # Traffic contribution (~0.05 ppm per vehicle)
    traffic_pm = (traffic_volume * 0.05)

    # Industrial emission
    industrial_pm = (industrial_buildings_count * 2.2)

    # Rain clears particulate pollution (rainout effect)
    rain_washout = max(0.0, 1.0 - (rainfall_mm * 0.02))

    # Wind dispersion (higher wind lowers local concentration)
    wind_dispersion = max(0.5, 15.0 / max(5.0, wind_speed))

    total_pm = (base_pm + traffic_pm + industrial_pm) * rain_washout * wind_dispersion
    total_pm = max(5.0, min(250.0, total_pm))

    # Convert PM to US-EPA AQI scale approximation
    if total_pm <= 12.0:
        aqi = int((50.0 / 12.0) * total_pm)
    elif total_pm <= 35.4:
        aqi = 50 + int((49.0 / 23.4) * (total_pm - 12.1))
    elif total_pm <= 55.4:
        aqi = 100 + int((49.0 / 20.0) * (total_pm - 35.5))
    elif total_pm <= 150.4:
        aqi = 150 + int((49.0 / 95.0) * (total_pm - 55.5))
    else:
        aqi = min(500, 200 + int((100.0 / 100.0) * (total_pm - 150.5)))

    return aqi, round(total_pm, 1)
