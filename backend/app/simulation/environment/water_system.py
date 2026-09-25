"""
METACITY — Municipal Water System & Consumption Model
"""
from typing import Dict, Any

def calculate_water_demand(
    total_population: int,
    industrial_count: int,
    temperature_c: float,
    rainfall_mm: float
) -> Dict[str, float]:
    # Baseline ~250 Liters per citizen per day
    domestic_mld = (total_population * 250.0) / 1_000_000.0
    industrial_mld = (industrial_count * 2.5)

    # Temperature multiplier: higher water usage in hot weather
    thermal_multiplier = 1.0
    if temperature_c > 26.0:
        thermal_multiplier += (temperature_c - 26.0) * 0.025

    total_demand = (domestic_mld + industrial_mld) * thermal_multiplier
    supply_mld = 550.0

    # Reservoir reserves (85% baseline, boosted by rain, reduced by deficit)
    reserve_pct = 85.0
    if rainfall_mm > 0:
        reserve_pct = min(100.0, reserve_pct + rainfall_mm * 0.2)

    return {
        "demand_mld": round(total_demand, 1),
        "supply_mld": round(supply_mld, 1),
        "reserve_pct": round(reserve_pct, 1),
        "is_deficit": total_demand > supply_mld
    }
