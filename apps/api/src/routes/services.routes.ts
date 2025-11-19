import { Router } from 'express';
import { servicesController } from '@/controllers/services.controller';
import { authenticate } from '@/middlewares/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get service categories (must be before /:id)
router.get('/categories', servicesController.categories);

// List services
router.get('/', servicesController.list);

// Get service by ID
router.get('/:id', servicesController.get);

// Create new service
router.post('/', servicesController.create);

// Update service
router.put('/:id', servicesController.update);

// Delete service
router.delete('/:id', servicesController.delete);

export default router;
