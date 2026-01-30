# def predict_flood_score(rain_mm, water_dist):
#     rain_mm = rain_mm or 200
#     water_dist = water_dist or 2.0
#     with open(MODEL_PATH, "rb") as f:
#         model = pickle.load(f)
#     return float(model.predict([[rain_mm, water_dist]])[0])
