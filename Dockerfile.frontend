# Frontend Dockerfile for React + Vite
FROM node:20-alpine AS builder

# Configure npm for better network handling
RUN npm config set registry https://registry.npmjs.org/ && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-retry-mintimeout 10000 && \
    npm config set fetch-retries 5

WORKDIR /app

# Copy all source files
COPY . .

# Install root dependencies
RUN npm install || \
    (sleep 10 && npm install) || \
    (sleep 30 && npm install)

# Install frontend dependencies and build
WORKDIR /app/apps/web
RUN npm install && npm run build

# Production image with nginx
FROM nginx:alpine AS runner

# Copy built application
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx/frontend.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

# Use nginx to serve the files
CMD ["nginx", "-g", "daemon off;"]