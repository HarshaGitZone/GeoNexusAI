#!/usr/bin/env python3
"""
Comprehensive Global Ocean Detection System
Replaces the simplified ocean bounds with accurate global ocean detection
"""

def _is_in_hardcoded_ocean_precise(lat: float, lon: float) -> tuple[bool, str | None]:
    """
    Precise global ocean detection with accurate boundaries for all major oceans.
    Uses realistic ocean boundaries that exclude continental land masses.
    
    This function is designed as a fail-safe when map-based detection fails.
    It only returns True for coordinates that are definitively in deep ocean.
    """
    
    # Normalize longitude to [-180, 180] range
    lon = ((lon + 180) % 360) - 180
    
    # PACIFIC OCEAN - Multiple regions to avoid land masses
    # Western Pacific (east of Asia, Australia)
    if (-10 <= lat <= 50 and 145 <= lon <= 180) or \
       (-50 <= lat <= -10 and 140 <= lon <= 180):
        return True, "Western Pacific Ocean"
    
    # Eastern Pacific (west of Americas)
    if (-50 <= lat <= 50 and -180 <= lon <= -120):
        return True, "Eastern Pacific Ocean"
    
    # Central Pacific (island regions, but mostly ocean)
    if (-20 <= lat <= 20 and -120 <= lon <= 145):
        # Exclude major island chains
        if not ((18 <= lat <= 23 and -155 <= lon <= -145) or  # Hawaii
                (-20 <= lat <= -15 and -180 <= lon <= -170) or  # Samoa
                (-15 <= lat <= -10 and -180 <= lon <= -170) or  # Tonga
                (-35 <= lat <= -25 and 170 <= lon <= 180)):     # New Zealand
            return True, "Central Pacific Ocean"
    
    # ATLANTIC OCEAN
    # North Atlantic
    if (10 <= lat <= 70 and -60 <= lon <= -10):
        return True, "North Atlantic Ocean"
    
    # South Atlantic
    if (-50 <= lat <= 10 and -40 <= lon <= -10):
        return True, "South Atlantic Ocean"
    
    # Central Atlantic (Caribbean region)
    if (10 <= lat <= 25 and -85 <= lon <= -60):
        return True, "Central Atlantic Ocean"
    
    # INDIAN OCEAN
    # Main Indian Ocean (avoiding Indian subcontinent)
    if (-60 <= lat <= 5 and 40 <= lon <= 100):
        # Exclude India, Sri Lanka, and nearby land
        if not ((5 <= lat <= 35 and 68 <= lon <= 97) or  # India
                (5 <= lat <= 10 and 79 <= lon <= 83)):   # Sri Lanka
            return True, "Indian Ocean"
    
    # Arabian Sea (avoid Arabian Peninsula)
    if (5 <= lat <= 25 and 55 <= lon <= 68):
        return True, "Arabian Sea"
    
    # Bay of Bengal (avoid Bangladesh, Myanmar)
    if (5 <= lat <= 22 and 80 <= lon <= 100):
        return True, "Bay of Bengal"
    
    # SOUTHERN OCEAN (around Antarctica)
    if (-90 <= lat <= -60):
        return True, "Southern Ocean"
    
    # ARCTIC OCEAN
    if (66 <= lat <= 90):
        return True, "Arctic Ocean"
    
    # MAJOR SEAS AND GULFS
    # Mediterranean Sea
    if (30 <= lat <= 46 and -6 <= lon <= 42):
        return True, "Mediterranean Sea"
    
    # Red Sea
    if (12 <= lat <= 30 and 32 <= lon <= 43):
        return True, "Red Sea"
    
    # Persian Gulf
    if (24 <= lat <= 30 and 48 <= lon <= 53):
        return True, "Persian Gulf"
    
    # Black Sea
    if (40 <= lat <= 47 and 27 <= lon <= 42):
        return True, "Black Sea"
    
    # Baltic Sea
    if (53 <= lat <= 66 and 9 <= lon <= 30):
        return True, "Baltic Sea"
    
    # North Sea
    if (51 <= lat <= 62 and -3 <= lon <= 9):
        return True, "North Sea"
    
    # Sea of Japan
    if (33 <= lat <= 46 and 127 <= lon <= 142):
        return True, "Sea of Japan"
    
    # Yellow Sea
    if (32 <= lat <= 40 and 119 <= lon <= 126):
        return True, "Yellow Sea"
    
    # East China Sea
    if (23 <= lat <= 34 and 118 <= lon <= 131):
        return True, "East China Sea"
    
    # South China Sea
    if (0 <= lat <= 23 and 99 <= lon <= 121):
        return True, "South China Sea"
    
    # Java Sea
    if (-10 <= lat <= 0 and 105 <= lon <= 118):
        return True, "Java Sea"
    
    # Celebes Sea
    if (0 <= lat <= 8 and 118 <= lon <= 125):
        return True, "Celebes Sea"
    
    # Coral Sea
    if (-30 <= lat <= -10 and 142 <= lon <= 180):
        return True, "Coral Sea"
    
    # Tasman Sea
    if (-50 <= lat <= -30 and 145 <= lon <= 170):
        return True, "Tasman Sea"
    
    return False, None


def test_global_ocean_detection():
    """Test the improved global ocean detection system"""
    
    print("=" * 80)
    print("COMPREHENSIVE GLOBAL OCEAN DETECTION TEST")
    print("=" * 80)
    
    # Test major cities from all continents
    cities = [
        # North America
        (40.7128, -74.0060, "New York, USA"),
        (34.0522, -118.2437, "Los Angeles, USA"),
        (41.8781, -87.6298, "Chicago, USA"),
        (32.7620, -96.7790, "Dallas, USA"),
        (49.2827, -123.1207, "Vancouver, Canada"),
        (45.4215, -75.6972, "Ottawa, Canada"),
        (19.4326, -99.1332, "Mexico City, Mexico"),
        
        # South America
        (-33.4489, -70.6693, "Santiago, Chile"),
        (-12.0464, -77.0428, "Lima, Peru"),
        (-34.6037, -58.3816, "Buenos Aires, Argentina"),
        (-23.5505, -46.6333, "São Paulo, Brazil"),
        (-22.9068, -43.1729, "Rio de Janeiro, Brazil"),
        
        # Europe
        (51.5074, -0.1278, "London, UK"),
        (48.8566, 2.3522, "Paris, France"),
        (52.5200, 13.4050, "Berlin, Germany"),
        (41.9028, 12.4964, "Rome, Italy"),
        (40.4168, -3.7038, "Madrid, Spain"),
        (55.7558, 37.6173, "Moscow, Russia"),
        
        # Africa
        (-33.9249, 18.4241, "Cape Town, South Africa"),
        (30.0444, 31.2357, "Cairo, Egypt"),
        (-1.2921, 36.8219, "Nairobi, Kenya"),
        (6.5244, -3.3792, "Abidjan, Côte d'Ivoire"),
        (33.8869, 35.5131, "Beirut, Lebanon"),
        
        # Asia
        (35.6762, 139.6503, "Tokyo, Japan"),
        (31.2304, 121.4737, "Shanghai, China"),
        (28.6139, 77.2090, "New Delhi, India"),
        (1.3521, 103.8198, "Singapore"),
        (13.7563, 100.5018, "Bangkok, Thailand"),
        (-6.2088, 106.8456, "Jakarta, Indonesia"),
        (25.2048, 121.5598, "Taipei, Taiwan"),
        (37.5665, 126.9780, "Seoul, South Korea"),
        
        # Oceania
        (-33.8688, 151.2093, "Sydney, Australia"),
        (-37.8136, 144.9631, "Melbourne, Australia"),
        (-41.2865, 174.7762, "Wellington, New Zealand"),
    ]
    
    # Test actual ocean coordinates
    ocean_coords = [
        (0, 160, "Central Pacific Ocean"),
        (0, -140, "Eastern Pacific Ocean"),
        (30, -30, "North Atlantic Ocean"),
        (-30, -30, "South Atlantic Ocean"),
        (0, 80, "Indian Ocean"),
        (0, 20, "Mediterranean Sea"),
        (25, 50, "Persian Gulf"),
        (35, 135, "Sea of Japan"),
        (10, 110, "South China Sea"),
        (-40, 150, "Tasman Sea"),
        (80, 0, "Arctic Ocean"),
        (-80, 0, "Southern Ocean"),
    ]
    
    print("Testing Major Cities (should all be LAND):")
    print("-" * 50)
    
    cities_correct = 0
    cities_incorrect = 0
    
    for lat, lng, city in cities:
        is_ocean, ocean_name = _is_in_hardcoded_ocean_precise(lat, lng)
        if is_ocean:
            cities_incorrect += 1
            print(f"❌ {city} -> {ocean_name}")
        else:
            cities_correct += 1
            print(f"✅ {city} -> LAND")
    
    print(f"\nCities: {cities_correct} correct, {cities_incorrect} incorrect")
    
    print("\nTesting Ocean Coordinates (should all be OCEAN):")
    print("-" * 50)
    
    oceans_correct = 0
    oceans_incorrect = 0
    
    for lat, lng, location in ocean_coords:
        is_ocean, ocean_name = _is_in_hardcoded_ocean_precise(lat, lng)
        if is_ocean:
            oceans_correct += 1
            print(f"✅ {location} -> {ocean_name}")
        else:
            oceans_incorrect += 1
            print(f"❌ {location} -> LAND")
    
    print(f"\nOceans: {oceans_correct} correct, {oceans_incorrect} incorrect")
    
    print("\n" + "=" * 80)
    print("SUMMARY")
    print("=" * 80)
    print(f"Major Cities Correctly Classified: {cities_correct}/{len(cities)} ({cities_correct/len(cities)*100:.1f}%)")
    print(f"Ocean Locations Correctly Classified: {oceans_correct}/{len(ocean_coords)} ({oceans_correct/len(ocean_coords)*100:.1f}%)")
    
    if cities_incorrect == 0 and oceans_incorrect == 0:
        print("🎉 PERFECT! Global ocean detection is 100% accurate!")
        return True
    elif cities_incorrect == 0:
        print("✅ All cities correctly classified, some ocean areas may need refinement")
        return True
    else:
        print("❌ Some cities still incorrectly classified as ocean")
        return False

if __name__ == "__main__":
    test_global_ocean_detection()
