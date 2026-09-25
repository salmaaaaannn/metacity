"""
METACITY — Weather Markov Transitions & Climate Control
"""
import random
from typing import Dict, List
from app.simulation.environment.environment_state import Season, WeatherCondition

SEASON_WEATHER_WEIGHTS: Dict[Season, Dict[WeatherCondition, float]] = {
    Season.SPRING: {
        WeatherCondition.CLEAR: 0.45,
        WeatherCondition.CLOUDY: 0.25,
        WeatherCondition.RAIN: 0.20,
        WeatherCondition.HEAVY_RAIN: 0.05,
        WeatherCondition.STORM: 0.03,
        WeatherCondition.FOG: 0.02,
        WeatherCondition.HEATWAVE: 0.0,
        WeatherCondition.EXTREME_HEAT: 0.0,
    },
    Season.SUMMER: {
        WeatherCondition.CLEAR: 0.50,
        WeatherCondition.CLOUDY: 0.15,
        WeatherCondition.RAIN: 0.10,
        WeatherCondition.HEAVY_RAIN: 0.05,
        WeatherCondition.STORM: 0.05,
        WeatherCondition.HEATWAVE: 0.10,
        WeatherCondition.EXTREME_HEAT: 0.05,
        WeatherCondition.FOG: 0.0,
    },
    Season.AUTUMN: {
        WeatherCondition.CLEAR: 0.30,
        WeatherCondition.CLOUDY: 0.30,
        WeatherCondition.RAIN: 0.22,
        WeatherCondition.HEAVY_RAIN: 0.10,
        WeatherCondition.STORM: 0.05,
        WeatherCondition.FOG: 0.03,
        WeatherCondition.HEATWAVE: 0.0,
        WeatherCondition.EXTREME_HEAT: 0.0,
    },
    Season.WINTER: {
        WeatherCondition.CLEAR: 0.25,
        WeatherCondition.CLOUDY: 0.40,
        WeatherCondition.RAIN: 0.20,
        WeatherCondition.HEAVY_RAIN: 0.05,
        WeatherCondition.STORM: 0.02,
        WeatherCondition.FOG: 0.08,
        WeatherCondition.HEATWAVE: 0.0,
        WeatherCondition.EXTREME_HEAT: 0.0,
    },
}

class WeatherManager:
    def __init__(self, seed: int = 42):
        self.rng = random.Random(seed)
        self.current_weather = WeatherCondition.CLEAR
        self.manual_override: bool = False
        self.duration_hours: float = 6.0
        self.hours_in_current: float = 0.0

    def set_weather(self, weather: WeatherCondition):
        self.current_weather = weather
        self.manual_override = True
        self.hours_in_current = 0.0

    def clear_override(self):
        self.manual_override = False

    def tick(self, elapsed_hours: float, season: Season) -> WeatherCondition:
        self.hours_in_current += elapsed_hours
        if self.manual_override:
            return self.current_weather

        if self.hours_in_current >= self.duration_hours:
            weights = SEASON_WEATHER_WEIGHTS.get(season, SEASON_WEATHER_WEIGHTS[Season.SPRING])
            conditions = list(weights.keys())
            probs = list(weights.values())
            self.current_weather = self.rng.choices(conditions, weights=probs, k=1)[0]
            self.duration_hours = self.rng.uniform(3.0, 12.0)
            self.hours_in_current = 0.0

        return self.current_weather
