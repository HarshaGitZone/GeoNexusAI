#!/usr/bin/env python3
"""
Test script to verify OpenAQ API v3 integration works without 410 errors
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import get_air_quality_data
import json

def test_openaq_v3():
    """Test the OpenAQ v3 API integration"""
    print("Testing OpenAQ API v3 integration...")
    
    # Test coordinates (Los Angeles, Hyderabad, New York)
    test_locations = [
        {"lat": 34.0536909, "lng": -118.242766, "name": "Los Angeles"},
        {"lat": 17.537011707550533, "lng": 78.38704567496563, "name": "Hyderabad"},
        {"lat": 40.7128, "lng": -74.006, "name": "New York"}
    ]
    
    for location in test_locations:
        print(f"\n--- Testing {location['name']} ---")
        print(f"Coordinates: {location['lat']}, {location['lng']}")
        
        try:
            result = get_air_quality_data(location['lat'], location['lng'])
            
            if result:
                print("✅ SUCCESS - Air quality data retrieved:")
                print(f"   AQI: {result.get('aqi', 'N/A')}")
                print(f"   Dominant Pollutant: {result.get('dominant_pollutant', 'N/A')}")
                print(f"   PM2.5: {result.get('pm25', 'N/A')}")
                print(f"   Location: {result.get('location', 'N/A')}")
                print(f"   Sensor Count: {result.get('sensor_count', 'N/A')}")
                print(f"   Data Source: {'OpenAQ API v3' if result.get('sensor_count') else 'Fallback Estimate'}")
            else:
                print("❌ FAILED - No data returned")
                
        except Exception as e:
            print(f"❌ ERROR - {str(e)}")
    
    print("\n" + "="*50)
    print("Test completed. If you see no 410 errors above, the fix is working!")

if __name__ == "__main__":
    test_openaq_v3()
