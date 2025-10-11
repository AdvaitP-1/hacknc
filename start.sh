#!/bin/bash

# HackNC Docker Startup Script

echo "🚀 Starting HackNC Full-Stack Application..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

echo "🏭 Building and starting in PRODUCTION mode..."

# Build the Docker image
echo "📦 Building Docker image..."
docker build -t hacknc-app .

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker stop $(docker ps -q --filter ancestor=hacknc-app) 2>/dev/null || true

# Run the container
echo "🚀 Starting container..."
docker run -p 3000:3000 -p 5000:5000 hacknc-app
