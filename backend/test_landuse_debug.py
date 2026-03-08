#!/usr/bin/env python3
# Test landuse scoring to debug the issue

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from suitability_factors.socio_economic.landuse_status import infer_landuse_score

# Test coordinates for known good locations
test_locations = [
    # Downtown Manhattan (should be excellent)
    (40.7589, -73.9851, "Manhattan Downtown"),
    # Central London (should be excellent) 
    (51.5074, -0.1278, "Central London"),
    # Tokyo Shibuya (should be excellent)
    (35.6586, 139.7011, "Tokyo Shibuya"),
    # Commercial district in a major city
    (37.7749, -122.4194, "San Francisco Downtown"),
]

print("Testing landuse scoring for known good locations:")
print("=" * 60)

for lat, lng, name in test_locations:
    try:
        score, details = infer_landuse_score(lat, lng)
        print(f"\n{name} ({lat:.4f}, {lng:.4f})")
        print(f"Score: {score:.1f}/100")
        print(f"Classification: {details.get('classification', 'Unknown')}")
        print(f"Buildable Probability: {details.get('buildable_probability', 0):.2f}")
        print(f"Infrastructure Score: {details.get('infrastructure_score', 0):.1f}/100")
        print(f"Reason: {details.get('reason', 'No reason')[:100]}...")
        
        # Check if score is unreasonably low
        if score < 70:
            print("⚠️  WARNING: Score seems low for this prime location!")
        elif score >= 85:
            print("✅ GOOD: Appropriate high score for prime location")
            
    except Exception as e:
        print(f"\n{name}: ERROR - {e}")

print("\n" + "=" * 60)
