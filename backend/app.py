"""
Main Flask application entry point
"""
from flask import Flask
from flask_cors import CORS
import os

# Import blueprints
from api.health.routes import health_bp
from api.dashboard.routes import dashboard_bp

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# Register blueprints
app.register_blueprint(health_bp)
app.register_blueprint(dashboard_bp)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True)