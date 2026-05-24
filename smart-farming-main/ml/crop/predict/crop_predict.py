import joblib
import numpy as np
import os

BASE_DIR = os.path.dirname(__file__)

MODEL_PATH = os.path.join(BASE_DIR, "..", "models", "crop_model.pkl")
SCALER_PATH = os.path.join(BASE_DIR, "..", "models", "scaler.pkl")

# load model
model = joblib.load(MODEL_PATH)

# load scaler
scaler = joblib.load(SCALER_PATH)

def predict_crop(features):
    """
    features: list (same order as training CSV)
    """
    print(f"DEBUG: Model expecting {scaler.n_features_in_} features. Got {len(features)}")
    
    if len(features) != scaler.n_features_in_:
        # Adjust features to match model expectations if they differ
        # This is a fallback to prevent 500 errors
        if len(features) > scaler.n_features_in_:
            features = features[:scaler.n_features_in_]
        else:
            features = features + [0] * (scaler.n_features_in_ - len(features))

    data = np.array(features).reshape(1, -1)

    scaled_data = scaler.transform(data)

    prediction = model.predict(scaled_data)

    return prediction[0]
