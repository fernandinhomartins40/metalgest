import { Router } from 'express';
import { transactionsController } from '@/controllers/transactions.controller';
import { authenticate } from '@/middlewares/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get balance summary (must be before /:id)
router.get('/balance', transactionsController.balance);

// Get summary by category (must be before /:id)
router.get('/summary/category', transactionsController.summaryByCategory);

// Get summary by month (must be before /:id)
router.get('/summary/month', transactionsController.summaryByMonth);

// List transactions
router.get('/', transactionsController.list);

// Get transaction by ID
router.get('/:id', transactionsController.get);

// Create new transaction
router.post('/', transactionsController.create);

// Update transaction
router.put('/:id', transactionsController.update);

// Delete transaction
router.delete('/:id', transactionsController.delete);

export default router;
