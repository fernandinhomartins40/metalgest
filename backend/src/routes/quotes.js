const express = require('express');
const router = express.Router();
const quotesController = require('../controllers/quotes');
const { authMiddleware } = require('../middleware/auth');

// Rota pública para visualizar orçamentos
router.get('/public/:public_id', quotesController.getByPublicId.bind(quotesController));

// Aplicar middleware de autenticação nas rotas protegidas
router.use(authMiddleware);

// Rotas CRUD básicas
router.post('/', quotesController.create.bind(quotesController));
router.get('/', quotesController.list.bind(quotesController));
router.get('/stats', quotesController.getStats.bind(quotesController));
router.get('/:id', quotesController.getById.bind(quotesController));
router.put('/:id', quotesController.update.bind(quotesController));
router.delete('/:id', quotesController.delete.bind(quotesController));

// Rotas específicas
router.patch('/:id/status', quotesController.updateStatus.bind(quotesController));
router.post('/:id/duplicate', quotesController.duplicate.bind(quotesController));

module.exports = router;