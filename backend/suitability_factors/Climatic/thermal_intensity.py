# # backend/suitability_factors/Climatic/thermal_intensity.py
# import requests

# def get_thermal_intensity(lat: float, lng: float):
#     """
#     Measures Land Surface Temperature (LST) and Heat Stress.
#     Source: Copernicus Sentinel-3 (SLSTR).
#     """
#     try:
#         # Fetching real-world LST data
#         avg_temp_c = 28.4  # Sample processed return
        
#         return {
#             "value": round(avg_temp_c, 1),
#             "unit": "°C",
#             "source": "Copernicus Sentinel-3 (SLSTR)",
#             "link": "https://sentinel.esa.int/web/sentinel/missions/sentinel-3",
#             "vintage": "2026 Monthly Average",
#             "provenance_note": "Radiative surface temperature derived from thermal infrared bands."
#         }
#     except Exception:
#         return {"value": 25.0, "source": "Climatic Baseline"}

import requests
from typing import Dict

OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"


def _thermal_intensity_label(value: float) -> str:
    if value >= 80:
        return "Low heat stress"
    elif value >= 60:
        return "Moderate heat stress"
    elif value >= 40:
        return "High heat stress"
    else:
        return "Extreme heat stress"


def get_thermal_intensity(lat: float, lng: float) -> Dict:
    """
    Heat stress intensity derived from real forecasted max temperature.
    Fully dynamic, no hard-coded assumptions.
    """

    params = {
        "latitude": lat,
        "longitude": lng,
        "daily": "temperature_2m_max",
        "forecast_days": 7,
        "timezone": "auto"
    }

    try:
        resp = requests.get(OPEN_METEO_URL, params=params, timeout=12)
        resp.raise_for_status()
        daily = resp.json().get("daily", {})

        temps = daily.get("temperature_2m_max")

        if not temps:
            return {
                "status": "unavailable",
                "reason": "Temperature data not available",
                "source": "Open-Meteo"
            }

        avg_max_temp = sum(temps) / len(temps)

        # IMPROVED: Heat stress scoring - more reasonable temperature ranges
        # Good range: 15-35°C gets good scores (70-100)
        # Too cold (<15°C) or very hot (>35°C) gets lower scores
        if 15 <= avg_max_temp <= 35:
            # Good temperature range - high scores
            base_score = 100.0
            if avg_max_temp < 18:
                # Cool but comfortable
                score = base_score - ((18 - avg_max_temp) * 3)
            elif avg_max_temp > 32:
                # Warm but manageable
                score = base_score - ((avg_max_temp - 32) * 4)
            else:
                # Very comfortable range (18-32°C)
                score = base_score
        elif avg_max_temp < 15:
            # Too cold - decreasing scores
            score = max(20, 85 - ((15 - avg_max_temp) * 3))
        else:
            # Very hot - gradually decreasing scores
            score = max(15, 85 - ((avg_max_temp - 35) * 3))
        
        intensity = max(0.0, min(100.0, score))
        intensity = round(intensity, 2)

        return {
            "value": intensity,
            "label": _thermal_intensity_label(intensity),
            "raw": round(avg_max_temp, 2),
            "unit": "heat-index",
            "confidence": 90,
            "source": "Open-Meteo Meteorological Network",
            "note": "Derived from 7-day average daily maximum temperature"
        }

    except Exception as e:
        return {
            "status": "unavailable",
            "reason": str(e),
            "source": "Open-Meteo"
        }
