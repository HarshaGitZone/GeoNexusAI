# from typing import Dict, Optional

# def _normalize_optional(value: Optional[float], default: float) -> float:
#     """Safely convert and clamp values between 0 and 100."""
#     if value is None:
#         return default
#     try:
#         v = float(value)
#         return max(0.0, min(100.0, v))
#     except (ValueError, TypeError):
#         return default

# def compute_suitability_score(
#     *,
#     rainfall_score: Optional[float],
#     flood_risk_score: Optional[float],
#     landslide_risk_score: Optional[float],
#     soil_quality_score: Optional[float],
#     proximity_score: Optional[float],
#     water_proximity_score: Optional[float] = None,
#     pollution_score: Optional[float] = None,
#     landuse_score: Optional[float] = None,
# ) -> Dict:
#     """
#     Combine factors into a single suitability score in [0, 100].
#     Implements a Hard Floor: If a site is on water or has critical flood risk, 
#     the final score is forced to 0.
#     """
    
#     # 1. Normalize all inputs (None -> 50.0 neutral)
#     factors = {
#         "rainfall": _normalize_optional(rainfall_score, 50.0),
#         "flood": _normalize_optional(flood_risk_score, 50.0),
#         "landslide": _normalize_optional(landslide_risk_score, 50.0),
#         "soil": _normalize_optional(soil_quality_score, 50.0),
#         "proximity": _normalize_optional(proximity_score, 50.0),
#         "water": _normalize_optional(water_proximity_score, 50.0),
#         "pollution": _normalize_optional(pollution_score, 50.0),
#         "landuse": _normalize_optional(landuse_score, 50.0),
#     }

#     # 2. Define Weights (must sum to 1.0)
#     weights = {
#         "rainfall": 0.10,
#         "flood": 0.16,
#         "landslide": 0.10,
#         "soil": 0.16,
#         "proximity": 0.10,
#         "water": 0.18,
#         "pollution": 0.10,
#         "landuse": 0.10,
#     }

#     # 3. Calculate weighted contributions
#     contributions = {k: round(factors[k] * weights[k], 3) for k in weights}
    
#     # 4. PRIMARY LOGIC UPDATE: Hard Floor/Killer Filters
#     # If the score for water or flood is 0, the entire land is unsuitable.
#     is_hard_unsuitable = factors["water"] == 0 or factors["flood"] == 0
    
#     if is_hard_unsuitable:
#         score = 0.0
#     else:
#         score = round(sum(contributions.values()), 2)

#     # 5. Compute Explainability Data (Deltas from neutral 50)
#     neutral_val = 50.0
#     deltas = {}
#     for k in weights:
#         neutral_contrib = neutral_val * weights[k]
#         deltas[k] = round(contributions[k] - neutral_contrib, 3)

#     # If hard unsuitable, overwrite deltas to highlight the specific reason
#     if is_hard_unsuitable:
#         for k in deltas:
#             if factors[k] == 0:
#                 # Assign a heavy negative delta to the factor(s) that caused the 0
#                 deltas[k] = -50.0 
#             else:
#                 # Neutralize other factors so they don't appear to "help" a water body
#                 deltas[k] = 0.0

#     # 6. Sort Contributors for Frontend Analysis
#     negatives = sorted(((k, v) for k, v in deltas.items() if v < 0), key=lambda x: x[1])
#     positives = sorted(((k, v) for k, v in deltas.items() if v > 0), key=lambda x: -x[1])

#     # 7. Final Response Structure
#     return {
#         "score": score,
#         "is_hard_unsuitable": is_hard_unsuitable,
#         "factors": factors,
#         "weights": weights,
#         "contributions": contributions,
#         "deltas": deltas,
#         "top_negative_contributors": [{"factor": k, "delta": v} for k, v in negatives[:3]],
#         "top_positive_contributors": [{"factor": k, "delta": v} for k, v in positives[:3]],
#     }

# from typing import Dict, Optional

# def _normalize_optional(value: Optional[float], default: float) -> float:
#     """Safely convert and clamp values between 0 and 100."""
#     if value is None:
#         return default
#     try:
#         v = float(value)
#         return max(0.0, min(100.0, v))
#     except (ValueError, TypeError):
#         return default

# def compute_suitability_score(
#     *,
#     rainfall_score: Optional[float],
#     flood_risk_score: Optional[float],
#     landslide_risk_score: Optional[float],
#     soil_quality_score: Optional[float],
#     proximity_score: Optional[float],
#     water_proximity_score: Optional[float] = None,
#     pollution_score: Optional[float] = None,
#     landuse_score: Optional[float] = None,
# ) -> Dict:
#     """
#     Combine factors into a single suitability score.
#     FORCES ZERO if the point is on a water body (Arabian Sea, Lakes, etc).
#     """
    
#     # 1. Normalize all inputs
#     factors = {
#         "rainfall": _normalize_optional(rainfall_score, 50.0),
#         "flood": _normalize_optional(flood_risk_score, 50.0),
#         "landslide": _normalize_optional(landslide_risk_score, 50.0),
#         "soil": _normalize_optional(soil_quality_score, 50.0),
#         "proximity": _normalize_optional(proximity_score, 50.0),
#         "water": _normalize_optional(water_proximity_score, 50.0),
#         "pollution": _normalize_optional(pollution_score, 50.0),
#         "landuse": _normalize_optional(landuse_score, 50.0),
#     }

#     # 2. HARD CONSTRAINT CHECK (The Arabian Sea Fix)
#     # If water score is 0, the site is UNSUITABLE regardless of other factors.
#     is_on_water = factors["water"] == 0
    
#     if is_on_water:
#         # Zero out land-dependent factors because they don't exist in the ocean
#         factors["soil"] = 0.0
#         factors["landuse"] = 0.0
#         factors["flood"] = 0.0
#         score = 0.0
#     else:
#         # Standard weighted calculation
#         weights = {
#             "rainfall": 0.10, "flood": 0.16, "landslide": 0.10, "soil": 0.16,
#             "proximity": 0.10, "water": 0.18, "pollution": 0.10, "landuse": 0.10,
#         }
#         contributions = {k: round(factors[k] * weights[k], 3) for k in weights}
#         score = round(sum(contributions.values()), 2)

#     # 3. Compute Explanation (Deltas)
#     deltas = {}
#     for k in factors:
#         # If on water, emphasize the water failure
#         if is_on_water:
#             deltas[k] = -50.0 if k == "water" else 0.0
#         else:
#             deltas[k] = round((factors[k] * 0.125) - (50.0 * 0.125), 3) # Simplified delta

#     negatives = sorted(((k, v) for k, v in deltas.items() if v < 0), key=lambda x: x[1])
#     positives = sorted(((k, v) for k, v in deltas.items() if v > 0), key=lambda x: -x[1])

#     return {
#         "score": score,
#         "is_hard_unsuitable": is_on_water,
#         "factors": factors,
#         "deltas": deltas,
#         "top_negative_contributors": [{"factor": k, "delta": v} for k, v in negatives[:3]],
#         "top_positive_contributors": [{"factor": k, "delta": v} for k, v in positives[:3]],
#     }




# from typing import Dict, Optional

# def _normalize_optional(value: Optional[float], default: float) -> float:
#     """Safely convert and clamp values between 0 and 100."""
#     if value is None:
#         return default
#     try:
#         v = float(value)
#         return max(0.0, min(100.0, v))
#     except (ValueError, TypeError):
#         return default

# def compute_suitability_score(
#     *,
#     rainfall_score: Optional[float],
#     flood_risk_score: Optional[float],
#     landslide_risk_score: Optional[float],
#     soil_quality_score: Optional[float],
#     proximity_score: Optional[float],
#     water_proximity_score: Optional[float] = None,
#     pollution_score: Optional[float] = None,
#     landuse_score: Optional[float] = None,
# ) -> Dict:
#     """Combines factors into a score. STRICT 0.0 for water/active flood."""
    
#     factors = {
#         "rainfall": _normalize_optional(rainfall_score, 50.0),
#         "flood": _normalize_optional(flood_risk_score, 50.0),
#         "landslide": _normalize_optional(landslide_risk_score, 50.0),
#         "soil": _normalize_optional(soil_quality_score, 50.0),
#         "proximity": _normalize_optional(proximity_score, 50.0),
#         "water": _normalize_optional(water_proximity_score, 50.0),
#         "pollution": _normalize_optional(pollution_score, 50.0),
#         "landuse": _normalize_optional(landuse_score, 50.0),
#     }

#     # Hard Logic: If on water or active flooding, force everything to zero
#     is_hard_unsuitable = factors["water"] == 0 or factors["flood"] == 0
    
#     if is_hard_unsuitable:
#         # Override factors that don't exist on water
#         factors["soil"] = 0.0      # No soil in the ocean
#         factors["landuse"] = 0.0   # No human landuse in the ocean
#         factors["flood"] = 0.0     # Flood risk is irrelevant if already submerged
#         score = 0.0
#     else:
#         weights = {
#             "rainfall": 0.10, "flood": 0.16, "landslide": 0.10, "soil": 0.16,
#             "proximity": 0.10, "water": 0.18, "pollution": 0.10, "landuse": 0.10,
#         }
#         score = round(sum(factors[k] * weights[k] for k in weights), 2)

#     return {
#         "score": score,
#         "factors": factors,
#         "is_hard_unsuitable": is_hard_unsuitable
#     }


from typing import Dict, Optional

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

    # Hard Logic: If on water, force every suitability factor to zero.
    # We prioritize 'water' as the primary killer filter.
    is_hard_unsuitable = factors["water"] == 0
    
    # if is_hard_unsuitable:
    #     # Override ALL factors because they do not exist or matter for water-based suitability.
    #     for key in factors:
    #         factors[key] = 0.0
    #     score = 0.0
    # else:
    #     # Check secondary killer filter: active/critical flood risk on land.
    #     if factors["flood"] == 0:
    #         is_hard_unsuitable = True
    #         factors["soil"] = 0.0
    #         factors["landuse"] = 0.0
    #         factors["landslide"] = 0.0
    #         score = 0.0
    #     else:
    #         # Weighted calculation for actual land.
    #         weights = {
    #             "rainfall": 0.10, "flood": 0.16, "landslide": 0.10, "soil": 0.16,
    #             "proximity": 0.10, "water": 0.18, "pollution": 0.10, "landuse": 0.10,
    #         }
    #         score = round(sum(factors[k] * weights[k] for k in weights), 2)

    # return {
    #     "score": score,
    #     "factors": factors,
    #     "is_hard_unsuitable": is_hard_unsuitable
    # }
    if is_hard_unsuitable:
        # Force ALL factors to 0 because they are irrelevant for suitability on water
        for key in factors:
            factors[key] = 0.0
        score = 0.0
    else:
        # Standard weighted model for actual land
        weights = {
            "rainfall": 0.10, "flood": 0.16, "landslide": 0.10, "soil": 0.16,
            "proximity": 0.10, "water": 0.18, "pollution": 0.10, "landuse": 0.10,
        }
        score = round(sum(factors[k] * weights[k] for k in weights), 2)

    return {"score": score, "factors": factors, "is_hard_unsuitable": is_hard_unsuitable}