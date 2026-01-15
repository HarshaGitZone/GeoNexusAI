import os
import sys
import numpy as np
import pickle
from datetime import datetime
import logging
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

# --- Configuration & Path Logic ---
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.dirname(BACKEND_DIR)
MODEL_PATH = os.path.join(BASE_DIR, "ml", "models")

if BACKEND_DIR not in sys.path:
    sys.path.append(BACKEND_DIR)

from backend.integrations import (
    compute_suitability_score,
    estimate_flood_risk_score,
    compute_proximity_score,
    estimate_landslide_risk_score,
    estimate_water_proximity_score,
    estimate_pollution_score,
    infer_landuse_score,
    estimate_soil_quality_score,
    estimate_rainfall_score,
    nearby_places,
)

# --- Flask App Initialization ---
app = Flask(__name__, static_folder=os.path.join(BASE_DIR, "frontend", "build"), static_url_path="")
CORS(app) 
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

# --- ANALYSIS CACHE (In-Memory) ---
# Caches analysis results by coordinate to ensure identical results for same location
ANALYSIS_CACHE = {}

def get_cache_key(lat, lng):
    """Generate cache key with 4 decimal precision"""
    return f"{float(lat):.4f},{float(lng):.4f}"

# --- ML Model Loading ---
ML_MODELS = {}
for name in ("model_xgboost.pkl", "model_rf.pkl"):
    p = os.path.join(MODEL_PATH, name)
    if os.path.exists(p):
        try:
            with open(p, "rb") as f:
                ML_MODELS[name] = pickle.load(f)
            print(f"Loaded: {name}")
        except Exception as e:
            print(f"Failed {name}: {e}")

# --- 1. Health Check Route (Fixes Render 404/Timeout) ---
@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy"}), 200

# --- 2. Suitability Analysis Route ---
@app.route('/suitability', methods=['POST', 'OPTIONS'])
def suitability():
    if request.method == 'OPTIONS':
        return jsonify({}), 200
    try:
        data = request.json or {}
        latitude = float(data.get("latitude", 17.3850))
        longitude = float(data.get("longitude", 78.4867))

        # CHECK CACHE FIRST - Ensure identical results for same location
        cache_key = get_cache_key(latitude, longitude)
        if cache_key in ANALYSIS_CACHE:
            logger.info(f"Returning cached result for {cache_key}")
            return jsonify(ANALYSIS_CACHE[cache_key])

        # PROCEED WITH ANALYSIS AND CACHE THE RESULT
        result = _perform_suitability_analysis(latitude, longitude)
        ANALYSIS_CACHE[cache_key] = result
        return jsonify(result)

    except Exception as e:
        logger.exception(f"Suitability error: {e}")
        return jsonify({"error": str(e)}), 500

def _perform_suitability_analysis(latitude: float, longitude: float) -> dict:

        # 1. WATER EARLY EXIT
        w_score, w_dist, w_meta = estimate_water_proximity_score(latitude, longitude)
        w_score = round(w_score, 2) if w_score else 0.0

        if w_score == 0.0 or (w_dist is not None and w_dist < 0.02):
            water_name = w_meta.get('name') if w_meta else "an identified water body"
            return {
                "suitability_score": 0.0,
                "label": "Not Suitable (Waterbody)",
                "factors": {k: 0.0 for k in ["rainfall", "flood", "landslide", "soil", "proximity", "water", "pollution", "landuse"]},
                "reason": f"Location is on {water_name}. Unsuitable for construction.",
                "explanation": {
                    "factors_meta": {
                        "water": {
                            "reason": w_meta.get("detail", f"Directly on {water_name}"),
                            "source": w_meta.get("source", "Satellite"),
                            "confidence": "High"
                        }
                    }
                },
                "evidence": {"water_distance_km": 0.0, "water_details": w_meta},
                "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S IST")
            }
        # 2. FOREST/PROTECTED AREA EARLY EXIT
        landuse_s = infer_landuse_score(latitude, longitude) or 70.0
        landuse_s = round(landuse_s, 2) if landuse_s else 70.0
        
        if landuse_s is not None and landuse_s <= 10.0:
            return {
                "suitability_score": 10.0,
                "label": "Not Suitable (Protected/Forest Area)",
                "factors": {
                    "rainfall": 0.0,
                    "flood": 0.0,
                    "landslide": 0.0,
                    "soil": 0.0,
                    "proximity": 0.0,
                    "water": 0.0,
                    "pollution": 0.0,
                    "landuse": 0.0
                },
                "reason": "Location is in a forest or protected environmental area. Unsuitable for construction.",
                "explanation": {
                    "factors_meta": {
                        "landuse": {
                            "reason": "Forest, woodland, or protected conservation area detected via OpenStreetMap. This land cannot be developed.",
                            "source": "OpenStreetMap / Overpass API",
                            "confidence": "High"
                        }
                    }
                },
                "evidence": {"landuse_score": landuse_s, "landuse_type": "Forest/Protected Area"},
                "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S IST"),
                "location": {"latitude": latitude, "longitude": longitude}
            }

        # 3. LAND ANALYSIS
        rainfall_score, rain_mm = estimate_rainfall_score(latitude, longitude)
        flood_s = round(estimate_flood_risk_score(latitude, longitude) or 50.0, 2)
        landslide_s = round(estimate_landslide_risk_score(latitude, longitude) or 60.0, 2)
        soil_s = round(estimate_soil_quality_score(latitude, longitude) or 60.0, 2)
        
        prox_result = compute_proximity_score(latitude, longitude)
        prox_s = round(prox_result[0] if isinstance(prox_result, tuple) else (prox_result or 50.0), 2)
        
        poll_result = estimate_pollution_score(latitude, longitude)
        poll_s = round(poll_result[0] if isinstance(poll_result, tuple) else (poll_result or 65.0), 2)
        
        rainfall_score = round(rainfall_score, 2)

        # 4. ENSEMBLE PREDICTION
        features = np.array([[rainfall_score, flood_s, landslide_s, soil_s, prox_s, w_score, poll_s, landuse_s]], dtype=float)

        try:
            score_xgb = float(ML_MODELS['model_xgboost.pkl'].predict(features)[0])
            score_rf = float(ML_MODELS['model_rf.pkl'].predict(features)[0])
            final_score = round((score_xgb + score_rf) / 2, 2)
            model_used = "Ensemble (XGBoost + Random Forest)"
        except Exception:
            agg = compute_suitability_score(
                rainfall_score=rainfall_score, flood_risk_score=flood_s,
                landslide_risk_score=landslide_s, soil_quality_score=soil_s,
                proximity_score=prox_s, water_proximity_score=w_score,
                pollution_score=poll_s, landuse_score=landuse_s
            )
            final_score = agg.get("score")
            model_used = "Weighted Aggregator (Fallback)"

        # 4. FINAL RESPONSE WITH METADATA (Populates Evidence Detail Section)
        return {
            "suitability_score": final_score,
            "label": "Highly Suitable" if final_score >= 70 else ("Moderate" if final_score >= 40 else "Unsuitable"),
            "model_used": model_used,
            "factors": {
                "rainfall": rainfall_score, "flood": flood_s, "landslide": landslide_s,
                "soil": soil_s, "proximity": prox_s, "water": w_score,
                "pollution": poll_s, "landuse": landuse_s
            },
            "explanation": {
                "factors_meta": {
                    "water": {
                        "reason": w_meta.get("detail", "Water body distance analyzed."),
                        "source": w_meta.get("source", "Map Engine"),
                        "confidence": "High"
                    },
                    "rainfall": {"reason": f"Rainfall total: {rain_mm}mm over 60 days.", "source": "Meteorological Data", "confidence": "Medium"},
                    "flood": {
                        "reason": (
                            f"Based on water proximity ({w_dist} km away): " if w_dist else "Elevation-based flood risk analysis: "
                        ) + (
                            "Extreme flood risk on river banks." if (w_dist and w_dist < 0.3) else
                            "High flood risk near water body." if (w_dist and w_dist < 0.8) else
                            "Moderate flood risk in buffer zone." if (w_dist and w_dist < 1.5) else
                            "Low flood risk, distance from water." if (w_dist and w_dist < 3.0) else
                            "Very low flood risk, far from water bodies." if w_dist else
                            "Flood risk based on elevation and terrain."
                        ),
                        "source": "Water Proximity + Hydrological Model",
                        "confidence": "High" if w_dist else "Medium"
                    },
                    "landslide": {"reason": "Slope and soil stability calculation.", "source": "Terrain Analysis", "confidence": "Medium"},
                    "soil": {"reason": "USDA/Regional soil profile data.", "source": "Soil Survey", "confidence": "Medium"},
                    "proximity": {"reason": "Distance to roads and urban centers.", "source": "Infrastructure Data", "confidence": "High"},
                    "pollution": {"reason": "Air quality and aerosol density index.", "source": "Environmental Sensors", "confidence": "Medium"},
                    "landuse": {"reason": "Satellite land cover categorization.", "source": "Remote Sensing", "confidence": "High"}
                }
            },
            "evidence": {"water_distance_km": w_dist, "rainfall_total_mm_60d": rain_mm},
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S IST"),
            "location": {"latitude": latitude, "longitude": longitude}
        }

@app.route("/nearby_places", methods=["POST", "OPTIONS"])
def nearby_places_route():
    if request.method == "OPTIONS":
        return jsonify({}), 200

    try:
        data = request.json or {}
        lat = float(data["latitude"])
        lon = float(data["longitude"])

        places = nearby_places.get_nearby_named_places(lat, lon)

        return jsonify({
            "count": len(places),
            "places": places
        })

    except Exception as e:
        return jsonify({
            "count": 0,
            "places": [],
            "error": str(e)
        }), 200

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_react(path):
    build_dir = app.static_folder
    if path != "" and os.path.exists(os.path.join(build_dir, path)):
        return send_from_directory(build_dir, path)
    return send_from_directory(build_dir, "index.html")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=False, host="0.0.0.0", port=port, threaded=True)