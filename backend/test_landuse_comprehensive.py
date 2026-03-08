#!/usr/bin/env python3
# Comprehensive test of landuse scoring improvements

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from suitability_factors.socio_economic.landuse_status import infer_landuse_score

# Test a wider range of locations
test_locations = [
    # Prime urban locations (should score 85-100)
    (40.7589, -73.9851, "Manhattan Downtown"),
    (51.5074, -0.1278, "Central London"), 
    (35.6586, 139.7011, "Tokyo Shibuya"),
    (48.8566, 2.3522, "Paris Central"),
    # Good urban locations (should score 75-90)
    (37.7749, -122.4194, "San Francisco Downtown"),
    (41.8781, -87.6298, "Chicago Downtown"),
    # Suburban locations (should score 70-85)
    (40.7128, -74.0060, "Newark, NJ"),
    (51.5074, -0.2127, "Hammersmith, London"),
    # Rural/Agricultural (should score 60-80)
    (38.9072, -77.0369, "Rural Virginia"),
    (52.5200, 13.4050, "Berlin outskirts"),
]

print("COMPREHENSIVE LANDUSE SCORING TEST")
print("=" * 70)

high_scores = []
medium_scores = []
low_scores = []

for lat, lng, name in test_locations:
    try:
        score, details = infer_landuse_score(lat, lng)
        classification = details.get('classification', 'Unknown')
        infra_score = details.get('infrastructure_score', 0)
        
        print(f"\n{name} ({lat:.4f}, {lng:.4f})")
        print(f"  Score: {score:.1f}/100")
        print(f"  Classification: {classification}")
        print(f"  Infrastructure: {infra_score:.1f}/100")
        
        # Categorize scores
        if score >= 85:
            high_scores.append((name, score, classification))
            print("  ✅ EXCELLENT - Prime location")
        elif score >= 70:
            medium_scores.append((name, score, classification))
            print("  ✅ GOOD - Suitable location")
        elif score >= 50:
            low_scores.append((name, score, classification))
            print("  ⚠️  MODERATE - May need improvements")
        else:
            low_scores.append((name, score, classification))
            print("  ❌ POOR - Not suitable")
            
    except Exception as e:
        print(f"\n{name}: ERROR - {e}")

print("\n" + "=" * 70)
print("SUMMARY:")
print(f"Excellent scores (85+): {len(high_scores)} locations")
print(f"Good scores (70-84): {len(medium_scores)} locations") 
print(f"Moderate/Poor scores (<70): {len(low_scores)} locations")

if high_scores:
    print("\n🎯 EXCELLENT LOCATIONS:")
    for name, score, classification in high_scores:
        print(f"  {name}: {score:.1f}/100 ({classification})")

if low_scores:
    print("\n⚠️  NEEDS ATTENTION:")
    for name, score, classification in low_scores:
        print(f"  {name}: {score:.1f}/100 ({classification})")

print("\n" + "=" * 70)
