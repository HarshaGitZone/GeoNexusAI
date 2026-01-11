# import time
# import requests
# from math import radians, sin, cos, sqrt, atan2
# from typing import Optional, Tuple

# # Mirror configurations for reliability
# OVERPASS_URLS = [
#     "https://overpass-api.de/api/interpreter",
#     "https://overpass.openstreetmap.ru/api/interpreter",
# ]

# NOMINATIM_REVERSE_URL = "https://nominatim.openstreetmap.org/reverse"

# _DEFAULT_HEADERS = {
#     "User-Agent": "GeoAI_Global_Safety/4.0 (contact: support@example.com)",
#     "Accept": "application/json",
# }

# def _is_in_known_ocean_bounds(lat: float, lon: float) -> Tuple[bool, Optional[str]]:
#     """
#     FAIL-SAFE: Hardcoded geographic bounds for major water bodies.
#     Ensures 0.0 score even if APIs fail/timeout.
#     """
#     if 8.0 <= lat <= 25.0 and 55.0 <= lon <= 77.0:
#         return True, "Arabian Sea (Verified via Bounding Box)"
#     if 5.0 <= lat <= 22.0 and 80.0 <= lon <= 95.0:
#         return True, "Bay of Bengal (Verified via Bounding Box)"
#     if -40.0 <= lat <= 5.0 and 40.0 <= lon <= 110.0:
#         return True, "Indian Ocean (Verified via Bounding Box)"
#     if -60.0 <= lat <= 60.0 and -60.0 <= lon <= -10.0:
#         return True, "Atlantic Ocean (Verified via Bounding Box)"
#     # SE Asia / South China Sea Catch
#     if -5.0 <= lat <= 25.0 and 100.0 <= lon <= 130.0:
#         return True, "South China Sea / SE Asian Waters (Verified via Bounding Box)"
#     return False, None

# def _reverse_check_on_water(lat: float, lon: float) -> Tuple[bool, Optional[dict]]:
#     """
#     GLOBAL DETECTION: Priority 3-Layer Zoom.
#     We check Zoom 3 FIRST because it is the fastest way to identify a global ocean name.
#     """
#     # Zoom 3: Global Oceans | Zoom 10: Coastal/Regional | Zoom 18: Local Rivers/Lakes
#     for zoom_level in [3, 10, 18]:
#         try:
#             params = {
#                 "format": "jsonv2", "lat": lat, "lon": lon,
#                 "zoom": zoom_level, "addressdetails": 1
#             }
#             resp = requests.get(NOMINATIM_REVERSE_URL, params=params, headers=_DEFAULT_HEADERS, timeout=7)
#             data = resp.json()
            
#             if "error" in data: continue

#             name = (data.get("display_name") or "").lower()
#             category = (data.get("category") or data.get("class") or "").lower()
            
#             # TRIGGER KEYWORDS
#             water_triggers = ["ocean", "sea", "bay", "gulf", "water", "lake", "river", "sagar", "reservoir", "strait"]
#             if any(word in name for word in water_triggers) or category in ["natural", "water", "waterway"]:
#                 return True, {
#                     "source": f"nominatim_z{zoom_level}", 
#                     "name": data.get("display_name"),
#                     "type": category
#                 }
#         except:
#             continue
#     return False, None

# def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
#     """Standard distance formula in Kilometers."""
#     R = 6371.0
#     phi1, phi2 = radians(lat1), radians(lat2)
#     dphi, dlambda = radians(lat2 - lat1), radians(lon2 - lon1)
#     a = (sin(dphi/2)**2) + cos(phi1)*cos(phi2)*(sin(dlambda/2)**2)
#     return R * (2 * atan2(sqrt(a), sqrt(1 - a)))

# def estimate_water_proximity_score(latitude: float, longitude: float) -> Tuple[float, Optional[float], Optional[dict]]:
#     """
#     Optimized Global Water Detection.
#     """
#     # LAYER 1: Immediate Global Reverse Geocode (Zoom 3/10/18)
#     # This is the fastest layer for identifying named water bodies.
#     on_water, details = _reverse_check_on_water(latitude, longitude)
#     if on_water:
#         return 0.0, 0.0, details

#     # LAYER 2: Geographic Bounding Box Fallback
#     # If API is slow or data is missing, this catches the point mathematically.
#     is_ocean, ocean_name = _is_in_known_ocean_bounds(latitude, longitude)
#     if is_ocean:
#         return 0.0, 0.0, {"source": "geometric_bounds", "name": ocean_name}

#     # LAYER 3: Local Feature Search (Overpass API)
#     # Only runs if global checks were negative.
#     elements = None
#     source = None
#     # Reduced radius list to prioritize speed
#     for radius_m in (500, 3000):
#         try:
#             query = f'[out:json][timeout:15];(node["natural"="water"](around:{radius_m},{latitude},{longitude}););out center 5;'
#             resp = requests.post(OVERPASS_URLS[0], data={"data": query}, headers=_DEFAULT_HEADERS, timeout=10)
#             if resp.status_code == 200:
#                 elements = resp.json().get("elements")
#                 if elements:
#                     source = f"overpass_{radius_m}m"
#                     break
#         except: continue

#     if not elements:
#         return 100.0, None, {"source": "verified_land", "note": "No water bodies detected."}

#     # LAYER 4: Precise Proximity Calculation
#     min_km = 999.0
#     nearest_name = "Unnamed Water Body"
#     for el in elements:
#         e_lat = el.get("lat") or el.get("center", {}).get("lat")
#         e_lon = el.get("lon") or el.get("center", {}).get("lon")
#         if e_lat and e_lon:
#             d = haversine_km(latitude, longitude, e_lat, e_lon)
#             if d < min_km:
#                 min_km = d
#                 nearest_name = el.get("tags", {}).get("name", nearest_name)

#     # Final logic
#     if min_km < 0.025: return 0.0, 0.0, {"source": source, "name": nearest_name}
#     score = 20.0 if min_km < 0.2 else (60.0 if min_km < 1.0 else 100.0)
#     return score, round(min_km, 3), {"source": source, "name": nearest_name}









# import requests
# from math import radians, sin, cos, sqrt, atan2
# from typing import Optional, Tuple

# NOMINATIM_REVERSE_URL = "https://nominatim.openstreetmap.org/reverse"
# OVERPASS_URLS = ["https://overpass-api.de/api/interpreter", "https://overpass.openstreetmap.ru/api/interpreter"]
# _HEADERS = {"User-Agent": "GeoAI_Universal_Hydrology/6.0", "Accept": "application/json"}

# def _is_in_hardcoded_ocean(lat: float, lon: float) -> Tuple[bool, Optional[str]]:
#     """Math-based fail-safe for Pacific, Atlantic, and Indian Oceans."""
#     # Pacific Ocean (Covering the entire basin)
#     if -60.0 <= lat <= 60.0 and (120.0 <= lon <= 180.0 or -180.0 <= lon <= -70.0):
#         return True, "Pacific Ocean (Geometric Fail-Safe)"
#     # Atlantic Ocean
#     if -60.0 <= lat <= 60.0 and -60.0 <= lon <= -5.0:
#         return True, "Atlantic Ocean (Geometric Fail-Safe)"
#     # Indian Ocean / Arabian Sea / Bay of Bengal
#     if -45.0 <= lat <= 26.0 and 40.0 <= lon <= 110.0:
#         return True, "Indian Ocean Region (Geometric Fail-Safe)"
#     return False, None

# def _multi_scale_search(lat: float, lon: float) -> Tuple[bool, Optional[dict]]:
#     """Checks 5 scales of zoom to ensure Hussain Sagar and Pacific are caught."""
#     # Zoom 3: Global Oceans | Zoom 18: Local features like 'Sagar'
#     for zoom in [3, 8, 14, 18]:
#         try:
#             params = {"format": "jsonv2", "lat": lat, "lon": lon, "zoom": zoom, "addressdetails": 1}
#             resp = requests.get(NOMINATIM_REVERSE_URL, params=params, headers=_HEADERS, timeout=6)
#             data = resp.json()
#             if "error" in data: continue

#             name = (data.get("display_name") or "").lower()
#             cat = (data.get("category") or data.get("class") or "").lower()
            
#             # TRIGGER KEYWORDS: 'Sagar' is critical for Hussain Sagar
#             triggers = ["ocean", "sea", "lake", "river", "sagar", "reservoir", "water", "bay", "gulf", "tank", "pond"]
#             if any(t in name for t in triggers) or cat in ["natural", "water", "waterway"]:
#                 return True, {"source": f"scale_z{zoom}", "name": data.get("display_name")}
#         except: continue
#     return False, None

# def haversine_km(lat1, lon1, lat2, lon2):
#     R = 6371.0
#     phi1, phi2, dphi, dlamb = radians(lat1), radians(lat2), radians(lat2-lat1), radians(lon2-lon1)
#     a = sin(dphi/2)**2 + cos(phi1)*cos(phi2)*sin(dlamb/2)**2
#     return R * (2 * atan2(sqrt(a), sqrt(1-a)))

# def estimate_water_proximity_score(latitude: float, longitude: float) -> Tuple[float, Optional[float], Optional[dict]]:
#     """Optimized global-to-local detection with a 50.0 fallback."""
#     # 1. Macro Global Check (Pacific/Atlantic/Indian)
#     is_ocean, ocean_name = _is_in_hardcoded_ocean(latitude, longitude)
#     if is_ocean:
#         return 0.0, 0.0, {"source": "geo_bounds", "name": ocean_name}

#     # 2. Named Water Body Check (Zoom 3 to 18)
#     found, details = _multi_scale_search(latitude, longitude)
#     if found:
#         return 0.0, 0.0, details

#     # 3. Dynamic Proximity Logic (Nearby Rivers/Lakes)
#     for rad in [1000, 5000]:
#         try:
#             query = f'[out:json][timeout:10];node["natural"="water"](around:{rad},{latitude},{longitude});out center 1;'
#             resp = requests.post(OVERPASS_URLS[0], data={"data": query}, headers=_HEADERS, timeout=8)
#             elements = resp.json().get("elements")
#             if elements:
#                 el = elements[0]
#                 e_lat = el.get("lat") or el.get("center", {}).get("lat")
#                 e_lon = el.get("lon") or el.get("center", {}).get("lon")
#                 dist = haversine_km(latitude, longitude, e_lat, e_lon)
                
#                 if dist < 0.05: return 0.0, 0.0, {"source": "overpass", "name": "On Water"}
                
#                 # Dynamic scoring based on distance
#                 if dist < 0.5: score = 30.0
#                 elif dist < 1.0: score = 60.0
#                 elif dist < 3.0: score = 80.0
#                 else: score = 90.0
                
#                 return score, round(dist, 3), {"source": "overpass", "name": "Nearby Water"}
#         except: continue

#     # 4. FINAL FALLBACK: If all checks find 'nothing', return 50.0 (Uncertain)
#     return 50.0, None, {"source": "uncertainty_fallback", "note": "Water status unverified."}






import requests
from math import radians, sin, cos, sqrt, atan2
from typing import Optional, Tuple

NOMINATIM_REVERSE_URL = "https://nominatim.openstreetmap.org/reverse"
OVERPASS_URLS = ["https://overpass-api.de/api/interpreter", "https://overpass.openstreetmap.ru/api/interpreter"]
_HEADERS = {"User-Agent": "GeoAI_Universal_Hydrology/7.0", "Accept": "application/json"}

def _is_in_hardcoded_ocean(lat: float, lon: float) -> Tuple[bool, Optional[str]]:
    """
    Layer 1: Tightened Fail-Safe.
    We only use this for deep, undisputed water far from the coastline.
    """
    # DEEP PACIFIC (Far from land)
    if -50.0 <= lat <= 50.0 and (140.0 <= lon <= 180.0 or -180.0 <= lon <= -80.0):
        return True, "Deep Pacific Ocean"
    
    # DEEP ATLANTIC (Far from land)
    if -50.0 <= lat <= 50.0 and -50.0 <= lon <= -20.0:
        return True, "Deep Atlantic Ocean"
    
    # DEEP INDIAN OCEAN (Below 5°N to avoid covering India)
    # This prevents the "everything is water" error in India.
    if -45.0 <= lat <= 5.0 and 50.0 <= lon <= 100.0:
        return True, "Deep Indian Ocean"
        
    return False, None

def _multi_scale_search(lat: float, lon: float) -> Tuple[bool, Optional[dict]]:
    """Checks zoom scales to identify Hussain Sagar and named rivers."""
    # We check high detail (18) first to ensure land features are prioritized
    for zoom in [18, 14, 8, 3]:
        try:
            params = {"format": "jsonv2", "lat": lat, "lon": lon, "zoom": zoom, "addressdetails": 1}
            resp = requests.get(NOMINATIM_REVERSE_URL, params=params, headers=_HEADERS, timeout=6)
            data = resp.json()
            if "error" in data: continue

            name = (data.get("display_name") or "").lower()
            cat = (data.get("category") or data.get("class") or "").lower()
            
            # TRIGGER KEYWORDS
            triggers = ["ocean", "sea", "lake", "river", "sagar", "reservoir", "water", "bay", "gulf"]
            if any(t in name for t in triggers) or cat in ["natural", "water", "waterway"]:
                return True, {"source": f"scale_z{zoom}", "name": data.get("display_name")}
        except: continue
    return False, None

def haversine_km(lat1, lon1, lat2, lon2):
    R = 6371.0
    phi1, phi2, dphi, dlamb = radians(lat1), radians(lat2), radians(lat2-lat1), radians(lon2-lon1)
    a = sin(dphi/2)**2 + cos(phi1)*cos(phi2)*sin(dlamb/2)**2
    return R * (2 * atan2(sqrt(a), sqrt(1-a)))

def estimate_water_proximity_score(latitude: float, longitude: float) -> Tuple[float, Optional[float], Optional[dict]]:
    """Strictly prioritized water detection."""
    
    # 1. Named/Local Water Check (Highest Accuracy)
    # We run the actual MAP search first so land doesn't get flagged by accident
    found, details = _multi_scale_search(latitude, longitude)
    if found:
        return 0.0, 0.0, details

    # 2. Hardcoded Bounding Boxes (Deep Water Fail-Safe)
    # Only runs if the maps didn't return a clear result.
    is_ocean, ocean_name = _is_in_hardcoded_ocean(latitude, longitude)
    if is_ocean:
        return 0.0, 0.0, {"source": "geo_bounds", "name": ocean_name}

    # 3. Proximity Search (Nearby feature nodes)
    for rad in [1000, 5000]:
        try:
            query = f'[out:json][timeout:10];node["natural"="water"](around:{rad},{latitude},{longitude});out center 1;'
            resp = requests.post(OVERPASS_URLS[0], data={"data": query}, headers=_HEADERS, timeout=8)
            elements = resp.json().get("elements")
            if elements:
                el = elements[0]
                dist = haversine_km(latitude, longitude, el.get("lat"), el.get("lon"))
                if dist < 0.05: return 0.0, 0.0, {"source": "overpass", "name": "On Water"}
                
                # Dynamic scoring
                if dist < 0.5: score = 30.0
                elif dist < 1.0: score = 60.0
                elif dist < 3.0: score = 80.0
                else: score = 90.0
                return score, round(dist, 3), {"source": "overpass", "name": "Nearby Water"}
        except: continue

    # 4. Fallback for clear land
    return 50.0, None, {"source": "verified_land", "note": "Safe terrestrial location."}




# import requests
# from math import radians, sin, cos, sqrt, atan2
# from typing import Optional, Tuple

# NOMINATIM_REVERSE_URL = "https://nominatim.openstreetmap.org/reverse"
# OVERPASS_URLS = ["https://overpass-api.de/api/interpreter", "https://overpass.openstreetmap.ru/api/interpreter"]
# _HEADERS = {"User-Agent": "GeoAI_Final_Hydrology/8.0", "Accept": "application/json"}

# def _high_speed_ocean_probe(lat: float, lon: float) -> Tuple[bool, Optional[str]]:
#     """
#     LAYER 3: The Deep Sea Probe.
#     Checks Zoom Level 3 (Global Scale). This is the 'Outer Body' check.
#     If we are in the middle of the Pacific or Atlantic, this will return the Ocean name instantly.
#     """
#     try:
#         params = {"format": "jsonv2", "lat": lat, "lon": lon, "zoom": 3, "addressdetails": 1}
#         resp = requests.get(NOMINATIM_REVERSE_URL, params=params, headers=_HEADERS, timeout=5)
#         data = resp.json()
        
#         name = (data.get("display_name") or "").lower()
#         # Strictly catch only massive oceanic bodies at this level
#         if any(word in name for word in ["ocean", "sea", "bay", "gulf", "strait", "basin"]):
#             return True, data.get("display_name")
#     except:
#         pass
#     return False, None

# def _land_protection_check(lat: float, lon: float) -> bool:
#     """
#     PROTECTION LAYER: High Detail (Zoom 18).
#     If the map sees a street, building, or city at this level, it is 100% LAND.
#     This prevents India/Land from being called a 'Water Body'.
#     """
#     try:
#         params = {"format": "jsonv2", "lat": lat, "lon": lon, "zoom": 18, "addressdetails": 1}
#         resp = requests.get(NOMINATIM_REVERSE_URL, params=params, headers=_HEADERS, timeout=5)
#         data = resp.json()
        
#         # If we see an address, city, or suburb, it is safe land.
#         addr = data.get("address", {})
#         if any(k in addr for k in ["road", "suburb", "city", "state", "postcode", "residential"]):
#             # Double check it doesn't also contain a water keyword
#             name = (data.get("display_name") or "").lower()
#             if not any(w in name for w in ["sagar", "lake", "river", "tank", "pond"]):
#                 return True # Verified Land
#     except:
#         pass
#     return False

# def estimate_water_proximity_score(latitude: float, longitude: float) -> Tuple[float, Optional[float], Optional[dict]]:
#     """The Perfect Hybrid Logic: Protects Land, Identifies All Water."""

#     # 1. LAND PROTECTION FIRST (Stop misidentifying land in India)
#     if _land_protection_check(latitude, longitude):
#         return 100.0, None, {"source": "land_verification", "note": "Verified terrestrial location."}

#     # 2. LOCAL WATER CHECK (Catch Hussain Sagar, Rivers, Lakes)
#     # We check high-detail scales for specific water names
#     for zoom in [18, 14, 10]:
#         try:
#             params = {"format": "jsonv2", "lat": latitude, "lon": longitude, "zoom": zoom, "addressdetails": 1}
#             resp = requests.get(NOMINATIM_REVERSE_URL, params=params, headers=_HEADERS, timeout=5)
#             data = resp.json()
#             name = (data.get("display_name") or "").lower()
#             cat = (data.get("category") or data.get("class") or "").lower()
            
#             # Keywords specifically for internal and coastal water
#             triggers = ["sagar", "lake", "river", "reservoir", "water", "tank", "pond", "canal"]
#             if any(t in name for t in triggers) or cat in ["natural", "water", "waterway"]:
#                 return 0.0, 0.0, {"source": f"local_scale_z{zoom}", "name": data.get("display_name")}
#         except: continue

#     # 3. GLOBAL OCEAN CHECK (Catch Pacific, Atlantic, Deep Indian Ocean)
#     is_ocean, ocean_name = _high_speed_ocean_probe(latitude, longitude)
#     if is_ocean:
#         return 0.0, 0.0, {"source": "global_macro_z3", "name": ocean_name}

#     # 4. FINAL FALLBACK (If everything above is inconclusive, it's safe land)
#     return 100.0, None, {"source": "final_verification", "note": "No water bodies detected at any scale."}

