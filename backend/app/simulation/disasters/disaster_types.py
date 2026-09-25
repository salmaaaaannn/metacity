"""
METACITY — Disaster Data Types, Incidents & Damage States (Phase 4)
"""
from enum import Enum
from dataclasses import dataclass, field, asdict
from typing import Dict, List, Optional, Any
import uuid
import time


class DisasterType(str, Enum):
    FLOOD = "FLOOD"
    FIRE = "FIRE"
    EARTHQUAKE = "EARTHQUAKE"
    HEATWAVE = "HEATWAVE"
    STORM = "STORM"


class DamageState(str, Enum):
    NONE = "NONE"
    MINOR = "MINOR"
    MODERATE = "MODERATE"
    SEVERE = "SEVERE"
    DESTROYED = "DESTROYED"


class IncidentStatus(str, Enum):
    ACTIVE = "ACTIVE"
    CONTAINED = "CONTAINED"
    RECOVERING = "RECOVERING"
    RESOLVED = "RESOLVED"


@dataclass
class DisasterIncident:
    id: str = field(default_factory=lambda: str(uuid.uuid4())[:8])
    disaster_type: DisasterType = DisasterType.FLOOD
    severity: int = 2  # 0 to 4
    status: IncidentStatus = IncidentStatus.ACTIVE
    epicenter_x: float = 4000.0
    epicenter_z: float = 4000.0
    radius: float = 1200.0
    duration_seconds: float = 180.0
    elapsed_seconds: float = 0.0
    started_at: float = field(default_factory=time.time)
    affected_building_ids: List[str] = field(default_factory=list)
    affected_road_ids: List[str] = field(default_factory=list)
    evacuated_citizens: int = 0
    damage_cost: float = 0.0
    repair_progress: float = 0.0  # 0.0 to 1.0
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        d = asdict(self)
        d["disaster_type"] = self.disaster_type.value if isinstance(self.disaster_type, DisasterType) else self.disaster_type
        d["status"] = self.status.value if isinstance(self.status, IncidentStatus) else self.status
        return d
