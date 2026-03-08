#!/usr/bin/env python3
"""
Test the improved vegetation scoring
"""

from suitability_factors.environmental.vegetation_ndvi import get_ndvi_data

def test_vegetation_scoring():
    """Test the improved vegetation scoring with various locations"""
    
    print("=" * 80)
    print("VEGETATION SCORING IMPROVEMENT TEST")
    print("=" * 80)
    
    test_locations = [
        (17.538071, 78.394569, "Hyderabad, India - Urban Area"),
        (28.6139, 77.2090, "New Delhi, India - Dense Urban"),
        (19.0760, 72.8777, "Mumbai, India - Coastal Urban"),
        (12.9716, 77.5946, "Bangalore, India - Garden City"),
        (40.7128, -74.0060, "New York, USA - Urban Parks"),
        (51.5074, -0.1278, "London, UK - Green City"),
        (30.2672, 97.7431, "Austin, USA - Green Spaces"),
        (37.7749, -122.4194, "San Francisco, USA - Parks"),
        (48.8566, 2.3522, "Paris, France - Urban Greenery"),
        (35.6762, 139.6503, "Tokyo, Japan - Urban Gardens"),
    ]
    
    for lat, lng, description in test_locations:
        try:
            result = get_ndvi_data(lat, lng)
            
            score = result.get("value", 0)
            label = result.get("label", "Unknown")
            confidence = result.get("confidence", 0)
            source = result.get("source", "Unknown")
            note = result.get("note", "No details")
            details = result.get("details", {})
            
            print(f"\n📍 {description}")
            print(f"   Coordinates: ({lat:.4f}, {lng:.4f})")
            print(f"   🌿 Vegetation Score: {score:.1f}/100")
            print(f"   🏷️  Classification: {label}")
            print(f"   📊 Confidence: {confidence:.0f}%")
            print(f"   📡 Data Source: {source}")
            print(f"   💭 Note: {note}")
            
            # Extract detailed evidence
            if details:
                print(f"   📋 Detailed Evidence:")
                for key, value in details.items():
                    if isinstance(value, (int, float)):
                        print(f"      • {key.replace('_', ' ').title()}: {value}")
                    else:
                        print(f"      • {key.replace('_', ' ').title()}: {value}")
            
            # Assessment
            if score >= 85:
                assessment = "🏆 OUTSTANDING - Excellent greenery and parks"
            elif score >= 70:
                assessment = "✅ EXCELLENT - Great greenery and landscaping"
            elif score >= 55:
                assessment = "⚠️  GOOD - Good greenery and parks"
            elif score >= 40:
                assessment = "📍 MODERATE - Acceptable greenery"
            elif score >= 25:
                assessment = "❌ LIMITED - Minimal greenery"
            else:
                assessment = "❌ MINIMAL - Very little greenery"
                
            print(f"   📋 Assessment: {assessment}")
            
        except Exception as e:
            print(f"\n❌ Error for {description}: {str(e)}")
    
    print("\n" + "=" * 80)
    print("VEGETATION SCORING IMPROVEMENTS MADE:")
    print("=" * 80)
    print("✓ COMPLETE REDESIGN: Now measures RESIDENTIAL greenery, not agriculture")
    print("✓ Urban Green Spaces: Parks, gardens, recreation grounds (2km radius)")
    print("✓ Residential Landscaping: Trees, gardens, residential areas (500m radius)")
    print("✓ Natural Areas: Forests, woodlands, scrub areas (3-5km radius)")
    print("✓ No more 15-point penalty for urban areas!")
    print("✓ Enhanced scoring: 8+ green spaces = 90 points, 5+ = 80 points, 3+ = 70 points")
    print("✓ Tree bonuses: 5+ trees = +8 points, 2+ trees = +4 points")
    print("✓ Park bonuses: 2+ parks = +5 points, 1+ park = +3 points")
    print("✓ Better baseline: 55 points (was 15 for urban areas)")
    print("✓ Real OpenStreetMap data with multiple fallback servers")
    print("✓ Detailed numerical evidence: counts of parks, trees, gardens")
    print("✓ Climate-based fallback for areas with no green space data")
    print("✓ Focus on what matters to residents: parks, trees, gardens")
    print("=" * 80)
    print("WHAT VEGETATION NOW MEASURES:")
    print("✓ Parks and recreational green spaces")
    print("✓ Gardens and residential landscaping")
    print("✓ Street trees and urban forestry")
    print("✓ Natural areas and forests nearby")
    print("✓ NOT agricultural crop production")
    print("✓ NOT soil moisture for farming")
    print("✓ NOT satellite NDVI for agriculture")
    print("=" * 80)

if __name__ == "__main__":
    test_vegetation_scoring()
