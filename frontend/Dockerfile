# Build stage
FROM node:20 AS build

WORKDIR /app

# Copy package.json and package-lock.json
COPY frontend/package*.json ./

# Install dependencies
RUN npm install

# Copy frontend code
COPY frontend/ ./

# Build the frontend
RUN npm run build

# Serve stage
FROM nginx:stable-alpine

# Copy build output to nginx public folder
COPY --from=build /app/build /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

