import { Router } from 'express';
import { authenticate } from '@/middleware/auth';
import { auditMiddleware } from '@/middleware/audit';
import { ResponseUtil } from '@/utils/response';
import { asyncHandler } from '@/middleware/errorHandler';

const router = Router();

router.use(authenticate);

router.get('/', 
  auditMiddleware.list('clients'),
  asyncHandler(async (req, res) => {
    ResponseUtil.success(res, [], 'Clients retrieved successfully');
  })
);

router.post('/',
  auditMiddleware.create('clients'),
  asyncHandler(async (req, res) => {
    ResponseUtil.success(res, null, 'Client created successfully', 201);
  })
);

router.get('/:id',
  auditMiddleware.read('clients'),
  asyncHandler(async (req, res) => {
    ResponseUtil.success(res, null, 'Client retrieved successfully');
  })
);

router.put('/:id',
  auditMiddleware.update('clients'),
  asyncHandler(async (req, res) => {
    ResponseUtil.success(res, null, 'Client updated successfully');
  })
);

router.delete('/:id',
  auditMiddleware.delete('clients'),
  asyncHandler(async (req, res) => {
    ResponseUtil.success(res, null, 'Client deleted successfully');
  })
);

export default router;