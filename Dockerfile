# Use Node.js LTS version
FROM node:18

# Set working directory inside the container
WORKDIR /app

# Copy package files and install dependencies
COPY backend/package*.json ./
RUN npm install

# Copy the rest of your backend code
COPY backend/ .

# Expose the port your server runs on (Cloud Run expects 8080)
EXPOSE 8080

# Start the server
CMD ["node", "server.js"]
