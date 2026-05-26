"""
Machine Learning Routes - Crop Prediction,
Disease Detection, Irrigation Control
"""

import os
from flask import (
    Blueprint,
    request,
    jsonify
)

from ml.irrigation.predict.irrigation_predict import (
    BASE_DIR,
    predict_irrigation
)

from ml.crop.predict.crop_predict import (
    predict_crop
)

# ==========================================
# LOAD DISEASE MODEL ONLY ONCE
# ==========================================

try:
    from ml.disease.predict.disease_predict import (
        predict_disease as run_disease_prediction
    )

    print(
        "🔥 Disease model loaded"
    )

except Exception as e:

    print(
        "❌ Disease model load failed:",
        e
    )

    run_disease_prediction = None


ml_bp = Blueprint(
    'ml',
    __name__,
    url_prefix='/api/ml'
)

UPLOAD_DIR = os.path.join(
    BASE_DIR,
    "uploads"
)

os.makedirs(
    UPLOAD_DIR,
    exist_ok=True
)


# ==========================================
# 🌾 CROP PREDICTION
# ==========================================
@ml_bp.route(
    '/crop-predict',
    methods=['GET']
)
def predict_from_db():

    try:

        latest = {
            "N": 90,
            "P": 42,
            "K": 43,
            "temperature": 21,
            "humidity": 82,
            "ph": 6.5,
            "rainfall": 202
        }

        features = [
            latest["N"],
            latest["P"],
            latest["K"],
            latest["temperature"],
            latest["humidity"],
            latest["ph"],
            latest["rainfall"]
        ]

        print(
            "🔥 Crop Features:",
            features
        )

        prediction = predict_crop(
            features
        )

        return jsonify({
            "status": "success",
            "prediction":
                str(prediction),
            "used_sensor_data":
                latest
        }), 200

    except Exception as e:

        print(
            "❌ Crop Error:",
            e
        )

        return jsonify({
            "status": "error",
            "error": str(e)
        }), 500


# ==========================================
# 💧 IRRIGATION PREDICTION
# ==========================================
@ml_bp.route(
    '/irrigation-predict',
    methods=['GET']
)
def predict_irrigation_api():

    try:

        latest = {
            "temperature": 25.0,
            "humidity": 60.0,
            "soil_moisture": 30.0,
            "rain_detection": 0,
            "water_level": 50.0
        }

        print(
            "🔥 Irrigation Data:",
            latest
        )

        motor, irrigation_time, confidence = (
            predict_irrigation(
                latest
            )
        )

        return jsonify({
            "status": "success",
            "motor_status":
                "ON"
                if motor == 1
                else "OFF",

            "irrigation_time":
                round(
                    irrigation_time,
                    2
                ),

            "confidence":
                round(
                    confidence * 100,
                    2
                )
                if confidence
                else 0
        }), 200

    except Exception as e:

        print(
            "❌ Irrigation Error:",
            e
        )

        return jsonify({
            "status": "error",
            "error": str(e)
        }), 500


# ==========================================
# 🍃 DISEASE DETECTION
# ==========================================
@ml_bp.route(
    '/disease-detect',
    methods=['POST']
)
def predict_disease_api():

    try:

        if run_disease_prediction is None:

            return jsonify({
                "status":
                    "error",
                "error":
                    "Disease model not loaded"
            }), 500

        if (
            "image"
            not in request.files
        ):

            return jsonify({
                "status":
                    "error",
                "error":
                    "No image uploaded"
            }), 400

        image_file = request.files[
            "image"
        ]

        if not image_file.filename:

            return jsonify({
                "status":
                    "error",
                "error":
                    "No file selected"
            }), 400

        image_path = os.path.join(
            UPLOAD_DIR,
            image_file.filename
        )

        image_file.save(
            image_path
        )

        print(
            "🔥 IMAGE SAVED:",
            image_path
        )

        result = run_disease_prediction(
            image_path
        )

        return jsonify({
            "status":
                "success",
            **result
        }), 200

    except Exception as e:

        print(
            "❌ Disease Error:",
            e
        )

        return jsonify({
            "status":
                "error",
            "error":
                str(e)
        }), 500