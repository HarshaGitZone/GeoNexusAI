# import requests
# from datetime import datetime

# def get_ndvi_data(lat: float, lng: float):
#     """
#     Fetches real-time NDVI via Sentinel-2 Multispectral Imagery.
#     Source: ESA Copernicus Program (2025-2026 Baseline).
#     """
#     # In a production environment, use Sentinel Hub or a processed Tile API
#     # Here we simulate the processed return from a Sentinel-2 L2A data stream
#     try:
#         # Example API Call: 
#         # resp = requests.get(f"https://services.sentinel-hub.com/ogc/wms/{API_KEY}...")
        
#         # Logic: We use the 10m resolution Red and NIR bands to calculate NDVI
#         # NDVI = (NIR - Red) / (NIR + Red)
        
#         # Real-time data synthesis
#         ndvi_value = 0.42 # This would be the actual float from the API
        
#         return {
#             "value": ndvi_value,
#             "label": _classify_ndvi(ndvi_value),
#             "resolution": "10m",
#             "source": "Copernicus Sentinel-2 L2A",
#             "link": "https://sentinels.copernicus.eu/web/sentinel/missions/sentinel-2",
#             "vintage": "2025-2026",
#             "provenance_note": "Bottom-of-Atmosphere (BOA) reflectance used for accuracy."
#         }
#     except Exception as e:
#         return {"value": 0.5, "error": str(e), "source": "Fallback Baseline"}

# def _classify_ndvi(val):
#     if val > 0.6: return "Dense Forest"
#     if val > 0.4: return "Agricultural/Sparse Vegetation"
#     if val > 0.2: return "Urban/Shrubland"
#     return "Barren/Water"
import requests
from typing import Dict
from datetime import datetime, timedelta

OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"
OPEN_METEO_ARCHIVE_URL = "https://archive-api.open-meteo.com/v1/archive"
OVERPASS_URLS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.openstreetmap.ru/api/interpreter",
]

HEADERS = {
    "User-Agent": "GeoAI_VegetationAnalysis/2.0",
    "Accept": "application/json"
}


def _vegetation_label(index: float) -> str:
    """Enhanced vegetation classification for residential areas."""
    if index is None:
        return "Vegetation data unavailable"
    if index < 20:
        return "Minimal Greenery"
    elif index < 35:
        return "Limited Greenery"
    elif index < 50:
        return "Moderate Greenery"
    elif index < 70:
        return "Good Greenery"
    elif index < 85:
        return "Excellent Greenery"
    else:
        return "Outstanding Greenery"


def get_ndvi_data(lat: float, lng: float) -> Dict:
    """
    Enhanced vegetation analysis focusing on RESIDENTIAL greenery and livability.
    
    Measures what actually matters for residents:
    1. Parks, gardens, and green spaces
    2. Street trees and urban forestry
    3. Residential landscaping quality
    4. Natural areas and recreational green spaces
    
    NOT agricultural crop production or soil moisture.
    """

    # 1. 🌳 URBAN GREEN SPACE ANALYSIS (Primary for residential areas)
    try:
        green_space_data = _analyze_urban_green_spaces(lat, lng)
        if green_space_data["found"]:
            return {
                "value": green_space_data["score"],
                "label": _vegetation_label(green_space_data["score"]),
                "raw": green_space_data["score"] / 100.0,
                "unit": "greenery-index",
                "confidence": green_space_data["confidence"],
                "source": "OpenStreetMap Green Space Analysis",
                "details": green_space_data["details"],
                "note": f"Found {green_space_data['total_features']} green spaces: {green_space_data['summary']}"
            }
    except Exception:
        pass

    # 2. 🌿 RESIDENTIAL LANDSCAPING ANALYSIS
    try:
        landscaping_data = _analyze_residential_landscaping(lat, lng)
        if landscaping_data["found"]:
            return {
                "value": landscaping_data["score"],
                "label": _vegetation_label(landscaping_data["score"]),
                "raw": landscaping_data["score"] / 100.0,
                "unit": "greenery-index",
                "confidence": landscaping_data["confidence"],
                "source": "OpenStreetMap Residential Landscaping",
                "details": landscaping_data["details"],
                "note": f"Residential landscaping quality: {landscaping_data['summary']}"
            }
    except Exception:
        pass

    # 3. 🏞️ NATURAL AREAS ANALYSIS
    try:
        natural_data = _analyze_natural_areas(lat, lng)
        if natural_data["found"]:
            return {
                "value": natural_data["score"],
                "label": _vegetation_label(natural_data["score"]),
                "raw": natural_data["score"] / 100.0,
                "unit": "greenery-index",
                "confidence": natural_data["confidence"],
                "source": "OpenStreetMap Natural Areas",
                "details": natural_data["details"],
                "note": f"Natural areas nearby: {natural_data['summary']}"
            }
    except Exception:
        pass

    # 4. 🚫 WATER BODY CHECK (Only for complete absence of vegetation)
    try:
        from ..hydrology.water_utility import get_water_utility
        water_data = get_water_utility(lat, lng)
        water_distance = water_data.get("distance_km")
        
        if water_distance is not None and water_distance < 0.05:  # 50m from water
            return {
                "value": 5.0,  # Minimal vegetation on immediate water
                "label": "Water Body - Minimal Greenery",
                "raw": 0.05,
                "unit": "greenery-index",
                "confidence": 90,
                "source": "Water Body Detection",
                "details": {"water_distance_m": water_distance * 1000},
                "note": "Location very close to water body - minimal vegetation"
            }
    except Exception:
        pass

    # 5. 🌍 CLIMATE-BASED GREENERY ESTIMATION (Fallback)
    try:
        climate_data = _estimate_climate_greenery(lat, lng)
        return {
            "value": climate_data["score"],
            "label": _vegetation_label(climate_data["score"]),
            "raw": climate_data["score"] / 100.0,
            "unit": "greenery-index",
            "confidence": 60,
            "source": "Climate-Based Greenery Estimation",
            "details": climate_data["details"],
            "note": f"Estimated from climate conditions: {climate_data['summary']}"
        }
    except Exception:
        pass

    # 6. 📊 REGIONAL BASELINE (Final fallback)
    return {
        "value": 55.0,  # Reasonable baseline for residential areas
        "label": "Moderate Greenery (Regional Baseline)",
        "raw": 0.55,
        "unit": "greenery-index",
        "confidence": 40,
        "source": "Regional Greenery Baseline",
        "details": {"region": _get_region(lat, lng)},
        "note": "Regional baseline applied - typical greenery for this area"
    }


def _analyze_urban_green_spaces(lat: float, lng: float) -> Dict:
    """Analyze parks, gardens, and recreational green spaces."""
    try:
        query = f"""
        [out:json][timeout:20];
        (
          node["leisure"="park"](around:2000,{lat},{lng});
          node["leisure"="garden"](around:1000,{lat},{lng});
          node["leisure"="common"](around:1500,{lat},{lng});
          way["leisure"="park"](around:2000,{lat},{lng});
          way["leisure"="garden"](around:1000,{lat},{lng});
          node["landuse"="grass"](around:1500,{lat},{lng});
          way["landuse"="grass"](around:1500,{lat},{lng});
          node["landuse"="recreation_ground"](around:2000,{lat},{lng});
          way["landuse"="recreation_ground"](around:2000,{lat},{lng});
          node["leisure"="sports_centre"](around:1500,{lat},{lng});
          node["leisure"="pitch"](around:1000,{lat},{lng});
        );
        out count;
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
                    # Count different types of green spaces
                    parks = len([e for e in elements 
                               if e.get("tags", {}).get("leisure") == "park"])
                    gardens = len([e for e in elements 
                                if e.get("tags", {}).get("leisure") == "garden"])
                    common = len([e for e in elements 
                               if e.get("tags", {}).get("leisure") == "common"])
                    grass_areas = len([e for e in elements 
                                   if e.get("tags", {}).get("landuse") == "grass"])
                    recreation = len([e for e in elements 
                                  if e.get("tags", {}).get("landuse") == "recreation_ground"])
                    sports = len([e for e in elements 
                               if e.get("tags", {}).get("leisure") == "sports_centre"])
                    pitches = len([e for e in elements 
                               if e.get("tags", {}).get("leisure") == "pitch"])
                    
                    total_features = parks + gardens + common + grass_areas + recreation + sports + pitches
                    
                    # Enhanced scoring for residential areas
                    if total_features >= 8:
                        score = 90.0  # Outstanding greenery
                    elif total_features >= 5:
                        score = 80.0  # Excellent greenery
                    elif total_features >= 3:
                        score = 70.0  # Good greenery
                    elif total_features >= 2:
                        score = 60.0  # Moderate greenery
                    elif total_features >= 1:
                        score = 45.0  # Limited greenery
                    else:
                        score = 30.0  # Minimal greenery
                    
                    # Bonus for parks (most valuable green spaces)
                    if parks >= 2:
                        score = min(100.0, score + 5)
                    elif parks >= 1:
                        score = min(100.0, score + 3)
                    
                    return {
                        "found": True,
                        "score": score,
                        "confidence": 85,
                        "total_features": total_features,
                        "details": {
                            "parks": parks,
                            "gardens": gardens,
                            "common": common,
                            "grass_areas": grass_areas,
                            "recreation": recreation,
                            "sports": sports,
                            "pitches": pitches
                        },
                        "summary": f"{parks} parks, {gardens} gardens, {grass_areas} grass areas"
                    }
            except Exception:
                continue
                
    except Exception:
        pass
    
    return {"found": False, "score": 0, "confidence": 0}


def _analyze_residential_landscaping(lat: float, lng: float) -> Dict:
    """Analyze residential landscaping quality and urban trees."""
    try:
        query = f"""
        [out:json][timeout:20];
        (
          node["natural"="tree"](around:500,{lat},{lng});
          way["natural"="tree_row"](around:1000,{lat},{lng});
          node["highway"="residential"](around:300,{lat},{lng});
          way["highway"="residential"](around:300,{lat},{lng});
          node["landuse"="residential"](around:500,{lat},{lng});
          way["landuse"="residential"](around:500,{lat},{lng});
          node["leisure"="garden"](around:500,{lat},{lng});
          way["leisure"="garden"](around:500,{lat},{lng});
        );
        out count;
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
                    # Count residential features
                    trees = len([e for e in elements 
                              if e.get("tags", {}).get("natural") == "tree"])
                    tree_rows = len([e for e in elements 
                                  if e.get("tags", {}).get("natural") == "tree_row"])
                    residential = len([e for e in elements 
                                   if e.get("tags", {}).get("highway") == "residential" or 
                                   e.get("tags", {}).get("landuse") == "residential"])
                    gardens = len([e for e in elements 
                                if e.get("tags", {}).get("leisure") == "garden"])
                    
                    total_features = trees + tree_rows + residential + gardens
                    
                    # Scoring based on residential greenery quality
                    if total_features >= 10:
                        score = 75.0  # Excellent residential landscaping
                    elif total_features >= 6:
                        score = 65.0  # Good residential landscaping
                    elif total_features >= 3:
                        score = 55.0  # Moderate residential landscaping
                    elif total_features >= 1:
                        score = 45.0  # Basic residential landscaping
                    else:
                        score = 35.0  # Minimal residential landscaping
                    
                    # Bonus for trees (very valuable in residential areas)
                    if trees >= 5:
                        score = min(100.0, score + 8)
                    elif trees >= 2:
                        score = min(100.0, score + 4)
                    
                    return {
                        "found": True,
                        "score": score,
                        "confidence": 80,
                        "total_features": total_features,
                        "details": {
                            "trees": trees,
                            "tree_rows": tree_rows,
                            "residential_areas": residential,
                            "gardens": gardens
                        },
                        "summary": f"{trees} individual trees, {tree_rows} tree rows, {gardens} gardens"
                    }
            except Exception:
                continue
                
    except Exception:
        pass
    
    return {"found": False, "score": 0, "confidence": 0}


def _analyze_natural_areas(lat: float, lng: float) -> Dict:
    """Analyze nearby natural areas and forests."""
    try:
        query = f"""
        [out:json][timeout:20];
        (
          node["natural"="wood"](around:3000,{lat},{lng});
          way["natural"="wood"](around:3000,{lat},{lng});
          node["natural"="forest"](around:5000,{lat},{lng});
          way["natural"="forest"](around:5000,{lat},{lng});
          node["landuse"="forest"](around:5000,{lat},{lng});
          way["landuse"="forest"](around:5000,{lat},{lng});
          node["natural"="scrub"](around:2000,{lat},{lng});
          node["natural"="heath"](around:2000,{lat},{lng});
        );
        out count;
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
                    # Count natural features
                    woods = len([e for e in elements 
                               if e.get("tags", {}).get("natural") == "wood"])
                    forests = len([e for e in elements 
                                if e.get("tags", {}).get("natural") == "forest" or 
                                   e.get("tags", {}).get("landuse") == "forest"])
                    scrub = len([e for e in elements 
                              if e.get("tags", {}).get("natural") == "scrub"])
                    heath = len([e for e in elements 
                              if e.get("tags", {}).get("natural") == "heath"])
                    
                    total_features = woods + forests + scrub + heath
                    
                    # Natural areas are very valuable for residents
                    if total_features >= 3:
                        score = 85.0  # Outstanding natural access
                    elif total_features >= 2:
                        score = 75.0  # Excellent natural access
                    elif total_features >= 1:
                        score = 65.0  # Good natural access
                    else:
                        score = 50.0  # Limited natural access
                    
                    # Bonus for forests (most valuable)
                    if forests >= 1:
                        score = min(100.0, score + 5)
                    
                    return {
                        "found": True,
                        "score": score,
                        "confidence": 75,
                        "total_features": total_features,
                        "details": {
                            "woods": woods,
                            "forests": forests,
                            "scrub": scrub,
                            "heath": heath
                        },
                        "summary": f"{forests} forests, {woods} woodlands, {scrub} scrub areas"
                    }
            except Exception:
                continue
                
    except Exception:
        pass
    
    return {"found": False, "score": 0, "confidence": 0}


def _estimate_climate_greenery(lat: float, lng: float) -> Dict:
    """Estimate greenery potential based on climate conditions."""
    try:
        end_date = datetime.utcnow().date()
        start_date = end_date - timedelta(days=90)
        
        params = {
            "latitude": lat,
            "longitude": lng,
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "daily": "precipitation_sum,temperature_2m_mean",
            "timezone": "auto"
        }
        
        resp = requests.get(OPEN_METEO_ARCHIVE_URL, params=params, timeout=15)
        resp.raise_for_status()
        data = resp.json()
        
        daily = data.get("daily", {})
        precip = daily.get("precipitation_sum", [])
        temps = daily.get("temperature_2m_mean", [])
        
        if not precip or not temps:
            raise ValueError("No climate data available")
        
        # Calculate climate metrics
        total_precip = sum(p for p in precip if p is not None)
        avg_temp = sum(t for t in temps if t is not None) / len([t for t in temps if t is not None])
        
        # Climate-based greenery estimation for residential areas
        # Moderate precipitation + moderate temperature = good residential greenery
        precip_factor = min(1.0, total_precip / 300.0)  # 300mm in 90 days = good for gardens
        temp_factor = max(0.0, 1.0 - abs(avg_temp - 20) / 25.0)  # Optimal around 20°C for gardens
        
        greenery_index = (precip_factor * 0.6 + temp_factor * 0.4)
        greenery_score = round(greenery_index * 100, 2)
        
        # Regional adjustment for typical greenery
        region = _get_region(lat, lng)
        regional_adjustment = {
            "north_america": 5.0,
            "europe": 8.0,     # Good urban planning
            "asia": 3.0,      # Variable
            "oceania": 7.0,    # Good climate
            "south_america": 2.0,
            "africa": 0.0,
            "other": 4.0
        }
        
        final_score = max(30.0, min(80.0, greenery_score + regional_adjustment.get(region, 0.0)))
        
        return {
            "score": final_score,
            "confidence": 60,
            "details": {
                "precip_90d_mm": round(total_precip, 1),
                "avg_temp_c": round(avg_temp, 1),
                "region": region
            },
            "summary": f"Climate supports {final_score:.0f}% greenery potential"
        }
        
    except Exception:
        return {"score": 50.0, "confidence": 20, "details": {}, "summary": "Climate data unavailable"}


def _get_region(lat: float, lng: float) -> str:
    """Get geographic region for climate adjustments."""
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
