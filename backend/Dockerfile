FROM node:18-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci --only=production

# Copy the rest of the application code
COPY . .

# Expose port (adjust if your Express app uses a different port, commonly 5000 or 8080)
EXPOSE 5000

# Start the application
CMD ["node", "server.js"]
