#!/usr/bin/env python3
"""
Test the improved land use scoring
"""

from suitability_factors.socio_economic.landuse_status import infer_landuse_score

def test_landuse_scoring():
    """Test the improved land use scoring with various locations"""
    
    print("=" * 80)
    print("LAND USE SCORING IMPROVEMENT TEST")
    print("=" * 80)
    
    test_locations = [
        (17.538071, 78.394569, "Hyderabad, India - Urban Area"),
        (28.6139, 77.2090, "New Delhi, India - Dense Urban"),
        (19.0760, 72.8777, "Mumbai, India - Coastal Urban"),
        (12.9716, 77.5946, "Bangalore, India - Tech Hub"),
        (40.7128, -74.0060, "New York, USA - Major Urban"),
        (51.5074, -0.1278, "London, UK - Urban"),
        (30.2672, 97.7431, "Austin, USA - Suburban"),
        (37.7749, -122.4194, "San Francisco, USA - Urban"),
    ]
    
    for lat, lng, description in test_locations:
        try:
            score, details = infer_landuse_score(lat, lng)
            
            classification = details.get("classification", "Unknown")
            buildable_prob = details.get("buildable_probability", 0)
            confidence = details.get("confidence", 0)
            source = details.get("dataset_source", "Unknown")
            reason = details.get("reason", "No reasoning")
            infra_score = details.get("infrastructure_score", 0)
            nearby_infra = details.get("nearby_infrastructure", [])
            
            print(f"\n📍 {description}")
            print(f"   Coordinates: ({lat:.4f}, {lng:.4f})")
            print(f"   🎯 Land Use Score: {score:.1f}/100")
            print(f"   🏷️  Classification: {classification}")
            print(f"   📊 Buildable Probability: {buildable_prob:.0%}")
            print(f"   📈 Confidence: {confidence:.0f}%")
            print(f"   📡 Data Source: {source}")
            print(f"   🏗️  Infrastructure Score: {infra_score:.0f}/100")
            
            if nearby_infra:
                print(f"   🏢 Nearby Infrastructure: {len(nearby_infra)} facilities")
                for infra in nearby_infra[:3]:  # Show top 3
                    print(f"      • {infra}")
                if len(nearby_infra) > 3:
                    print(f"      ... and {len(nearby_infra) - 3} more")
            else:
                print(f"   🏢 Nearby Infrastructure: None detected")
            
            print(f"   💭 Reasoning: {reason}")
            
            # Assessment
            if score >= 90:
                assessment = "🏆 EXCELLENT - Outstanding development potential"
            elif score >= 80:
                assessment = "✅ VERY GOOD - Strong development potential"
            elif score >= 70:
                assessment = "⚠️  GOOD - Good development potential"
            elif score >= 60:
                assessment = "📍 MODERATE - Moderate development potential"
            elif score >= 50:
                assessment = "❌ FAIR - Limited development potential"
            else:
                assessment = "❌ POOR - Minimal development potential"
                
            print(f"   📋 Assessment: {assessment}")
            
        except Exception as e:
            print(f"\n❌ Error for {description}: {str(e)}")
    
    print("\n" + "=" * 80)
    print("LAND USE SCORING IMPROVEMENTS MADE:")
    print("=" * 80)
    print("✓ Enhanced maximum scores: 100 for urban, 95 for suburban/mixed")
    print("✓ Dynamic infrastructure-based scoring (no more static 50)")
    print("✓ Urban/Commercial: 85 base + up to 15 infra boost = 100 max")
    print("✓ Suburban/Mixed: 78 base + up to 17 infra boost = 95 max")
    print("✓ Agricultural: 75 base + up to 15 infra boost = 90 max")
    print("✓ Meadow/Grassland: 68 base + up to 17 infra boost = 85 max")
    print("✓ Generic Buildable: 55 base + up to 40 infra boost = 95 max")
    print("✓ API Error Fallback: Dynamic scoring based on infrastructure")
    print("✓ Better evidence: Detailed infrastructure counts and names")
    print("✓ Higher confidence scores when infrastructure is good")
    print("✓ Proper water/forest protection: 0.0 for water/forest")
    print("✓ Detailed reasoning with total scores and infrastructure")
    print("=" * 80)

if __name__ == "__main__":
    test_landuse_scoring()
