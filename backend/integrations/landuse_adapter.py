# import requests
# from typing import Optional


# OVERPASS_URL = "https://overpass-api.de/api/interpreter"


# def infer_landuse_score(latitude: float, longitude: float) -> Optional[float]:
# 	"""Infer dominant nearby landuse via OSM and score suitability.
# 	Returns higher score for residential/commercial/industrial; lower for conservation/wetland.
# 	"""
# 	query = f"""
# 	[out:json][timeout:15];
# 	(
# 	  way["landuse"](around:500,{latitude},{longitude});
# 	  relation["landuse"](around:500,{latitude},{longitude});
# 	);
# 	out tags 5;
# 	"""
# 	try:
# 		resp = requests.post(OVERPASS_URL, data={"data": query}, timeout=5)
# 		resp.raise_for_status()
# 		js = resp.json()
# 		if not js.get("elements"):
# 			return None
# 		best = None
# 		for el in js["elements"]:
# 			landuse = (el.get("tags") or {}).get("landuse")
# 			if not landuse:
# 				continue
# 			lu = landuse.lower()
# 			if lu in ("residential", "commercial", "industrial", "retail"):
# 				best = max(best or 0, 80)
# 			elif lu in ("farmland", "farmyard", "orchard"):
# 				best = max(best or 0, 60)
# 			elif lu in ("forest", "conservation", "meadow", "wetland"):
# 				best = max(best or 0, 30)
# 			else:
# 				best = max(best or 0, 50)
# 		return float(best) if best is not None else None
# 	except Exception:
# 		return None




import requests
from typing import Optional
# Import the water detection logic for global synchronization
from backend.integrations.water_adapter import estimate_water_proximity_score

OVERPASS_URL = "https://overpass-api.de/api/interpreter"

def infer_landuse_score(latitude: float, longitude: float) -> Optional[float]:
    """
    Infer dominant nearby landuse via OSM and score suitability.
    STRICT 0.0 for water bodies.
    Returns higher score for residential/commercial; lower for conservation/wetland.
    """
    # 1. KILLER FILTER: Check if the location is on water first
    # This handles the Atlantic Ocean, Hussain Sagar, and other global water bodies.
    w_score, w_dist, _ = estimate_water_proximity_score(latitude, longitude)
    if w_score == 0.0 or (w_dist is not None and w_dist < 0.02):
        return 0.0

    # 2. Proceed with Landuse Query only if on Land
    query = f"""
    [out:json][timeout:15];
    (
      way["landuse"](around:500,{latitude},{longitude});
      relation["landuse"](around:500,{latitude},{longitude});
    );
    out tags 5;
    """
    try:
        resp = requests.post(OVERPASS_URL, data={"data": query}, timeout=5)
        resp.raise_for_status()
        js = resp.json()
        
        if not js.get("elements"):
            # Return a neutral-low score if no landuse is specified on land
            return 40.0
            
        best = None
        for el in js["elements"]:
            landuse = (el.get("tags") or {}).get("landuse")
            if not landuse:
                continue
            lu = landuse.lower()
            
            # Suitability Heuristic
            if lu in ("residential", "commercial", "industrial", "retail"):
                best = max(best or 0, 80)
            elif lu in ("farmland", "farmyard", "orchard"):
                best = max(best or 0, 60)
            elif lu in ("forest", "conservation", "meadow", "grass", "wetland"):
                best = max(best or 0, 30)
            else:
                best = max(best or 0, 50)
                
        return float(best) if best is not None else 40.0
    except Exception:
        # Fallback for API failures on land
        return 40.0