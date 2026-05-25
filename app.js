// Initialize map
const map = L.map('map').setView([51.505, -0.09], 13);

// Add OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
}).addTo(map);

let drawnPolygon = null;
let isDrawing = false;
let currentLatLngs = [];

const drawBtn = document.getElementById('drawBtn');
const editBtn = document.getElementById('editBtn');
const deleteBtn = document.getElementById('deleteBtn');
const clearBtn = document.getElementById('clearBtn');
const planPathBtn = document.getElementById('planPathBtn');
const exportBtn = document.getElementById('exportBtn');

drawBtn.addEventListener('click', () => {
  isDrawing = true;
  currentLatLngs = [];
  if (drawnPolygon) {
    map.removeLayer(drawnPolygon);
    drawnPolygon = null;
  }
  alert('Click on the map to draw polygon vertices. Double click to finish.');
});

map.on('click', (e) => {
  if (!isDrawing) return;
  currentLatLngs.push(e.latlng);
  if (drawnPolygon) {
    drawnPolygon.setLatLngs(currentLatLngs);
  } else {
    drawnPolygon = L.polygon(currentLatLngs, {color: 'blue'}).addTo(map);
  }
});

map.on('dblclick', (e) => {
  if (!isDrawing) return;
  isDrawing = false;
  exportBtn.disabled = false;
  alert('Polygon drawing finished.');
});

editBtn.addEventListener('click', () => {
  if (!drawnPolygon) {
    alert('No polygon to edit.');
    return;
  }
  drawnPolygon.editing.enable();
});

deleteBtn.addEventListener('click', () => {
  if (drawnPolygon) {
    map.removeLayer(drawnPolygon);
    drawnPolygon = null;
    exportBtn.disabled = true;
  }
});

clearBtn.addEventListener('click', () => {
  if (drawnPolygon) {
    map.removeLayer(drawnPolygon);
    drawnPolygon = null;
    exportBtn.disabled = true;
  }
});

exportBtn.addEventListener('click', () => {
  if (!drawnPolygon) {
    alert('No polygon to export.');
    return;
  }
  const latlngs = drawnPolygon.getLatLngs();
  alert('Exported polygon coordinates: ' + JSON.stringify(latlngs));
});

// Placeholder for planPathBtn
planPathBtn.addEventListener('click', () => {
  alert('Coverage path generation not implemented yet.');
});