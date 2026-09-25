"""
METACITY — Multi-Modal Transport Utility Chooser
Evaluates travel options (Walk, Car, Bus, Metro, Railway) using weighted utility scoring,
cost, travel time, comfort, vehicle ownership, and past experience memory.
"""
import math
from typing import Tuple, Optional, Dict, Any
from app.simulation.citizens.citizen import Citizen


class TransportChooser:
    def __init__(self):
        # Base parameters
        self.walk_speed_mps = 3.0       # 10.8 km/h
        self.car_speed_mps = 16.6       # 60 km/h baseline
        self.bus_speed_mps = 11.1       # 40 km/h baseline
        self.metro_speed_mps = 22.2     # 80 km/h
        self.railway_speed_mps = 27.7   # 100 km/h

        # Fares
        self.bus_fare = 2.0
        self.metro_fare = 3.5
        self.railway_fare = 5.0
        self.fuel_cost_per_km = 1.2

    def choose_mode(
        self,
        citizen: Citizen,
        origin_x: float,
        origin_z: float,
        dest_x: float,
        dest_z: float,
        world: Any
    ) -> Tuple[str, str, Dict[str, Any]]:
        """
        Calculates utility scores for all viable transport modes.
        Returns: (chosen_mode, rationale_string, evaluation_details)
        """
        direct_dist = math.sqrt((dest_x - origin_x) ** 2 + (dest_z - origin_z) ** 2)
        dist_km = direct_dist / 1000.0

        scores: Dict[str, float] = {}
        details: Dict[str, Any] = {}

        # 1. WALK
        # Viable if distance <= 2500m. Free and instant departure.
        if direct_dist <= 2500:
            walk_time_min = (direct_dist / self.walk_speed_mps) / 60.0
            # For short walks (< 600m), walking is highly attractive
            short_walk_bonus = 15.0 if direct_dist < 600 else 0.0
            walk_disutility = (walk_time_min * 1.0) - (citizen.preferences.walk_weight * 20.0) - short_walk_bonus
            walk_disutility += citizen.memory.get_mode_penalty("walk") * 30.0
            scores["walk"] = walk_disutility
            details["walk"] = {"time_min": round(walk_time_min, 1), "cost": 0.0}

        # 2. CAR
        if citizen.vehicle_ownership:
            # Driving involves access/parking time (~3.5 min) + road transit
            car_time_min = (direct_dist / self.car_speed_mps) / 60.0 * 1.3 + 3.5
            car_cost = dist_km * self.fuel_cost_per_km
            car_disutility = (
                (car_time_min * 1.5)
                + (car_cost * citizen.preferences.cost_sensitivity * 5.0)
                - (citizen.preferences.car_weight * 20.0)
                - (citizen.preferences.comfort_preference * 8.0)
                + (citizen.memory.get_mode_penalty("car") * 35.0)
            )
            scores["car"] = car_disutility
            details["car"] = {"time_min": round(car_time_min, 1), "cost": round(car_cost, 2)}

        # 3. BUS
        # Check nearest bus stop
        bus_time_min = (direct_dist / self.bus_speed_mps) / 60.0 * 1.2 + 4.0  # +4m wait
        bus_disutility = (
            (bus_time_min * 1.3)
            + (self.bus_fare * citizen.preferences.cost_sensitivity * 3.0)
            - (citizen.preferences.bus_weight * 20.0)
            + (citizen.memory.get_mode_penalty("bus") * 40.0)
        )
        scores["bus"] = bus_disutility
        details["bus"] = {"time_min": round(bus_time_min, 1), "cost": self.bus_fare}

        # 4. METRO
        # Metro becomes attractive for trips > 1500m
        if direct_dist >= 1200:
            metro_time_min = (direct_dist / self.metro_speed_mps) / 60.0 + 5.0  # +5m station access/wait
            metro_disutility = (
                (metro_time_min * 1.1)
                + (self.metro_fare * citizen.preferences.cost_sensitivity * 2.5)
                - (citizen.preferences.metro_weight * 30.0)
                - (citizen.preferences.comfort_preference * 8.0)
                + (citizen.memory.get_mode_penalty("metro") * 35.0)
            )
            scores["metro"] = metro_disutility
            details["metro"] = {"time_min": round(metro_time_min, 1), "cost": self.metro_fare}

        # 5. RAILWAY
        # Railway is fast for long cross-city trips (> 3000m)
        if direct_dist >= 2800:
            rail_time_min = (direct_dist / self.railway_speed_mps) / 60.0 + 8.0
            rail_disutility = (
                (rail_time_min * 1.0)
                + (self.railway_fare * citizen.preferences.cost_sensitivity * 3.0)
                - (citizen.preferences.railway_weight * 25.0)
                + (citizen.memory.get_mode_penalty("railway") * 35.0)
            )
            scores["railway"] = rail_disutility
            details["railway"] = {"time_min": round(rail_time_min, 1), "cost": self.railway_fare}

        if not scores:
            scores["walk"] = 999.0
            details["walk"] = {"time_min": 60, "cost": 0}

        # Lowest disutility wins
        chosen_mode = min(scores, key=scores.get)

        # Build natural rationale for Inspector
        time_est = details[chosen_mode]["time_min"]
        cost_est = details[chosen_mode]["cost"]
        if chosen_mode == "walk":
            rationale = f"Walking ({round(dist_km, 1)}km in ~{int(time_est)}m) is free, healthy, and convenient for this short distance."
        elif chosen_mode == "car":
            rationale = f"Driving by personal car (~{int(time_est)}m, {cost_est} MC) maximizes personal comfort and direct routing."
        elif chosen_mode == "metro":
            rationale = f"Metro chosen (~{int(time_est)}m, {cost_est} MC): rapid transit bypasses surface traffic for this {round(dist_km, 1)}km commute."
        elif chosen_mode == "bus":
            rationale = f"Bus transit chosen (~{int(time_est)}m, {cost_est} MC): economic public transit option with accessible stops."
        else:
            rationale = f"Metacity Railway chosen (~{int(time_est)}m, {cost_est} MC): high-speed inter-district connection."

        return chosen_mode, rationale, details
