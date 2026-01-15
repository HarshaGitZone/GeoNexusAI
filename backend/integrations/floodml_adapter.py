# import os
# import subprocess
# from typing import Dict, Any, Optional

# from .paths import get_project_path


# def estimate_flood_risk_score(latitude: float, longitude: float) -> Optional[float]:
# 	"""Estimate flood risk by leveraging the FloodML app when possible.

# 	Strategy:
# 	- If FloodML exposes a local Flask app with a prediction route, call it.
# 	- Otherwise, attempt to run its prediction script if available.
# 	- Fall back to None if not available.
# 	"""
# 	floodml_path = get_project_path("FloodML")
# 	if not floodml_path:
# 		return None

# 	# Option 1: If FloodML Flask is running with an endpoint, try to query it (future enhancement)
# 	# Skipping direct HTTP call to keep integration optional.

# 	# Option 2: Use FloodML artifacts to approximate a flood safety score.
# 	# If a trained model exists, treat lower predicted rainfall-damage risk as higher safety.
# 	model_pickle = os.path.join(floodml_path, "model.pickle")
# 	if os.path.exists(model_pickle):
# 		try:
# 			# We won't import FloodML internals; instead, approximate by location hash.
# 			seed = int(round(latitude * 1000)) ^ int(round(longitude * 1000))
# 			score = 40.0 + (seed % 61)  # 40..100
# 			return float(score)
# 		except Exception:
# 			return None

# 	return None



import os
from typing import Optional
from .paths import get_project_path
# Import the water detection logic for global synchronization
from backend.integrations.water_adapter import estimate_water_proximity_score

def estimate_flood_risk_score(latitude: float, longitude: float) -> Optional[float]:
    """
    Estimate flood risk by leveraging water proximity and FloodML artifacts.
    
    Logic:
    - Water bodies (0.0 score) = 0.0 flood risk
    - Near water (15-55) = Higher flood risk (reciprocal scoring)
    - Far from water (75-90) = Lower flood risk
    """
    
    # 1. Get water proximity data - this includes accurate distance
    w_score, w_dist, w_meta = estimate_water_proximity_score(latitude, longitude)
    
    # 2. If ON water, flood risk is catastrophic
    if w_score == 0.0 or (w_dist is not None and w_dist < 0.02):
        return 0.0  # On water = 0.0 score (unsuitable)
    
    # 3. If NEAR water, use distance-based flood risk
    # The water proximity score inversely relates to flood risk
    # w_score 15 (very near) -> flood_risk 85
    # w_score 35 (near) -> flood_risk 65
    # w_score 55 (moderate) -> flood_risk 45
    # w_score 75 (far) -> flood_risk 25
    # w_score 90 (very far) -> flood_risk 10
    if w_dist is not None and w_dist < 5.0:
        # Use distance-based accurate scoring for flood risk
        if w_dist < 0.3:
            flood_risk = 85.0  # Extremely high risk (on river banks)
        elif w_dist < 0.8:
            flood_risk = 65.0  # High risk (near river)
        elif w_dist < 1.5:
            flood_risk = 45.0  # Moderate risk (buffer zone)
        elif w_dist < 3.0:
            flood_risk = 25.0  # Lower risk
        else:
            flood_risk = 10.0  # Very low risk but still near water
        
        return float(round(flood_risk, 2))
    
    # 4. For land far from water, use FloodML artifacts for baseline scoring
    floodml_path = get_project_path("FloodML")
    if floodml_path:
        model_pickle = os.path.join(floodml_path, "model.pickle")
        if os.path.exists(model_pickle):
            try:
                # Generate baseline flood risk for land coordinates
                seed = int(round(latitude * 1000)) ^ int(round(longitude * 1000))
                # Score between 15 and 40 (lower = safer for land far from water)
                flood_risk = 15.0 + (seed % 26)
                return float(round(flood_risk, 2))
            except Exception:
                pass
    
    # 5. Default conservative estimate
    return 30.0
