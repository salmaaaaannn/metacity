"""
METACITY — Citizen Finite State Machine (FSM)
Defines 20 simulation-driven states and valid state transitions.
"""
from enum import Enum
from typing import Set


class CitizenState(str, Enum):
    SLEEPING = "SLEEPING"
    AT_HOME = "AT_HOME"
    PREPARING = "PREPARING"
    WALKING = "WALKING"
    WAITING = "WAITING"
    COMMUTING = "COMMUTING"
    DRIVING = "DRIVING"
    WAITING_FOR_BUS = "WAITING_FOR_BUS"
    RIDING_BUS = "RIDING_BUS"
    WAITING_FOR_METRO = "WAITING_FOR_METRO"
    RIDING_METRO = "RIDING_METRO"
    RIDING_RAILWAY = "RIDING_RAILWAY"
    WORKING = "WORKING"
    STUDYING = "STUDYING"
    SHOPPING = "SHOPPING"
    EATING = "EATING"
    RELAXING = "RELAXING"
    TALKING = "TALKING"
    IN_PARK = "IN_PARK"
    RETURNING_HOME = "RETURNING_HOME"


# Allowed state transitions for realism
VALID_TRANSITIONS: dict[CitizenState, Set[CitizenState]] = {
    CitizenState.SLEEPING: {CitizenState.AT_HOME, CitizenState.PREPARING},
    CitizenState.AT_HOME: {CitizenState.PREPARING, CitizenState.WALKING, CitizenState.SLEEPING, CitizenState.RELAXING},
    CitizenState.PREPARING: {CitizenState.WALKING, CitizenState.COMMUTING, CitizenState.DRIVING, CitizenState.WAITING_FOR_BUS, CitizenState.WAITING_FOR_METRO},
    CitizenState.WALKING: {
        CitizenState.AT_HOME, CitizenState.WORKING, CitizenState.STUDYING,
        CitizenState.SHOPPING, CitizenState.EATING, CitizenState.IN_PARK,
        CitizenState.WAITING_FOR_BUS, CitizenState.WAITING_FOR_METRO,
        CitizenState.DRIVING, CitizenState.RETURNING_HOME, CitizenState.WAITING
    },
    CitizenState.WAITING: {CitizenState.WALKING, CitizenState.TALKING, CitizenState.BOARDING if False else CitizenState.COMMUTING},
    CitizenState.COMMUTING: {
        CitizenState.WALKING, CitizenState.DRIVING, CitizenState.RIDING_BUS,
        CitizenState.RIDING_METRO, CitizenState.RIDING_RAILWAY, CitizenState.WORKING,
        CitizenState.STUDYING, CitizenState.AT_HOME
    },
    CitizenState.DRIVING: {CitizenState.WALKING, CitizenState.WORKING, CitizenState.SHOPPING, CitizenState.AT_HOME},
    CitizenState.WAITING_FOR_BUS: {CitizenState.RIDING_BUS, CitizenState.WALKING},
    CitizenState.RIDING_BUS: {CitizenState.WALKING, CitizenState.WORKING, CitizenState.SHOPPING, CitizenState.RETURNING_HOME},
    CitizenState.WAITING_FOR_METRO: {CitizenState.RIDING_METRO, CitizenState.WALKING},
    CitizenState.RIDING_METRO: {CitizenState.WALKING, CitizenState.WORKING, CitizenState.RETURNING_HOME},
    CitizenState.RIDING_RAILWAY: {CitizenState.WALKING, CitizenState.WORKING, CitizenState.RETURNING_HOME},
    CitizenState.WORKING: {CitizenState.EATING, CitizenState.WALKING, CitizenState.RETURNING_HOME, CitizenState.SHOPPING},
    CitizenState.STUDYING: {CitizenState.EATING, CitizenState.WALKING, CitizenState.IN_PARK, CitizenState.RETURNING_HOME},
    CitizenState.SHOPPING: {CitizenState.EATING, CitizenState.WALKING, CitizenState.RETURNING_HOME, CitizenState.IN_PARK},
    CitizenState.EATING: {CitizenState.WORKING, CitizenState.STUDYING, CitizenState.SHOPPING, CitizenState.WALKING, CitizenState.RETURNING_HOME},
    CitizenState.RELAXING: {CitizenState.SLEEPING, CitizenState.WALKING, CitizenState.TALKING},
    CitizenState.TALKING: {CitizenState.WALKING, CitizenState.WORKING, CitizenState.IN_PARK, CitizenState.SHOPPING},
    CitizenState.IN_PARK: {CitizenState.WALKING, CitizenState.RETURNING_HOME, CitizenState.EATING},
    CitizenState.RETURNING_HOME: {CitizenState.WALKING, CitizenState.DRIVING, CitizenState.RIDING_BUS, CitizenState.RIDING_METRO, CitizenState.AT_HOME},
}


def can_transition(current: CitizenState, target: CitizenState) -> bool:
    """Check if state transition is valid."""
    allowed = VALID_TRANSITIONS.get(current, set())
    return target in allowed or current == target
