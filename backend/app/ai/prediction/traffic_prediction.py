"""
METACITY — Spatial Traffic Congestion & Bottleneck Forecast (Phase 5)
Predicts congestion spikes, bottleneck corridors, and travel delays.
"""
from typing import Dict, List, Any

def predict_traffic_conditions(
    world: Any,
    sim_hour: float,
    weather_condition: str,
    active_incidents_count: int
) -> Dict[str, Any]:
    # Peak rush hours: 07:30 - 09:30 and 16:30 - 18:30
    is_morning_peak = 7.5 <= sim_hour <= 9.5
    is_evening_peak = 16.5 <= sim_hour <= 18.5
    is_peak = is_morning_peak or is_evening_peak

    base_congestion = 42.0 if is_peak else 24.0

    # Weather multipliers
    weather_penalty = 0.0
    if weather_condition in ["HEAVY_RAIN", "STORM"]:
        weather_penalty = 22.0
    elif weather_condition in ["RAIN", "FOG"]:
        weather_penalty = 12.0

    incident_penalty = active_incidents_count * 8.5

    predicted_congestion = round(min(98.0, base_congestion + weather_penalty + incident_penalty), 1)

    bottlenecks = [
        {"corridor": "CBD Central Expressway", "predicted_congestion_pct": round(min(99.0, predicted_congestion * 1.25), 1), "peak_hour": "08:30"},
        {"corridor": "River Crossing Bridge West", "predicted_congestion_pct": round(min(95.0, predicted_congestion * 1.15), 1), "peak_hour": "17:45"},
        {"corridor": "Industrial Arterial East", "predicted_congestion_pct": round(min(92.0, predicted_congestion * 1.05), 1), "peak_hour": "07:45"},
        {"corridor": "Suburban Metro Connector", "predicted_congestion_pct": round(min(88.0, predicted_congestion * 0.95), 1), "peak_hour": "17:15"}
    ]

    return {
        "predicted_city_congestion_pct": predicted_congestion,
        "is_peak_period": is_peak,
        "estimated_avg_delay_min": round(predicted_congestion * 0.22, 1),
        "peak_window": "08:00 - 09:30" if is_morning_peak else "17:00 - 18:30" if is_evening_peak else "Next rush at 17:00",
        "bottlenecks": bottlenecks
    }
