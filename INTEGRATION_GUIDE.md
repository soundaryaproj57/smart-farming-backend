# Smart Farming System - Path Planner Integration Guide

## Overview

The Path Planner module from **pro 2** has been successfully integrated into the Smart Farming System with a **proper modular blueprint structure**. This document explains the new routing architecture and how to use the path planning API.

---

## 🏗️ Project Structure

```
smart-farming-main 5/
├── app.py                          # Main Flask app with blueprint registration
├── path_planner.py                 # Boustrophedon path planning algorithm
├── routing/                        # NEW: Modular routing structure
│   ├── __init__.py                # Blueprint exports
│   ├── path_planner_routes.py      # ✅ Path planning endpoints
│   ├── ml_routes.py                # ✅ ML prediction endpoints
│   ├── auth_routes.py              # ✅ Authentication endpoints
│   └── iot_routes.py               # ✅ IoT sensor data endpoints
├── ml/                             # Machine learning models
├── database/                       # Database utilities
├── iot/                            # IoT sensor interfaces
├── static/                         # Frontend assets
└── templates/                      # HTML templates
```

---

## 🚀 API Endpoints

### Path Planning API

Base URL: `/api/path`

#### 1. Plan Field Coverage Path
**POST** `/api/path/plan`

Generate optimal coverage path for field using Boustrophedon algorithm.

**Request:**
```json
{
  "field_boundary": [
    [40.7128, -74.0060],
    [40.7129, -74.0061],
    [40.7130, -74.0062],
    [40.7131, -74.0061]
  ],
  "obstacles": [],
  "implement_width": 1.2
}
```

**Response:**
```json
{
  "success": true,
  "waypoints": [
    {"lat": 40.7128, "lon": -74.0060},
    {"lat": 40.7129, "lon": -74.0061},
    ...
  ],
  "path_length": 45,
  "implement_width": 1.2
}
```

#### 2. Validate Field Boundary
**POST** `/api/path/validate`

Validate field boundary and calculate area/perimeter.

**Request:**
```json
{
  "field_boundary": [
    [40.7128, -74.0060],
    [40.7129, -74.0061],
    [40.7130, -74.0062]
  ]
}
```

**Response:**
```json
{
  "valid": true,
  "area": 12345.67,
  "perimeter": 1234.56,
  "points": 3
}
```

#### 3. Export Waypoints
**POST** `/api/path/export`

Export generated waypoints for mission planning.

**Request:**
```json
{
  "waypoints": [...],
  "format": "json"
}
```

**Response:**
```json
{
  "success": true,
  "data": [...],
  "count": 45,
  "format": "json"
}
```

---

### Machine Learning API

Base URL: `/api/ml`

#### 1. Crop Prediction
**GET** `/api/ml/crop-predict`

Predict crop recommendation from sensor data.

**Response:**
```json
{
  "status": "success",
  "prediction": "Rice",
  "used_sensor_data": {...}
}
```

#### 2. Irrigation Prediction
**GET** `/api/ml/irrigation-predict`

Predict irrigation requirements.

**Response:**
```json
{
  "status": "success",
  "motor_status": "ON",
  "irrigation_time": 30.5,
  "confidence": 95.2
}
```

#### 3. Disease Detection
**POST** `/api/ml/disease-detect`

Detect crop disease from leaf image.

**Request:**
- multipart/form-data with 'image' file

**Response:**
```json
{
  "status": "success",
  "disease": "Leaf_Blight",
  "confidence": 92.5,
  "recommendation": "Apply fungicide..."
}
```

---

### Authentication API

Base URL: `/api/auth`

#### 1. Sign Up
**POST** `/api/auth/signup`

Register new user.

**Request:**
```json
{
  "email": "farmer@example.com",
  "password": "password123",
  "role": "farmer"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Signup Success ✅"
}
```

#### 2. Login
**POST** `/api/auth/login`

Authenticate user.

**Request:**
```json
{
  "email": "farmer@example.com",
  "password": "password123",
  "role": "farmer"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Login Success ✅"
}
```

---

### IoT API

Base URL: `/api/iot`

#### 1. Send Sensor Data
**POST** `/api/iot/sensor-data`

Receive and process sensor data from IoT devices.

**Request:**
```json
{
  "device_id": "device_001",
  "temperature": 25.5,
  "humidity": 60,
  "soil_moisture": 45,
  "timestamp": 1234567890
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Sensor data received",
  "device_id": "device_001"
}
```

#### 2. Health Check
**GET** `/api/iot/health`

Check IoT system status.

**Response:**
```json
{
  "status": "healthy",
  "message": "IoT system operational"
}
```

---

## 📋 Migration from Pro 2

### Original Routes (Pro 2)
```
POST /api/plan_path
POST /api/export_waypoints
```

### New Routes (Smart Farming)
```
POST /api/path/plan              (enhanced with validation)
POST /api/path/validate          (new feature)
POST /api/path/export            (enhanced)
```

**Backward Compatibility:** The old endpoints still work but use the new blueprint system internally.

---

## 💻 Frontend Integration

### Example: Using Path Planning in HTML/JavaScript

```javascript
// Get field boundary from map drawing
const fieldBoundary = [
  [40.7128, -74.0060],
  [40.7129, -74.0061],
  [40.7130, -74.0062],
  [40.7131, -74.0061]
];

// Call path planning API
fetch('/api/path/plan', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    field_boundary: fieldBoundary,
    obstacles: [],
    implement_width: 1.2
  })
})
.then(response => response.json())
.then(data => {
  if (data.success) {
    console.log('Generated waypoints:', data.waypoints);
    // Display waypoints on map
    displayWaypoints(data.waypoints);
  } else {
    console.error('Error:', data.error);
  }
});
```

---

## 🔧 Key Features

### Boustrophedon Path Planning Algorithm
- **Optimal Coverage:** Generates efficient back-and-forth coverage patterns
- **Field Boundary Support:** Works with complex field shapes
- **Obstacle Avoidance:** Optional obstacle definitions
- **Configurable Width:** Adjust implement width for different equipment
- **Smooth Turns:** Generates smooth transition curves between rows

### Blueprint Architecture Benefits
- ✅ **Modular Design:** Each feature has its own route file
- ✅ **Scalability:** Easy to add new features without cluttering main app.py
- ✅ **Maintainability:** Clear separation of concerns
- ✅ **Testability:** Easier to unit test individual route modules
- ✅ **Reusability:** Blueprints can be imported in other Flask apps

---

## 🧪 Testing the Integration

### 1. Test Path Planning
```bash
curl -X POST http://localhost:5000/api/path/plan \
  -H "Content-Type: application/json" \
  -d '{
    "field_boundary": [[40.7128, -74.0060], [40.7129, -74.0061], [40.7130, -74.0062]],
    "obstacles": [],
    "implement_width": 1.2
  }'
```

### 2. Test Field Validation
```bash
curl -X POST http://localhost:5000/api/path/validate \
  -H "Content-Type: application/json" \
  -d '{
    "field_boundary": [[40.7128, -74.0060], [40.7129, -74.0061], [40.7130, -74.0062]]
  }'
```

### 3. Test Waypoint Export
```bash
curl -X POST http://localhost:5000/api/path/export \
  -H "Content-Type: application/json" \
  -d '{
    "waypoints": [{"lat": 40.7128, "lon": -74.0060}],
    "format": "json"
  }'
```

---

## 📝 Configuration

### Implement Width
- Default: `1.2` meters
- Adjustable per request
- Affects row spacing in coverage pattern

### Safety Margin
- Default: `0.1` meters
- Prevents overlap between rows
- Hardcoded in `BoustrophedonPlanner`

### Row Spacing Calculation
```
row_spacing = (implement_width - safety_margin) / 111320.0  # in degrees
```

---

## 🐛 Error Handling

All endpoints return proper HTTP status codes:

- `200 OK` - Successful operation
- `400 Bad Request` - Invalid input (e.g., < 3 boundary points)
- `401 Unauthorized` - Authentication failed
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server-side error

---

## 🚀 Running the Application

```bash
cd /Users/abdulrahaman/Downloads/smart-farming-main\ 5
python3 app.py
```

The application will start on `http://127.0.0.1:5000`

---

## 📞 Support

For issues or questions:
1. Check the `routing/` directory for endpoint implementations
2. Verify request JSON format matches examples
3. Check server logs for detailed error messages
4. Ensure field boundary has at least 3 points
5. Validate JSON formatting in requests

---

## 🎯 Future Enhancements

- [ ] Support for drone mission planning
- [ ] KML/GPX export formats
- [ ] Real-time path optimization
- [ ] Multi-crop field support
- [ ] Weather-based route adjustments
- [ ] Fuel consumption estimation
