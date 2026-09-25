"""
METACITY — Dynamic City Budget System
Manages city treasury balance, dynamic maintenance accounting, tax revenues,
and construction transaction ledgers.
"""
from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional
import time
import uuid


@dataclass
class BudgetTransaction:
    id: str
    timestamp: float
    amount: float
    category: str  # 'construction', 'maintenance', 'tax', 'demolition', 'upgrade', 'fare'
    description: str
    balance_after: float

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "timestamp": self.timestamp,
            "amount": round(self.amount, 2),
            "category": self.category,
            "description": self.description,
            "balance_after": round(self.balance_after, 2),
        }


@dataclass
class BudgetIncome:
    property_tax: float
    business_tax: float
    transport_fares: float
    service_fees: float
    industrial_tax: float
    total: float


@dataclass
class BudgetExpenses:
    road_maintenance: float
    highway_maintenance: float
    bridge_maintenance: float
    metro_operation: float
    railway_operation: float
    bus_operation: float
    hospital_operation: float
    school_operation: float
    police_operation: float
    fire_operation: float
    utilities: float
    waste_management: float
    parks_maintenance: float
    emergency_response: float
    total: float


@dataclass
class CityBudget:
    balance: float = 50_000_000.0
    income: BudgetIncome = None
    expenses: BudgetExpenses = None
    net_monthly: float = 0.0
    currency: str = "MC"
    transactions: List[BudgetTransaction] = field(default_factory=list)

    def deduct_construction(self, amount: float, description: str, category: str = "construction") -> bool:
        """Deduct construction expense from budget and record transaction."""
        self.balance -= amount
        tx = BudgetTransaction(
            id=f"tx_{uuid.uuid4().hex[:8]}",
            timestamp=time.time(),
            amount=-amount,
            category=category,
            description=description,
            balance_after=self.balance,
        )
        self.transactions.append(tx)
        if len(self.transactions) > 200:
            self.transactions.pop(0)
        return True

    def record_revenue(self, amount: float, description: str, category: str = "tax") -> None:
        self.balance += amount
        tx = BudgetTransaction(
            id=f"tx_{uuid.uuid4().hex[:8]}",
            timestamp=time.time(),
            amount=amount,
            category=category,
            description=description,
            balance_after=self.balance,
        )
        self.transactions.append(tx)
        if len(self.transactions) > 200:
            self.transactions.pop(0)

    def calculate_income(self, world: Any) -> BudgetIncome:
        prop_tax = sum([d.population * d.average_income * 0.08 for d in world.districts.values()]) if hasattr(world, "districts") else 1_280_000
        biz_tax = sum([d.employment_capacity * 500 * d.development_level for d in world.districts.values()]) if hasattr(world, "districts") else 920_000

        # Transit fares derived from actual ridership if available
        fares = 450_000.0
        if hasattr(world, "metro_system"):
            fares += world.metro_system.total_metro_ridership * 3.5

        serv_fees = 50_000.0
        ind_tax = sum([d.area * 10 * d.development_level for d in world.districts.values() if d.type == 'industrial']) if hasattr(world, "districts") else 500_000

        total = prop_tax + biz_tax + fares + serv_fees + ind_tax
        return BudgetIncome(prop_tax, biz_tax, fares, serv_fees, ind_tax, total)

    def calculate_expenses(self, world: Any) -> BudgetExpenses:
        # Baseline operations
        base_road = 180000.0
        base_hwy = 120000.0
        base_bridge = 45000.0
        base_metro = 350000.0
        base_rail = 85000.0
        base_bus = 95000.0
        base_hosp = 280000.0
        base_school = 210000.0
        base_police = 150000.0
        base_fire = 120000.0
        base_util = 95000.0
        base_waste = 65000.0
        base_park = 40000.0
        base_emerg = 55000.0

        # Dynamic additional maintenance from user-constructed infrastructure items
        if hasattr(world, "infrastructure_manager") and world.infrastructure_manager:
            for item in world.infrastructure_manager.items.values():
                m = item.monthly_maintenance
                if item.item_type in ["road", "arterial"]:
                    base_road += m
                elif item.item_type == "highway":
                    base_hwy += m
                elif item.item_type == "bridge":
                    base_bridge += m
                elif item.item_type in ["metro_station", "metro_track"]:
                    base_metro += m
                elif item.item_type in ["bus_stop", "bus_depot"]:
                    base_bus += m
                elif item.item_type == "hospital":
                    base_hosp += m
                elif item.item_type == "school":
                    base_school += m
                elif item.item_type == "police":
                    base_police += m
                elif item.item_type == "fire":
                    base_fire += m
                elif item.item_type == "park":
                    base_park += m
                elif item.item_type in ["power_plant", "substation", "water_plant", "water_pipe"]:
                    base_util += m

        total = (
            base_road + base_hwy + base_bridge + base_metro + base_rail +
            base_bus + base_hosp + base_school + base_police + base_fire +
            base_util + base_waste + base_park + base_emerg
        )
        return BudgetExpenses(
            base_road, base_hwy, base_bridge, base_metro, base_rail,
            base_bus, base_hosp, base_school, base_police, base_fire,
            base_util, base_waste, base_park, base_emerg, total
        )

    def apply_monthly_tick(self, world: Any) -> None:
        self.income = self.calculate_income(world)
        self.expenses = self.calculate_expenses(world)
        self.net_monthly = self.income.total - self.expenses.total
        self.balance += self.net_monthly
        self.record_revenue(self.income.total, "Monthly city tax collection", category="tax")
        self.deduct_construction(self.expenses.total, "Monthly municipal operational expenses", category="maintenance")

    def to_dict(self) -> dict:
        return {
            "balance": round(self.balance, 2),
            "net_monthly": round(self.net_monthly, 2),
            "currency": self.currency,
            "income": self.income.__dict__ if self.income else {},
            "expenses": self.expenses.__dict__ if self.expenses else {},
            "recent_transactions": [t.to_dict() for t in self.transactions[-10:]],
        }

    def get_all_transactions(self) -> List[dict]:
        return [t.to_dict() for t in reversed(self.transactions)]
