#!/bin/bash

# Entrypoint script for MetalGest deployment
set -e

echo "=== MetalGest Deployment Entrypoint ==="

# Wait for database to be ready
echo "Waiting for database to be ready..."
until nc -z db 5432; do
  echo "Database is not ready yet, waiting..."
  sleep 2
done

echo "Database is ready!"

# Run database migrations
echo "Running database migrations..."
cd /app && npm run db:push

# Generate Prisma client
echo "Generating Prisma client..."
cd /app && npm run db:generate

# Start the application
echo "Starting MetalGest application..."
exec "$@"