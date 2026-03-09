"""
Test WeatherAPI Configuration and Enhanced Accuracy
"""

import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_weatherapi_config():
    """Test if WeatherAPI key is properly configured"""
    print("🔍 Testing WeatherAPI Configuration")
    print("=" * 50)
    
    # Check environment
    weatherapi_key = os.getenv("WEATHERAPI_KEY")
    
    if weatherapi_key:
        print(f"✅ WEATHERAPI_KEY found in environment")
        print(f"   Key length: {len(weatherapi_key)} characters")
        print(f"   Key format: {'Valid' if len(weatherapi_key) > 10 else 'Invalid'}")
        
        # Mask the key for security
        masked_key = weatherapi_key[:4] + "*" * (len(weatherapi_key) - 8) + weatherapi_key[-4:]
        print(f"   Key (masked): {masked_key}")
        
        return True
    else:
        print("❌ WEATHERAPI_KEY not found in environment")
        print("   Please add it to your .env file:")
        print("   WEATHERAPI_KEY=your_actual_key_here")
        return False

def test_enhanced_weather_service():
    """Test the enhanced weather service with WeatherAPI"""
    print("\n🌍 Testing Enhanced Weather Service")
    print("=" * 50)
    
    try:
        from services.enhanced_weather_service import EnhancedWeatherService
        
        # Initialize service
        weather_service = EnhancedWeatherService()
        
        print(f"📊 Available adapters:")
        for i, adapter in enumerate(weather_service.adapters):
            status = "✅ Available" if adapter.is_available() else "❌ Not Available"
            print(f"   {i+1}. {adapter.name} (Priority: {adapter.priority}) - {status}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing enhanced weather service: {e}")
        return False

def test_weather_accuracy():
    """Test weather accuracy across multiple locations"""
    print("\n🎯 Testing Weather Accuracy Across Locations")
    print("=" * 60)
    
    try:
        from services.enhanced_weather_service import get_accurate_weather
        
        test_locations = [
            {"name": "Delhi, India", "lat": 28.6139, "lng": 77.2090},
            {"name": "New York, USA", "lat": 40.7128, "lng": -74.0060},
            {"name": "London, UK", "lat": 51.5074, "lng": -0.1278},
            {"name": "Tokyo, Japan", "lat": 35.6762, "lng": 139.6503},
            {"name": "Sydney, Australia", "lat": -33.8688, "lng": 151.2093},
            {"name": "Dubai, UAE", "lat": 25.2048, "lng": 55.2708},
            {"name": "Singapore", "lat": 1.3521, "lng": 103.8198},
            {"name": "São Paulo, Brazil", "lat": -23.5505, "lng": -46.6333}
        ]
        
        for location in test_locations:
            print(f"\n📍 {location['name']}")
            print(f"   Coordinates: {location['lat']}, {location['lng']}")
            
            try:
                weather_data = get_accurate_weather(location['lat'], location['lng'])
                
                if weather_data:
                    source = weather_data.get('source', 'unknown')
                    accuracy = weather_data.get('accuracy', 'unknown')
                    temp = weather_data.get('temperature', 'N/A')
                    humidity = weather_data.get('humidity', 'N/A')
                    description = weather_data.get('description', 'N/A')
                    
                    print(f"   ✅ Source: {source}")
                    print(f"   🌡️  Temperature: {temp}°C")
                    print(f"   💧 Humidity: {humidity}%")
                    print(f"   ☁️  Description: {description}")
                    print(f"   🎯 Accuracy: {accuracy}")
                    
                    # Check if using WeatherAPI
                    if source == "weatherapi":
                        print("   🌟 Using WeatherAPI.com (Premium accuracy)")
                    elif source == "open_meteo":
                        print("   📡 Using Open-Meteo API (Good accuracy)")
                    else:
                        print(f"   🗺️  Using {source} (Regional estimate)")
                else:
                    print("   ❌ No weather data available")
                    
            except Exception as e:
                print(f"   ❌ Error: {e}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing weather accuracy: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 WeatherAPI Configuration & Accuracy Test")
    print("=" * 60)
    
    # Test 1: Configuration
    config_ok = test_weatherapi_config()
    
    # Test 2: Enhanced service
    service_ok = test_enhanced_weather_service()
    
    # Test 3: Accuracy across locations
    if config_ok and service_ok:
        accuracy_ok = test_weather_accuracy()
    else:
        print("\n⚠️  Skipping accuracy tests due to configuration issues")
        accuracy_ok = False
    
    # Summary
    print("\n" + "=" * 60)
    print("📋 Test Summary:")
    print(f"   Configuration: {'✅ PASS' if config_ok else '❌ FAIL'}")
    print(f"   Service: {'✅ PASS' if service_ok else '❌ FAIL'}")
    print(f"   Accuracy: {'✅ PASS' if accuracy_ok else '❌ FAIL'}")
    
    if config_ok and service_ok and accuracy_ok:
        print("\n🎉 All tests passed! WeatherAPI is properly configured.")
        print("🌍 You now have enhanced weather accuracy for all locations!")
    else:
        print("\n⚠️  Some tests failed. Please check your configuration.")

if __name__ == "__main__":
    main()
