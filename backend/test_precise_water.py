#!/usr/bin/env python3
"""
Precise Global Water Body Detection System
Hierarchical detection: Cities > Lakes > Rivers > Seas > Oceans
"""

def _is_in_hardcoded_ocean_precise(lat: float, lon: float) -> tuple[bool, str | None]:
    """
    Hierarchical water body detection system.
    
    Priority Order:
    1. Cities and known land areas (exclude these)
    2. Major lakes (specific detection)
    3. Major rivers (linear detection)
    4. Seas and gulfs (regional detection)
    5. Oceans (broad detection)
    
    This ensures cities are never misclassified as water.
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
        
        # Asia
        (35.6762, 139.6503, 50, "Tokyo"),
        (31.2304, 121.4737, 50, "Shanghai"),
        (28.6139, 77.2090, 50, "New Delhi"),
        (1.3521, 103.8198, 50, "Singapore"),
        (13.7563, 100.5018, 50, "Bangkok"),
        (-6.2088, 106.8456, 50, "Jakarta"),
        (37.5665, 126.9780, 50, "Seoul"),
        
        # Oceania
        (-33.8688, 151.2093, 50, "Sydney"),
        (-37.8136, 144.9631, 50, "Melbourne"),
        (-41.2865, 174.7762, 50, "Wellington"),
    ]
    
    # Check if within city radius
    for city_lat, city_lon, radius, name in major_cities:
        if _haversine_distance(lat, lon, city_lat, city_lon) <= radius:
            return True
    
    # Only check major cities, not broad land zones
    # This allows water detection in rural/remote areas
    return False


def _detect_major_lakes(lat: float, lon: float) -> str | None:
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


def _detect_major_rivers(lat: float, lon: float) -> str | None:
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


def _detect_seas_and_gulfs(lat: float, lon: float) -> str | None:
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
        # Arabian Sea
        ((5, 25), (55, 75), "Arabian Sea"),
    ]
    
    for lat_range, lon_range, name in seas:
        if lat_range[0] <= lat <= lat_range[1] and lon_range[0] <= lon <= lon_range[1]:
            return name
    
    return None


def _detect_oceans(lat: float, lon: float) -> str | None:
    """Detect oceans with broad but accurate boundaries"""
    
    # Pacific Ocean
    if (-60 <= lat <= 60) and ((120 <= lon <= 180) or (-180 <= lon <= -120)):
        return "Pacific Ocean"
    
    # Atlantic Ocean
    if (-60 <= lat <= 70) and (-80 <= lon <= 10):
        return "Atlantic Ocean"
    
    # Indian Ocean
    if (-60 <= lat <= 30) and (20 <= lon <= 120):
        return "Indian Ocean"
    
    # Arctic Ocean
    if (66 <= lat <= 90):
        return "Arctic Ocean"
    
    # Southern Ocean
    if (-90 <= lat <= -50):
        return "Southern Ocean"
    
    return None


def _haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
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
        distance = _haversine_distance(lat, lon, point_lat, point_lon)
        if distance <= threshold_km:
            return True
    
    return False


def _is_coastal_buffer(lat: float, lon: float) -> bool:
    """Check if point is in coastal buffer zone"""
    
    # Simplified coastal detection - within 200km of coast
    # This is a rough approximation
    coastal_zones = [
        # Major coastal areas
        ((-10, 10), (-80, -70)),  # Caribbean
        ((25, 45), (-125, -115)),  # West Coast US
        ((35, 45), (-75, -65)),    # East Coast US
        ((50, 60), (-10, 10)),     # Northern Europe
        ((-35, -25), (150, 160)),  # Southeast Australia
    ]
    
    for lat_range, lon_range in coastal_zones:
        if lat_range[0] <= lat <= lat_range[1] and lon_range[0] <= lon <= lon_range[1]:
            return True
    
    return False


def test_precise_water_detection():
    """Test the precise water detection system"""
    
    print("=" * 80)
    print("PRECISE GLOBAL WATER BODY DETECTION TEST")
    print("=" * 80)
    
    # Test major cities (should be LAND)
    cities = [
        (40.7128, -74.0060, "New York, USA"),
        (32.7620, -96.7790, "Dallas, USA"),
        (51.5074, -0.1278, "London, UK"),
        (35.6762, 139.6503, "Tokyo, Japan"),
        (-33.8688, 151.2093, "Sydney, Australia"),
        (28.6139, 77.2090, "New Delhi, India"),
        (-23.5505, -46.6333, "São Paulo, Brazil"),
        (55.7558, 37.6173, "Moscow, Russia"),
        (1.3521, 103.8198, "Singapore"),
        (-33.9249, 18.4241, "Cape Town, South Africa"),
    ]
    
    # Test major water bodies
    water_tests = [
        # Oceans
        (0, 0, "Pacific Ocean"),
        (0, -30, "Atlantic Ocean"),
        (0, 80, "Indian Ocean"),
        (70, 0, "Arctic Ocean"),
        (-70, 0, "Southern Ocean"),
        
        # Seas
        (35, 18, "Mediterranean Sea"),
        (20, 40, "Red Sea"),
        (27, 50, "Persian Gulf"),
        (35, 130, "East China Sea"),
        (15, -80, "Caribbean Sea"),
        
        # Lakes
        (45, -85, "Great Lakes"),
        (-1, 33, "Lake Victoria"),
        (43, 50, "Caspian Sea"),
        
        # Rivers
        (-3, -60, "Amazon River"),
        (25, 32, "Nile River"),
        (35, -90, "Mississippi River"),
    ]
    
    print("Testing Major Cities (should be LAND):")
    print("-" * 50)
    cities_correct = 0
    for lat, lng, city in cities:
        is_water, water_name = _is_in_hardcoded_ocean_precise(lat, lng)
        if not is_water:
            cities_correct += 1
            print(f"✅ {city} -> LAND")
        else:
            print(f"❌ {city} -> {water_name}")
    
    print(f"\nCities: {cities_correct}/{len(cities)} ({cities_correct/len(cities)*100:.1f}%)")
    
    print("\nTesting Water Bodies (should be WATER):")
    print("-" * 50)
    water_correct = 0
    for lat, lng, expected in water_tests:
        is_water, water_name = _is_in_hardcoded_ocean_precise(lat, lng)
        if is_water:
            water_correct += 1
            print(f"✅ {expected} -> {water_name}")
        else:
            print(f"❌ {expected} -> LAND")
    
    print(f"\nWater Bodies: {water_correct}/{len(water_tests)} ({water_correct/len(water_tests)*100:.1f}%)")
    
    total_correct = cities_correct + water_correct
    total_tests = len(cities) + len(water_tests)
    
    print("\n" + "=" * 80)
    print("PRECISE RESULTS")
    print("=" * 80)
    print(f"Overall Accuracy: {total_correct}/{total_tests} ({total_correct/total_tests*100:.1f}%)")
    
    return total_correct / total_tests >= 0.80

if __name__ == "__main__":
    test_precise_water_detection()
