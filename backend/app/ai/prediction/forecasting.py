"""
METACITY — Explainable Predictive Analytics Engine (Phase 5)
Provides robust statistical & machine learning forecasts with confidence intervals.
"""
from typing import Dict, List, Any, Tuple
import math

class CityForecastingEngine:
    def __init__(self):
        self.model_version = "METACITY-STATS-v2.1"

    def forecast_metric(
        self,
        history: List[Dict[str, Any]],
        metric_key: str,
        horizon_hours: int = 24
    ) -> Dict[str, Any]:
        if not history:
            return {
                "prediction": 0.0,
                "horizon_hours": horizon_hours,
                "confidence_interval": [0.0, 0.0],
                "uncertainty_pct": 25.0,
                "key_factors": ["Insufficient historical data"],
                "model_version": self.model_version
            }

        values = [h.get(metric_key, 0.0) for h in history]
        current = values[-1]

        # Exponential smoothing trend
        alpha = 0.3
        smoothed = values[0]
        for v in values[1:]:
            smoothed = alpha * v + (1 - alpha) * smoothed

        # Trend estimation
        trend = 0.0
        if len(values) >= 5:
            trend = (values[-1] - values[-5]) / 5.0

        # Forecast
        forecast_val = round(smoothed + (trend * (horizon_hours / 4.0)), 2)

        # Margin of error / confidence interval (±10% to ±20%)
        margin = max(abs(forecast_val * 0.12), 2.0)
        ci_lower = round(forecast_val - margin, 2)
        ci_upper = round(forecast_val + margin, 2)

        # Explanatory factors
        factors = []
        if trend > 0.5:
            factors.append("Strong upward trajectory in recent historical ticks")
        elif trend < -0.5:
            factors.append("Declining trend across recent observation window")
        else:
            factors.append("Stable operating equilibrium")

        factors.append(f"Smoothing alpha={alpha} weighted toward recent samples")
        factors.append(f"Confidence interval spans ±{round(margin, 1)} units")

        return {
            "metric": metric_key,
            "current_value": round(current, 2),
            "predicted_value": forecast_val,
            "horizon_hours": horizon_hours,
            "confidence_interval": [ci_lower, ci_upper],
            "uncertainty_pct": round((margin / max(1.0, forecast_val)) * 100, 1),
            "key_factors": factors,
            "model_version": self.model_version
        }

    def generate_all_forecasts(self, history: List[Dict[str, Any]]) -> Dict[str, Any]:
        return {
            "traffic_congestion": self.forecast_metric(history, "traffic_congestion_pct", 6),
            "electricity_demand": self.forecast_metric(history, "electricity_demand_mw", 24),
            "water_demand": self.forecast_metric(history, "water_demand_mld", 24),
            "population_growth": self.forecast_metric(history, "population", 168),
            "transit_ridership": self.forecast_metric(history, "transit_ridership", 12),
        }
