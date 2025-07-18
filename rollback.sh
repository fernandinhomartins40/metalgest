#!/bin/bash

# Rollback script for MetalGest deployment
set -e

echo "=== MetalGest Rollback Script ==="

# Find the most recent backup
BACKUP_DIR="/var/www/metalgest-backup"
if [ -d "$BACKUP_DIR" ]; then
    LATEST_BACKUP=$(ls -t $BACKUP_DIR | head -n 1)
    if [ -n "$LATEST_BACKUP" ]; then
        echo "Found latest backup: $LATEST_BACKUP"
        
        # Stop current containers
        echo "Stopping current deployment..."
        cd /var/www/metalgest
        docker-compose down || true
        
        # Restore from backup
        echo "Restoring from backup..."
        cd /var/www
        rm -rf metalgest-rollback-temp
        cp -r "$BACKUP_DIR/$LATEST_BACKUP" metalgest-rollback-temp
        
        # Swap directories
        mv metalgest metalgest-failed
        mv metalgest-rollback-temp metalgest
        
        # Start restored version
        echo "Starting restored deployment..."
        cd /var/www/metalgest
        docker-compose up -d
        
        echo "✅ Rollback completed successfully!"
        echo "Failed deployment moved to: /var/www/metalgest-failed"
    else
        echo "❌ No backup found in $BACKUP_DIR"
        exit 1
    fi
else
    echo "❌ Backup directory not found: $BACKUP_DIR"
    exit 1
fi