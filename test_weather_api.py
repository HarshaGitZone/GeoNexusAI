import requests
import json

def test_weather_api():
    """Test the current weather API implementation"""
    
    # Test coordinates (Delhi)
    lat, lng = 28.6139, 77.2090
    
    print("Testing Open-Meteo Weather API...")
    print(f"Coordinates: {lat}, {lng}")
    print("-" * 50)
    
    url = 'https://api.open-meteo.com/v1/forecast'
    params = {
        'latitude': lat,
        'longitude': lng,
        'current': ['temperature_2m', 'relative_humidity_2m', 'apparent_temperature', 'weather_code'],
        'timezone': 'auto'
    }
    
    try:
        response = requests.get(url, params=params, timeout=10)
        if response.status_code == 200:
            data = response.json()
            print('✅ API Response Success')
            print(f'Temperature: {data["current"]["temperature_2m"]}°C')
            print(f'Feels Like: {data["current"]["apparent_temperature"]}°C')
            print(f'Humidity: {data["current"]["relative_humidity_2m"]}%')
            print(f'Weather Code: {data["current"]["weather_code"]}')
            print(f'Data Source: Open-Meteo API (Live)')
            return True
        else:
            print(f'❌ API Error: {response.status_code}')
            return False
    except Exception as e:
        print(f'❌ Network Error: {e}')
        print('⚠️  Your app would use fallback estimates')
        return False

def compare_with_official():
    """Compare with official weather data for accuracy check"""
    print("\nFor comparison, check official weather sources:")
    print("- India Meteorological Department (IMD)")
    print("- Weather.gov for US locations")
    print("- Local meteorological services")

if __name__ == "__main__":
    test_weather_api()
    compare_with_official()
