const express = require('express');
const router = express.Router();
const productsController = require('../controllers/products');
const { authMiddleware } = require('../middleware/auth');

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

// Rotas CRUD básicas
router.post('/', productsController.create.bind(productsController));
router.get('/', productsController.list.bind(productsController));
router.get('/categories', productsController.getCategories.bind(productsController));
router.get('/low-stock', productsController.getLowStock.bind(productsController));
router.get('/:id', productsController.getById.bind(productsController));
router.put('/:id', productsController.update.bind(productsController));
router.delete('/:id', productsController.delete.bind(productsController));

// Rotas específicas
router.patch('/:id/stock', productsController.updateStock.bind(productsController));

module.exports = router;