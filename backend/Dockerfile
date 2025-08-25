FROM node:18-alpine

# Install curl for health checks
RUN apk --no-cache add curl

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --only=production

# Copy source code
COPY . .

# Create data directory for SQLite
RUN mkdir -p /app/data /app/uploads /app/logs

# Expose port
EXPOSE 3010

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3010/api/health || exit 1

# Start application
CMD ["npm", "start"]