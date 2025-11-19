import { Router } from 'express';
import { clientsController } from '@/controllers/clients.controller';
import { authenticate } from '@/middlewares/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// List clients
router.get('/', clientsController.list);

// Get client by ID
router.get('/:id', clientsController.get);

// Create new client
router.post('/', clientsController.create);

// Update client
router.put('/:id', clientsController.update);

// Delete client
router.delete('/:id', clientsController.delete);

// Get client statistics
router.get('/:id/stats', clientsController.stats);

export default router;
