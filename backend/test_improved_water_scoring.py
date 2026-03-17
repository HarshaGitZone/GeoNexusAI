#!/usr/bin/env python3
"""
Test the improved water scoring system
"""

from suitability_factors.hydrology.water_utility import get_water_utility

def test_improved_water_scoring():
    """Test improved water scoring with various locations"""
    
    print("=" * 80)
    print("IMPROVED WATER SCORING TEST")
    print("=" * 80)
    
    test_locations = [
        # Your Hyderabad location
        (17.5380, 78.3945, "Hyderabad (your location)"),
        
        # Cities with good water access
        (19.0760, 72.8777, "Mumbai - Coastal City"),
        (13.0674, 80.2377, "Chennai - Coastal City"),
        (22.5726, 88.3639, "Kolkata - Coastal City"),
        
        # Cities with river access
        (28.6139, 77.2090, "Delhi - Yamuna River"),
        (25.4479, 81.8337, "Varanasi - Ganges River"),
        (26.1445, 91.7362, "Guwahati - Brahmaputra River"),
        
        # Cities with lakes
        (12.9716, 77.5946, "Bangalore - Multiple Lakes"),
        (17.5380, 78.3945, "Hyderabad - Hussain Sagar"),
        
        # Inland cities
        (26.9124, 75.7873, "Jaipur - Inland City"),
        (21.1463, 79.0849, "Nagpur - Inland City"),
        
        # Test water bodies directly
        (0, 80, "Indian Ocean"),
        (20, 70, "Arabian Sea"),
        (18, 88, "Bay of Bengal"),
    ]
    
    for lat, lng, location in test_locations:
        result = get_water_utility(lat, lng)
        water_type = result.get('water_type', '')
        value = result.get('value', 0)
        distance = result.get('distance_km')
        details = result.get('details', {})
        
        print(f"\n{location}:")
        print(f"  Score: {value}")
        print(f"  Type: {water_type}")
        print(f"  Distance: {distance} km" if distance else "  Distance: On water")
        if details.get('name'):
            print(f"  Water Body: {details.get('name')}")
        
        # Assess if score is reasonable
        if water_type in ['ocean', 'major_water', 'local_water'] and value == 0:
            assessment = "✅ Correctly identified as water body"
        elif water_type in ['ocean_nearby', 'major_water_nearby', 'local_water_nearby']:
            if value >= 75:
                assessment = "✅ Good water access score"
            elif value >= 65:
                assessment = "⚠️  Moderate water access score"
            else:
                assessment = "❌ Low water access score"
        elif water_type in ['groundwater_facilities']:
            if value >= 70:
                assessment = "✅ Good groundwater access"
            else:
                assessment = "⚠️  Limited groundwater access"
        else:
            assessment = "ℹ️  Land location"
        
        print(f"  Assessment: {assessment}")

if __name__ == "__main__":
    test_improved_water_scoring()
