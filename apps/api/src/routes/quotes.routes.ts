import { Router } from 'express';
import { quotesController } from '@/controllers/quotes.controller';
import { authenticate } from '@/middlewares/auth';

const router = Router();

// Public route - no authentication required
router.get('/public/:token', quotesController.getPublic);

// All other routes require authentication
router.use(authenticate);

// List quotes
router.get('/', quotesController.list);

// Get quote by ID
router.get('/:id', quotesController.get);

// Create new quote
router.post('/', quotesController.create);

// Update quote
router.put('/:id', quotesController.update);

// Update quote status
router.patch('/:id/status', quotesController.updateStatus);

// Toggle public link
router.patch('/:id/public-link', quotesController.togglePublicLink);

// Duplicate quote
router.post('/:id/duplicate', quotesController.duplicate);

// Delete quote
router.delete('/:id', quotesController.delete);

export default router;
