from flask import Flask, jsonify
from flask_cors import CORS
import os
import platform
import psutil
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

@app.route('/api/health')
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

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
