# import os
# import pymongo
# from flask import Flask, request, jsonify
# import requests
# import numpy as np
# import pickle
# from datetime import datetime
# import logging
# import time
# from flask import send_from_directory

# # --- Configuration & Model Loading ---
# BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
# BASE_DIR = os.path.dirname(BACKEND_DIR)
# MODEL_PATH = os.path.join(BASE_DIR, "ml", "models")

# ML_MODELS = {}
# for name in ("model_xgboost.pkl", "model_rf.pkl"):
#     p = os.path.join(MODEL_PATH, name)
#     if os.path.exists(p):
#         try:
#             with open(p, "rb") as f:
#                 ML_MODELS[name] = pickle.load(f)
#             print(f"Loaded: {name}")
#         except Exception as e:
#             print(f"Failed {name}: {e}")

# from backend.integrations import (
#     compute_suitability_score,
#     estimate_flood_risk_score,
#     compute_proximity_score,
#     estimate_landslide_risk_score,
#     estimate_water_proximity_score,
#     estimate_pollution_score,
#     infer_landuse_score,
#     estimate_soil_quality_score,
#     estimate_rainfall_score,
# )

# app = Flask(__name__, static_folder=os.path.join(BASE_DIR, "frontend", "build"), static_url_path="")
# logger = logging.getLogger(__name__)
# logging.basicConfig(level=logging.INFO)

# @app.route('/suitability', methods=['POST', 'OPTIONS'])
# def suitability():
#     if request.method == 'OPTIONS':
#         return jsonify({}), 200
#     try:
#         data = request.json or {}
#         latitude = float(data.get("latitude", 17.3850))
#         longitude = float(data.get("longitude", 78.4867))

#         # 1. THE EARLY EXIT (Fixes 'Too Much Time' issue)
#         # We check water first. If on water, we stop immediately.
#         w_score, w_dist, w_details = estimate_water_proximity_score(latitude, longitude)

#         if w_score == 0.0 or (w_dist is not None and w_dist < 0.02):
#             water_name = w_details.get('name') if w_details else "an identified water body"
#             return jsonify({
#                 "suitability_score": 0.0,
#                 "label": "Not Suitable (Waterbody)",
#                 "factors": {k: 0.0 for k in ["rainfall", "flood", "landslide", "soil", "proximity", "water", "pollution", "landuse"]},
#                 "reason": f"Coordinates ({latitude}, {longitude}) are on {water_name}. Unsuitable for construction.",
#                 "evidence": {"water_distance_km": 0.0, "water_details": w_details},
#                 "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S IST"),
#                 "location": {"latitude": latitude, "longitude": longitude}
#             })

#         # 2. LAND ANALYSIS (Only runs if the early exit above is skipped)
#         # We wrap these in defensive checks to prevent the 'random errors'
#         rainfall_score, rain_mm = estimate_rainfall_score(latitude, longitude)
#         flood_s = estimate_flood_risk_score(latitude, longitude) or 50.0
#         landslide_s = estimate_landslide_risk_score(latitude, longitude) or 60.0
#         soil_s = estimate_soil_quality_score(latitude, longitude) or 60.0
        
#         # DEFENSIVE FIX: Extract [0] because these adapters return (score, distance, details)
#         prox_result = compute_proximity_score(latitude, longitude)
#         prox_s = prox_result[0] if isinstance(prox_result, tuple) else (prox_result or 50.0)
        
#         poll_result = estimate_pollution_score(latitude, longitude)
#         poll_s = poll_result[0] if isinstance(poll_result, tuple) else (poll_result or 65.0)
        
#         landuse_s = infer_landuse_score(latitude, longitude) or 70.0

#         # 3. ENSEMBLE PREDICTION
#         features = np.array([[rainfall_score, flood_s, landslide_s, soil_s, prox_s, w_score, poll_s, landuse_s]], dtype=float)

#         try:
#             score_xgb = float(ML_MODELS['model_xgboost.pkl'].predict(features)[0])
#             score_rf = float(ML_MODELS['model_rf.pkl'].predict(features)[0])
#             final_score = round((score_xgb + score_rf) / 2, 2)
#             model_used = "Ensemble (XGBoost + Random Forest)"
#         except:
#             agg = compute_suitability_score(
#                 rainfall_score=rainfall_score, flood_risk_score=flood_s,
#                 landslide_risk_score=landslide_s, soil_quality_score=soil_s,
#                 proximity_score=prox_s, water_proximity_score=w_score,
#                 pollution_score=poll_s, landuse_score=landuse_s
#             )
#             final_score = agg.get("score")
#             model_used = "Weighted Aggregator (Fallback)"

#         return jsonify({
#             "suitability_score": final_score,
#             "label": "Highly Suitable" if final_score >= 70 else ("Moderate" if final_score >= 40 else "Unsuitable"),
#             "model_used": model_used,
#             "factors": {
#                 "rainfall": rainfall_score, "flood": flood_s, "landslide": landslide_s,
#                 "soil": soil_s, "proximity": prox_s, "water": w_score,
#                 "pollution": poll_s, "landuse": landuse_s
#             },
#             "evidence": {"water_distance_km": w_dist, "rainfall_total_mm_60d": rain_mm},
#             "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S IST"),
#             "location": {"latitude": latitude, "longitude": longitude}
#         })
#     except Exception as e:
#         logger.exception(f"Suitability error: {e}")
#         return jsonify({"error": str(e)}), 500

# @app.route("/", defaults={"path": ""})
# @app.route('/health', methods=['GET'])
# def health():
#     return jsonify({"status": "ok"}), 200
# @app.route("/<path:path>")
# def serve_react(path):
#     build_dir = app.static_folder
#     if path != "" and os.path.exists(os.path.join(build_dir, path)):
#         return send_from_directory(build_dir, path)
#     return send_from_directory(build_dir, "index.html")

# if __name__ == "__main__":
#     app.run(debug=False, host="0.0.0.0", port=5000, threaded=True)










# import os
# import sys
# import numpy as np
# import pickle
# from datetime import datetime
# import logging
# from flask import Flask, request, jsonify, send_from_directory
# from flask_cors import CORS

# # --- Configuration & Path Logic ---
# BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
# BASE_DIR = os.path.dirname(BACKEND_DIR)
# MODEL_PATH = os.path.join(BASE_DIR, "ml", "models")

# # Ensure the backend directory is in the system path for imports
# if BACKEND_DIR not in sys.path:
#     sys.path.append(BACKEND_DIR)

# # # --- Imports for Nearby Places and Integrations ---
# # try:
# #     from integrations.nearby_places import get_nearby_named_places
# # except ImportError:
# #     from backend.integrations.nearby_places import get_nearby_named_places

# from backend.integrations import (
#     compute_suitability_score,
#     estimate_flood_risk_score,
#     compute_proximity_score,
#     estimate_landslide_risk_score,
#     estimate_water_proximity_score,
#     estimate_pollution_score,
#     infer_landuse_score,
#     estimate_soil_quality_score,
#     estimate_rainfall_score,
# )

# # --- Flask App Initialization ---
# app = Flask(__name__, static_folder=os.path.join(BASE_DIR, "frontend", "build"), static_url_path="")
# CORS(app) # Necessary for cross-origin requests in deployment
# logger = logging.getLogger(__name__)
# logging.basicConfig(level=logging.INFO)

# # --- ML Model Loading ---
# ML_MODELS = {}
# for name in ("model_xgboost.pkl", "model_rf.pkl"):
#     p = os.path.join(MODEL_PATH, name)
#     if os.path.exists(p):
#         try:
#             with open(p, "rb") as f:
#                 ML_MODELS[name] = pickle.load(f)
#             print(f"Loaded: {name}")
#         except Exception as e:
#             print(f"Failed {name}: {e}")

# # --- 1. Health Check Route (Required for Render/Deployment) ---
# @app.route('/health', methods=['GET'])
# def health():
#     return jsonify({"status": "ok"}), 200

# # --- 2. Suitability Analysis Route ---
# @app.route('/suitability', methods=['POST', 'OPTIONS'])
# def suitability():
#     if request.method == 'OPTIONS':
#         return jsonify({}), 200
#     try:
#         data = request.json or {}
#         latitude = float(data.get("latitude", 17.3850))
#         longitude = float(data.get("longitude", 78.4867))

#         # 1. THE EARLY EXIT (Fixes 'Too Much Time' issue)
#         w_score, w_dist, w_details = estimate_water_proximity_score(latitude, longitude)

#         if w_score == 0.0 or (w_dist is not None and w_dist < 0.02):
#             water_name = w_details.get('name') if w_details else "an identified water body"
#             return jsonify({
#                 "suitability_score": 0.0,
#                 "label": "Not Suitable (Waterbody)",
#                 "factors": {k: 0.0 for k in ["rainfall", "flood", "landslide", "soil", "proximity", "water", "pollution", "landuse"]},
#                 "reason": f"Coordinates ({latitude}, {longitude}) are on {water_name}. Unsuitable for construction.",
#                 "evidence": {"water_distance_km": 0.0, "water_details": w_details},
#                 "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S IST"),
#                 "location": {"latitude": latitude, "longitude": longitude}
#             })

#         # 2. LAND ANALYSIS
#         rainfall_score, rain_mm = estimate_rainfall_score(latitude, longitude)
#         flood_s = estimate_flood_risk_score(latitude, longitude) or 50.0
#         landslide_s = estimate_landslide_risk_score(latitude, longitude) or 60.0
#         soil_s = estimate_soil_quality_score(latitude, longitude) or 60.0
        
#         prox_result = compute_proximity_score(latitude, longitude)
#         prox_s = prox_result[0] if isinstance(prox_result, tuple) else (prox_result or 50.0)
        
#         poll_result = estimate_pollution_score(latitude, longitude)
#         poll_s = poll_result[0] if isinstance(poll_result, tuple) else (poll_result or 65.0)
        
#         landuse_s = infer_landuse_score(latitude, longitude) or 70.0

#         # 3. ENSEMBLE PREDICTION
#         features = np.array([[rainfall_score, flood_s, landslide_s, soil_s, prox_s, w_score, poll_s, landuse_s]], dtype=float)

#         try:
#             score_xgb = float(ML_MODELS['model_xgboost.pkl'].predict(features)[0])
#             score_rf = float(ML_MODELS['model_rf.pkl'].predict(features)[0])
#             final_score = round((score_xgb + score_rf) / 2, 2)
#             model_used = "Ensemble (XGBoost + Random Forest)"
#         except Exception:
#             agg = compute_suitability_score(
#                 rainfall_score=rainfall_score, flood_risk_score=flood_s,
#                 landslide_risk_score=landslide_s, soil_quality_score=soil_s,
#                 proximity_score=prox_s, water_proximity_score=w_score,
#                 pollution_score=poll_s, landuse_score=landuse_s
#             )
#             final_score = agg.get("score")
#             model_used = "Weighted Aggregator (Fallback)"

#         return jsonify({
#             "suitability_score": final_score,
#             "label": "Highly Suitable" if final_score >= 70 else ("Moderate" if final_score >= 40 else "Unsuitable"),
#             "model_used": model_used,
#             "factors": {
#                 "rainfall": rainfall_score, "flood": flood_s, "landslide": landslide_s,
#                 "soil": soil_s, "proximity": prox_s, "water": w_score,
#                 "pollution": poll_s, "landuse": landuse_s
#             },
#             "evidence": {"water_distance_km": w_dist, "rainfall_total_mm_60d": rain_mm},
#             "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S IST"),
#             "location": {"latitude": latitude, "longitude": longitude}
#         })
#     except Exception as e:
#         logger.exception(f"Suitability error: {e}")
#         return jsonify({"error": str(e)}), 500

# # --- 3. Nearby Places Route ---
# @app.route("/nearby_places", methods=["POST", "OPTIONS"])
# def nearby_places():
#     if request.method == "OPTIONS":
#         return jsonify({}), 200
#     try:
#         data = request.json or {}
#         lat = float(data.get("latitude"))
#         lon = float(data.get("longitude"))
#         places = get_nearby_named_places(lat, lon)
#         return jsonify({
#             "count": len(places),
#             "places": places
#         })
#     except Exception as e:
#         logger.error(f"Nearby places error: {e}")
#         return jsonify({"count": 0, "places": [], "error": str(e)}), 200

# # --- 4. React Frontend Serving (Production) ---
# # This serves the built React app and supports React Router
# @app.route("/", defaults={"path": ""})
# @app.route("/<path:path>")
# def serve_react(path):
#     build_dir = app.static_folder
#     if path != "" and os.path.exists(os.path.join(build_dir, path)):
#         return send_from_directory(build_dir, path)
#     return send_from_directory(build_dir, "index.html")

# # --- Startup Logic ---
# if __name__ == "__main__":
#     # Render uses environment variable PORT
#     port = int(os.environ.get("PORT", 5000))
#     app.run(debug=False, host="0.0.0.0", port=port, threaded=True)






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

        # 1. WATER EARLY EXIT
        w_score, w_dist, w_meta = estimate_water_proximity_score(latitude, longitude)

        if w_score == 0.0 or (w_dist is not None and w_dist < 0.02):
            water_name = w_meta.get('name') if w_meta else "an identified water body"
            return jsonify({
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
            })

        # 2. LAND ANALYSIS
        rainfall_score, rain_mm = estimate_rainfall_score(latitude, longitude)
        flood_s = estimate_flood_risk_score(latitude, longitude) or 50.0
        landslide_s = estimate_landslide_risk_score(latitude, longitude) or 60.0
        soil_s = estimate_soil_quality_score(latitude, longitude) or 60.0
        
        prox_result = compute_proximity_score(latitude, longitude)
        prox_s = prox_result[0] if isinstance(prox_result, tuple) else (prox_result or 50.0)
        
        poll_result = estimate_pollution_score(latitude, longitude)
        poll_s = poll_result[0] if isinstance(poll_result, tuple) else (poll_result or 65.0)
        
        landuse_s = infer_landuse_score(latitude, longitude) or 70.0

        # 3. ENSEMBLE PREDICTION
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
        return jsonify({
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
                    "flood": {"reason": "Elevation-based flood risk analysis.", "source": "Hydrological Model", "confidence": "Medium"},
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
        })
    except Exception as e:
        logger.exception(f"Suitability error: {e}")
        return jsonify({"error": str(e)}), 500

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