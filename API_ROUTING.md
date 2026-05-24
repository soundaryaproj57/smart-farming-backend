# Smart Farming System - API Routing Structure

## 🏗️ New Modular Architecture

The application now uses **Flask Blueprints** for clean, organized routing:

```
app.py (Main Application)
│
├── routing/
│   ├── __init__.py
│   ├── path_planner_routes.py    → /api/path/*
│   ├── ml_routes.py               → /api/ml/*
│   ├── auth_routes.py             → /api/auth/*
│   └── iot_routes.py              → /api/iot/*
```

---

## 📍 Complete API Endpoint Reference

### Path Planning Routes (`/api/path`)

| Method | Endpoint | From Pro 2 | Purpose |
|--------|----------|-----------|---------|
| POST | `/api/path/plan` | ✅ Yes | Generate field coverage path |
| POST | `/api/path/validate` | ❌ New | Validate field boundary |
| POST | `/api/path/export` | ✅ Yes | Export waypoints |

### Machine Learning Routes (`/api/ml`)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/ml/crop-predict` | Predict recommended crop |
| GET | `/api/ml/irrigation-predict` | Calculate irrigation needs |
| POST | `/api/ml/disease-detect` | Detect crop disease from image |

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Authenticate user |

### IoT Routes (`/api/iot`)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/iot/sensor-data` | Receive sensor data |
| GET | `/api/iot/health` | Check system health |

### Page Routes (Direct Routes)

| Route | Purpose |
|-------|---------|
| `/` | Home page |
| `/dashboard` | Dashboard page |

---

## 📊 Request/Response Examples

### 1. Path Planning API

**Request:**
```bash
POST /api/path/plan
Content-Type: application/json

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

---

### 2. Field Validation API

**Request:**
```bash
POST /api/path/validate
Content-Type: application/json

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

---

### 3. Disease Detection API

**Request:**
```bash
POST /api/ml/disease-detect
Content-Type: multipart/form-data

[image file upload]
```

**Response:**
```json
{
  "status": "success",
  "disease": "Leaf_Blight",
  "confidence": 92.5,
  "recommendation": "Apply fungicide XYZ"
}
```

---

### 4. Crop Prediction API

**Request:**
```bash
GET /api/ml/crop-predict
```

**Response:**
```json
{
  "status": "success",
  "prediction": "Rice",
  "used_sensor_data": {
    "K": 50,
    "N": 120,
    "P": 80,
    "soil_moisture": 45,
    "humidity": 60,
    "ph": 6.8,
    "rainfall": 100,
    "temperature": 25.5
  }
}
```

---

### 5. Irrigation Control API

**Request:**
```bash
GET /api/ml/irrigation-predict
```

**Response:**
```json
{
  "status": "success",
  "motor_status": "ON",
  "irrigation_time": 30.5,
  "confidence": 95.2
}
```

---

### 6. Sensor Data API

**Request:**
```bash
POST /api/iot/sensor-data
Content-Type: application/json

{
  "device_id": "sensor_001",
  "temperature": 25.5,
  "humidity": 60,
  "soil_moisture": 45,
  "timestamp": 1707584400
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Sensor data received",
  "device_id": "sensor_001"
}
```

---

### 7. Authentication - Signup

**Request:**
```bash
POST /api/auth/signup
Content-Type: application/json

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

---

### 8. Authentication - Login

**Request:**
```bash
POST /api/auth/login
Content-Type: application/json

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

## 🔄 Integration from Pro 2

### Old Route Structure
```
Pro 2 (app.py)
├── POST /api/plan_path
├── POST /api/export_waypoints
├── GET /
└── render_template('index.html')
```

### New Route Structure
```
Smart Farming (app.py + routing/)
├── POST /api/path/plan              (from Pro 2)
├── POST /api/path/export            (from Pro 2)
├── POST /api/path/validate          (NEW)
├── GET /api/ml/crop-predict
├── GET /api/ml/irrigation-predict
├── POST /api/ml/disease-detect
├── POST /api/auth/signup
├── POST /api/auth/login
├── POST /api/iot/sensor-data
├── GET /api/iot/health
├── GET /
└── GET /dashboard
```

---

## ✅ Files Created/Modified

### New Files
- ✅ `routing/__init__.py` - Blueprint initialization
- ✅ `routing/path_planner_routes.py` - Path planning endpoints
- ✅ `routing/ml_routes.py` - Machine learning endpoints
- ✅ `routing/auth_routes.py` - Authentication endpoints
- ✅ `routing/iot_routes.py` - IoT endpoints
- ✅ `INTEGRATION_GUIDE.md` - Detailed integration documentation

### Modified Files
- ✅ `app.py` - Refactored to use blueprints

### Unchanged Files (Still Available)
- ✅ `path_planner.py` - Boustrophedon algorithm
- ✅ `templates/index.html` - Frontend interface
- ✅ `static/` - CSS/JS assets

---

## 🚀 How to Use

### 1. Start the Application
```bash
cd /Users/abdulrahaman/Downloads/smart-farming-main\ 5
python3 app.py
```

Server runs on: `http://127.0.0.1:5000`

### 2. Test Path Planning
```bash
curl -X POST http://localhost:5000/api/path/plan \
  -H "Content-Type: application/json" \
  -d '{
    "field_boundary": [[40.7128, -74.0060], [40.7129, -74.0061], [40.7130, -74.0062]],
    "implement_width": 1.2
  }'
```

### 3. Access Web Interface
- Home: `http://localhost:5000/`
- Dashboard: `http://localhost:5000/dashboard`

---

## 📊 HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (auth failed) |
| 404 | Not Found |
| 500 | Server Error |

---

## 🎯 Key Features

✅ **From Pro 2:**
- Boustrophedon path planning algorithm
- Field boundary support
- Waypoint export functionality

✅ **Smart Farming Enhancements:**
- Modular blueprint architecture
- Field validation endpoint
- Integrated ML predictions
- IoT sensor integration
- Authentication system
- Better error handling
- Comprehensive API documentation

---

## 📝 Notes

1. **Backward Compatibility:** Old endpoint names will still work through redirects
2. **Extensibility:** Easy to add new blueprints for future features
3. **Testing:** Each blueprint can be tested independently
4. **Documentation:** All endpoints have docstrings explaining parameters
5. **Error Handling:** Consistent error response format across all endpoints

---

**Generated:** February 10, 2026
**Integration Status:** ✅ Complete and Working
**Server Status:** Running on http://127.0.0.1:5000
