#!/usr/bin/env python3
"""
Debug script to identify the 500 error in production
"""
import sys
import os
import traceback
import json
from flask import Flask, request, jsonify

# Add current directory to path
sys.path.append('.')

# Import the main app components
try:
    from app import app, _perform_suitability_analysis
    print("✅ Successfully imported app and _perform_suitability_analysis")
except Exception as e:
    print(f"❌ Failed to import app components: {e}")
    traceback.print_exc()
    sys.exit(1)

# Test the suitability analysis function directly
def test_suitability_analysis():
    """Test the core analysis function"""
    print("\n=== Testing _perform_suitability_analysis ===")
    
    # Test coordinates (New Delhi)
    test_lat = 28.6139
    test_lng = 77.2090
    
    try:
        result = _perform_suitability_analysis(test_lat, test_lng)
        print("✅ _perform_suitability_analysis executed successfully")
        print(f"Result keys: {list(result.keys())}")
        print(f"Suitability score: {result.get('suitability_score', 'N/A')}")
        return True
    except Exception as e:
        print(f"❌ _perform_suitability_analysis failed: {e}")
        traceback.print_exc()
        return False

# Test the Flask endpoint
def test_flask_endpoint():
    """Test the Flask /suitability endpoint"""
    print("\n=== Testing Flask /suitability endpoint ===")
    
    with app.test_client() as client:
        try:
            # Test data
            test_data = {
                "latitude": 28.6139,
                "longitude": 77.2090,
                "debug": True
            }
            
            response = client.post('/suitability', 
                                 json=test_data,
                                 headers={'Content-Type': 'application/json'})
            
            print(f"Response status: {response.status_code}")
            print(f"Response headers: {dict(response.headers)}")
            
            if response.status_code == 200:
                print("✅ Flask endpoint executed successfully")
                response_data = response.get_json()
                print(f"Response keys: {list(response_data.keys()) if response_data else 'None'}")
                return True
            else:
                print(f"❌ Flask endpoint failed with status {response.status_code}")
                print(f"Response data: {response.get_data(as_text=True)}")
                return False
                
        except Exception as e:
            print(f"❌ Flask endpoint test failed: {e}")
            traceback.print_exc()
            return False

# Test individual components
def test_components():
    """Test individual components that might be failing"""
    print("\n=== Testing Individual Components ===")
    
    try:
        from suitability_factors.geo_data_service import GeoDataService
        print("✅ GeoDataService imported successfully")
        
        # Test getting land intelligence
        intelligence = GeoDataService.get_land_intelligence(28.6139, 77.2090)
        print("✅ GeoDataService.get_land_intelligence executed successfully")
        print(f"Intelligence keys: {list(intelligence.keys())}")
        
    except Exception as e:
        print(f"❌ GeoDataService failed: {e}")
        traceback.print_exc()
        return False
    
    try:
        from suitability_factors.aggregator import Aggregator
        print("✅ Aggregator imported successfully")
        
        # Test with mock data
        mock_intelligence = {
            "raw_factors": {
                "physical": {"slope": {"value": 50}, "elevation": {"value": 200}},
                "environmental": {"vegetation": {"ndvi_index": 0.5}, "soil": {"value": 50}, "pollution": {"value": 50}},
                "hydrology": {"water": {"value": 50}, "drainage": {"value": 50}, "flood": {"value": 50}},
                "climatic": {"rainfall": {"value": 50}, "thermal": {"value": 50}},
                "socio_econ": {"infrastructure": {"value": 50}, "landuse": {"value": 50}, "population": {"value": 50}}
            },
            "latitude": 28.6139,
            "longitude": 77.2090
        }
        
        result = Aggregator.compute_suitability_score(mock_intelligence)
        print("✅ Aggregator.compute_suitability_score executed successfully")
        print(f"Aggregator result keys: {list(result.keys())}")
        
    except Exception as e:
        print(f"❌ Aggregator failed: {e}")
        traceback.print_exc()
        return False
    
    return True

# Check environment variables
def check_environment():
    """Check if required environment variables are set"""
    print("\n=== Checking Environment Variables ===")
    
    required_vars = ["GROQ_API_KEY", "OPENAI_API_KEY", "GEMINI_API_KEY"]
    missing_vars = []
    
    for var in required_vars:
        value = os.getenv(var)
        if value:
            print(f"✅ {var}: Set")
        else:
            print(f"❌ {var}: Not set")
            missing_vars.append(var)
    
    if missing_vars:
        print(f"⚠️  Missing environment variables: {missing_vars}")
        print("These might not be critical for basic functionality but could affect some features")
    
    return len(missing_vars) == 0

# Main test runner
def main():
    print("🔍 GeoAI Backend Debug Script")
    print("=" * 50)
    
    # Check environment
    check_environment()
    
    # Test components
    if not test_components():
        print("\n❌ Component tests failed - this is likely the root cause")
        return
    
    # Test core analysis function
    if not test_suitability_analysis():
        print("\n❌ Core analysis function failed - this is likely the root cause")
        return
    
    # Test Flask endpoint
    if not test_flask_endpoint():
        print("\n❌ Flask endpoint failed - this is the root cause")
        return
    
    print("\n🎉 All tests passed! The issue might be environment-specific")
    print("Possible production issues:")
    print("1. Memory limits (PyTorch model loading)")
    print("2. Timeout limits (external API calls)")
    print("3. Missing environment variables")
    print("4. Network connectivity issues")

if __name__ == "__main__":
    main()
