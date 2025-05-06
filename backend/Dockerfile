# Use official Node.js LTS image with multi-arch support
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install --production

# Copy backend source code
COPY . .

# Expose backend port (adjust if different)
EXPOSE 5000

# Start the backend server
CMD ["node", "app.js"]
