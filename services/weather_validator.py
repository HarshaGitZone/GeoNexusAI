"""
Weather Data Validation and Accuracy Assessment
"""

import logging
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional, Tuple
import math

logger = logging.getLogger(__name__)

class WeatherValidator:
    """Validates weather data and assesses accuracy"""
    
    def __init__(self):
        self.validation_rules = {
            "temperature": {"min": -50, "max": 60, "unit": "°C"},
            "humidity": {"min": 0, "max": 100, "unit": "%"},
            "pressure": {"min": 800, "max": 1100, "unit": "hPa"},
            "wind_speed": {"min": 0, "max": 100, "unit": "m/s"},
            "visibility": {"min": 0, "max": 50, "unit": "km"},
            "uv_index": {"min": 0, "max": 15, "unit": "index"}
        }
    
    def validate_weather_data(self, weather_data: Dict) -> Dict:
        """Validate weather data and return validation results"""
        validation_result = {
            "is_valid": True,
            "errors": [],
            "warnings": [],
            "accuracy_score": 100,
            "validation_timestamp": datetime.now(timezone.utc).isoformat()
        }
        
        # Check required fields
        required_fields = ["temperature", "humidity", "source", "timestamp"]
        for field in required_fields:
            if field not in weather_data:
                validation_result["errors"].append(f"Missing required field: {field}")
                validation_result["is_valid"] = False
                validation_result["accuracy_score"] -= 20
        
        # Validate numeric ranges
        for field, rules in self.validation_rules.items():
            if field in weather_data and weather_data[field] is not None:
                value = weather_data[field]
                if not isinstance(value, (int, float)):
                    validation_result["errors"].append(f"Invalid type for {field}: expected number")
                    validation_result["is_valid"] = False
                    validation_result["accuracy_score"] -= 10
                    continue
                
                if value < rules["min"] or value > rules["max"]:
                    validation_result["warnings"].append(
                        f"{field} {value}{rules['unit']} outside normal range ({rules['min']}-{rules['max']}{rules['unit']})"
                    )
                    validation_result["accuracy_score"] -= 5
        
        # Check data freshness
        if "timestamp" in weather_data:
            freshness_score = self._check_data_freshness(weather_data["timestamp"])
            validation_result["accuracy_score"] = min(validation_result["accuracy_score"], freshness_score)
        
        # Check source reliability
        source_score = self._assess_source_reliability(weather_data.get("source", "unknown"))
        validation_result["accuracy_score"] = min(validation_result["accuracy_score"], source_score)
        
        # Check logical consistency
        consistency_score = self._check_logical_consistency(weather_data)
        validation_result["accuracy_score"] = min(validation_result["accuracy_score"], consistency_score)
        
        # Determine overall accuracy level
        validation_result["accuracy_level"] = self._get_accuracy_level(validation_result["accuracy_score"])
        
        return validation_result
    
    def _check_data_freshness(self, timestamp: str) -> int:
        """Check how fresh the weather data is"""
        try:
            data_time = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
            current_time = datetime.now(timezone.utc)
            age_minutes = (current_time - data_time).total_seconds() / 60
            
            if age_minutes < 60:  # Less than 1 hour
                return 100
            elif age_minutes < 180:  # Less than 3 hours
                return 85
            elif age_minutes < 720:  # Less than 12 hours
                return 70
            elif age_minutes < 1440:  # Less than 24 hours
                return 50
            else:
                return 20
                
        except Exception as e:
            logger.warning(f"Error checking data freshness: {e}")
            return 50
    
    def _assess_source_reliability(self, source: str) -> int:
        """Assess reliability based on data source"""
        source_scores = {
            "open_meteo": 90,
            "weatherapi": 95,
            "india_regional": 70,
            "us_regional": 70,
            "europe_regional": 70,
            "regional_estimate": 40,
            "emergency_fallback": 10
        }
        return source_scores.get(source, 30)
    
    def _check_logical_consistency(self, weather_data: Dict) -> int:
        """Check logical consistency between weather parameters"""
        score = 100
        
        try:
            # Temperature vs feels like
            if "temperature" in weather_data and "feels_like" in weather_data:
                temp = weather_data["temperature"]
                feels_like = weather_data["feels_like"]
                if abs(temp - feels_like) > 10:
                    score -= 10
            
            # Humidity vs temperature
            if "temperature" in weather_data and "humidity" in weather_data:
                temp = weather_data["temperature"]
                humidity = weather_data["humidity"]
                
                # Very high humidity with very low temperature is unusual
                if temp < -10 and humidity > 90:
                    score -= 5
                
                # Very low humidity with very high temperature might indicate desert conditions
                if temp > 40 and humidity < 10:
                    score -= 5  # This could be valid, but worth noting
            
            # Wind speed vs gusts
            if "wind_speed" in weather_data and "wind_gusts" in weather_data:
                wind_speed = weather_data["wind_speed"]
                gusts = weather_data["wind_gusts"]
                if gusts < wind_speed:
                    score -= 15  # Gusts should be higher than sustained wind
                elif gusts > wind_speed * 3:
                    score -= 10  # Gusts unusually high compared to sustained wind
            
            # Pressure vs weather conditions
            if "pressure" in weather_data and "weather_code" in weather_data:
                pressure = weather_data["pressure"]
                weather_code = weather_data["weather_code"]
                
                # Very low pressure with clear skies is unusual
                if pressure < 980 and weather_code in [0, 1, 2]:
                    score -= 5
        
        except Exception as e:
            logger.warning(f"Error checking logical consistency: {e}")
            score = 50
        
        return max(score, 0)
    
    def _get_accuracy_level(self, score: int) -> str:
        """Convert accuracy score to level"""
        if score >= 90:
            return "very_high"
        elif score >= 75:
            return "high"
        elif score >= 60:
            return "medium"
        elif score >= 40:
            return "low"
        else:
            return "very_low"

class WeatherAccuracyTracker:
    """Tracks weather accuracy over time"""
    
    def __init__(self):
        self.accuracy_history = []
        self.max_history = 100
    
    def record_accuracy(self, location: Tuple[float, float], source: str, accuracy_score: int):
        """Record accuracy for a location and source"""
        record = {
            "location": location,
            "source": source,
            "accuracy_score": accuracy_score,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        
        self.accuracy_history.append(record)
        
        # Keep history size manageable
        if len(self.accuracy_history) > self.max_history:
            self.accuracy_history.pop(0)
    
    def get_source_performance(self) -> Dict[str, Dict]:
        """Get performance metrics by source"""
        source_stats = {}
        
        for record in self.accuracy_history:
            source = record["source"]
            score = record["accuracy_score"]
            
            if source not in source_stats:
                source_stats[source] = {
                    "total_requests": 0,
                    "total_score": 0,
                    "average_score": 0,
                    "high_accuracy_count": 0,
                    "low_accuracy_count": 0
                }
            
            source_stats[source]["total_requests"] += 1
            source_stats[source]["total_score"] += score
            
            if score >= 75:
                source_stats[source]["high_accuracy_count"] += 1
            elif score < 50:
                source_stats[source]["low_accuracy_count"] += 1
        
        # Calculate averages
        for source, stats in source_stats.items():
            if stats["total_requests"] > 0:
                stats["average_score"] = stats["total_score"] / stats["total_requests"]
                stats["high_accuracy_rate"] = stats["high_accuracy_count"] / stats["total_requests"]
                stats["low_accuracy_rate"] = stats["low_accuracy_count"] / stats["total_requests"]
        
        return source_stats

class WeatherDataEnricher:
    """Enriches weather data with additional metadata"""
    
    def __init__(self):
        self.validator = WeatherValidator()
        self.tracker = WeatherAccuracyTracker()
    
    def enrich_weather_data(self, weather_data: Dict, lat: float, lng: float) -> Dict:
        """Enrich weather data with validation and metadata"""
        # Add coordinates
        weather_data["coordinates"] = {"lat": lat, "lng": lng}
        
        # Validate data
        validation_result = self.validator.validate_weather_data(weather_data)
        weather_data["validation"] = validation_result
        
        # Add accuracy indicators
        weather_data["accuracy_indicators"] = {
            "level": validation_result["accuracy_level"],
            "score": validation_result["accuracy_score"],
            "is_fresh": validation_result["accuracy_score"] >= 70,
            "is_reliable": validation_result["accuracy_score"] >= 60
        }
        
        # Add user-friendly messages
        weather_data["user_messages"] = self._generate_user_messages(validation_result)
        
        # Track accuracy
        self.tracker.record_accuracy(
            (lat, lng), 
            weather_data.get("source", "unknown"),
            validation_result["accuracy_score"]
        )
        
        return weather_data
    
    def _generate_user_messages(self, validation_result: Dict) -> List[str]:
        """Generate user-friendly messages based on validation"""
        messages = []
        
        if not validation_result["is_valid"]:
            messages.append("⚠️ Weather data may not be accurate")
        
        if validation_result["accuracy_level"] == "very_high":
            messages.append("✅ Highly accurate weather data")
        elif validation_result["accuracy_level"] == "high":
            messages.append("✓ Accurate weather data")
        elif validation_result["accuracy_level"] == "medium":
            messages.append("ℹ️ Weather data is moderately accurate")
        elif validation_result["accuracy_level"] == "low":
            messages.append("⚠️ Weather data has low accuracy")
        else:
            messages.append("❌ Weather data accuracy is very low")
        
        # Add specific warnings
        for warning in validation_result["warnings"]:
            messages.append(f"⚠️ {warning}")
        
        return messages

# Global instances
weather_validator = WeatherValidator()
weather_enricher = WeatherDataEnricher()
