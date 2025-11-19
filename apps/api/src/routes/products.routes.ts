import { Router } from 'express';
import { productsController } from '@/controllers/products.controller';
import { authenticate } from '@/middlewares/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get products low in stock (must be before /:id)
router.get('/low-stock', productsController.lowStock);

// Get product categories (must be before /:id)
router.get('/categories', productsController.categories);

// List products
router.get('/', productsController.list);

// Get product by ID
router.get('/:id', productsController.get);

// Create new product
router.post('/', productsController.create);

// Update product
router.put('/:id', productsController.update);

// Update product stock
router.patch('/:id/stock', productsController.updateStock);

// Delete product
router.delete('/:id', productsController.delete);

export default router;
