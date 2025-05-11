FROM nginx:alpine

# Copy the contents of the public directory to Nginx's HTML directory
COPY public/ /usr/share/nginx/html/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]