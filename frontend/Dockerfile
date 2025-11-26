# Use Node.js for building frontend
FROM node:20 as build

WORKDIR /app

# Copy package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm install

# Copy frontend code
COPY frontend/ ./

# Build app (or build folder)
RUN npm run build

# Use nginx to serve built frontend
FROM nginx:stable-alpine

# Copy build output to nginx public folder
COPY --from=build /app/build /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
