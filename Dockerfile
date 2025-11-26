# Backend Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Copy requirements
COPY backend/requirements.txt ./

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY backend/ ./backend

# Expose backend port
EXPOSE 5000

# Run backend
CMD ["python", "backend/app.py"]
