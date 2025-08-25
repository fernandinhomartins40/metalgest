const express = require('express');
const router = express.Router();
const servicesController = require('../controllers/services');
const { authMiddleware } = require('../middleware/auth');

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

// Rotas CRUD básicas
router.post('/', servicesController.create.bind(servicesController));
router.get('/', servicesController.list.bind(servicesController));
router.get('/categories', servicesController.getCategories.bind(servicesController));
router.get('/stats', servicesController.getStats.bind(servicesController));
router.get('/popular', servicesController.getPopular.bind(servicesController));
router.get('/:id', servicesController.getById.bind(servicesController));
router.put('/:id', servicesController.update.bind(servicesController));
router.delete('/:id', servicesController.delete.bind(servicesController));

module.exports = router;