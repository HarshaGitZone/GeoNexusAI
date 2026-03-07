#!/usr/bin/env python3
"""
Test script to verify the improved landuse scoring
"""

from suitability_factors.socio_economic.landuse_status import infer_landuse_score
import json

def test_landuse_scoring():
    """Test the improved landuse scoring with various locations"""
    
    test_locations = [
        (28.6139, 77.2090, "New Delhi, India - Urban"),
        (40.7128, -74.0060, "New York, USA - Urban"), 
        (51.5074, -0.1278, "London, UK - Urban"),
        (37.7749, -122.4194, "San Francisco, USA - Mixed Urban"),
        (19.0760, 72.8777, "Mumbai, India - Dense Urban"),
    ]
    
    print("=" * 80)
    print("LANDUSE SCORING IMPROVEMENT TEST")
    print("=" * 80)
    
    for lat, lng, description in test_locations:
        try:
            score, details = infer_landuse_score(lat, lng)
            
            print(f"\n📍 {description}")
            print(f"   Coordinates: ({lat:.4f}, {lng:.4f})")
            print(f"   🎯 Landuse Score: {score:.1f}/100")
            print(f"   🏷️  Classification: {details.get('classification', 'Unknown')}")
            print(f"   📊 Buildable Probability: {details.get('buildable_probability', 0):.0%}")
            print(f"   🏗️  Infrastructure Score: {details.get('infrastructure_score', 0):.1f}/100")
            print(f"   💭 Reason: {details.get('reason', 'No reason provided')}")
            
            # Determine if score is reasonable
            if score >= 70:
                assessment = "✅ GOOD - Suitable for development"
            elif score >= 50:
                assessment = "⚠️  MODERATE - May need considerations"
            else:
                assessment = "❌ LOW - Significant constraints"
                
            print(f"   📋 Assessment: {assessment}")
            
        except Exception as e:
            print(f"\n❌ Error for {description}: {str(e)}")
    
    print("\n" + "=" * 80)
    print("SUMMARY OF IMPROVEMENTS MADE:")
    print("=" * 80)
    print("✓ Increased forest score from 10.0 to 25.0")
    print("✓ Increased wetland/conservation score from 15.0 to 30.0") 
    print("✓ Increased urban base score from 85.0 to 88.0")
    print("✓ Added suburban/mixed-use classification (80.0 base score)")
    print("✓ Increased agricultural base score from 75.0 to 78.0")
    print("✓ Increased meadow base score from 65.0 to 70.0")
    print("✓ Increased generic fallback base from 45.0 to 55.0")
    print("✓ Increased API error fallback from 35.0 to 50.0")
    print("✓ Improved infrastructure boost calculations")
    print("✓ Enhanced buildable probability mappings")
    print("=" * 80)

if __name__ == "__main__":
    test_landuse_scoring()
