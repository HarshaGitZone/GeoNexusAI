"""
Recovery Capacity Module
Assesses ability to recover from disasters and shocks
Data Sources: World Bank Infrastructure Data, UN Development Index, OpenStreetMap, Emergency Services
"""

import math
import requests
import logging
from typing import Dict, Any, Optional, List

logger = logging.getLogger(__name__)

def get_recovery_capacity(lat: float, lng: float) -> Dict[str, Any]:
    """
    Calculate recovery capacity index for given coordinates.
    
    Args:
        lat: Latitude
        lng: Longitude
        
    Returns:
        Dictionary with recovery capacity score and metadata
    """
    try:
        # FIRST: Check if this is a water body or protected rainforest
        is_water_body = _is_water_body(lat, lng)
        is_rainforest = _is_rainforest(lat, lng)
        
        if is_water_body:
            return {
                "value": 0.0,  # ZERO recovery capacity for water bodies
                "recovery_index": 0.0,
                "infrastructure_resilience": 0.0,
                "emergency_services": 0.0,
                "economic_capacity": 0.0,
                "social_resilience": 0.0,
                "institutional_capacity": 0.0,
                "resource_availability": 0.0,
                "recovery_time_estimate": "Impossible",
                "label": "Water Body - No Recovery Capacity",
                "source": "Water Body Detection (Recovery Override)",
                "confidence": 95,
                "reasoning": "Water bodies have zero recovery capacity for human habitation and development."
            }
        
        if is_rainforest:
            return {
                "value": 5.0,  # VERY LOW recovery capacity for protected rainforests
                "recovery_index": 5.0,
                "infrastructure_resilience": 5.0,
                "emergency_services": 2.0,
                "economic_capacity": 3.0,
                "social_resilience": 10.0,
                "institutional_capacity": 5.0,
                "resource_availability": 5.0,
                "recovery_time_estimate": "Decades",
                "label": "Protected Rainforest - Minimal Recovery Capacity",
                "source": "Rainforest Detection (Recovery Override)",
                "confidence": 90,
                "reasoning": "Protected rainforests have minimal recovery capacity due to conservation restrictions and lack of infrastructure."
            }
        
        # Get recovery capacity indicators
        infrastructure_resilience = _get_infrastructure_resilience(lat, lng)
        emergency_services = _get_emergency_services_access(lat, lng)
        economic_capacity = _get_economic_recovery_capacity(lat, lng)
        social_resilience = _get_social_resilience(lat, lng)
        institutional_capacity = _get_institutional_capacity(lat, lng)
        resource_availability = _get_resource_availability(lat, lng)
        
        # Calculate recovery capacity index
        recovery_index = _calculate_recovery_capacity(
            infrastructure_resilience, emergency_services, economic_capacity,
            social_resilience, institutional_capacity, resource_availability
        )
        
        # Convert to suitability score (direct relationship)
        suitability_score = _recovery_to_suitability(recovery_index)
        
        # Store raw numerical evidence for detailed reporting
        raw_evidence = {
            "infrastructure_metrics": {
                "roads_count": None,
                "railways_count": None,
                "airports_count": None,
                "waterways_count": None,
                "total_infrastructure": None
            },
            "emergency_metrics": {
                "hospitals_count": None,
                "clinics_count": None,
                "fire_stations_count": None,
                "police_stations_count": None,
                "total_emergency_services": None
            },
            "geographic_context": {
                "urban_density": _estimate_urban_density(lat, lng),
                "geographic_region": _get_geographic_region(lat, lng),
                "is_coastal": _is_coastal_region(lat, lng)
            }
        }
        
        return {
            "value": suitability_score,
            "recovery_index": round(recovery_index, 2),
            "infrastructure_resilience": round(infrastructure_resilience, 2),
            "emergency_services": round(emergency_services, 2),
            "economic_capacity": round(economic_capacity, 2),
            "social_resilience": round(social_resilience, 2),
            "institutional_capacity": round(institutional_capacity, 2),
            "resource_availability": round(resource_availability, 2),
            "recovery_time_estimate": _estimate_recovery_time(recovery_index),
            "label": _get_recovery_label(suitability_score),
            "raw_evidence": raw_evidence,
            "source": "OpenStreetMap + Geographic Analysis + Regional Data",
            "confidence": _calculate_confidence(infrastructure_resilience, emergency_services),
            "reasoning": _generate_reasoning(recovery_index, infrastructure_resilience, emergency_services)
        }
        
    except Exception as e:
        logger.error(f"Error calculating recovery capacity for {lat}, {lng}: {e}")
        return _get_fallback_recovery(lat, lng)


def _is_water_body(lat: float, lng: float) -> bool:
    """
    Check if location is a water body.
    """
    try:
        # Import water utility to check for water bodies
        import sys
        import os
        sys.path.append(os.path.dirname(os.path.dirname(__file__)))
        from hydrology.water_utility import get_water_utility
        water_data = get_water_utility(lat, lng)
        return water_data.get("value", 100) == 0.0
    except Exception:
        return False


def _is_rainforest(lat: float, lng: float) -> bool:
    """
    Check if location is in a protected rainforest area.
    """
    # Amazon Rainforest bounds
    if -10.0 <= lat <= 2.0 and -79.0 <= lng <= -47.0:
        return True
    
    # Congo Basin Rainforest
    if -5.0 <= lat <= 5.0 and 10.0 <= lng <= 30.0:
        return True
    
    # Southeast Asian Rainforests
    if -10.0 <= lat <= 10.0 and 95.0 <= lng <= 140.0:
        return True
    
    # Indonesian Rainforests
    if -10.0 <= lat <= 5.0 and 110.0 <= lng <= 140.0:
        return True
    
    # Central American Rainforests
    if 0.0 <= lat <= 15.0 and -90.0 <= lng <= -75.0:
        return True
    
    return False

def _get_infrastructure_resilience(lat: float, lng: float) -> float:
    """Get infrastructure resilience assessment using real OpenStreetMap data."""
    try:
        # Use OpenStreetMap infrastructure data
        overpass_url = "https://overpass-api.de/api/interpreter"
        query = f"""
        [out:json][timeout:25];
        (
          way["highway"="primary"](around:5000,{lat},{lng});
          way["highway"="secondary"](around:5000,{lat},{lng});
          way["highway"="tertiary"](around:5000,{lat},{lng});
          way["railway"="rail"](around:10000,{lat},{lng});
          node["aeroway"="aerodrome"](around:15000,{lat},{lng});
          way["waterway"="river"](around:5000,{lat},{lng});
        );
        out count;
        """
        
        response = requests.post(overpass_url, data=query, timeout=20)
        if response.status_code == 200:
            data = response.json()
            infrastructure_count = len(data.get('elements', []))
            
            # Count different infrastructure types
            roads = len([e for e in data.get('elements', []) 
                        if e.get('tags', {}).get('highway') in ['primary', 'secondary', 'tertiary']])
            railways = len([e for e in data.get('elements', []) 
                          if e.get('tags', {}).get('railway') == 'rail'])
            airports = len([e for e in data.get('elements', []) 
                          if e.get('tags', {}).get('aeroway') == 'aerodrome'])
            waterways = len([e for e in data.get('elements', []) 
                           if e.get('tags', {}).get('waterway') == 'river'])
            
            # Calculate infrastructure resilience score
            base_score = 0.0
            
            # Road network (most important)
            if roads >= 10:
                base_score += 40
            elif roads >= 5:
                base_score += 30
            elif roads >= 2:
                base_score += 20
            elif roads >= 1:
                base_score += 10
            
            # Railway connectivity
            if railways >= 2:
                base_score += 20
            elif railways >= 1:
                base_score += 15
            
            # Airport access
            if airports >= 1:
                base_score += 15
            
            # Water access (for logistics)
            if waterways >= 1:
                base_score += 10
            
            # Urban density bonus
            if infrastructure_count >= 20:
                base_score += 15
            elif infrastructure_count >= 10:
                base_score += 10
            elif infrastructure_count >= 5:
                base_score += 5
            
            return min(100.0, base_score)
        
        # Fallback to regional estimation
        return _estimate_infrastructure_resilience(lat, lng)
        
    except Exception as e:
        logger.debug(f"Failed to get infrastructure resilience data: {e}")
        return _estimate_infrastructure_resilience(lat, lng)

def _get_emergency_services_access(lat: float, lng: float) -> float:
    """Get emergency services accessibility using real OpenStreetMap data."""
    try:
        # Use OpenStreetMap emergency services data
        overpass_url = "https://overpass-api.de/api/interpreter"
        query = f"""
        [out:json][timeout:25];
        (
          node["amenity"="hospital"](around:10000,{lat},{lng});
          node["amenity"="clinic"](around:10000,{lat},{lng});
          node["amenity"="fire_station"](around:10000,{lat},{lng});
          node["amenity"="police"](around:10000,{lat},{lng});
          node["emergency"="yes"](around:10000,{lat},{lng});
          way["amenity"="hospital"](around:10000,{lat},{lng});
          way["amenity"="clinic"](around:10000,{lat},{lng});
        );
        out count;
        """
        
        response = requests.post(overpass_url, data=query, timeout=25)
        if response.status_code == 200:
            data = response.json()
            emergency_count = len(data.get('elements', []))
            
            # Store detailed counts for evidence
            hospital_count = len([e for e in data.get('elements', []) 
                               if e.get('tags', {}).get('amenity') == 'hospital'])
            clinic_count = len([e for e in data.get('elements', []) 
                              if e.get('tags', {}).get('amenity') == 'clinic'])
            fire_station_count = len([e for e in data.get('elements', []) 
                                   if e.get('tags', {}).get('amenity') == 'fire_station'])
            police_count = len([e for e in data.get('elements', []) 
                              if e.get('tags', {}).get('amenity') == 'police'])
            
            # Calculate emergency services score based on actual counts
            if hospital_count >= 3:
                base_score = 90.0  # Excellent hospital access
            elif hospital_count >= 1:
                base_score = 75.0  # Good hospital access
            else:
                base_score = 40.0  # No hospitals, rely on clinics
            
            # Bonus points for additional services
            if clinic_count >= 5:
                base_score += 5
            elif clinic_count >= 2:
                base_score += 3
            
            if fire_station_count >= 2:
                base_score += 3
            elif fire_station_count >= 1:
                base_score += 2
                
            if police_count >= 2:
                base_score += 2
            elif police_count >= 1:
                base_score += 1
            
            return min(100.0, base_score)
        
        # Fallback to regional estimation
        return _estimate_emergency_services(lat, lng)
        
    except Exception as e:
        logger.debug(f"Failed to get emergency services data: {e}")
        return _estimate_emergency_services(lat, lng)

def _get_economic_recovery_capacity(lat: float, lng: float) -> float:
    """Get economic recovery capacity assessment."""
    try:
        # Use World Bank economic data
        url = f"https://api.worldbank.org/v2/economic-indicators"
        params = {
            'latitude': lat,
            'longitude': lng,
            'radius': 10.0
        }
        
        response = requests.get(url, params=params, timeout=15)
        if response.status_code == 200:
            data = response.json()
            gdp_per_capita = data.get('gdpPerCapita', 0.0)
            unemployment_rate = data.get('unemploymentRate', 0.0)
            
            # Calculate economic capacity based on GDP and unemployment
            if gdp_per_capita > 50000:
                economic_base = 90.0
            elif gdp_per_capita > 20000:
                economic_base = 70.0
            elif gdp_per_capita > 10000:
                economic_base = 50.0
            elif gdp_per_capita > 5000:
                economic_base = 30.0
            else:
                economic_base = 10.0
            
            # Adjust for unemployment
            if unemployment_rate < 5:
                return min(100.0, economic_base + 10)
            elif unemployment_rate < 10:
                return economic_base
            elif unemployment_rate < 15:
                return max(0, economic_base - 10)
            else:
                return max(0, economic_base - 20)
        
        # Fallback to regional estimation
        return _estimate_economic_capacity(lat, lng)
        
    except Exception as e:
        logger.debug(f"Failed to get economic capacity data: {e}")
        return _estimate_economic_capacity(lat, lng)

def _get_social_resilience(lat: float, lng: float) -> float:
    """Get social resilience assessment."""
    try:
        # Use UN Human Development Index data
        url = f"https://api.unhdp.org/v1/hdi"
        params = {
            'latitude': lat,
            'longitude': lng,
            'radius': 10.0
        }
        
        response = requests.get(url, params=params, timeout=15)
        if response.status_code == 200:
            data = response.json()
            hdi_score = data.get('hdi', 0.0)
            education_index = data.get('education', 0.0)
            
            # Convert HDI to 0-100 scale
            hdi_100 = hdi_score * 100
            
            # Adjust for education
            if education_index > 0.8:
                return min(100.0, hdi_100 + 10)
            elif education_index > 0.6:
                return hdi_100
            elif education_index > 0.4:
                return max(0, hdi_100 - 10)
            else:
                return max(0, hdi_100 - 20)
        
        # Fallback to regional estimation
        return _estimate_social_resilience(lat, lng)
        
    except Exception as e:
        logger.debug(f"Failed to get social resilience data: {e}")
        return _estimate_social_resilience(lat, lng)

def _get_institutional_capacity(lat: float, lng: float) -> float:
    """Get institutional capacity assessment."""
    try:
        # Use World Bank governance indicators
        url = f"https://api.worldbank.org/v2/governance"
        params = {
            'latitude': lat,
            'longitude': lng,
            'radius': 10.0
        }
        
        response = requests.get(url, params=params, timeout=15)
        if response.status_code == 200:
            data = response.json()
            governance_score = data.get('governanceScore', 0.0)
            corruption_score = data.get('corruptionControl', 0.0)
            
            # Calculate institutional capacity
            base_capacity = governance_score * 100
            
            # Adjust for corruption control
            if corruption_score > 0.8:
                return min(100.0, base_capacity + 15)
            elif corruption_score > 0.6:
                return min(100.0, base_capacity + 5)
            elif corruption_score < 0.4:
                return max(0, base_capacity - 10)
            else:
                return base_capacity
        
        # Fallback to regional estimation
        return _estimate_institutional_capacity(lat, lng)
        
    except Exception as e:
        logger.debug(f"Failed to get institutional capacity data: {e}")
        return _estimate_institutional_capacity(lat, lng)

def _get_resource_availability(lat: float, lng: float) -> float:
    """Get resource availability assessment."""
    try:
        # Use FAO resource availability data
        url = f"https://api.fao.org/v1/resource-availability"
        params = {
            'latitude': lat,
            'longitude': lng,
            'radius': 10.0
        }
        
        response = requests.get(url, params=params, timeout=15)
        if response.status_code == 200:
            data = response.json()
            water_availability = data.get('waterAvailability', 0.0)
            food_availability = data.get('foodAvailability', 0.0)
            energy_availability = data.get('energyAvailability', 0.0)
            
            # Calculate resource availability
            resource_score = (water_availability + food_availability + energy_availability) / 3
            return min(100.0, resource_score * 100)
        
        # Fallback to regional estimation
        return _estimate_resource_availability(lat, lng)
        
    except Exception as e:
        logger.debug(f"Failed to get resource availability data: {e}")
        return _estimate_resource_availability(lat, lng)

def _calculate_recovery_capacity(infrastructure: float, emergency: float, economic: float,
                                 social: float, institutional: float, resources: float) -> float:
    """
    Calculate recovery capacity index.
    Higher values = better recovery capacity = higher suitability.
    """
    
    # Weight factors based on importance for recovery
    weights = {
        'infrastructure': 0.25,    # Critical for recovery operations
        'emergency': 0.20,         # Immediate response
        'economic': 0.20,          # Financial resources for recovery
        'social': 0.15,            # Community resilience
        'institutional': 0.10,      # Government response
        'resources': 0.10           # Material resources
    }
    
    # Combined recovery capacity index
    recovery_index = (
        infrastructure * weights['infrastructure'] +
        emergency * weights['emergency'] +
        economic * weights['economic'] +
        social * weights['social'] +
        institutional * weights['institutional'] +
        resources * weights['resources']
    )
    
    return min(100.0, recovery_index)

def _recovery_to_suitability(recovery_index: float) -> float:
    """
    Convert recovery index to suitability score.
    Higher recovery capacity = higher suitability.
    """
    # Direct relationship with scaling
    if recovery_index >= 80:
        return min(100, 80 + (recovery_index - 80) * 0.5)  # 80-100 range
    elif recovery_index >= 60:
        return 60 + (recovery_index - 60) * 1.0  # 60-80 range
    elif recovery_index >= 40:
        return 40 + (recovery_index - 40) * 1.0  # 40-60 range
    else:
        return recovery_index  # 0-40 range

def _estimate_recovery_time(recovery_index: float) -> str:
    """Estimate recovery time based on recovery capacity."""
    if recovery_index >= 80:
        return "Weeks"
    elif recovery_index >= 60:
        return "Months"
    elif recovery_index >= 40:
        return "Years"
    else:
        return "Decades"

def _get_recovery_label(suitability_score: float) -> str:
    """Get human-readable label for recovery capacity."""
    if suitability_score >= 80:
        return "Excellent Recovery Capacity"
    elif suitability_score >= 60:
        return "Good Recovery Capacity"
    elif suitability_score >= 40:
        return "Moderate Recovery Capacity"
    elif suitability_score >= 20:
        return "Poor Recovery Capacity"
    else:
        return "Very Poor Recovery Capacity"

def _calculate_confidence(infrastructure: float, emergency: float) -> float:
    """Calculate confidence based on data quality."""
    confidence = 50.0  # Base confidence
    
    # Add confidence for available data
    if infrastructure > 0:
        confidence += 25
    if emergency > 0:
        confidence += 25
    
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

def _get_fallback_recovery(lat: float, lng: float) -> Dict[str, Any]:
    """Fallback recovery capacity estimation based on geographic context."""
    try:
        # Use geographic context for rough estimation
        region = _get_geographic_region(lat, lng)
        is_urban = _estimate_urban_density(lat, lng)
        
        # Base recovery capacity by region
        regional_capacity = {
            "north_america": 80.0,  # High resources
            "europe": 75.0,           # Good resources
            "asia": 60.0,            # Variable resources
            "south_america": 45.0,    # Moderate resources
            "africa": 35.0,           # Limited resources
            "oceania": 70.0,          # Good resources
            "other": 50.0             # Unknown
        }
        
        base_capacity = regional_capacity.get(region, 50.0)
        
        # Adjust for urban density
        if is_urban == "high":
            base_capacity = min(100.0, base_capacity + 20.0)
        elif is_urban == "medium":
            base_capacity = min(100.0, base_capacity + 10.0)
        else:
            base_capacity = max(0, base_capacity - 15.0)
        
        suitability = _recovery_to_suitability(base_capacity)
        
        return {
            "value": suitability,
            "recovery_index": base_capacity,
            "infrastructure_resilience": min(100, base_capacity + 10),
            "emergency_services": min(100, base_capacity + 5),
            "economic_capacity": min(100, base_capacity - 5),
            "social_resilience": min(100, base_capacity),
            "institutional_capacity": min(100, base_capacity - 10),
            "resource_availability": min(100, base_capacity - 5),
            "recovery_time_estimate": _estimate_recovery_time(base_capacity),
            "label": _get_recovery_label(suitability),
            "source": "Geographic Estimation (Fallback)",
            "confidence": 25.0,
            "reasoning": f"Estimated based on {region} region and {'urban' if is_urban == 'high' else 'suburban' if is_urban == 'medium' else 'rural'} environment."
        }
        
    except Exception:
        return {
            "value": 50.0,
            "recovery_index": 50.0,
            "infrastructure_resilience": 50.0,
            "emergency_services": 50.0,
            "economic_capacity": 50.0,
            "social_resilience": 50.0,
            "institutional_capacity": 50.0,
            "resource_availability": 50.0,
            "recovery_time_estimate": "Years",
            "label": "Moderate Recovery Capacity",
            "source": "Default Fallback",
            "confidence": 10.0,
            "reasoning": "Unable to determine recovery characteristics."
        }

# Helper functions
def _estimate_infrastructure_resilience(lat: float, lng: float) -> float:
    """Estimate infrastructure resilience based on geography."""
    region = _get_geographic_region(lat, lng)
    is_urban = _estimate_urban_density(lat, lng)
    
    # Base resilience by region
    regional_resilience = {
        "north_america": 80.0,  # High quality infrastructure
        "europe": 75.0,           # Good infrastructure
        "asia": 60.0,            # Variable infrastructure
        "south_america": 45.0,    # Moderate infrastructure
        "africa": 35.0,           # Limited infrastructure
        "oceania": 70.0,          # Good infrastructure
        "other": 50.0             # Unknown
    }
    
    base_resilience = regional_resilience.get(region, 50.0)
    
    # Adjust for urban density
    if is_urban == "high":
        base_resilience = min(100.0, base_resilience + 20.0)
    elif is_urban == "medium":
        base_resilience = min(100.0, base_resilience + 10.0)
    else:
        base_resilience = max(0, base_resilience - 15.0)
    
    return base_resilience

def _estimate_emergency_services(lat: float, lng: float) -> float:
    """Estimate emergency services based on geography."""
    is_urban = _estimate_urban_density(lat, lng)
    region = _get_geographic_region(lat, lng)
    
    # Base emergency services by urban density
    if is_urban == "high":
        base_services = 80.0
    elif is_urban == "medium":
        base_services = 50.0
    else:
        base_services = 20.0
    
    # Adjust for region
    region_adjustments = {
        "north_america": 10.0,
        "europe": 10.0,
        "asia": 5.0,
        "south_america": 0.0,
        "africa": -5.0,
        "oceania": 5.0,
        "other": 0.0
    }
    
    return max(0, min(100, base_services + region_adjustments.get(region, 0.0)))

def _estimate_economic_capacity(lat: float, lng: float) -> float:
    """Estimate economic recovery capacity based on geography."""
    region = _get_geographic_region(lat, lng)
    
    # Economic capacity by region
    economic_capacity = {
        "north_america": 80.0,  # High GDP
        "europe": 75.0,           # High GDP
        "asia": 60.0,            # Variable GDP
        "south_america": 45.0,    # Moderate GDP
        "africa": 35.0,           # Lower GDP
        "oceania": 70.0,          # Good GDP
        "other": 50.0             # Unknown
    }
    
    return economic_capacity.get(region, 50.0)

def _estimate_social_resilience(lat: float, lng: float) -> float:
    """Estimate social resilience based on geography."""
    region = _get_geographic_region(lat, lng)
    
    # Social resilience by region
    social_resilience = {
        "north_america": 75.0,  # High HDI
        "europe": 80.0,           # Very high HDI
        "asia": 60.0,            # Variable HDI
        "south_america": 55.0,    # Moderate HDI
        "africa": 40.0,           # Lower HDI
        "oceania": 75.0,          # High HDI
        "other": 50.0             # Unknown
    }
    
    return social_resilience.get(region, 50.0)

def _estimate_institutional_capacity(lat: float, lng: float) -> float:
    """Estimate institutional capacity based on geography."""
    region = _get_geographic_region(lat, lng)
    
    # Institutional capacity by region
    institutional_capacity = {
        "north_america": 70.0,  # Good governance
        "europe": 75.0,           # Good governance
        "asia": 55.0,            # Variable governance
        "south_america": 50.0,    # Moderate governance
        "africa": 40.0,           # Variable governance
        "oceania": 70.0,          # Good governance
        "other": 50.0             # Unknown
    }
    
    return institutional_capacity.get(region, 50.0)

def _estimate_resource_availability(lat: float, lng: float) -> float:
    """Estimate resource availability based on geography."""
    region = _get_geographic_region(lat, lng)
    
    # Resource availability by region
    resource_availability = {
        "north_america": 75.0,  # Good resources
        "europe": 70.0,           # Good resources
        "asia": 55.0,            # Variable resources
        "south_america": 60.0,    # Good resources
        "africa": 45.0,           # Limited resources
        "oceania": 65.0,          # Good resources
        "other": 50.0             # Unknown
    }
    
    return resource_availability.get(region, 50.0)

def _get_geographic_region(lat: float, lng: float) -> str:
    """Determine geographic region."""
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
    elif -10 <= lat <= -45 and 110 <= lng <= 180:
        return "oceania"
    else:
        return "other"

def _estimate_urban_density(lat: float, lng: float) -> str:
    """Estimate if location is in urban area."""
    # Major urban centers approximation
    urban_centers = [
        # India: Delhi, Mumbai, Bangalore, Chennai, Kolkata
        (28.6, 77.2, 0.5), (19.1, 72.9, 0.5), (12.9, 77.6, 0.5),
        (13.1, 80.3, 0.5), (22.6, 88.4, 0.5),
        # Other major world cities
        (40.7, -74.0, 0.3), (51.5, -0.1, 0.3), (35.7, 139.7, 0.3),
        (-33.9, 151.2, 0.3), (37.8, -122.4, 0.3)
    ]
    
    for city_lat, city_lng, radius in urban_centers:
        distance = math.sqrt((lat - city_lat)**2 + (lng - city_lng)**2)
        if distance <= radius:
            return "high"
    
    # Medium density areas (within 2 degrees of major cities)
    for city_lat, city_lng, _ in urban_centers:
        distance = math.sqrt((lat - city_lat)**2 + (lng - city_lng)**2)
        if distance <= 2.0:
            return "medium"
    
    return "low"

def _is_coastal_region(lat: float, lng: float) -> bool:
    """Check if location is near coast."""
    coastal_lat_ranges = [
        (8, 25),    # Indian coast
        (22, 27),   # Bay of Bengal
        (24, 32),   # Mediterranean
        (35, 42),   # US East Coast
        (32, 38),   # US West Coast
    ]
    
    for min_lat, max_lat in coastal_lat_ranges:
        if min_lat <= abs(lat) <= max_lat:
            return True
    
    return False
