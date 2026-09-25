from dataclasses import dataclass, field
from typing import Optional, List, Dict, Any

@dataclass
class WorldChunk:
    chunk_x: int
    chunk_z: int
    world_x: float
    world_z: float
    district_id: Optional[str]
    terrain_type: str
    buildings: List[dict] = field(default_factory=list)
    roads: List[dict] = field(default_factory=list)
    is_loaded: bool = False
