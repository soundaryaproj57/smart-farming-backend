"""
Frontend Integration Examples - JavaScript/HTML for Path Planner
Shows how to integrate the path planning API with your web interface
"""

# ============================================================================
# EXAMPLE 1: Basic Path Planning with Leaflet Map
# ============================================================================

HTML_EXAMPLE = """
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet-draw@1.0.4/dist/leaflet.draw.css" />
    <style>
        #map { height: 600px; }
        .controls { padding: 10px; background: white; }
        button { padding: 10px 20px; margin: 5px; cursor: pointer; }
    </style>
</head>
<body>
    <div class="controls">
        <button onclick="planPath()">Plan Coverage Path</button>
        <button onclick="exportPath()">Export Waypoints</button>
        <button onclick="clearPath()">Clear Path</button>
        <input type="number" id="implementWidth" placeholder="Implement Width (m)" value="1.2">
    </div>
    <div id="map"></div>
    
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script src="https://unpkg.com/leaflet-draw@1.0.4/dist/leaflet.draw.js"></script>
    
    <script>
        // Initialize map
        const map = L.map('map').setView([40.7128, -74.0060], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
        
        // Initialize drawing tools
        const drawnItems = new L.FeatureGroup();
        map.addLayer(drawnItems);
        
        new L.Control.Draw({
            edit: { featureGroup: drawnItems },
            draw: { polygon: true, marker: false, polyline: false }
        }).addTo(map);
        
        // Store generated path
        let generatedPath = null;
        
        // Function to plan path
        async function planPath() {
            const layers = drawnItems.getLayers();
            if (layers.length === 0) {
                alert('Draw field boundary first');
                return;
            }
            
            // Extract coordinates from polygon
            const polygon = layers[0];
            const latlngs = polygon.getLatLngs()[0];
            const field_boundary = latlngs.map(ll => [ll.lat, ll.lng]);
            
            const implement_width = parseFloat(
                document.getElementById('implementWidth').value
            ) || 1.2;
            
            try {
                const response = await fetch('/api/path/plan', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        field_boundary: field_boundary,
                        obstacles: [],
                        implement_width: implement_width
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    generatedPath = data.waypoints;
                    displayPath(data.waypoints);
                    alert(`Generated path with ${data.path_length} waypoints`);
                } else {
                    alert('Error: ' + data.error);
                }
            } catch (error) {
                alert('Error: ' + error.message);
            }
        }
        
        // Display path on map
        function displayPath(waypoints) {
            // Clear previous path
            drawnItems.getLayers().forEach(layer => {
                if (layer instanceof L.Polyline && !(layer instanceof L.Polygon)) {
                    map.removeLayer(layer);
                }
            });
            
            // Convert waypoints back to LatLng
            const latlngs = waypoints.map(wp => [wp.lat, wp.lon]);
            
            // Draw path
            L.polyline(latlngs, {
                color: 'green',
                weight: 2,
                opacity: 0.7,
                dashArray: '5, 5'
            }).addTo(map);
            
            // Add markers at waypoints
            waypoints.forEach((wp, idx) => {
                L.marker([wp.lat, wp.lon], {
                    icon: L.icon({
                        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
                        iconSize: [25, 41],
                        title: `Waypoint ${idx + 1}`
                    })
                }).bindPopup(`Waypoint ${idx + 1}`).addTo(map);
            });
            
            // Fit map to path
            const group = new L.featureGroup(
                latlngs.map(ll => L.marker(ll))
            );
            map.fitBounds(group.getBounds());
        }
        
        // Export path
        async function exportPath() {
            if (!generatedPath) {
                alert('Generate path first');
                return;
            }
            
            try {
                const response = await fetch('/api/path/export', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        waypoints: generatedPath,
                        format: 'json'
                    })
                });
                
                const data = await response.json();
                
                // Download as JSON file
                const element = document.createElement('a');
                element.setAttribute('href', 'data:text/json;charset=utf-8,' + 
                    encodeURIComponent(JSON.stringify(data.data, null, 2)));
                element.setAttribute('download', 'waypoints.json');
                element.style.display = 'none';
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
                
                alert('Exported ' + data.count + ' waypoints');
            } catch (error) {
                alert('Error: ' + error.message);
            }
        }
        
        // Clear path
        function clearPath() {
            drawnItems.clearLayers();
            generatedPath = null;
            // Reload map
            location.reload();
        }
    </script>
</body>
</html>
"""

# ============================================================================
# EXAMPLE 2: Path Planning with Validation
# ============================================================================

VALIDATION_EXAMPLE = """
async function validateAndPlan() {
    // Get field boundary from form
    const fieldBoundary = [
        [40.7128, -74.0060],
        [40.7129, -74.0061],
        [40.7130, -74.0062],
        [40.7131, -74.0061]
    ];
    
    // Step 1: Validate field
    const validResponse = await fetch('/api/path/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field_boundary: fieldBoundary })
    });
    
    const validation = await validResponse.json();
    
    if (!validation.valid) {
        console.error('Invalid field:', validation.error);
        return;
    }
    
    console.log('Field Info:');
    console.log(`- Area: ${validation.area} m²`);
    console.log(`- Perimeter: ${validation.perimeter} m`);
    console.log(`- Points: ${validation.points}`);
    
    // Step 2: Plan path
    const planResponse = await fetch('/api/path/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            field_boundary: fieldBoundary,
            implement_width: 1.2
        })
    });
    
    const plan = await planResponse.json();
    
    if (plan.success) {
        console.log('Generated path with', plan.path_length, 'waypoints');
        return plan.waypoints;
    }
}
"""

# ============================================================================
# EXAMPLE 3: Real-time Updates with WebSocket
# ============================================================================

WEBSOCKET_EXAMPLE = """
class PathPlannerManager {
    constructor(mapElement) {
        this.map = L.map(mapElement);
        this.waypoints = [];
    }
    
    async planPath(fieldBoundary, implementWidth = 1.2) {
        try {
            const response = await fetch('/api/path/plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    field_boundary: fieldBoundary,
                    implement_width: implementWidth
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                this.waypoints = data.waypoints;
                this.displayWaypoints();
                return data;
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('Path planning error:', error);
            throw error;
        }
    }
    
    displayWaypoints() {
        const points = this.waypoints.map(wp => [wp.lat, wp.lon]);
        L.polyline(points, {
            color: 'green',
            weight: 3
        }).addTo(this.map);
    }
    
    async exportWaypoints() {
        const response = await fetch('/api/path/export', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                waypoints: this.waypoints,
                format: 'json'
            })
        });
        return response.json();
    }
}

// Usage
const planner = new PathPlannerManager('map');
const field = [[40.7128, -74.0060], [40.7129, -74.0061], [40.7130, -74.0062]];
planner.planPath(field, 1.5).then(result => {
    console.log('Path generated successfully');
});
"""

# ============================================================================
# EXAMPLE 4: Error Handling
# ============================================================================

ERROR_HANDLING_EXAMPLE = """
async function safePlanPath(fieldBoundary) {
    // Validate input
    if (!Array.isArray(fieldBoundary) || fieldBoundary.length < 3) {
        console.error('Invalid field boundary');
        return null;
    }
    
    try {
        const response = await fetch('/api/path/plan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                field_boundary: fieldBoundary
            })
        });
        
        // Handle HTTP errors
        if (!response.ok) {
            if (response.status === 400) {
                const error = await response.json();
                console.error('Bad request:', error.error);
            } else if (response.status === 500) {
                console.error('Server error');
            }
            return null;
        }
        
        const data = await response.json();
        
        // Handle API errors
        if (!data.success) {
            console.error('Path planning failed:', data.error);
            return null;
        }
        
        return data.waypoints;
        
    } catch (error) {
        // Handle network errors
        console.error('Network error:', error);
        return null;
    }
}
"""

# ============================================================================
# EXAMPLE 5: Integration with Drone Mission Planning
# ============================================================================

DRONE_MISSION_EXAMPLE = """
class DroneMissionPlanner {
    constructor(droneId) {
        this.droneId = droneId;
        this.mission = null;
    }
    
    async createMission(fieldBoundary, altitude = 50, speed = 10) {
        try {
            // Get optimal path
            const pathResponse = await fetch('/api/path/plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    field_boundary: fieldBoundary
                })
            });
            
            const pathData = await pathResponse.json();
            
            if (!pathData.success) {
                throw new Error(pathData.error);
            }
            
            // Create mission waypoints
            this.mission = {
                droneId: this.droneId,
                waypoints: pathData.waypoints.map((wp, idx) => ({
                    index: idx,
                    lat: wp.lat,
                    lon: wp.lon,
                    alt: altitude,
                    speed: speed,
                    action: 'WAYPOINT'
                })),
                totalDistance: this.calculateDistance(pathData.waypoints),
                estimatedTime: this.estimateFlightTime(
                    pathData.waypoints.length, 
                    speed
                )
            };
            
            return this.mission;
        } catch (error) {
            console.error('Failed to create mission:', error);
            throw error;
        }
    }
    
    calculateDistance(waypoints) {
        let total = 0;
        for (let i = 0; i < waypoints.length - 1; i++) {
            const p1 = waypoints[i];
            const p2 = waypoints[i + 1];
            const lat1 = p1.lat * Math.PI / 180;
            const lat2 = p2.lat * Math.PI / 180;
            const dLat = lat2 - lat1;
            const dLon = (p2.lon - p1.lon) * Math.PI / 180;
            
            const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                      Math.cos(lat1) * Math.cos(lat2) *
                      Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            total += 6371000 * c; // Earth radius in meters
        }
        return total;
    }
    
    estimateFlightTime(numWaypoints, speedMps) {
        const estimatedDistance = numWaypoints * 100; // rough estimate
        return estimatedDistance / speedMps;
    }
    
    async exportMission(format = 'json') {
        if (!this.mission) {
            throw new Error('No mission created');
        }
        
        const response = await fetch('/api/path/export', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                waypoints: this.mission.waypoints,
                format: format
            })
        });
        
        return response.json();
    }
}

// Usage
const planner = new DroneMissionPlanner('drone_001');
const field = [[40.7128, -74.0060], [40.7129, -74.0061], [40.7130, -74.0062]];
planner.createMission(field, altitude: 100, speed: 15)
    .then(mission => console.log('Mission created:', mission))
    .catch(error => console.error('Error:', error));
"""

print("""
╔════════════════════════════════════════════════════════════════╗
║                FRONTEND INTEGRATION EXAMPLES                  ║
║              Path Planner API for Smart Farming                ║
╚════════════════════════════════════════════════════════════════╝

Example 1: Basic Path Planning with Leaflet Map
- Interactive field drawing
- Real-time path visualization
- Waypoint export to JSON

Example 2: Path Planning with Validation
- Validate field before planning
- Get field metrics (area, perimeter)
- Two-step process for reliability

Example 3: Real-time Updates with WebSocket
- Object-oriented path planner
- Auto-display waypoints
- Export functionality

Example 4: Error Handling
- Input validation
- HTTP error handling
- Network error handling
- User-friendly messages

Example 5: Drone Mission Planning
- Convert paths to drone missions
- Altitude and speed configuration
- Flight time estimation
- Mission export

Usage:
-----
1. Save examples to your HTML/JS files
2. Include Leaflet library for mapping
3. Call API endpoints as shown
4. Handle responses and errors properly

API Endpoints:
--------------
POST   /api/path/plan       - Generate coverage path
POST   /api/path/validate   - Validate field boundary
POST   /api/path/export     - Export waypoints
""")
