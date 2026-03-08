#!/usr/bin/env python3
"""
Test the improved habitability scoring
"""

from suitability_factors.risk_resilience.habitability_capacity import get_habitability_capacity

def test_habitability_scoring():
    """Test the improved habitability scoring with various locations"""
    
    print("=" * 80)
    print("HABITABILITY SCORING IMPROVEMENT TEST")
    print("=" * 80)
    
    test_locations = [
        (17.538071, 78.394569, "Hyderabad, India - Good Weather"),
        (28.6139, 77.2090, "New Delhi, India - Urban"),
        (19.0760, 72.8777, "Mumbai, India - Coastal Urban"),
        (12.9716, 77.5946, "Bangalore, India - Pleasant Climate"),
        (40.7128, -74.0060, "New York, USA - Major Urban"),
        (51.5074, -0.1278, "London, UK - Moderate Climate"),
        (30.2672, 97.7431, "Austin, USA - Good Climate"),
        (37.7749, -122.4194, "San Francisco, USA - Mild Climate"),
        (35.6762, 139.6503, "Tokyo, Japan - Urban"),
        (-33.8688, 151.2093, "Sydney, Australia - Good Climate"),
    ]
    
    for lat, lng, description in test_locations:
        try:
            result = get_habitability_capacity(lat, lng)
            
            score = result.get("value", 0)
            habitability_index = result.get("habitability_index", 0)
            label = result.get("label", "Unknown")
            confidence = result.get("confidence", 0)
            source = result.get("source", "Unknown")
            reason = result.get("reasoning", "No reasoning")
            
            # Extract detailed component scores
            climate_comfort = result.get("climate_comfort", 0)
            healthcare_access = result.get("healthcare_access", 0)
            education_access = result.get("education_access", 0)
            economic_opportunity = result.get("economic_opportunity", 0)
            environmental_quality = result.get("environmental_quality", 0)
            social_infrastructure = result.get("social_infrastructure", 0)
            time_estimate = result.get("habitability_time_estimate", "Unknown")
            
            print(f"\n📍 {description}")
            print(f"   Coordinates: ({lat:.4f}, {lng:.4f})")
            print(f"   🎯 Habitability Score: {score:.1f}/100")
            print(f"   📊 Habitability Index: {habitability_index:.1f}/100")
            print(f"   🏷️  Classification: {label}")
            print(f"   📈 Confidence: {confidence:.0f}%")
            print(f"   📡 Data Source: {source}")
            print(f"   ⏱️  Time to Comfort: {time_estimate}")
            
            print(f"\n   📋 Component Scores:")
            print(f"      🌍 Climate Comfort: {climate_comfort:.0f}/100")
            print(f"      🏥 Healthcare Access: {healthcare_access:.0f}/100")
            print(f"      🎓 Education Access: {education_access:.0f}/100")
            print(f"      💰 Economic Opportunity: {economic_opportunity:.0f}/100")
            print(f"      🌳 Environmental Quality: {environmental_quality:.0f}/100")
            print(f"      🏘️ Social Infrastructure: {social_infrastructure:.0f}/100")
            
            print(f"   💭 Reasoning: {reason}")
            
            # Assessment
            if score >= 85:
                assessment = "🏆 EXCELLENT - Outstanding habitability, easy to live"
            elif score >= 70:
                assessment = "✅ VERY GOOD - Great habitability, comfortable living"
            elif score >= 55:
                assessment = "⚠️  GOOD - Good habitability, generally livable"
            elif score >= 40:
                assessment = "📍 MODERATE - Acceptable habitability with challenges"
            elif score >= 25:
                assessment = "❌ POOR - Difficult habitability"
            else:
                assessment = "❌ VERY POOR - Challenging habitability"
                
            print(f"   📋 Assessment: {assessment}")
            
        except Exception as e:
            print(f"\n❌ Error for {description}: {str(e)}")
    
    print("\n" + "=" * 80)
    print("HABITABILITY SCORING IMPROVEMENTS MADE:")
    print("=" * 80)
    print("✓ Focus on human comfort and livability (not strict rules)")
    print("✓ Climate comfort analysis: 18-26°C = 95 points (perfect temperature)")
    print("✓ Real healthcare data: Hospitals, clinics, pharmacies, doctors")
    print("✓ Real education data: Schools, universities, kindergartens")
    print("✓ Economic opportunity: Jobs, businesses, commercial facilities")
    print("✓ Environmental quality: Parks, green spaces, air quality")
    print("✓ Social infrastructure: Community centers, safety, amenities")
    print("✓ Better weights: Climate 30%, Health 20%, Education 15%, Economic 15%, Env 10%, Social 10%")
    print("✓ Only hard overrides for truly uninhabitable (water, extreme desert)")
    print("✓ Enhanced fallback: Dynamic scoring based on urban density and region")
    print("✓ Maximum 100 score for excellent habitability conditions")
    print("✓ Detailed reasoning with specific numerical evidence")
    print("✓ Focus on 'easy to live and survive' as requested")
    print("=" * 80)

if __name__ == "__main__":
    test_habitability_scoring()
