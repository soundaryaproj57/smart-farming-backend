import os

# ====================================
# REDUCE TENSORFLOW MEMORY USAGE
# ====================================
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"

from flask import Flask, render_template, request

# ====================================
# IMPORT BLUEPRINTS
# ====================================
from routing import (
    path_planner_bp,
    ml_bp,
    auth_bp,
    iot_bp
)

# ====================================
# CREATE APP
# ====================================
app = Flask(__name__)

# ====================================
# FILE PATHS
# ====================================
BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

UPLOAD_DIR = os.path.join(
    BASE_DIR,
    "uploads"
)

os.makedirs(
    UPLOAD_DIR,
    exist_ok=True
)

# ====================================
# REGISTER BLUEPRINTS
# ====================================
app.register_blueprint(
    path_planner_bp
)

app.register_blueprint(
    ml_bp
)

app.register_blueprint(
    auth_bp
)

app.register_blueprint(
    iot_bp
)

# ====================================
# PAGE ROUTES
# ====================================
@app.route("/")
def index():
    user_type = request.args.get(
        "userType"
    )

    return render_template(
        "index.html",
        userType=user_type
    )


@app.route("/dashboard")
def dashboard():
    return render_template(
        "dashboard.html"
    )


@app.route("/health")
def health():
    return {
        "status": "running",
        "message": "Smart Farming Backend Running 🚜"
    }


# ====================================
# RUN APP
# ====================================
if __name__ == "__main__":
    port = int(
        os.environ.get(
            "PORT",
            5002
        )
    )

    app.run(
        debug=False,
        host="0.0.0.0",
        port=port
    )