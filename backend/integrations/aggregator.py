from typing import Dict, Optional
from backend.ml.predict import predict_suitability_ml

def _normalize_optional(value: Optional[float], default: float) -> float:
    """Safely convert and clamp values between 0 and 100."""
    if value is None:
        return default
    try:
        v = float(value)
        return max(0.0, min(100.0, v))
    except (ValueError, TypeError):
        return default

def compute_suitability_score(
    *,
    rainfall_score: Optional[float],
    flood_risk_score: Optional[float],
    landslide_risk_score: Optional[float],
    soil_quality_score: Optional[float],
    proximity_score: Optional[float],
    water_proximity_score: Optional[float] = None,
    pollution_score: Optional[float] = None,
    landuse_score: Optional[float] = None,
) -> Dict:
    """
    Combines factors into a score. 
    ENFORCES STRICT 0.0 for all terrestrial factors if on a water body.
    """
    
    factors = {
        "rainfall": _normalize_optional(rainfall_score, 50.0),
        "flood": _normalize_optional(flood_risk_score, 50.0),
        "landslide": _normalize_optional(landslide_risk_score, 50.0),
        "soil": _normalize_optional(soil_quality_score, 50.0),
        "proximity": _normalize_optional(proximity_score, 50.0),
        "water": _normalize_optional(water_proximity_score, 50.0),
        "pollution": _normalize_optional(pollution_score, 50.0),
        "landuse": _normalize_optional(landuse_score, 50.0),
    }

    # Add ML-friendly raw risk signals
    # Convert back to flood RISK for penalties
    # flood_risk = 100.0 - factors["flood"]
    raw_risks = {
        "flood_x_water": (100 - factors["flood"]) * (100 - factors["water"]) / 100.0,
        "rain_x_slope": factors["rainfall"] * (100 - factors["landslide"]) / 100.0,
    }


    is_hard_unsuitable = factors["water"] == 0
    

    if is_hard_unsuitable:
        
        for key in factors:
            factors[key] = 0.0
        score = 0.0
    else:
        features = [
            factors["rainfall"],
            factors["flood"],
            factors["landslide"],
            factors["soil"],
            factors["proximity"],
            factors["water"],
            factors["pollution"],
            factors["landuse"],
            raw_risks["flood_x_water"],
            raw_risks["rain_x_slope"],
        ]
        # Domain-driven base score (weights reflect real importance)
        # DOMAIN-WEIGHTED BASE SCORE (deterministic & monotonic)
        base_score = (
            0.22 * factors["landslide"] +
            0.20 * factors["flood"] +
            0.18 * factors["water"] +
            0.15 * factors["soil"] +
            0.10 * factors["landuse"] +
            0.08 * factors["proximity"] +
            0.04 * factors["rainfall"] +
            0.03 * factors["pollution"]
        )



        # ML prediction
        ml_score = predict_suitability_ml(features)

        # ML can only adjust ±15%
        score = 0.85 * base_score + 0.15 * ml_score


        
        # 🚨 SAFETY CLAMP: Forest / Protected land is NON-BUILDABLE
        # 🚨 LEGAL FEASIBILITY GATE (LANDUSE)
        if landuse_score is not None:
            try:
                lu = float(landuse_score)
            except:
                lu = 50.0

            if lu <= 20:          # Forest / Wetland / Protected
                score *= 0.2
            elif lu <= 40:        # Agricultural / semi-restricted
                score *= 0.7
            # else: buildable land → no change

    # Soft interaction penalties
    if raw_risks["flood_x_water"] > 50:
        score *= 0.85  # flood amplification near water

    if raw_risks["rain_x_slope"] > 60:
        score *= 0.90  # rain-induced landslide risk
    # 🔴 Dominant safety constraints
    # HARD SAFETY CAPS
    if factors["water"] < 50:
        score = min(score, 60)

    if factors["flood"] < 50:
        score = min(score, 65)

    if factors["landslide"] < 50:
        score = min(score, 65)


    return {
        "score": round(score, 2),
        "factors": factors,
        "raw_risks": raw_risks,
        "is_hard_unsuitable": is_hard_unsuitable
    }
