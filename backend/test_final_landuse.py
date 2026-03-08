#!/usr/bin/env python3
# Test the actual landuse factor directly as it would be called in the system

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from suitability_factors.socio_economic.landuse_status import infer_landuse_score

# Test your specific location - replace with your actual coordinates
# You mentioned getting 45 for a really good place, let's test a few good areas
test_locations = [
    # Try some known excellent locations
    (40.7589, -73.9851, "Manhattan Downtown - Should be 90+"),
    (51.5074, -0.1278, "Central London - Should be 90+"), 
    (35.6586, 139.7011, "Tokyo Shibuya - Should be 90+"),
    # Try a suburban area that should still be good
    (37.8716, -122.2727, "Berkeley, CA - Should be 75+"),
    # Try a mixed urban area
    (42.3601, -71.0589, "Boston, MA - Should be 80+"),
]

print("LANDUSE FACTOR TESTING - POST FIX")
print("=" * 70)
print("Testing if the landuse factor now returns appropriate scores")
print("for good locations (should be 70-100 for prime areas)")
print("=" * 70)

all_good = True

for lat, lng, name in test_locations:
    try:
        score, details = infer_landuse_score(lat, lng)
        classification = details.get('classification', 'Unknown')
        infra_score = details.get('infrastructure_score', 0)
        buildable_prob = details.get('buildable_probability', 0)
        
        print(f"\n{name}")
        print(f"  Coordinates: ({lat:.4f}, {lng:.4f})")
        print(f"  🎯 Landuse Score: {score:.1f}/100")
        print(f"  📋 Classification: {classification}")
        print(f"  🏗️  Infrastructure: {infra_score:.1f}/100")
        print(f"  🏠 Buildable Prob: {buildable_prob:.2f}")
        print(f"  📝 Reason: {details.get('reason', 'No reason')[:80]}...")
        
        # Check if score is appropriate
        if "Downtown" in name or "Central" in name or "Shibuya" in name:
            # Prime urban areas should score 85+
            if score >= 85:
                print("  ✅ EXCELLENT - Appropriate score for prime location")
            elif score >= 70:
                print("  ⚠️  GOOD - Could be higher for prime location")
                all_good = False
            else:
                print("  ❌ PROBLEM - Score too low for prime location!")
                all_good = False
        else:
            # Good suburban areas should score 70+
            if score >= 70:
                print("  ✅ GOOD - Appropriate score for good location")
            elif score >= 50:
                print("  ⚠️  MODERATE - Could be better")
                all_good = False
            else:
                print("  ❌ PROBLEM - Score too low!")
                all_good = False
                
    except Exception as e:
        print(f"\n{name}: ❌ ERROR - {e}")
        all_good = False

print("\n" + "=" * 70)
if all_good:
    print("🎉 SUCCESS: All locations are getting appropriate landuse scores!")
    print("The landuse factor should now work correctly in the full system.")
else:
    print("⚠️  Some locations still need attention - check the details above.")

print("\nNext steps:")
print("1. Test your specific location that was getting 45")
print("2. If it's still low, the coordinates might be near water/protected areas")
print("3. The overall system should now give much higher scores for good locations")
