#!/usr/bin/env python3
"""
Test water detection for major cities and land areas
"""

from suitability_factors.hydrology.water_utility import get_water_utility

def test_city_water_detection():
    """Test that major cities are correctly classified as land"""
    
    print("=" * 80)
    print("CITY WATER DETECTION TEST")
    print("=" * 80)
    
    cities = [
        # North America
        (40.7128, -74.0060, "New York"),
        (32.7620, -96.7790, "Dallas"),
        (34.0522, -118.2437, "Los Angeles"),
        (41.8781, -87.6298, "Chicago"),
        
        # Europe
        (51.5074, -0.1278, "London"),
        (48.8566, 2.3522, "Paris"),
        (55.7558, 37.6173, "Moscow"),
        
        # Asia
        (35.6762, 139.6503, "Tokyo"),
        (31.2304, 121.4737, "Shanghai"),
        (28.6139, 77.2090, "New Delhi"),
        (17.5380, 78.3945, "Hyderabad"),
        (19.0760, 72.8777, "Mumbai"),
        (12.9716, 77.5946, "Bangalore"),
        (22.5726, 88.3639, "Kolkata"),
        
        # Africa
        (-33.9249, 18.4241, "Cape Town"),
        (30.0444, 31.2357, "Cairo"),
        
        # Oceania
        (-33.8688, 151.2093, "Sydney"),
        (-37.8136, 144.9631, "Melbourne"),
        
        # South America
        (-23.5505, -46.6333, "São Paulo"),
        (-34.6037, -58.3816, "Buenos Aires"),
    ]
    
    correct = 0
    total = len(cities)
    
    for lat, lng, city in cities:
        result = get_water_utility(lat, lng)
        water_type = result.get('water_type', '')
        value = result.get('value', 0)
        
        # Check if correctly classified as land (not water body)
        if water_type not in ['ocean', 'major_water', 'local_water'] and value > 0:
            correct += 1
            print(f"✅ {city} -> {water_type} (Score: {value})")
        else:
            print(f"❌ {city} -> {water_type} (Score: {value})")
    
    print(f"\nResults: {correct}/{total} cities correctly classified as land")
    print(f"Accuracy: {correct/total*100:.1f}%")
    
    return correct / total

if __name__ == "__main__":
    test_city_water_detection()
