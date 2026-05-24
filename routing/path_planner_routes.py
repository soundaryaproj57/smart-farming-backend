"""
Path Planner Routes - Boustrophedon Path Planning for Agricultural Drones/Robots
Integrated from pro 2 project with proper Flask blueprint structure
"""

from flask import Blueprint, request, jsonify
from path_planner import BoustrophedonPlanner

path_planner_bp = Blueprint('path_planner', __name__, url_prefix='/api/path')

@path_planner_bp.route('/plan', methods=['POST'])
def plan_path():
    """
    Generate optimal coverage path for field
    
    Request JSON:
    {
        "field_boundary": [[lat, lon], [lat, lon], ...],  # At least 3 points
        "obstacles": [[lat, lon], ...],  # Optional
        "implement_width": 1.2  # Default: 1.2 meters
    }
    
    Response:
    {
        "success": true,
        "waypoints": [{"lat": ..., "lon": ...}, ...],
        "path_length": number
    }
    """
    try:
        data = request.json or {}
        field_boundary = data.get('field_boundary', [])
        obstacles = data.get('obstacles', [])
        implement_width = float(data.get('implement_width', 1.2))
        
        print(f"🔥 Path Planning Request: boundary={field_boundary}, width={implement_width}")
        
        # Validate field boundary
        if len(field_boundary) < 3:
            return jsonify({
                'success': False,
                'error': 'Field boundary must have at least 3 points'
            }), 400
        
        # Initialize planner and generate path
        planner = BoustrophedonPlanner(
            field_boundary=field_boundary,
            obstacles=obstacles,
            implement_width=implement_width
        )
        
        waypoints = planner.generate_coverage_path()
        
        print(f"✅ Generated {len(waypoints)} waypoints")
        
        return jsonify({
            'success': True,
            'waypoints': waypoints,
            'path_length': len(waypoints),
            'implement_width': implement_width
        }), 200
    
    except Exception as e:
        print(f"❌ Path Planning Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@path_planner_bp.route('/export', methods=['POST'])
def export_waypoints():
    """
    Export generated waypoints for mission planning
    
    Request JSON:
    {
        "waypoints": [{"lat": ..., "lon": ...}, ...],
        "format": "json"  # Optional: json, csv, kml
    }
    
    Response:
    {
        "success": true,
        "data": waypoints,
        "count": number
    }
    """
    try:
        data = request.json or {}
        waypoints = data.get('waypoints', [])
        export_format = data.get('format', 'json')
        
        if not waypoints:
            return jsonify({
                'success': False,
                'error': 'No waypoints provided'
            }), 400
        
        return jsonify({
            'success': True,
            'data': waypoints,
            'count': len(waypoints),
            'format': export_format
        }), 200
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@path_planner_bp.route('/validate', methods=['POST'])
def validate_field():
    """
    Validate field boundary before path planning
    
    Request JSON:
    {
        "field_boundary": [[lat, lon], [lat, lon], ...]
    }
    
    Response:
    {
        "valid": true/false,
        "area": square_meters,
        "perimeter": meters,
        "points": number
    }
    """
    try:
        data = request.json or {}
        field_boundary = data.get('field_boundary', [])
        
        if len(field_boundary) < 3:
            return jsonify({
                'valid': False,
                'error': 'Field boundary must have at least 3 points',
                'points': len(field_boundary)
            }), 400
        
        # Calculate area (Shoelace formula approximation)
        area = 0
        for i in range(len(field_boundary)):
            p1 = field_boundary[i]
            p2 = field_boundary[(i + 1) % len(field_boundary)]
            area += (p1[1] * p2[0] - p2[1] * p1[0])
        area = abs(area) / 2 * 111320 * 111320  # Convert to approximate square meters
        
        # Calculate perimeter
        perimeter = 0
        for i in range(len(field_boundary)):
            p1 = field_boundary[i]
            p2 = field_boundary[(i + 1) % len(field_boundary)]
            dist = ((p2[0] - p1[0])**2 + (p2[1] - p1[1])**2)**0.5
            perimeter += dist * 111320  # Convert to meters
        
        return jsonify({
            'valid': True,
            'area': round(area, 2),
            'perimeter': round(perimeter, 2),
            'points': len(field_boundary)
        }), 200
    
    except Exception as e:
        return jsonify({
            'valid': False,
            'error': str(e)
        }), 500
