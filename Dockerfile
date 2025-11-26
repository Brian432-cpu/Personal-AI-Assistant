# Use official Python image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy backend code
COPY ./backend /app

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose port
EXPOSE 5000

# Run Flask app
CMD ["python", "app.py"]
