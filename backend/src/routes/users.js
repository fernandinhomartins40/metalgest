const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users');
const { authMiddleware } = require('../middleware/auth');

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

// Rotas CRUD básicas
router.post('/', usersController.create.bind(usersController));
router.get('/', usersController.list.bind(usersController));
router.get('/stats', usersController.getStats.bind(usersController));
router.get('/:id', usersController.getById.bind(usersController));
router.put('/:id', usersController.update.bind(usersController));
router.delete('/:id', usersController.delete.bind(usersController));

// Rotas específicas
router.patch('/:id/password', usersController.changePassword.bind(usersController));
router.patch('/:id/toggle-active', usersController.toggleActive.bind(usersController));

module.exports = router;