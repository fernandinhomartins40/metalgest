import { Router } from 'express';
import { auditController } from '@/controllers/audit.controller';
import { authenticate, authorize } from '@/middlewares/auth';

const router = Router();

router.use(authenticate);
router.get('/', authorize('ADMIN', 'MANAGER'), auditController.list);

export default router;
