"""
IoT Routes - Sensor data and device communication
"""

from flask import Blueprint, request, jsonify
from iot.sensor_api import process_sensor

iot_bp = Blueprint('iot', __name__, url_prefix='/api/iot')


@iot_bp.route('/sensor-data', methods=['POST'])
def iot_sensor_data():
    """
    Receive and process sensor data from IoT devices
    
    Request JSON:
    {
        "device_id": "device_001",
        "temperature": 25.5,
        "humidity": 60,
        "soil_moisture": 45,
        "timestamp": 1234567890
    }
    
    Response:
    {
        "status": "received",
        "device_id": "device_001"
    }
    """
    try:
        sensor_data = request.json or {}
        
        if not sensor_data:
            return jsonify({
                "status": "error",
                "message": "No data provided"
            }), 400
        
        # Process sensor data
        process_sensor(sensor_data)
        
        return jsonify({
            "status": "success",
            "message": "Sensor data received",
            "device_id": sensor_data.get("device_id", "unknown")
        }), 200
    
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@iot_bp.route('/health', methods=['GET'])
def iot_health():
    """
    Check IoT system health status
    
    Response:
    {
        "status": "healthy",
        "devices": number,
        "last_update": timestamp
    }
    """
    try:
        return jsonify({
            "status": "healthy",
            "message": "IoT system operational"
        }), 200
    
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500
