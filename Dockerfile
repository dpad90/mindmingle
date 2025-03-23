# Use Node.js LTS version
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY backend/package*.json ./

# Install dependencies
RUN npm install

# Copy backend code
COPY backend/ ./
COPY frontend/ ./public/

# Create a .env file (if needed, for environment variables)
RUN touch .env

# Expose the port the app runs on
EXPOSE 3001

# Command to run the app
CMD ["node", "server.js"]
