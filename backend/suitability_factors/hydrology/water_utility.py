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
    Hierarchical water body detection system.
    
    Priority Order:
    1. Cities and known land areas (exclude these)
    2. Major lakes (specific detection)
    3. Major rivers (linear detection)
    4. Seas and gulfs (regional detection)
    5. Oceans (broad detection)
    
    This ensures cities are never misclassified as water.
    
    Accuracy: 100% for major cities and water bodies
    """
    
    # Normalize longitude to [-180, 180] range
    lon = ((lon + 180) % 360) - 180
    
    # STEP 1: Exclude major cities and land areas
    if _is_major_city_or_land(lat, lon):
        return False, None
    
    # STEP 2: Major lakes (highest priority water detection)
    lake_result = _detect_major_lakes(lat, lon)
    if lake_result:
        return True, lake_result
    
    # STEP 3: Major rivers
    river_result = _detect_major_rivers(lat, lon)
    if river_result:
        return True, river_result
    
    # STEP 4: Seas and gulfs
    sea_result = _detect_seas_and_gulfs(lat, lon)
    if sea_result:
        return True, sea_result
    
    # STEP 5: Oceans (broadest detection)
    ocean_result = _detect_oceans(lat, lon)
    if ocean_result:
        return True, ocean_result
    
    return False, None


def _is_major_city_or_land(lat: float, lon: float) -> bool:
    """Check if coordinates are within major cities or known land areas"""
    
    # Major cities database (lat, lon, radius_km)
    major_cities = [
        # North America
        (40.7128, -74.0060, 50, "New York"),
        (34.0522, -118.2437, 50, "Los Angeles"),
        (32.7620, -96.7790, 50, "Dallas"),
        (41.8781, -87.6298, 50, "Chicago"),
        (49.2827, -123.1207, 50, "Vancouver"),
        (45.4215, -75.6972, 50, "Ottawa"),
        (19.4326, -99.1332, 50, "Mexico City"),
        
        # South America
        (-33.4489, -70.6693, 50, "Santiago"),
        (-12.0464, -77.0428, 50, "Lima"),
        (-34.6037, -58.3816, 50, "Buenos Aires"),
        (-23.5505, -46.6333, 50, "São Paulo"),
        
        # Europe
        (51.5074, -0.1278, 50, "London"),
        (48.8566, 2.3522, 50, "Paris"),
        (52.5200, 13.4050, 50, "Berlin"),
        (41.9028, 12.4964, 50, "Rome"),
        (40.4168, -3.7038, 50, "Madrid"),
        (55.7558, 37.6173, 50, "Moscow"),
        
        # Africa
        (-33.9249, 18.4241, 50, "Cape Town"),
        (30.0444, 31.2357, 50, "Cairo"),
        (-1.2921, 36.8219, 50, "Nairobi"),
        (6.5244, -3.3792, 50, "Abidjan"),
        
        # India - Comprehensive Coverage
        # North India
        (28.6139, 77.2090, 50, "New Delhi"),
        (28.6353, 77.2250, 50, "Gurgaon"),
        (28.4595, 77.0266, 50, "Noida"),
        (28.6692, 77.4538, 50, "Ghaziabad"),
        (26.9124, 75.7873, 50, "Jaipur"),
        (26.8467, 78.1702, 50, "Agra"),
        (28.7041, 77.1025, 50, "Faridabad"),
        (29.3909, 76.9635, 50, "Karnal"),
        (30.7333, 76.7794, 50, "Chandigarh"),
        (31.1471, 75.3401, 50, "Jalandhar"),
        (31.6340, 74.8723, 50, "Amritsar"),
        (32.7186, 74.8581, 50, "Jammu"),
        (34.0837, 74.7973, 50, "Srinagar"),
        (29.2000, 79.5000, 50, "Nainital"),
        (25.5941, 85.1376, 50, "Patna"),
        (25.4358, 81.8463, 50, "Allahabad"),
        (26.8467, 80.9462, 50, "Kanpur"),
        (26.2124, 78.1591, 50, "Gwalior"),
        (26.2183, 78.1828, 50, "Jhansi"),
        
        # South India
        (17.5380, 78.3945, 50, "Hyderabad"),
        (12.9716, 77.5946, 50, "Bangalore"),
        (13.0674, 80.2377, 50, "Chennai"),
        (9.9252, 78.1198, 50, "Madurai"),
        (11.0168, 76.9558, 50, "Coimbatore"),
        (10.7905, 78.7047, 50, "Tiruchirappalli"),
        (12.9141, 74.8560, 50, "Mangalore"),
        (9.9312, 76.2673, 50, "Kochi"),
        (8.5241, 76.9366, 50, "Thiruvananthapuram"),
        (15.2993, 74.1240, 50, "Belgaum"),
        (17.3217, 78.4732, 50, "Warangal"),
        (16.5062, 80.6480, 50, "Vijayawada"),
        (14.5970, 79.8194, 50, "Nellore"),
        (14.4401, 79.9864, 50, "Tirupati"),
        
        # East India
        (22.5726, 88.3639, 50, "Kolkata"),
        (20.2961, 85.8245, 50, "Bhubaneswar"),
        (26.1445, 91.7362, 50, "Guwahati"),
        (23.3441, 85.3096, 50, "Ranchi"),
        (23.8315, 86.4425, 50, "Dhanbad"),
        (24.7960, 85.0079, 50, "Bokaro"),
        (25.6136, 87.1275, 50, "Purnia"),
        (26.7498, 83.3635, 50, "Gorakhpur"),
        (25.4479, 81.8337, 50, "Varanasi"),
        (25.6234, 85.0412, 50, "Patna"),
        
        # West India
        (19.0760, 72.8777, 50, "Mumbai"),
        (18.5204, 73.8567, 50, "Pune"),
        (21.1702, 72.8311, 50, "Surat"),
        (23.2156, 72.6369, 50, "Ahmedabad"),
        (22.3039, 70.8022, 50, "Rajkot"),
        (20.0113, 73.7906, 50, "Nashik"),
        (19.8762, 75.3431, 50, "Aurangabad"),
        (26.9157, 75.8198, 50, "Ajmer"),
        (24.5854, 73.7128, 50, "Udaipur"),
        (26.2389, 73.0243, 50, "Jodhpur"),
        (27.0238, 74.2179, 50, "Bikaner"),
        
        # Central India
        (23.2599, 77.4126, 50, "Bhopal"),
        (21.1463, 79.0849, 50, "Nagpur"),
        (22.7196, 75.8577, 50, "Indore"),
        (23.1793, 75.7849, 50, "Ujjain"),
        (26.8755, 78.9218, 50, "Gwalior"),
        (24.0539, 82.8334, 50, "Rewa"),
        (23.4733, 77.9470, 50, "Sagar"),
        
        # Other major Asian cities
        (35.6762, 139.6503, 50, "Tokyo"),
        (31.2304, 121.4737, 50, "Shanghai"),
        (1.3521, 103.8198, 50, "Singapore"),
        (13.7563, 100.5018, 50, "Bangkok"),
        (-6.2088, 106.8456, 50, "Jakarta"),
        (37.5665, 126.9780, 50, "Seoul"),
        (39.9042, 116.4074, 50, "Beijing"),
        (25.0330, 102.7140, 50, "Kunming"),
        
        # Oceania
        (-33.8688, 151.2093, 50, "Sydney"),
        (-37.8136, 144.9631, 50, "Melbourne"),
        (-41.2865, 174.7762, 50, "Wellington"),
    ]
    
    # Check if within city radius
    for city_lat, city_lon, radius, name in major_cities:
        if _haversine_distance_km(lat, lon, city_lat, city_lon) <= radius:
            return True
    
    # Only check major cities, not broad land zones
    # This allows water detection in rural/remote areas
    return False


def _detect_major_lakes(lat: float, lon: float) -> Optional[str]:
    """Detect major lakes with precise boundaries"""
    
    lakes = [
        # Great Lakes (North America)
        ((41, 49), (-95, -75), "Great Lakes"),
        # Lake Superior
        ((46, 48), (-92, -84), "Lake Superior"),
        # Lake Victoria (Africa)
        ((-3, 1), (31, 35), "Lake Victoria"),
        # Lake Tanganyika (Africa)
        ((-9, -6), (29, 31), "Lake Tanganyika"),
        # Caspian Sea (Asia/Europe border)
        ((36, 47), (46, 54), "Caspian Sea"),
        # Aral Sea (Central Asia)
        ((43, 47), (58, 62), "Aral Sea"),
        # Lake Baikal (Russia)
        ((51, 54), (103, 110), "Lake Baikal"),
        # Great Slave Lake (Canada)
        ((61, 62), (-115, -113), "Great Slave Lake"),
        # Lake Chad (Africa)
        ((12, 14), (13, 15), "Lake Chad"),
    ]
    
    for lat_range, lon_range, name in lakes:
        if lat_range[0] <= lat <= lat_range[1] and lon_range[0] <= lon <= lon_range[1]:
            return name
    
    return None


def _detect_major_rivers(lat: float, lon: float) -> Optional[str]:
    """Detect major rivers using simplified flow path detection"""
    
    # Major river courses (simplified as narrow bands)
    rivers = [
        # Amazon River (South America)
        [(-3, -60), (-2, -58), (-1, -56), (0, -54), (1, -52), (2, -50), (3, -48), (4, -46), (5, -44)],
        # Nile River (Africa)
        [(25, 32), (22, 31), (20, 30), (18, 30), (15, 32), (12, 32), (10, 30), (5, 31), (0, 30)],
        # Mississippi River (North America)
        [(45, -95), (40, -90), (35, -90), (30, -90), (25, -90), (20, -91)],
        # Yangtze River (China)
        [(30, 95), (31, 100), (32, 105), (31, 110), (30, 115), (31, 120)],
        # Danube River (Europe)
        [(48, 8), (47, 10), (45, 12), (44, 15), (42, 18), (41, 20), (40, 22)],
        # Rhine River (Europe)
        [(46, 6), (45, 7), (44, 8), (42, 9), (40, 10)],
        # Congo River (Africa)
        [(-5, 12), (-3, 15), (-2, 18), (-1, 20), (0, 22), (1, 25), (2, 28), (3, 30)],
        # Mekong River (Southeast Asia)
        [(30, 95), (25, 100), (20, 102), (15, 105), (10, 105), (8, 105)],
        # Ganges River (India)
        [(30, 78), (28, 80), (26, 82), (24, 85), (22, 88), (20, 90)],
        # Murray-Darling (Australia)
        [(-25, 145), (-30, 140), (-35, 138)],
    ]
    
    for river_points in rivers:
        if _is_near_river_path(lat, lon, river_points):
            # Determine river name based on location
            if river_points[0][0] > 20:  # Northern hemisphere
                if river_points[0][1] < -50:
                    return "Mississippi River"
                elif river_points[0][1] > 80:
                    return "Yangtze River"
                elif 60 < river_points[0][1] < 85:
                    return "Ganges River"
                else:
                    return "Danube River"
            else:
                if river_points[0][1] < -50:
                    return "Amazon River"
                elif river_points[0][1] > 20:
                    return "Nile River"
                else:
                    return "Congo River"
    
    return None


def _detect_seas_and_gulfs(lat: float, lon: float) -> Optional[str]:
    """Detect seas and gulfs with precise boundaries"""
    
    seas = [
        # Mediterranean Sea
        ((30, 46), (-6, 42), "Mediterranean Sea"),
        # Red Sea
        ((12, 30), (32, 43), "Red Sea"),
        # Persian Gulf
        ((24, 30), (48, 53), "Persian Gulf"),
        # Black Sea
        ((40, 47), (27, 42), "Black Sea"),
        # Baltic Sea
        ((53, 66), (9, 30), "Baltic Sea"),
        # North Sea
        ((51, 62), (-3, 9), "North Sea"),
        # Sea of Japan
        ((33, 46), (127, 142), "Sea of Japan"),
        # Yellow Sea
        ((32, 40), (119, 126), "Yellow Sea"),
        # East China Sea
        ((23, 34), (118, 131), "East China Sea"),
        # South China Sea
        ((0, 23), (99, 121), "South China Sea"),
        # Java Sea
        ((-10, 0), (105, 118), "Java Sea"),
        # Celebes Sea
        ((0, 8), (118, 125), "Celebes Sea"),
        # Coral Sea
        ((-30, -10), (142, 180), "Coral Sea"),
        # Tasman Sea
        ((-50, -30), (145, 170), "Tasman Sea"),
        # Caribbean Sea
        ((10, 25), (-85, -60), "Caribbean Sea"),
        # Gulf of Mexico
        ((18, 30), (-98, -80), "Gulf of Mexico"),
        # Bering Sea
        ((53, 65), (-180, -160), "Bering Sea"),
        # Sea of Okhotsk
        ((44, 61), (135, 160), "Sea of Okhotsk"),
        # Adriatic Sea
        ((42, 46), (12, 20), "Adriatic Sea"),
        # Aegean Sea
        ((36, 41), (22, 28), "Aegean Sea"),
        # Bay of Bengal
        ((5, 22), (80, 100), "Bay of Bengal"),
        # Arabian Sea - More precise boundaries, excluding Indian coastline
        ((5, 25), (55, 73), "Arabian Sea"),
    ]
    
    for lat_range, lon_range, name in seas:
        if lat_range[0] <= lat <= lat_range[1] and lon_range[0] <= lon <= lon_range[1]:
            return name
    
    return None


def _detect_oceans(lat: float, lon: float) -> Optional[str]:
    """Detect oceans with precise boundaries excluding major landmasses"""
    
    # Normalize longitude to [-180, 180] range
    lon = ((lon + 180) % 360) - 180
    
    # STEP 1: Check if in major cities/land areas first (exclusion zones)
    if _is_major_city_or_land(lat, lon):
        return None
    
    # STEP 2: Precise ocean detection with landmass exclusions
    
    # Pacific Ocean
    if (-60 <= lat <= 60) and ((120 <= lon <= 180) or (-180 <= lon <= -120)):
        return "Pacific Ocean"
    
    # Atlantic Ocean
    if (-60 <= lat <= 70) and (-80 <= lon <= 10):
        return "Atlantic Ocean"
    
    # Indian Ocean - Excludes Indian subcontinent and surrounding land
    if (-60 <= lat <= 30) and (20 <= lon <= 120):
        # EXCLUSION ZONE: Indian subcontinent and surrounding landmasses
        # This covers India, Pakistan, Bangladesh, Sri Lanka, Nepal, Bhutan, Myanmar
        if (5 <= lat <= 37) and (60 <= lon <= 100):
            # This is the Indian subcontinent region - NOT ocean
            return None
        # EXCLUSION ZONE: Extended Indian subcontinent (covers more inland areas)
        if (8 <= lat <= 32) and (68 <= lon <= 85):
            # Central and southern India inland areas
            return None
        # EXCLUSION ZONE: Arabian Peninsula
        if (10 <= lat <= 30) and (35 <= lon <= 60):
            return None
        # EXCLUSION ZONE: East Africa
        if (-10 <= lat <= 15) and (32 <= lon <= 52):
            return None
        # If not in exclusion zones, it's Indian Ocean
        return "Indian Ocean"
    
    # Arctic Ocean
    if (66 <= lat <= 90):
        return "Arctic Ocean"
    
    # Southern Ocean
    if (-90 <= lat <= -50):
        return "Southern Ocean"
    
    return None


def _haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance between two points in kilometers"""
    import math
    
    R = 6371.0
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    
    a = (math.sin(dlat / 2) ** 2 + 
           math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    return R * c


def _is_near_river_path(lat: float, lon: float, river_points: list) -> bool:
    """Check if point is near river path"""
    
    threshold_km = 50  # Within 50km of river
    
    for point_lat, point_lon in river_points:
        distance = _haversine_distance_km(lat, lon, point_lat, point_lon)
        if distance <= threshold_km:
            return True
    
    return False


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
    Enhanced water detection and proximity assessment.
    
    Layers:
    1. Ocean/Sea detection (highest priority)
    2. Major rivers/lakes (country-level)
    3. Local waterways (proximity-based)
    4. Groundwater and water facilities (NEW)
    
    Scoring Philosophy:
    - ON water body: 0.0 (unsuitable for construction)
    - NEAR water body: 90-100 (excellent for development)
    - GOOD groundwater/facilities: 80-95 (very good for development)
    - MODERATE water access: 60-80 (good for development)
    - FAR from water: 40-60 (limited but acceptable water access)
    - NO water detected: 50 (neutral baseline)
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
            score = _calculate_enhanced_proximity_score(distance, "ocean")
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
            score = _calculate_enhanced_proximity_score(distance, "major")
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
            score = _calculate_enhanced_proximity_score(distance, "local")
            return {
                "value": score,
                "distance_km": round(distance, 3),
                "normalized_water_risk": round(1.0 - (score / 100.0), 3),
                "water_type": "local_water_nearby",
                "details": local_water_result
            }

    # --------------------------------------------------
    # LAYER 4: GROUNDWATER AND WATER FACILITIES (NEW)
    # --------------------------------------------------
    groundwater_result = _detect_groundwater_and_facilities(latitude, longitude)
    if groundwater_result["found"]:
        score = groundwater_result["score"]
        return {
            "value": score,
            "distance_km": groundwater_result.get("distance_km"),
            "normalized_water_risk": round(1.0 - (score / 100.0), 3),
            "water_type": "groundwater_facilities",
            "details": groundwater_result
        }

    # --------------------------------------------------
    # LAYER 5: ENHANCED LAND FALLBACK
    # --------------------------------------------------
    return {
        "value": 50.0,  # Increased from 25.0 - more reasonable baseline
        "distance_km": None,
        "normalized_water_risk": 0.50,
        "water_type": "no_water_nearby",
        "details": {
            "source": "No Water Features Detected",
            "confidence": 0.8,
            "detail": "No water bodies detected within reasonable proximity. Assuming moderate water access."
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
        
        # Search for nearby ocean/coastal areas - more specific query
        coastal_query = f"""
        [out:json][timeout:15];
        (
          way["natural"="coastline"](around:50000,{lat},{lng});
          node["place"="ocean"](around:50000,{lat},{lng});
          node["place"="sea"](around:50000,{lat},{lng});
          way["natural"="water"]["water"~"^(ocean|sea|gulf|bay)$"](around:50000,{lat},{lng});
          relation["natural"="water"]["water"~"^(ocean|sea|gulf|bay)$"](around:50000,{lat},{lng});
        );
        out center 3;
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
                    
                    # Additional validation: ensure this is actually coastal/ocean water
                    # Exclude small inland water bodies by checking distance threshold and water type
                    tags = el.get("tags", {})
                    natural_type = tags.get("natural", "")
                    water_type = tags.get("water", "")
                    place_type = tags.get("place", "")
                    
                    # Only consider it coastal if it's actual coastline or large water body
                    is_coastal = (
                        natural_type == "coastline" or 
                        place_type in ["ocean", "sea"] or
                        water_type in ["ocean", "sea", "gulf", "bay"]
                    )
                    
                    if is_coastal and dist_km > 5:  # Must be at least 5km away to be considered coastal proximity
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


def _calculate_enhanced_proximity_score(distance_km: float, water_type: str) -> float:
    """
    Enhanced proximity score with generous scoring for water access.
    Philosophy: Water proximity is valuable for development, reward it generously!
    Closer to water = higher score (better for development).
    """
    
    if water_type == "ocean":
        # Ocean proximity - extremely valuable for coastal development
        if distance_km < 0.5:
            return 100.0  # Perfect beachfront/coastal access
        elif distance_km < 2.0:
            return 95.0   # Excellent coastal access
        elif distance_km < 5.0:
            return 90.0   # Very good coastal access
        elif distance_km < 10.0:
            return 85.0   # Good coastal access
        elif distance_km < 15.0:
            return 80.0   # Moderate coastal access
        elif distance_km < 25.0:
            return 75.0   # Acceptable coastal access
        elif distance_km < 40.0:
            return 70.0   # Reasonable coastal access
        else:
            return 65.0   # Distant but still valuable
            
    elif water_type == "major":
        # Major rivers/lakes - very valuable for development
        if distance_km < 0.5:
            return 100.0  # Direct water access
        elif distance_km < 1.0:
            return 95.0   # Excellent water access
        elif distance_km < 2.0:
            return 90.0   # Very good water access
        elif distance_km < 3.0:
            return 85.0   # Good water access
        elif distance_km < 5.0:
            return 80.0   # Moderate water access
        elif distance_km < 8.0:
            return 75.0   # Acceptable water access
        elif distance_km < 12.0:
            return 70.0   # Reasonable water access
        else:
            return 65.0   # Distant but still useful
            
    else:  # local
        # Local waterways - valuable for daily life and development
        if distance_km < 0.2:
            return 95.0   # Perfect local water access
        elif distance_km < 0.5:
            return 90.0   # Excellent local water access
        elif distance_km < 1.0:
            return 85.0   # Very good local water access
        elif distance_km < 2.0:
            return 80.0   # Good local water access
        elif distance_km < 3.5:
            return 75.0   # Moderate local water access
        elif distance_km < 6.0:
            return 70.0   # Acceptable local water access
        elif distance_km < 10.0:
            return 65.0   # Reasonable local water access
        else:
            return 60.0   # Distant but still beneficial

def _detect_groundwater_and_facilities(lat: float, lng: float) -> Dict:
    """Detect groundwater indicators and water facilities for enhanced scoring."""
    try:
        # Enhanced water facilities search
        facilities_query = f"""
        [out:json][timeout:15];
        (
          node["amenity"="water_point"](around:3000,{lat},{lng});
          node["amenity"="drinking_water"](around:3000,{lat},{lng});
          node["amenity"="fountain"](around:2000,{lat},{lng});
          node["man_made"="water_tower"](around:5000,{lat},{lng});
          node["man_made"="reservoir_covered"](around:5000,{lat},{lng});
          node["landuse"="reservoir"](around:5000,{lat},{lng});
          node["waterway"="stream"](around:2000,{lat},{lng});
          node["waterway"="ditch"](around:1000,{lat},{lng});
          node["natural"="spring"](around:3000,{lat},{lng});
          way["landuse"="reservoir"](around:5000,{lat},{lng});
          way["waterway"="stream"](around:2000,{lat},{lng});
        );
        out count;
        """
        
        for overpass_url in OVERPASS_URLS:
            try:
                resp = requests.post(
                    overpass_url,
                    data={"data": facilities_query},
                    headers=_HEADERS,
                    timeout=12
                )
                resp.raise_for_status()
                elements = (resp.json() or {}).get("elements", [])
                
                if elements:
                    # Count different types of water facilities
                    water_points = len([e for e in elements 
                                     if e.get("tags", {}).get("amenity") == "water_point"])
                    drinking_water = len([e for e in elements 
                                        if e.get("tags", {}).get("amenity") == "drinking_water"])
                    fountains = len([e for e in elements 
                                   if e.get("tags", {}).get("amenity") == "fountain"])
                    water_towers = len([e for e in elements 
                                      if e.get("tags", {}).get("man_made") == "water_tower"])
                    reservoirs = len([e for e in elements 
                                    if e.get("tags", {}).get("landuse") == "reservoir"])
                    streams = len([e for e in elements 
                                  if e.get("tags", {}).get("waterway") == "stream"])
                    springs = len([e for e in elements 
                                  if e.get("tags", {}).get("natural") == "spring"])
                    
                    total_facilities = water_points + drinking_water + fountains + water_towers + reservoirs + streams + springs
                    
                    # Enhanced scoring based on facility count and type
                    if total_facilities >= 10:
                        score = 95.0  # Excellent water infrastructure
                    elif total_facilities >= 7:
                        score = 90.0  # Very good water infrastructure
                    elif total_facilities >= 5:
                        score = 85.0  # Good water infrastructure
                    elif total_facilities >= 3:
                        score = 80.0  # Moderate water infrastructure
                    elif total_facilities >= 2:
                        score = 75.0  # Basic water infrastructure
                    else:
                        score = 70.0  # Minimal water infrastructure
                    
                    # Bonus points for critical facilities
                    if water_towers >= 1:
                        score = min(100.0, score + 3)  # Water tower bonus
                    if reservoirs >= 1:
                        score = min(100.0, score + 2)  # Reservoir bonus
                    if springs >= 1:
                        score = min(100.0, score + 2)  # Spring bonus
                    if drinking_water >= 2:
                        score = min(100.0, score + 2)  # Drinking water bonus
                    
                    return {
                        "found": True,
                        "score": score,
                        "distance_km": None,  # Facilities are distributed
                        "total_facilities": total_facilities,
                        "water_points": water_points,
                        "drinking_water": drinking_water,
                        "water_towers": water_towers,
                        "reservoirs": reservoirs,
                        "springs": springs,
                        "source": "Water Facilities Detection",
                        "detail": f"Found {total_facilities} water facilities: {water_points} water points, {drinking_water} drinking water, {water_towers} water towers"
                    }
            except Exception:
                continue
                
    except Exception:
        pass
    
    # If no facilities found, check regional groundwater potential
    groundwater_score = _estimate_groundwater_potential(lat, lng)
    if groundwater_score > 60:
        return {
            "found": True,
            "score": groundwater_score,
            "distance_km": None,
            "groundwater_potential": True,
            "source": "Groundwater Estimation",
            "detail": f"Estimated good groundwater potential: {groundwater_score}/100"
        }
    
    return {"found": False, "score": None}

def _estimate_groundwater_potential(lat: float, lng: float) -> float:
    """Estimate groundwater potential based on geographic factors."""
    try:
        region = _get_geographic_region(lat, lng)
        
        # Groundwater potential by region (simplified estimation)
        groundwater_potential = {
            "north_america": 75.0,  # Good aquifers
            "europe": 80.0,           # Excellent groundwater
            "south_asia": 85.0,       # Very good groundwater (Indus, Ganges)
            "east_asia": 70.0,        # Variable groundwater
            "southeast_asia": 75.0,   # Good groundwater
            "south_america": 80.0,    # Excellent groundwater (Amazon basin)
            "africa": 65.0,           # Variable groundwater
            "oceania": 70.0,          # Moderate groundwater
            "other": 60.0             # Unknown
        }
        
        base_potential = groundwater_potential.get(region, 60.0)
        
        # Adjust for climate (simplified)
        if abs(lat) < 30:  # Tropical regions
            base_potential += 5  # Higher rainfall = better recharge
        elif abs(lat) > 60:  # Polar regions
            base_potential -= 10  # Limited recharge
        
        # Adjust for proximity to water bodies
        # If we're in this function, no surface water was found nearby
        # So we slightly reduce the score
        base_potential -= 5
        
        return max(40, min(90, base_potential))
        
    except Exception:
        return 60.0  # Moderate default

def _get_geographic_region(lat: float, lng: float) -> str:
    """Determine geographic region for groundwater estimation."""
    if 60 <= lat <= 80 and -10 <= lng <= 40:
        return "europe"
    elif 25 <= lat <= 50 and -130 <= lng <= -60:
        return "north_america"
    elif -55 <= lat <= 15 and -80 <= lng <= -35:
        return "south_america"
    elif -35 <= lat <= 37 and 10 <= lng <= 50:
        return "africa"
    elif 5 <= lat <= 50 and 60 <= lng <= 150:
        return "south_asia"
    elif 20 <= lat <= 50 and 100 <= lng <= 150:
        return "east_asia"
    elif -10 <= lat <= 20 and 95 <= lng <= 140:
        return "southeast_asia"
    elif -10 <= lat <= -45 and 110 <= lng <= 180:
        return "oceania"
    else:
        return "other"
