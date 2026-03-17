#!/usr/bin/env python3
"""
Test Indian Ocean and surrounding seas
"""

from suitability_factors.hydrology.water_utility import get_water_utility

def test_indian_ocean_region():
    """Test Indian Ocean, Bay of Bengal, Arabian Sea detection"""
    
    print("=" * 80)
    print("INDIAN OCEAN REGION WATER DETECTION TEST")
    print("=" * 80)
    
    water_bodies = [
        # Indian Ocean
        (0, 80, "Central Indian Ocean"),
        (-10, 80, "South Indian Ocean"),
        (10, 80, "North Indian Ocean"),
        (0, 60, "West Indian Ocean"),
        (0, 100, "East Indian Ocean"),
        
        # Bay of Bengal
        (20, 90, "North Bay of Bengal"),
        (15, 85, "Central Bay of Bengal"),
        (10, 85, "South Bay of Bengal"),
        (18, 88, "Kolkata Coast - Bay of Bengal"),
        
        # Arabian Sea
        (20, 70, "North Arabian Sea"),
        (15, 70, "Central Arabian Sea"),
        (10, 70, "South Arabian Sea"),
        (18, 72, "Mumbai Coast - Arabian Sea"),
        (8, 75, "Kochi Coast - Arabian Sea"),
        
        # Major Ocean Crossings
        (5, 80, "Indian Ocean - Equator"),
        (-20, 80, "Indian Ocean - Southern"),
        (30, 75, "Indian Ocean - Northern"),
    ]
    
    correct = 0
    total = len(water_bodies)
    
    for lat, lng, water_body in water_bodies:
        result = get_water_utility(lat, lng)
        water_type = result.get('water_type', '')
        value = result.get('value', 0)
        
        # Check if correctly classified as water
        if water_type in ['ocean', 'major_water', 'local_water'] and value == 0:
            correct += 1
            print(f"✅ {water_body} -> {water_type} (Score: {value})")
        else:
            print(f"❌ {water_body} -> {water_type} (Score: {value})")
    
    print(f"\nResults: {correct}/{total} Indian Ocean region water bodies correctly detected")
    print(f"Accuracy: {correct/total*100:.1f}%")
    
    return correct / total

if __name__ == "__main__":
    test_indian_ocean_region()
