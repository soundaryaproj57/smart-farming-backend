# 🌐 Smart Farming System - Routing Architecture Overview

## Project Structure Tree

```
smart-farming-main 5/
│
├── 📄 app.py                           ← Main Flask app (entry point)
├── 📄 path_planner.py                  ← Boustrophedon algorithm
├── 📄 firebase_config.py               ← Firebase configuration
├── 📄 main.py
│
├── 📁 routing/                         ← NEW: Modular routes
│   ├── 📄 __init__.py                 ← Blueprint initialization
│   ├── 📄 path_planner_routes.py      ← /api/path/* (from Pro 2)
│   ├── 📄 ml_routes.py                ← /api/ml/* (ML endpoints)
│   ├── 📄 auth_routes.py              ← /api/auth/* (Auth)
│   └── 📄 iot_routes.py               ← /api/iot/* (IoT)
│
├── 📁 database/
│   ├── 📄 db.py
│   └── 📄 model.py
│
├── 📁 ml/
│   ├── 📁 crop/predict/
│   ├── 📁 disease/predict/
│   ├── 📁 irrigation/predict/
│   └── 📄 (other ML files)
│
├── 📁 iot/
│   └── 📄 sensor_api.py
│
├── 📁 templates/
│   ├── 📄 index.html
│   └── 📄 (other templates)
│
├── 📁 static/
│   ├── 📁 css/
│   ├── 📁 js/
│   └── (static assets)
│
├── 📁 uploads/                         ← Image uploads
│
├── 📄 INTEGRATION_GUIDE.md             ← Detailed guide
├── 📄 API_ROUTING.md                   ← API reference
├── 📄 FRONTEND_EXAMPLES.md             ← JS examples
└── 📄 COMPLETION_SUMMARY.md            ← This summary
```

---

## 🔄 Request Flow Diagram

```
CLIENT (Frontend/Mobile)
    │
    │ HTTP Request
    ▼
app.py (Flask Entry Point)
    │
    ├─ /                           → templates/index.html
    ├─ /dashboard                  → templates/dashboard.html
    │
    └─ Blueprint Routes
        │
        ├─ path_planner_bp (from routing/)
        │   ├─ POST /api/path/plan       → path_planner_routes.py
        │   ├─ POST /api/path/validate   → path_planner_routes.py
        │   └─ POST /api/path/export     → path_planner_routes.py
        │
        ├─ ml_bp (from routing/)
        │   ├─ GET /api/ml/crop-predict       → ml_routes.py
        │   ├─ GET /api/ml/irrigation-predict → ml_routes.py
        │   └─ POST /api/ml/disease-detect    → ml_routes.py
        │
        ├─ auth_bp (from routing/)
        │   ├─ POST /api/auth/signup  → auth_routes.py
        │   └─ POST /api/auth/login   → auth_routes.py
        │
        └─ iot_bp (from routing/)
            ├─ POST /api/iot/sensor-data  → iot_routes.py
            └─ GET /api/iot/health        → iot_routes.py
    │
    │ JSON Response
    ▼
CLIENT (Updated with data)
```

---

## 📍 Path Planning Module Integration

```
┌─────────────────────────────────────────────────────┐
│  Pro 2 Path Planner (path_planner.py)              │
│  - BoustrophedonPlanner class                      │
│  - Field boundary support                          │
│  - Waypoint generation                             │
│  - Obstacle handling                               │
└────────────────┬────────────────────────────────────┘
                 │
                 │ (Imported by)
                 ▼
┌─────────────────────────────────────────────────────┐
│  Path Planner Routes (routing/path_planner_routes.py)│
│                                                     │
│  @path_planner_bp.route('/plan', methods=['POST'])│
│  │ Validates field boundary                        │
│  │ Creates BoustrophedonPlanner instance           │
│  │ Generates coverage path                         │
│  │ Returns waypoints as JSON                       │
│  │                                                 │
│  @path_planner_bp.route('/validate', methods=['POST'])
│  │ Validates field boundary                        │
│  │ Calculates area and perimeter                   │
│  │                                                 │
│  @path_planner_bp.route('/export', methods=['POST'])
│  │ Exports waypoints in specified format           │
│  │ Supports JSON/CSV/KML                           │
└────────────────┬────────────────────────────────────┘
                 │
                 │ (Registered in)
                 ▼
┌─────────────────────────────────────────────────────┐
│  Main App (app.py)                                 │
│                                                     │
│  app.register_blueprint(path_planner_bp)          │
│  - Makes all routes accessible at /api/path/*     │
└──────────────────────────────────────────────────────┘
```

---

## 🎯 API Endpoint Organization

```
Smart Farming API (http://localhost:5000)
│
├─ Page Routes (Direct HTML)
│  ├─ GET  /                    → Homepage
│  └─ GET  /dashboard           → Dashboard
│
└─ JSON API Routes
    │
    ├─ /api/path (Path Planning) ◄────── FROM PRO 2
    │  ├─ POST /plan            → Generate path
    │  ├─ POST /validate        → Validate field (NEW)
    │  └─ POST /export          → Export waypoints
    │
    ├─ /api/ml (Machine Learning)
    │  ├─ GET  /crop-predict       → Crop recommendation
    │  ├─ GET  /irrigation-predict → Water needs
    │  └─ POST /disease-detect     → Disease analysis
    │
    ├─ /api/auth (Authentication)
    │  ├─ POST /signup  → Register
    │  └─ POST /login   → Login
    │
    └─ /api/iot (IoT Sensors)
       ├─ POST /sensor-data  → Receive sensor data
       └─ GET  /health       → System status
```

---

## 📊 Component Interaction

```
┌──────────────────────────────────────────────┐
│           Frontend/Mobile App                │
│  (HTML/JavaScript with Leaflet Map)         │
└─────────┬──────────────────────────────────┬─┘
          │                                   │
          │ 1. Draw field on map             │
          │ 2. Select implement width        │
          │ 3. Click "Generate Path"         │
          │                                   │
          ▼                                   ▼
    ┌─────────────────────────────────────────────────┐
    │  Browser sends POST request to               │
    │  /api/path/plan with field data             │
    └──────────────┬────────────────────────────────┘
                   │
                   ▼
    ┌─────────────────────────────────────────────────┐
    │  Flask App (app.py)                          │
    │  - Receives request                          │
    │  - Routes to path_planner_bp                 │
    └──────────────┬────────────────────────────────┘
                   │
                   ▼
    ┌─────────────────────────────────────────────────┐
    │  path_planner_routes.py                      │
    │  - Validates input                           │
    │  - Creates BoustrophedonPlanner              │
    │  - Calls generate_coverage_path()            │
    └──────────────┬────────────────────────────────┘
                   │
                   ▼
    ┌─────────────────────────────────────────────────┐
    │  path_planner.py                             │
    │  - Generates optimal path                    │
    │  - Returns waypoints                         │
    └──────────────┬────────────────────────────────┘
                   │
                   ▼
    ┌─────────────────────────────────────────────────┐
    │  JSON Response back to Browser                │
    │  {                                            │
    │    "success": true,                          │
    │    "waypoints": [...],                       │
    │    "path_length": 45                         │
    │  }                                            │
    └──────────────┬────────────────────────────────┘
                   │
                   ▼
    ┌─────────────────────────────────────────────────┐
    │  Frontend displays waypoints on map          │
    │  - Green polyline showing path               │
    │  - Numbered markers at waypoints             │
    │  - Export option to save as file             │
    └─────────────────────────────────────────────────┘
```

---

## 🔧 Technical Stack

```
┌─────────────────────────────────────────┐
│  Frontend Layer                         │
├─────────────────────────────────────────┤
│ - HTML5                                 │
│ - JavaScript (ES6+)                     │
│ - Leaflet.js (mapping)                  │
│ - Leaflet Draw (field drawing)          │
│ - CSS3                                  │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│  API Layer                              │
├─────────────────────────────────────────┤
│ - Flask (web framework)                 │
│ - Flask Blueprints (route organization) │
│ - JSON (data format)                    │
│ - HTTP (REST protocol)                  │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│  Application Layer                      │
├─────────────────────────────────────────┤
│ - Path Planning (Boustrophedon)         │
│ - ML Models (crop, disease, irrigation) │
│ - Authentication                        │
│ - IoT Integration                       │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│  Data Layer                             │
├─────────────────────────────────────────┤
│ - Firebase (real-time data)             │
│ - SQLite (user data)                    │
│ - File system (uploads)                 │
└─────────────────────────────────────────┘
```

---

## 📈 Data Flow: Path Planning

```
User Input:
  Field Boundary: [[lat1,lon1], [lat2,lon2], ...]
  Implement Width: 1.2 meters
          │
          ▼
Validation:
  ✓ At least 3 points
  ✓ Valid lat/lon coordinates
  ✓ Implement width > 0
          │
          ▼
Processing (BoustrophedonPlanner):
  1. Find optimal rotation angle
  2. Rotate field polygon
  3. Generate parallel rows
  4. Create smooth turns
  5. Calculate waypoints
          │
          ▼
Output:
  [
    {"lat": 40.7128, "lon": -74.0060},
    {"lat": 40.7129, "lon": -74.0061},
    ...
  ]
          │
          ▼
Frontend Display:
  - Polyline on map
  - Numbered waypoints
  - Export option
```

---

## 🚀 Deployment Architecture

```
┌────────────────────────────────────────┐
│  Development (Current)                │
├────────────────────────────────────────┤
│ python3 app.py                         │
│ - Debug mode: ON                       │
│ - Auto-reload: ON                      │
│ - http://127.0.0.1:5000               │
└────────────────────────────────────────┘
                  │
                  │ (Deploy)
                  ▼
┌────────────────────────────────────────┐
│  Production                            │
├────────────────────────────────────────┤
│ gunicorn app:app                       │
│ - WSGI Server                          │
│ - Multiple workers                     │
│ - SSL/TLS enabled                      │
│ - Load balancer (nginx)                │
│ - Monitored & logged                   │
└────────────────────────────────────────┘
```

---

## 📝 Blueprint Registration

```python
# In app.py

from routing import (
    path_planner_bp,  # ◄─── Path planner from Pro 2
    ml_bp,
    auth_bp,
    iot_bp
)

app = Flask(__name__)

# Register all blueprints
app.register_blueprint(path_planner_bp)  # /api/path/*
app.register_blueprint(ml_bp)            # /api/ml/*
app.register_blueprint(auth_bp)          # /api/auth/*
app.register_blueprint(iot_bp)           # /api/iot/*

# Results in URLs:
# POST   /api/path/plan
# POST   /api/path/validate
# POST   /api/path/export
# GET    /api/ml/crop-predict
# ... etc
```

---

## 🎓 How to Extend

### Adding a New Blueprint

```python
# Create: routing/my_feature_routes.py

from flask import Blueprint, jsonify, request

my_feature_bp = Blueprint('my_feature', __name__, url_prefix='/api/feature')

@my_feature_bp.route('/action', methods=['POST'])
def my_action():
    return jsonify({'status': 'success'})

# Add to routing/__init__.py
from .my_feature_routes import my_feature_bp

# Register in app.py
app.register_blueprint(my_feature_bp)

# Results in URL:
# POST /api/feature/action
```

---

## ✨ Summary

```
From Pro 2:  ✅ Path Planner Module
           ✅ Boustrophedon Algorithm
           ✅ Waypoint Generation
                   │
                   ├─ Encapsulated in
                   │
Smart Farming:   ✅ Modular Architecture
                ✅ Blueprint System
                ✅ Professional Routing
                ✅ Complete Documentation
                ✅ Production Ready
                ✅ Easy to Extend
                ✅ Scalable Design
```

---

**Status:** ✅ COMPLETE
**Server:** Running on http://127.0.0.1:5000
**Architecture:** Professional & Scalable
