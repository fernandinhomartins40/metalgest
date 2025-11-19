import { Router } from 'express';
import { dashboardController } from '@/controllers/dashboard.controller';
import { authenticate } from '@/middlewares/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get dashboard statistics
router.get('/stats', dashboardController.stats);

// Get revenue chart data
router.get('/revenue-chart', dashboardController.revenueChart);

// Get quotes conversion rate
router.get('/quotes-conversion', dashboardController.quotesConversion);

// Get top clients
router.get('/top-clients', dashboardController.topClients);

export default router;
