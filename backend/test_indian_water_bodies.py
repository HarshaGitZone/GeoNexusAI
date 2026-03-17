#!/usr/bin/env python3
"""
Test major Indian water bodies detection
"""

from suitability_factors.hydrology.water_utility import get_water_utility

def test_indian_water_bodies():
    """Test major Indian water bodies are correctly detected"""
    
    print("=" * 80)
    print("INDIAN WATER BODIES DETECTION TEST")
    print("=" * 80)
    
    water_bodies = [
        # Major Rivers
        (25.4479, 81.8337, "Ganges River - Varanasi"),
        (22.5726, 88.3639, "Hooghly River - Kolkata"),
        (17.3850, 78.4867, "Musi River - Hyderabad"),
        (12.9716, 77.5946, "Vrishabhavathi River - Bangalore"),
        (19.0760, 72.8777, "Mithi River - Mumbai"),
        (28.6139, 77.2090, "Yamuna River - Delhi"),
        (26.1445, 91.7362, "Brahmaputra River - Guwahati"),
        (23.2599, 77.4126, "Betwa River - Bhopal"),
        
        # Major Lakes
        (28.6139, 77.2090, "Ganga Talao - Delhi"),
        (12.9716, 77.5946, "Ulsoor Lake - Bangalore"),
        (17.5380, 78.3945, "Hussain Sagar - Hyderabad"),
        (19.0760, 72.8777, "Powai Lake - Mumbai"),
        (22.5726, 88.3639, "Salt Lake - Kolkata"),
        (26.1445, 91.7362, "Deepor Beel - Guwahati"),
        
        # Coastal Areas (should be near ocean)
        (13.0674, 80.2377, "Chennai Coast - Bay of Bengal"),
        (8.5241, 76.9366, "Thiruvananthapuram Coast - Arabian Sea"),
        (19.8762, 75.3431, "Aurangabad - Near Godavari"),
        (21.1702, 72.8311, "Surat - Arabian Sea Coast"),
        
        # Reservoirs
        (17.2403, 78.4254, "Osman Sagar - Hyderabad"),
        (28.4595, 77.0266, "Okhla Bird Sanctuary - Noida"),
        (12.8399, 77.6800, "Harohalli Lake - Bangalore"),
    ]
    
    correct = 0
    total = len(water_bodies)
    
    for lat, lng, water_body in water_bodies:
        result = get_water_utility(lat, lng)
        water_type = result.get('water_type', '')
        value = result.get('value', 0)
        
        # Check if correctly classified as water or near water
        if water_type in ['ocean', 'major_water', 'local_water', 'ocean_nearby', 'major_water_nearby', 'local_water_nearby']:
            correct += 1
            print(f"✅ {water_body} -> {water_type} (Score: {value})")
        else:
            print(f"❌ {water_body} -> {water_type} (Score: {value})")
    
    print(f"\nResults: {correct}/{total} Indian water bodies correctly detected")
    print(f"Accuracy: {correct/total*100:.1f}%")
    
    return correct / total

if __name__ == "__main__":
    test_indian_water_bodies()
