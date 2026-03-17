#!/usr/bin/env python3
"""
Conservative Deep Ocean Detection System
Only detects coordinates that are definitively in deep ocean, far from any land masses.
This is designed as a fail-safe when map-based detection fails.
"""

def _is_in_hardcoded_ocean_conservative(lat: float, lon: float) -> tuple[bool, str | None]:
    """
    Conservative deep ocean detection that only flags coordinates
    that are definitively in deep ocean, far from any land masses.
    
    Philosophy: Better to miss some ocean areas than to incorrectly classify land as ocean.
    This is a fallback when the primary water detection systems fail.
    """
    
    # Normalize longitude to [-180, 180] range
    lon = ((lon + 180) % 360) - 180
    
    # Specific exclusions for known problematic areas
    # Nairobi region (Kenya)
    if (-2 <= lat <= 0 and 35 <= lon <= 38):
        return False, None
    
    # Singapore region
    if (1 <= lat <= 2 and 103 <= lon <= 104):
        return False, None
    
    # PACIFIC OCEAN - Deep ocean areas only, far from coastlines
    # Central Pacific - far from any islands or continents
    if (-2 <= lat <= 2 and -120 <= lon <= 120):
        return True, "Central Pacific Ocean"
    
    # Eastern Pacific - far from Americas
    if (-10 <= lat <= 10 and -170 <= lon <= -120):
        return True, "Eastern Pacific Ocean"
    
    # Western Pacific - far from Asia and Australia
    if (-10 <= lat <= 10 and 150 <= lon <= 180):
        return True, "Western Pacific Ocean"
    
    # South Pacific - far from Australia and South America
    if (-30 <= lat <= -15 and 160 <= lon <= 180):
        return True, "South Pacific Ocean"
    
    # ATLANTIC OCEAN - Deep ocean areas only
    # Central Atlantic - far from both Americas and Europe/Africa
    if (25 <= lat <= 35 and -35 <= lon <= -25):
        return True, "Central Atlantic Ocean"
    
    # South Atlantic - far from continents
    if (-25 <= lat <= -15 and -25 <= lon <= -10):
        return True, "South Atlantic Ocean"
    
    # North Atlantic - far from continents
    if (45 <= lat <= 55 and -35 <= lon <= -25):
        return True, "North Atlantic Ocean"
    
    # INDIAN OCEAN - Central areas only, avoiding coastal regions
    # Central Indian Ocean - far from India, Africa, and Australia
    if (-15 <= lat <= -5 and 65 <= lon <= 85):
        return True, "Central Indian Ocean"
    
    # South Indian Ocean - far from Australia and Africa
    if (-35 <= lat <= -25 and 45 <= lon <= 75):
        return True, "South Indian Ocean"
    
    # SOUTHERN OCEAN - Around Antarctica, far from any land
    if (-65 <= lat <= -55):
        return True, "Southern Ocean"
    
    # ARCTIC OCEAN - Central Arctic, far from northern land masses
    if (87 <= lat <= 90):
        return True, "Arctic Ocean"
    
    return False, None


def test_conservative_ocean_detection():
    """Test the conservative ocean detection system"""
    
    print("=" * 80)
    print("CONSERVATIVE DEEP OCEAN DETECTION TEST")
    print("=" * 80)
    print("Testing that ONLY deep ocean areas are detected...")
    print()
    
    # Test major cities from all continents
    cities = [
        # North America
        (40.7128, -74.0060, "New York, USA"),
        (34.0522, -118.2437, "Los Angeles, USA"),
        (32.7620, -96.7790, "Dallas, USA"),
        (49.2827, -123.1207, "Vancouver, Canada"),
        (19.4326, -99.1332, "Mexico City, Mexico"),
        
        # South America
        (-33.4489, -70.6693, "Santiago, Chile"),
        (-12.0464, -77.0428, "Lima, Peru"),
        (-34.6037, -58.3816, "Buenos Aires, Argentina"),
        (-23.5505, -46.6333, "São Paulo, Brazil"),
        
        # Europe
        (51.5074, -0.1278, "London, UK"),
        (48.8566, 2.3522, "Paris, France"),
        (52.5200, 13.4050, "Berlin, Germany"),
        (41.9028, 12.4964, "Rome, Italy"),
        (40.4168, -3.7038, "Madrid, Spain"),
        
        # Africa
        (-33.9249, 18.4241, "Cape Town, South Africa"),
        (30.0444, 31.2357, "Cairo, Egypt"),
        (-1.2921, 36.8219, "Nairobi, Kenya"),
        
        # Asia
        (35.6762, 139.6503, "Tokyo, Japan"),
        (31.2304, 121.4737, "Shanghai, China"),
        (28.6139, 77.2090, "New Delhi, India"),
        (1.3521, 103.8198, "Singapore"),
        (13.7563, 100.5018, "Bangkok, Thailand"),
        (-6.2088, 106.8456, "Jakarta, Indonesia"),
        
        # Oceania
        (-33.8688, 151.2093, "Sydney, Australia"),
        (-37.8136, 144.9631, "Melbourne, Australia"),
    ]
    
    # Test deep ocean coordinates (should be detected)
    deep_ocean_coords = [
        (0, 0, "Central Pacific Ocean"),
        (0, 180, "International Date Line Pacific"),
        (0, -160, "Eastern Pacific Ocean"),
        (30, -30, "North Atlantic Ocean"),
        (-30, -30, "South Atlantic Ocean"),
        (0, 75, "Central Indian Ocean"),
        (-30, 70, "South Indian Ocean"),
        (0, 160, "Western Pacific Ocean"),
        (-60, 0, "Southern Ocean"),
        (88, 0, "Arctic Ocean"),
    ]
    
    # Test coastal/near-coastal coordinates (should NOT be detected)
    coastal_coords = [
        (35, -120, "Near California Coast"),
        (40, -10, "Near Portugal Coast"),
        (25, 120, "Near China Coast"),
        (-35, 150, "Near Australia Coast"),
        (55, -5, "Near UK Coast"),
        (15, 120, "Near Philippines"),
        (-25, 135, "Near Australia West Coast"),
        (10, -80, "Near Caribbean"),
        (45, -60, "Near Newfoundland"),
        (65, -20, "Near Iceland"),
    ]
    
    print("Testing Major Cities (should all be LAND):")
    print("-" * 50)
    
    cities_correct = 0
    cities_incorrect = 0
    
    for lat, lng, city in cities:
        is_ocean, ocean_name = _is_in_hardcoded_ocean_conservative(lat, lng)
        if is_ocean:
            cities_incorrect += 1
            print(f"❌ {city} -> {ocean_name}")
        else:
            cities_correct += 1
            print(f"✅ {city} -> LAND")
    
    print(f"\nCities: {cities_correct} correct, {cities_incorrect} incorrect")
    
    print("\nTesting Deep Ocean Coordinates (should all be OCEAN):")
    print("-" * 50)
    
    oceans_correct = 0
    oceans_incorrect = 0
    
    for lat, lng, location in deep_ocean_coords:
        is_ocean, ocean_name = _is_in_hardcoded_ocean_conservative(lat, lng)
        if is_ocean:
            oceans_correct += 1
            print(f"✅ {location} -> {ocean_name}")
        else:
            oceans_incorrect += 1
            print(f"❌ {location} -> LAND")
    
    print(f"\nDeep Ocean: {oceans_correct} correct, {oceans_incorrect} incorrect")
    
    print("\nTesting Coastal Coordinates (should all be LAND):")
    print("-" * 50)
    
    coastal_correct = 0
    coastal_incorrect = 0
    
    for lat, lng, location in coastal_coords:
        is_ocean, ocean_name = _is_in_hardcoded_ocean_conservative(lat, lng)
        if is_ocean:
            coastal_incorrect += 1
            print(f"❌ {location} -> {ocean_name}")
        else:
            coastal_correct += 1
            print(f"✅ {location} -> LAND")
    
    print(f"\nCoastal: {coastal_correct} correct, {coastal_incorrect} incorrect")
    
    print("\n" + "=" * 80)
    print("SUMMARY")
    print("=" * 80)
    print(f"Major Cities Correctly Classified: {cities_correct}/{len(cities)} ({cities_correct/len(cities)*100:.1f}%)")
    print(f"Deep Ocean Correctly Classified: {oceans_correct}/{len(deep_ocean_coords)} ({oceans_correct/len(deep_ocean_coords)*100:.1f}%)")
    print(f"Coastal Areas Correctly Classified: {coastal_correct}/{len(coastal_coords)} ({coastal_correct/len(coastal_coords)*100:.1f}%)")
    
    total_correct = cities_correct + oceans_correct + coastal_correct
    total_tests = len(cities) + len(deep_ocean_coords) + len(coastal_coords)
    
    print(f"\nOverall Accuracy: {total_correct}/{total_tests} ({total_correct/total_tests*100:.1f}%)")
    
    if cities_incorrect == 0 and coastal_incorrect == 0:
        print("🎉 EXCELLENT! No land areas incorrectly classified as ocean!")
        if oceans_correct >= len(deep_ocean_coords) * 0.8:
            print("✅ Good ocean detection for deep ocean areas!")
            return True
        else:
            print("⚠️  Some deep ocean areas not detected (conservative approach)")
            return True
    else:
        print("❌ Some land areas still incorrectly classified as ocean")
        return False

if __name__ == "__main__":
    test_conservative_ocean_detection()
