import { Router } from 'express';
import { authenticate, authorize } from '@/middleware/auth';
import { auditMiddleware } from '@/middleware/audit';
import { ResponseUtil } from '@/utils/response';
import { asyncHandler } from '@/middleware/errorHandler';

const router = Router();

// All user routes require authentication
router.use(authenticate);

// Get all users (admin only)
router.get('/', 
  authorize(['ADMIN']),
  auditMiddleware.list('users'),
  asyncHandler(async (_req: import('express').Request, res: import('express').Response, _next: import('express').NextFunction) => {
    ResponseUtil.success(res, [], 'Users retrieved successfully');
  })
);

// Create user (admin only)
router.post('/',
  authorize(['ADMIN']),
  auditMiddleware.create('users'),
  asyncHandler(async (_req: import('express').Request, res: import('express').Response, _next: import('express').NextFunction) => {
    ResponseUtil.success(res, null, 'User created successfully', 201);
  })
);

// Get user by ID
router.get('/:id',
  auditMiddleware.read('users'),
  asyncHandler(async (_req: import('express').Request, res: import('express').Response, _next: import('express').NextFunction) => {
    ResponseUtil.success(res, null, 'User retrieved successfully');
  })
);

// Update user
router.put('/:id',
  authorize(['ADMIN']),
  auditMiddleware.update('users'),
  asyncHandler(async (_req: import('express').Request, res: import('express').Response, _next: import('express').NextFunction) => {
    ResponseUtil.success(res, null, 'User updated successfully');
  })
);

// Delete user
router.delete('/:id',
  authorize(['ADMIN']),
  auditMiddleware.delete('users'),
  asyncHandler(async (_req: import('express').Request, res: import('express').Response, _next: import('express').NextFunction) => {
    ResponseUtil.success(res, null, 'User deleted successfully');
  })
);

export default router;