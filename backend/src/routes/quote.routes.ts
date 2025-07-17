import { Router } from 'express';
import { authenticate, optionalAuth } from '@/middleware/auth';
import { auditMiddleware } from '@/middleware/audit';
import { ResponseUtil } from '@/utils/response';
import { asyncHandler } from '@/middleware/errorHandler';

const router = Router();

// Public route for quote access
router.get('/public/:token',
  optionalAuth,
  asyncHandler(async (req, res) => {
    ResponseUtil.success(res, null, 'Public quote retrieved successfully');
  })
);

router.put('/public/:token/response',
  asyncHandler(async (req, res) => {
    ResponseUtil.success(res, null, 'Quote response updated successfully');
  })
);

// Protected routes
router.use(authenticate);

router.get('/', 
  auditMiddleware.list('quotes'),
  asyncHandler(async (req, res) => {
    ResponseUtil.success(res, [], 'Quotes retrieved successfully');
  })
);

router.post('/',
  auditMiddleware.create('quotes'),
  asyncHandler(async (req, res) => {
    ResponseUtil.success(res, null, 'Quote created successfully', 201);
  })
);

router.get('/:id',
  auditMiddleware.read('quotes'),
  asyncHandler(async (req, res) => {
    ResponseUtil.success(res, null, 'Quote retrieved successfully');
  })
);

router.put('/:id',
  auditMiddleware.update('quotes'),
  asyncHandler(async (req, res) => {
    ResponseUtil.success(res, null, 'Quote updated successfully');
  })
);

router.delete('/:id',
  auditMiddleware.delete('quotes'),
  asyncHandler(async (req, res) => {
    ResponseUtil.success(res, null, 'Quote deleted successfully');
  })
);

router.post('/:id/duplicate',
  auditMiddleware.custom('duplicate', 'quotes'),
  asyncHandler(async (req, res) => {
    ResponseUtil.success(res, null, 'Quote duplicated successfully');
  })
);

router.post('/:id/public-link',
  auditMiddleware.custom('generate_public_link', 'quotes'),
  asyncHandler(async (req, res) => {
    ResponseUtil.success(res, null, 'Public link generated successfully');
  })
);

router.post('/:id/pdf',
  auditMiddleware.custom('generate_pdf', 'quotes'),
  asyncHandler(async (req, res) => {
    ResponseUtil.success(res, null, 'PDF generated successfully');
  })
);

export default router;