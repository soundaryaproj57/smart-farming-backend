// Enhanced Location Page with Map Integration and Path Planning
    initLocationPage() {
        this.setupMapControls();
        this.initializeMap();
        this.setupPathPlanning();
    }
    
    initializeMap() {
        // Initialize Leaflet map
        if (typeof L === 'undefined') {
            console.error('Leaflet library not loaded');
            return;
        }
        
        // Initialize map centered on Bangalore
        this.map = L.map('map').setView([12.9716, 77.5946], 13);
        
        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);
        
        // Initialize drawing controls
        this.initializeDrawingControls();
        
        // Initialize path planning
        this.pathPlanningData = {
            fieldBoundary: [],
            obstacles: [],
            waypoints: [],
            implementWidth: 1.2
        };
        
        console.log('✅ Map initialized successfully');
    }
    
    initializeDrawingControls() {
        this.drawnItems = new L.FeatureGroup();
        this.map.addLayer(this.drawnItems);
        
        // Drawing controls configuration
        this.drawControl = new L.Control.Draw({
            draw: {
                polygon: {
                    allowIntersection: false,
                    showArea: true,
                    metric: true,
                    shapeOptions: {
                        color: '#6BB66B',
                        weight: 3,
                        opacity: 0.8
                    }
                },
                polyline: false,
                rectangle: false,
                circle: false,
                marker: false,
                circlemarker: false
            },
            edit: {
                featureGroup: this.drawnItems,
                edit: true,
                remove: true
            }
        });
        
        this.map.addControl(this.drawControl);
        
        // Drawing events
        this.map.on(L.Draw.Event.CREATED, (e) => {
            const layer = e.layer;
            this.drawnItems.addLayer(layer);
            this.updateFieldBoundary();
        });
        
        this.map.on(L.Draw.Event.EDITED, (e) => {
            this.updateFieldBoundary();
        });
        
        this.map.on(L.Draw.Event.DELETED, (e) => {
            this.updateFieldBoundary();
        });
    }
    
    updateFieldBoundary() {
        const layers = this.drawnItems.getLayers();
        if (layers.length > 0) {
            const layer = layers[0];
            if (layer instanceof L.Polygon) {
                const latlngs = layer.getLatLngs()[0];
                this.pathPlanningData.fieldBoundary = latlngs.map(latlng => [latlng.lat, latlng.lng]);
                console.log('✅ Field boundary updated:', this.pathPlanningData.fieldBoundary);
            }
        } else {
            this.pathPlanningData.fieldBoundary = [];
        }
    }
    
    setupMapControls() {
        // Implement width selector
        const implementSelect = document.getElementById('implementSelect');
        if (implementSelect) {
            implementSelect.addEventListener('change', (e) => {
                this.pathPlanningData.implementWidth = parseFloat(e.target.value);
                console.log('✅ Implement width changed:', this.pathPlanningData.implementWidth);
            });
        }
        
        // Draw field button
        const drawBtn = document.getElementById('drawBtn');
        if (drawBtn) {
            drawBtn.addEventListener('click', () => {
                this.enableDrawing();
            });
        }
        
        // Edit button
        const editBtn = document.getElementById('editBtn');
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                this.enableEditing();
            });
        }
        
        // Delete button
        const deleteBtn = document.getElementById('deleteBtn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                this.deleteDrawing();
            });
        }
        
        // Clear field button
        const clearBtn = document.getElementById('clearBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearField();
            });
        }
        
        // Generate coverage button
        const generateBtn = document.getElementById('generateBtn');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => {
                this.generateCoveragePath();
            });
        }
        
        // Export button
        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportWaypoints();
            });
        }
    }
    
    setupPathPlanning() {
        // Initialize path planning markers
        this.waypointMarkers = L.layerGroup().addTo(this.map);
        this.coveragePathLayer = L.layerGroup().addTo(this.map);
    }
    
    enableDrawing() {
        if (this.drawControl) {
            this.drawControl.setDrawingOptions({
                polygon: { showArea: true }
            });
        }
        this.showNotification('Click on map to start drawing field boundary', 'info');
    }
    
    enableEditing() {
        if (this.drawnItems.getLayers().length > 0) {
            const editHandler = new L.EditToolbar.Edit(this.map, {
                featureGroup: this.drawnItems
            });
            editHandler.enable();
            this.showNotification('Drag vertices to edit field boundary', 'info');
        } else {
            this.showNotification('No field boundary to edit', 'warning');
        }
    }
    
    deleteDrawing() {
        if (this.drawnItems.getLayers().length > 0) {
            this.drawnItems.clearLayers();
            this.pathPlanningData.fieldBoundary = [];
            this.clearWaypoints();
            this.showNotification('Field boundary deleted', 'success');
        } else {
            this.showNotification('No field boundary to delete', 'warning');
        }
    }
    
    clearField() {
        this.drawnItems.clearLayers();
        this.pathPlanningData.fieldBoundary = [];
        this.clearWaypoints();
        this.showNotification('Field cleared successfully', 'success');
    }
    
    clearWaypoints() {
        this.waypointMarkers.clearLayers();
        this.coveragePathLayer.clearLayers();
        this.pathPlanningData.waypoints = [];
    }
    
    async generateCoveragePath() {
        if (this.pathPlanningData.fieldBoundary.length < 3) {
            this.showNotification('Please draw a field boundary first', 'warning');
            return;
        }
        
        try {
            this.showNotification('Generating coverage path...', 'info');
            
            const response = await fetch('/api/path/plan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    field_boundary: this.pathPlanningData.fieldBoundary,
                    obstacles: this.pathPlanningData.obstacles,
                    implement_width: this.pathPlanningData.implementWidth
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.pathPlanningData.waypoints = result.waypoints;
                this.displayWaypoints();
                this.showNotification(`Generated ${result.path_length} waypoints successfully`, 'success');
            } else {
                this.showNotification(`Path generation failed: ${result.error}`, 'error');
            }
        } catch (error) {
            console.error('Path generation error:', error);
            this.showNotification('Failed to generate coverage path', 'error');
        }
    }
    
    displayWaypoints() {
        this.clearWaypoints();
        
        if (this.pathPlanningData.waypoints.length === 0) {
            return;
        }
        
        // Display waypoints as markers
        this.pathPlanningData.waypoints.forEach((waypoint, index) => {
            const marker = L.circleMarker([waypoint.lat, waypoint.lon], {
                radius: 4,
                fillColor: '#FF6B6B',
                color: '#FFFFFF',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.8
            }).addTo(this.waypointMarkers);
            
            marker.bindPopup(`Waypoint ${index + 1}`);
        });
        
        // Display coverage path
        const pathCoordinates = this.pathPlanningData.waypoints.map(wp => [wp.lat, wp.lon]);
        const pathPolyline = L.polyline(pathCoordinates, {
            color: '#4FC3F7',
            weight: 3,
            opacity: 0.8,
            dashArray: '10, 10'
        }).addTo(this.coveragePathLayer);
        
        // Fit map to show entire path
        this.map.fitBounds(pathPolyline.getBounds());
        
        console.log('✅ Waypoints displayed successfully');
    }
    
    async exportWaypoints() {
        if (this.pathPlanningData.waypoints.length === 0) {
            this.showNotification('No waypoints to export', 'warning');
            return;
        }
        
        try {
            const response = await fetch('/api/path/export', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    waypoints: this.pathPlanningData.waypoints,
                    format: 'json'
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Create downloadable file
                const dataStr = JSON.stringify(result.data, null, 2);
                const dataBlob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(dataBlob);
                
                const link = document.createElement('a');
                link.href = url;
                link.download = 'field_waypoints.json';
                link.click();
                
                URL.revokeObjectURL(url);
                this.showNotification('Waypoints exported successfully', 'success');
            } else {
                this.showNotification(`Export failed: ${result.error}`, 'error');
            }
        } catch (error) {
            console.error('Export error:', error);
            this.showNotification('Failed to export waypoints', 'error');
        }
    }