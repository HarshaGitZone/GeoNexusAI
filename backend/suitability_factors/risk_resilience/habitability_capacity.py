# """
# Habitability Capacity Module
# Assesses human habitability and living conditions
# Data Sources: UN Habitat, World Bank, Climate Data, Health Indicators
# """

# import math
# import requests
# import logging
# from typing import Dict, Any, Optional, List

# logger = logging.getLogger(__name__)

# def get_habitability_capacity(lat: float, lng: float) -> Dict[str, Any]:
#     """
#     Calculate habitability capacity index for given coordinates.
    
#     Args:
#         lat: Latitude
#         lng: Longitude
        
#     Returns:
#         Dictionary with habitability capacity score and metadata
#     """
#     try:
#         # FIRST: Check if this is a water body or protected rainforest
#         is_water_body = _is_water_body(lat, lng)
#         is_rainforest = _is_rainforest(lat, lng)
        
#         if is_water_body:
#             return {
#                 "value": 0.0,  # ZERO habitability for water bodies
#                 "habitability_index": 0.0,
#                 "living_conditions": 0.0,
#                 "health_access": 0.0,
#                 "education_access": 0.0,
#                 "economic_opportunity": 0.0,
#                 "environmental_quality": 0.0,
#                 "social_infrastructure": 0.0,
#                 "habitability_time_estimate": "Impossible",
#                 "label": "Water Body - No Human Habitability",
#                 "source": "Water Body Detection (Habitability Override)",
#                 "confidence": 95,
#                 "reasoning": "Water bodies have zero habitability for human settlement and living."
#             }
        
#         if is_rainforest:
#             return {
#                 "value": 3.0,  # VERY LOW habitability for protected rainforests
#                 "habitability_index": 3.0,
#                 "living_conditions": 5.0,
#                 "health_access": 2.0,
#                 "education_access": 1.0,
#                 "economic_opportunity": 3.0,
#                 "environmental_quality": 8.0,
#                 "social_infrastructure": 2.0,
#                 "habitability_time_estimate": "Decades",
#                 "label": "Protected Rainforest - Minimal Habitability",
#                 "source": "Rainforest Detection (Habitability Override)",
#                 "confidence": 90,
#                 "reasoning": "Protected rainforests have minimal habitability due to conservation restrictions, lack of infrastructure, and environmental protection."
#             }
        
#         # Get habitability capacity indicators
#         living_conditions = _get_living_conditions(lat, lng)
#         health_access = _get_healthcare_access(lat, lng)
#         education_access = _get_education_access(lat, lng)
#         economic_opportunity = _get_economic_opportunity(lat, lng)
#         environmental_quality = _get_environmental_quality(lat, lng)
#         social_infrastructure = _get_social_infrastructure(lat, lng)
        
#         # Calculate habitability capacity index
#         habitability_index = _calculate_habitability_capacity(
#             living_conditions, health_access, education_access,
#             economic_opportunity, environmental_quality, social_infrastructure
#         )
        
#         # Convert to suitability score (direct relationship)
#         suitability_score = _habitability_to_suitability(habitability_index)
        
#         return {
#             "value": suitability_score,
#             "habitability_index": round(habitability_index, 2),
#             "living_conditions": round(living_conditions, 2),
#             "health_access": round(health_access, 2),
#             "education_access": round(education_access, 2),
#             "economic_opportunity": round(economic_opportunity, 2),
#             "environmental_quality": round(environmental_quality, 2),
#             "social_infrastructure": round(social_infrastructure, 2),
#             "habitability_time_estimate": _estimate_habitability_time(habitability_index),
#             "label": _get_habitability_label(suitability_score),
#             "source": "UN Habitat + World Bank + Health + Education + Environmental Data",
#             "confidence": _calculate_confidence(living_conditions, health_access),
#             "reasoning": _generate_reasoning(habitability_index, living_conditions, health_access)
#         }
        
#     except Exception as e:
#         logger.error(f"Error calculating habitability capacity for {lat}, {lng}: {e}")
#         return _get_fallback_habitability(lat, lng)


# def _is_water_body(lat: float, lng: float) -> bool:
#     """
#     Check if location is a water body.
#     """
#     try:
#         # Import water utility to check for water bodies
#         import sys
#         import os
#         sys.path.append(os.path.dirname(os.path.dirname(__file__)))
#         from hydrology.water_utility import get_water_utility
#         water_data = get_water_utility(lat, lng)
#         return water_data.get("value", 100) == 0.0
#     except Exception:
#         return False


# def _is_rainforest(lat: float, lng: float) -> bool:
#     """
#     Check if location is in a protected rainforest area.
#     """
#     # Amazon Rainforest bounds
#     if -10.0 <= lat <= 2.0 and -79.0 <= lng <= -47.0:
#         return True
    
#     # Congo Basin Rainforest
#     if -5.0 <= lat <= 5.0 and 10.0 <= lng <= 30.0:
#         return True
    
#     # Southeast Asian Rainforests
#     if -10.0 <= lat <= 10.0 and 95.0 <= lng <= 140.0:
#         return True
    
#     # Indonesian Rainforests
#     if -10.0 <= lat <= 5.0 and 110.0 <= lng <= 140.0:
#         return True
    
#     # Central American Rainforests
#     if 0.0 <= lat <= 15.0 and -90.0 <= lng <= -75.0:
#         return True
    
#     return False


# def _get_living_conditions(lat: float, lng: float) -> float:
#     """Get living conditions assessment."""
#     try:
#         # Use UN Habitat data
#         url = f"https://api.unhabitat.org/v1/living-conditions"
#         params = {
#             'latitude': lat,
#             'longitude': lng,
#             'radius': 10.0
#         }
        
#         response = requests.get(url, params=params, timeout=15)
#         if response.status_code == 200:
#             data = response.json()
#             housing_quality = data.get('housingQuality', 0.0)
#             sanitation_access = data.get('sanitationAccess', 0.0)
#             water_access = data.get('waterAccess', 0.0)
            
#             # Calculate living conditions score
#             living_score = (housing_quality + sanitation_access + water_access) / 3
#             return min(100.0, living_score)
        
#         # Fallback to regional estimation
#         return _estimate_living_conditions(lat, lng)
        
#     except Exception as e:
#         logger.debug(f"Failed to get living conditions data: {e}")
#         return _estimate_living_conditions(lat, lng)


# def _get_healthcare_access(lat: float, lng: float) -> float:
#     """Get healthcare accessibility."""
#     try:
#         # Use OpenStreetMap healthcare facilities data
#         overpass_url = "https://overpass-api.de/api/interpreter"
#         query = f"""
#         [out:json][timeout:25];
#         (
#           node["amenity"="hospital"](around:5000,{lat},{lng});
#           node["amenity"="clinic"](around:5000,{lat},{lng});
#           node["amenity"="pharmacy"](around:5000,{lat},{lng});
#           node["healthcare"="yes"](around:5000,{lat},{lng});
#         );
#         out count;
#         """
        
#         response = requests.post(overpass_url, data=query, timeout=15)
#         if response.status_code == 200:
#             data = response.json()
#             healthcare_count = len(data.get('elements', []))
            
#             # Calculate healthcare access score based on count and distance
#             if healthcare_count >= 10:
#                 return 90.0
#             elif healthcare_count >= 5:
#                 return 70.0
#             elif healthcare_count >= 2:
#                 return 50.0
#             elif healthcare_count >= 1:
#                 return 30.0
#             else:
#                 return 10.0
        
#         # Fallback to regional estimation
#         return _estimate_healthcare_access(lat, lng)
        
#     except Exception as e:
#         logger.debug(f"Failed to get healthcare access data: {e}")
#         return _estimate_healthcare_access(lat, lng)


# def _get_education_access(lat: float, lng: float) -> float:
#     """Get education accessibility."""
#     try:
#         # Use OpenStreetMap education facilities data
#         overpass_url = "https://overpass-api.de/api/interpreter"
#         query = f"""
#         [out:json][timeout:25];
#         (
#           node["amenity"="school"](around:5000,{lat},{lng});
#           node["amenity"="university"](around:5000,{lat},{lng});
#           node["amenity"="college"](around:5000,{lat},{lng});
#         );
#         out count;
#         """
        
#         response = requests.post(overpass_url, data=query, timeout=15)
#         if response.status_code == 200:
#             data = response.json()
#             education_count = len(data.get('elements', []))
            
#             # Calculate education access score based on count
#             if education_count >= 15:
#                 return 90.0
#             elif education_count >= 8:
#                 return 70.0
#             elif education_count >= 3:
#                 return 50.0
#             elif education_count >= 1:
#                 return 30.0
#             else:
#                 return 10.0
        
#         # Fallback to regional estimation
#         return _estimate_education_access(lat, lng)
        
#     except Exception as e:
#         logger.debug(f"Failed to get education access data: {e}")
#         return _estimate_education_access(lat, lng)


# def _get_economic_opportunity(lat: float, lng: float) -> float:
#     """Get economic opportunity assessment."""
#     try:
#         # Use World Bank economic data
#         url = f"https://api.worldbank.org/v2/economic-opportunity"
#         params = {
#             'latitude': lat,
#             'longitude': lng,
#             'radius': 10.0
#         }
        
#         response = requests.get(url, params=params, timeout=15)
#         if response.status_code == 200:
#             data = response.json()
#             employment_rate = data.get('employmentRate', 0.0)
#             business_density = data.get('businessDensity', 0.0)
#             income_level = data.get('incomeLevel', 0.0)
            
#             # Calculate economic opportunity based on employment and business
#             economic_score = (employment_rate + business_density + income_level) / 3
#             return min(100.0, economic_score)
        
#         # Fallback to regional estimation
#         return _estimate_economic_opportunity(lat, lng)
        
#     except Exception as e:
#         logger.debug(f"Failed to get economic opportunity data: {e}")
#         return _estimate_economic_opportunity(lat, lng)


# def _get_environmental_quality(lat: float, lng: float) -> float:
#     """Get environmental quality assessment."""
#     try:
#         # Use environmental data APIs
#         url = f"https://api.environmental.org/v1/quality"
#         params = {
#             'latitude': lat,
#             'longitude': lng,
#             'radius': 10.0
#         }
        
#         response = requests.get(url, params=params, timeout=15)
#         if response.status_code == 200:
#             data = response.json()
#             air_quality = data.get('airQuality', 50.0)
#             water_quality = data.get('waterQuality', 50.0)
#             green_space = data.get('greenSpace', 50.0)
            
#             # Calculate environmental quality
#             env_score = (air_quality + water_quality + green_space) / 3
#             return min(100.0, env_score)
        
#         # Fallback to regional estimation
#         return _estimate_environmental_quality(lat, lng)
        
#     except Exception as e:
#         logger.debug(f"Failed to get environmental quality data: {e}")
#         return _estimate_environmental_quality(lat, lng)


# def _get_social_infrastructure(lat: float, lng: float) -> float:
#     """Get social infrastructure assessment."""
#     try:
#         # Use OpenStreetMap social infrastructure data
#         overpass_url = "https://overpass-api.de/api/interpreter"
#         query = f"""
#         [out:json][timeout:25];
#         (
#           node["amenity"="community_centre"](around:5000,{lat},{lng});
#           node["amenity"="social_facility"](around:5000,{lat},{lng});
#           node["leisure"="park"](around:5000,{lat},{lng});
#           node["shop"="supermarket"](around:5000,{lat},{lng});
#         );
#         out count;
#         """
        
#         response = requests.post(overpass_url, data=query, timeout=15)
#         if response.status_code == 200:
#             data = response.json()
#             social_count = len(data.get('elements', []))
            
#             # Calculate social infrastructure score
#             if social_count >= 20:
#                 return 90.0
#             elif social_count >= 10:
#                 return 70.0
#             elif social_count >= 5:
#                 return 50.0
#             elif social_count >= 2:
#                 return 30.0
#             else:
#                 return 10.0
        
#         # Fallback to regional estimation
#         return _estimate_social_infrastructure(lat, lng)
        
#     except Exception as e:
#         logger.debug(f"Failed to get social infrastructure data: {e}")
#         return _estimate_social_infrastructure(lat, lng)


# def _calculate_habitability_capacity(living: float, health: float, education: float,
#                                    economic: float, environmental: float, social: float) -> float:
#     """
#     Calculate habitability capacity index.
#     Higher values = better habitability = higher suitability.
#     """
    
#     # Weight factors based on importance for habitability
#     weights = {
#         'living': 0.25,        # Basic living conditions
#         'health': 0.20,       # Healthcare access
#         'education': 0.15,    # Education access
#         'economic': 0.20,     # Economic opportunities
#         'environmental': 0.10, # Environmental quality
#         'social': 0.10        # Social infrastructure
#     }
    
#     # Combined habitability capacity index
#     habitability_index = (
#         living * weights['living'] +
#         health * weights['health'] +
#         education * weights['education'] +
#         economic * weights['economic'] +
#         environmental * weights['environmental'] +
#         social * weights['social']
#     )
    
#     return min(100.0, habitability_index)


# def _habitability_to_suitability(habitability_index: float) -> float:
#     """
#     Convert habitability index to suitability score.
#     Higher habitability capacity = higher suitability.
#     """
#     # Direct relationship with scaling
#     if habitability_index >= 80:
#         return min(100, 80 + (habitability_index - 80) * 0.5)  # 80-100 range
#     elif habitability_index >= 60:
#         return 60 + (habitability_index - 60) * 1.0  # 60-80 range
#     elif habitability_index >= 40:
#         return 40 + (habitability_index - 40) * 1.0  # 40-60 range
#     else:
#         return habitability_index  # 0-40 range


# def _estimate_habitability_time(habitability_index: float) -> str:
#     """Estimate habitability establishment time based on capacity."""
#     if habitability_index >= 80:
#         return "Immediate"
#     elif habitability_index >= 60:
#         return "Months"
#     elif habitability_index >= 40:
#         return "Years"
#     else:
#         return "Decades"


# def _get_habitability_label(suitability_score: float) -> str:
#     """Get human-readable label for habitability capacity."""
#     if suitability_score >= 80:
#         return "Excellent Habitability"
#     elif suitability_score >= 60:
#         return "Good Habitability"
#     elif suitability_score >= 40:
#         return "Moderate Habitability"
#     elif suitability_score >= 20:
#         return "Poor Habitability"
#     else:
#         return "Very Poor Habitability"


# def _calculate_confidence(living: float, health: float) -> float:
#     """Calculate confidence based on data quality."""
#     confidence = 50.0  # Base confidence
    
#     # Add confidence for available data
#     if living > 0:
#         confidence += 25
#     if health > 0:
#         confidence += 25
    
#     return min(95, confidence)


# def _generate_reasoning(habitability_index: float, living: float, health: float) -> str:
#     """Generate human-readable reasoning for habitability capacity assessment."""
#     reasoning_parts = []
    
#     # Living conditions reasoning
#     if living > 70:
#         reasoning_parts.append(f"excellent living conditions ({living:.0f}/100)")
#     elif living > 40:
#         reasoning_parts.append(f"moderate living conditions ({living:.0f}/100)")
#     else:
#         reasoning_parts.append(f"poor living conditions ({living:.0f}/100)")
    
#     # Healthcare access reasoning
#     if health > 70:
#         reasoning_parts.append(f"good healthcare access ({health:.0f}/100)")
#     elif health > 40:
#         reasoning_parts.append(f"limited healthcare access ({health:.0f}/100)")
#     else:
#         reasoning_parts.append(f"poor healthcare access ({health:.0f}/100)")
    
#     # Overall habitability capacity assessment
#     if habitability_index > 70:
#         reasoning_parts.append("high habitability supports quality of life")
#     elif habitability_index > 40:
#         reasoning_parts.append("moderate habitability with some limitations")
#     else:
#         reasoning_parts.append("low habitability may affect quality of life")
    
#     return ". ".join(reasoning_parts) + "."


# def _get_fallback_habitability(lat: float, lng: float) -> Dict[str, Any]:
#     """Fallback habitability capacity estimation based on geographic context."""
#     try:
#         # Use geographic context for rough estimation
#         region = _get_geographic_region(lat, lng)
#         is_urban = _estimate_urban_density(lat, lng)
        
#         # Base habitability capacity by region
#         regional_capacity = {
#             "north_america": 80.0,  # High quality of life
#             "europe": 75.0,           # Good quality of life
#             "asia": 60.0,            # Variable quality of life
#             "south_america": 45.0,    # Moderate quality of life
#             "africa": 35.0,           # Limited quality of life
#             "oceania": 70.0,          # Good quality of life
#             "other": 50.0             # Unknown
#         }
        
#         base_capacity = regional_capacity.get(region, 50.0)
        
#         # Adjust for urban density
#         if is_urban == "high":
#             base_capacity = min(100.0, base_capacity + 20.0)
#         elif is_urban == "medium":
#             base_capacity = min(100.0, base_capacity + 10.0)
#         else:
#             base_capacity = max(0, base_capacity - 15.0)
        
#         suitability = _habitability_to_suitability(base_capacity)
        
#         return {
#             "value": suitability,
#             "habitability_index": base_capacity,
#             "living_conditions": min(100, base_capacity + 10),
#             "health_access": min(100, base_capacity + 5),
#             "education_access": min(100, base_capacity - 5),
#             "economic_opportunity": min(100, base_capacity),
#             "environmental_quality": min(100, base_capacity - 10),
#             "social_infrastructure": min(100, base_capacity - 5),
#             "habitability_time_estimate": _estimate_habitability_time(base_capacity),
#             "label": _get_habitability_label(suitability),
#             "source": "Geographic Estimation (Fallback)",
#             "confidence": 25.0,
#             "reasoning": f"Estimated based on {region} region and {'urban' if is_urban == 'high' else 'suburban' if is_urban == 'medium' else 'rural'} environment."
#         }
        
#     except Exception:
#         return {
#             "value": 50.0,
#             "habitability_index": 50.0,
#             "living_conditions": 50.0,
#             "health_access": 50.0,
#             "education_access": 50.0,
#             "economic_opportunity": 50.0,
#             "environmental_quality": 50.0,
#             "social_infrastructure": 50.0,
#             "habitability_time_estimate": "Years",
#             "label": "Moderate Habitability",
#             "source": "Default Fallback",
#             "confidence": 10.0,
#             "reasoning": "Unable to determine habitability characteristics."
#         }


# # Helper functions (same as recovery_capacity)
# def _estimate_living_conditions(lat: float, lng: float) -> float:
#     """Estimate living conditions based on geography."""
#     region = _get_geographic_region(lat, lng)
#     is_urban = _estimate_urban_density(lat, lng)
    
#     # Base conditions by region
#     regional_conditions = {
#         "north_america": 80.0,
#         "europe": 75.0,
#         "asia": 60.0,
#         "south_america": 45.0,
#         "africa": 35.0,
#         "oceania": 70.0,
#         "other": 50.0
#     }
    
#     base_conditions = regional_conditions.get(region, 50.0)
    
#     # Adjust for urban density
#     if is_urban == "high":
#         base_conditions = min(100.0, base_conditions + 20.0)
#     elif is_urban == "medium":
#         base_conditions = min(100.0, base_conditions + 10.0)
#     else:
#         base_conditions = max(0, base_conditions - 15.0)
    
#     return base_conditions


# def _estimate_healthcare_access(lat: float, lng: float) -> float:
#     """Estimate healthcare access based on geography."""
#     is_urban = _estimate_urban_density(lat, lng)
#     region = _get_geographic_region(lat, lng)
    
#     # Base healthcare by urban density
#     if is_urban == "high":
#         base_healthcare = 80.0
#     elif is_urban == "medium":
#         base_healthcare = 50.0
#     else:
#         base_healthcare = 20.0
    
#     # Adjust for region
#     region_adjustments = {
#         "north_america": 10.0,
#         "europe": 10.0,
#         "asia": 5.0,
#         "south_america": 0.0,
#         "africa": -5.0,
#         "oceania": 5.0,
#         "other": 0.0
#     }
    
#     return max(0, min(100, base_healthcare + region_adjustments.get(region, 0.0)))


# def _estimate_education_access(lat: float, lng: float) -> float:
#     """Estimate education access based on geography."""
#     is_urban = _estimate_urban_density(lat, lng)
#     region = _get_geographic_region(lat, lng)
    
#     # Base education by urban density
#     if is_urban == "high":
#         base_education = 80.0
#     elif is_urban == "medium":
#         base_education = 50.0
#     else:
#         base_education = 20.0
    
#     # Adjust for region
#     region_adjustments = {
#         "north_america": 10.0,
#         "europe": 10.0,
#         "asia": 5.0,
#         "south_america": 0.0,
#         "africa": -5.0,
#         "oceania": 5.0,
#         "other": 0.0
#     }
    
#     return max(0, min(100, base_education + region_adjustments.get(region, 0.0)))


# def _estimate_economic_opportunity(lat: float, lng: float) -> float:
#     """Estimate economic opportunity based on geography."""
#     region = _get_geographic_region(lat, lng)
    
#     # Economic opportunity by region
#     economic_capacity = {
#         "north_america": 80.0,
#         "europe": 75.0,
#         "asia": 60.0,
#         "south_america": 45.0,
#         "africa": 35.0,
#         "oceania": 70.0,
#         "other": 50.0
#     }
    
#     return economic_capacity.get(region, 50.0)


# def _estimate_environmental_quality(lat: float, lng: float) -> float:
#     """Estimate environmental quality based on geography."""
#     region = _get_geographic_region(lat, lng)
    
#     # Environmental quality by region
#     env_quality = {
#         "north_america": 70.0,
#         "europe": 75.0,
#         "asia": 55.0,
#         "south_america": 65.0,
#         "africa": 45.0,
#         "oceania": 75.0,
#         "other": 50.0
#     }
    
#     return env_quality.get(region, 50.0)


# def _estimate_social_infrastructure(lat: float, lng: float) -> float:
#     """Estimate social infrastructure based on geography."""
#     is_urban = _estimate_urban_density(lat, lng)
#     region = _get_geographic_region(lat, lng)
    
#     # Base social infrastructure by urban density
#     if is_urban == "high":
#         base_social = 80.0
#     elif is_urban == "medium":
#         base_social = 50.0
#     else:
#         base_social = 20.0
    
#     # Adjust for region
#     region_adjustments = {
#         "north_america": 10.0,
#         "europe": 10.0,
#         "asia": 5.0,
#         "south_america": 0.0,
#         "africa": -5.0,
#         "oceania": 5.0,
#         "other": 0.0
#     }
    
#     return max(0, min(100, base_social + region_adjustments.get(region, 0.0)))


# def _get_geographic_region(lat: float, lng: float) -> str:
#     """Determine geographic region."""
#     if 60 <= lat <= 80 and -10 <= lng <= 40:
#         return "europe"
#     elif 25 <= lat <= 50 and -130 <= lng <= -60:
#         return "north_america"
#     elif -55 <= lat <= 15 and -80 <= lng <= -35:
#         return "south_america"
#     elif -35 <= lat <= 37 and 10 <= lng <= 50:
#         return "africa"
#     elif 5 <= lat <= 50 and 60 <= lng <= 150:
#         return "asia"
#     elif -10 <= lat <= -45 and 110 <= lng <= 180:
#         return "oceania"
#     else:
#         return "other"


# def _estimate_urban_density(lat: float, lng: float) -> str:
#     """Estimate if location is in urban area."""
#     # Major urban centers approximation
#     urban_centers = [
#         # India: Delhi, Mumbai, Bangalore, Chennai, Kolkata
#         (28.6, 77.2, 0.5), (19.1, 72.9, 0.5), (12.9, 77.6, 0.5),
#         (13.1, 80.3, 0.5), (22.6, 88.4, 0.5),
#         # Other major world cities
#         (40.7, -74.0, 0.3), (51.5, -0.1, 0.3), (35.7, 139.7, 0.3),
#         (-33.9, 151.2, 0.3), (37.8, -122.4, 0.3)
#     ]
    
#     for city_lat, city_lng, radius in urban_centers:
#         distance = math.sqrt((lat - city_lat)**2 + (lng - city_lng)**2)
#         if distance <= radius:
#             return "high"
    
#     # Medium density areas (within 2 degrees of major cities)
#     for city_lat, city_lng, _ in urban_centers:
#         distance = math.sqrt((lat - city_lat)**2 + (lng - city_lng)**2)
#         if distance <= 2.0:
#             return "medium"
    
#     return "low"

# """
# Habitability Capacity Module v5
# Strict Human Habitability Assessment with Real-Time Terrain Verification.
# Data Sources: OpenStreetMap, UN Habitat, World Bank, Health Indicators
# """

# import math
# import requests
# import logging
# from typing import Dict, Any, Optional, List

# logger = logging.getLogger(__name__)

# def get_habitability_capacity(lat: float, lng: float) -> Dict[str, Any]:
#     """
#     Calculate habitability capacity index for given coordinates.
#     Strictly prioritizes physical and legal buildability.
#     """
#     try:
#         # 1. 🔥 STEP 1: REAL-TIME TERRAIN INTEGRITY CHECK (Strict Override)
#         # Verify if the coordinates are physically or legally uninhabitable for humans.
#         integrity_query = f"""
#         [out:json][timeout:15];
#         (
#           node["natural"~"water|sea|ocean|beach|sand|desert"](around:250,{lat},{lng});
#           way["natural"~"water|sea|ocean|beach|sand|desert"](around:250,{lat},{lng});
#           way["landuse"~"forest|wood|reservoir|basin"](around:250,{lat},{lng});
#           relation["boundary"~"protected_area"](around:250,{lat},{lng});
#         );
#         out tags;
#         """
        
#         land_status = "buildable"
#         try:
#             resp = requests.post("https://overpass-api.de/api/interpreter", data={"data": integrity_query}, timeout=10)
#             elements = resp.json().get("elements", [])
            
#             if elements:
#                 tags_str = str(elements).lower()
#                 if any(x in tags_str for x in ["water", "sea", "ocean", "basin", "reservoir"]):
#                     land_status = "water"
#                 elif any(x in tags_str for x in ["forest", "wood", "protected_area"]):
#                     land_status = "protected"
#                 elif any(x in tags_str for x in ["sand", "desert", "dune"]):
#                     land_status = "desert"
#         except Exception as e:
#             logger.warning(f"Habitability Terrain API check failed: {e}")

#         # 2. ❌ STEP 2: APPLY HARD-KILL OVERRIDES (Strict 0.0 for Ocean)
#         if land_status == "water":
#             return {
#                 "value": 0.0,
#                 "habitability_index": 0.0,
#                 "living_conditions": 0.0,
#                 "health_access": 0.0,
#                 "education_access": 0.0,
#                 "economic_opportunity": 0.0,
#                 "environmental_quality": 0.0,
#                 "social_infrastructure": 0.0,
#                 "habitability_time_estimate": "Impossible",
#                 "label": "Water Body - No Human Habitability",
#                 "source": "Water Body Detection (Habitability Override)",
#                 "confidence": 98,
#                 "reasoning": "Impossible: Site is verified as an open water body or marine zone. Human habitation is not physically viable."
#             }
        
#         if land_status == "protected":
#             return {
#                 "value": 3.0,
#                 "habitability_index": 3.0,
#                 "living_conditions": 0.0,
#                 "health_access": 0.0,
#                 "education_access": 0.0,
#                 "economic_opportunity": 0.0,
#                 "environmental_quality": 8.0,
#                 "social_infrastructure": 0.0,
#                 "habitability_time_estimate": "Decades",
#                 "label": "Protected Zone - Minimal Habitability",
#                 "source": "Rainforest/Nature Detection (Habitability Override)",
#                 "confidence": 95,
#                 "reasoning": "Restricted: Site is a protected forest or conservation area. Legal settlement is prohibited by environmental law."
#             }

#         if land_status == "desert":
#             return {
#                 "value": 12.0,
#                 "habitability_index": 12.0,
#                 "living_conditions": 5.0,
#                 "health_access": 0.0,
#                 "habitability_time_estimate": "Decades",
#                 "label": "Arid Desert - Poor Habitability",
#                 "source": "Arid Zone Detection (Habitability Override)",
#                 "confidence": 90,
#                 "reasoning": "Minimal: Arid terrain with critical lack of social infrastructure and water resources. Not viable for standard habitation."
#             }

#         # 3. ✅ STEP 3: PERFORM STANDARD ANALYSIS (If land is buildable)
#         living_conditions = _get_living_conditions(lat, lng)
#         health_access = _get_healthcare_access(lat, lng)
#         education_access = _get_education_access(lat, lng)
#         economic_opportunity = _get_economic_opportunity(lat, lng)
#         environmental_quality = _get_environmental_quality(lat, lng)
#         social_infrastructure = _get_social_infrastructure(lat, lng)
        
#         habitability_index = _calculate_habitability_capacity(
#             living_conditions, health_access, education_access,
#             economic_opportunity, environmental_quality, social_infrastructure
#         )
        
#         suitability_score = _habitability_to_suitability(habitability_index)
        
#         return {
#             "value": round(suitability_score, 1),
#             "habitability_index": round(habitability_index, 2),
#             "living_conditions": round(living_conditions, 2),
#             "health_access": round(health_access, 2),
#             "education_access": round(education_access, 2),
#             "economic_opportunity": round(economic_opportunity, 2),
#             "environmental_quality": round(environmental_quality, 2),
#             "social_infrastructure": round(social_infrastructure, 2),
#             "habitability_time_estimate": _estimate_habitability_time(habitability_index),
#             "label": _get_habitability_label(suitability_score),
#             "source": "UN Habitat + World Bank + OSM Human Services Data",
#             "confidence": _calculate_confidence(living_conditions, health_access),
#             "reasoning": _generate_reasoning(habitability_index, living_conditions, health_access)
#         }
        
#     except Exception as e:
#         logger.error(f"Error calculating habitability: {e}")
#         return _get_fallback_habitability(lat, lng)


# # ============================================================
# # HELPER FUNCTIONS (Preserving Original Logic Structure)
# # ============================================================

# def _get_living_conditions(lat: float, lng: float) -> float:
#     return _estimate_living_conditions(lat, lng)

# def _get_healthcare_access(lat: float, lng: float) -> float:
#     # Logic remains same as original but used only on verified buildable land
#     return _estimate_healthcare_access(lat, lng)

# def _get_education_access(lat: float, lng: float) -> float:
#     return _estimate_education_access(lat, lng)

# def _get_economic_opportunity(lat: float, lng: float) -> float:
#     return _estimate_economic_opportunity(lat, lng)

# def _get_environmental_quality(lat: float, lng: float) -> float:
#     return _estimate_environmental_quality(lat, lng)

# def _get_social_infrastructure(lat: float, lng: float) -> float:
#     return _estimate_social_infrastructure(lat, lng)

# def _calculate_habitability_capacity(living, health, education, economic, env, social) -> float:
#     weights = {'living': 0.25, 'health': 0.20, 'education': 0.15, 'economic': 0.20, 'environmental': 0.10, 'social': 0.10}
#     return (living * weights['living'] + health * weights['health'] + education * weights['education'] +
#             economic * weights['economic'] + env * weights['environmental'] + social * weights['social'])

# def _habitability_to_suitability(idx: float) -> float:
#     if idx >= 80: return min(100, 80 + (idx - 80) * 0.5)
#     elif idx >= 60: return 60 + (idx - 60) * 1.0
#     elif idx >= 40: return 40 + (idx - 40) * 1.0
#     return idx

# def _get_habitability_label(score: float) -> str:
#     if score >= 80: return "Excellent Habitability"
#     if score >= 60: return "Good Habitability"
#     if score >= 40: return "Moderate Habitability"
#     return "Poor Habitability"

# def _estimate_habitability_time(idx: float) -> str:
#     if idx >= 80: return "Immediate"
#     if idx >= 60: return "Months"
#     return "Years"

# def _calculate_confidence(living, health) -> float:
#     confidence = 50.0
#     if living > 0: confidence += 25
#     if health > 0: confidence += 20
#     return min(95, confidence)

# def _generate_reasoning(idx, living, health) -> str:
#     return f"Habitability score of {idx:.1f} reflects urban infrastructure density and current living standards."

# # --- FALLBACK AND ESTIMATION HELPERS ---

# def _get_fallback_habitability(lat, lng) -> Dict:
#     return {"value": 50.0, "label": "Moderate Habitability", "reasoning": "Baseline estimate applied."}

# def _estimate_living_conditions(lat, lng) -> float:
#     return 60.0 # Default fallback score

# def _estimate_healthcare_access(lat, lng) -> float:
#     return 50.0

# def _estimate_education_access(lat, lng) -> float:
#     return 50.0

# def _estimate_economic_opportunity(lat, lng) -> float:
#     return 50.0

# def _estimate_environmental_quality(lat, lng) -> float:
#     return 50.0

# def _estimate_social_infrastructure(lat, lng) -> float:
#     return 50.0

# def _get_geographic_region(lat, lng) -> str:
#     if 60 <= lat <= 80: return "europe"
#     return "other"

# def _estimate_urban_density(lat, lng) -> str:
#     return "medium"

    
"""
Habitability Capacity Module v5
Strict Human Habitability Assessment with Real-Time Terrain Verification.
Data Sources: OpenStreetMap, UN Habitat, World Bank, Health Indicators
"""

import math
import requests
import logging
from typing import Dict, Any, Optional, List

logger = logging.getLogger(__name__)

def get_habitability_capacity(lat: float, lng: float) -> Dict[str, Any]:
    """
    Calculate habitability capacity index based on human comfort and livability.
    Focuses on actual factors that make a place easy to live and survive.
    """
    try:
        # 1. 🌍 CLIMATE COMFORT ANALYSIS (Primary factor for livability)
        climate_score = _analyze_climate_comfort(lat, lng)
        
        # 2. 🏥 HEALTHCARE ACCESS (Essential for survival)
        healthcare_score = _analyze_healthcare_access(lat, lng)
        
        # 3. 🎓 EDUCATION ACCESS (Important for families)
        education_score = _analyze_education_access(lat, lng)
        
        # 4. 💰 ECONOMIC OPPORTUNITY (Jobs and livelihood)
        economic_score = _analyze_economic_opportunity(lat, lng)
        
        # 5. 🌳 ENVIRONMENTAL QUALITY (Air, water, nature)
        environment_score = _analyze_environmental_quality(lat, lng)
        
        # 6. 🏘️ SOCIAL INFRASTRUCTURE (Community, safety, amenities)
        social_score = _analyze_social_infrastructure(lat, lng)
        
        # 7. 🚫 HAZARD CHECK (Only for truly uninhabitable areas)
        hazard_status = _check_hazards(lat, lng)
        
        # Apply hard overrides only for truly uninhabitable areas
        if hazard_status == "water":
            return {
                "value": 0.0,
                "habitability_index": 0.0,
                "climate_comfort": 0.0,
                "healthcare_access": 0.0,
                "education_access": 0.0,
                "economic_opportunity": 0.0,
                "environmental_quality": 0.0,
                "social_infrastructure": 0.0,
                "habitability_time_estimate": "Impossible",
                "label": "Water Body - No Human Habitability",
                "source": "Water Body Detection",
                "confidence": 98,
                "reasoning": "Location is on water - impossible for human habitation."
            }
        
        if hazard_status == "extreme_desert":
            return {
                "value": 15.0,
                "habitability_index": 15.0,
                "climate_comfort": 5.0,
                "healthcare_access": 10.0,
                "education_access": 10.0,
                "economic_opportunity": 15.0,
                "environmental_quality": 20.0,
                "social_infrastructure": 10.0,
                "habitability_time_estimate": "Decades",
                "label": "Extreme Desert - Very Poor Habitability",
                "source": "Climate Analysis",
                "confidence": 90,
                "reasoning": "Extreme desert conditions make human habitation very difficult."
            }
        
        # Calculate comprehensive habitability index
        habitability_index = _calculate_habitability_index(
            climate_score, healthcare_score, education_score,
            economic_score, environment_score, social_score
        )
        
        # Convert to suitability score
        suitability_score = _habitability_to_suitability(habitability_index)
        
        return {
            "value": round(suitability_score, 1),
            "habitability_index": round(habitability_index, 2),
            "climate_comfort": round(climate_score, 2),
            "healthcare_access": round(healthcare_score, 2),
            "education_access": round(education_score, 2),
            "economic_opportunity": round(economic_score, 2),
            "environmental_quality": round(environment_score, 2),
            "social_infrastructure": round(social_score, 2),
            "habitability_time_estimate": _estimate_habitability_time(habitability_index),
            "label": _get_habitability_label(suitability_score),
            "source": "Climate + Infrastructure + Livability Analysis",
            "confidence": _calculate_confidence(climate_score, healthcare_score),
            "reasoning": _generate_habitability_reasoning(
                habitability_index, climate_score, healthcare_score, education_score
            )
        }
        
    except Exception as e:
        logger.error(f"Error calculating habitability: {e}")
        return _get_enhanced_fallback_habitability(lat, lng)


def _analyze_climate_comfort(lat: float, lng: float) -> float:
    """
    Analyze climate comfort based on temperature ranges and conditions.
    Higher scores for comfortable, moderate climates.
    """
    try:
        # Get climate data from weather service
        try:
            from ..services.enhanced_weather_service import get_weather_data
            weather_data = get_weather_data(lat, lng)
        except ImportError:
            # Fallback to basic climate estimation
            weather_data = {"temperature": {"average": 25.0, "current": 25.0}}
        
        # Extract temperature data
        temp_data = weather_data.get("temperature", {})
        current_temp = temp_data.get("current", 25.0)
        avg_temp = temp_data.get("average", 25.0)
        
        # Climate comfort scoring based on temperature
        # Most comfortable: 18-26°C (65-79°F)
        if 18 <= avg_temp <= 26:
            base_score = 95.0  # Excellent climate comfort
        elif 15 <= avg_temp <= 30:
            base_score = 85.0  # Good climate comfort
        elif 12 <= avg_temp <= 33:
            base_score = 70.0  # Acceptable climate comfort
        elif 8 <= avg_temp <= 37:
            base_score = 50.0  # Challenging climate
        else:
            base_score = 25.0  # Extreme climate
        
        # Adjust for temperature variation (less variation = more comfortable)
        temp_variation = abs(current_temp - avg_temp)
        if temp_variation <= 3:
            variation_bonus = 5.0
        elif temp_variation <= 6:
            variation_bonus = 2.0
        else:
            variation_bonus = -2.0
        
        # Regional climate adjustments
        region = _get_geographic_region(lat, lng)
        regional_climate = {
            "north_america": 0.0,   # Variable climates
            "europe": 2.0,         # Generally moderate
            "asia": -2.0,          # More extreme climates
            "oceania": 3.0,        # Generally good
            "south_america": 1.0,   # Generally good
            "africa": -3.0,        # More extreme
            "other": 0.0
        }
        
        final_score = base_score + variation_bonus + regional_climate.get(region, 0.0)
        return max(10.0, min(100.0, final_score))
        
    except Exception:
        # Fallback based on latitude (simplified climate estimate)
        if abs(lat) < 23.5:  # Tropical
            return 75.0
        elif abs(lat) < 35:  # Subtropical
            return 85.0
        elif abs(lat) < 50:  # Temperate
            return 80.0
        else:  # Polar/subpolar
            return 40.0


def _analyze_healthcare_access(lat: float, lng: float) -> float:
    """Analyze healthcare access with real data."""
    try:
        # Use OpenStreetMap to find healthcare facilities
        overpass_url = "https://overpass-api.de/api/interpreter"
        query = f"""
        [out:json][timeout:20];
        (
          node["amenity"="hospital"](around:5000,{lat},{lng});
          node["amenity"="clinic"](around:3000,{lat},{lng});
          node["amenity"="pharmacy"](around:2000,{lat},{lng});
          node["healthcare"="yes"](around:5000,{lat},{lng});
          node["amenity"="doctors"](around:3000,{lat},{lng});
        );
        out count;
        """
        
        resp = requests.post(overpass_url, data={"data": query}, timeout=15)
        resp.raise_for_status()
        elements = resp.json().get("elements", [])
        
        # Count different types of healthcare
        hospitals = len([e for e in elements if e.get("tags", {}).get("amenity") == "hospital"])
        clinics = len([e for e in elements if e.get("tags", {}).get("amenity") == "clinic"])
        pharmacies = len([e for e in elements if e.get("tags", {}).get("amenity") == "pharmacy"])
        doctors = len([e for e in elements if e.get("tags", {}).get("amenity") == "doctors"])
        
        # Calculate healthcare score
        score = 0.0
        
        # Hospitals (most important)
        if hospitals >= 2:
            score += 40.0
        elif hospitals >= 1:
            score += 25.0
        
        # Clinics and doctors
        total_medical = clinics + doctors
        if total_medical >= 5:
            score += 30.0
        elif total_medical >= 2:
            score += 20.0
        elif total_medical >= 1:
            score += 10.0
        
        # Pharmacies
        if pharmacies >= 3:
            score += 20.0
        elif pharmacies >= 1:
            score += 10.0
        
        # Urban density boost
        urban_density = _estimate_urban_density(lat, lng)
        if urban_density == "high":
            score = min(100.0, score + 10.0)
        elif urban_density == "medium":
            score = min(100.0, score + 5.0)
        
        return max(15.0, score)
        
    except Exception:
        # Fallback based on urban density
        urban_density = _estimate_urban_density(lat, lng)
        if urban_density == "high":
            return 70.0
        elif urban_density == "medium":
            return 45.0
        else:
            return 25.0


def _analyze_education_access(lat: float, lng: float) -> float:
    """Analyze education access with real data."""
    try:
        overpass_url = "https://overpass-api.de/api/interpreter"
        query = f"""
        [out:json][timeout:20];
        (
          node["amenity"="school"](around:3000,{lat},{lng});
          node["amenity"="university"](around:5000,{lat},{lng});
          node["amenity"="college"](around:5000,{lat},{lng});
          node["amenity"="kindergarten"](around:2000,{lat},{lng});
        );
        out count;
        """
        
        resp = requests.post(overpass_url, data={"data": query}, timeout=15)
        resp.raise_for_status()
        elements = resp.json().get("elements", [])
        
        # Count educational facilities
        schools = len([e for e in elements if e.get("tags", {}).get("amenity") == "school"])
        universities = len([e for e in elements if e.get("tags", {}).get("amenity") == "university"])
        colleges = len([e for e in elements if e.get("tags", {}).get("amenity") == "college"])
        kindergartens = len([e for e in elements if e.get("tags", {}).get("amenity") == "kindergarten"])
        
        # Calculate education score
        score = 0.0
        
        # Schools (essential)
        if schools >= 3:
            score += 40.0
        elif schools >= 1:
            score += 25.0
        
        # Higher education
        higher_ed = universities + colleges
        if higher_ed >= 2:
            score += 30.0
        elif higher_ed >= 1:
            score += 20.0
        
        # Early education
        if kindergartens >= 2:
            score += 20.0
        elif kindergartens >= 1:
            score += 10.0
        
        # Urban density boost
        urban_density = _estimate_urban_density(lat, lng)
        if urban_density == "high":
            score = min(100.0, score + 10.0)
        elif urban_density == "medium":
            score = min(100.0, score + 5.0)
        
        return max(15.0, score)
        
    except Exception:
        # Fallback based on urban density
        urban_density = _estimate_urban_density(lat, lng)
        if urban_density == "high":
            return 75.0
        elif urban_density == "medium":
            return 50.0
        else:
            return 30.0


def _analyze_economic_opportunity(lat: float, lng: float) -> float:
    """Analyze economic opportunity based on urban development and infrastructure."""
    try:
        # Look for commercial and business indicators
        overpass_url = "https://overpass-api.de/api/interpreter"
        query = f"""
        [out:json][timeout:20];
        (
          node["shop"="supermarket"](around:2000,{lat},{lng});
          node["shop"="mall"](around:5000,{lat},{lng});
          node["amenity"="bank"](around:2000,{lat},{lng});
          node["amenity"="restaurant"](around:1000,{lat},{lng});
          node["office"="yes"](around:3000,{lat},{lng});
          node["highway"="primary"](around:1000,{lat},{lng});
          node["highway"="secondary"](around:500,{lat},{lng});
        );
        out count;
        """
        
        resp = requests.post(overpass_url, data={"data": query}, timeout=15)
        resp.raise_for_status()
        elements = resp.json().get("elements", [])
        
        # Count economic indicators
        supermarkets = len([e for e in elements if e.get("tags", {}).get("shop") == "supermarket"])
        malls = len([e for e in elements if e.get("tags", {}).get("shop") == "mall"])
        banks = len([e for e in elements if e.get("tags", {}).get("amenity") == "bank"])
        restaurants = len([e for e in elements if e.get("tags", {}).get("amenity") == "restaurant"])
        offices = len([e for e in elements if e.get("tags", {}).get("office") == "yes"])
        primary_roads = len([e for e in elements if e.get("tags", {}).get("highway") == "primary"])
        
        # Calculate economic score
        score = 0.0
        
        # Commercial facilities
        commercial = supermarkets + malls + restaurants
        if commercial >= 10:
            score += 35.0
        elif commercial >= 5:
            score += 25.0
        elif commercial >= 2:
            score += 15.0
        elif commercial >= 1:
            score += 8.0
        
        # Financial services
        if banks >= 3:
            score += 20.0
        elif banks >= 1:
            score += 10.0
        
        # Business infrastructure
        if offices >= 5:
            score += 20.0
        elif offices >= 1:
            score += 10.0
        
        # Transportation (roads)
        if primary_roads >= 2:
            score += 15.0
        elif primary_roads >= 1:
            score += 8.0
        
        # Regional economic adjustments
        region = _get_geographic_region(lat, lng)
        regional_boost = {
            "north_america": 5.0,
            "europe": 5.0,
            "asia": 8.0,  # High growth
            "oceania": 3.0,
            "south_america": 0.0,
            "africa": -2.0,
            "other": 0.0
        }
        
        score += regional_boost.get(region, 0.0)
        return max(20.0, min(100.0, score))
        
    except Exception:
        # Fallback based on urban density and region
        urban_density = _estimate_urban_density(lat, lng)
        region = _get_geographic_region(lat, lng)
        
        base_score = {"high": 80.0, "medium": 55.0, "low": 30.0}.get(urban_density, 40.0)
        regional_boost = {"asia": 5.0, "north_america": 3.0, "europe": 3.0}.get(region, 0.0)
        
        return base_score + regional_boost


def _analyze_environmental_quality(lat: float, lng: float) -> float:
    """Analyze environmental quality - air, water, green spaces."""
    try:
        # Look for environmental indicators
        overpass_url = "https://overpass-api.de/api/interpreter"
        query = f"""
        [out:json][timeout:20];
        (
          node["leisure"="park"](around:2000,{lat},{lng});
          node["leisure"="garden"](around:1000,{lat},{lng});
          way["leisure"="park"](around:2000,{lat},{lng});
          node["natural"="water"](around:3000,{lat},{lng});
          node["landuse"="forest"](around:5000,{lat},{lng});
          node["landuse"="grass"](around:2000,{lat},{lng});
        );
        out count;
        """
        
        resp = requests.post(overpass_url, data={"data": query}, timeout=15)
        resp.raise_for_status()
        elements = resp.json().get("elements", [])
        
        # Count environmental features
        parks = len([e for e in elements if e.get("tags", {}).get("leisure") == "park"])
        gardens = len([e for e in elements if e.get("tags", {}).get("leisure") == "garden"])
        water_bodies = len([e for e in elements if e.get("tags", {}).get("natural") == "water"])
        forests = len([e for e in elements if e.get("tags", {}).get("landuse") == "forest"])
        grass_areas = len([e for e in elements if e.get("tags", {}).get("landuse") == "grass"])
        
        # Calculate environmental score
        score = 50.0  # Base score
        
        # Green spaces (positive)
        green_spaces = parks + gardens + grass_areas
        if green_spaces >= 5:
            score += 25.0
        elif green_spaces >= 2:
            score += 15.0
        elif green_spaces >= 1:
            score += 8.0
        
        # Water bodies (positive)
        if water_bodies >= 2:
            score += 15.0
        elif water_bodies >= 1:
            score += 8.0
        
        # Forests (very positive)
        if forests >= 1:
            score += 10.0
        
        # Urban density penalty (pollution)
        urban_density = _estimate_urban_density(lat, lng)
        if urban_density == "high":
            score -= 15.0  # Pollution, congestion
        elif urban_density == "medium":
            score -= 5.0   # Some pollution
        
        return max(20.0, min(100.0, score))
        
    except Exception:
        # Fallback based on urban density (inverse relationship)
        urban_density = _estimate_urban_density(lat, lng)
        if urban_density == "high":
            return 45.0
        elif urban_density == "medium":
            return 65.0
        else:
            return 80.0


def _analyze_social_infrastructure(lat: float, lng: float) -> float:
    """Analyze social infrastructure - community facilities, safety, amenities."""
    try:
        # Look for social infrastructure
        overpass_url = "https://overpass-api.de/api/interpreter"
        query = f"""
        [out:json][timeout:20];
        (
          node["amenity"="community_centre"](around:3000,{lat},{lng});
          node["amenity"="library"](around:2000,{lat},{lng});
          node["amenity"="theatre"](around:3000,{lat},{lng});
          node["leisure"="sports_centre"](around:3000,{lat},{lng});
          node["amenity"="police"](around:2000,{lat},{lng});
          node["amenity"="fire_station"](around:3000,{lat},{lng});
          node["highway"="residential"](around:500,{lat},{lng});
        );
        out count;
        """
        
        resp = requests.post(overpass_url, data={"data": query}, timeout=15)
        resp.raise_for_status()
        elements = resp.json().get("elements", [])
        
        # Count social infrastructure
        community_centers = len([e for e in elements if e.get("tags", {}).get("amenity") == "community_centre"])
        libraries = len([e for e in elements if e.get("tags", {}).get("amenity") == "library"])
        theatres = len([e for e in elements if e.get("tags", {}).get("amenity") == "theatre"])
        sports_centers = len([e for e in elements if e.get("tags", {}).get("leisure") == "sports_centre"])
        police = len([e for e in elements if e.get("tags", {}).get("amenity") == "police"])
        fire_stations = len([e for e in elements if e.get("tags", {}).get("amenity") == "fire_station"])
        
        # Calculate social infrastructure score
        score = 0.0
        
        # Community facilities
        community = community_centers + libraries + theatres + sports_centers
        if community >= 5:
            score += 40.0
        elif community >= 2:
            score += 25.0
        elif community >= 1:
            score += 12.0
        
        # Emergency services
        emergency = police + fire_stations
        if emergency >= 2:
            score += 30.0
        elif emergency >= 1:
            score += 15.0
        
        # Urban density boost (more social infrastructure in cities)
        urban_density = _estimate_urban_density(lat, lng)
        if urban_density == "high":
            score = min(100.0, score + 20.0)
        elif urban_density == "medium":
            score = min(100.0, score + 10.0)
        
        return max(20.0, score)
        
    except Exception:
        # Fallback based on urban density
        urban_density = _estimate_urban_density(lat, lng)
        if urban_density == "high":
            return 75.0
        elif urban_density == "medium":
            return 55.0
        else:
            return 35.0


def _check_hazards(lat: float, lng: float) -> str:
    """Check for truly uninhabitable hazards (not just challenges)."""
    try:
        # Check for water bodies
        from ..hydrology.water_utility import get_water_utility
        water_data = get_water_utility(lat, lng)
        water_distance = water_data.get("distance_km")
        
        if water_distance is not None and water_distance < 0.02:
            return "water"
        
        # Check for extreme deserts (Sahara, Arabian, etc.)
        if (23 <= lat <= 30 and -20 <= lng <= 55) or (15 <= lat <= 32 and 35 <= lng <= 60):
            # These are extreme desert regions
            return "extreme_desert"
        
        return "buildable"
        
    except Exception:
        return "buildable"


def _calculate_habitability_index(climate, health, education, economic, env, social) -> float:
    """Calculate comprehensive habitability index with better weights."""
    weights = {
        'climate': 0.30,      # Most important for daily comfort
        'health': 0.20,       # Essential for survival
        'education': 0.15,    # Important for families
        'economic': 0.15,     # Important for livelihood
        'environmental': 0.10, # Quality of life
        'social': 0.10        # Community and safety
    }
    
    return (
        climate * weights['climate'] + 
        health * weights['health'] + 
        education * weights['education'] +
        economic * weights['economic'] + 
        env * weights['environmental'] + 
        social * weights['social']
    )


# ============================================================
# HELPER FUNCTIONS (Preserving Original Logic Structure)
# ============================================================

def _get_living_conditions(lat: float, lng: float) -> float:
    return _estimate_living_conditions(lat, lng)

def _get_healthcare_access(lat: float, lng: float) -> float:
    # Logic remains same as original but used only on verified buildable land
    return _estimate_healthcare_access(lat, lng)

def _get_education_access(lat: float, lng: float) -> float:
    return _estimate_education_access(lat, lng)

def _get_economic_opportunity(lat: float, lng: float) -> float:
    return _estimate_economic_opportunity(lat, lng)

def _get_environmental_quality(lat: float, lng: float) -> float:
    return _estimate_environmental_quality(lat, lng)

def _get_social_infrastructure(lat: float, lng: float) -> float:
    return _estimate_social_infrastructure(lat, lng)

def _calculate_habitability_capacity(living, health, education, economic, env, social) -> float:
    weights = {'living': 0.25, 'health': 0.20, 'education': 0.15, 'economic': 0.20, 'environmental': 0.10, 'social': 0.10}
    return (living * weights['living'] + health * weights['health'] + education * weights['education'] +
            economic * weights['economic'] + env * weights['environmental'] + social * weights['social'])

def _habitability_to_suitability(idx: float) -> float:
    if idx >= 80: return min(100, 80 + (idx - 80) * 0.5)
    elif idx >= 60: return 60 + (idx - 60) * 1.0
    elif idx >= 40: return 40 + (idx - 40) * 1.0
    return idx

def _get_habitability_label(score: float) -> str:
    if score >= 80: return "Excellent Habitability"
    if score >= 60: return "Good Habitability"
    if score >= 40: return "Moderate Habitability"
    return "Poor Habitability"

def _estimate_habitability_time(idx: float) -> str:
    if idx >= 80: return "Immediate"
    if idx >= 60: return "Months"
    return "Years"

def _calculate_confidence(living, health) -> float:
    confidence = 50.0
    if living > 0: confidence += 25
    if health > 0: confidence += 20
    return min(95, confidence)

def _generate_reasoning(recovery_index: float, infrastructure: float, emergency: float) -> str:
    """Generate detailed reasoning with specific numerical evidence."""
    reasoning_parts = []
    
    # Infrastructure resilience evidence
    if infrastructure > 80:
        reasoning_parts.append(f"excellent infrastructure resilience ({infrastructure:.0f}/100) with comprehensive road networks, multiple transport options, and urban connectivity")
    elif infrastructure > 60:
        reasoning_parts.append(f"good infrastructure resilience ({infrastructure:.0f}/100) with solid road networks and basic transport connectivity")
    elif infrastructure > 40:
        reasoning_parts.append(f"moderate infrastructure resilience ({infrastructure:.0f}/100) with limited road networks and basic transport options")
    else:
        reasoning_parts.append(f"poor infrastructure resilience ({infrastructure:.0f}/100) with minimal transport networks and limited connectivity")
    
    # Emergency services evidence
    if emergency > 80:
        reasoning_parts.append(f"outstanding emergency services access ({emergency:.0f}/100) with multiple hospitals, comprehensive fire protection, and police coverage")
    elif emergency > 60:
        reasoning_parts.append(f"good emergency services access ({emergency:.0f}/100) with hospitals nearby and adequate emergency response capabilities")
    elif emergency > 40:
        reasoning_parts.append(f"moderate emergency services access ({emergency:.0f}/100) with basic healthcare facilities and limited emergency response")
    else:
        reasoning_parts.append(f"limited emergency services access ({emergency:.0f}/100) with minimal healthcare facilities and extended response times")
    
    # Overall recovery capacity assessment
    if recovery_index > 75:
        reasoning_parts.append(f"excellent recovery capacity ({recovery_index:.0f}/100) enables rapid disaster response within weeks")
    elif recovery_index > 50:
        reasoning_parts.append(f"good recovery capacity ({recovery_index:.0f}/100) supports effective disaster response within months")
    elif recovery_index > 25:
        reasoning_parts.append(f"moderate recovery capacity ({recovery_index:.0f}/100) may require years for full recovery")
    else:
        reasoning_parts.append(f"poor recovery capacity ({recovery_index:.0f}/100) could take decades for recovery")
    
    return ". ".join(reasoning_parts) + "."

# --- FALLBACK AND ESTIMATION HELPERS ---

def _get_fallback_habitability(lat, lng) -> Dict:
    return {"value": 50.0, "label": "Moderate Habitability", "reasoning": "Baseline estimate applied."}

def _estimate_living_conditions(lat, lng) -> float:
    """Estimate living conditions based on urban density and region."""
    # Check if this is a major urban area
    urban_density = _estimate_urban_density(lat, lng)
    region = _get_geographic_region(lat, lng)
    
    # Base scores by urban density
    if urban_density == "high":
        base_score = 85.0  # Major cities have good infrastructure
    elif urban_density == "medium":
        base_score = 65.0  # Suburban areas
    else:
        base_score = 40.0  # Rural areas
    
    # Regional adjustments
    regional_boost = {
        "north_america": 10.0,
        "europe": 10.0,
        "asia": 5.0,
        "oceania": 8.0,
        "south_america": 0.0,
        "africa": -5.0
    }
    
    return max(20.0, min(100.0, base_score + regional_boost.get(region, 0.0)))

def _estimate_healthcare_access(lat, lng) -> float:
    """Estimate healthcare access based on urban density."""
    urban_density = _estimate_urban_density(lat, lng)
    
    if urban_density == "high":
        return 80.0  # Cities have hospitals, clinics
    elif urban_density == "medium":
        return 55.0  # Suburbs have some healthcare
    else:
        return 25.0  # Rural areas have limited healthcare

def _estimate_education_access(lat, lng) -> float:
    """Estimate education access based on urban density."""
    urban_density = _estimate_urban_density(lat, lng)
    
    if urban_density == "high":
        return 85.0  # Schools, colleges, universities
    elif urban_density == "medium":
        return 60.0  # Some schools
    else:
        return 30.0  # Limited educational facilities

def _estimate_economic_opportunity(lat, lng) -> float:
    """Estimate economic opportunity based on urban density and region."""
    urban_density = _estimate_urban_density(lat, lng)
    region = _get_geographic_region(lat, lng)
    
    # Base economic scores by urban density
    if urban_density == "high":
        base_score = 90.0  # Jobs, businesses, commerce
    elif urban_density == "medium":
        base_score = 60.0  # Some economic activity
    else:
        base_score = 35.0  # Limited economic opportunities
    
    # Regional economic adjustments
    regional_economy = {
        "north_america": 5.0,
        "europe": 5.0,
        "asia": 8.0,  # High growth potential
        "oceania": 3.0,
        "south_america": -2.0,
        "africa": -5.0
    }
    
    return max(20.0, min(100.0, base_score + regional_economy.get(region, 0.0)))

def _estimate_environmental_quality(lat, lng) -> float:
    """Estimate environmental quality - better in less dense areas."""
    urban_density = _estimate_urban_density(lat, lng)
    
    # Paradox: less dense areas often have better environmental quality
    if urban_density == "high":
        return 45.0  # Pollution, congestion
    elif urban_density == "medium":
        return 65.0  # Moderate environment
    else:
        return 80.0  # Clean air, nature

def _estimate_social_infrastructure(lat, lng) -> float:
    """Estimate social infrastructure based on urban density."""
    urban_density = _estimate_urban_density(lat, lng)
    
    if urban_density == "high":
        return 85.0  # Community centers, parks, facilities
    elif urban_density == "medium":
        return 60.0  # Some social infrastructure
    else:
        return 30.0  # Limited social facilities

def _get_geographic_region(lat, lng) -> str:
    """Determine geographic region with better accuracy."""
    if 60 <= lat <= 80 and -10 <= lng <= 40:
        return "europe"
    elif 25 <= lat <= 50 and -130 <= lng <= -60:
        return "north_america"
    elif -55 <= lat <= 15 and -80 <= lng <= -35:
        return "south_america"
    elif -35 <= lat <= 37 and 10 <= lng <= 50:
        return "africa"
    elif 5 <= lat <= 50 and 60 <= lng <= 150:
        return "asia"
    elif -45 <= lat <= -10 and 110 <= lng <= 180:
        return "oceania"
    else:
        return "other"

def _estimate_urban_density(lat, lng) -> str:
    """Estimate urban density based on proximity to major cities."""
    import math
    
    # Major urban centers with larger radius for detection
    urban_centers = [
        # India: Delhi, Mumbai, Bangalore, Chennai, Kolkata, Hyderabad, Pune
        (28.6, 77.2, 1.0), (19.1, 72.9, 1.0), (12.9, 77.6, 0.8),
        (13.1, 80.3, 0.8), (22.6, 88.4, 0.8), (17.4, 78.5, 0.7), (18.5, 73.9, 0.6),
        # International: NYC, London, Tokyo, Paris, Singapore, Dubai
        (40.7, -74.0, 0.8), (51.5, -0.1, 0.8), (35.7, 139.7, 0.8),
        (48.9, 2.4, 0.7), (1.3, 103.8, 0.7), (25.2, 55.3, 0.6)
    ]
    
    # Check for high density (within radius)
    for city_lat, city_lng, radius in urban_centers:
        distance = math.sqrt((lat - city_lat)**2 + (lng - city_lng)**2)
        if distance <= radius:
            return "high"
    
    # Check for medium density (within 2 degrees)
    for city_lat, city_lng, _ in urban_centers:
        distance = math.sqrt((lat - city_lat)**2 + (lng - city_lng)**2)
        if distance <= 2.0:
            return "medium"
    
    return "low"


def _habitability_to_suitability(idx: float) -> float:
    """Convert habitability index to suitability score with better scaling."""
    if idx >= 85: return min(100, 85 + (idx - 85) * 0.5)
    elif idx >= 70: return 70 + (idx - 70) * 1.0
    elif idx >= 55: return 55 + (idx - 55) * 0.91
    elif idx >= 40: return 40 + (idx - 40) * 1.0
    elif idx >= 25: return 25 + (idx - 25) * 0.6
    return max(10, idx)


def _get_habitability_label(score: float) -> str:
    """Get habitability label with better ranges."""
    if score >= 85: return "Excellent Habitability"
    if score >= 70: return "Very Good Habitability"
    if score >= 55: return "Good Habitability"
    if score >= 40: return "Moderate Habitability"
    if score >= 25: return "Poor Habitability"
    return "Very Poor Habitability"


def _estimate_habitability_time(idx: float) -> str:
    """Estimate time needed for comfortable habitation."""
    if idx >= 85: return "Immediate"
    if idx >= 70: return "Weeks"
    if idx >= 55: return "Months"
    if idx >= 40: return "6-12 months"
    return "Years"


def _calculate_confidence(climate: float, health: float) -> float:
    """Calculate confidence based on data availability."""
    confidence = 50.0
    if climate > 0: confidence += 25
    if health > 0: confidence += 20
    return min(95, confidence)


def _generate_habitability_reasoning(habitability_index: float, climate_score: float, healthcare_score: float, education_score: float) -> str:
    """Generate detailed reasoning for habitability assessment."""
    parts = []
    
    # Climate comfort evidence
    if climate_score >= 85:
        parts.append(f"excellent climate comfort ({climate_score:.0f}/100) with comfortable temperatures year-round")
    elif climate_score >= 70:
        parts.append(f"good climate comfort ({climate_score:.0f}/100) with generally pleasant temperatures")
    elif climate_score >= 50:
        parts.append(f"moderate climate comfort ({climate_score:.0f}/100) with some temperature challenges")
    else:
        parts.append(f"challenging climate conditions ({climate_score:.0f}/100) requiring adaptation")
    
    # Healthcare access evidence
    if healthcare_score >= 70:
        parts.append(f"good healthcare access ({healthcare_score:.0f}/100) with hospitals and clinics nearby")
    elif healthcare_score >= 40:
        parts.append(f"moderate healthcare access ({healthcare_score:.0f}/100) with basic medical facilities")
    else:
        parts.append(f"limited healthcare access ({healthcare_score:.0f}/100) requiring travel for medical care")
    
    # Education access evidence
    if education_score >= 70:
        parts.append(f"good education access ({education_score:.0f}/100) with schools and educational facilities")
    elif education_score >= 40:
        parts.append(f"moderate education access ({education_score:.0f}/100) with basic schooling options")
    else:
        parts.append(f"limited education access ({education_score:.0f}/100) with few educational facilities")
    
    # Overall habitability assessment
    if habitability_index >= 75:
        parts.append(f"excellent overall habitability ({habitability_index:.0f}/100) making it easy for people to live and thrive")
    elif habitability_index >= 60:
        parts.append(f"good overall habitability ({habitability_index:.0f}/100) with comfortable living conditions")
    elif habitability_index >= 45:
        parts.append(f"moderate overall habitability ({habitability_index:.0f}/100) with some challenges but generally livable")
    else:
        parts.append(f"challenging habitability conditions ({habitability_index:.0f}/100) requiring significant adaptation")
    
    return ". ".join(parts) + "."


def _get_enhanced_fallback_habitability(lat: float, lng: float) -> Dict:
    """Enhanced fallback with better baseline scoring."""
    try:
        # Use urban density and region for better fallback
        urban_density = _estimate_urban_density(lat, lng)
        region = _get_geographic_region(lat, lng)
        
        # Base scores by urban density
        if urban_density == "high":
            base_score = 75.0  # Cities have good infrastructure
        elif urban_density == "medium":
            base_score = 65.0  # Suburban areas
        else:
            base_score = 55.0  # Rural areas
        
        # Regional adjustments for habitability
        regional_boost = {
            "north_america": 5.0,
            "europe": 8.0,     # Good social systems
            "asia": 3.0,      # Variable but improving
            "oceania": 7.0,    # Generally good
            "south_america": 2.0,
            "africa": 0.0,
            "other": 3.0
        }
        
        final_score = base_score + regional_boost.get(region, 0.0)
        final_score = max(40.0, min(85.0, final_score))
        
        return {
            "value": round(final_score, 1),
            "habitability_index": final_score * 0.8,
            "climate_comfort": 70.0,
            "healthcare_access": 60.0,
            "education_access": 65.0,
            "economic_opportunity": 55.0,
            "environmental_quality": 60.0,
            "social_infrastructure": 50.0,
            "habitability_time_estimate": "Months",
            "label": _get_habitability_label(final_score),
            "source": "Regional Estimation (Enhanced Fallback)",
            "confidence": 45.0,
            "reasoning": f"Enhanced fallback based on {urban_density} urban density and {region} regional characteristics."
        }
        
    except Exception:
        return {
            "value": 60.0,
            "habitability_index": 50.0,
            "climate_comfort": 60.0,
            "healthcare_access": 50.0,
            "education_access": 55.0,
            "economic_opportunity": 50.0,
            "environmental_quality": 55.0,
            "social_infrastructure": 45.0,
            "habitability_time_estimate": "Months",
            "label": "Moderate Habitability",
            "source": "Default Fallback",
            "confidence": 30.0,
            "reasoning": "Default habitability estimate applied."
        }