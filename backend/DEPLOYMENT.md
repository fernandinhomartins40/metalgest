# MetalGest Backend - Deployment Guide

This guide provides step-by-step instructions for deploying the MetalGest backend in different environments.

## Prerequisites

- Node.js 18 or higher
- PostgreSQL 13 or higher
- Redis (optional, for caching)
- Docker (optional, for containerized deployment)

## Quick Start

### 1. Development Setup

```bash
# Clone and navigate to backend directory
cd metalgest/backend

# Run setup script
node scripts/setup.js

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Setup database
npm run prisma:migrate
npm run prisma:generate
npm run prisma:seed

# Start development server
npm run dev
```

The API will be available at `http://localhost:3001`

### 2. Production Deployment

#### Manual Deployment

```bash
# Build the application
npm run build

# Set production environment variables
export NODE_ENV=production
export DATABASE_URL="your-production-database-url"
export JWT_SECRET="your-jwt-secret"
export JWT_REFRESH_SECRET="your-refresh-secret"

# Run database migrations
npm run db:deploy

# Start the server
npm start
```

#### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build custom image
docker build -t metalgest-backend .
docker run -p 3001:3001 metalgest-backend
```

## Environment Variables

### Required Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/metalgest

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-secret-key

# Server
PORT=3001
NODE_ENV=production
```

### Optional Variables

```env
# CORS
CORS_ORIGIN=https://your-frontend-domain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# External APIs
ASAAS_API_KEY=your-asaas-api-key
MERCADOPAGO_ACCESS_TOKEN=your-mercadopago-token
```

## Database Setup

### 1. PostgreSQL Installation

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### CentOS/RHEL
```bash
sudo yum install postgresql-server postgresql-contrib
sudo postgresql-setup initdb
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### macOS
```bash
brew install postgresql
brew services start postgresql
```

### 2. Database Creation

```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE metalgest;
CREATE USER metalgest_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE metalgest TO metalgest_user;
\q
```

### 3. Connection String

```env
DATABASE_URL=postgresql://metalgest_user:your_password@localhost:5432/metalgest?schema=public
```

## Cloud Deployment

### 1. Heroku

```bash
# Install Heroku CLI
# Create Heroku app
heroku create metalgest-backend

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret
heroku config:set JWT_REFRESH_SECRET=your-refresh-secret

# Deploy
git push heroku main

# Run migrations
heroku run npm run db:deploy
```

### 2. AWS EC2

```bash
# Launch EC2 instance (Ubuntu 20.04)
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Clone and setup application
git clone your-repo
cd metalgest/backend
npm install
npm run build

# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'metalgest-backend',
    script: 'dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
}
EOF

# Start with PM2
pm2 start ecosystem.config.js
pm2 startup
pm2 save
```

### 3. Digital Ocean

```bash
# Create Droplet (Ubuntu 20.04)
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Deploy with Docker
git clone your-repo
cd metalgest/backend
docker-compose up -d
```

## SSL/TLS Configuration

### 1. Let's Encrypt with Nginx

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 2. Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Monitoring and Logging

### 1. PM2 Monitoring

```bash
# View logs
pm2 logs metalgest-backend

# Monitor processes
pm2 monit

# Restart application
pm2 restart metalgest-backend
```

### 2. Log Rotation

```bash
# Configure logrotate
sudo nano /etc/logrotate.d/metalgest

# Add configuration
/path/to/metalgest/backend/logs/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 0644 www-data www-data
    postrotate
        pm2 restart metalgest-backend
    endscript
}
```

## Backup Strategy

### 1. Database Backup

```bash
# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/database"
mkdir -p $BACKUP_DIR

pg_dump $DATABASE_URL > $BACKUP_DIR/metalgest_$DATE.sql
gzip $BACKUP_DIR/metalgest_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
EOF

chmod +x backup.sh

# Schedule with cron
crontab -e
# Add: 0 2 * * * /path/to/backup.sh
```

### 2. File Backup

```bash
# Backup uploads directory
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz uploads/

# Sync to cloud storage (AWS S3 example)
aws s3 sync uploads/ s3://your-bucket/uploads/
```

## Security Checklist

- [ ] Use HTTPS in production
- [ ] Set strong JWT secrets
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Update dependencies regularly
- [ ] Use environment variables for secrets
- [ ] Implement proper logging
- [ ] Set up monitoring
- [ ] Configure firewall rules
- [ ] Regular security audits

## Performance Optimization

### 1. Database Optimization

```sql
-- Create indexes for common queries
CREATE INDEX idx_products_user_id ON products(user_id);
CREATE INDEX idx_quotes_user_id ON quotes(user_id);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(date);
```

### 2. Redis Caching

```typescript
// Add Redis for caching
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// Cache frequently accessed data
const cacheKey = `user:${userId}:dashboard`;
let dashboardData = await redis.get(cacheKey);

if (!dashboardData) {
  dashboardData = await generateDashboardData(userId);
  await redis.setex(cacheKey, 300, JSON.stringify(dashboardData));
}
```

### 3. Connection Pooling

```typescript
// Configure Prisma connection pool
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});
```

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check DATABASE_URL format
   - Verify PostgreSQL is running
   - Check network connectivity

2. **JWT Token Issues**
   - Ensure JWT_SECRET is set
   - Check token expiration
   - Verify token format

3. **Port Already in Use**
   - Change PORT environment variable
   - Kill process using port: `lsof -ti:3001 | xargs kill`

4. **Memory Issues**
   - Monitor memory usage: `pm2 monit`
   - Increase server memory
   - Optimize database queries

### Logs Analysis

```bash
# View application logs
tail -f logs/application-*.log

# View error logs
tail -f logs/error-*.log

# Search for specific errors
grep -r "ERROR" logs/
```

## Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation
- Review logs for error details
- Contact the development team

## License

This project is licensed under the MIT License.