#!/usr/bin/env python3
# Debug the landuse factor to see why it's returning 50

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from suitability_factors.socio_economic.landuse_status import infer_landuse_score

# Test with your coordinates - replace these with your actual location
# Let's test a few scenarios to see what's causing 50 scores

print("DEBUGGING LANDUSE FACTOR - Why 50?")
print("=" * 60)

# Test cases that should give high scores
test_cases = [
    (40.7589, -73.9851, "Manhattan - Should be 90+"),
    (51.5074, -0.1278, "London - Should be 90+"),
    (35.6586, 139.7011, "Tokyo - Should be 90+"),
    # Test some edge cases
    (0.0, 0.0, "Middle of Ocean - Should be 0"),
    (89.0, 0.0, "North Pole area - Should be low"),
]

for lat, lng, name in test_cases:
    try:
        print(f"\n{name} ({lat:.4f}, {lng:.4f})")
        print("-" * 40)
        
        score, details = infer_landuse_score(lat, lng)
        
        print(f"Final Score: {score:.1f}/100")
        print(f"Classification: {details.get('classification', 'Unknown')}")
        print(f"Infrastructure Score: {details.get('infrastructure_score', 0):.1f}/100")
        print(f"Buildable Probability: {details.get('buildable_probability', 0):.2f}")
        print(f"NDVI Index: {details.get('ndvi_index', 'N/A')}")
        print(f"Reason: {details.get('reason', 'No reason')}")
        
        # Check if it's exactly 50.0 (indicates fallback)
        if abs(score - 50.0) < 0.1:
            print("⚠️  EXACTLY 50 - This indicates a fallback/default score!")
            
            # Let's check what might be causing this
            infra_score = details.get('infrastructure_score', 0)
            print(f"   Infrastructure score was: {infra_score}")
            
            if infra_score <= 40:
                print("   → Low infrastructure is limiting the score")
            else:
                print("   → Something else is causing the 50 score")
        
        elif score < 20:
            print("❌ VERY LOW - Likely water body or protected area")
        elif score >= 85:
            print("✅ EXCELLENT - Working as expected")
        else:
            print(f"🤔 MID-RANGE - Score: {score:.1f}")
            
    except Exception as e:
        print(f"❌ ERROR: {e}")

print("\n" + "=" * 60)
print("If you're seeing exactly 50.0, it means:")
print("1. The landuse API failed AND")
print("2. Infrastructure score is <= 40")
print("3. The fallback logic is giving a conservative default")

print("\nTo fix this, we need to:")
print("1. Check why infrastructure is low for your location")
print("2. Or improve the fallback scoring logic")
