import numpy as np
import pickle
import os

MODEL_PATH = os.path.join(os.path.dirname(__file__), "rainfall_model.pkl")

def predict_rainfall_score(rain_mm_60d):
    rain_mm_60d = rain_mm_60d or 200
    with open(MODEL_PATH, "rb") as f:
        model = pickle.load(f)
    return float(model.predict([[rain_mm_60d]])[0])
