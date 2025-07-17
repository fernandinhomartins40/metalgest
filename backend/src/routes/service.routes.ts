import { Router } from 'express';
import { authenticate } from '@/middleware/auth';
import { auditMiddleware } from '@/middleware/audit';
import { ResponseUtil } from '@/utils/response';
import { asyncHandler } from '@/middleware/errorHandler';

const router = Router();

router.use(authenticate);

router.get('/', 
  auditMiddleware.list('services'),
  asyncHandler(async (_req: import('express').Request, res: import('express').Response, _next: import('express').NextFunction) => {
    ResponseUtil.success(res, [], 'Services retrieved successfully');
  })
);

router.post('/',
  auditMiddleware.create('services'),
  asyncHandler(async (_req: import('express').Request, res: import('express').Response, _next: import('express').NextFunction) => {
    ResponseUtil.success(res, null, 'Service created successfully', 201);
  })
);

router.get('/:id',
  auditMiddleware.read('services'),
  asyncHandler(async (_req: import('express').Request, res: import('express').Response, _next: import('express').NextFunction) => {
    ResponseUtil.success(res, null, 'Service retrieved successfully');
  })
);

router.put('/:id',
  auditMiddleware.update('services'),
  asyncHandler(async (_req: import('express').Request, res: import('express').Response, _next: import('express').NextFunction) => {
    ResponseUtil.success(res, null, 'Service updated successfully');
  })
);

router.delete('/:id',
  auditMiddleware.delete('services'),
  asyncHandler(async (_req: import('express').Request, res: import('express').Response, _next: import('express').NextFunction) => {
    ResponseUtil.success(res, null, 'Service deleted successfully');
  })
);

export default router;