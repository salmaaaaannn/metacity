from dataclasses import dataclass
from typing import Tuple

@dataclass
class District:
    id: str
    name: str
    type: str
    development_level: float
    population: int
    area: float
    land_value: float
    average_income: float
    housing_capacity: int
    employment_capacity: int
    education_access: float
    healthcare_access: float
    transport_access: float
    safety: float
    environment_quality: float
    infrastructure_quality: float
    bounds: Tuple[float, float, float, float]
    color: str
    
    def get_satisfaction_score(self) -> float:
        score = (
            self.development_level * 0.2 +
            self.education_access * 0.15 +
            self.healthcare_access * 0.15 +
            self.transport_access * 0.15 +
            self.safety * 0.2 +
            self.environment_quality * 0.15
        )
        return min(max(score, 0.0), 1.0)
        
    def get_building_density(self) -> float:
        return self.development_level
        
    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "type": self.type,
            "development_level": self.development_level,
            "population": self.population,
            "area": self.area,
            "land_value": self.land_value,
            "average_income": self.average_income,
            "bounds": self.bounds,
            "color": self.color,
            "satisfaction": self.get_satisfaction_score(),
            "density": self.get_building_density()
        }
