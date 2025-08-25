const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard');
const { authMiddleware } = require('../middleware/auth');

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

// Rotas do dashboard
router.get('/stats', dashboardController.getStats.bind(dashboardController));
router.get('/charts/quotes', dashboardController.getQuoteChart.bind(dashboardController));
router.get('/charts/products', dashboardController.getProductCategoryChart.bind(dashboardController));
router.get('/top/clients', dashboardController.getTopClients.bind(dashboardController));
router.get('/top/products', dashboardController.getTopProducts.bind(dashboardController));
router.get('/top/services', dashboardController.getTopServices.bind(dashboardController));
router.get('/quotes/status', dashboardController.getQuotesByStatus.bind(dashboardController));
router.get('/products/low-stock', dashboardController.getLowStockProducts.bind(dashboardController));
router.get('/reports/sales', dashboardController.getSalesReport.bind(dashboardController));

module.exports = router;