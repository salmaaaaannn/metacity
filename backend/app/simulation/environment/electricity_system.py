"""
METACITY — Electricity System & Dynamic Grid Stress Model
Computes base megawatt load plus thermal cooling/heating surges.
"""
from typing import Dict, Any

def calculate_electricity_demand(
    total_population: int,
    commercial_count: int,
    office_count: int,
    industrial_count: int,
    temperature_c: float,
    sim_hour: float
) -> Dict[str, float]:
    # Baseline residential load (~1.5 kW per citizen)
    res_mw = (total_population * 0.0015)

    # Commercial & Office daytime curve
    is_work_hours = 8.0 <= sim_hour <= 19.0
    work_factor = 1.35 if is_work_hours else 0.45
    commercial_mw = commercial_count * 2.5 * work_factor
    office_mw = office_count * 5.0 * work_factor
    industrial_mw = industrial_count * 8.0

    # Temperature sensitivity: AC surge above 24°C, heating surge below 10°C
    thermal_multiplier = 1.0
    if temperature_c > 24.0:
        thermal_multiplier += (temperature_c - 24.0) * 0.035
    elif temperature_c < 10.0:
        thermal_multiplier += (10.0 - temperature_c) * 0.02

    total_demand = (res_mw + commercial_mw + office_mw + industrial_mw) * thermal_multiplier

    # Available supply capacity (baseline 2,200 MW nominal)
    supply_mw = 2200.0
    grid_stress = min(100.0, (total_demand / supply_mw) * 100.0)

    return {
        "demand_mw": round(total_demand, 1),
        "supply_mw": round(supply_mw, 1),
        "grid_stress_pct": round(grid_stress, 1),
        "is_stressed": grid_stress > 88.0,
        "is_blackout_risk": grid_stress > 98.0
    }
