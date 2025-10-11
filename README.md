# HackNC Full-Stack Application

This is a full-stack application with a Next.js frontend and Flask backend that displays system health information.

## Project Structure

```
hacknc/
├── frontend/          # Next.js React application
├── backend/           # Flask Python API
├── Dockerfile         # Single production Docker setup
└── README.md
```

## Prerequisites

- Node.js (v18 or higher)
- Python 3.11+
- npm or yarn

## Quick Start (Local Development)

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


### Using Docker

```bash
# Build the Docker image
docker build -t hacknc-app .

# Run the container
docker run -p 3000:3000 -p 5000:5000 hacknc-app
```

### Using the startup script

```bash
# Make the script executable (if not already)
chmod +x start.sh

# Run the application
./start.sh
```

