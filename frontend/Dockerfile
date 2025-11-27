FROM nginx:alpine

# Copy static files into Nginx
COPY index.html /usr/share/nginx/html/
COPY script.js /usr/share/nginx/html/

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
