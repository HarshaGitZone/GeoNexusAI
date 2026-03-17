#!/usr/bin/env python3
"""
Test dynamic water scoring at different distances
"""

from suitability_factors.hydrology.water_utility import get_water_utility

def test_dynamic_scoring():
    """Test how scoring changes with distance from water"""
    
    print("=" * 80)
    print("DYNAMIC WATER SCORING BY DISTANCE")
    print("=" * 80)
    
    # Test locations at different distances from Hyderabad lakes
    test_points = [
        # Very close to Hussain Sagar Lake
        (17.4256, 78.4735, "Very close to Hussain Sagar"),
        # Close to Hussain Sagar
        (17.4356, 78.4635, "Close to Hussain Sagar"),
        # Moderate distance
        (17.4556, 78.4435, "Moderate from Hussain Sagar"),
        # Further away
        (17.4756, 78.4235, "Further from Hussain Sagar"),
        # Your Hyderabad location
        (17.5380, 78.3945, "Your Hyderabad location"),
        # Even further
        (17.5780, 78.3645, "Further from Hyderabad lakes"),
    ]
    
    for lat, lng, description in test_points:
        result = get_water_utility(lat, lng)
        water_type = result.get('water_type', '')
        value = result.get('value', 0)
        distance = result.get('distance_km')
        details = result.get('details', {})
        
        print(f"\n{description}:")
        print(f"  Score: {value}")
        print(f"  Type: {water_type}")
        print(f"  Distance: {distance} km" if distance else "  Distance: On water")
        if details.get('name'):
            print(f"  Water Body: {details.get('name')}")
        
        # Score quality assessment
        if value >= 90:
            quality = "Excellent"
        elif value >= 80:
            quality = "Very Good"
        elif value >= 70:
            quality = "Good"
        elif value >= 60:
            quality = "Acceptable"
        else:
            quality = "Needs Improvement"
        
        print(f"  Quality: {quality}")

if __name__ == "__main__":
    test_dynamic_scoring()
