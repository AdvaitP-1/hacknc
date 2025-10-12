"""
Health check API routes
"""
import platform
import psutil
from datetime import datetime
from flask import Blueprint, jsonify

# Create blueprint for health routes
health_bp = Blueprint('health', __name__)

@health_bp.route('/')
def health_check():
    """System health check endpoint"""
    try:
        # Get system information
        system_info = {
            'status': 'healthy',
            'service': 'hacknc-backend',
            'timestamp': datetime.now().isoformat(),
            'system': {
                'platform': platform.system(),
                'platform_version': platform.version(),
                'architecture': platform.architecture()[0],
                'processor': platform.processor(),
                'hostname': platform.node()
            },
            'resources': {
                'cpu_percent': psutil.cpu_percent(interval=1),
                'memory_percent': psutil.virtual_memory().percent,
                'disk_percent': psutil.disk_usage('/').percent,
                'boot_time': datetime.fromtimestamp(psutil.boot_time()).isoformat()
            },
            'uptime': {
                'seconds': int(psutil.boot_time()),
                'formatted': str(datetime.now() - datetime.fromtimestamp(psutil.boot_time()))
            }
        }
        return jsonify(system_info)
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500
