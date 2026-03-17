#!/usr/bin/env python3
"""
Comprehensive test for all Indian locations accuracy
"""

from suitability_factors.hydrology.water_utility import get_water_utility

def test_india_comprehensive_accuracy():
    """Test accuracy across all Indian cities and water bodies"""
    
    print("=" * 80)
    print("INDIA COMPREHENSIVE ACCURACY TEST")
    print("=" * 80)
    
    # Test all major Indian cities
    indian_cities = [
        # North India
        (28.6139, 77.2090, "New Delhi"),
        (28.6353, 77.2250, "Gurgaon"),
        (26.9124, 75.7873, "Jaipur"),
        (31.6340, 74.8723, "Amritsar"),
        
        # South India
        (17.5380, 78.3945, "Hyderabad"),
        (12.9716, 77.5946, "Bangalore"),
        (13.0674, 80.2377, "Chennai"),
        (9.9312, 76.2673, "Kochi"),
        
        # East India
        (22.5726, 88.3639, "Kolkata"),
        (26.1445, 91.7362, "Guwahati"),
        (23.3441, 85.3096, "Ranchi"),
        
        # West India
        (19.0760, 72.8777, "Mumbai"),
        (18.5204, 73.8567, "Pune"),
        (23.2156, 72.6369, "Ahmedabad"),
        
        # Central India
        (23.2599, 77.4126, "Bhopal"),
        (21.1463, 79.0849, "Nagpur"),
    ]
    
    # Test Indian water bodies
    indian_water_bodies = [
        (0, 80, "Indian Ocean"),
        (20, 70, "Arabian Sea"),
        (18, 88, "Bay of Bengal"),
        (15, 85, "Bay of Bengal Central"),
        (10, 75, "Arabian Sea Central"),
    ]
    
    cities_correct = 0
    cities_total = len(indian_cities)
    water_correct = 0
    water_total = len(indian_water_bodies)
    
    print("\nINDIAN CITIES TEST:")
    print("-" * 50)
    
    for lat, lng, city in indian_cities:
        result = get_water_utility(lat, lng)
        water_type = result.get('water_type', '')
        value = result.get('value', 0)
        
        # Check if correctly classified as land (score > 0 and not water body)
        if water_type not in ['ocean', 'major_water', 'local_water'] and value > 0:
            cities_correct += 1
            status = "✅"
        else:
            status = "❌"
        
        # Score quality
        if value >= 80:
            quality = "Excellent"
        elif value >= 70:
            quality = "Good"
        elif value >= 60:
            quality = "Acceptable"
        else:
            quality = "Low"
        
        print(f"{status} {city}: Score {value} ({quality})")
    
    print(f"\nCities: {cities_correct}/{cities_total} correctly classified as land")
    print(f"City Accuracy: {cities_correct/cities_total*100:.1f}%")
    
    print("\nINDIAN WATER BODIES TEST:")
    print("-" * 50)
    
    for lat, lng, water_body in indian_water_bodies:
        result = get_water_utility(lat, lng)
        water_type = result.get('water_type', '')
        value = result.get('value', 0)
        
        # Check if correctly classified as water (score = 0 and water type)
        if water_type in ['ocean', 'major_water', 'local_water'] and value == 0:
            water_correct += 1
            status = "✅"
        else:
            status = "❌"
        
        print(f"{status} {water_body}: {water_type} (Score {value})")
    
    print(f"\nWater Bodies: {water_correct}/{water_total} correctly detected as water")
    print(f"Water Accuracy: {water_correct/water_total*100:.1f}%")
    
    # Overall accuracy
    total_correct = cities_correct + water_correct
    total_tests = cities_total + water_total
    
    print("\n" + "=" * 80)
    print("OVERALL INDIA ACCURACY RESULTS")
    print("=" * 80)
    print(f"Total Tests: {total_tests}")
    print(f"Correct Results: {total_correct}")
    print(f"Overall Accuracy: {total_correct/total_tests*100:.1f}%")
    
    # Score distribution analysis
    print(f"\nScore Distribution for Cities:")
    scores = []
    for lat, lng, city in indian_cities:
        result = get_water_utility(lat, lng)
        scores.append(result.get('value', 0))
    
    excellent = sum(1 for s in scores if s >= 80)
    good = sum(1 for s in scores if 70 <= s < 80)
    acceptable = sum(1 for s in scores if 60 <= s < 70)
    low = sum(1 for s in scores if s < 60)
    
    print(f"  Excellent (80+): {excellent}/{cities_total} ({excellent/cities_total*100:.1f}%)")
    print(f"  Good (70-79): {good}/{cities_total} ({good/cities_total*100:.1f}%)")
    print(f"  Acceptable (60-69): {acceptable}/{cities_total} ({acceptable/cities_total*100:.1f}%)")
    print(f"  Low (<60): {low}/{cities_total} ({low/cities_total*100:.1f}%)")
    
    return total_correct / total_tests >= 0.95

if __name__ == "__main__":
    test_india_comprehensive_accuracy()
