"""
Enhanced Weather Service with Location-Specific Adapters
Provides accurate weather data from multiple sources with automatic fallback
"""

import requests
import json
import math
import logging
from datetime import datetime, timezone
from typing import Dict, Optional, Tuple
import os

logger = logging.getLogger(__name__)

class WeatherAdapter:
    """Base class for location-specific weather adapters"""
    
    def __init__(self, name: str, priority: int = 1):
        self.name = name
        self.priority = priority
        self.api_key = None
        self.base_url = None
    
    def get_weather(self, lat: float, lng: float) -> Optional[Dict]:
        """Get weather data for coordinates"""
        raise NotImplementedError
    
    def is_available(self) -> bool:
        """Check if adapter is configured and available"""
        return True

class OpenMeteoAdapter(WeatherAdapter):
    """Open-Meteo Weather API Adapter"""
    
    def __init__(self):
        super().__init__("Open-Meteo", priority=1)
        self.base_url = "https://api.open-meteo.com/v1/forecast"
    
    def get_weather(self, lat: float, lng: float) -> Optional[Dict]:
        """Get weather from Open-Meteo API with enhanced error handling"""
        try:
            # Try primary URL first
            urls = [
                "https://api.open-meteo.com/v1/forecast",
                "https://archive-api.open-meteo.com/v1/archive"
            ]
            
            params = {
                "latitude": lat,
                "longitude": lng,
                "current": [
                    "temperature_2m", "relative_humidity_2m", "apparent_temperature",
                    "is_day", "precipitation", "weather_code", "cloud_cover",
                    "wind_speed_10m", "wind_direction_10m", "wind_gusts_10m",
                    "surface_pressure", "visibility", "uv_index", "dew_point_2m"
                ],
                "daily": [
                    "sunrise", "sunset", "uv_index_max", "precipitation_probability_max"
                ],
                "hourly": [
                    "temperature_2m", "relative_humidity_2m", "wind_speed_10m"
                ],
                "timezone": "auto"
            }
            
            # Try each URL with timeout
            for url in urls:
                try:
                    response = requests.get(url, params=params, timeout=10, 
                                      headers={'User-Agent': 'GeoNexusAI/1.0'})
                    if response.status_code == 200:
                        data = response.json()
                        current = data.get("current", {})
                        daily = data.get("daily", {})
                        
                        if not current:
                            return None
                        
                        # Map weather codes to descriptions
                        weather_code = current.get("weather_code", 0)
                        is_day = current.get("is_day", 1)
                        description, icon = self._get_weather_description(weather_code, is_day)
                        
                        return {
                            "temperature": current.get("temperature_2m"),
                            "feels_like": current.get("apparent_temperature"),
                            "humidity": current.get("relative_humidity_2m"),
                            "pressure": current.get("surface_pressure"),
                            "wind_speed": current.get("wind_speed_10m"),
                            "wind_direction": current.get("wind_direction_10m"),
                            "wind_gusts": current.get("wind_gusts_10m"),
                            "visibility": current.get("visibility"),
                            "uv_index": current.get("uv_index"),
                            "dew_point": current.get("dew_point_2m"),
                            "precipitation": current.get("precipitation", 0),
                            "cloud_cover": current.get("cloud_cover"),
                            "weather_code": weather_code,
                            "description": description,
                            "icon": icon,
                            "is_day": is_day,
                            "sunrise": daily.get("sunrise", [None])[0],
                            "sunset": daily.get("sunset", [None])[0],
                            "source": "open_meteo",
                            "accuracy": "high",
                            "timestamp": datetime.now(timezone.utc).isoformat()
                        }
                except requests.exceptions.RequestException as e:
                    logger.warning(f"Open-Meteo API error with {url}: {e}")
                    continue
            
            # If all URLs fail, return None to trigger fallback
            logger.error("All Open-Meteo URLs failed")
            return None
            weather_code = current.get("weather_code", 0)
            is_day = current.get("is_day", 1)
            description, icon = self._get_weather_description(weather_code, is_day)
            
            return {
                "temperature": current.get("temperature_2m"),
                "feels_like": current.get("apparent_temperature"),
                "humidity": current.get("relative_humidity_2m"),
                "pressure": current.get("surface_pressure"),
                "wind_speed": current.get("wind_speed_10m"),
                "wind_direction": current.get("wind_direction_10m"),
                "wind_gusts": current.get("wind_gusts_10m"),
                "visibility": current.get("visibility"),
                "uv_index": current.get("uv_index"),
                "dew_point": current.get("dew_point_2m"),
                "precipitation": current.get("precipitation", 0),
                "cloud_cover": current.get("cloud_cover"),
                "weather_code": weather_code,
                "description": description,
                "icon": icon,
                "is_day": is_day,
                "sunrise": daily.get("sunrise", [None])[0],
                "sunset": daily.get("sunset", [None])[0],
                "source": "open_meteo",
                "accuracy": "high",
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
            
        except Exception as e:
            logger.error(f"Open-Meteo API error: {e}")
            return None
    
    def _get_weather_description(self, code: int, is_day: int) -> Tuple[str, str]:
        """Convert weather code to description and icon"""
        weather_map = {
            0: ("Clear Sky", "☀️" if is_day else "🌙"),
            1: ("Mainly Clear", "🌤️" if is_day else "☁️"),
            2: ("Partly Cloudy", "⛅" if is_day else "☁️"),
            3: ("Overcast", "☁️"),
            45: ("Foggy", "🌫️"),
            48: ("Foggy", "🌫️"),
            51: ("Light Drizzle", "🌦️"),
            53: ("Drizzle", "🌦️"),
            55: ("Heavy Drizzle", "🌧️"),
            61: ("Light Rain", "🌦️"),
            63: ("Rain", "🌧️"),
            65: ("Heavy Rain", "🌧️"),
            71: ("Light Snow", "🌨️"),
            73: ("Snow", "❄️"),
            75: ("Heavy Snow", "❄️"),
            80: ("Light Showers", "🌦️"),
            81: ("Showers", "🌧️"),
            82: ("Heavy Showers", "⛈️"),
            95: ("Thunderstorm", "⛈️"),
            96: ("Thunderstorm", "⛈️"),
            99: ("Severe Thunderstorm", "⛈️")
        }
        return weather_map.get(code, ("Unknown", "❓"))

class WeatherAPIAdapter(WeatherAdapter):
    """WeatherAPI.com Adapter"""
    
    def __init__(self, api_key: str):
        super().__init__("WeatherAPI", priority=2)
        self.api_key = api_key
        self.base_url = "https://api.weatherapi.com/v1/current.json"
    
    def is_available(self) -> bool:
        return bool(self.api_key)
    
    def get_weather(self, lat: float, lng: float) -> Optional[Dict]:
        """Get weather from WeatherAPI.com"""
        if not self.api_key:
            return None
            
        try:
            params = {
                "key": self.api_key,
                "q": f"{lat},{lng}",
                "aqi": "no"
            }
            
            response = requests.get(self.base_url, params=params, timeout=15)
            response.raise_for_status()
            data = response.json()
            
            current = data.get("current", {})
            location = data.get("location", {})
            
            return {
                "temperature": current.get("temp_c"),
                "feels_like": current.get("feelslike_c"),
                "humidity": current.get("humidity"),
                "pressure": current.get("pressure_mb"),
                "wind_speed": current.get("wind_kph", 0) * 0.27778,  # Convert to m/s
                "wind_direction": current.get("wind_degree"),
                "wind_gusts": current.get("gust_kph", 0) * 0.27778,
                "visibility": current.get("vis_km"),
                "uv_index": current.get("uv"),
                "precipitation": current.get("precip_mm"),
                "cloud_cover": current.get("cloud"),
                "weather_code": None,
                "description": current.get("condition", {}).get("text"),
                "icon": current.get("condition", {}).get("icon"),
                "is_day": current.get("is_day") == 1,
                "sunrise": None,
                "sunset": None,
                "source": "weatherapi",
                "accuracy": "high",
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
            
        except Exception as e:
            logger.error(f"WeatherAPI error: {e}")
            return None

class RegionalWeatherAdapter(WeatherAdapter):
    """Regional weather estimate adapter for fallback"""
    
    def __init__(self):
        super().__init__("Regional Estimate", priority=10)
    
    def get_weather(self, lat: float, lng: float) -> Optional[Dict]:
        """Get regional weather estimate"""
        try:
            # Regional weather patterns
            regions = {
                "tropical_hot": {"center": [0.0, 0.0], "radius": 30.0, "temp": 28.0, "humidity": 80.0, "wind": 8.0},
                "tropical_moderate": {"center": [15.0, 0.0], "radius": 20.0, "temp": 25.0, "humidity": 70.0, "wind": 10.0},
                "temperate_warm": {"center": [40.0, 0.0], "radius": 15.0, "temp": 20.0, "humidity": 60.0, "wind": 12.0},
                "temperate_cool": {"center": [50.0, 0.0], "radius": 10.0, "temp": 15.0, "humidity": 65.0, "wind": 15.0},
                "cold": {"center": [65.0, 0.0], "radius": 15.0, "temp": 5.0, "humidity": 70.0, "wind": 20.0},
                "arctic": {"center": [80.0, 0.0], "radius": 10.0, "temp": -10.0, "humidity": 80.0, "wind": 25.0},
                "desert_hot": {"center": [25.0, 0.0], "radius": 20.0, "temp": 35.0, "humidity": 30.0, "wind": 15.0},
                "desert_moderate": {"center": [35.0, 0.0], "radius": 15.0, "temp": 22.0, "humidity": 40.0, "wind": 18.0},
            }
            
            # Find nearest region
            nearest_region = None
            min_distance = float('inf')
            
            for region_name, region_data in regions.items():
                center_lat, center_lng = region_data["center"]
                distance = math.sqrt((lat - center_lat)**2 + (lng - center_lng)**2)
                if distance < min_distance:
                    min_distance = distance
                    nearest_region = region_data
            
            if nearest_region:
                # Add some variation based on time of day
                hour = datetime.now().hour
                temp_variation = 3 * math.sin((hour - 6) * math.pi / 12)
                
                return {
                    "temperature": nearest_region["temp"] + temp_variation,
                    "feels_like": nearest_region["temp"] + temp_variation,
                    "humidity": nearest_region["humidity"],
                    "pressure": 1013.25,
                    "wind_speed": nearest_region["wind"],
                    "wind_direction": 270,
                    "wind_gusts": nearest_region["wind"] * 1.2,
                    "visibility": 10,
                    "uv_index": 5,
                    "precipitation": 0,
                    "cloud_cover": 30,
                    "weather_code": 0,
                    "description": "Estimated Weather",
                    "icon": "🌍",
                    "is_day": 6 <= hour <= 18,
                    "sunrise": None,
                    "sunset": None,
                    "source": "regional_estimate",
                    "accuracy": "low",
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }
            
            return None
            
        except Exception as e:
            logger.error(f"Regional estimate error: {e}")
            return None

class EnhancedWeatherService:
    """Enhanced weather service with multiple adapters and location optimization"""
    
    def __init__(self):
        self.adapters = []
        self._setup_adapters()
    
    def _setup_adapters(self):
        """Setup available weather adapters"""
        # Add Open-Meteo (always available)
        self.adapters.append(OpenMeteoAdapter())
        
        # Add WeatherAPI if key is available
        weatherapi_key = os.getenv("WEATHERAPI_KEY")
        if weatherapi_key:
            self.adapters.append(WeatherAPIAdapter(weatherapi_key))
        
        # Add regional estimate as fallback
        self.adapters.append(RegionalWeatherAdapter())
        
        # Sort by priority
        self.adapters.sort(key=lambda x: x.priority)
    
    def get_weather(self, lat: float, lng: float) -> Dict:
        """Get weather data with automatic fallback"""
        lat, lng = float(lat), float(lng)
        
        # Try adapters in priority order
        for adapter in self.adapters:
            if not adapter.is_available():
                continue
                
            try:
                weather_data = adapter.get_weather(lat, lng)
                if weather_data:
                    logger.info(f"Weather data from {adapter.name} for {lat}, {lng}")
                    return weather_data
            except Exception as e:
                logger.warning(f"Adapter {adapter.name} failed: {e}")
                continue
        
        # If all adapters fail, return basic estimate
        logger.error("All weather adapters failed, using basic estimate")
        return {
            "temperature": 20.0,
            "humidity": 50.0,
            "source": "emergency_fallback",
            "accuracy": "very_low",
            "description": "Weather data unavailable",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    
    def get_weather_with_metadata(self, lat: float, lng: float) -> Dict:
        """Get weather with additional metadata"""
        weather_data = self.get_weather(lat, lng)
        
        # Add location metadata
        weather_data.update({
            "coordinates": {"lat": lat, "lng": lng},
            "location_name": self._get_location_name(lat, lng),
            "data_freshness": "live" if weather_data.get("accuracy") in ["high", "medium"] else "estimated"
        })
        
        return weather_data
    
    def _get_location_name(self, lat: float, lng: float) -> str:
        """Get location name for coordinates"""
        # This could be enhanced with reverse geocoding
        return f"Location {abs(lat):.2f}°{'N' if lat >= 0 else 'S'}, {abs(lng):.2f}°{'E' if lng >= 0 else 'W'}"

# Global instance
weather_service = EnhancedWeatherService()

def get_accurate_weather(lat: float, lng: float) -> Dict:
    """Main function to get accurate weather data"""
    return weather_service.get_weather_with_metadata(lat, lng)
