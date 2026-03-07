#!/usr/bin/env python3
"""
Test the updated binary landuse scoring approach
"""

from suitability_factors.socio_economic.landuse_status import infer_landuse_score

def test_binary_scoring():
    """Test the new binary approach: 0 for protected, high for good areas"""
    
    print("=" * 80)
    print("BINARY LANDUSE SCORING TEST")
    print("=" * 80)
    
    # Test cases that should get 0-5 (protected areas)
    protected_test_cases = [
        (18.5204, 73.8567, "Pune Forest Area"),
        (19.0760, 72.8777, "Mumbai Sanjay Gandhi National Park area"),
    ]
    
    print("\n🚫 PROTECTED AREAS (Should score 0-5):")
    print("-" * 50)
    
    for lat, lng, desc in protected_test_cases:
        try:
            score, details = infer_landuse_score(lat, lng)
            print(f"\n📍 {desc}")
            print(f"   Score: {score:.1f} {'✅' if score <= 5 else '❌'}")
            print(f"   Classification: {details.get('classification')}")
            print(f"   Buildable Probability: {details.get('buildable_probability', 0):.0%}")
        except Exception as e:
            print(f"❌ Error: {e}")
    
    # Test cases that should get 70-100 (good areas)
    good_test_cases = [
        (28.6139, 77.2090, "New Delhi Urban Center"),
        (40.7128, -74.0060, "New York Urban"),
        (12.9716, 77.5946, "Bangalore Urban"),
    ]
    
    print("\n✅ GOOD AREAS (Should score 70-100):")
    print("-" * 50)
    
    for lat, lng, desc in good_test_cases:
        try:
            score, details = infer_landuse_score(lat, lng)
            print(f"\n📍 {desc}")
            print(f"   Score: {score:.1f} {'✅' if score >= 70 else '❌'}")
            print(f"   Classification: {details.get('classification')}")
            print(f"   Buildable Probability: {details.get('buildable_probability', 0):.0%}")
            print(f"   Infrastructure Score: {details.get('infrastructure_score', 0):.1f}")
        except Exception as e:
            print(f"❌ Error: {e}")
    
    print("\n" + "=" * 80)
    print("SCORING SUMMARY:")
    print("=" * 80)
    print("🚫 Protected Areas (Forest/Wetland): 0-5 score")
    print("💧 Water Bodies: 0 score") 
    print("🏙️  Prime Urban: 90-100 score (with good infrastructure)")
    print("🏘️  Suburban/Mixed: 82-95 score")
    print("🌾 Agricultural: 80-90 score")
    print("🌿 Meadow/Grassland: 72-85 score")
    print("📍 Generic Buildable: 60-95 score")
    print("=" * 80)

if __name__ == "__main__":
    test_binary_scoring()
