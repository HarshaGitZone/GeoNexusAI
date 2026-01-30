import os
import pickle
import numpy as np

# Load models once (fast at runtime)
MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")

_rf = pickle.load(open(os.path.join(MODEL_DIR, "model_rf.pkl"), "rb"))
_xgb = pickle.load(open(os.path.join(MODEL_DIR, "model_xgboost.pkl"), "rb"))
print("RF expects:", _rf.n_features_in_)
print("XGB expects:", _xgb.n_features_in_)
def predict_suitability_ml(features):
    """
    features = [
        rainfall_score,
        flood_risk_score,
        landslide_risk_score,
        soil_quality_score,
        proximity_score,
        water_proximity_score,
        pollution_score,
        landuse_score,
        flood_x_water,
        rain_x_slope
    ]
    """
    X = np.array(features, dtype=float).reshape(1, -1)

    rf_pred = _rf.predict(X)[0]
    xgb_pred = _xgb.predict(X)[0]

    # Weighted ensemble (guide-friendly + stable)
    final_pred = (0.6 * rf_pred) + (0.4 * xgb_pred)

    return round(float(final_pred), 2)
