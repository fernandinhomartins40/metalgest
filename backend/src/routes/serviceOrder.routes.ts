import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { auditMiddleware } from '../middleware/audit';
import { ResponseUtil } from '../utils/response';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

router.use(authenticate);

router.get('/', 
  auditMiddleware.list('service_orders'),
  asyncHandler(async (_req: import('express').Request, res: import('express').Response, _next: import('express').NextFunction) => {
    ResponseUtil.success(res, [], 'Service orders retrieved successfully');
  })
);

router.post('/',
  auditMiddleware.create('service_orders'),
  asyncHandler(async (_req: import('express').Request, res: import('express').Response, _next: import('express').NextFunction) => {
    ResponseUtil.success(res, null, 'Service order created successfully', 201);
  })
);

router.get('/:id',
  auditMiddleware.read('service_orders'),
  asyncHandler(async (_req: import('express').Request, res: import('express').Response, _next: import('express').NextFunction) => {
    ResponseUtil.success(res, null, 'Service order retrieved successfully');
  })
);

router.put('/:id',
  auditMiddleware.update('service_orders'),
  asyncHandler(async (_req: import('express').Request, res: import('express').Response, _next: import('express').NextFunction) => {
    ResponseUtil.success(res, null, 'Service order updated successfully');
  })
);

router.delete('/:id',
  auditMiddleware.delete('service_orders'),
  asyncHandler(async (_req: import('express').Request, res: import('express').Response, _next: import('express').NextFunction) => {
    ResponseUtil.success(res, null, 'Service order deleted successfully');
  })
);

router.put('/:id/status',
  auditMiddleware.custom('update_status', 'service_orders'),
  asyncHandler(async (_req: import('express').Request, res: import('express').Response, _next: import('express').NextFunction) => {
    ResponseUtil.success(res, null, 'Service order status updated successfully');
  })
);

router.post('/from-quote/:quoteId',
  auditMiddleware.custom('create_from_quote', 'service_orders'),
  asyncHandler(async (_req: import('express').Request, res: import('express').Response, _next: import('express').NextFunction) => {
    ResponseUtil.success(res, null, 'Service order created from quote successfully', 201);
  })
);

export default router;