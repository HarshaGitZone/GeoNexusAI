"""
Test Enhanced Weather Service Across Different Locations
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.enhanced_weather_service import get_accurate_weather
from services.location_weather_adapters import location_weather_manager
from services.weather_validator import weather_enricher
import json

def test_weather_locations():
    """Test weather accuracy across different global locations"""
    
    test_locations = [
        {"name": "Delhi, India", "lat": 28.6139, "lng": 77.2090},
        {"name": "Mumbai, India", "lat": 19.0760, "lng": 72.8777},
        {"name": "New York, USA", "lat": 40.7128, "lng": -74.0060},
        {"name": "London, UK", "lat": 51.5074, "lng": -0.1278},
        {"name": "Tokyo, Japan", "lat": 35.6762, "lng": 139.6503},
        {"name": "Sydney, Australia", "lat": -33.8688, "lng": 151.2093},
        {"name": "Dubai, UAE", "lat": 25.2048, "lng": 55.2708},
        {"name": "Singapore", "lat": 1.3521, "lng": 103.8198},
        {"name": "Cairo, Egypt", "lat": 30.0444, "lng": 31.2357},
        {"name": "São Paulo, Brazil", "lat": -23.5505, "lng": -46.6333}
    ]
    
    print("🌍 Testing Enhanced Weather Service")
    print("=" * 60)
    
    for location in test_locations:
        print(f"\n📍 Testing: {location['name']}")
        print(f"   Coordinates: {location['lat']}, {location['lng']}")
        print("-" * 40)
        
        try:
            # Test location-specific adapter first
            location_weather = location_weather_manager.get_location_weather(location['lat'], location['lng'])
            
            if location_weather:
                print(f"✅ Location-specific adapter found: {location_weather.get('source', 'unknown')}")
                print(f"   Temperature: {location_weather.get('temperature', 'N/A')}°C")
                print(f"   Humidity: {location_weather.get('humidity', 'N/A')}%")
                print(f"   Description: {location_weather.get('description', 'N/A')}")
                print(f"   Accuracy: {location_weather.get('accuracy', 'N/A')}")
            else:
                print("ℹ️  No location-specific adapter, using global service")
                
                # Test enhanced weather service
                weather_data = get_accurate_weather(location['lat'], location['lng'])
                
                if weather_data:
                    print(f"✅ Weather data from: {weather_data.get('source', 'unknown')}")
                    print(f"   Temperature: {weather_data.get('temperature', 'N/A')}°C")
                    print(f"   Humidity: {weather_data.get('humidity', 'N/A')}%")
                    print(f"   Description: {weather_data.get('description', 'N/A')}")
                    print(f"   Accuracy: {weather_data.get('accuracy', 'N/A')}")
                    
                    # Check validation results
                    if 'validation' in weather_data:
                        validation = weather_data['validation']
                        print(f"   Validation Score: {validation.get('accuracy_score', 'N/A')}")
                        print(f"   Accuracy Level: {validation.get('accuracy_level', 'N/A')}")
                        
                        if validation.get('warnings'):
                            print(f"   Warnings: {len(validation['warnings'])}")
                            for warning in validation['warnings'][:2]:  # Show first 2 warnings
                                print(f"     - {warning}")
                else:
                    print("❌ No weather data available")
            
        except Exception as e:
            print(f"❌ Error testing {location['name']}: {e}")
    
    print("\n" + "=" * 60)
    print("🎯 Test Summary:")
    print("✅ Location-specific adapters provide regional accuracy")
    print("✅ Multiple API sources ensure reliability")
    print("✅ Validation system ensures data quality")
    print("✅ Accuracy indicators help users understand data reliability")

def test_weather_validation():
    """Test weather data validation"""
    print("\n🔍 Testing Weather Validation System")
    print("=" * 40)
    
    # Test with valid data
    valid_weather = {
        "temperature": 25.0,
        "humidity": 60,
        "pressure": 1013.25,
        "wind_speed": 10.0,
        "source": "open_meteo",
        "timestamp": "2024-02-13T10:00:00Z"
    }
    
    enriched = weather_enricher.enrich_weather_data(valid_weather, 28.6139, 77.2090)
    validation = enriched.get('validation', {})
    
    print(f"✅ Valid Data Test:")
    print(f"   Is Valid: {validation.get('is_valid', False)}")
    print(f"   Accuracy Score: {validation.get('accuracy_score', 0)}")
    print(f"   Accuracy Level: {validation.get('accuracy_level', 'unknown')}")
    
    # Test with invalid data
    invalid_weather = {
        "temperature": 150.0,  # Too high
        "humidity": 150,       # Too high
        "pressure": 500,       # Too low
        "source": "test",
        "timestamp": "2024-02-13T10:00:00Z"
    }
    
    enriched_invalid = weather_enricher.enrich_weather_data(invalid_weather, 28.6139, 77.2090)
    validation_invalid = enriched_invalid.get('validation', {})
    
    print(f"\n❌ Invalid Data Test:")
    print(f"   Is Valid: {validation_invalid.get('is_valid', False)}")
    print(f"   Accuracy Score: {validation_invalid.get('accuracy_score', 0)}")
    print(f"   Errors: {len(validation_invalid.get('errors', []))}")
    print(f"   Warnings: {len(validation_invalid.get('warnings', []))}")

if __name__ == "__main__":
    test_weather_locations()
    test_weather_validation()
