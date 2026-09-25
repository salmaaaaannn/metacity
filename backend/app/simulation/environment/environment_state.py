"""
METACITY — Environmental State & Weather Models (Phase 4)
Defines climate conditions, seasons, weather states, atmospheric metrics, and utility loads.
"""
from enum import Enum
from dataclasses import dataclass, asdict
from typing import Dict, Any


class WeatherCondition(str, Enum):
    CLEAR = "CLEAR"
    CLOUDY = "CLOUDY"
    RAIN = "RAIN"
    HEAVY_RAIN = "HEAVY_RAIN"
    STORM = "STORM"
    HEATWAVE = "HEATWAVE"
    FOG = "FOG"
    EXTREME_HEAT = "EXTREME_HEAT"


class Season(str, Enum):
    SPRING = "SPRING"
    SUMMER = "SUMMER"
    AUTUMN = "AUTUMN"
    WINTER = "WINTER"


@dataclass
class EnvironmentState:
    temperature: float = 22.0          # Celsius
    humidity: float = 55.0             # Percentage (0-100)
    rainfall: float = 0.0              # mm/hour
    wind_speed: float = 12.0           # km/hour
    wind_direction: float = 45.0       # Degrees (0-360)
    visibility: float = 10.0           # km
    air_quality_index: int = 42        # AQI (0-500 scale)
    water_level: float = 0.0           # Elevation delta above nominal river level (meters)
    soil_moisture: float = 35.0        # Percentage (0-100)
    pollution: float = 18.5            # Particulate matter ppm
    heat_index: float = 22.5           # Apparent temperature Celsius
    season: Season = Season.SPRING
    weather_condition: WeatherCondition = WeatherCondition.CLEAR

    # Utility Demand Tracking
    electricity_demand_mw: float = 1450.0
    electricity_supply_mw: float = 2100.0
    grid_stress_pct: float = 69.0
    water_demand_mld: float = 380.0    # Million Liters per Day
    water_supply_mld: float = 520.0
    water_reserve_pct: float = 85.0

    def to_dict(self) -> Dict[str, Any]:
        d = asdict(self)
        d["season"] = self.season.value if isinstance(self.season, Season) else self.season
        d["weather_condition"] = self.weather_condition.value if isinstance(self.weather_condition, WeatherCondition) else self.weather_condition
        return d
