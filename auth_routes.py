"""
Authentication Routes - User registration and login
"""

from flask import Blueprint, request, jsonify
from database.db import get_db

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')


@auth_bp.route('/signup', methods=['POST'])
def signup():
    """
    Register new user
    
    Request JSON:
    {
        "email": "user@example.com",
        "password": "password",
        "role": "farmer|fertilizer"
    }
    
    Response:
    {
        "status": "success|error",
        "message": "..."
    }
    """
    try:
        data = request.json or {}
        email = data.get("email")
        password = data.get("password")
        role = data.get("role")
        
        if not all([email, password, role]):
            return jsonify({
                "status": "error",
                "message": "Missing required fields"
            }), 400
        
        conn = get_db()
        cur = conn.cursor()
        
        cur.execute("""
            CREATE TABLE IF NOT EXISTS users(
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE,
                password TEXT,
                role TEXT
            )
        """)
        
        try:
            cur.execute(
                "INSERT INTO users (email, password, role) VALUES (?,?,?)",
                (email, password, role)
            )
            conn.commit()
            status = "success"
            message = "Signup Success ✅"
        except Exception as e:
            status = "error"
            message = "User already exists ❌"
        finally:
            conn.close()
        
        return jsonify({
            "status": status,
            "message": message
        }), 200 if status == "success" else 400
    
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Login user
    
    Request JSON:
    {
        "email": "user@example.com",
        "password": "password",
        "role": "farmer|fertilizer"
    }
    
    Response:
    {
        "status": "success|error",
        "message": "..."
    }
    """
    try:
        data = request.json or {}
        email = data.get("email")
        password = data.get("password")
        role = data.get("role")
        
        if not all([email, password, role]):
            return jsonify({
                "status": "error",
                "message": "Missing required fields"
            }), 400
        
        conn = get_db()
        cur = conn.cursor()
        
        cur.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT,
                password TEXT,
                role TEXT
            )
        """)
        
        cur.execute(
            "SELECT * FROM users WHERE email=? AND password=? AND role=?",
            (email, password, role)
        )
        
        user = cur.fetchone()
        conn.close()
        
        if user:
            return jsonify({
                "status": "success",
                "message": "Login Success ✅"
            }), 200
        else:
            return jsonify({
                "status": "error",
                "message": "Invalid Login ❌"
            }), 401
    
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500
