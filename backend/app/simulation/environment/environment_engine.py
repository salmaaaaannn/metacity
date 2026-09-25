"""
METACITY — Master Environment Engine (Phase 4)
Orchestrates dynamic climate, diurnal curves, utility loads, air quality, and seasonal cycles.
"""
from typing import Dict, Any, Optional
from app.simulation.environment.environment_state import EnvironmentState, Season, WeatherCondition
from app.simulation.environment.weather import WeatherManager
from app.simulation.environment.temperature import calculate_temperature, calculate_heat_index
from app.simulation.environment.rainfall import calculate_rainfall, update_soil_moisture
from app.simulation.environment.wind import calculate_wind
from app.simulation.environment.air_quality import calculate_air_quality
from app.simulation.environment.electricity_system import calculate_electricity_demand
from app.simulation.environment.water_system import calculate_water_demand

class EnvironmentEngine:
    def __init__(self, seed: int = 42):
        self.state = EnvironmentState()
        self.weather_manager = WeatherManager(seed=seed)
        self.seed = seed
        self.manual_season: Optional[Season] = None

    def set_season(self, season: Season):
        self.manual_season = season
        self.state.season = season

    def set_weather(self, weather: WeatherCondition):
        self.weather_manager.set_weather(weather)
        self.state.weather_condition = weather

    def update(
        self,
        sim_hour: float,
        sim_month: int,
        elapsed_hours: float,
        world: Any = None
    ) -> EnvironmentState:
        # 1. Determine Season from month if not manually overridden
        if self.manual_season:
            season = self.manual_season
        else:
            if sim_month in [3, 4, 5]:
                season = Season.SPRING
            elif sim_month in [6, 7, 8]:
                season = Season.SUMMER
            elif sim_month in [9, 10, 11]:
                season = Season.AUTUMN
            else:
                season = Season.WINTER
        self.state.season = season

        # 2. Advance Weather
        weather = self.weather_manager.tick(elapsed_hours, season)
        self.state.weather_condition = weather

        # 3. Compute Temperature & Heat Index
        temp = calculate_temperature(sim_hour, season, weather)
        # Humidity: rain increases humidity, clear reduces it
        humidity = 55.0
        if weather in [WeatherCondition.RAIN, WeatherCondition.HEAVY_RAIN, WeatherCondition.STORM]:
            humidity = min(98.0, 75.0 + (temp * 0.4))
        elif weather in [WeatherCondition.HEATWAVE, WeatherCondition.EXTREME_HEAT]:
            humidity = max(25.0, 40.0 - (temp * 0.3))
        self.state.humidity = round(humidity, 1)
        self.state.temperature = temp
        self.state.heat_index = calculate_heat_index(temp, humidity)

        # 4. Compute Rainfall & Soil Moisture
        rainfall = calculate_rainfall(weather)
        self.state.rainfall = rainfall
        self.state.soil_moisture = update_soil_moisture(self.state.soil_moisture, rainfall, elapsed_hours)

        # 5. Wind Vector
        speed, direction = calculate_wind(weather, self.state.wind_direction, seed=self.seed)
        self.state.wind_speed = speed
        self.state.wind_direction = direction

        # Visibility
        if weather in [WeatherCondition.FOG, WeatherCondition.STORM]:
            self.state.visibility = 1.5
        elif weather == WeatherCondition.HEAVY_RAIN:
            self.state.visibility = 4.0
        else:
            self.state.visibility = 12.0

        # 6. Air Quality & Pollution
        traffic_vol = len(world.vehicles) if world and hasattr(world, "vehicles") else 400
        industrial_count = 12
        if world and hasattr(world, "districts"):
            industrial_count = sum(1 for d in world.districts.values() if getattr(d, 'type', '') == 'industrial')

        aqi, pm = calculate_air_quality(traffic_vol, industrial_count, speed, rainfall)
        self.state.air_quality_index = aqi
        self.state.pollution = pm

        # 7. Dynamic Utilities (Electricity & Water)
        pop = sum(d.population for d in world.districts.values()) if world and hasattr(world, "districts") else 539000
        elec = calculate_electricity_demand(pop, 45, 60, industrial_count, temp, sim_hour)
        self.state.electricity_demand_mw = elec["demand_mw"]
        self.state.electricity_supply_mw = elec["supply_mw"]
        self.state.grid_stress_pct = elec["grid_stress_pct"]

        water = calculate_water_demand(pop, industrial_count, temp, rainfall)
        self.state.water_demand_mld = water["demand_mld"]
        self.state.water_supply_mld = water["supply_mld"]
        self.state.water_reserve_pct = water["reserve_pct"]

        return self.state

    def to_dict(self) -> Dict[str, Any]:
        return self.state.to_dict()
