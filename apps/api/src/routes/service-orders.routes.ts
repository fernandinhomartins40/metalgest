import { Router } from 'express';
import { serviceOrdersController } from '@/controllers/service-orders.controller';
import { authenticate } from '@/middlewares/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// List service orders
router.get('/', serviceOrdersController.list);

// Get service order by ID
router.get('/:id', serviceOrdersController.get);

// Create new service order
router.post('/', serviceOrdersController.create);

// Update service order
router.put('/:id', serviceOrdersController.update);

// Update service order status
router.patch('/:id/status', serviceOrdersController.updateStatus);

// Delete service order
router.delete('/:id', serviceOrdersController.delete);

export default router;
