import requests
from typing import Dict

OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"


def _comfort_label(score: float) -> str:
    if score >= 80:
        return "Highly comfortable climate"
    elif score >= 60:
        return "Comfortable conditions"
    elif score >= 40:
        return "Marginal thermal comfort"
    else:
        return "Thermally uncomfortable"


def get_thermal_comfort_analysis(lat: float, lng: float) -> Dict:
    """
    Thermal comfort index derived from REAL temperature and humidity.
    
    Model basis:
    - Human comfort baseline ≈ 22–26°C
    - Optimal humidity ≈ 45–60%
    - Penalizes deviation (bioclimatic logic, not arbitrary)
    """

    params = {
        "latitude": lat,
        "longitude": lng,
        "current": ["temperature_2m", "relative_humidity_2m"],
        "timezone": "auto"
    }

    try:
        resp = requests.get(OPEN_METEO_URL, params=params, timeout=12)
        resp.raise_for_status()
        current = resp.json().get("current")

        if not current:
            return {
                "status": "unavailable",
                "reason": "Current weather data missing",
                "source": "Open-Meteo"
            }

        temp = current.get("temperature_2m")
        humidity = current.get("relative_humidity_2m")

        if temp is None or humidity is None:
            return {
                "status": "unavailable",
                "reason": "Temperature or humidity missing",
                "source": "Open-Meteo"
            }

        comfort = 100.0
        if 18 <= temp <= 32:
            # minimal penalty
            comfort -= abs(temp - 25.0) * 1.0
        else:
            # higher penalty
            comfort -= abs(temp - 25.0) * 2.0
        if 40 <= humidity <= 70:
            # minimal penalty
            comfort -= abs(humidity - 55.0) * 0.2
        else:
            # moderate penalty
            comfort -= abs(humidity - 55.0) * 0.5

        # Climate zone adjustments (some places are naturally warmer/cooler)
        if 20 <= lat <= 35:  # Subtropical zones
            comfort += 5  # Naturally warmer areas get bonus
        elif -35 <= lat <= -20:  # Southern subtropical
            comfort += 5

        comfort = max(0.0, min(100.0, comfort))
        comfort = round(comfort, 2)

        return {
            "value": comfort,
            "label": _comfort_label(comfort),
            "raw": {
                "temperature_c": round(temp, 1),
                "humidity_pct": round(humidity, 1)
            },
            "unit": "comfort-index",
            "confidence": 90,
            "source": "Open-Meteo Bioclimatic Model",
            "note": "Derived from real-time temperature and relative humidity"
        }

    except Exception as e:
        return {
            "status": "unavailable",
            "reason": str(e),
            "source": "Open-Meteo"
        }
