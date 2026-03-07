#!/usr/bin/env python3
"""
Test the improved population density scoring
"""

from suitability_factors.socio_economic.population_density import get_population_data

def test_population_scoring():
    """Test the improved population scoring with various locations"""
    
    print("=" * 80)
    print("POPULATION DENSITY SCORING IMPROVEMENT TEST")
    print("=" * 80)
    
    test_locations = [
        (28.6139, 77.2090, "New Delhi, India - Mega City"),
        (40.7128, -74.0060, "New York, USA - Dense Urban"), 
        (19.0760, 72.8777, "Mumbai, India - Ultra Dense"),
        (51.5074, -0.1278, "London, UK - Dense Urban"),
        (37.7749, -122.4194, "San Francisco, USA - Dense Urban"),
        (12.9716, 77.5946, "Bangalore, India - Well Populated"),
        (30.2672, 97.7431, "Austin, USA - Moderate Population"),
    ]
    
    for lat, lng, description in test_locations:
        try:
            result = get_population_data(lat, lng)
            score = result.get("value", 0)
            density = result.get("density", 0)
            label = result.get("label", "Unknown")
            reasoning = result.get("reasoning", "No reasoning")
            
            print(f"\n📍 {description}")
            print(f"   Coordinates: ({lat:.4f}, {lng:.4f})")
            print(f"   🎯 Population Score: {score:.1f}/100")
            print(f"   👥 Density: {density:,} people/km²")
            print(f"   🏷️  Classification: {label}")
            print(f"   💭 Reasoning: {reasoning}")
            
            # Assessment
            if score >= 95:
                assessment = "🏆 EXCELLENT - Prime city location"
            elif score >= 85:
                assessment = "✅ VERY GOOD - Major urban area"
            elif score >= 70:
                assessment = "⚠️  GOOD - Well populated area"
            elif score >= 50:
                assessment = "📍 MODERATE - Developing area"
            else:
                assessment = "❌ LOW - Sparse population"
                
            print(f"   📋 Assessment: {assessment}")
            
        except Exception as e:
            print(f"\n❌ Error for {description}: {str(e)}")
    
    print("\n" + "=" * 80)
    print("SCORING IMPROVEMENTS MADE:")
    print("=" * 80)
    print("✓ Dense Urban (2000-4000): 95/100 (was 85)")
    print("✓ Very Dense Urban (4000-8000): 100/100 (was 75)")
    print("✓ Ultra Dense Urban (8000-12000): 98/100 (NEW)")
    print("✓ Mega City (>12000): 96/100 (NEW)")
    print("✓ Well Populated (800-2000): 88/100 (was 90)")
    print("✓ Moderate (300-800): 65/100 (was 70)")
    print("✓ Sparse (100-300): 35/100 (was 45)")
    print("✓ Very Sparse (<100): 15/100 (was 25)")
    print("✓ Fallback score: 70/100 (was 50)")
    print("✓ Max density increased: 15000 (was 8000)")
    print("✓ Base densities increased for better city detection")
    print("=" * 80)

if __name__ == "__main__":
    test_population_scoring()
