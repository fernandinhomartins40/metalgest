#!/bin/bash

# SSL Certificate Renewal Script for MetalGest
# This script should be run periodically to renew SSL certificates

cd /var/www/metalgest

# Renew certificates
docker-compose run --rm certbot renew

# Reload nginx to use new certificates
docker-compose exec nginx nginx -s reload

echo "SSL certificate renewal completed at $(date)"