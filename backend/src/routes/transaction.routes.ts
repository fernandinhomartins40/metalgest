import { Router } from 'express';
import { authenticate } from '@/middleware/auth';
import { auditMiddleware } from '@/middleware/audit';
import { ResponseUtil } from '@/utils/response';
import { asyncHandler } from '@/middleware/errorHandler';

const router = Router();

router.use(authenticate);

router.get('/', 
  auditMiddleware.list('transactions'),
  asyncHandler(async (_req: import('express').Request, res: import('express').Response, _next: import('express').NextFunction) => {
    ResponseUtil.success(res, [], 'Transactions retrieved successfully');
  })
);

router.post('/',
  auditMiddleware.create('transactions'),
  asyncHandler(async (_req: import('express').Request, res: import('express').Response, _next: import('express').NextFunction) => {
    ResponseUtil.success(res, null, 'Transaction created successfully', 201);
  })
);

router.get('/:id',
  auditMiddleware.read('transactions'),
  asyncHandler(async (_req: import('express').Request, res: import('express').Response, _next: import('express').NextFunction) => {
    ResponseUtil.success(res, null, 'Transaction retrieved successfully');
  })
);

router.put('/:id',
  auditMiddleware.update('transactions'),
  asyncHandler(async (_req: import('express').Request, res: import('express').Response, _next: import('express').NextFunction) => {
    ResponseUtil.success(res, null, 'Transaction updated successfully');
  })
);

router.delete('/:id',
  auditMiddleware.delete('transactions'),
  asyncHandler(async (_req: import('express').Request, res: import('express').Response, _next: import('express').NextFunction) => {
    ResponseUtil.success(res, null, 'Transaction deleted successfully');
  })
);

router.get('/summary',
  auditMiddleware.custom('get_summary', 'transactions'),
  asyncHandler(async (_req: import('express').Request, res: import('express').Response, _next: import('express').NextFunction) => {
    ResponseUtil.success(res, null, 'Financial summary retrieved successfully');
  })
);

router.get('/balance',
  auditMiddleware.custom('get_balance', 'transactions'),
  asyncHandler(async (_req: import('express').Request, res: import('express').Response, _next: import('express').NextFunction) => {
    ResponseUtil.success(res, null, 'Balance retrieved successfully');
  })
);

export default router;