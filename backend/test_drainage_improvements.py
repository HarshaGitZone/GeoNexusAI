#!/usr/bin/env python3
"""
Test the improved drainage analysis scoring
"""

from suitability_factors.hydrology.drainage_density import get_drainage_analysis

def test_drainage_scoring():
    """Test the improved drainage scoring with various locations"""
    
    print("=" * 80)
    print("DRAINAGE ANALYSIS SCORING IMPROVEMENT TEST")
    print("=" * 80)
    
    test_locations = [
        (28.6139, 77.2090, "New Delhi, India - Urban with Yamuna River"),
        (19.0760, 72.8777, "Mumbai, India - Coastal with drainage"),
        (51.5074, -0.1278, "London, UK - Thames River drainage"),
        (40.7128, -74.0060, "New York, USA - Urban drainage systems"),
        (12.9716, 77.5946, "Bangalore, India - Urban drainage"),
        (30.2672, 97.7431, "Austin, USA - Hill country terrain"),
        (37.7749, -122.4194, "San Francisco, USA - Coastal drainage"),
    ]
    
    for lat, lng, description in test_locations:
        try:
            result = get_drainage_analysis(lat, lng)
            score = result.get("value", 0)
            label = result.get("label", "Unknown")
            confidence = result.get("confidence", 0)
            source = result.get("source", "Unknown")
            reasoning = result.get("reasoning", "No reasoning")
            
            # Extract detailed evidence
            raw_data = result.get("raw", {})
            total_features = raw_data.get("total_features", 0)
            search_radius = raw_data.get("search_radius_m", 0)
            analysis_area = raw_data.get("analysis_area_km2", 0)
            
            # Natural waterways details
            waterways = raw_data.get("natural_waterways", {})
            waterway_count = waterways.get("count", 0)
            density = waterways.get("density_per_km2", 0)
            
            # Infrastructure details
            infra = raw_data.get("drainage_infrastructure", {})
            infra_count = infra.get("count", 0)
            
            # Urban systems details
            urban = raw_data.get("urban_systems", {})
            urban_count = urban.get("count", 0)
            
            # Terrain details
            terrain = raw_data.get("terrain_impact", {})
            terrain_impact = terrain.get("terrain_impact", "Unknown")
            slope = terrain.get("slope_percent", 0)
            
            print(f"\n📍 {description}")
            print(f"   Coordinates: ({lat:.4f}, {lng:.4f})")
            print(f"   🎯 Drainage Score: {score:.1f}/100")
            print(f"   🏷️  Classification: {label}")
            print(f"   📊 Confidence: {confidence:.0f}%")
            print(f"   📡 Data Source: {source}")
            print(f"   📏 Search Area: {search_radius}m radius ({analysis_area} km²)")
            
            print(f"\n   📋 Detailed Evidence:")
            print(f"      Total Drainage Features: {total_features}")
            print(f"      Natural Waterways: {waterway_count} ({density:.2f} per km²)")
            print(f"      Infrastructure: {infra_count} elements")
            print(f"      Urban Systems: {urban_count} systems")
            print(f"      Terrain Impact: {terrain_impact} ({slope:.1f}% slope)")
            
            print(f"   💭 Reasoning: {reasoning}")
            
            # Assessment
            if score >= 85:
                assessment = "🏆 EXCELLENT - Outstanding drainage capacity"
            elif score >= 70:
                assessment = "✅ VERY GOOD - Strong drainage capacity"
            elif score >= 55:
                assessment = "⚠️  GOOD - Adequate drainage capacity"
            elif score >= 40:
                assessment = "📍 MODERATE - Limited drainage capacity"
            else:
                assessment = "❌ POOR - Minimal drainage capacity"
                
            print(f"   📋 Assessment: {assessment}")
            
        except Exception as e:
            print(f"\n❌ Error for {description}: {str(e)}")
    
    print("\n" + "=" * 80)
    print("DRAINAGE SCORING IMPROVEMENTS MADE:")
    print("=" * 80)
    print("✓ Enhanced maximum score: 100 (was 85)")
    print("✓ Expanded search radius: 5000m (was 2000m)")
    print("✓ Comprehensive 4-layer analysis:")
    print("    • Natural waterways (streams, rivers, canals, ditches)")
    print("    • Man-made infrastructure (culverts, drains, basins)")
    print("    • Urban systems (fountains, reservoirs, storm drains)")
    print("    • Terrain impact (slope-based drainage)")
    print("✓ Proper weighting: 35% natural, 25% infrastructure, 20% urban, 20% terrain")
    print("✓ Density-based scoring: features per km²")
    print("✓ Bonus points for excellent drainage (20+ features = +5, 10+ = +3)")
    print("✓ Enhanced classification: 90+ excellent, 75+ very good, 60+ good")
    print("✓ Better fallback: 60 baseline with regional adjustments")
    print("✓ Detailed numerical evidence with feature counts and names")
    print("✓ Trustworthy data sources: OpenStreetMap + Terrain Analysis")
    print("✓ Confidence scoring based on data availability")
    print("=" * 80)

if __name__ == "__main__":
    test_drainage_scoring()
