# import os
# import pymongo
# from flask import Flask, request, jsonify
# import requests
# from sklearn.preprocessing import MinMaxScaler
# import numpy as np
# # from sklearn.ensemble import RandomForestRegressor
# import pickle
# from datetime import datetime
# import logging
# # from flask_cors import CORS
# import time
# # from typing import Optional, Dict
# from flask import send_from_directory
# # BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))

# BASE_DIR = os.path.dirname(BACKEND_DIR)  # project root
# MODEL_PATH = os.path.join(BASE_DIR, "ml", "models")



# # Attempt to load optional trained models: water detector, suitability regressor, optional xgboost
# ML_MODELS = {}
# for name in ("water_detector.pkl", "suitability_regressor.pkl", "model_xgboost.pkl"):
#     p = os.path.join(MODEL_PATH, name)
#     if os.path.exists(p):
#         try:
#             with open(p, "rb") as f:
#                 ML_MODELS[name] = pickle.load(f)
#             print(f"Loaded model: {name}")
#         except Exception as e:
#             print(f"Failed loading {name}: {e}")

# logger = logging.getLogger(__name__)


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
# from backend.integrations.rainfall_adapter import get_rainfall_totals

# # Helper wrappers for ML model predictions (if models are present)
# def _predict_water_probability(feature_vec):
#     # feature_vec: array-like matching training order
#     mdl = ML_MODELS.get("water_detector.pkl")
#     if mdl is None:
#         return None
#     try:
#         proba = mdl.predict_proba(np.asarray(feature_vec).reshape(1, -1))[0]
#         # assume class 1 is 'on water'
#         if len(proba) == 2:
#             return float(proba[1])
#         return float(proba[-1])
#     except Exception:
#         return None


# def _predict_suitability_with_confidence(feature_vec):
#     # returns (pred_mean, pred_std, model_name)
#     results = []
#     names = []
#     if "suitability_regressor.pkl" in ML_MODELS:
#         mdl = ML_MODELS["suitability_regressor.pkl"]
#         try:
#             if hasattr(mdl, "estimators_"):
#                 preds = np.array([est.predict(np.asarray(feature_vec).reshape(1, -1))[0] for est in mdl.estimators_])
#                 results.append(preds)
#                 names.append("rf_regressor")
#             else:
#                 pred = float(mdl.predict(np.asarray(feature_vec).reshape(1, -1))[0])
#                 results.append(np.array([pred]))
#                 names.append("regressor")
#         except Exception:
#             pass
#     if "model_xgboost.pkl" in ML_MODELS:
#         mdl = ML_MODELS["model_xgboost.pkl"]
#         try:
#             pred = float(mdl.predict(np.asarray(feature_vec).reshape(1, -1))[0])
#             results.append(np.array([pred]))
#             names.append("xgboost")
#         except Exception:
#             pass

#     if not results:
#         return None, None, None

#     # stack
#     all_preds = np.concatenate(results)
#     mean = float(np.mean(all_preds))
#     std = float(np.std(all_preds))
#     model_name = ",".join(names)
#     return mean, std, model_name


# # Set up logging
# logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')


# def _load_env_if_present():
#     try:
#         dotenv_path = os.path.join(BASE_DIR, ".env")
#         if os.path.exists(dotenv_path):
#             with open(dotenv_path, "r", encoding="utf-8") as f:
#                 for line in f:
#                     line = line.strip()
#                     if not line or line.startswith("#") or "=" not in line:
#                         continue
#                     key, val = line.split("=", 1)
#                     key = key.strip()
#                     val = val.strip().strip('"').strip("'")
#                     os.environ.setdefault(key, val)
#     except Exception:
#         pass


# _load_env_if_present()

# # app = Flask(__name__)
# # CORS(app)  


# # app = Flask(
# #     __name__,
# #     static_folder=os.path.join(BASE_DIR, "../frontend/build"),
# #     template_folder=os.path.join(BASE_DIR, "../frontend/build")
# # )
# app = Flask(
#     __name__,
#     static_folder=os.path.join(BASE_DIR, "frontend", "build"),
#     static_url_path=""
# )




# @app.route('/health', methods=['GET'])
# def health():
# 	return jsonify({"status": "ok"}), 200


# # Basic request/response logging for easier diagnosis
# @app.before_request
# def _log_request():
# 	try:
# 		logger.info(f"REQ {request.method} {request.path} args={dict(request.args)}")
# 	except Exception:
# 		pass

# @app.after_request
# def _log_response(resp):
# 	try:
# 		logger.info(f"RES {request.method} {request.path} status={resp.status_code}")
# 	except Exception:
# 		pass
# 	return resp

# # MongoDB Connection with retry logic
# def get_mongo_connection():
#     max_retries = 5
#     for attempt in range(max_retries):
#         try:
#             mongo_uri = os.getenv("GEOAI_MONGO_URI", "mongodb://localhost:27017/")
#             client = pymongo.MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
#             client.server_info()  # Test connection
#             db = client["GeoAI"]
#             collection = db["land_data"]

#             if "land_data" not in db.list_collection_names():
#                 db.create_collection("land_data")
#                 # Insert sample data to avoid empty collection
#                 collection.insert_one({
#                     "type": "weather",
#                     "data": {"daily": {"rainfall_sum": [10, 20, 30]}},
#                     "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S IST")
#                 })
#                 collection.insert_one({"type": "flood", "history": ["2023-06-15"]})

#             logger.info("Successfully connected to MongoDB and initialized data")
#             return client, db, collection

#         except Exception as e:
#             logger.warning(f"Connection attempt {attempt + 1}/{max_retries} failed: {e}")
#             if attempt == max_retries - 1:
#                 logger.error("Max retries reached, aborting")
#                 raise
#             time.sleep(2)  

#     return None, None, None


# client, db, collection = get_mongo_connection()

# # Ingest Weather Data from Open-Meteo API (optional, uses sample if API fails)
# def ingest_weather_data(latitude=17.3850, longitude=78.4867, start_date="2024-01-01", end_date="2024-12-31"):
#     try:
#         url = f"https://api.open-meteo.com/v1/history   ?latitude={latitude}&longitude={longitude}&start_date={start_date}&end_date={end_date}&daily=rainfall_sum"
#         response = requests.get(url, timeout=10)
#         response.raise_for_status()
#         weather_data = response.json()
#         if "daily" in weather_data and "rainfall_sum" in weather_data["daily"]:
#             collection.insert_one({
#                 "type": "weather",
#                 "data": weather_data,
#                 "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S IST")
#             })
#             logger.info(f"Successfully ingested weather data for {latitude}, {longitude}")
#         else:
#             logger.warning("Weather data missing rainfall_sum, using fallback")
#             weather_data = {"daily": {"rainfall_sum": [0]}}
#     except requests.RequestException as e:
#         logger.error(f"API request failed, using fallback data: {e}")
#         weather_data = {"daily": {"rainfall_sum": [0]}}
#     return weather_data

# # Prepare Data
# def prepare_data():
#     data = list(collection.find())
#     rainfall_values = []
#     for d in data:
#         if "data" in d and "daily" in d["data"] and "rainfall_sum" in d["data"]["daily"]:
#             rainfall_values.extend(d["data"]["daily"]["rainfall_sum"])
#     if not rainfall_values:
#         rainfall_values = [10, 20, 30]  

#     scaler = MinMaxScaler()
#     normalized_rainfall = scaler.fit_transform([[x] for x in rainfall_values])

#     for i, doc in enumerate(data):
#         if "data" in doc and "daily" in doc["data"]:
#             doc["data"]["normalized_rainfall"] = float(normalized_rainfall[i % len(normalized_rainfall)][0])
#             collection.update_one({"_id": doc["_id"]}, {"$set": doc})
#     return normalized_rainfall


# # def train_model():
# #     data = list(collection.find())
# #     X, y = [], []
# #     for d in data:
# #         if "data" in d and "normalized_rainfall" in d["data"]:
# #             rainfall = d["data"]["normalized_rainfall"]
# #             flood_count = len(d.get("flood", {}).get("history", [])) if "flood" in d else 0
# #             soil_quality = np.random.uniform(0, 1)
# #             X.append([rainfall, flood_count, soil_quality])
# #             suitability = 100 - (rainfall * 50 + flood_count * 20 + (1 - soil_quality) * 30)
# #             y.append(max(0, min(100, suitability)))
# #     if not X:
# #         X = [[0.5, 0, 0.5]]
# #         y = [50]
# #     X = np.array(X)
# #     y = np.array(y)
# #     model = RandomForestRegressor(n_estimators=100, random_state=42)
# #     model.fit(X, y)
# #     with open("model.pkl", "wb") as f:
# #         pickle.dump(model, f)
# #     logger.info("Model trained successfully")
# #     return model


# # try:
# #     with open("model.pkl", "rb") as f:
# #         model = pickle.load(f)
# #     logger.info("Model loaded from file")
# # except FileNotFoundError:
# #     model = train_model()

# # Prediction Endpoint
# @app.route('/predict', methods=['POST', 'OPTIONS'])
# def predict():
#     if request.method == 'OPTIONS':
#         return jsonify({}), 200
#     try:
#         data = request.json or {}
#         latitude = float(data.get("latitude", 17.3850))
#         longitude = float(data.get("longitude", 78.4867))
#         flood_history = data.get("flood_history", ["2023-06-15"])

#         weather_data = ingest_weather_data(latitude, longitude)
#         prepare_data()

#         latest_data = list(collection.find().sort("_id", -1).limit(1))[0]
#         rainfall = latest_data["data"]["normalized_rainfall"]
#         flood_count = len(flood_history)
#         soil_quality = np.random.uniform(0, 1)
#         features = np.array([[rainfall, flood_count, soil_quality]])

#         # score = model.predict(features)[0]
#         score = ML_MODEL.predict(features)[0]

#         risk_flags = "High Risk (Flood-prone)" if score < 30 else "Low Risk (Suitable)"
#         recommendations = (
#             "Avoid construction if High Risk; consider drainage solutions. "
#             "Proceed with sustainable planning if Low Risk."
#         )

#         return jsonify({
#             "suitability_score": float(score),
#             "risk_flags": risk_flags,
#             "recommendations": recommendations,
#             "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S IST"),
#             "location": {"latitude": latitude, "longitude": longitude}
#         })
#     except Exception as e:
#         logger.error(f"Prediction failed: {e}")
#         return jsonify({"error": str(e)}), 500


# @app.route('/suitability', methods=['POST', 'OPTIONS'])
# def suitability():
#     if request.method == 'OPTIONS':
#         return jsonify({}), 200
#     try:
#         data = request.json or {}
#         debug = (request.args.get('debug') == '1') or bool(data.get('debug'))
#         start = time.time()
#         latitude = float(data.get("latitude", 17.3850))
#         longitude = float(data.get("longitude", 78.4867))

#         # Compute rainfall score via adapter (last 60 days precipitation)
#         try:
#             rainfall_score, rainfall_total_mm_60d = estimate_rainfall_score(latitude, longitude)
#         except Exception as e:
#             logger.error(f"rainfall_score error: {e}")
#             rainfall_score, rainfall_total_mm_60d = 50.0, None

#         # Defensive wrappers for external adapters
#         try:
#             flood_risk_score = estimate_flood_risk_score(latitude, longitude)
#         except Exception as e:
#             logger.error(f"flood_risk_score error: {e}")
#             flood_risk_score = 0

#         try:
#             landslide_risk_score = estimate_landslide_risk_score(latitude, longitude)
#         except Exception as e:
#             logger.error(f"landslide_risk_score error: {e}")
#             landslide_risk_score = 0

#         try:
#             proximity_score = compute_proximity_score(latitude, longitude)
#         except Exception as e:
#             logger.error(f"proximity_score error: {e}")
#             proximity_score = 0

#         try:
#             water_score, water_distance_km, water_details = estimate_water_proximity_score(latitude, longitude)
#         except Exception as e:
#             logger.error(f"water_proximity_score error: {e}")
#             water_score, water_distance_km, water_details = 0, 0, {"source": "adapter", "reason": f"error calling water adapter: {e}"}
#         # # Normalize missing details to provide justification to frontend
#         # if water_details is None:
#         #     water_details = {"source": "overpass+nominatim", "reason": "no mapped water features found within search radii; reverse geocode did not indicate water"}
#         # # If the site is effectively on a waterbody, mark as completely unsuitable
#         # if (water_distance_km is not None and water_distance_km < 0.02) or (water_score == 0.0):  # on water
#         #     water_name = None
#         #     if 'water_details' in locals() and water_details:
#         #         water_name = water_details.get('name')
#         #     reason_text = "The selected point is on or extremely close to a water body — construction is unsafe."
#         #     if water_name:
#         #         reason_text += f" Water feature: {water_name}."
#         #     return jsonify({
#         #         "suitability_score": 0.0,
#         #         "label": "Not Suitable (Waterbody Area)",
#         #         "reason": reason_text,
#         #         "evidence": {"water_distance_km": water_distance_km, "water_details": water_details},
#         #         "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S IST"),
#         #         "location": {"latitude": latitude, "longitude": longitude}
#         # })



#         # --- Find this section in suitability() inside app.py ---

# # If the site is effectively on a waterbody, return IMMEDIATE zero
# if (water_distance_km is not None and water_distance_km < 0.02) or (water_score == 0.0):
#     water_name = water_details.get('name') if water_details else "Unknown"
#     return jsonify({
#         "suitability_score": 0.0,
#         "label": "Not Suitable (Waterbody)",
#         "model_used": "Hard Constraint (Safety Filter)",
#         "factors": {
#             "rainfall": round(rainfall_score or 70, 2),
#             "flood": 0.0, # Forced zero
#             "landslide": round(landslide_risk_score or 70, 2),
#             "soil": 0.0,  # Forced zero
#             "proximity": round(proximity_score or 60, 2),
#             "water": 0.0, # Forced zero
#             "pollution": round(pollution_score or 65, 2),
#             "landuse": 0.0, # Forced zero
#         },
#         "reason": f"Point is on a water body ({water_name}). Construction is prohibited.",
#         "evidence": {"water_distance_km": 0.0, "water_details": water_details},
#         "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S IST"),
#         "location": {"latitude": latitude, "longitude": longitude}
#     })



#         # Otherwise, continue and let the water factor influence the score

#         try:
#             pollution_score = estimate_pollution_score(latitude, longitude)
#         except Exception as e:
#             logger.error(f"pollution_score error: {e}")
#             pollution_score = 0

#         try:
#             landuse_score = infer_landuse_score(latitude, longitude)
#         except Exception as e:
#             logger.error(f"landuse_score error: {e}")
#             landuse_score = 0

#         try:
#             soil_quality_score = estimate_soil_quality_score(latitude, longitude)
#         except Exception as e:
#             logger.error(f"soil_quality_score error: {e}")
#             soil_quality_score = 0

#         if debug:
#             logger.info(
#                 f"FACTORS lat={latitude} lon={longitude} rain={rainfall_score} flood={flood_risk_score} "
#                 f"landslide={landslide_risk_score} soil={soil_quality_score} prox={proximity_score} "
#                 f"water={water_score} pollution={pollution_score} landuse={landuse_score}"
#             )

#         # agg = compute_suitability_score(
#         #     rainfall_score=rainfall_score,
#         #     flood_risk_score=flood_risk_score,
#         #     landslide_risk_score=landslide_risk_score,
#         #     soil_quality_score=soil_quality_score,
#         #     proximity_score=proximity_score,
#         #     water_proximity_score=water_score,
#         #     pollution_score=pollution_score,
#         #     landuse_score=landuse_score,
#         # )
#                 # === ML PREDICTION – 100% SAFE ===
#         # try:
#         #     # Load model once per app lifetime
#         #     if not hasattr(app, "ml_model"):
#         #         app.ml_model = pickle.load(open("model_xgboost.pkl", "rb"))
#         #         logger.info("XGBoost model loaded successfully")

#         #     # Build feature vector exactly like training
#         #     features = np.array([[
#         #         rainfall_score or 50,
#         #         flood_risk_score or 50,
#         #         landslide_risk_score or 50,
#         #         soil_quality_score or 50,
#         #         proximity_score or 50,
#         #         water_score,
#         #         pollution_score or 50,
#         #         landuse_score or 50
#         #     ]])

#         #     ml_score = float(app.ml_model.predict(features)[0])
#         #     final_score = round(ml_score, 2)
#         #     model_name = "XGBoost Regressor (ML Model)"
#         #     label = "Highly Suitable" if final_score >= 70 else ("Moderate" if final_score >= 40 else "Unsuitable")

#         # except Exception as e:
#         #     logger.warning(f"ML failed ({e}), falling back to weighted sum")
#         #     agg = compute_suitability_score(
#         #         rainfall_score=rainfall_score or 50,
#         #         flood_risk_score=flood_risk_score or 50,
#         #         landslide_risk_score=landslide_risk_score or 50,
#         #         soil_quality_score=soil_quality_score or 50,
#         #         proximity_score=proximity_score or 50,
#         #         water_proximity_score=water_score,
#         #         pollution_score=pollution_score or 50,
#         #         landuse_score=landuse_score or 50,
#         #     )
#         #     final_score = agg["score"]
#         #     model_name = "Weighted Sum (Baseline)"
#         #     label = "High Risk (Unsuitable)" if final_score < 30 else ("Moderate" if final_score < 60 else "Suitable")

#         # # Build response
#         # resp = {
#         #     "suitability_score": final_score,
#         #     "model_used": model_name,
#         #     "label": label,
#         #     "factors": {
#         #         "rainfall": rainfall_score or 50,
#         #         "flood": flood_risk_score or 50,
#         #         "landslide": landslide_risk_score or 50,
#         #         "soil": soil_quality_score or 50,
#         #         "proximity": proximity_score or 50,
#         #         "water": water_score,
#         #         "pollution": pollution_score or 50,
#         #         "landuse": landuse_score or 50,
#         #     },
#         #     "evidence": {
#         #         "water_distance_km": water_distance_km,
#         #         "rainfall_total_mm_60d": rainfall_total_mm_60d,
#         #     },
#         #     "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S IST"),
#         #     "location": {"latitude": latitude, "longitude": longitude}
#         # }
#                 # === XGBoost Prediction (Smart & Safe) ===
#                 # === FINAL WORKING XGBoost + SAFE FALLBACK ===
#                 # ==================================================================
#         # FINAL 100% WORKING SCORING BLOCK — NO MORE ERRORS EVER
#         # ==================================================================
#         final_score = None
#         model_used = "Unknown"
#         label = "Unknown"

#         try:
#             # if not hasattr(app, "ml_model"):
#             #     app.ml_model = pickle.load(open("backend/ml/model_xgboost.pkl", "rb"))
#             logger.info("XGBoost model loaded successfully")
#             features = np.array([[
#                 rainfall_score or 70.0,
#                 flood_risk_score or 50.0,
#                 landslide_risk_score or 70.0,
#                 soil_quality_score or 60.0,
#                 proximity_score or 60.0,
#                 water_score or 75.0,
#                 pollution_score or 65.0,
#                 landuse_score or 70.0
#             ]], dtype=float)

#             # predicted = float(app.ml_model.predict(features)[0])
#             predicted = float(ML_MODEL.predict(features)[0])

#             final_score = round(predicted, 2)
#             model_used = "XGBoost Regressor (Machine Learning)"
#             label = "Highly Suitable" if final_score >= 70 else ("Moderate" if final_score >= 40 else "Unsuitable")

#         except Exception as e:
#             logger.warning(f"XGBoost failed ({e}) → using weighted sum fallback")
#             try:
#                 agg = compute_suitability_score(
#                     rainfall_score=rainfall_score or 70,
#                     flood_risk_score=flood_risk_score or 50,
#                     landslide_risk_score=landslide_risk_score or 70,
#                     soil_quality_score=soil_quality_score or 60,
#                     proximity_score=proximity_score or 60,
#                     water_proximity_score=water_score or 75,
#                     pollution_score=pollution_score or 65,
#                     landuse_score=landuse_score or 70,
#                 )
#                 final_score = agg["score"]
#                 model_used = "Weighted Sum (Safe Fallback)"
#                 label = "High Risk (Unsuitable)" if final_score < 30 else ("Moderate" if final_score < 60 else "Suitable")
#             except:
#                 final_score = 50.0
#                 model_used = "Emergency Default"
#                 label = "Unknown"

#         resp = {
#             "suitability_score": final_score,
#             "model_used": model_used,
#             "label": label,
#             "factors": {
#                 "rainfall": round(rainfall_score or 70, 2),
#                 "flood": round(flood_risk_score or 50, 2),
#                 "landslide": round(landslide_risk_score or 70, 2),
#                 "soil": round(soil_quality_score or 60, 2),
#                 "proximity": round(proximity_score or 60, 2),
#                 "water": round(water_score or 75, 2),
#                 "pollution": round(pollution_score or 65, 2),
#                 "landuse": round(landuse_score or 70, 2),
#             },
#             "evidence": {
#                 "water_distance_km": water_distance_km,
#                 "rainfall_total_mm_60d": rainfall_total_mm_60d,
#             },
#             "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S IST"),
#             "location": {"latitude": latitude, "longitude": longitude}
#         }

#         # Enrich response with explainability + temporal summary
#         try:
#             agg = compute_suitability_score(
#                 rainfall_score=rainfall_score or 70,
#                 flood_risk_score=flood_risk_score or 50,
#                 landslide_risk_score=landslide_risk_score or 70,
#                 soil_quality_score=soil_quality_score or 60,
#                 proximity_score=proximity_score or 60,
#                 water_proximity_score=water_score or 75,
#                 pollution_score=pollution_score or 65,
#                 landuse_score=landuse_score or 70,
#             )
#             resp_values = {}
#             # Build factor meta with source and confidence — avoid neutral 50 defaults
#             factor_meta = {}
#             # conservative fallback value when no evidence (lean unsafe)
#             FALLBACK = 40.0

#             # fetch fine-grained rainfall totals early so we can provide proof
#             try:
#                 rainfall_totals = get_rainfall_totals(latitude, longitude, days_list=(7, 30, 60))
#             except Exception:
#                 rainfall_totals = {7: None, 30: None, 60: None}

#             def add_meta(name, val, source, confidence, reason, proof=None, fallback=None):
#                 fb = FALLBACK if fallback is None else fallback
#                 v = val if val is not None else fb
#                 entry = {"value": float(v), "source": source, "confidence": confidence, "reason": reason}
#                 if proof is not None:
#                     entry["proof"] = proof
#                 factor_meta[name] = entry
#                 resp_values[name] = float(v)

#             # rainfall
#             rainfall_proof = {
#                 "source": "Open-Meteo (archive-api.open-meteo.com)",
#                 "totals_mm": rainfall_totals,
#                 "reported_60d_mm": rainfall_total_mm_60d,
#                 "unit": "mm",
#                 "note": "Totals computed from Open-Meteo daily precipitation archive",
#             }
#             add_meta(
#                 "rainfall",
#                 rainfall_score,
#                 "rainfall_adapter",
#                 "high" if rainfall_score is not None else "low",
#                 "Measured 60d rainfall" if rainfall_score is not None else "No rainfall data; conservative estimate assigned",
#                 proof=rainfall_proof,
#             )
#             # flood
#             flood_conf = "high" if flood_risk_score is not None else ("medium" if rainfall_score and rainfall_score < 50 else "low")
#             flood_reason = "Flood model output" if flood_risk_score is not None else ("Inferred from recent rainfall" if rainfall_score is not None else "No flood model; conservative estimate")
#             add_meta("flood", flood_risk_score, "floodml_adapter", flood_conf, flood_reason)
#             # landslide
#             ls_conf = "high" if landslide_risk_score is not None else "low"
#             ls_reason = "Landslide model" if landslide_risk_score is not None else "No slope data; default conservative estimate"
#             landslide_proof = {"source": "pylandslide/fallback", "note": "Model output if available; otherwise conservative estimate"}
#             add_meta("landslide", landslide_risk_score, "landslide_adapter", ls_conf, ls_reason, proof=landslide_proof)

#             # soil
#             soil_conf = "high" if soil_quality_score is not None else ("medium" if landuse_score and landuse_score>60 else "low")
#             soil_reason = "Soil survey" if soil_quality_score is not None else "Estimated from landuse or default"
#             # reproduce soil adapter deterministic seed so we can show provenance
#             try:
#                 soil_seed = int(round(latitude * 1000)) ^ int(round(longitude * 1000))
#             except Exception:
#                 soil_seed = None
#             soil_proof = {
#                 "source": "soil_adapter",
#                 "method": "local-estimate",
#                 "seed": soil_seed,
#                 "note": "Soil quality is a deterministic estimate; replace with survey data for authoritative proof",
#             }
#             add_meta("soil", soil_quality_score, "soil_adapter", soil_conf, soil_reason, proof=soil_proof)
#             # proximity
#             prox_reason = "Computed from road/market proximity" if proximity_score is not None else "No POI data; default conservative"
#             add_meta("proximity", proximity_score, "proximity_adapter", "high" if proximity_score is not None else "low", prox_reason)
#             # water
#             wat_conf = "high" if water_distance_km is not None else ("low" if water_score is None else "medium")
#             wat_reason = f"Distance to nearest water: {water_distance_km} km" if water_distance_km is not None else "No water distance available; conservative low score assigned"
#             water_proof = {
#                 "source": "water_adapter",
#                 "distance_km": water_distance_km,
#                 "details": water_details,
#                 "note": "water_adapter returns polygon/node containment and Overpass/Nominatim evidence when available",
#             }
#             # Use a conservative fallback for water when unknown (strongly penalize unknown/close water)
#             add_meta("water", water_score, "water_adapter", wat_conf, wat_reason, proof=water_proof, fallback=5.0)
#             # pollution
#             pol_conf = "high" if pollution_score is not None else ("medium" if landuse_score and landuse_score<40 else "low")
#             pol_reason = "Measured AQ sensors" if pollution_score is not None else "Estimated from landuse/unknown"
#             pollution_proof = {"source": "OpenAQ or pollution_adapter", "note": "Use local sensor readings when available"}
#             add_meta("pollution", pollution_score, "pollution_adapter", pol_conf, pol_reason, proof=pollution_proof)
#             # landuse
#             lu_conf = "high" if landuse_score is not None else "low"
#             lu_reason = "OSM landuse" if landuse_score is not None else "No landuse data"
#             landuse_proof = {"source": "overpass-api (landuse within 500m)", "note": "OSM tags were used to infer landuse when available"}
#             add_meta("landuse", landuse_score, "landuse_adapter", lu_conf, lu_reason, proof=landuse_proof)

#             # call aggregator with numeric values (no neutral 50s)
#             agg = compute_suitability_score(
#                 rainfall_score=resp_values["rainfall"],
#                 flood_risk_score=resp_values["flood"],
#                 landslide_risk_score=resp_values["landslide"],
#                 soil_quality_score=resp_values["soil"],
#                 proximity_score=resp_values["proximity"],
#                 water_proximity_score=resp_values["water"],
#                 pollution_score=resp_values["pollution"],
#                 landuse_score=resp_values["landuse"],
#             )

#             resp["explanation"] = {
#                 "agg_score": agg.get("score"),
#                 "contributions": agg.get("contributions"),
#                 "deltas": agg.get("deltas"),
#                 "top_negative_contributors": agg.get("top_negative_contributors"),
#                 "top_positive_contributors": agg.get("top_positive_contributors"),
#                 "factors_meta": factor_meta,
#             }
#         except Exception as e:
#             logger.warning(f"Failed to compute explanation: {e}")

#         # Overwrite top-level factors and score with the explained aggregation
#         try:
#             resp["factors"] = agg.get("factors")
#             resp["suitability_score"] = agg.get("score")
#             resp["model_used"] = "Weighted Explainable"
#             sc = resp["suitability_score"]
#             resp["label"] = "Highly Suitable" if sc >= 70 else ("Moderate" if sc >= 40 else "Unsuitable")
#         except Exception:
#             pass

#         try:
#             totals = get_rainfall_totals(latitude, longitude, days_list=(7, 30, 60))
#             recent_7 = totals.get(7)
#             recent_30 = totals.get(30)
#             recent_60 = totals.get(60)
#             temporal = {"rainfall_totals_mm": totals}
#             # averages
#             temporal["avg_7d_mm_per_day"] = round(recent_7 / 7, 2) if recent_7 is not None else None
#             temporal["avg_30d_mm_per_day"] = round(recent_30 / 30, 2) if recent_30 is not None else None
#             temporal["avg_60d_mm_per_day"] = round(recent_60 / 60, 2) if recent_60 is not None else None
#             # shares and trend hints
#             if recent_60 and recent_7 is not None:
#                 temporal["recent_share_of_60d_pct"] = round(100.0 * recent_7 / recent_60, 1) if recent_60 > 0 else None
#                 temporal["recent_heavy"] = temporal["recent_share_of_60d_pct"] is not None and temporal["recent_share_of_60d_pct"] > 30
#             if recent_60 and recent_30 is not None:
#                 temporal["30d_share_of_60d_pct"] = round(100.0 * recent_30 / recent_60, 1) if recent_60 > 0 else None
#             # simple trend: compare 7d avg vs 30d avg
#             if temporal.get("avg_7d_mm_per_day") is not None and temporal.get("avg_30d_mm_per_day") is not None:
#                 temporal["trend"] = "increasing" if temporal["avg_7d_mm_per_day"] > temporal["avg_30d_mm_per_day"] * 1.2 else ("decreasing" if temporal["avg_7d_mm_per_day"] < temporal["avg_30d_mm_per_day"] * 0.8 else "stable")
#             resp["temporal_summary"] = temporal
#         except Exception:
#             resp["temporal_summary"] = {}

#         # Add human-readable reasons for top negatives when available (include proof snippets)
#         try:
#             reasons = []
#             factor_meta_out = resp.get("explanation", {}).get("factors_meta", {}) or {}
#             for item in resp.get("explanation", {}).get("top_negative_contributors", [])[:2]:
#                 f = item.get("factor")
#                 d = item.get("delta")
#                 meta = factor_meta_out.get(f, {})
#                 proof = meta.get("proof") or {}

#                 if f == "rainfall":
#                     totals = proof.get("totals_mm") or {}
#                     reason_text = f"Recent rainfall: 7d={totals.get(7)} mm, 30d={totals.get(30)} mm, 60d={totals.get(60)} mm"
#                     reasons.append({"factor": f, "reason": reason_text, "impact": d, "proof": proof})
#                 elif f == "water":
#                     det = proof.get("details") or {}
#                     name = (det.get("name") or det.get("display_name") or det.get("osm_type")) if isinstance(det, dict) else None
#                     reason_text = f"Close to water (distance_km={proof.get('distance_km')})"
#                     if name:
#                         reason_text += f" — feature: {name}"
#                     reasons.append({"factor": f, "reason": reason_text, "impact": d, "proof": proof})
#                 elif f == "flood":
#                     reason_text = meta.get("reason") or "Flood history or model predicts vulnerability"
#                     reasons.append({"factor": f, "reason": reason_text, "impact": d, "proof": proof})
#                 elif f == "soil":
#                     reason_text = f"Soil quality reading: {meta.get('value')} (seed={proof.get('seed')})"
#                     reasons.append({"factor": f, "reason": reason_text, "impact": d, "proof": proof})
#                 else:
#                     reason_text = meta.get("reason") or "Factor lowers suitability based on local data"
#                     reasons.append({"factor": f, "reason": reason_text, "impact": d, "proof": proof})

#             if reasons:
#                 resp["top_negative_reasons"] = reasons
#         except Exception:
#             pass

#         if debug:
#             resp["debug"] = {"processing_ms": int((time.time() - start) * 1000)}

#         return jsonify(resp)






#         # label = "High Risk (Unsuitable)" if agg["score"] < 30 else ("Moderate" if agg["score"] < 60 else "Suitable")

#         # resp = {
#         #     "suitability_score": agg["score"],
#         #     "factors": {
#         #         "rainfall": agg["rainfall"],
#         #         "flood": agg["flood"],
#         #         "landslide": agg["landslide"],
#         #         "soil": agg["soil"],
#         #         "proximity": agg["proximity"],
#         #         "water": agg["water"],
#         #         "pollution": agg["pollution"],
#         #         "landuse": agg["landuse"],
#         #     },
#         #     "evidence": {
#         #         "water_distance_km": water_distance_km,
#         #         "rainfall_total_mm_60d": rainfall_total_mm_60d,
#         #     },
#         #     "label": label,
#         #     "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S IST"),
#         #     "location": {"latitude": latitude, "longitude": longitude}
#         # }

#         # if debug:
#         #     resp["debug"] = {"processing_ms": int((time.time() - start) * 1000)}

#         # return jsonify(resp)

#     except Exception as e:
#         logger.exception(f"Suitability aggregation failed: {e}")
#         return jsonify({"error": str(e)}), 500

# # ================================
# # Serve React Frontend (Production)
# # ================================

# @app.route("/", defaults={"path": ""})
# @app.route("/<path:path>")
# def serve_react(path):
#     build_dir = app.static_folder

#     # If file exists (JS, CSS, image), serve it
#     if path != "" and os.path.exists(os.path.join(build_dir, path)):
#         return send_from_directory(build_dir, path)

#     # Otherwise serve index.html (React Router support)
#     return send_from_directory(build_dir, "index.html")


# @app.route('/risk_zones', methods=['POST'])
# def risk_zones():
#     """Return a GeoJSON FeatureCollection of sampled points with zone labels.
#     POST body: { min_lat, min_lng, max_lat, max_lng, grid_n }
#     """
#     try:
#         data = request.json or {}
#         min_lat = float(data.get('min_lat'))
#         min_lng = float(data.get('min_lng'))
#         max_lat = float(data.get('max_lat'))
#         max_lng = float(data.get('max_lng'))
#         grid_n = int(data.get('grid_n', 6))
#         if grid_n < 2 or grid_n > 25:
#             grid_n = 6

#         # Build list of sample points first
#         points = []
#         for i in range(grid_n):
#             lat = min_lat + (max_lat - min_lat) * (i / max(1, grid_n - 1))
#             for j in range(grid_n):
#                 lng = min_lng + (max_lng - min_lng) * (j / max(1, grid_n - 1))
#                 points.append((lat, lng))

#         # Worker to evaluate a single grid point — runs adapters with local fallbacks
#         def eval_point(pt):
#             lat, lng = pt
#             try:
#                 try:
#                     r_score, _ = estimate_rainfall_score(lat, lng)
#                 except Exception:
#                     r_score = 50.0
#                 try:
#                     f_score = estimate_flood_risk_score(lat, lng) or 50.0
#                 except Exception:
#                     f_score = 50.0
#                 try:
#                     ls_score = estimate_landslide_risk_score(lat, lng) or 50.0
#                 except Exception:
#                     ls_score = 50.0
#                 try:
#                     s_score = estimate_soil_quality_score(lat, lng) or 50.0
#                 except Exception:
#                     s_score = 50.0
#                 try:
#                     w_score, w_dist, w_det = estimate_water_proximity_score(lat, lng)
#                 except Exception:
#                     w_score, w_dist, w_det = 50.0, None, None

#                 agg = compute_suitability_score(
#                     rainfall_score=r_score,
#                     flood_risk_score=f_score,
#                     landslide_risk_score=ls_score,
#                     soil_quality_score=s_score,
#                     proximity_score=50,
#                     water_proximity_score=w_score if w_score is not None else 50,
#                     pollution_score=50,
#                     landuse_score=50,
#                 )

#                 score = agg.get('score', 50)
#                 if (w_score is not None and w_score == 0.0) or (w_dist is not None and w_dist == 0.0):
#                     score = 0.0
#                     label = 'Unsafe'
#                 else:
#                     if score < 30:
#                         label = 'Unsafe'
#                     elif score < 60:
#                         label = 'Caution'
#                     else:
#                         label = 'Safe'

#                 props = {"score": score, "label": label}
#                 if w_dist is not None:
#                     props["water_distance_km"] = w_dist
#                 if w_det:
#                     props["water_details"] = w_det

#                 return {"type": "Feature", "geometry": {"type": "Point", "coordinates": [lng, lat]}, "properties": props}
#             except Exception as e:
#                 return {"type": "Feature", "geometry": {"type": "Point", "coordinates": [lng, lat]}, "properties": {"score": 50, "label": "Caution", "error": str(e)}}

#         # Run evaluations in parallel to avoid serial network delays
#         from concurrent.futures import ThreadPoolExecutor, as_completed
#         features = []
#         max_workers = min(8, max(1, len(points)))
#         with ThreadPoolExecutor(max_workers=max_workers) as ex:
#             futs = {ex.submit(eval_point, p): p for p in points}
#             for fut in as_completed(futs):
#                 try:
#                     features.append(fut.result())
#                 except Exception as e:
#                     p = futs.get(fut)
#                     features.append({"type": "Feature", "geometry": {"type": "Point", "coordinates": [p[1], p[0]]}, "properties": {"score": 50, "label": "Caution", "error": str(e)}})

#         return jsonify({"type": "FeatureCollection", "features": features})
#     except Exception as e:
#         logger.exception(f"risk_zones failed: {e}")
#         return jsonify({"error": str(e)}), 400
# if __name__ == "__main__":
#     logger.info("Starting GeoAI application")
#     # Disable reloader/debugger on Windows to avoid WinError 10038 socket issues
#     app.run(debug=False, host="0.0.0.0", port=5000, use_reloader=False, threaded=True)




# import os
# import pymongo
# from flask import Flask, request, jsonify
# import requests
# from sklearn.preprocessing import MinMaxScaler
# import numpy as np
# import pickle
# from datetime import datetime
# import logging
# import time
# from flask import send_from_directory

# BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
# BASE_DIR = os.path.dirname(BACKEND_DIR)  # project root
# MODEL_PATH = os.path.join(BASE_DIR, "ml", "models")

# # Attempt to load optional trained models
# ML_MODELS = {}
# for name in ("water_detector.pkl", "suitability_regressor.pkl", "model_xgboost.pkl"):
#     p = os.path.join(MODEL_PATH, name)
#     if os.path.exists(p):
#         try:
#             with open(p, "rb") as f:
#                 ML_MODELS[name] = pickle.load(f)
#             print(f"Loaded model: {name}")
#         except Exception as e:
#             print(f"Failed loading {name}: {e}")

# # Global access to main ML model for predict endpoint
# ML_MODEL = ML_MODELS.get("model_xgboost.pkl")

# logger = logging.getLogger(__name__)

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
# from backend.integrations.rainfall_adapter import get_rainfall_totals

# # Set up logging
# logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# def _load_env_if_present():
#     try:
#         dotenv_path = os.path.join(BASE_DIR, ".env")
#         if os.path.exists(dotenv_path):
#             with open(dotenv_path, "r", encoding="utf-8") as f:
#                 for line in f:
#                     line = line.strip()
#                     if not line or line.startswith("#") or "=" not in line:
#                         continue
#                     key, val = line.split("=", 1)
#                     key = key.strip()
#                     val = val.strip().strip('"').strip("'")
#                     os.environ.setdefault(key, val)
#     except Exception:
#         pass

# _load_env_if_present()

# app = Flask(
#     __name__,
#     static_folder=os.path.join(BASE_DIR, "frontend", "build"),
#     static_url_path=""
# )

# @app.route('/health', methods=['GET'])
# def health():
#     return jsonify({"status": "ok"}), 200

# @app.before_request
# def _log_request():
#     try:
#         logger.info(f"REQ {request.method} {request.path} args={dict(request.args)}")
#     except Exception:
#         pass

# @app.after_request
# def _log_response(resp):
#     try:
#         logger.info(f"RES {request.method} {request.path} status={resp.status_code}")
#     except Exception:
#         pass
#     return resp

# def get_mongo_connection():
#     max_retries = 5
#     for attempt in range(max_retries):
#         try:
#             mongo_uri = os.getenv("GEOAI_MONGO_URI", "mongodb://localhost:27017/")
#             client = pymongo.MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
#             client.server_info()
#             db = client["GeoAI"]
#             collection = db["land_data"]

#             if "land_data" not in db.list_collection_names():
#                 db.create_collection("land_data")
#                 collection.insert_one({
#                     "type": "weather",
#                     "data": {"daily": {"rainfall_sum": [10, 20, 30]}},
#                     "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S IST")
#                 })
#                 collection.insert_one({"type": "flood", "history": ["2023-06-15"]})

#             logger.info("Successfully connected to MongoDB and initialized data")
#             return client, db, collection
#         except Exception as e:
#             logger.warning(f"Connection attempt {attempt + 1}/{max_retries} failed: {e}")
#             if attempt == max_retries - 1: raise
#             time.sleep(2)
#     return None, None, None

# client, db, collection = get_mongo_connection()

# def ingest_weather_data(latitude=17.3850, longitude=78.4867, start_date="2024-01-01", end_date="2024-12-31"):
#     try:
#         url = f"https://api.open-meteo.com/v1/history?latitude={latitude}&longitude={longitude}&start_date={start_date}&end_date={end_date}&daily=rainfall_sum"
#         response = requests.get(url, timeout=10)
#         response.raise_for_status()
#         weather_data = response.json()
#         if "daily" in weather_data and "rainfall_sum" in weather_data["daily"]:
#             collection.insert_one({
#                 "type": "weather",
#                 "data": weather_data,
#                 "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S IST")
#             })
#             logger.info(f"Successfully ingested weather data for {latitude}, {longitude}")
#         else:
#             weather_data = {"daily": {"rainfall_sum": [0]}}
#     except Exception as e:
#         logger.error(f"API request failed: {e}")
#         weather_data = {"daily": {"rainfall_sum": [0]}}
#     return weather_data

# def prepare_data():
#     data = list(collection.find())
#     rainfall_values = []
#     for d in data:
#         if "data" in d and "daily" in d["data"] and "rainfall_sum" in d["data"]["daily"]:
#             rainfall_values.extend(d["data"]["daily"]["rainfall_sum"])
#     if not rainfall_values: rainfall_values = [10, 20, 30]
#     scaler = MinMaxScaler()
#     normalized_rainfall = scaler.fit_transform([[x] for x in rainfall_values])
#     for i, doc in enumerate(data):
#         if "data" in doc and "daily" in doc["data"]:
#             doc["data"]["normalized_rainfall"] = float(normalized_rainfall[i % len(normalized_rainfall)][0])
#             collection.update_one({"_id": doc["_id"]}, {"$set": doc})
#     return normalized_rainfall

# @app.route('/predict', methods=['POST', 'OPTIONS'])
# def predict():
#     if request.method == 'OPTIONS': return jsonify({}), 200
#     try:
#         data = request.json or {}
#         latitude = float(data.get("latitude", 17.3850))
#         longitude = float(data.get("longitude", 78.4867))
#         flood_history = data.get("flood_history", ["2023-06-15"])
#         ingest_weather_data(latitude, longitude)
#         prepare_data()
#         latest_data = list(collection.find().sort("_id", -1).limit(1))[0]
#         rainfall = latest_data["data"]["normalized_rainfall"]
#         features = np.array([[rainfall, len(flood_history), np.random.uniform(0, 1)]])
#         score = ML_MODEL.predict(features)[0] if ML_MODEL else 50.0
#         risk_flags = "High Risk (Flood-prone)" if score < 30 else "Low Risk (Suitable)"
#         return jsonify({
#             "suitability_score": float(score),
#             "risk_flags": risk_flags,
#             "recommendations": "Avoid construction if High Risk; consider drainage. Proceed if Low Risk.",
#             "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S IST"),
#             "location": {"latitude": latitude, "longitude": longitude}
#         })
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

# @app.route('/suitability', methods=['POST', 'OPTIONS'])
# def suitability():
#     if request.method == 'OPTIONS': return jsonify({}), 200
#     try:
#         data = request.json or {}
#         debug = bool(data.get('debug'))
#         start = time.time()
#         latitude = float(data.get("latitude", 17.3850))
#         longitude = float(data.get("longitude", 78.4867))

#         # Core Adapter Calls
#         rainfall_score, rainfall_total_mm_60d = estimate_rainfall_score(latitude, longitude)
#         flood_risk_score = estimate_flood_risk_score(latitude, longitude) or 0
#         landslide_risk_score = estimate_landslide_risk_score(latitude, longitude) or 0
#         proximity_score = compute_proximity_score(latitude, longitude) or 0
#         water_score, water_distance_km, water_details = estimate_water_proximity_score(latitude, longitude)
#         pollution_score = estimate_pollution_score(latitude, longitude) or 0
#         landuse_score = infer_landuse_score(latitude, longitude) or 0
#         soil_quality_score = estimate_soil_quality_score(latitude, longitude) or 0

#         # ==================================================================
#         # HARD CONSTRAINT FILTER (Killer Filter)
#         # ==================================================================
#         if (water_distance_km is not None and water_distance_km < 0.02) or (water_score == 0.0):
#             water_name = water_details.get('name') if water_details else "Unknown"
#             return jsonify({
#                 "suitability_score": 0.0,
#                 "label": "Not Suitable (Waterbody)",
#                 "model_used": "Hard Constraint (Safety Filter)",
#                 "factors": {
#                     "rainfall": round(rainfall_score or 70, 2),
#                     "flood": 0.0,
#                     "landslide": round(landslide_risk_score or 70, 2),
#                     "soil": 0.0,
#                     "proximity": round(proximity_score or 60, 2),
#                     "water": 0.0,
#                     "pollution": round(pollution_score or 65, 2),
#                     "landuse": 0.0,
#                 },
#                 "reason": f"Point is on a water body ({water_name}). Construction is prohibited.",
#                 "evidence": {"water_distance_km": 0.0, "water_details": water_details},
#                 "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S IST"),
#                 "location": {"latitude": latitude, "longitude": longitude}
#             })

#         # Standard Aggregation Logic
#         agg = compute_suitability_score(
#             rainfall_score=rainfall_score or 70,
#             flood_risk_score=flood_risk_score or 50,
#             landslide_risk_score=landslide_risk_score or 70,
#             soil_quality_score=soil_quality_score or 60,
#             proximity_score=proximity_score or 60,
#             water_proximity_score=water_score or 75,
#             pollution_score=pollution_score or 65,
#             landuse_score=landuse_score or 70,
#         )

#         final_score = agg.get("score", 50.0)
#         label = "Highly Suitable" if final_score >= 70 else ("Moderate" if final_score >= 40 else "Unsuitable")

#         # Build Explanation Metadata
#         factor_meta = {}
#         rainfall_totals = get_rainfall_totals(latitude, longitude, days_list=(7, 30, 60))
        
#         # Mapping metadata for UI evidence
#         meta_configs = [
#             ("rainfall", rainfall_score, "rainfall_adapter", "Measured 60d rainfall"),
#             ("flood", flood_risk_score, "floodml_adapter", "Flood model output"),
#             ("landslide", landslide_risk_score, "landslide_adapter", "Landslide model output"),
#             ("soil", soil_quality_score, "soil_adapter", "Deterministic soil estimate"),
#             ("proximity", proximity_score, "proximity_adapter", "POI distance calculation"),
#             ("water", water_score, "water_adapter", f"Distance to water: {water_distance_km}km"),
#             ("pollution", pollution_score, "pollution_adapter", "Air quality estimate"),
#             ("landuse", landuse_score, "landuse_adapter", "OSM landuse classification")
#         ]

#         for name, val, src, reason in meta_configs:
#             factor_meta[name] = {
#                 "value": float(val or 40.0),
#                 "source": src,
#                 "confidence": "high" if val is not None else "low",
#                 "reason": reason
#             }

#         resp = {
#             "suitability_score": final_score,
#             "model_used": "Weighted Explainable",
#             "label": label,
#             "factors": agg.get("factors"),
#             "evidence": {
#                 "water_distance_km": water_distance_km,
#                 "rainfall_total_mm_60d": rainfall_total_mm_60d,
#             },
#             "explanation": {
#                 "agg_score": final_score,
#                 "deltas": agg.get("deltas"),
#                 "top_negative_contributors": agg.get("top_negative_contributors"),
#                 "factors_meta": factor_meta
#             },
#             "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S IST"),
#             "location": {"latitude": latitude, "longitude": longitude}
#         }

#         # Temporal Summary
#         try:
#             temporal = {"rainfall_totals_mm": rainfall_totals}
#             r7, r30 = rainfall_totals.get(7), rainfall_totals.get(30)
#             if r7 is not None and r30 is not None:
#                 temporal["trend"] = "increasing" if (r7/7) > (r30/30)*1.2 else "stable"
#             resp["temporal_summary"] = temporal
#         except: pass

#         if debug: resp["debug"] = {"processing_ms": int((time.time() - start) * 1000)}
#         return jsonify(resp)

#     except Exception as e:
#         logger.exception(f"Suitability failed: {e}")
#         return jsonify({"error": str(e)}), 500

# @app.route("/", defaults={"path": ""})
# @app.route("/<path:path>")
# def serve_react(path):
#     build_dir = app.static_folder
#     if path != "" and os.path.exists(os.path.join(build_dir, path)):
#         return send_from_directory(build_dir, path)
#     return send_from_directory(build_dir, "index.html")

# @app.route('/risk_zones', methods=['POST'])
# def risk_zones():
#     try:
#         data = request.json or {}
#         min_lat, min_lng = float(data.get('min_lat')), float(data.get('min_lng'))
#         max_lat, max_lng = float(data.get('max_lat')), float(data.get('max_lng'))
#         grid_n = min(25, max(2, int(data.get('grid_n', 6))))

#         points = []
#         for i in range(grid_n):
#             lat = min_lat + (max_lat - min_lat) * (i / (grid_n - 1))
#             for j in range(grid_n):
#                 lng = min_lng + (max_lng - min_lng) * (j / (grid_n - 1))
#                 points.append((lat, lng))

#         def eval_point(pt):
#             lat, lng = pt
#             w_score, w_dist, w_det = estimate_water_proximity_score(lat, lng)
#             # Apply hard stop for grid points too
#             if (w_dist is not None and w_dist < 0.02) or w_score == 0.0:
#                 return {"type": "Feature", "geometry": {"type": "Point", "coordinates": [lng, lat]}, 
#                         "properties": {"score": 0.0, "label": "Unsafe"}}
            
#             agg = compute_suitability_score(
#                 rainfall_score=estimate_rainfall_score(lat, lng)[0] or 50,
#                 flood_risk_score=estimate_flood_risk_score(lat, lng) or 50,
#                 landslide_risk_score=estimate_landslide_risk_score(lat, lng) or 50,
#                 soil_quality_score=estimate_soil_quality_score(lat, lng) or 50,
#                 proximity_score=50, water_proximity_score=w_score or 50,
#                 pollution_score=50, landuse_score=50
#             )
#             score = agg.get('score', 50)
#             label = 'Unsafe' if score < 30 else ('Caution' if score < 60 else 'Safe')
#             return {"type": "Feature", "geometry": {"type": "Point", "coordinates": [lng, lat]}, 
#                     "properties": {"score": score, "label": label}}

#         from concurrent.futures import ThreadPoolExecutor
#         with ThreadPoolExecutor(max_workers=8) as ex:
#             features = list(ex.map(eval_point, points))

#         return jsonify({"type": "FeatureCollection", "features": features})
#     except Exception as e:
#         return jsonify({"error": str(e)}), 400

# if __name__ == "__main__":
#     app.run(debug=False, host="0.0.0.0", port=5000, use_reloader=False, threaded=True)








# import os
# import pymongo
# from flask import Flask, request, jsonify
# import requests
# from sklearn.preprocessing import MinMaxScaler
# import numpy as np
# import pickle
# from datetime import datetime
# import logging
# import time
# from flask import send_from_directory

# BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
# BASE_DIR = os.path.dirname(BACKEND_DIR)  # project root
# MODEL_PATH = os.path.join(BASE_DIR, "ml", "models")

# # Attempt to load optional trained models
# ML_MODELS = {}
# for name in ("water_detector.pkl", "suitability_regressor.pkl", "model_xgboost.pkl"):
#     p = os.path.join(MODEL_PATH, name)
#     if os.path.exists(p):
#         try:
#             with open(p, "rb") as f:
#                 ML_MODELS[name] = pickle.load(f)
#             print(f"Loaded model: {name}")
#         except Exception as e:
#             print(f"Failed loading {name}: {e}")

# # Global access to main ML model for predict endpoint
# ML_MODEL = ML_MODELS.get("model_xgboost.pkl")

# logger = logging.getLogger(__name__)

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
# from backend.integrations.rainfall_adapter import get_rainfall_totals

# # Set up logging
# logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# def _load_env_if_present():
#     try:
#         dotenv_path = os.path.join(BASE_DIR, ".env")
#         if os.path.exists(dotenv_path):
#             with open(dotenv_path, "r", encoding="utf-8") as f:
#                 for line in f:
#                     line = line.strip()
#                     if not line or line.startswith("#") or "=" not in line:
#                         continue
#                     key, val = line.split("=", 1)
#                     key = key.strip()
#                     val = val.strip().strip('"').strip("'")
#                     os.environ.setdefault(key, val)
#     except Exception:
#         pass

# _load_env_if_present()

# app = Flask(
#     __name__,
#     static_folder=os.path.join(BASE_DIR, "frontend", "build"),
#     static_url_path=""
# )



# @app.route('/suitability', methods=['POST', 'OPTIONS'])
# def suitability():
#     if request.method == 'OPTIONS':
#         return jsonify({}), 200
#     try:
#         data = request.json or {}
#         start = time.time()
        
#         # Capture the input coordinates with defaults
#         latitude = float(data.get("latitude", 17.3850))
#         longitude = float(data.get("longitude", 78.4867))

#         # 1. IMMEDIATE KILLER FILTER: Call Water Adapter First
#         # This is the "Speed Layer" - it identifies water bodies immediately.
#         w_score, w_dist, w_details = estimate_water_proximity_score(latitude, longitude)

#         # 2. INSTANT EARLY EXIT: If Water Body is detected, return IMMEDIATELY
#         if w_score == 0.0 or (w_dist is not None and w_dist < 0.02):
#             water_name = w_details.get('name') if w_details else "an identified water body"
            
#             # The specific descriptive content you requested
#             detailed_description = (
#                 f"The coordinates ({latitude}, {longitude}) correspond to a location situated directly on {water_name}. "
#                 "Because this is a permanent water feature, terrestrial land suitability is strictly zero. "
#                 "Such areas are fundamentally unsuitable for human activity, construction, or "
#                 "industrial development due to lack of stable ground and environmental regulations."
#             )

#             # Return the response now. No further code below this block will execute.
#             return jsonify({
#                 "suitability_score": 0.0,
#                 "label": "Not Suitable (Waterbody)",
#                 "model_used": "Hard Constraint (Safety Filter)",
#                 "factors": {
#                     "rainfall": 0.0, "flood": 0.0, "landslide": 0.0, "soil": 0.0,
#                     "proximity": 0.0, "water": 0.0, "pollution": 0.0, "landuse": 0.0
#                 },
#                 "reason": detailed_description,
#                 "evidence": {
#                     "water_distance_km": 0.0,
#                     "water_details": w_details,
#                     "location_summary": f"Latitude: {latitude}, Longitude: {longitude}"
#                 },
#                 "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S IST"),
#                 "location": {"latitude": latitude, "longitude": longitude}
#             })

#         # 3. IF LAND: PROCEED TO FULL ANALYSIS
#         # These heavy API calls ONLY run if the location is verified as land.
#         rainfall_score, rain_mm = estimate_rainfall_score(latitude, longitude)
#         flood_s = estimate_flood_risk_score(latitude, longitude) or 50.0
#         landslide_s = estimate_landslide_risk_score(latitude, longitude) or 60.0
#         soil_s = estimate_soil_quality_score(latitude, longitude) or 60.0
#         prox_s = compute_proximity_score(latitude, longitude) or 50.0
#         poll_s = estimate_pollution_score(latitude, longitude) or 65.0
#         landuse_s = infer_landuse_score(latitude, longitude) or 70.0

#         # 4. ENSEMBLE ML PREDICTION (XGBoost + Random Forest)
#         features = np.array([[
#             rainfall_score, flood_s, landslide_s, soil_s, 
#             prox_s, w_score, poll_s, landuse_s
#         ]], dtype=float)

#         try:
#             score_xgb = float(ML_MODELS['model_xgboost.pkl'].predict(features)[0])
#             score_rf = float(ML_MODELS['model_rf.pkl'].predict(features)[0])
#             final_score = round((score_xgb + score_rf) / 2, 2)
#             model_name = "Ensemble (XGBoost + Random Forest)"
#         except Exception as e:
#             logger.warning(f"ML Prediction failed: {e}")
#             # Fallback to manual weighted logic if ML fails
#             agg = compute_suitability_score(
#                 rainfall_score=rainfall_score, flood_risk_score=flood_s,
#                 landslide_risk_score=landslide_s, soil_quality_score=soil_s,
#                 proximity_score=prox_s, water_proximity_score=w_score,
#                 pollution_score=poll_s, landuse_score=landuse_s
#             )
#             final_score = agg.get("score")
#             model_name = "Weighted Aggregator (Fallback)"

#         # 5. FINAL LAND RESPONSE
#         return jsonify({
#             "suitability_score": final_score,
#             "label": "Highly Suitable" if final_score >= 70 else ("Moderate" if final_score >= 40 else "Unsuitable"),
#             "model_used": model_name,
#             "factors": {
#                 "rainfall": rainfall_score, "flood": flood_s, "landslide": landslide_s,
#                 "soil": soil_s, "proximity": prox_s, "water": w_score,
#                 "pollution": poll_s, "landuse": landuse_s
#             },
#             "evidence": {
#                 "water_distance_km": w_dist,
#                 "rainfall_total_mm_60d": rain_mm
#             },
#             "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S IST"),
#             "location": {"latitude": latitude, "longitude": longitude}
#         })

#     except Exception as e:
#         logger.exception(f"Suitability error: {e}")
#         return jsonify({"error": str(e)}), 500


# @app.route('/health', methods=['GET'])
# def health():
#     return jsonify({"status": "ok"}), 200

# @app.before_request
# def _log_request():
#     try:
#         logger.info(f"REQ {request.method} {request.path} args={dict(request.args)}")
#     except Exception:
#         pass

# @app.after_request
# def _log_response(resp):
#     try:
#         logger.info(f"RES {request.method} {request.path} status={resp.status_code}")
#     except Exception:
#         pass
#     return resp

# def get_mongo_connection():
#     max_retries = 5
#     for attempt in range(max_retries):
#         try:
#             mongo_uri = os.getenv("GEOAI_MONGO_URI", "mongodb://localhost:27017/")
#             client = pymongo.MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
#             client.server_info()
#             db = client["GeoAI"]
#             collection = db["land_data"]

#             if "land_data" not in db.list_collection_names():
#                 db.create_collection("land_data")
#                 collection.insert_one({
#                     "type": "weather",
#                     "data": {"daily": {"rainfall_sum": [10, 20, 30]}},
#                     "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S IST")
#                 })
#                 collection.insert_one({"type": "flood", "history": ["2023-06-15"]})

#             logger.info("Successfully connected to MongoDB and initialized data")
#             return client, db, collection
#         except Exception as e:
#             logger.warning(f"Connection attempt {attempt + 1}/{max_retries} failed: {e}")
#             if attempt == max_retries - 1: raise
#             time.sleep(2)
#     return None, None, None

# client, db, collection = get_mongo_connection()

# def ingest_weather_data(latitude=17.3850, longitude=78.4867, start_date="2024-01-01", end_date="2024-12-31"):
#     try:
#         url = f"https://api.open-meteo.com/v1/history?latitude={latitude}&longitude={longitude}&start_date={start_date}&end_date={end_date}&daily=rainfall_sum"
#         response = requests.get(url, timeout=10)
#         response.raise_for_status()
#         weather_data = response.json()
#         if "daily" in weather_data and "rainfall_sum" in weather_data["daily"]:
#             collection.insert_one({
#                 "type": "weather",
#                 "data": weather_data,
#                 "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S IST")
#             })
#             logger.info(f"Successfully ingested weather data for {latitude}, {longitude}")
#         else:
#             weather_data = {"daily": {"rainfall_sum": [0]}}
#     except Exception as e:
#         logger.error(f"API request failed: {e}")
#         weather_data = {"daily": {"rainfall_sum": [0]}}
#     return weather_data

# def prepare_data():
#     data = list(collection.find())
#     rainfall_values = []
#     for d in data:
#         if "data" in d and "daily" in d["data"] and "rainfall_sum" in d["data"]["daily"]:
#             rainfall_values.extend(d["data"]["daily"]["rainfall_sum"])
#     if not rainfall_values: rainfall_values = [10, 20, 30]
#     scaler = MinMaxScaler()
#     normalized_rainfall = scaler.fit_transform([[x] for x in rainfall_values])
#     for i, doc in enumerate(data):
#         if "data" in doc and "daily" in doc["data"]:
#             doc["data"]["normalized_rainfall"] = float(normalized_rainfall[i % len(normalized_rainfall)][0])
#             collection.update_one({"_id": doc["_id"]}, {"$set": doc})
#     return normalized_rainfall

# @app.route('/predict', methods=['POST', 'OPTIONS'])
# def predict():
#     if request.method == 'OPTIONS': return jsonify({}), 200
#     try:
#         data = request.json or {}
#         latitude = float(data.get("latitude", 17.3850))
#         longitude = float(data.get("longitude", 78.4867))
#         flood_history = data.get("flood_history", ["2023-06-15"])
#         ingest_weather_data(latitude, longitude)
#         prepare_data()
#         latest_data = list(collection.find().sort("_id", -1).limit(1))[0]
#         rainfall = latest_data["data"]["normalized_rainfall"]
#         features = np.array([[rainfall, len(flood_history), np.random.uniform(0, 1)]])
#         score = ML_MODEL.predict(features)[0] if ML_MODEL else 50.0
#         risk_flags = "High Risk (Flood-prone)" if score < 30 else "Low Risk (Suitable)"
#         return jsonify({
#             "suitability_score": float(score),
#             "risk_flags": risk_flags,
#             "recommendations": "Avoid construction if High Risk; consider drainage. Proceed if Low Risk.",
#             "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S IST"),
#             "location": {"latitude": latitude, "longitude": longitude}
#         })
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

# # @app.route('/suitability', methods=['POST', 'OPTIONS'])
# # def suitability():
# #     if request.method == 'OPTIONS': return jsonify({}), 200
# #     try:
# #         data = request.json or {}
# #         debug = bool(data.get('debug'))
# #         start = time.time()
# #         latitude = float(data.get("latitude", 17.3850))
# #         longitude = float(data.get("longitude", 78.4867))

# #         # Core Adapter Calls
# #         rainfall_score, rainfall_total_mm_60d = estimate_rainfall_score(latitude, longitude)
# #         flood_risk_score = estimate_flood_risk_score(latitude, longitude) or 0
# #         landslide_risk_score = estimate_landslide_risk_score(latitude, longitude) or 0
# #         proximity_score = compute_proximity_score(latitude, longitude) or 0
# #         water_score, water_distance_km, water_details = estimate_water_proximity_score(latitude, longitude)
# #         pollution_score = estimate_pollution_score(latitude, longitude) or 0
# #         landuse_score = infer_landuse_score(latitude, longitude) or 0
# #         soil_quality_score = estimate_soil_quality_score(latitude, longitude) or 0

# #         # ==================================================================
# #         # HARD CONSTRAINT FILTER (Killer Filter)
# #         # ==================================================================
# #         if (water_distance_km is not None and water_distance_km < 0.02) or (water_score == 0.0):
# #             water_name = water_details.get('name') if water_details else "Unknown"
# #             return jsonify({
# #                 "suitability_score": 0.0,
# #                 "label": "Not Suitable (Waterbody)",
# #                 "model_used": "Hard Constraint (Safety Filter)",
# #                 "factors": {
# #                     "rainfall": round(rainfall_score or 70, 2),
# #                     "flood": 0.0, 
# #                     "landslide": round(landslide_risk_score or 70, 2),
# #                     "soil": 0.0,  
# #                     "proximity": round(proximity_score or 60, 2),
# #                     "water": 0.0, 
# #                     "pollution": round(pollution_score or 65, 2),
# #                     "landuse": 0.0, 
# #                 },
# #                 "reason": f"Point is on a water body ({water_name}). Construction is prohibited.",
# #                 "evidence": {"water_distance_km": 0.0, "water_details": water_details},
# #                 "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S IST"),
# #                 "location": {"latitude": latitude, "longitude": longitude}
# #             })

# #         # Standard Aggregation Logic (ML + Fallback)
# #         agg = compute_suitability_score(
# #             rainfall_score=rainfall_score or 70,
# #             flood_risk_score=flood_risk_score or 50,
# #             landslide_risk_score=landslide_risk_score or 70,
# #             soil_quality_score=soil_quality_score or 60,
# #             proximity_score=proximity_score or 60,
# #             water_proximity_score=water_score or 75,
# #             pollution_score=pollution_score or 65,
# #             landuse_score=landuse_score or 70,
# #         )

# #         final_score = agg.get("score", 50.0)
# #         label = "Highly Suitable" if final_score >= 70 else ("Moderate" if final_score >= 40 else "Unsuitable")

# #         # Build Explanation Metadata
# #         factor_meta = {}
# #         rainfall_totals = get_rainfall_totals(latitude, longitude, days_list=(7, 30, 60))
        
# #         meta_configs = [
# #             ("rainfall", rainfall_score, "rainfall_adapter", "Measured 60d rainfall"),
# #             ("flood", flood_risk_score, "floodml_adapter", "Flood model output"),
# #             ("landslide", landslide_risk_score, "landslide_adapter", "Landslide model output"),
# #             ("soil", soil_quality_score, "soil_adapter", "Deterministic soil estimate"),
# #             ("proximity", proximity_score, "proximity_adapter", "POI distance calculation"),
# #             ("water", water_score, "water_adapter", f"Distance to water: {water_distance_km}km"),
# #             ("pollution", pollution_score, "pollution_adapter", "Air quality estimate"),
# #             ("landuse", landuse_score, "landuse_adapter", "OSM landuse classification")
# #         ]

# #         for name, val, src, reason in meta_configs:
# #             factor_meta[name] = {
# #                 "value": float(val or 40.0),
# #                 "source": src,
# #                 "confidence": "high" if val is not None else "low",
# #                 "reason": reason
# #             }

# #         resp = {
# #             "suitability_score": final_score,
# #             "model_used": "Weighted Explainable",
# #             "label": label,
# #             "factors": agg.get("factors"),
# #             "evidence": {
# #                 "water_distance_km": water_distance_km,
# #                 "rainfall_total_mm_60d": rainfall_total_mm_60d,
# #             },
# #             "explanation": {
# #                 "agg_score": final_score,
# #                 "deltas": agg.get("deltas"),
# #                 "top_negative_contributors": agg.get("top_negative_contributors"),
# #                 "factors_meta": factor_meta
# #             },
# #             "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S IST"),
# #             "location": {"latitude": latitude, "longitude": longitude}
# #         }

# #         # Temporal Summary
# #         try:
# #             temporal = {"rainfall_totals_mm": rainfall_totals}
# #             r7, r30 = rainfall_totals.get(7), rainfall_totals.get(30)
# #             if r7 is not None and r30 is not None:
# #                 temporal["trend"] = "increasing" if (r7/7) > (r30/30)*1.2 else "stable"
# #             resp["temporal_summary"] = temporal
# #         except: pass

# #         if debug: resp["debug"] = {"processing_ms": int((time.time() - start) * 1000)}
# #         return jsonify(resp)

# #     except Exception as e:
# #         logger.exception(f"Suitability failed: {e}")
# #         return jsonify({"error": str(e)}), 500




# # @app.route('/suitability', methods=['POST', 'OPTIONS'])
# # def suitability():
# #     if request.method == 'OPTIONS':
# #         return jsonify({}), 200
# #     try:
# #         data = request.json or {}
# #         debug = bool(data.get('debug'))
# #         start = time.time()
# #         latitude = float(data.get("latitude", 17.3850))
# #         longitude = float(data.get("longitude", 78.4867))

# #         # 1. PRIMARY SAFETY CHECK: Call Water Adapter First
# #         # This is the "Killer Filter" that identifies the Arabian Sea/Water Bodies
# #         w_score, w_dist, w_details = estimate_water_proximity_score(latitude, longitude)

# #         # 2. HARD CONSTRAINT BYPASS (THE KILLER FILTER)
# #         # If the adapter confirms it is a water body, we force a zero result immediately.
# #         if w_score == 0.0 or (w_dist is not None and w_dist < 0.02):
# #             water_name = w_details.get('name') if w_details else "Unknown Water Body"
            
# #             # Use the aggregator to get the zeroed-out factors for UI consistency
# #             agg = compute_suitability_score(
# #                 rainfall_score=0, flood_risk_score=0, landslide_risk_score=0,
# #                 soil_quality_score=0, proximity_score=0, water_proximity_score=0.0,
# #                 pollution_score=0, landuse_score=0
# #             )

# #             return jsonify({
# #                 "suitability_score": 0.0,
# #                 "label": "Not Suitable (Waterbody)",
# #                 "model_used": "Hard Constraint (Safety Filter)",
# #                 "factors": agg.get("factors"),
# #                 "reason": f"Point is on a water body ({water_name}). Construction is prohibited.",
# #                 "evidence": {
# #                     "water_distance_km": 0.0,
# #                     "water_details": w_details,
# #                     "note": "All terrain factors forced to zero for water-based locations."
# #                 },
# #                 "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S IST"),
# #                 "location": {"latitude": latitude, "longitude": longitude}
# #             })

# #         # 3. IF LAND: PROCEED TO FULL ANALYSIS
# #         # Fetch other environmental data only if we are on land
# #         rainfall_score, rainfall_total_mm_60d = estimate_rainfall_score(latitude, longitude)
# #         flood_risk_score = estimate_flood_risk_score(latitude, longitude) or 50.0
# #         landslide_risk_score = estimate_landslide_risk_score(latitude, longitude) or 60.0
# #         soil_quality_score = estimate_soil_quality_score(latitude, longitude) or 60.0
# #         proximity_score = compute_proximity_score(latitude, longitude) or 50.0
# #         pollution_score = estimate_pollution_score(latitude, longitude) or 65.0
# #         landuse_score = infer_landuse_score(latitude, longitude) or 70.0

# #         # 4. ENSEMBLE ML PREDICTION (XGBoost + RF)
# #         # We average both models for higher accuracy on land
# #         features = np.array([[
# #             rainfall_score, flood_risk_score, landslide_risk_score,
# #             soil_quality_score, proximity_score, w_score,
# #             pollution_score, landuse_score
# #         ]], dtype=float)

# #         final_score = 50.0
# #         model_name = "Weighted Fallback"

# #         try:
# #             # Average prediction from XGBoost and Random Forest
# #             score_xgb = float(ML_MODELS['model_xgboost.pkl'].predict(features)[0])
# #             score_rf = float(ML_MODELS['model_rf.pkl'].predict(features)[0])
# #             final_score = round((score_xgb + score_rf) / 2, 2)
# #             model_name = "Ensemble (XGBoost + Random Forest)"
# #         except Exception as e:
# #             logger.warning(f"Ensemble ML failed ({e}), using weighted aggregator")
# #             agg = compute_suitability_score(
# #                 rainfall_score=rainfall_score, flood_risk_score=flood_risk_score,
# #                 landslide_risk_score=landslide_risk_score, soil_quality_score=soil_quality_score,
# #                 proximity_score=proximity_score, water_proximity_score=w_score,
# #                 pollution_score=pollution_score, landuse_score=landuse_score
# #             )
# #             final_score = agg.get("score")
# #             model_name = "Weighted Aggregator (Fallback)"

# #         # 5. BUILD EXPLANATION METADATA
# #         factor_meta = {}
# #         meta_configs = [
# #             ("rainfall", rainfall_score, "rainfall_adapter", "Measured 60d rainfall"),
# #             ("flood", flood_risk_score, "floodml_adapter", "Flood risk model"),
# #             ("landslide", landslide_risk_score, "landslide_adapter", "Slope/Landslide analysis"),
# #             ("soil", soil_quality_score, "soil_adapter", "Soil quality estimate"),
# #             ("proximity", proximity_score, "proximity_adapter", "Infrastructure proximity"),
# #             ("water", w_score, "water_adapter", f"Dist to water: {w_dist}km"),
# #             ("pollution", pollution_score, "pollution_adapter", "Air quality reading"),
# #             ("landuse", landuse_score, "landuse_adapter", "OSM landuse type")
# #         ]

# #         for name, val, src, reason in meta_configs:
# #             factor_meta[name] = {
# #                 "value": float(val), "source": src,
# #                 "confidence": "high" if val is not None else "low", "reason": reason
# #             }

# #         resp = {
# #             "suitability_score": final_score,
# #             "label": "Highly Suitable" if final_score >= 70 else ("Moderate" if final_score >= 40 else "Unsuitable"),
# #             "model_used": model_name,
# #             "factors": {
# #                 "rainfall": rainfall_score, "flood": flood_risk_score,
# #                 "landslide": landslide_risk_score, "soil": soil_quality_score,
# #                 "proximity": proximity_score, "water": w_score,
# #                 "pollution": pollution_score, "landuse": landuse_score
# #             },
# #             "explanation": {
# #                 "factors_meta": factor_meta,
# #                 "note": "ML Ensemble provides prediction based on Indian terrain patterns."
# #             },
# #             "evidence": {
# #                 "water_distance_km": w_dist,
# #                 "rainfall_total_mm_60d": rainfall_total_mm_60d
# #             },
# #             "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S IST"),
# #             "location": {"latitude": latitude, "longitude": longitude}
# #         }

# #         if debug:
# #             resp["debug"] = {"processing_ms": int((time.time() - start) * 1000)}

# #         return jsonify(resp)

# #     except Exception as e:
# #         logger.exception(f"Suitability logic failed: {e}")
# #         return jsonify({"error": str(e)}), 500


# # @app.route('/suitability', methods=['POST', 'OPTIONS'])
# # def suitability():
# #     if request.method == 'OPTIONS':
# #         return jsonify({}), 200
# #     try:
# #         data = request.json or {}
# #         debug = bool(data.get('debug'))
# #         start = time.time()
# #         latitude = float(data.get("latitude", 17.3850))
# #         longitude = float(data.get("longitude", 78.4867))

# #         # 1. PRIMARY SAFETY CHECK: Call Water Adapter First
# #         # This is the "Killer Filter" that identifies water bodies immediately.
# #         w_score, w_dist, w_details = estimate_water_proximity_score(latitude, longitude)

# #         # 2. HARD CONSTRAINT BYPASS (THE KILLER FILTER)
# #         # If the coordinate is on water (score 0) or too close (<20m), force strict 0.0.
# #         if w_score == 0.0 or (w_dist is not None and w_dist < 0.02):
# #             water_name = w_details.get('name') if w_details else "Unknown Water Body"
            
# #             # We explicitly force all factors to 0.0 for logical consistency on water.
# #             # This ensures the UI shows red bars/zeros for soil, landslide, etc.
# #             zero_factors = {
# #                 "rainfall": 0.0, "flood": 0.0, "landslide": 0.0, "soil": 0.0,
# #                 "proximity": 0.0, "water": 0.0, "pollution": 0.0, "landuse": 0.0
# #             }

# #             return jsonify({
# #                 "suitability_score": 0.0,
# #                 "label": "Not Suitable (Waterbody)",
# #                 "model_used": "Hard Constraint (Safety Filter)",
# #                 "factors": zero_factors,
# #                 "reason": f"Location identified as a water body ({water_name}). Construction is prohibited.",
# #                 "evidence": {
# #                     "water_distance_km": 0.0,
# #                     "water_details": w_details,
# #                     "note": "Terrestrial suitability factors are irrelevant for water bodies."
# #                 },
# #                 "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S IST"),
# #                 "location": {"latitude": latitude, "longitude": longitude}
# #             })

# #         # 3. IF LAND: PROCEED TO FULL ANALYSIS
# #         # Fetch actual environmental data only if the Killer Filter didn't trigger.
# #         rainfall_score, rainfall_total_mm_60d = estimate_rainfall_score(latitude, longitude)
# #         flood_risk_score = estimate_flood_risk_score(latitude, longitude) or 50.0
# #         landslide_risk_score = estimate_landslide_risk_score(latitude, longitude) or 60.0
# #         soil_quality_score = estimate_soil_quality_score(latitude, longitude) or 60.0
# #         proximity_score = compute_proximity_score(latitude, longitude) or 50.0
# #         pollution_score = estimate_pollution_score(latitude, longitude) or 65.0
# #         landuse_score = infer_landuse_score(latitude, longitude) or 70.0

# #         # 4. ENSEMBLE ML PREDICTION (XGBoost + RF)
# #         # Use an average of both models for high-fidelity land analysis.
# #         features = np.array([[
# #             rainfall_score, flood_risk_score, landslide_risk_score,
# #             soil_quality_score, proximity_score, w_score,
# #             pollution_score, landuse_score
# #         ]], dtype=float)

# #         try:
# #             # Load and average predictions from XGBoost and Random Forest
# #             score_xgb = float(ML_MODELS['model_xgboost.pkl'].predict(features)[0])
# #             score_rf = float(ML_MODELS['model_rf.pkl'].predict(features)[0])
# #             final_score = round((score_xgb + score_rf) / 2, 2)
# #             model_name = "Ensemble (XGBoost + Random Forest)"
# #         except Exception as e:
# #             logger.warning(f"Ensemble ML failed ({e}), falling back to weighted aggregator")
# #             agg = compute_suitability_score(
# #                 rainfall_score=rainfall_score, flood_risk_score=flood_risk_score,
# #                 landslide_risk_score=landslide_risk_score, soil_quality_score=soil_quality_score,
# #                 proximity_score=proximity_score, water_proximity_score=w_score,
# #                 pollution_score=pollution_score, landuse_score=landuse_score
# #             )
# #             final_score = agg.get("score")
# #             model_name = "Weighted Aggregator (Fallback)"

# #         # 5. BUILD RESPONSE
# #         resp = {
# #             "suitability_score": final_score,
# #             "label": "Highly Suitable" if final_score >= 70 else ("Moderate" if final_score >= 40 else "Unsuitable"),
# #             "model_used": model_name,
# #             "factors": {
# #                 "rainfall": rainfall_score, "flood": flood_risk_score,
# #                 "landslide": landslide_risk_score, "soil": soil_quality_score,
# #                 "proximity": proximity_score, "water": w_score,
# #                 "pollution": pollution_score, "landuse": landuse_score
# #             },
# #             "evidence": {
# #                 "water_distance_km": w_dist,
# #                 "rainfall_total_mm_60d": rainfall_total_mm_60d
# #             },
# #             "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S IST"),
# #             "location": {"latitude": latitude, "longitude": longitude}
# #         }

# #         if debug:
# #             resp["debug"] = {"processing_ms": int((time.time() - start) * 1000)}

# #         return jsonify(resp)

# #     except Exception as e:
# #         logger.exception(f"Suitability logic failed: {e}")
# #         return jsonify({"error": str(e)}), 500


# # @app.route('/suitability', methods=['POST', 'OPTIONS'])
# # def suitability():
# #     if request.method == 'OPTIONS':
# #         return jsonify({}), 200
# #     try:
# #         data = request.json or {}
# #         debug = bool(data.get('debug'))
# #         start = time.time()
        
# #         # Capture the input coordinates
# #         latitude = float(data.get("latitude", 17.3850))
# #         longitude = float(data.get("longitude", 78.4867))

# #         # 1. PRIMARY SAFETY CHECK: Call Water Adapter First
# #         w_score, w_dist, w_details = estimate_water_proximity_score(latitude, longitude)

# #         # 2. DETAILED WATER BODY OVERRIDE
# #         # If w_score is 0.0, we are on a water body.
# #         if w_score == 0.0 or (w_dist is not None and w_dist < 0.02):
# #             water_name = w_details.get('name') if w_details else "an unidentified water body"
            
# #             # Create a professional, detailed explanation for the user
# #             detailed_description = (
# #                 f"The coordinates ({latitude}, {longitude}) correspond to a location situated directly on {water_name}. "
# #                 "Because this is a permanent water feature, terrestrial land suitability is strictly zero. "
# #                 "Such areas are fundamentally unsuitable for human construction, urban development, or "
# #                 "industrial activity due to environmental preservation laws and the lack of stable solid ground."
# #             )

# #             # Force all factors to 0.0 for logical UI consistency
# #             zero_factors = {
# #                 "rainfall": 0.0, "flood": 0.0, "landslide": 0.0, "soil": 0.0,
# #                 "proximity": 0.0, "water": 0.0, "pollution": 0.0, "landuse": 0.0
# #             }

# #             return jsonify({
# #                 "suitability_score": 0.0,
# #                 "label": "Not Suitable (Waterbody)",
# #                 "model_used": "Hard Constraint (Safety Filter)",
# #                 "factors": zero_factors,
# #                 "reason": detailed_description,
# #                 "evidence": {
# #                     "water_distance_km": 0.0,
# #                     "water_details": w_details,
# #                     "location_summary": f"Latitude: {latitude}, Longitude: {longitude}"
# #                 },
# #                 "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S IST"),
# #                 "location": {"latitude": latitude, "longitude": longitude}
# #             })

# #         # 3. IF LAND: PROCEED TO FULL ANALYSIS
# #         # These are only called if we are NOT on water
# #         rainfall_score, rain_mm = estimate_rainfall_score(latitude, longitude)
# #         flood_s = estimate_flood_risk_score(latitude, longitude) or 50.0
# #         landslide_s = estimate_landslide_risk_score(latitude, longitude) or 60.0
# #         soil_s = estimate_soil_quality_score(latitude, longitude) or 60.0
# #         prox_s = compute_proximity_score(latitude, longitude) or 50.0
# #         poll_s = estimate_pollution_score(latitude, longitude) or 65.0
# #         landuse_s = infer_landuse_score(latitude, longitude) or 70.0

# #         # 4. ENSEMBLE ML PREDICTION
# #         features = np.array([[
# #             rainfall_score, flood_s, landslide_s, soil_s, 
# #             prox_s, w_score, poll_s, landuse_s
# #         ]], dtype=float)

# #         try:
# #             score_xgb = float(ML_MODELS['model_xgboost.pkl'].predict(features)[0])
# #             score_rf = float(ML_MODELS['model_rf.pkl'].predict(features)[0])
# #             final_score = round((score_xgb + score_rf) / 2, 2)
# #             model_name = "Ensemble (XGBoost + Random Forest)"
# #         except Exception as e:
# #             logger.warning(f"ML Prediction failed: {e}")
# #             agg = compute_suitability_score(
# #                 rainfall_score=rainfall_score, flood_risk_score=flood_s,
# #                 landslide_risk_score=landslide_s, soil_quality_score=soil_s,
# #                 proximity_score=prox_s, water_proximity_score=w_score,
# #                 pollution_score=poll_s, landuse_score=landuse_s
# #             )
# #             final_score = agg.get("score")
# #             model_name = "Weighted Aggregator (Fallback)"

# #         # 5. FINAL RESPONSE
# #         return jsonify({
# #             "suitability_score": final_score,
# #             "label": "Highly Suitable" if final_score >= 70 else ("Moderate" if final_score >= 40 else "Unsuitable"),
# #             "model_used": model_name,
# #             "factors": {
# #                 "rainfall": rainfall_score, "flood": flood_s, "landslide": landslide_s,
# #                 "soil": soil_s, "proximity": prox_s, "water": w_score,
# #                 "pollution": poll_s, "landuse": landuse_s
# #             },
# #             "evidence": {
# #                 "water_distance_km": w_dist,
# #                 "rainfall_total_mm_60d": rain_mm
# #             },
# #             "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S IST"),
# #             "location": {"latitude": latitude, "longitude": longitude}
# #         })

# #     except Exception as e:
# #         logger.exception(f"Suitability error: {e}")
# #         return jsonify({"error": str(e)}), 500
    


# @app.route("/", defaults={"path": ""})
# @app.route("/<path:path>")
# def serve_react(path):
#     build_dir = app.static_folder
#     if path != "" and os.path.exists(os.path.join(build_dir, path)):
#         return send_from_directory(build_dir, path)
#     return send_from_directory(build_dir, "index.html")

# @app.route('/risk_zones', methods=['POST'])
# def risk_zones():
#     try:
#         data = request.json or {}
#         min_lat, min_lng = float(data.get('min_lat')), float(data.get('min_lng'))
#         max_lat, max_lng = float(data.get('max_lat')), float(data.get('max_lng'))
#         grid_n = min(25, max(2, int(data.get('grid_n', 6))))

#         points = []
#         for i in range(grid_n):
#             lat = min_lat + (max_lat - min_lat) * (i / (grid_n - 1))
#             for j in range(grid_n):
#                 lng = min_lng + (max_lng - min_lng) * (j / (grid_n - 1))
#                 points.append((lat, lng))

#         def eval_point(pt):
#             lat, lng = pt
#             w_score, w_dist, w_det = estimate_water_proximity_score(lat, lng)
            
#             # Apply Hard Stop for water in grid mapping
#             if (w_dist is not None and w_dist < 0.02) or w_score == 0.0:
#                 return {"type": "Feature", "geometry": {"type": "Point", "coordinates": [lng, lat]}, 
#                         "properties": {"score": 0.0, "label": "Unsafe"}}
            
#             agg = compute_suitability_score(
#                 rainfall_score=estimate_rainfall_score(lat, lng)[0] or 50,
#                 flood_risk_score=estimate_flood_risk_score(lat, lng) or 50,
#                 landslide_risk_score=estimate_landslide_risk_score(lat, lng) or 50,
#                 soil_quality_score=estimate_soil_quality_score(lat, lng) or 50,
#                 proximity_score=50, water_proximity_score=w_score or 50,
#                 pollution_score=50, landuse_score=50
#             )
#             score = agg.get('score', 50)
#             label = 'Unsafe' if score < 30 else ('Caution' if score < 60 else 'Safe')
#             return {"type": "Feature", "geometry": {"type": "Point", "coordinates": [lng, lat]}, 
#                     "properties": {"score": score, "label": label}}

#         from concurrent.futures import ThreadPoolExecutor
#         with ThreadPoolExecutor(max_workers=8) as ex:
#             features = list(ex.map(eval_point, points))

#         return jsonify({"type": "FeatureCollection", "features": features})
#     except Exception as e:
#         return jsonify({"error": str(e)}), 400

# if __name__ == "__main__":
#     app.run(debug=False, host="0.0.0.0", port=5000, use_reloader=False, threaded=True)





















import os
import pymongo
from flask import Flask, request, jsonify
import requests
import numpy as np
import pickle
from datetime import datetime
import logging
import time
from flask import send_from_directory

# --- Configuration & Model Loading ---
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.dirname(BACKEND_DIR)
MODEL_PATH = os.path.join(BASE_DIR, "ml", "models")

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
)

app = Flask(__name__, static_folder=os.path.join(BASE_DIR, "frontend", "build"), static_url_path="")
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

@app.route('/suitability', methods=['POST', 'OPTIONS'])
def suitability():
    if request.method == 'OPTIONS':
        return jsonify({}), 200
    try:
        data = request.json or {}
        latitude = float(data.get("latitude", 17.3850))
        longitude = float(data.get("longitude", 78.4867))

        # 1. THE EARLY EXIT (Fixes 'Too Much Time' issue)
        # We check water first. If on water, we stop immediately.
        w_score, w_dist, w_details = estimate_water_proximity_score(latitude, longitude)

        if w_score == 0.0 or (w_dist is not None and w_dist < 0.02):
            water_name = w_details.get('name') if w_details else "an identified water body"
            return jsonify({
                "suitability_score": 0.0,
                "label": "Not Suitable (Waterbody)",
                "factors": {k: 0.0 for k in ["rainfall", "flood", "landslide", "soil", "proximity", "water", "pollution", "landuse"]},
                "reason": f"Coordinates ({latitude}, {longitude}) are on {water_name}. Unsuitable for construction.",
                "evidence": {"water_distance_km": 0.0, "water_details": w_details},
                "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S IST"),
                "location": {"latitude": latitude, "longitude": longitude}
            })

        # 2. LAND ANALYSIS (Only runs if the early exit above is skipped)
        # We wrap these in defensive checks to prevent the 'random errors'
        rainfall_score, rain_mm = estimate_rainfall_score(latitude, longitude)
        flood_s = estimate_flood_risk_score(latitude, longitude) or 50.0
        landslide_s = estimate_landslide_risk_score(latitude, longitude) or 60.0
        soil_s = estimate_soil_quality_score(latitude, longitude) or 60.0
        
        # DEFENSIVE FIX: Extract [0] because these adapters return (score, distance, details)
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
        except:
            agg = compute_suitability_score(
                rainfall_score=rainfall_score, flood_risk_score=flood_s,
                landslide_risk_score=landslide_s, soil_quality_score=soil_s,
                proximity_score=prox_s, water_proximity_score=w_score,
                pollution_score=poll_s, landuse_score=landuse_s
            )
            final_score = agg.get("score")
            model_used = "Weighted Aggregator (Fallback)"

        return jsonify({
            "suitability_score": final_score,
            "label": "Highly Suitable" if final_score >= 70 else ("Moderate" if final_score >= 40 else "Unsuitable"),
            "model_used": model_used,
            "factors": {
                "rainfall": rainfall_score, "flood": flood_s, "landslide": landslide_s,
                "soil": soil_s, "proximity": prox_s, "water": w_score,
                "pollution": poll_s, "landuse": landuse_s
            },
            "evidence": {"water_distance_km": w_dist, "rainfall_total_mm_60d": rain_mm},
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S IST"),
            "location": {"latitude": latitude, "longitude": longitude}
        })
    except Exception as e:
        logger.exception(f"Suitability error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/", defaults={"path": ""})
@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok"}), 200
@app.route("/<path:path>")
def serve_react(path):
    build_dir = app.static_folder
    if path != "" and os.path.exists(os.path.join(build_dir, path)):
        return send_from_directory(build_dir, path)
    return send_from_directory(build_dir, "index.html")

if __name__ == "__main__":
    app.run(debug=False, host="0.0.0.0", port=5000, threaded=True)