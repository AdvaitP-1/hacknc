🚀 HackNC Full-Stack Application
🧩 Prerequisites

You can run the app using Docker (recommended) or locally using Node.js and Python.

Options

Docker (Recommended)
OR

Node.js v18+

Python 3.11+

npm or yarn

Optional but required for full functionality

Google Gemini API Key — used for AI-powered responses in the backend

Clerk API Key — used for authentication and user management

⚡ Quick Start (Docker — Recommended)

The easiest way to run the application is using Docker.

# Build the Docker image
docker build -t hacknc-app .

# Run the container with specific ports
docker run -d -p 3000:3000 -p 5001:5000 --name hacknc-app hacknc-app


The application will be available at:

Frontend: http://localhost:3000

Backend API: http://localhost:5001/api/health

📝 Note: macOS uses port 5000 for ControlCenter, so the backend runs on port 5001.

To stop the container:

docker stop hacknc-app
docker rm hacknc-app

💻 Local Development (Alternative)
1️⃣ Clone the Repository
git clone <repository-url>
cd hacknc

2️⃣ Backend Setup
cd backend

Create and activate a virtual environment
python3 -m venv venv
source venv/bin/activate      # macOS/Linux
# venv\Scripts\activate       # Windows

Install dependencies
pip install -r requirements.txt

Environment Variables

Create a .env file in the backend directory:

GEMINI_API_KEY=your_google_gemini_api_key
CLERK_SECRET_KEY=your_clerk_backend_key

Run the Backend
python app.py


Backend runs on:

http://localhost:5000

(or http://localhost:5001
 if port 5000 is in use)

3️⃣ Frontend Setup

Open a new terminal window:

cd frontend
npm install

Environment Variables

Create a .env.local file in the frontend directory:

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_frontend_key
NEXT_PUBLIC_BACKEND_URL=http://localhost:5001

Start the Frontend
npm run dev


Frontend runs on:

http://localhost:3000
 (or next available port)

🧠 Tech Stack Overview
Layer	Technology	Description
Frontend	React (Next.js)	Modern UI for users, includes authentication and dashboards
Authentication	Clerk	Manages sign-in/up and email verification (.edu-restricted)
Backend	Python (Flask)	REST API with routes for AI requests and data processing
AI Integration	Google Gemini API	Generates intelligent text and data responses
Containerization	Docker	Simplifies setup and deployment
Database (optional)	Supabase / PostgreSQL	(Optional) Data storage for user info or analytics
▶️ Startup Script

You can also use the provided startup script for convenience:

chmod +x start.sh
./start.sh


This will start both the frontend and backend automatically.

✅ Summary

This setup gives you:

🔒 Secure authentication using Clerk

🤖 AI-powered backend using Gemini API

⚛️ A fast React/Next.js frontend

🐳 Easy deployment through Docker
