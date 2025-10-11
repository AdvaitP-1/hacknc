# Multi-stage build for both frontend and backend
FROM node:18-alpine AS frontend-builder

# Build frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Production stage
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install build dependencies for psutil
RUN apt-get update && apt-get install -y gcc python3-dev && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./

# Copy built frontend from previous stage
COPY --from=frontend-builder /app/frontend/.next /app/frontend/.next
COPY --from=frontend-builder /app/frontend/public /app/frontend/public
COPY --from=frontend-builder /app/frontend/package*.json /app/frontend/
COPY --from=frontend-builder /app/frontend/node_modules /app/frontend/node_modules

# Install Node.js for serving frontend
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

# Create startup script
RUN echo '#!/bin/bash\n\
# Start backend in background\n\
gunicorn --bind 0.0.0.0:5000 app:app &\n\
\n\
# Start frontend\n\
cd /app/frontend && npm start &\n\
\n\
# Wait for any process to exit\n\
wait' > /app/start.sh && chmod +x /app/start.sh

# Expose ports
# Note: Port 5000 may conflict with macOS ControlCenter
# Use -p 5001:5000 when running the container
EXPOSE 3000 5000

# Start both services
CMD ["/app/start.sh"]
