import requests
from datetime import datetime, timedelta
from typing import Dict

OPEN_METEO_ARCHIVE_URL = "https://archive-api.open-meteo.com/v1/archive"


def get_rainfall_analysis(lat: float, lng: float) -> Dict:
    """
    Analyzes annual precipitation patterns using REAL historical data.

    RETURNS (STANDARDIZED ACROSS ENGINE):
    - value : suitability score (0–100)
    - raw   : annual rainfall in mm
    - label : qualitative classification
    """

    end_date = datetime.utcnow().date()
    start_date = end_date - timedelta(days=365)

    params = {
        "latitude": lat,
        "longitude": lng,
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
        "daily": "precipitation_sum",
        "timezone": "auto"
    }

    try:
        resp = requests.get(
            OPEN_METEO_ARCHIVE_URL,
            params=params,
            timeout=15
        )
        resp.raise_for_status()
        data = resp.json()

        daily_precip = data.get("daily", {}).get("precipitation_sum")

        if not daily_precip:
            raise ValueError("No precipitation data returned")

        annual_mm = float(sum(daily_precip))
        # SCORING LOGIC
        if 800.0 <= annual_mm <= 1500.0:
            score = 100.0
            label = "Optimal rainfall"
        elif annual_mm < 800.0:
            score = max(0.0, (annual_mm / 800.0) * 100.0)
            label = "Dry conditions"
        else:
            score = max(0.0, 100.0 - ((annual_mm - 1500.0) / 20.0))
            label = "Excessive rainfall"

        return {
            "value": round(score, 1),       # suitability score
            "raw": round(annual_mm, 1),     # physical rainfall (mm)
            "unit": "mm/year",
            "label": label,
            "confidence": 90,
            "source": "Open-Meteo Historical Weather API",
            "link": "https://open-meteo.com/en/docs/historical-weather-api",
            "vintage": f"{start_date.year}-{end_date.year}",
            "provenance_note": (
                "365-day cumulative precipitation derived from daily historical records."
            )
        }

    except Exception as e:
        # HONEST FAILURE 
        return {
            "value": 75.0,                 # neutral climatic assumption
            "raw": None,
            "unit": "mm/year",
            "label": "Rainfall data unavailable",
            "confidence": 40,
            "source": "Open-Meteo Fallback",
            "error": str(e)
        }
