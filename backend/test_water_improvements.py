#!/usr/bin/env python3
"""
Test the improved water utility scoring
"""

from suitability_factors.hydrology.water_utility import get_water_utility

def test_water_scoring():
    """Test the improved water scoring with various locations"""
    
    print("=" * 80)
    print("WATER UTILITY SCORING IMPROVEMENT TEST")
    print("=" * 80)
    
    test_locations = [
        (40.7128, -74.0060, "New York, USA - Coastal City"),
        (28.6139, 77.2090, "New Delhi, India - Near Yamuna River"),
        (19.0760, 72.8777, "Mumbai, India - Coastal City"),
        (51.5074, -0.1278, "London, UK - Near Thames River"),
        (12.9716, 77.5946, "Bangalore, India - Inland City"),
        (30.2672, 97.7431, "Austin, USA - Inland City"),
        (37.7749, -122.4194, "San Francisco, USA - Coastal City"),
    ]
    
    for lat, lng, description in test_locations:
        try:
            result = get_water_utility(lat, lng)
            score = result.get("value", 0)
            distance = result.get("distance_km")
            water_type = result.get("water_type", "Unknown")
            source = result.get("details", {}).get("source", "Unknown")
            detail = result.get("details", {}).get("detail", "No details")
            
            print(f"\n📍 {description}")
            print(f"   Coordinates: ({lat:.4f}, {lng:.4f})")
            print(f"   🎯 Water Score: {score:.1f}/100")
            print(f"   🏷️  Water Type: {water_type}")
            if distance is not None:
                print(f"   📏 Distance: {distance:.3f} km")
            print(f"   📡 Data Source: {source}")
            print(f"   💭 Details: {detail[:100]}...")
            
            # Assessment
            if score >= 90:
                assessment = "🏆 EXCELLENT - Outstanding water access"
            elif score >= 80:
                assessment = "✅ VERY GOOD - Great water access"
            elif score >= 70:
                assessment = "⚠️  GOOD - Good water access"
            elif score >= 55:
                assessment = "📍 MODERATE - Acceptable water access"
            elif score >= 40:
                assessment = "❌ FAIR - Limited water access"
            else:
                assessment = "❌ POOR - Minimal water access"
                
            print(f"   📋 Assessment: {assessment}")
            
        except Exception as e:
            print(f"\n❌ Error for {description}: {str(e)}")
    
    print("\n" + "=" * 80)
    print("WATER SCORING IMPROVEMENTS MADE:")
    print("=" * 80)
    print("✓ Enhanced proximity scoring with 90-100 scores for excellent water access")
    print("✓ Ocean proximity: 0.5km = 100, 1km = 95, 2km = 90, 5km = 85")
    print("✓ Major water: 0.2km = 100, 0.5km = 95, 1km = 90, 2km = 85")
    print("✓ Local water: 0.1km = 95, 0.3km = 90, 0.7km = 85, 1.5km = 75")
    print("✓ NEW: Groundwater and water facilities detection")
    print("✓ NEW: Water towers, reservoirs, springs, drinking water points")
    print("✓ NEW: Regional groundwater potential estimation")
    print("✓ Enhanced fallback: 50 baseline (was 25)")
    print("✓ Better scoring for areas with good water infrastructure")
    print("✓ Separate from flood risk - focuses on water availability")
    print("=" * 80)

if __name__ == "__main__":
    test_water_scoring()
