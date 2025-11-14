# Dockerfile - builds the Flask backend and serves static frontend
FROM python:3.11-slim

WORKDIR /app

# Install system deps
RUN apt-get update && apt-get install -y build-essential gcc && rm -rf /var/lib/apt/lists/*

# Copy files
COPY backend/ ./backend/
COPY frontend/ ./frontend/

WORKDIR /app/backend

# Install pip deps
RUN pip install --no-cache-dir -r requirements.txt

# Expose port
EXPOSE 5000

ENV FLASK_APP=app.py
ENV FLASK_RUN_HOST=0.0.0.0
ENV FLASK_ENV=production

CMD ["python", "app.py"]
