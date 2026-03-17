#!/usr/bin/env python3
"""
Comprehensive test of water body detection accuracy across various locations
"""

from suitability_factors.hydrology.water_utility import get_water_utility
from suitability_factors.socio_economic.landuse_status import infer_landuse_score

def test_water_detection_accuracy():
    """Test water detection across known water bodies and land locations"""
    
    print("=" * 80)
    print("COMPREHENSIVE WATER BODY DETECTION TEST")
    print("=" * 80)
    
    # Test cases: (lat, lng, expected_type, description)
    test_cases = [
        # Known water bodies
        (0, 0, "ocean", "Central Pacific Ocean"),
        (25, -80, "ocean", "Atlantic Ocean"),
        (27, 50, "ocean", "Indian Ocean"),
        (35, 18, "ocean", "Mediterranean Sea"),
        
        # Known land locations (should NOT be water)
        (27.5300, 78.0500, "land", "Uttar Pradesh, India (your original issue)"),
        (28.6139, 77.2090, "land", "New Delhi, India"),
        (19.0760, 72.8777, "land", "Mumbai, India"),
        (40.7128, -74.0060, "land", "New York, USA"),
        (51.5074, -0.1278, "land", "London, UK"),
        (-33.8688, 151.2093, "land", "Sydney, Australia"),
        
        # Near water but on land (coastal cities)
        (35.6762, 139.6503, "land", "Tokyo, Japan (near Pacific)"),
        (-23.5505, -46.6333, "land", "São Paulo, Brazil (near Atlantic)"),
        (34.0522, -118.2437, "land", "Los Angeles, USA (near Pacific)"),
        
        # Edge cases
        (30, 80, "land", "Himalayan region"),
        (15, 75, "land", "Central India"),
        (10, 78, "land", "South India"),
    ]
    
    water_correct = 0
    land_correct = 0
    total_water = 0
    total_land = 0
    
    for lat, lng, expected_type, description in test_cases:
        print(f"\nTesting: {description}")
        print(f"Coordinates: ({lat}, {lng})")
        
        # Test water utility
        water_result = get_water_utility(lat, lng)
        water_type = water_result.get('water_type', 'unknown')
        water_value = water_result.get('value', 0)
        distance = water_result.get('distance_km')
        
        # Test land use
        land_score, land_details = infer_landuse_score(lat, lng)
        land_classification = land_details.get('classification', 'unknown')
        
        print(f"Water detection: {water_type} (Score: {water_value}, Distance: {distance})")
        print(f"Land classification: {land_classification} (Score: {land_score})")
        
        # Evaluate accuracy
        is_water = water_value == 0.0 or water_type in ['ocean', 'major_water', 'local_water']
        is_land = not is_water
        
        if expected_type == "water" and is_water:
            water_correct += 1
            total_water += 1
            print("✅ CORRECT: Water body detected")
        elif expected_type == "water" and not is_water:
            total_water += 1
            print("❌ ERROR: Water body missed")
        elif expected_type == "land" and is_land:
            land_correct += 1
            total_land += 1
            print("✅ CORRECT: Land detected")
        elif expected_type == "land" and not is_land:
            total_land += 1
            print("❌ ERROR: Land incorrectly detected as water")
        
        # Check for consistency between water and land detection
        if is_water and land_classification != "Water Body":
            print("⚠️  INCONSISTENCY: Water detected but land classification says:", land_classification)
        elif is_land and land_classification == "Water Body":
            print("⚠️  INCONSISTENCY: Land detected but land classification says Water Body")
    
    # Summary
    print("\n" + "=" * 80)
    print("SUMMARY")
    print("=" * 80)
    
    water_accuracy = (water_correct / total_water * 100) if total_water > 0 else 0
    land_accuracy = (land_correct / total_land * 100) if total_land > 0 else 0
    overall_accuracy = ((water_correct + land_correct) / (total_water + total_land) * 100) if (total_water + total_land) > 0 else 0
    
    print(f"Water bodies: {water_correct}/{total_water} correct ({water_accuracy:.1f}%)")
    print(f"Land locations: {land_correct}/{total_land} correct ({land_accuracy:.1f}%)")
    print(f"Overall accuracy: {water_correct + land_correct}/{total_water + total_land} correct ({overall_accuracy:.1f}%)")
    
    return overall_accuracy

if __name__ == "__main__":
    test_water_detection_accuracy()
