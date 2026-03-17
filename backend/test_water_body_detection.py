#!/usr/bin/env python3
"""
Test water detection for actual water bodies
"""

from suitability_factors.hydrology.water_utility import get_water_utility

def test_water_body_detection():
    """Test that actual water bodies are correctly detected"""
    
    print("=" * 80)
    print("WATER BODY DETECTION TEST")
    print("=" * 80)
    
    water_bodies = [
        # Oceans
        (0, 0, "Central Pacific Ocean"),
        (0, -30, "Atlantic Ocean"),
        (0, 80, "Indian Ocean"),
        (70, 0, "Arctic Ocean"),
        (-70, 0, "Southern Ocean"),
        
        # Seas
        (35, 18, "Mediterranean Sea"),
        (20, 40, "Red Sea"),
        (27, 50, "Persian Gulf"),
        (15, -80, "Caribbean Sea"),
        (25, -90, "Gulf of Mexico"),
        
        # Lakes
        (45, -85, "Great Lakes"),
        (-1, 33, "Lake Victoria"),
        (43, 50, "Caspian Sea"),
        
        # Rivers (approximate)
        (-3, -60, "Amazon River"),
        (25, 32, "Nile River"),
        (35, -90, "Mississippi River"),
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
    
    print(f"\nResults: {correct}/{total} water bodies correctly detected")
    print(f"Accuracy: {correct/total*100:.1f}%")
    
    return correct / total

if __name__ == "__main__":
    test_water_body_detection()
