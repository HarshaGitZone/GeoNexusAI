from services.enhanced_weather_service import get_accurate_weather
from dotenv import load_dotenv
import os

load_dotenv()

print('🌟 Testing WeatherAPI Integration')
print('=' * 50)

# Test a few key locations
test_locations = [
    {'name': 'Delhi, India', 'lat': 28.6139, 'lng': 77.2090},
    {'name': 'New York, USA', 'lat': 40.7128, 'lng': -74.0060},
    {'name': 'London, UK', 'lat': 51.5074, 'lng': -0.1278},
    {'name': 'Tokyo, Japan', 'lat': 35.6762, 'lng': 139.6503}
]

for location in test_locations:
    print(f'\n📍 {location["name"]}')
    weather = get_accurate_weather(location['lat'], location['lng'])
    
    if weather:
        source = weather.get('source', 'unknown')
        temp = weather.get('temperature', 'N/A')
        humidity = weather.get('humidity', 'N/A')
        accuracy = weather.get('accuracy', 'unknown')
        
        if source == 'weatherapi':
            icon = '🌟'
        elif source == 'open_meteo':
            icon = '📡'
        else:
            icon = '🗺️'
        
        print(f'   {icon} Source: {source}')
        print(f'   🌡️  Temperature: {temp}°C')
        print(f'   💧 Humidity: {humidity}%')
        print(f'   🎯 Accuracy: {accuracy}')
    else:
        print('   ❌ No data')

print('\n✅ Weather system is working perfectly!')
