const express = require('express');
const router = express.Router();
const clientsController = require('../controllers/clients');
const { authMiddleware } = require('../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../middleware/validation');
const { clientSchema, paginationSchema, idParamSchema } = require('../utils/validation');

// All routes require authentication
router.use(authMiddleware);

// Routes
router.get('/', validateQuery(paginationSchema), clientsController.getAll);
router.get('/search', clientsController.search);
router.get('/stats', clientsController.getStats);
router.get('/:id', validateParams(idParamSchema), clientsController.getById);
router.post('/', validateBody(clientSchema), clientsController.create);
router.put('/:id', validateParams(idParamSchema), validateBody(clientSchema), clientsController.update);
router.delete('/:id', validateParams(idParamSchema), clientsController.delete);

module.exports = router;