import joblib
import numpy as np
import os

# -----------------------------
# LOAD SMART IRRIGATION MODEL
# -----------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "..", "models", "irrigation_model.pkl")

bundle = joblib.load(MODEL_PATH)

classifier = bundle["classifier"]      # ON / OFF model
regressor = bundle["regressor"]        # Duration model
FEATURE_ORDER = bundle["feature_order"]

print("🔥 Loaded Smart Irrigation Model")
print("🔥 Feature order:", FEATURE_ORDER)

# -----------------------------
# PREDICTION FUNCTION
# -----------------------------
def predict_irrigation(sensor_dict):
    """
    sensor_dict example:
    {
      "temperature": 23,
      "humidity": 70,
      "soil_moisture": 27,
      "rain_detection": 1,
      "water_level": 43
    }
    """

    # Arrange features exactly as training
    X = np.array([[sensor_dict[f] for f in FEATURE_ORDER]])

    # 1️⃣ ON / OFF prediction
    motor_status = int(classifier.predict(X)[0])

    # 2️⃣ Duration prediction (ONLY if motor ON)
    irrigation_time = 0.0
    confidence = None

    if motor_status == 1:
        irrigation_time = float(regressor.predict(X)[0])

        # confidence from calibrated classifier
        confidence = float(classifier.predict_proba(X)[0][1])

    return motor_status, irrigation_time, confidence
