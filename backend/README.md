# Backend API Structure

This backend follows a modular structure for better organization and maintainability.

## Directory Structure

```
backend/
├── app.py                 # Main Flask application entry point
├── config/
│   ├── __init__.py
│   └── database.py        # Database configuration and Supabase client
├── api/
│   ├── __init__.py
│   ├── health/
│   │   ├── __init__.py
│   │   └── routes.py      # Health check endpoints
│   └── dashboard/
│       ├── __init__.py
│       └── routes.py      # Dashboard-related endpoints
└── requirements.txt
```

## API Endpoints

### Health Check
- `GET /api/health/` - System health check with system information

### Dashboard
- `GET /api/dashboard/user-profile?user_id=<id>` - Get user profile
- `GET /api/dashboard/stats?user_id=<id>` - Get user statistics
- `GET /api/dashboard/recent-activity?user_id=<id>&limit=<n>` - Get recent activity
- `POST /api/dashboard/create-profile` - Create new user profile
- `POST /api/dashboard/update-profile` - Update user profile

## Configuration

The application uses environment variables for configuration:
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `PORT` - Server port (default: 5001)

## Running the Application

1. Activate the virtual environment:
   ```bash
   source venv/bin/activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up environment variables in `.env` file

4. Run the application:
   ```bash
   python app.py
   ```

## Adding New API Modules

To add new API modules:

1. Create a new directory under `api/`
2. Add `__init__.py` file
3. Create `routes.py` with your blueprint
4. Import and register the blueprint in `app.py`

Example:
```python
# api/new_module/routes.py
from flask import Blueprint

new_module_bp = Blueprint('new_module', __name__, url_prefix='/api/new-module')

@new_module_bp.route('/')
def index():
    return {'message': 'Hello from new module'}
```

```python
# app.py
from api.new_module.routes import new_module_bp
app.register_blueprint(new_module_bp)
```
