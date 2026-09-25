"""
METACITY — Business Model
Represents commercial, industrial, and office businesses that employ citizens,
serve customers, and generate economic revenue.
"""
from dataclasses import dataclass, field
from typing import List, Optional


@dataclass
class Business:
    id: str
    building_id: str
    name: str
    business_type: str  # 'office', 'factory', 'restaurant', 'shop', 'supermarket', 'hospital', 'service'
    district_id: str
    x: float
    z: float
    capacity: int = 50
    employees: List[str] = field(default_factory=list)
    customers: List[str] = field(default_factory=list)
    daily_revenue: float = 0.0
    daily_expenses: float = 0.0
    is_open: bool = True

    def add_employee(self, citizen_id: str) -> bool:
        if citizen_id not in self.employees:
            self.employees.append(citizen_id)
            return True
        return False

    def add_customer(self, citizen_id: str, spend_amount: float = 25.0) -> bool:
        if len(self.customers) < self.capacity:
            if citizen_id not in self.customers:
                self.customers.append(citizen_id)
            self.daily_revenue += spend_amount
            return True
        return False

    def remove_customer(self, citizen_id: str) -> None:
        if citizen_id in self.customers:
            self.customers.remove(citizen_id)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "building_id": self.building_id,
            "name": self.name,
            "type": self.business_type,
            "district_id": self.district_id,
            "x": round(self.x, 1),
            "z": round(self.z, 1),
            "employees_count": len(self.employees),
            "customers_count": len(self.customers),
            "capacity": self.capacity,
            "daily_revenue": round(self.daily_revenue, 2),
            "daily_profit": round(self.daily_revenue - self.daily_expenses, 2),
            "is_open": self.is_open,
        }
