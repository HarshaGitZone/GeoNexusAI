"""
Location-Specific Weather Adapters
Specialized adapters for different regions and weather patterns
"""

import math
import requests
from datetime import datetime, timezone
from typing import Dict, Optional
import logging

logger = logging.getLogger(__name__)

class LocationWeatherAdapter:
    """Base class for location-specific weather adapters"""
    
    def __init__(self, region_name: str, priority: int = 5):
        self.region_name = region_name
        self.priority = priority
    
    def is_in_region(self, lat: float, lng: float) -> bool:
        """Check if coordinates are in this adapter's region"""
        raise NotImplementedError
    
    def get_weather(self, lat: float, lng: float) -> Optional[Dict]:
        """Get weather data for this specific region"""
        raise NotImplementedError

class IndiaWeatherAdapter(LocationWeatherAdapter):
    """India-specific weather adapter with regional patterns"""
    
    def __init__(self):
        super().__init__("India", priority=3)
        self.regions = {
            "north": {"bounds": [20.0, 37.0, 68.0, 97.0], "base_temp": 22.0, "monsoon": True},
            "south": {"bounds": [8.0, 20.0, 72.0, 88.0], "base_temp": 28.0, "monsoon": True},
            "east": {"bounds": [20.0, 29.0, 88.0, 97.0], "base_temp": 26.0, "monsoon": True},
            "west": {"bounds": [20.0, 37.0, 68.0, 72.0], "base_temp": 25.0, "monsoon": False},
            "central": {"bounds": [20.0, 26.0, 72.0, 88.0], "base_temp": 24.0, "monsoon": True}
        }
    
    def is_in_region(self, lat: float, lng: float) -> bool:
        """Check if coordinates are in India"""
        return 8.0 <= lat <= 37.0 and 68.0 <= lng <= 97.0
    
    def get_weather(self, lat: float, lng: float) -> Optional[Dict]:
        """Get India-specific weather patterns"""
        try:
            # Determine sub-region
            region = self._get_sub_region(lat, lng)
            if not region:
                return None
            
            # Seasonal adjustments
            month = datetime.now().month
            seasonal_adjustment = self._get_seasonal_adjustment(month, region)
            
            # Time-based adjustments
            hour = datetime.now().hour
            daily_variation = self._get_daily_variation(hour)
            
            # Monsoon considerations
            is_monsoon = self._is_monsoon_season(month) and region["monsoon"]
            
            base_temp = region["base_temp"] + seasonal_adjustment + daily_variation
            humidity = 70.0 if is_monsoon else 50.0
            
            return {
                "temperature": base_temp,
                "feels_like": base_temp + (2.0 if is_monsoon else 0.0),
                "humidity": humidity,
                "pressure": 1010.0,
                "wind_speed": 12.0 if is_monsoon else 8.0,
                "wind_direction": 230.0 if is_monsoon else 270.0,
                "precipitation": 15.0 if is_monsoon else 0.0,
                "cloud_cover": 80.0 if is_monsoon else 30.0,
                "description": "Monsoon" if is_monsoon else "Clear",
                "icon": "🌧️" if is_monsoon else "☀️",
                "source": "india_regional",
                "accuracy": "medium",
                "region": region,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
            
        except Exception as e:
            logger.error(f"India weather adapter error: {e}")
            return None
    
    def _get_sub_region(self, lat: float, lng: float) -> Optional[Dict]:
        """Determine which sub-region the coordinates fall into"""
        for region_name, region_data in self.regions.items():
            bounds = region_data["bounds"]
            if bounds[0] <= lat <= bounds[1] and bounds[2] <= lng <= bounds[3]:
                return region_data
        return None
    
    def _get_seasonal_adjustment(self, month: int, region: Dict) -> float:
        """Get temperature adjustment based on season"""
        # Simplified seasonal pattern for India
        if month in [12, 1, 2]:  # Winter
            return -5.0
        elif month in [3, 4, 5]:  # Spring/Summer
            return 5.0
        elif month in [6, 7, 8, 9]:  # Monsoon
            return -2.0
        else:  # Autumn
            return 0.0
    
    def _get_daily_variation(self, hour: int) -> float:
        """Get temperature variation based on time of day"""
        # Peak at 2 PM, lowest at 4 AM
        return 4.0 * math.sin((hour - 4) * math.pi / 12)
    
    def _is_monsoon_season(self, month: int) -> bool:
        """Check if it's monsoon season"""
        return month in [6, 7, 8, 9]

class USWeatherAdapter(LocationWeatherAdapter):
    """US-specific weather adapter"""
    
    def __init__(self):
        super().__init__("United States", priority=3)
        self.regions = {
            "northeast": {"bounds": [38.0, 47.0, -80.0, -67.0], "base_temp": 12.0},
            "southeast": {"bounds": [25.0, 38.0, -90.0, -75.0], "base_temp": 20.0},
            "midwest": {"bounds": [37.0, 49.0, -105.0, -80.0], "base_temp": 10.0},
            "southwest": {"bounds": [31.0, 37.0, -120.0, -103.0], "base_temp": 18.0},
            "west": {"bounds": [40.0, 49.0, -125.0, -110.0], "base_temp": 11.0},
            "northwest": {"bounds": [42.0, 49.0, -125.0, -110.0], "base_temp": 9.0}
        }
    
    def is_in_region(self, lat: float, lng: float) -> bool:
        """Check if coordinates are in US"""
        return 25.0 <= lat <= 49.0 and -125.0 <= lng <= -67.0
    
    def get_weather(self, lat: float, lng: float) -> Optional[Dict]:
        """Get US-specific weather patterns"""
        try:
            region = self._get_sub_region(lat, lng)
            if not region:
                return None
            
            month = datetime.now().month
            seasonal_adjustment = self._get_us_seasonal_adjustment(month, region)
            hour = datetime.now().hour
            
            base_temp = region["base_temp"] + seasonal_adjustment
            daily_variation = 3.0 * math.sin((hour - 6) * math.pi / 12)
            
            return {
                "temperature": base_temp + daily_variation,
                "feels_like": base_temp + daily_variation,
                "humidity": 60.0,
                "pressure": 1013.25,
                "wind_speed": 10.0,
                "wind_direction": 270.0,
                "precipitation": 0.0,
                "cloud_cover": 40.0,
                "description": "Regional Estimate",
                "icon": "🌤️",
                "source": "us_regional",
                "accuracy": "medium",
                "region": region,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
            
        except Exception as e:
            logger.error(f"US weather adapter error: {e}")
            return None
    
    def _get_sub_region(self, lat: float, lng: float) -> Optional[Dict]:
        """Determine which US sub-region"""
        for region_name, region_data in self.regions.items():
            bounds = region_data["bounds"]
            if bounds[0] <= lat <= bounds[1] and bounds[2] <= lng <= bounds[3]:
                return region_data
        return None
    
    def _get_us_seasonal_adjustment(self, month: int, region: Dict) -> float:
        """Get US seasonal temperature adjustment"""
        if month in [12, 1, 2]:  # Winter
            return -8.0
        elif month in [3, 4, 5]:  # Spring
            return 2.0
        elif month in [6, 7, 8]:  # Summer
            return 8.0
        else:  # Fall
            return 0.0

class EuropeWeatherAdapter(LocationWeatherAdapter):
    """Europe-specific weather adapter"""
    
    def __init__(self):
        super().__init__("Europe", priority=3)
        self.regions = {
            "northern": {"bounds": [60.0, 71.0, -10.0, 40.0], "base_temp": 8.0},
            "western": {"bounds": [45.0, 60.0, -10.0, 10.0], "base_temp": 14.0},
            "central": {"bounds": [45.0, 55.0, 10.0, 20.0], "base_temp": 12.0},
            "eastern": {"bounds": [45.0, 55.0, 20.0, 40.0], "base_temp": 11.0},
            "southern": {"bounds": [35.0, 45.0, -10.0, 30.0], "base_temp": 18.0}
        }
    
    def is_in_region(self, lat: float, lng: float) -> bool:
        """Check if coordinates are in Europe"""
        return 35.0 <= lat <= 71.0 and -10.0 <= lng <= 40.0
    
    def get_weather(self, lat: float, lng: float) -> Optional[Dict]:
        """Get Europe-specific weather patterns"""
        try:
            region = self._get_sub_region(lat, lng)
            if not region:
                return None
            
            month = datetime.now().month
            seasonal_adjustment = self._get_europe_seasonal_adjustment(month)
            hour = datetime.now().hour
            
            base_temp = region["base_temp"] + seasonal_adjustment
            daily_variation = 2.5 * math.sin((hour - 6) * math.pi / 12)
            
            return {
                "temperature": base_temp + daily_variation,
                "feels_like": base_temp + daily_variation,
                "humidity": 65.0,
                "pressure": 1015.0,
                "wind_speed": 12.0,
                "wind_direction": 250.0,
                "precipitation": 0.0,
                "cloud_cover": 50.0,
                "description": "European Regional",
                "icon": "🌥️",
                "source": "europe_regional",
                "accuracy": "medium",
                "region": region,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
            
        except Exception as e:
            logger.error(f"Europe weather adapter error: {e}")
            return None
    
    def _get_sub_region(self, lat: float, lng: float) -> Optional[Dict]:
        """Determine which European sub-region"""
        for region_name, region_data in self.regions.items():
            bounds = region_data["bounds"]
            if bounds[0] <= lat <= bounds[1] and bounds[2] <= lng <= bounds[3]:
                return region_data
        return None
    
    def _get_europe_seasonal_adjustment(self, month: int) -> float:
        """Get European seasonal temperature adjustment"""
        if month in [12, 1, 2]:  # Winter
            return -10.0
        elif month in [3, 4, 5]:  # Spring
            return 3.0
        elif month in [6, 7, 8]:  # Summer
            return 10.0
        else:  # Fall
            return 0.0

class LocationWeatherManager:
    """Manager for location-specific weather adapters"""
    
    def __init__(self):
        self.adapters = [
            IndiaWeatherAdapter(),
            USWeatherAdapter(),
            EuropeWeatherAdapter()
        ]
        # Sort by priority
        self.adapters.sort(key=lambda x: x.priority)
    
    def get_location_weather(self, lat: float, lng: float) -> Optional[Dict]:
        """Get weather from location-specific adapter"""
        for adapter in self.adapters:
            if adapter.is_in_region(lat, lng):
                try:
                    weather_data = adapter.get_weather(lat, lng)
                    if weather_data:
                        logger.info(f"Using {adapter.region_name} adapter for {lat}, {lng}")
                        return weather_data
                except Exception as e:
                    logger.warning(f"Location adapter {adapter.region_name} failed: {e}")
                    continue
        
        return None

# Global instance
location_weather_manager = LocationWeatherManager()
