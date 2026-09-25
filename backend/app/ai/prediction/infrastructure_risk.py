"""
METACITY — Infrastructure Failure Risk & Explainable Assessment (Phase 5)
Evaluates simulated risk levels (LOW, MEDIUM, HIGH, CRITICAL) with causal explanations.
"""
from typing import Dict, List, Any

def assess_infrastructure_risks(
    infrastructure_items: List[Dict[str, Any]],
    environment_state: Any = None,
    disasters_count: int = 0
) -> List[Dict[str, Any]]:
    risk_assessments = []

    for item in infrastructure_items:
        itype = item.get("item_type", "road")
        condition = item.get("condition", 1.0)
        upgrade_lvl = item.get("upgrade_level", 1)
        name = item.get("name", "Asset")
        item_id = item.get("id", "")

        risk_score = 0
        reasons = []

        # Condition factor
        if condition < 0.4:
            risk_score += 45
            reasons.append(f"Severe physical wear: asset condition at {int(condition * 100)}%")
        elif condition < 0.7:
            risk_score += 25
            reasons.append(f"Degraded structural condition: {int(condition * 100)}%")

        # Heavy usage & low upgrade
        if itype in ["bridge", "highway", "power_plant"] and upgrade_lvl == 1:
            risk_score += 20
            reasons.append("High municipal throughput on baseline Tier 1 structure")

        # Active environmental stress
        if disasters_count > 0:
            risk_score += 15
            reasons.append("Proximity to active city hazard exposure zone")

        # Determine level
        if risk_score >= 60:
            level = "CRITICAL"
        elif risk_score >= 40:
            level = "HIGH"
        elif risk_score >= 20:
            level = "MEDIUM"
        else:
            level = "LOW"
            reasons.append("Optimal structural condition and nominal service loads")

        risk_assessments.append({
            "item_id": item_id,
            "name": name,
            "item_type": itype,
            "risk_level": level,
            "risk_score": risk_score,
            "condition_pct": round(condition * 100, 1),
            "reasons": reasons,
            "recommended_action": "Execute immediate reinforcement upgrade" if level in ["CRITICAL", "HIGH"] else "Routine periodic inspection"
        })

    return risk_assessments
