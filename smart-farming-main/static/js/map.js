let map;
let tractorMarker;
let fieldPolygon = null;
let fieldVertices = [];
let vertexMarkers = [];
let coveragePath = null;
let waypoints = [];
let currentMode = null;
let isFieldClosed = false;
const TRACTOR_LOCATION = [12.923093, 80.240146];
const MODES = { DRAW: "draw", EDIT: "edit", DELETE: "delete" };
function initMap() {
  map = L.map("map", { center: TRACTOR_LOCATION, zoom: 19, zoomControl: true, attributionControl: true });
  L.tileLayer("https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}", {
    maxZoom: 22,
    subdomains: ["mt0", "mt1", "mt2", "mt3"],
    attribution: "© Google Maps"
  }).addTo(map);
  const tractorIcon = L.divIcon({ className: "tractor-marker", html: '<div style="background: linear-gradient(135deg, #6BB66B 0%, #4a9d4a 100%); width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;"><i class="fas fa-tractor" style="color: white; font-size: 12px;"></i></div>', iconSize: [24, 24], iconAnchor: [12, 12] });
  tractorMarker = L.marker(TRACTOR_LOCATION, { icon: tractorIcon }).addTo(map);
  tractorMarker.bindPopup("<strong>AgriBot Alpha</strong><br>GPS: Active").openPopup();
  map.on("click", handleMapClick);
  map.on("mousemove", handleMapMouseMove);
}
function handleMapClick(e) {
  if (currentMode === MODES.DRAW && !isFieldClosed) addFieldVertex(e.latlng);
}
function handleMapMouseMove(e) {
  const tooltip = document.getElementById("tooltip");
  if (!tooltip) return;
  if (currentMode === MODES.DRAW && !isFieldClosed) {
    tooltip.textContent = fieldVertices.length === 0 ? "Click to add points" : "Click to add points • Click first point to close field";
    tooltip.style.display = "block";
    tooltip.style.left = e.originalEvent.pageX + 15 + "px";
    tooltip.style.top = e.originalEvent.pageY + 15 + "px";
  } else if (currentMode === MODES.EDIT) {
    tooltip.textContent = "Drag vertex to edit";
    tooltip.style.display = "block";
    tooltip.style.left = e.originalEvent.pageX + 15 + "px";
    tooltip.style.top = e.originalEvent.pageY + 15 + "px";
  } else if (currentMode === MODES.DELETE) {
    tooltip.textContent = "Click vertex to delete";
    tooltip.style.display = "block";
    tooltip.style.left = e.originalEvent.pageX + 15 + "px";
    tooltip.style.top = e.originalEvent.pageY + 15 + "px";
  } else {
    tooltip.style.display = "none";
  }
}
function addFieldVertex(latlng) {
  if (fieldVertices.length > 0) {
    const firstVertex = fieldVertices[0];
    const distance = map.distance(latlng, firstVertex);
    if (distance < 10) {
      closeField();
      return;
    }
  }
  fieldVertices.push(latlng);
  const vertexIcon = L.divIcon({ className: "field-vertex", html: '<div style="background: #FFA500; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); cursor: pointer;"></div>', iconSize: [12, 12], iconAnchor: [6, 6] });
  const marker = L.marker(latlng, { icon: vertexIcon, draggable: false }).addTo(map);
  marker.vertexIndex = fieldVertices.length - 1;
  marker.on("click", function (e) {
    L.DomEvent.stopPropagation(e);
    if (currentMode === MODES.DELETE) {
      deleteVertex(marker.vertexIndex);
    } else if (fieldVertices.length > 0 && marker.vertexIndex === 0 && !isFieldClosed) {
      closeField();
    }
  });
  vertexMarkers.push(marker);
  updateFieldPolygon();
}
function updateFieldPolygon() {
  if (fieldPolygon) {
    map.removeLayer(fieldPolygon);
    fieldPolygon = null;
  }
  if (fieldVertices.length > 0) {
    const polylineCoords = isFieldClosed ? [...fieldVertices, fieldVertices[0]] : fieldVertices;
    fieldPolygon = L.polyline(polylineCoords, { color: "#6BB66B", weight: 3, opacity: 0.8 }).addTo(map);
  }
}
function deleteVertex(index) {
  fieldVertices.splice(index, 1);
  const marker = vertexMarkers.splice(index, 1)[0];
  if (marker) map.removeLayer(marker);
  vertexMarkers.forEach((m, i) => (m.vertexIndex = i));
  updateFieldPolygon();
}
function closeField() {
  if (fieldVertices.length >= 3) {
    isFieldClosed = true;
    updateFieldPolygon();
  }
}
function clearField() {
  fieldVertices.forEach(m => null);
  vertexMarkers.forEach(m => map.removeLayer(m));
  vertexMarkers = [];
  fieldVertices = [];
  isFieldClosed = false;
  if (fieldPolygon) {
    map.removeLayer(fieldPolygon);
    fieldPolygon = null;
  }
  if (coveragePath) {
    map.removeLayer(coveragePath);
    coveragePath = null;
  }
  waypoints = [];
}
function toApiBoundary() {
  return fieldVertices.map(v => [v.lat, v.lng]);
}
function generateCoverage() {
  if (!isFieldClosed || fieldVertices.length < 3) {
    console.error("Field not closed or less than 3 points");
    return;
  }
  
  const implementWidth = parseFloat(document.getElementById("implementSelect").value || "1.2");
  const boundary = toApiBoundary();
  
  console.log("Sending to API:", { field_boundary: boundary, implement_width: implementWidth });
  
  fetch("/api/path/plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ field_boundary: boundary, obstacles: [], implement_width: implementWidth })
  })
    .then(r => {
      console.log("Response status:", r.status);
      return r.json();
    })
    .then(d => {
      console.log("API Response:", d);
      
      if (!d.success || !d.waypoints || d.waypoints.length === 0) {
        console.error("No waypoints received:", d);
        return;
      }

      // Backend returns waypoints as objects: { lat, lon }
      waypoints = d.waypoints
        .filter(p => typeof p.lat === "number" && typeof p.lon === "number")
        .map(p => L.latLng(p.lat, p.lon));

      console.log("Processed waypoints:", waypoints.length);

      if (coveragePath) {
        map.removeLayer(coveragePath);
      }

      // Draw boustrophedon coverage path with orange dashed line like the image
      coveragePath = L.polyline(waypoints, {
        color: "#FFA500",
        weight: 3,
        opacity: 0.9,
        dashArray: "10, 5"
      }).addTo(map);

      // Add start marker (green)
      if (waypoints.length > 0) {
        L.circleMarker(waypoints[0], { radius: 6, color: "#4ade80", fill: true, fillColor: "#4ade80", weight: 2 }).addTo(map);
        
        // Add end marker (red)
        L.circleMarker(waypoints[waypoints.length - 1], { radius: 6, color: "#DC3545", fill: true, fillColor: "#DC3545", weight: 2 }).addTo(map);
        
        map.fitBounds(coveragePath.getBounds());
      }
    })
    .catch(err => console.error("Error generating coverage:", err));
}
function exportWaypoints() {
  if (waypoints.length === 0) return;
  const data = waypoints.map(w => ({ lat: w.lat, lon: w.lng }));
  fetch("/api/path/export", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ waypoints: data, format: "json" }) })
    .then(r => r.json())
    .then(d => {
      if (!d.success) return;
      const blob = new Blob([JSON.stringify(d.data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `waypoints_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
}
function setupMapUI() {
  const drawBtn = document.getElementById("drawBtn");
  const editBtn = document.getElementById("editBtn");
  const deleteBtn = document.getElementById("deleteBtn");
  const clearBtn = document.getElementById("clearBtn");
  const generateBtn = document.getElementById("generateBtn");
  const exportBtn = document.getElementById("exportBtn");
  if (drawBtn) drawBtn.addEventListener("click", () => (currentMode = MODES.DRAW));
  if (editBtn) editBtn.addEventListener("click", () => (currentMode = MODES.EDIT));
  if (deleteBtn) deleteBtn.addEventListener("click", () => (currentMode = MODES.DELETE));
  if (clearBtn) clearBtn.addEventListener("click", () => clearField());
  if (generateBtn) generateBtn.addEventListener("click", () => generateCoverage());
  if (exportBtn) exportBtn.addEventListener("click", () => exportWaypoints());
}
function initWhenVisible() {
  const page = document.getElementById("locationPage");
  if (!page) return;
  if (page.classList.contains("active")) {
    if (!map) {
      initMap();
      setupMapUI();
    }
  }
}
document.addEventListener("DOMContentLoaded", () => {
  initWhenVisible();
  const observer = new MutationObserver(() => initWhenVisible());
  observer.observe(document.body, { attributes: true, subtree: true, attributeFilter: ["class"] });
});
