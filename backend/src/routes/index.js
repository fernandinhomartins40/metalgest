const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const clientsRoutes = require('./clients');
const productsRoutes = require('./products');
const servicesRoutes = require('./services');
const quotesRoutes = require('./quotes');
const dashboardRoutes = require('./dashboard');

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'MetalGest API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Info endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'MetalGest API - Backend Node.js + SQLite',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      clients: '/api/clients',
      products: '/api/products',
      services: '/api/services',
      quotes: '/api/quotes',
      dashboard: '/api/dashboard'
    },
    documentation: 'https://github.com/metalgest/api-docs'
  });
});

// Mount route handlers
router.use('/auth', authRoutes);
router.use('/clients', clientsRoutes);
router.use('/products', productsRoutes);
router.use('/services', servicesRoutes);
router.use('/quotes', quotesRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router;