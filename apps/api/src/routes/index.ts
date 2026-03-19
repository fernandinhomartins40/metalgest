import { Router } from 'express';
import authRoutes from './auth.routes';
import auditRoutes from './audit.routes';
import clientsRoutes from './clients.routes';
import dashboardRoutes from './dashboard.routes';
import emailRoutes from './email.routes';
import productsRoutes from './products.routes';
import quotesRoutes from './quotes.routes';
import serviceOrdersRoutes from './service-orders.routes';
import servicesRoutes from './services.routes';
import settingsRoutes from './settings.routes';
import transactionsRoutes from './transactions.routes';
import uploadRoutes from './upload.routes';
import usersRoutes from './users.routes';

const router = Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/email', emailRoutes);
router.use('/audit-logs', auditRoutes);
router.use('/users', usersRoutes);
router.use('/clients', clientsRoutes);
router.use('/products', productsRoutes);
router.use('/services', servicesRoutes);
router.use('/quotes', quotesRoutes);
router.use('/service-orders', serviceOrdersRoutes);
router.use('/transactions', transactionsRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/settings', settingsRoutes);
router.use('/upload', uploadRoutes);

// Health check
router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export default router;
