import os
from flask import Flask, render_template, request, jsonify

# Blueprint imports from routing module
from routing import path_planner_bp, ml_bp, auth_bp, iot_bp

app = Flask(__name__)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ============================================================================
# REGISTER BLUEPRINTS
# ============================================================================
app.register_blueprint(path_planner_bp)  # /api/path/* routes
app.register_blueprint(ml_bp)            # /api/ml/* routes
app.register_blueprint(auth_bp)          # /api/auth/* routes
app.register_blueprint(iot_bp)           # /api/iot/* routes

# ============================================================================
# PAGE ROUTES
# ============================================================================

@app.route("/")
def index():
    """Home page - Smart Farming System"""
    user_type = request.args.get("userType")  # farmer / fertilizer
    print(user_type)
    return render_template("index.html", userType=user_type)



@app.route("/dashboard")
def dashboard():
    """Dashboard page"""
    return render_template("dashboard.html")

if __name__ == "__main__":
    app.run(debug=True, port=5002)
