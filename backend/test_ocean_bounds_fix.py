#!/usr/bin/env python3
"""
Test script to verify all major cities are correctly classified as land, not water bodies
after fixing the Pacific Ocean bounds issue.
"""

from suitability_factors.hydrology.water_utility import _is_in_hardcoded_ocean

def test_ocean_bounds_fix():
    """Test that major cities are NOT incorrectly classified as ocean"""
    
    # Major cities from test files and additional global cities
    test_cities = [
        # From test files
        (32.7620, -96.7790, "Dallas, USA"),
        (28.6139, 77.2090, "New Delhi, India"),
        (40.7128, -74.0060, "New York, USA"),
        (51.5074, -0.1278, "London, UK"),
        (37.7749, -122.4194, "San Francisco, USA"),
        (19.0760, 72.8777, "Mumbai, India"),
        (12.9716, 77.5946, "Bangalore, India"),
        (30.2672, 97.7431, "Austin, USA"),
        (34.0536909, -118.242766, "Los Angeles, USA"),
        (17.537011707550533, 78.38704567496563, "Hyderabad, India"),
        (35.6762, 139.6503, "Tokyo, Japan"),
        
        # Additional major cities that could be affected
        (41.8781, -87.6298, "Chicago, USA"),
        (29.7604, -95.3698, "Houston, USA"),
        (33.4484, -112.0740, "Phoenix, USA"),
        (39.7392, -104.9903, "Denver, USA"),
        (47.6062, -122.3321, "Seattle, USA"),
        (45.5152, -122.6784, "Portland, USA"),
        (40.7608, -111.8910, "Salt Lake City, USA"),
        (39.0438, -77.4874, "Washington DC, USA"),
        (42.3601, -71.0589, "Boston, USA"),
        (25.7617, -80.1918, "Miami, USA"),
        
        # Canadian cities
        (43.6532, -79.3832, "Toronto, Canada"),
        (49.2827, -123.1207, "Vancouver, Canada"),
        (45.4215, -75.6972, "Ottawa, Canada"),
        (51.0447, -114.0719, "Calgary, Canada"),
        
        # Mexican cities
        (19.4326, -99.1332, "Mexico City, Mexico"),
        (20.6597, -103.3496, "Guadalajara, Mexico"),
        
        # South American cities
        (-33.4489, -70.6693, "Santiago, Chile"),
        (-12.0464, -77.0428, "Lima, Peru"),
        (-34.6037, -58.3816, "Buenos Aires, Argentina"),
        
        # European cities
        (48.8566, 2.3522, "Paris, France"),
        (52.5200, 13.4050, "Berlin, Germany"),
        (41.9028, 12.4964, "Rome, Italy"),
        (40.4168, -3.7038, "Madrid, Spain"),
        
        # Asian cities
        (31.2304, 121.4737, "Shanghai, China"),
        (39.9042, 116.4074, "Beijing, China"),
        (1.3521, 103.8198, "Singapore"),
        (13.7563, 100.5018, "Bangkok, Thailand"),
        (-6.2088, 106.8456, "Jakarta, Indonesia"),
        
        # African cities
        (-26.2041, 28.0473, "Johannesburg, South Africa"),
        (30.0444, 31.2357, "Cairo, Egypt"),
        (-1.2921, 36.8219, "Nairobi, Kenya"),
        
        # Australian cities
        (-33.8688, 151.2093, "Sydney, Australia"),
        (-37.8136, 144.9631, "Melbourne, Australia"),
    ]
    
    print("=" * 80)
    print("OCEAN BOUNDS FIX VERIFICATION TEST")
    print("=" * 80)
    print("Testing that major cities are NOT incorrectly classified as ocean...")
    print()
    
    incorrectly_classified = []
    correctly_classified = []
    
    for lat, lng, city in test_cities:
        is_ocean, ocean_name = _is_in_hardcoded_ocean(lat, lng)
        
        if is_ocean:
            incorrectly_classified.append((lat, lng, city, ocean_name))
            print(f"❌ {city}")
            print(f"   Coordinates: ({lat:.4f}, {lng:.4f})")
            print(f"   ERROR: Classified as {ocean_name}")
            print()
        else:
            correctly_classified.append((lat, lng, city))
    
    print("=" * 80)
    print("RESULTS SUMMARY")
    print("=" * 80)
    print(f"✅ Correctly classified as LAND: {len(correctly_classified)} cities")
    print(f"❌ Incorrectly classified as OCEAN: {len(incorrectly_classified)} cities")
    print()
    
    if incorrectly_classified:
        print("⚠️  STILL INCORRECTLY CLASSIFIED:")
        for lat, lng, city, ocean_name in incorrectly_classified:
            print(f"   • {city} ({lat:.4f}, {lng:.4f}) → {ocean_name}")
        print()
        print("🔧 These ocean bounds still need adjustment!")
        return False
    else:
        print("🎉 ALL MAJOR CITIES CORRECTLY CLASSIFIED AS LAND!")
        print("✅ The ocean bounds fix is working correctly.")
        return True

def test_actual_ocean_locations():
    """Test that actual ocean locations are still correctly classified"""
    
    print("\n" + "=" * 80)
    print("ACTUAL OCEAN LOCATIONS TEST")
    print("=" * 80)
    print("Testing that actual ocean locations ARE correctly classified as ocean...")
    print()
    
    # Actual ocean coordinates
    ocean_locations = [
        (0.0, 150.0, "Pacific Ocean - Central"),
        (0.0, -160.0, "Pacific Ocean - Eastern"),
        (0.0, -30.0, "Atlantic Ocean - Central"),
        (0.0, 80.0, "Indian Ocean - Central"),
        (10.0, 150.0, "Pacific Ocean - Western"),
        (-20.0, -30.0, "South Atlantic Ocean"),
        (-10.0, 60.0, "Indian Ocean - South"),
    ]
    
    correctly_classified_ocean = []
    incorrectly_classified_land = []
    
    for lat, lng, location in ocean_locations:
        is_ocean, ocean_name = _is_in_hardcoded_ocean(lat, lng)
        
        if is_ocean:
            correctly_classified_ocean.append((lat, lng, location, ocean_name))
            print(f"✅ {location}")
            print(f"   Coordinates: ({lat:.4f}, {lng:.4f})")
            print(f"   Correctly classified as {ocean_name}")
            print()
        else:
            incorrectly_classified_land.append((lat, lng, location))
            print(f"❌ {location}")
            print(f"   Coordinates: ({lat:.4f}, {lng:.4f})")
            print(f"   ERROR: Classified as LAND (should be ocean)")
            print()
    
    print("=" * 80)
    print("OCEAN LOCATIONS SUMMARY")
    print("=" * 80)
    print(f"✅ Correctly classified as OCEAN: {len(correctly_classified_ocean)} locations")
    print(f"❌ Incorrectly classified as LAND: {len(incorrectly_classified_land)} locations")
    
    return len(incorrectly_classified_land) == 0

if __name__ == "__main__":
    cities_ok = test_ocean_bounds_fix()
    oceans_ok = test_actual_ocean_locations()
    
    print("\n" + "=" * 80)
    print("FINAL ASSESSMENT")
    print("=" * 80)
    
    if cities_ok and oceans_ok:
        print("🎉 ALL TESTS PASSED!")
        print("✅ Ocean bounds are correctly configured")
        print("✅ No cities are incorrectly classified as water bodies")
        print("✅ Actual ocean locations are still correctly detected")
    elif cities_ok:
        print("⚠️  PARTIAL SUCCESS")
        print("✅ Cities are correctly classified as land")
        print("❌ Some ocean locations may not be detected")
    elif oceans_ok:
        print("⚠️  PARTIAL SUCCESS")
        print("✅ Ocean locations are correctly detected")
        print("❌ Some cities are still incorrectly classified as ocean")
    else:
        print("❌ TESTS FAILED")
        print("🔧 Ocean bounds need further adjustment")
