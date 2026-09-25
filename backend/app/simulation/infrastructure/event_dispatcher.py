"""
METACITY — Spatial Infrastructure Event Dispatcher
Publishes infrastructure events with spatial filtering to notify nearby citizens,
businesses, and district systems of network modifications.
"""
from dataclasses import dataclass
from typing import List, Callable, Dict, Any, Tuple
import math


@dataclass
class InfrastructureEvent:
    event_type: str  # e.g. 'METRO_STATION_OPENED', 'ROAD_OPENED', 'ROAD_CLOSED'
    item_id: str
    item_type: str
    x: float
    z: float
    radius: float
    metadata: Dict[str, Any]


class EventDispatcher:
    def __init__(self):
        self._listeners: List[Callable[[InfrastructureEvent], None]] = []
        self._event_history: List[InfrastructureEvent] = []

    def subscribe(self, listener: Callable[[InfrastructureEvent], None]) -> None:
        self._listeners.append(listener)

    def publish(
        self,
        event_type: str,
        item_id: str,
        item_type: str,
        x: float,
        z: float,
        radius: float = 1200.0,
        metadata: Optional[Dict[str, Any]] = None
    ) -> InfrastructureEvent:
        event = InfrastructureEvent(
            event_type=event_type,
            item_id=item_id,
            item_type=item_type,
            x=x,
            z=z,
            radius=radius,
            metadata=metadata or {},
        )
        self._event_history.append(event)
        if len(self._event_history) > 100:
            self._event_history.pop(0)

        for listener in list(self._listeners):
            try:
                listener(event)
            except Exception:
                pass

        return event

    def get_recent_events(self, limit: int = 20) -> List[dict]:
        return [
            {
                "event_type": e.event_type,
                "item_id": e.item_id,
                "item_type": e.item_type,
                "x": round(e.x, 1),
                "z": round(e.z, 1),
                "radius": e.radius,
                "metadata": e.metadata,
            }
            for e in self._event_history[-limit:]
        ]
