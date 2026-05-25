# 🚀 Quick Start Guide - Path Planner Integration

## ⚡ 5-Minute Setup

### 1. Start the Server
```bash
cd /Users/abdulrahaman/Downloads/smart-farming-main\ 5
python3 app.py
```

✅ Server running on `http://127.0.0.1:5000`

---

## 📍 Test Path Planning (Choose One)

### Option A: Using cURL (Terminal)
```bash
curl -X POST http://localhost:5000/api/path/plan \
  -H "Content-Type: application/json" \
  -d '{
    "field_boundary": [
      [40.7128, -74.0060],
      [40.7129, -74.0061],
      [40.7130, -74.0062]
    ],
    "implement_width": 1.2
  }'
```

### Option B: Using Python
```python
import requests
import json

url = "http://localhost:5000/api/path/plan"
data = {
    "field_boundary": [
        [40.7128, -74.0060],
        [40.7129, -74.0061],
        [40.7130, -74.0062]
    ],
    "implement_width": 1.2
}

response = requests.post(url, json=data)
print(json.dumps(response.json(), indent=2))
```

### Option C: Using JavaScript
```javascript
fetch('/api/path/plan', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    field_boundary: [
      [40.7128, -74.0060],
      [40.7129, -74.0061],
      [40.7130, -74.0062]
    ],
    implement_width: 1.2
  })
})
.then(r => r.json())
.then(data => console.log(data))
```

---

## 📋 Common Endpoints

| Method | URL | Purpose |
|--------|-----|---------|
| POST | `/api/path/plan` | Generate path |
| POST | `/api/path/validate` | Validate field |
| POST | `/api/path/export` | Export waypoints |
| GET | `/api/ml/crop-predict` | Predict crop |
| GET | `/api/ml/irrigation-predict` | Irrigation needs |
| POST | `/api/ml/disease-detect` | Detect disease |
| POST | `/api/auth/signup` | Register user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/iot/sensor-data` | Send sensor data |

---

## 🎯 Expected Response

```json
{
  "success": true,
  "waypoints": [
    {
      "lat": 40.71280000000000,
      "lon": -74.00600000000000
    },
    {
      "lat": 40.71290000000000,
      "lon": -74.00610000000000
    },
    ...
  ],
  "path_length": 45,
  "implement_width": 1.2
}
```

---

## 🔍 Validate Field

```bash
curl -X POST http://localhost:5000/api/path/validate \
  -H "Content-Type: application/json" \
  -d '{
    "field_boundary": [
      [40.7128, -74.0060],
      [40.7129, -74.0061],
      [40.7130, -74.0062]
    ]
  }'
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

## 📁 Project Structure

```
smart-farming-main 5/
├── app.py                      ← Main app
├── path_planner.py             ← Algorithm
├── routing/                    ← Routes
│   ├── path_planner_routes.py ← Path planning
│   ├── ml_routes.py
│   ├── auth_routes.py
│   └── iot_routes.py
└── templates/index.html        ← Web UI
```

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `INTEGRATION_GUIDE.md` | Complete API guide |
| `API_ROUTING.md` | Endpoint reference |
| `ARCHITECTURE_GUIDE.md` | System design |
| `FRONTEND_EXAMPLES.md` | JavaScript examples |
| `COMPLETION_SUMMARY.md` | Project summary |

---

## 🔧 Configuration

### Implement Width (meters)
- Default: `1.2`
- Adjustable per request
- Affects row spacing

### Field Boundary
- Minimum: 3 points
- Format: `[[lat, lon], [lat, lon], ...]`
- Required for planning

### Obstacles (Optional)
- Additional field boundaries
- Default: `[]` (empty)
- Format: same as field boundary

---

## 💡 Example Field Boundary

**Rectangle Field (4 points):**
```json
[
  [40.7128, -74.0060],    ← Top-left
  [40.7128, -74.0050],    ← Top-right
  [40.7118, -74.0050],    ← Bottom-right
  [40.7118, -74.0060]     ← Bottom-left
]
```

**Triangle Field (3 points):**
```json
[
  [40.7128, -74.0060],    ← Point 1
  [40.7138, -74.0060],    ← Point 2
  [40.7128, -74.0040]     ← Point 3
]
```

---

## 🚨 Error Handling

### Minimum 3 Points
```json
{
  "success": false,
  "error": "Field boundary must have at least 3 points"
}
```

### Invalid Input
```json
{
  "success": false,
  "error": "Invalid input: ..."
}
```

### Server Error
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## 📊 HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success ✅ |
| 400 | Bad request (check input) ⚠️ |
| 404 | Not found ❌ |
| 500 | Server error ❌ |

---

## 🌐 Access Web UI

Visit: `http://localhost:5000/`

Features:
- 🗺️ Interactive map (Leaflet)
- 📍 Draw field boundary
- 🚜 Generate path
- 📥 Export waypoints
- 🔐 User authentication

---

## 🎓 Learning Path

1. **Start:** Run the server
2. **Test:** Try path planning endpoint
3. **Understand:** Read `INTEGRATION_GUIDE.md`
4. **Integrate:** Add to your frontend
5. **Deploy:** Use WSGI server

---

## 🛠️ Troubleshooting

**Server won't start?**
```bash
# Check Python version
python3 --version

# Check dependencies
pip3 list | grep Flask

# Run with verbose output
python3 -u app.py
```

**API returns error?**
- Check field boundary has ≥3 points
- Verify lat/lon are in valid range
- Check JSON format is correct
- Look at server logs for details

**Port 5000 already in use?**
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or use different port in app.py
app.run(port=5001)
```

---

## 📞 API Reference (Quick)

### Plan Path
```
POST /api/path/plan
Content-Type: application/json

{
  "field_boundary": [[lat, lon], ...],
  "obstacles": [],
  "implement_width": 1.2
}
```

### Validate Field
```
POST /api/path/validate
Content-Type: application/json

{
  "field_boundary": [[lat, lon], ...]
}
```

### Export Waypoints
```
POST /api/path/export
Content-Type: application/json

{
  "waypoints": [{lat, lon}, ...],
  "format": "json"
}
```

---

## ⚡ Pro Tips

1. **Always validate** field boundary before planning
2. **Use reasonable** implement widths (0.8 - 2.0 meters)
3. **Round coordinates** to 4 decimal places for accuracy
4. **Cache results** to avoid repeated API calls
5. **Monitor** server logs for debugging

---

## 🎯 Next Steps

- [ ] Test path planning with sample field
- [ ] Integrate with your frontend map
- [ ] Add field drawing interface
- [ ] Implement waypoint export
- [ ] Connect to drone/robot controller
- [ ] Deploy to production

---

## 📞 Support

**Check these files for help:**
1. `INTEGRATION_GUIDE.md` - Detailed documentation
2. `FRONTEND_EXAMPLES.md` - Code examples
3. `ARCHITECTURE_GUIDE.md` - System design
4. `API_ROUTING.md` - Complete API reference

**Server logs:**
```
Check terminal where app.py is running
for error messages and debug info
```

---

**Status:** ✅ Ready to use
**Server:** http://127.0.0.1:5000
**Last Updated:** February 10, 2026
