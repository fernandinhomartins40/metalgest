const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const corsMiddleware = require('../middleware/cors');

// Import routes
const authRoutes = require('../routes/auth');
const clientsRoutes = require('../routes/clients');
const productsRoutes = require('../routes/products');
const servicesRoutes = require('../routes/services');
const quotesRoutes = require('../routes/quotes');
const dashboardRoutes = require('../routes/dashboard');
const usersRoutes = require('../routes/users');
const transactionsRoutes = require('../routes/transactions');
const uploadRoutes = require('../routes/upload');

function createApp() {
  const app = express();

  // Trust proxy if behind reverse proxy (like nginx)
  app.set('trust proxy', 1);

  // Security middleware
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  }));

  // CORS middleware
  app.use(corsMiddleware);

  // Compression middleware
  app.use(compression());

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
      success: false,
      error: { message: 'Too many requests, please try again later.' }
    },
    standardHeaders: true,
    legacyHeaders: false
  });
  app.use('/api/', limiter);

  // Auth rate limiting (more strict)
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // limit each IP to 20 auth requests per windowMs
    message: {
      success: false,
      error: { message: 'Too many authentication attempts, please try again later.' }
    },
    standardHeaders: true,
    legacyHeaders: false
  });
  app.use('/api/auth/login', authLimiter);
  app.use('/api/auth/register', authLimiter);

  // Logging middleware
  const logFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
  app.use(morgan(logFormat));

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
      }
    });
  });

  // API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/clients', clientsRoutes);
  app.use('/api/products', productsRoutes);
  app.use('/api/services', servicesRoutes);
  app.use('/api/quotes', quotesRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/users', usersRoutes);
  app.use('/api/transactions', transactionsRoutes);
  app.use('/api/upload', uploadRoutes);

  // Static files middleware (for uploads)
  app.use('/api/uploads', express.static('uploads'));

  // 404 handler
  app.use('/api/*', (req, res) => {
    res.status(404).json({
      success: false,
      error: { message: 'API endpoint not found' }
    });
  });

  // Global error handler
  app.use((err, req, res, next) => {
    console.error('Global error handler:', err);

    // Handle specific error types
    if (err.type === 'entity.parse.failed') {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid JSON in request body' }
      });
    }

    if (err.type === 'entity.too.large') {
      return res.status(413).json({
        success: false,
        error: { message: 'Request body too large' }
      });
    }

    // Default error response
    res.status(err.status || 500).json({
      success: false,
      error: { 
        message: process.env.NODE_ENV === 'production' 
          ? 'Internal server error' 
          : err.message || 'Something went wrong'
      }
    });
  });

  return app;
}

module.exports = createApp;