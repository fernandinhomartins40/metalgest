const express = require('express');
const router = express.Router();
const transactionsController = require('../controllers/transactions');
const { authMiddleware } = require('../middleware/auth');

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

// Rotas CRUD básicas
router.post('/', transactionsController.create.bind(transactionsController));
router.get('/', transactionsController.list.bind(transactionsController));
router.get('/stats', transactionsController.getStats.bind(transactionsController));
router.get('/categories', transactionsController.getCategories.bind(transactionsController));
router.get('/cash-flow', transactionsController.getCashFlow.bind(transactionsController));
router.get('/:id', transactionsController.getById.bind(transactionsController));
router.put('/:id', transactionsController.update.bind(transactionsController));
router.delete('/:id', transactionsController.delete.bind(transactionsController));

// Rotas específicas
router.patch('/:id/status', transactionsController.updateStatus.bind(transactionsController));

module.exports = router;