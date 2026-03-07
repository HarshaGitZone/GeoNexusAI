import requests
from typing import Dict, List, Tuple
import math

OVERPASS_URLS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.openstreetmap.ru/api/interpreter",
]

HEADERS = {
    "User-Agent": "GeoAI_DrainageAnalysis/2.0",
    "Accept": "application/json"
}


def _drainage_label(score: float) -> str:
    """Enhanced drainage classification with better ranges."""
    if score is None:
        return "Drainage data unavailable"
    if score >= 90:
        return "Excellent drainage"
    elif score >= 75:
        return "Very good drainage"
    elif score >= 60:
        return "Good drainage"
    elif score >= 45:
        return "Moderate drainage"
    elif score >= 30:
        return "Poor drainage"
    else:
        return "Very poor drainage"


def get_drainage_analysis(lat: float, lng: float) -> Dict:
    """
    Enhanced drainage capacity analysis using comprehensive OpenStreetMap data.
    
    Analyzes:
    1. Natural waterway network density (streams, rivers, drains)
    2. Man-made drainage infrastructure (canals, ditches, culverts)
    3. Terrain slope impact on drainage
    4. Urban drainage systems (storm drains, sewers)
    
    Higher drainage density = better flood mitigation and land drainage.
    """
    
    try:
        # --------------------------------------------------
        # LAYER 1: COMPREHENSIVE WATERWAY ANALYSIS
        # --------------------------------------------------
        waterway_data = _analyze_waterway_network(lat, lng)
        
        # --------------------------------------------------
        # LAYER 2: MAN-MADE DRAINAGE INFRASTRUCTURE
        # --------------------------------------------------
        infrastructure_data = _analyze_drainage_infrastructure(lat, lng)
        
        # --------------------------------------------------
        # LAYER 3: URBAN DRAINAGE SYSTEMS
        # --------------------------------------------------
        urban_data = _analyze_urban_drainage(lat, lng)
        
        # --------------------------------------------------
        # LAYER 4: TERRAIN IMPACT ANALYSIS
        # --------------------------------------------------
        terrain_data = _analyze_terrain_drainage(lat, lng)
        
        # --------------------------------------------------
        # CALCULATE COMPREHENSIVE DRAINAGE SCORE
        # --------------------------------------------------
        final_score = _calculate_comprehensive_drainage_score(
            waterway_data, infrastructure_data, urban_data, terrain_data
        )
        
        # Compile detailed evidence
        evidence = {
            "natural_waterways": waterway_data,
            "drainage_infrastructure": infrastructure_data,
            "urban_systems": urban_data,
            "terrain_impact": terrain_data,
            "total_features": (
                waterway_data.get("count", 0) + 
                infrastructure_data.get("count", 0) + 
                urban_data.get("count", 0)
            ),
            "search_radius_m": 5000,
            "analysis_area_km2": 78.5  # π * 5² km²
        }
        
        return {
            "value": round(final_score, 1),
            "label": _drainage_label(final_score),
            "raw": evidence,
            "unit": "drainage-capacity-index",
            "confidence": _calculate_confidence(evidence),
            "source": "OpenStreetMap + Terrain Analysis",
            "reasoning": _generate_drainage_reasoning(final_score, evidence)
        }
        
    except Exception as e:
        # Enhanced fallback with better baseline
        return _get_enhanced_fallback_drainage(lat, lng, str(e))


def _analyze_waterway_network(lat: float, lng: float) -> Dict:
    """Analyze natural waterway network density."""
    try:
        # Comprehensive waterway query with larger radius
        query = f"""
        [out:json][timeout:20];
        (
          way["waterway"~"^(stream|river|canal|ditch|drain)$"](around:5000,{lat},{lng});
          way["natural"="water"](around:5000,{lat},{lng});
          relation["waterway"~"^(stream|river|canal)$"](around:5000,{lat},{lng});
        );
        out geom;
        """
        
        for overpass_url in OVERPASS_URLS:
            try:
                resp = requests.post(
                    overpass_url,
                    data={"data": query},
                    headers=HEADERS,
                    timeout=15
                )
                resp.raise_for_status()
                elements = resp.json().get("elements", [])
                
                if elements:
                    # Count different waterway types
                    streams = len([e for e in elements 
                                 if e.get("tags", {}).get("waterway") == "stream"])
                    rivers = len([e for e in elements 
                                if e.get("tags", {}).get("waterway") == "river"])
                    canals = len([e for e in elements 
                                if e.get("tags", {}).get("waterway") == "canal"])
                    ditches = len([e for e in elements 
                                if e.get("tags", {}).get("waterway") == "ditch"])
                    drains = len([e for e in elements 
                               if e.get("tags", {}).get("waterway") == "drain"])
                    natural_water = len([e for e in elements 
                                       if e.get("tags", {}).get("natural") == "water"])
                    
                    total_count = streams + rivers + canals + ditches + drains + natural_water
                    
                    # Calculate waterway density per km²
                    search_area_km2 = 78.5  # π * 5² km²
                    density = total_count / search_area_km2
                    
                    # Collect feature names for evidence
                    features = []
                    for el in elements[:10]:
                        name = el.get("tags", {}).get("name")
                        waterway_type = el.get("tags", {}).get("waterway", "unnamed")
                        if name:
                            features.append(f"{name} ({waterway_type})")
                        elif len(features) < 5:
                            features.append(f"Unnamed {waterway_type}")
                    
                    return {
                        "count": total_count,
                        "streams": streams,
                        "rivers": rivers,
                        "canals": canals,
                        "ditches": ditches,
                        "drains": drains,
                        "natural_water": natural_water,
                        "density_per_km2": round(density, 2),
                        "features": features,
                        "source": "OpenStreetMap Waterway Network"
                    }
            except Exception:
                continue
                
    except Exception:
        pass
    
    return {"count": 0, "density_per_km2": 0, "features": [], "source": "No waterway data"}


def _analyze_drainage_infrastructure(lat: float, lng: float) -> Dict:
    """Analyze man-made drainage infrastructure."""
    try:
        query = f"""
        [out:json][timeout:15];
        (
          node["man_made"="culvert"](around:3000,{lat},{lng});
          node["man_made"="drain"](around:3000,{lat},{lng});
          node["man_made"="wastewater_plant"](around:5000,{lat},{lng});
          way["man_made"="culvert"](around:3000,{lat},{lng});
          way["landuse"="basin"](around:5000,{lat},{lng});
          way["waterway"="ditch"](around:3000,{lat},{lng});
        );
        out count;
        """
        
        for overpass_url in OVERPASS_URLS:
            try:
                resp = requests.post(
                    overpass_url,
                    data={"data": query},
                    headers=HEADERS,
                    timeout=12
                )
                resp.raise_for_status()
                elements = resp.json().get("elements", [])
                
                if elements:
                    culverts = len([e for e in elements 
                                 if e.get("tags", {}).get("man_made") == "culvert"])
                    drains = len([e for e in elements 
                               if e.get("tags", {}).get("man_made") == "drain"])
                    wastewater_plants = len([e for e in elements 
                                         if e.get("tags", {}).get("man_made") == "wastewater_plant"])
                    basins = len([e for e in elements 
                                if e.get("tags", {}).get("landuse") == "basin"])
                    ditches = len([e for e in elements 
                                 if e.get("tags", {}).get("waterway") == "ditch"])
                    
                    total_count = culverts + drains + wastewater_plants + basins + ditches
                    
                    return {
                        "count": total_count,
                        "culverts": culverts,
                        "drains": drains,
                        "wastewater_plants": wastewater_plants,
                        "basins": basins,
                        "ditches": ditches,
                        "source": "OpenStreetMap Drainage Infrastructure"
                    }
            except Exception:
                continue
                
    except Exception:
        pass
    
    return {"count": 0, "source": "No drainage infrastructure data"}


def _analyze_urban_drainage(lat: float, lng: float) -> Dict:
    """Analyze urban drainage systems."""
    try:
        query = f"""
        [out:json][timeout:15];
        (
          node["amenity"="fountain"](around:2000,{lat},{lng});
          node["leisure"="swimming_pool"](around:2000,{lat},{lng});
          node["man_made"="water_tower"](around:3000,{lat},{lng});
          way["landuse"="reservoir"](around:5000,{lat},{lng});
          node["waterway"="storm_drain"](around:2000,{lat},{lng});
        );
        out count;
        """
        
        for overpass_url in OVERPASS_URLS:
            try:
                resp = requests.post(
                    overpass_url,
                    data={"data": query},
                    headers=HEADERS,
                    timeout=12
                )
                resp.raise_for_status()
                elements = resp.json().get("elements", [])
                
                if elements:
                    fountains = len([e for e in elements 
                                  if e.get("tags", {}).get("amenity") == "fountain"])
                    pools = len([e for e in elements 
                               if e.get("tags", {}).get("leisure") == "swimming_pool"])
                    water_towers = len([e for e in elements 
                                     if e.get("tags", {}).get("man_made") == "water_tower"])
                    reservoirs = len([e for e in elements 
                                   if e.get("tags", {}).get("landuse") == "reservoir"])
                    storm_drains = len([e for e in elements 
                                      if e.get("tags", {}).get("waterway") == "storm_drain"])
                    
                    total_count = fountains + pools + water_towers + reservoirs + storm_drains
                    
                    return {
                        "count": total_count,
                        "fountains": fountains,
                        "pools": pools,
                        "water_towers": water_towers,
                        "reservoirs": reservoirs,
                        "storm_drains": storm_drains,
                        "source": "OpenStreetMap Urban Drainage"
                    }
            except Exception:
                continue
                
    except Exception:
        pass
    
    return {"count": 0, "source": "No urban drainage data"}


def _analyze_terrain_drainage(lat: float, lng: float) -> Dict:
    """Analyze terrain impact on drainage using slope estimation."""
    try:
        # Use existing slope analysis if available
        from ..physical_terrain.slope_analysis import get_slope_analysis
        slope_data = get_slope_analysis(lat, lng)
        slope_percent = slope_data.get("slope_percent", 5.0)
        
        # Terrain drainage assessment
        if slope_percent < 1:
            terrain_impact = "Poor"  # Very flat - poor natural drainage
            terrain_score = 20
        elif slope_percent < 3:
            terrain_impact = "Fair"  # Flat - limited drainage
            terrain_score = 40
        elif slope_percent < 8:
            terrain_impact = "Good"  # Moderate slope - good drainage
            terrain_score = 70
        elif slope_percent < 15:
            terrain_impact = "Very Good"  # Good slope - excellent drainage
            terrain_score = 90
        else:
            terrain_impact = "Excellent"  # Steep - rapid drainage
            terrain_score = 95
        
        return {
            "slope_percent": slope_percent,
            "terrain_impact": terrain_impact,
            "terrain_score": terrain_score,
            "source": "Terrain Slope Analysis"
        }
        
    except Exception:
        # Fallback terrain estimation based on geography
        return {
            "slope_percent": 5.0,
            "terrain_impact": "Good",
            "terrain_score": 70,
            "source": "Geographic Terrain Estimation"
        }


def _calculate_comprehensive_drainage_score(waterway_data: Dict, 
                                          infrastructure_data: Dict,
                                          urban_data: Dict,
                                          terrain_data: Dict) -> float:
    """Calculate comprehensive drainage score with proper weighting."""
    
    # Weight factors for different drainage components
    weights = {
        "natural_waterways": 0.35,    # Natural drainage capacity
        "infrastructure": 0.25,        # Man-made drainage systems
        "urban_systems": 0.20,         # Urban drainage infrastructure
        "terrain": 0.20               # Natural terrain drainage
    }
    
    # Calculate component scores
    # Natural waterways score (0-100)
    waterway_density = waterway_data.get("density_per_km2", 0)
    if waterway_density >= 1.0:
        waterway_score = 95
    elif waterway_density >= 0.5:
        waterway_score = 85
    elif waterway_density >= 0.2:
        waterway_score = 75
    elif waterway_density >= 0.1:
        waterway_score = 65
    elif waterway_density >= 0.05:
        waterway_score = 55
    else:
        waterway_score = 45
    
    # Infrastructure score (0-100)
    infra_count = infrastructure_data.get("count", 0)
    if infra_count >= 10:
        infra_score = 95
    elif infra_count >= 5:
        infra_score = 85
    elif infra_count >= 3:
        infra_score = 75
    elif infra_count >= 1:
        infra_score = 65
    else:
        infra_score = 50
    
    # Urban systems score (0-100)
    urban_count = urban_data.get("count", 0)
    if urban_count >= 8:
        urban_score = 95
    elif urban_count >= 5:
        urban_score = 85
    elif urban_count >= 3:
        urban_score = 75
    elif urban_count >= 1:
        urban_score = 65
    else:
        urban_score = 55
    
    # Terrain score (already 0-100)
    terrain_score = terrain_data.get("terrain_score", 70)
    
    # Calculate weighted average
    final_score = (
        waterway_score * weights["natural_waterways"] +
        infra_score * weights["infrastructure"] +
        urban_score * weights["urban_systems"] +
        terrain_score * weights["terrain"]
    )
    
    # Apply bonus for excellent overall drainage
    total_features = (waterway_data.get("count", 0) + 
                     infrastructure_data.get("count", 0) + 
                     urban_data.get("count", 0))
    
    if total_features >= 20:
        final_score = min(100.0, final_score + 5)  # Bonus for excellent drainage
    elif total_features >= 10:
        final_score = min(100.0, final_score + 3)  # Bonus for very good drainage
    
    return round(final_score, 1)


def _calculate_confidence(evidence: Dict) -> float:
    """Calculate confidence based on data availability."""
    confidence = 50.0  # Base confidence
    
    # Add confidence for available data
    if evidence.get("natural_waterways", {}).get("count", 0) > 0:
        confidence += 20
    if evidence.get("drainage_infrastructure", {}).get("count", 0) > 0:
        confidence += 15
    if evidence.get("urban_systems", {}).get("count", 0) > 0:
        confidence += 10
    if evidence.get("terrain_impact", {}).get("terrain_score"):
        confidence += 5
    
    return min(95, confidence)


def _generate_drainage_reasoning(score: float, evidence: Dict) -> str:
    """Generate detailed reasoning with numerical evidence."""
    parts = []
    
    # Natural waterways evidence
    waterway_count = evidence.get("natural_waterways", {}).get("count", 0)
    density = evidence.get("natural_waterways", {}).get("density_per_km2", 0)
    if waterway_count > 0:
        parts.append(f"found {waterway_count} natural waterways ({density:.2f} per km²)")
    
    # Infrastructure evidence
    infra_count = evidence.get("drainage_infrastructure", {}).get("count", 0)
    if infra_count > 0:
        parts.append(f"identified {infra_count} drainage infrastructure elements")
    
    # Urban systems evidence
    urban_count = evidence.get("urban_systems", {}).get("count", 0)
    if urban_count > 0:
        parts.append(f"located {urban_count} urban drainage systems")
    
    # Terrain evidence
    terrain = evidence.get("terrain_impact", {})
    if terrain.get("terrain_impact"):
        parts.append(f"terrain provides {terrain.get('terrain_impact').lower()} natural drainage ({terrain.get('slope_percent', 0):.1f}% slope)")
    
    # Overall assessment
    total_features = evidence.get("total_features", 0)
    if score >= 75:
        parts.append(f"excellent overall drainage capacity with {total_features} drainage features")
    elif score >= 60:
        parts.append(f"good drainage capacity with {total_features} drainage features")
    elif score >= 45:
        parts.append(f"moderate drainage capacity with {total_features} drainage features")
    else:
        parts.append(f"limited drainage capacity with only {total_features} drainage features")
    
    return ". ".join(parts) + "."


def _get_enhanced_fallback_drainage(lat: float, lng: float, error: str) -> Dict:
    """Enhanced fallback with better baseline scoring."""
    try:
        # Regional drainage potential estimation
        region = _get_geographic_region(lat, lng)
        
        regional_drainage = {
            "south_asia": 75.0,  # Monsoon regions - good natural drainage
            "east_asia": 70.0,   # Variable drainage
            "southeast_asia": 80.0,  # Tropical - excellent drainage
            "europe": 65.0,     # Temperate - moderate drainage
            "north_america": 70.0,   # Variable drainage
            "south_america": 75.0,    # Amazon basin - good drainage
            "africa": 60.0,     # Variable drainage
            "oceania": 65.0,    # Moderate drainage
            "other": 62.0      # Unknown
        }
        
        base_score = regional_drainage.get(region, 62.0)
        
        # Adjust for climate
        if abs(lat) < 23.5:  # Tropical/subtropical
            base_score += 5  # Better drainage due to higher rainfall
        elif abs(lat) > 60:  # Polar
            base_score -= 5  # Limited drainage due to permafrost
        
        return {
            "value": round(base_score, 1),
            "label": _drainage_label(base_score),
            "raw": {
                "estimated": True,
                "region": region,
                "climate_adjustment": "tropical" if abs(lat) < 23.5 else "temperate",
                "error": error[:100]
            },
            "unit": "drainage-capacity-index",
            "confidence": 35,
            "source": "Regional Drainage Estimation (Fallback)"
        }
        
    except Exception:
        return {
            "value": 60.0,
            "label": "Good drainage",
            "raw": {"estimated": True, "error": "Complete analysis failure"},
            "unit": "drainage-capacity-index",
            "confidence": 20,
            "source": "Default Drainage Fallback"
        }


def _get_geographic_region(lat: float, lng: float) -> str:
    """Determine geographic region for drainage estimation."""
    if 60 <= lat <= 80 and -10 <= lng <= 40:
        return "europe"
    elif 25 <= lat <= 50 and -130 <= lng <= -60:
        return "north_america"
    elif -55 <= lat <= 15 and -80 <= lng <= -35:
        return "south_america"
    elif -35 <= lat <= 37 and 10 <= lng <= 50:
        return "africa"
    elif 5 <= lat <= 50 and 60 <= lng <= 150:
        return "south_asia"
    elif 20 <= lat <= 50 and 100 <= lng <= 150:
        return "east_asia"
    elif -10 <= lat <= 20 and 95 <= lng <= 140:
        return "southeast_asia"
    elif -10 <= lat <= -45 and 110 <= lng <= 180:
        return "oceania"
    else:
        return "other"