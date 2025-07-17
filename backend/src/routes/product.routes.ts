import { Router } from 'express';
import { authenticate } from '@/middleware/auth';
import { auditMiddleware } from '@/middleware/audit';
import { ResponseUtil } from '@/utils/response';
import { asyncHandler } from '@/middleware/errorHandler';

const router = Router();

// All product routes require authentication
router.use(authenticate);

// Get all products
router.get('/', 
  auditMiddleware.list('products'),
  asyncHandler(async (req, res) => {
    ResponseUtil.success(res, [], 'Products retrieved successfully');
  })
);

// Create product
router.post('/',
  auditMiddleware.create('products'),
  asyncHandler(async (req, res) => {
    ResponseUtil.success(res, null, 'Product created successfully', 201);
  })
);

// Get product by ID
router.get('/:id',
  auditMiddleware.read('products'),
  asyncHandler(async (req, res) => {
    ResponseUtil.success(res, null, 'Product retrieved successfully');
  })
);

// Update product
router.put('/:id',
  auditMiddleware.update('products'),
  asyncHandler(async (req, res) => {
    ResponseUtil.success(res, null, 'Product updated successfully');
  })
);

// Delete product
router.delete('/:id',
  auditMiddleware.delete('products'),
  asyncHandler(async (req, res) => {
    ResponseUtil.success(res, null, 'Product deleted successfully');
  })
);

// Search products
router.get('/search',
  auditMiddleware.search('products'),
  asyncHandler(async (req, res) => {
    ResponseUtil.success(res, [], 'Products search completed');
  })
);

export default router;