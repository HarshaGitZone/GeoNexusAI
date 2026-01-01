from typing import Dict, Optional
def _normalize_optional(value: Optional[float], default: float) -> float:
	if value is None:
		return default
	try:
		v = float(value)
		if v < 0:
			return 0.0
		if v > 100:
			return 100.0
		return v
	except Exception:
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
) -> Dict[str, float]:
	"""Combine factors into a single suitability score in [0, 100].
	All inputs should already be normalized to 0-100 where HIGHER = BETTER for suitability.
	Assumptions:
	- rainfall_score: higher = less rainfall = better (adapters return low scores for heavy rain)
	- flood_risk_score: higher = safer (already inverted by adapters)
	- landslide_risk_score: higher = safer (already inverted by adapters)
	- soil_quality_score: higher = better
	- proximity_score: higher = better (closer to roads/markets)
	- water_proximity_score: higher = better (further from water = safer)
	- pollution_score: higher = better (lower PM2.5 by adapters)
	- landuse_score: higher = better (more compatible zoning)
	Missing values are replaced with neutral 50.
	Weights can be tuned later or made configurable.
	"""
	# Replace None with neutral values
	rainfall = _normalize_optional(rainfall_score, 50.0)
	flood = _normalize_optional(flood_risk_score, 50.0)
	landslide = _normalize_optional(landslide_risk_score, 50.0)
	soil = _normalize_optional(soil_quality_score, 50.0)
	proximity = _normalize_optional(proximity_score, 50.0)
	water = _normalize_optional(water_proximity_score, 50.0)
	pollution = _normalize_optional(pollution_score, 50.0)
	landuse = _normalize_optional(landuse_score, 50.0)

	# Simple weighted sum (weights sum to 1.0)
	weights = {
		"rainfall": 0.10,
		"flood": 0.16,
		"landslide": 0.10,
		"soil": 0.16,
		"proximity": 0.10,
		"water": 0.18,
		"pollution": 0.10,
		"landuse": 0.10,
	}

	# calculate raw weighted score
	contributions = {
		"rainfall": round(rainfall * weights["rainfall"], 3),
		"flood": round(flood * weights["flood"], 3),
		"landslide": round(landslide * weights["landslide"], 3),
		"soil": round(soil * weights["soil"], 3),
		"proximity": round(proximity * weights["proximity"], 3),
		"water": round(water * weights["water"], 3),
		"pollution": round(pollution * weights["pollution"], 3),
		"landuse": round(landuse * weights["landuse"], 3),
	}

	score = sum(contributions.values())

	# neutral contribution (if all factors were neutral 50)
	neutral_contrib = {k: round(50.0 * w, 3) for k, w in weights.items()}

	# compute deltas from neutral: negative means the factor drags the score down
	deltas = {k: round(contributions[k] - neutral_contrib[k], 3) for k in contributions}

	# sort contributors
	negatives = sorted(((k, v) for k, v in deltas.items() if v < 0), key=lambda x: x[1])
	positives = sorted(((k, v) for k, v in deltas.items() if v >= 0), key=lambda x: -x[1])

	return {
		"score": round(score, 2),
		"factors": {
			"rainfall": rainfall,
			"flood": flood,
			"landslide": landslide,
			"soil": soil,
			"proximity": proximity,
			"water": water,
			"pollution": pollution,
			"landuse": landuse,
		},
		"weights": weights,
		"contributions": contributions,
		"neutral_contribution": neutral_contrib,
		"deltas": deltas,
		"top_negative_contributors": [ {"factor": k, "delta": v} for k, v in negatives[:3] ],
		"top_positive_contributors": [ {"factor": k, "delta": v} for k, v in positives[:3] ],
	}


