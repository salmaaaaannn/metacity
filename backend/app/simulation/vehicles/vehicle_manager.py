class VehicleManager:
    def __init__(self):
        self.vehicles = {}
        
    def update(self, speed_multiplier: float):
        to_remove = []
        for vid, v in self.vehicles.items():
            reached = v.move_step(speed_multiplier)
            if reached:
                to_remove.append(vid)
                
        for vid in to_remove:
            del self.vehicles[vid]
            
    def get_positions(self) -> list:
        return [v.to_position_dict() for v in self.vehicles.values()]
