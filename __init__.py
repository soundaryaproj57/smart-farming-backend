# Routing module for Smart Farming System

# ML route only (for disease detection)

from .ml_routes import ml_bp

# Optional imports (skip if missing firebase or other setup)

try:
    from .path_planner_routes import path_planner_bp
except:
    path_planner_bp = None

try:
    from .auth_routes import auth_bp
except:
    auth_bp = None

try:
    from .iot_routes import iot_bp
except:
    iot_bp = None

__all__ = [
    'ml_bp',
    'path_planner_bp',
    'auth_bp',
    'iot_bp'
]