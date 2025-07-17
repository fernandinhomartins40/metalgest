import { Router } from 'express';
import { authenticate } from '@/middleware/auth';
import { auditMiddleware } from '@/middleware/audit';
import { ResponseUtil } from '@/utils/response';
import { asyncHandler } from '@/middleware/errorHandler';

const router = Router();

router.use(authenticate);

router.get('/company',
  auditMiddleware.custom('get_company_settings', 'settings'),
  asyncHandler(async (req, res) => {
    ResponseUtil.success(res, null, 'Company settings retrieved successfully');
  })
);

router.put('/company',
  auditMiddleware.custom('update_company_settings', 'settings'),
  asyncHandler(async (req, res) => {
    ResponseUtil.success(res, null, 'Company settings updated successfully');
  })
);

router.get('/system',
  auditMiddleware.custom('get_system_settings', 'settings'),
  asyncHandler(async (req, res) => {
    ResponseUtil.success(res, null, 'System settings retrieved successfully');
  })
);

router.put('/system',
  auditMiddleware.custom('update_system_settings', 'settings'),
  asyncHandler(async (req, res) => {
    ResponseUtil.success(res, null, 'System settings updated successfully');
  })
);

router.get('/notifications',
  auditMiddleware.custom('get_notification_settings', 'settings'),
  asyncHandler(async (req, res) => {
    ResponseUtil.success(res, null, 'Notification settings retrieved successfully');
  })
);

router.put('/notifications',
  auditMiddleware.custom('update_notification_settings', 'settings'),
  asyncHandler(async (req, res) => {
    ResponseUtil.success(res, null, 'Notification settings updated successfully');
  })
);

export default router;