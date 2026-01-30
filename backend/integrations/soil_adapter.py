# from typing import Optional
# import random


# def estimate_soil_quality_score(latitude: float, longitude: float) -> Optional[float]:
# 	"""Placeholder soil quality score. Replace with real soil datasets or APIs.
# 	Currently returns a deterministic pseudo-random score based on rounded coords.
# 	"""
# 	seed = int(round(latitude * 1000)) ^ int(round(longitude * 1000))
# 	random.seed(seed)
# 	return float(round(40 + random.random() * 60, 2))




from typing import Optional
# import random
from backend.integrations.rainfall_adapter import estimate_rainfall_score
from backend.integrations.pylandslide_adapter import estimate_slope
# Import your existing water detection logic
from backend.integrations.water_adapter import estimate_water_proximity_score

def _drainage_factor(slope_pct):
    """
    Flat land drains poorly, gentle slopes drain best.
    """
    if slope_pct < 1:
        return 0.4
    elif slope_pct < 5:
        return 0.9
    elif slope_pct < 15:
        return 0.7
    else:
        return 0.5


def _rain_saturation_factor(rain_mm_60d):
    """
    High rainfall reduces soil bearing capacity.
    """
    if rain_mm_60d is None:
        return 0.8
    return max(0.3, 1.0 - (rain_mm_60d / 700.0))

def estimate_soil_quality_score(latitude: float, longitude: float) -> Optional[float]:
    """
    Returns soil quality score (0–100).
    Higher = better bearing capacity & drainage.
    """

    # 1. WATER HARD FILTER
    water_score, water_dist, _ = estimate_water_proximity_score(latitude, longitude)
    if water_score == 0.0 or (water_dist is not None and water_dist < 0.02):
        return 0.0

    # 2. FETCH SUPPORTING SIGNALS
    rain_score, rain_mm = estimate_rainfall_score(latitude, longitude)
    slope = estimate_slope(latitude, longitude)

    # 3. COMPUTE DRAINAGE & SATURATION
    drainage = _drainage_factor(slope)
    saturation = _rain_saturation_factor(rain_mm)

    # 4. BASE SOIL CAPACITY (India-wide heuristic)
    # base_soil = 75.0  # typical mixed alluvial/loam baseline
    if slope < 1:
        base_soil = 65.0   # clayey / floodplain
    elif slope < 5:
        base_soil = 80.0   # ideal loam
    elif slope < 15:
        base_soil = 70.0
    else:
        base_soil = 60.0

    # 5. FINAL SOIL QUALITY
    soil_quality = (
        0.5 * base_soil +
        25 * drainage +
        25 * saturation
    )
    soil_quality = max(30, min(85, soil_quality))

    return round(soil_quality, 2)
