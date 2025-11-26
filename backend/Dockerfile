# Use official Python 3.11 image (slim variant)
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy requirements (if present)
COPY backend/requirements.txt ./

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY backend/ ./

# Expose port (assuming backend listens at 5000 — adjust if different)
EXPOSE 5000

# Run the app
CMD ["python", "app.py"]
