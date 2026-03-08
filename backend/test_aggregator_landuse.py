#!/usr/bin/env python3
# Test the complete aggregator to see if landuse improvements translate to better overall scores

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from suitability_factors.aggregator import Aggregator

# Test with some coordinates that should get good landuse scores
test_coords = [
    (40.7589, -73.9851, "Manhattan"),
    (51.5074, -0.1278, "London"),
    (35.6586, 139.7011, "Tokyo"),
]

print("TESTING COMPLETE AGGREGATOR WITH IMPROVED LANDUSE")
print("=" * 60)

for lat, lng, name in test_coords:
    try:
        result = Aggregator.compute_suitability_score({'lat': lat, 'lng': lng})
        
        print(f"\n{name} ({lat:.4f}, {lng:.4f})")
        print(f"Overall Score: {result.get('overall_score', 0):.1f}/100")
        print(f"Suitability: {result.get('suitability_label', 'Unknown')}")
        
        # Check individual factors
        factors = result.get('factors', {})
        socio_econ = factors.get('socio_econ', {})
        
        print(f"Landuse Score: {socio_econ.get('landuse', 0):.1f}/100")
        print(f"Infrastructure Score: {socio_econ.get('infrastructure', 0):.1f}/100")
        print(f"Population Score: {socio_econ.get('population', 0):.1f}/100")
        
        # Show detailed landuse info if available
        detailed = result.get('detailed_analysis', {})
        if 'landuse' in detailed:
            landuse_details = detailed['landuse']
            print(f"Landuse Classification: {landuse_details.get('classification', 'Unknown')}")
            print(f"Buildable Probability: {landuse_details.get('buildable_probability', 0):.2f}")
            print(f"Infrastructure Proximity: {landuse_details.get('infrastructure_score', 0):.1f}/100")
        
        if result.get('overall_score', 0) >= 80:
            print("✅ EXCELLENT - High suitability")
        elif result.get('overall_score', 0) >= 60:
            print("✅ GOOD - Suitable")
        else:
            print("⚠️  NEEDS IMPROVEMENT")
            
    except Exception as e:
        print(f"\n{name}: ERROR - {e}")

print("\n" + "=" * 60)
