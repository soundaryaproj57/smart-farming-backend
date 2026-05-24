# Routing module for Smart Farming System
from flask import Blueprint

# Import route blueprints
from .path_planner_routes import path_planner_bp
from .ml_routes import ml_bp
from .auth_routes import auth_bp
from .iot_routes import iot_bp

__all__ = ['path_planner_bp', 'ml_bp', 'auth_bp', 'iot_bp']
