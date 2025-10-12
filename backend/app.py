
import os
import logging
from flask import Flask, jsonify
from flask_cors import CORS

from api.health.routes import health_bp
from api.dashboard.routes import dashboard_bp
from api.forums.routes import forums_bp

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def create_app():
    app = Flask(__name__)
    
    CORS(app, origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://your-production-domain.com"
    ])
    
    app.register_blueprint(health_bp, url_prefix='/api/health')
    app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')
    app.register_blueprint(forums_bp, url_prefix='/api/forums')
    
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            'success': False,
            'error': 'Endpoint not found',
            'message': 'The requested API endpoint does not exist'
        }), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        logger.error(f"Internal server error: {error}")
        return jsonify({
            'success': False,
            'error': 'Internal server error',
            'message': 'An unexpected error occurred on the server'
        }), 500
    
    @app.route('/')
    def root_health():
        return jsonify({
            'success': True,
            'message': 'StudyShare API is running',
            'version': '1.0.0'
        })
    
    logger.info("Flask application created successfully")
    return app

app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    host = os.environ.get('HOST', '0.0.0.0')
    debug = os.environ.get('DEBUG', 'true').lower() == 'true'
    
    logger.info(f"Starting StudyShare API server on {host}:{port}")
    logger.info(f"Debug mode: {debug}")
    
    try:
        app.run(host=host, port=port, debug=debug)
    except Exception as e:
        logger.error(f"Failed to start server: {e}")
        raise