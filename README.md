

## Prerequisites

- Docker (recommended)
- OR Node.js (v18 or higher) + Python 3.11+ + npm/yarn (for local development)

## Quick Start (Docker - Recommended)

The easiest way to run the application is using Docker:

```bash
# Build the Docker image
docker build -t hacknc-app .

# Run the container (Docker will automatically assign available ports)
docker run -d -P --name hacknc-app hacknc-app

# Check which ports were assigned
docker ps
```

The application will be available at:
- **Frontend**: `http://localhost:[ASSIGNED_PORT_3000]`
- **Backend API**: `http://localhost:[ASSIGNED_PORT_5000]/api/health`

To stop the container:
```bash
docker stop hacknc-app
docker rm hacknc-app
```

## Local Development (Alternative)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd hacknc
```

### 2. Set Up the Backend

```bash
# Navigate to backend directory
cd backend

# Create a virtual environment
python3 -m venv venv

# Activate the virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the backend server
python app.py
```

The backend will start on `http://localhost:5000` (or `http://localhost:5001` if port 5000 is in use).

### 3. Set Up the Frontend

Open a new terminal window and run:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will start on `http://localhost:3000` (or the next available port).


### Using the startup script

```bash
# Make the script executable (if not already)
chmod +x start.sh

# Run the application
./start.sh
```

