#!/usr/bin/env python3
"""
Test the improved recovery capacity scoring
"""

from suitability_factors.risk_resilience.recovery_capacity import get_recovery_capacity

def test_recovery_scoring():
    """Test the improved recovery scoring with various locations"""
    
    print("=" * 80)
    print("RECOVERY CAPACITY SCORING IMPROVEMENT TEST")
    print("=" * 80)
    
    test_locations = [
        (28.6139, 77.2090, "New Delhi, India - Major Urban"),
        (40.7128, -74.0060, "New York, USA - Dense Urban"), 
        (19.0760, 72.8777, "Mumbai, India - Ultra Dense Urban"),
        (51.5074, -0.1278, "London, UK - Well Developed Urban"),
        (12.9716, 77.5946, "Bangalore, India - Tech Hub"),
        (30.2672, 97.7431, "Austin, USA - Medium Urban"),
    ]
    
    for lat, lng, description in test_locations:
        try:
            result = get_recovery_capacity(lat, lng)
            score = result.get("value", 0)
            recovery_index = result.get("recovery_index", 0)
            infra_resilience = result.get("infrastructure_resilience", 0)
            emergency_services = result.get("emergency_services", 0)
            economic_capacity = result.get("economic_capacity", 0)
            label = result.get("label", "Unknown")
            source = result.get("source", "Unknown")
            reasoning = result.get("reasoning", "No reasoning")
            
            print(f"\n📍 {description}")
            print(f"   Coordinates: ({lat:.4f}, {lng:.4f})")
            print(f"   🎯 Recovery Score: {score:.1f}/100")
            print(f"   📊 Recovery Index: {recovery_index:.1f}/100")
            print(f"   🏗️  Infrastructure Resilience: {infra_resilience:.1f}/100")
            print(f"   🚑 Emergency Services: {emergency_services:.1f}/100")
            print(f"   💰 Economic Capacity: {economic_capacity:.1f}/100")
            print(f"   🏷️  Classification: {label}")
            print(f"   📡 Data Source: {source}")
            print(f"   💭 Reasoning: {reasoning[:100]}...")
            
            # Assessment
            if score >= 85:
                assessment = "🏆 EXCELLENT - Outstanding recovery capacity"
            elif score >= 70:
                assessment = "✅ VERY GOOD - Strong recovery capacity"
            elif score >= 55:
                assessment = "⚠️  GOOD - Moderate recovery capacity"
            elif score >= 40:
                assessment = "📍 FAIR - Limited recovery capacity"
            else:
                assessment = "❌ POOR - Minimal recovery capacity"
                
            print(f"   📋 Assessment: {assessment}")
            
        except Exception as e:
            print(f"\n❌ Error for {description}: {str(e)}")
    
    print("\n" + "=" * 80)
    print("RECOVERY SCORING IMPROVEMENTS MADE:")
    print("=" * 80)
    print("✓ Enhanced scaling: 85+ index = 90-100 score (was 80-100)")
    print("✓ Enhanced scaling: 70-85 index = 75-90 score (was 60-80)")
    print("✓ Enhanced scaling: 50-70 index = 55-75 score (was 40-60)")
    print("✓ Enhanced scaling: 30-50 index = 35-55 score (was 20-40)")
    print("✓ Enhanced scaling: 0-30 index = up to 35 score (was direct)")
    print("✓ Infrastructure resilience now uses existing infrastructure analysis")
    print("✓ Emergency services with comprehensive OSM data (hospitals, clinics, fire, police)")
    print("✓ Economic capacity using business/commercial activity data")
    print("✓ Social resilience using schools, universities, community facilities")
    print("✓ Resource availability using utilities, fuel, supermarkets data")
    print("✓ Enhanced fallback scoring: 65 baseline (was 50)")
    print("✓ Better regional adjustments and urban density bonuses")
    print("=" * 80)

if __name__ == "__main__":
    test_recovery_scoring()
