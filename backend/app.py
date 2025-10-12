
import os
import logging
from flask import Flask, jsonify
from flask_cors import CORS

# Import API blueprints
from api.health.routes import health_bp
from api.dashboard.routes import dashboard_bp
from api.forums.routes import forums_bp

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def create_app():
    """
    Application factory pattern for creating Flask app instance.
    
    Returns:
        Flask: Configured Flask application instance
    """
    app = Flask(__name__)
    
    # Configure CORS for frontend communication
    CORS(app, origins=[
        "http://localhost:3000",  # Next.js dev server
        "http://127.0.0.1:3000",
        "https://your-production-domain.com"  # Add your production domain
    ])
    
    # Register API blueprints
    app.register_blueprint(health_bp, url_prefix='/api/health')
    app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')
    app.register_blueprint(forums_bp, url_prefix='/api/forums')
    
    # Global error handlers
    @app.errorhandler(404)
    def not_found(error):
        """Handle 404 errors with consistent JSON response"""
        return jsonify({
            'success': False,
            'error': 'Endpoint not found',
            'message': 'The requested API endpoint does not exist'
        }), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        """Handle 500 errors with consistent JSON response"""
        logger.error(f"Internal server error: {error}")
        return jsonify({
            'success': False,
            'error': 'Internal server error',
            'message': 'An unexpected error occurred on the server'
        }), 500
    
    # Health check endpoint at root
    @app.route('/')
    def root_health():
        """Root endpoint for basic health check"""
        return jsonify({
            'success': True,
            'message': 'StudyShare API is running',
            'version': '1.0.0'
        })
    
    logger.info("Flask application created successfully")
    return app

# Create the Flask app instance
app = create_app()

if __name__ == '__main__':
    # Get configuration from environment variables
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