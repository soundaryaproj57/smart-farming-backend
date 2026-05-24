"""
Machine Learning Routes - Crop Prediction, Disease Detection, Irrigation Control
"""

import os
from time import time
from flask import Blueprint, request, jsonify
from firebase_config import rtdb
from ml.irrigation.predict.irrigation_predict import BASE_DIR, predict_irrigation
from ml.crop.predict.crop_predict import predict_crop

ml_bp = Blueprint('ml', __name__, url_prefix='/api/ml')

UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@ml_bp.route('/crop-predict', methods=['GET'])
def predict_from_db():
    """
    Predict crop recommendation from latest sensor data
    """
    try:
        latest = rtdb.reference("sensor_data/latest").get()
        
        # 🧪 Mock data if Firebase is empty or missing keys
        if not latest:
            latest = {
                "N": 90, "P": 42, "K": 43, 
                "temperature": 20.8, "humidity": 82.0, 
                "ph": 6.5, "rainfall": 202.9,
                "soil_moisture": 45.0
            }
        
        # Ensure all required keys exist, else use defaults
        required_keys = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]
        for key in required_keys:
            if key not in latest:
                # Default values for Rice (common in datasets)
                defaults = {"N": 90, "P": 42, "K": 43, "temperature": 21, "humidity": 82, "ph": 6.5, "rainfall": 202}
                latest[key] = defaults.get(key, 0)

        features = [
            latest["N"],
            latest["P"],
            latest["K"],
            latest["temperature"],
            latest["humidity"],
            latest["ph"],
            latest["rainfall"]
        ]
        
        print(f"DEBUG: Features for crop prediction: {features}")
        prediction = predict_crop(features)
        
        return jsonify({
            "status": "success",
            "prediction": str(prediction),
            "used_sensor_data": latest
        }), 200
    
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({
            "status": "error",
            "error": str(e)
        }), 500


@ml_bp.route('/irrigation-predict', methods=['GET'])
def predict_irrigation_api():
    """
    Predict irrigation requirements and control motor
    """
    try:
        latest = rtdb.reference("sensor_data/latest").get()
        
        # 🧪 Mock data if Firebase is empty or missing keys
        if not latest:
            latest = {
                "temperature": 25.0,
                "humidity": 60.0,
                "soil_moisture": 30.0,
                "rain_detection": 0,
                "water_level": 50.0
            }
        
        # Ensure all required keys for irrigation model exist
        required_keys = ["temperature", "humidity", "soil_moisture", "rain_detection", "water_level"]
        for key in required_keys:
            if key not in latest:
                defaults = {"temperature": 25, "humidity": 60, "soil_moisture": 30, "rain_detection": 0, "water_level": 50}
                latest[key] = defaults.get(key, 0)

        print("🔥 IRRIGATION DATA:", latest)
        
        motor, irrigation_time, confidence = predict_irrigation(latest)
        
        # Send command to Firebase for ESP32
        rtdb.reference("irrigation_command").set({
            "motor": int(motor),
            "duration": float(irrigation_time),
            "timestamp": int(time())
        })
        
        return jsonify({
            "status": "success",
            "motor_status": "ON" if motor == 1 else "OFF",
            "irrigation_time": round(irrigation_time, 2),
            "confidence": round(confidence * 100, 2) if confidence else 0
        }), 200
    
    except Exception as e:
        import traceback
        traceback.print_exc()
        print("❌ IRRIGATION ERROR:", e)
        return jsonify({
            "status": "error",
            "error": str(e)
        }), 500


@ml_bp.route('/disease-detect', methods=['POST'])
def predict_disease_api():
    """
    Detect crop disease from leaf image
    
    Request:
    - multipart/form-data with 'image' file
    
    Response:
    {
        "status": "success",
        "disease": "disease_name",
        "confidence": percentage,
        "recommendation": "treatment_info"
    }
    """
    try:
        if "image" not in request.files:
            return jsonify({
                "status": "error",
                "error": "No image uploaded"
            }), 400
        
        image_file = request.files["image"]
        
        if not image_file.filename:
            return jsonify({
                "status": "error",
                "error": "No file selected"
            }), 400
        
        # Save image safely
        image_path = os.path.join(UPLOAD_DIR, image_file.filename)
        image_file.save(image_path)
        
        print("🔥 IMAGE SAVED:", image_path)
        
        # Call ML pipeline
        from ml.disease.predict.disease_predict import predict_disease
        result = predict_disease(image_path)
        
        return jsonify({
            "status": "success",
            **result
        }), 200
    
    except Exception as e:
        print("❌ DISEASE ERROR:", e)
        return jsonify({
            "status": "error",
            "error": str(e)
        }), 500
