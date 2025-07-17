import { Router } from 'express';
import { authController } from '@/controllers/auth.controller';
import { authenticate } from '@/middleware/auth';
import { authLimiter, passwordResetLimiter } from '@/middleware/rateLimiter';
import { auditMiddleware } from '@/middleware/audit';
import { validateSchema } from '@/utils/validation';
import { authSchemas } from '@/utils/validationSchemas';

const router = Router();

// Public routes
router.post('/login', 
  authLimiter,
  validateSchema(authSchemas.login),
  auditMiddleware.login(),
  authController.login
);

router.post('/register',
  authLimiter,
  validateSchema(authSchemas.register),
  auditMiddleware.register(),
  authController.register
);

router.post('/refresh-token',
  authLimiter,
  validateSchema(authSchemas.refreshToken),
  authController.refreshToken
);

router.post('/logout',
  validateSchema(authSchemas.refreshToken),
  auditMiddleware.logout(),
  authController.logout
);

router.post('/request-password-reset',
  passwordResetLimiter,
  validateSchema(authSchemas.requestPasswordReset),
  authController.requestPasswordReset
);

router.post('/reset-password',
  passwordResetLimiter,
  validateSchema(authSchemas.resetPassword),
  auditMiddleware.resetPassword(),
  authController.resetPassword
);

router.post('/verify-email',
  validateSchema(authSchemas.verifyEmail),
  authController.verifyEmail
);

// Protected routes
router.get('/me',
  authenticate,
  authController.getCurrentUser
);

router.put('/profile',
  authenticate,
  validateSchema(authSchemas.updateProfile),
  auditMiddleware.custom('update_profile', 'auth'),
  authController.updateProfile
);

router.put('/change-password',
  authenticate,
  validateSchema(authSchemas.changePassword),
  auditMiddleware.custom('change_password', 'auth'),
  authController.changePassword
);

export default router;