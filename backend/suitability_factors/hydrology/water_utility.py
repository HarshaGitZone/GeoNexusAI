import requests
from math import radians, sin, cos, sqrt, atan2
from typing import Optional, Tuple, Dict

# --------------------------------------------------
# CONSTANTS & CONFIG
# --------------------------------------------------

NOMINATIM_REVERSE_URL = "https://nominatim.openstreetmap.org/reverse"
OVERPASS_URLS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.openstreetmap.ru/api/interpreter",
]

_HEADERS = {
    "User-Agent": "GeoAI_WaterUtility/11.0",
    "Accept": "application/json"
}

# --------------------------------------------------
# LOW-LEVEL HELPERS
# --------------------------------------------------

def _is_in_hardcoded_ocean(lat: float, lon: float) -> Tuple[bool, Optional[str]]:
    """
    Deep-ocean geometric fail-safe.
    Used ONLY when map-based detection is inconclusive.
    """

    # Deep Pacific Ocean
    if -50.0 <= lat <= 50.0 and (140.0 <= lon <= 180.0 or -180.0 <= lon <= -80.0):
        return True, "Deep Pacific Ocean"

    # Deep Atlantic Ocean
    if -50.0 <= lat <= 50.0 and -50.0 <= lon <= -20.0:
        return True, "Deep Atlantic Ocean"

    # Deep Indian Ocean (below 5°N to avoid India false positives)
    if -45.0 <= lat <= 5.0 and 50.0 <= lon <= 100.0:
        return True, "Deep Indian Ocean"

    return False, None


def _multi_scale_search(lat: float, lon: float) -> Tuple[bool, Optional[Dict]]:
    """
    High-precision named water detection.
    Scans local → global to catch lakes, rivers, reservoirs, seas.
    """
    for zoom in [18, 14, 8, 3]:
        try:
            params = {
                "format": "jsonv2",
                "lat": lat,
                "lon": lon,
                "zoom": zoom,
                "addressdetails": 1
            }
            resp = requests.get(
                NOMINATIM_REVERSE_URL,
                params=params,
                headers=_HEADERS,
                timeout=6
            )
            data = resp.json()
            if "error" in data:
                continue

            name = (data.get("display_name") or "").lower()
            category = (data.get("category") or data.get("class") or "").lower()

            triggers = [
                "ocean", "sea", "lake", "river", "sagar",
                "reservoir", "water", "bay", "gulf"
            ]

            if any(t in name for t in triggers) or category in ["natural", "water", "waterway"]:
                return True, {
                    "source": f"Nominatim Z{zoom}",
                    "name": data.get("display_name"),
                    "detail": f"Directly located on {data.get('display_name')}"
                }
        except Exception:
            continue

    return False, None


def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0
    phi1, phi2 = radians(lat1), radians(lat2)
    dphi = radians(lat2 - lat1)
    dlambda = radians(lon2 - lon1)
    a = sin(dphi / 2) ** 2 + cos(phi1) * cos(phi2) * sin(dlambda / 2) ** 2
    return R * (2 * atan2(sqrt(a), sqrt(1 - a)))


# --------------------------------------------------
# MAIN WATER UTILITY FACTOR
# --------------------------------------------------

def get_water_utility(
    latitude: float,
    longitude: float
) -> Dict[str, Optional[float]]:
    """
    Multi-layer water detection and proximity assessment.
    
    Layers:
    1. Ocean/Sea detection (highest priority)
    2. Major rivers/lakes (country-level)
    3. Local waterways (proximity-based)
    
    Scoring Philosophy:
    - ON water body: 0.0 (unsuitable for construction)
    - NEAR water body: 85-100 (excellent for development)
    - FAR from water: 20-40 (limited water access)
    """

    # --------------------------------------------------
    # LAYER 1: OCEAN/SEA DETECTION (Highest Priority)
    # --------------------------------------------------
    ocean_result = _detect_ocean_proximity(latitude, longitude)
    if ocean_result["is_ocean"]:
        if ocean_result["on_water"]:
            return {
                "value": 0.0,
                "distance_km": 0.0,
                "normalized_water_risk": 1.0,
                "water_type": "ocean",
                "details": ocean_result
            }
        else:
            # Near ocean - excellent for coastal development
            distance = ocean_result["distance_km"]
            score = _calculate_proximity_score(distance, "ocean")
            return {
                "value": score,
                "distance_km": round(distance, 3),
                "normalized_water_risk": round(1.0 - (score / 100.0), 3),
                "water_type": "ocean_nearby",
                "details": ocean_result
            }

    # --------------------------------------------------
    # LAYER 2: MAJOR RIVERS/LAKES (Country-level)
    # --------------------------------------------------
    major_water_result = _detect_major_water_features(latitude, longitude)
    if major_water_result["found"]:
        if major_water_result["on_water"]:
            return {
                "value": 0.0,
                "distance_km": 0.0,
                "normalized_water_risk": 1.0,
                "water_type": "major_water",
                "details": major_water_result
            }
        else:
            # Near major river/lake - excellent for development
            distance = major_water_result["distance_km"]
            score = _calculate_proximity_score(distance, "major")
            return {
                "value": score,
                "distance_km": round(distance, 3),
                "normalized_water_risk": round(1.0 - (score / 100.0), 3),
                "water_type": "major_water_nearby",
                "details": major_water_result
            }

    # --------------------------------------------------
    # LAYER 3: LOCAL WATERWAYS (Proximity-based)
    # --------------------------------------------------
    local_water_result = _detect_local_water_features(latitude, longitude)
    if local_water_result["found"]:
        if local_water_result["on_water"]:
            return {
                "value": 0.0,
                "distance_km": 0.0,
                "normalized_water_risk": 1.0,
                "water_type": "local_water",
                "details": local_water_result
            }
        else:
            # Near local waterway - good for development
            distance = local_water_result["distance_km"]
            score = _calculate_proximity_score(distance, "local")
            return {
                "value": score,
                "distance_km": round(distance, 3),
                "normalized_water_risk": round(1.0 - (score / 100.0), 3),
                "water_type": "local_water_nearby",
                "details": local_water_result
            }

    # --------------------------------------------------
    # LAYER 4: VERIFIED LAND FALLBACK
    # --------------------------------------------------
    return {
        "value": 25.0,
        "distance_km": None,
        "normalized_water_risk": 0.75,
        "water_type": "no_water_nearby",
        "details": {
            "source": "No Water Features Detected",
            "confidence": 0.8,
            "detail": "No water bodies detected within reasonable proximity. Limited water access."
        }
    }


def _detect_ocean_proximity(lat: float, lng: float) -> Dict:
    """Detect ocean/sea proximity with detailed analysis."""
    try:
        # Direct water detection first
        found, details = _multi_scale_search(lat, lng)
        if found:
            water_name = details.get("name", "").lower()
            if any(ocean in water_name for ocean in ["ocean", "sea", "gulf", "bay"]):
                return {
                    "is_ocean": True,
                    "on_water": True,
                    "distance_km": 0.0,
                    "name": details.get("name"),
                    "source": details.get("source"),
                    "detail": details.get("detail")
                }
        
        # Check hardcoded ocean bounds
        is_ocean, ocean_name = _is_in_hardcoded_ocean(lat, lng)
        if is_ocean:
            return {
                "is_ocean": True,
                "on_water": True,
                "distance_km": 0.0,
                "name": ocean_name,
                "source": "Geometric Ocean Detection",
                "detail": f"Located within bounds of {ocean_name}"
            }
        
        # Search for nearby ocean/coastal areas
        coastal_query = f"""
        [out:json][timeout:15];
        (
          way["natural"="coastline"](around:10000,{lat},{lng});
          way["natural"="water"](around:10000,{lat},{lng});
          node["place"="ocean"](around:15000,{lat},{lng});
          node["place"="sea"](around:15000,{lat},{lng});
        );
        out center 5;
        """
        
        for overpass_url in OVERPASS_URLS:
            try:
                resp = requests.post(
                    overpass_url,
                    data={"data": coastal_query},
                    headers=_HEADERS,
                    timeout=12
                )
                resp.raise_for_status()
                elements = (resp.json() or {}).get("elements")
                if elements:
                    el = elements[0]
                    e_lat = el.get("lat") or el.get("center", {}).get("lat")
                    e_lon = el.get("lon") or el.get("center", {}).get("lon")
                    dist_km = _haversine_km(lat, lng, e_lat, e_lon)
                    water_name = el.get("tags", {}).get("name", "Coastal Waters")
                    
                    return {
                        "is_ocean": True,
                        "on_water": False,
                        "distance_km": dist_km,
                        "name": water_name,
                        "source": "Coastal Detection",
                        "detail": f"Approximately {round(dist_km, 2)} km from {water_name}"
                    }
            except Exception:
                continue
                
    except Exception:
        pass
    
    return {"is_ocean": False, "on_water": False, "distance_km": None, "name": None}


def _detect_major_water_features(lat: float, lng: float) -> Dict:
    """Detect major rivers and lakes using expanded search."""
    try:
        # Search for major water features with larger radius
        major_query = f"""
        [out:json][timeout:20];
        (
          way["waterway"="river"](around:20000,{lat},{lng});
          way["natural"="water"](around:15000,{lat},{lng});
          relation["waterway"="river"](around:25000,{lat},{lng});
          node["place"="river"](around:20000,{lat},{lng});
          node["place"="lake"](around:15000,{lat},{lng});
        );
        out center 3;
        """
        
        for overpass_url in OVERPASS_URLS:
            try:
                resp = requests.post(
                    overpass_url,
                    data={"data": major_query},
                    headers=_HEADERS,
                    timeout=15
                )
                resp.raise_for_status()
                elements = (resp.json() or {}).get("elements")
                if elements:
                    # Find closest major water feature
                    closest = None
                    min_distance = float('inf')
                    
                    for el in elements:
                        e_lat = el.get("lat") or el.get("center", {}).get("lat")
                        e_lon = el.get("lon") or el.get("center", {}).get("lon")
                        if e_lat and e_lon:
                            dist_km = _haversine_km(lat, lng, e_lat, e_lon)
                            if dist_km < min_distance:
                                min_distance = dist_km
                                closest = el
                    
                    if closest:
                        e_lat = closest.get("lat") or closest.get("center", {}).get("lat")
                        e_lon = closest.get("lon") or closest.get("center", {}).get("lon")
                        dist_km = _haversine_km(lat, lng, e_lat, e_lon)
                        water_name = closest.get("tags", {}).get("name", "Major Waterway")
                        
                        # Check if directly on water
                        if dist_km < 0.1:
                            return {
                                "found": True,
                                "on_water": True,
                                "distance_km": 0.0,
                                "name": water_name,
                                "source": "Major Water Detection",
                                "detail": f"Located on {water_name}"
                            }
                        else:
                            return {
                                "found": True,
                                "on_water": False,
                                "distance_km": dist_km,
                                "name": water_name,
                                "source": "Major Water Detection",
                                "detail": f"Approximately {round(dist_km, 2)} km from {water_name}"
                            }
            except Exception:
                continue
                
    except Exception:
        pass
    
    return {"found": False, "on_water": False, "distance_km": None, "name": None}


def _detect_local_water_features(lat: float, lng: float) -> Dict:
    """Detect local water features with proximity analysis."""
    try:
        # Enhanced local water search
        local_query = f"""
        [out:json][timeout:15];
        (
          node["natural"="water"](around:5000,{lat},{lng});
          way["waterway"](around:5000,{lat},{lng});
          relation["natural"="water"](around:5000,{lat},{lng});
          node["amenity"="fountain"](around:2000,{lat},{lng});
          node["leisure"="swimming_pool"](around:1000,{lat},{lng});
        );
        out center 5;
        """
        
        for overpass_url in OVERPASS_URLS:
            try:
                resp = requests.post(
                    overpass_url,
                    data={"data": local_query},
                    headers=_HEADERS,
                    timeout=12
                )
                resp.raise_for_status()
                elements = (resp.json() or {}).get("elements")
                if elements:
                    # Find closest water feature
                    closest = None
                    min_distance = float('inf')
                    
                    for el in elements:
                        e_lat = el.get("lat") or el.get("center", {}).get("lat")
                        e_lon = el.get("lon") or el.get("center", {}).get("lon")
                        if e_lat and e_lon:
                            dist_km = _haversine_km(lat, lng, e_lat, e_lon)
                            if dist_km < min_distance:
                                min_distance = dist_km
                                closest = el
                    
                    if closest:
                        e_lat = closest.get("lat") or closest.get("center", {}).get("lat")
                        e_lon = closest.get("lon") or closest.get("center", {}).get("lon")
                        dist_km = _haversine_km(lat, lng, e_lat, e_lon)
                        water_name = closest.get("tags", {}).get("name", "Local Waterway")
                        
                        # Check if directly on water
                        if dist_km < 0.05:
                            return {
                                "found": True,
                                "on_water": True,
                                "distance_km": 0.0,
                                "name": water_name,
                                "source": "Local Water Detection",
                                "detail": f"Located on {water_name}"
                            }
                        else:
                            return {
                                "found": True,
                                "on_water": False,
                                "distance_km": dist_km,
                                "name": water_name,
                                "source": "Local Water Detection",
                                "detail": f"Approximately {round(dist_km, 2)} km from {water_name}"
                            }
            except Exception:
                continue
                
    except Exception:
        pass
    
    return {"found": False, "on_water": False, "distance_km": None, "name": None}


def _calculate_proximity_score(distance_km: float, water_type: str) -> float:
    """
    Calculate proximity score with water-friendly philosophy.
    Closer to water = higher score (better for development).
    """
    if water_type == "ocean":
        # Ocean proximity - very valuable for coastal development
        if distance_km < 0.5:
            return 95.0
        elif distance_km < 1.0:
            return 90.0
        elif distance_km < 2.0:
            return 85.0
        elif distance_km < 5.0:
            return 75.0
        elif distance_km < 10.0:
            return 65.0
        elif distance_km < 20.0:
            return 50.0
        else:
            return 35.0
            
    elif water_type == "major":
        # Major rivers/lakes - excellent for development
        if distance_km < 0.2:
            return 100.0
        elif distance_km < 0.5:
            return 95.0
        elif distance_km < 1.0:
            return 90.0
        elif distance_km < 2.0:
            return 85.0
        elif distance_km < 3.0:
            return 75.0
        elif distance_km < 5.0:
            return 65.0
        else:
            return 50.0
            
    else:  # local
        # Local waterways - good for development
        if distance_km < 0.1:
            return 95.0
        elif distance_km < 0.3:
            return 85.0
        elif distance_km < 0.7:
            return 75.0
        elif distance_km < 1.5:
            return 65.0
        elif distance_km < 3.0:
            return 55.0
        elif distance_km < 5.0:
            return 45.0
        else:
            return 30.0
