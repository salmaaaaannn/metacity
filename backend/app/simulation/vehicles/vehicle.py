from dataclasses import dataclass
from typing import List, Optional
import math

@dataclass
class Vehicle:
    id: str
    vehicle_type: str
    current_x: float
    current_z: float
    destination_x: float
    destination_z: float
    speed: float
    path: List[tuple]
    path_index: int
    passenger_count: int
    capacity: int
    route_id: Optional[str]
    heading: float = 0.0
    
    def move_step(self, speed_multiplier: float) -> bool:
        if not self.path or self.path_index >= len(self.path):
            return True
            
        target = self.path[self.path_index]
        dx = target[0] - self.current_x
        dz = target[1] - self.current_z
        dist = math.sqrt(dx*dx + dz*dz)
        
        actual_speed = self.speed * speed_multiplier
        
        if dist > 0:
            self.heading = math.atan2(dx, dz)
            
        if dist <= actual_speed:
            self.current_x = target[0]
            self.current_z = target[1]
            self.path_index += 1
            if self.path_index >= len(self.path):
                return True
        else:
            self.current_x += (dx/dist) * actual_speed
            self.current_z += (dz/dist) * actual_speed
            
        return False
        
    def to_position_dict(self) -> dict:
        return {
            "id": self.id,
            "x": self.current_x,
            "z": self.current_z,
            "type": self.vehicle_type,
            "heading": self.heading
        }
