import { Router } from 'express';
import { usersController } from '@/controllers/users.controller';
import { authenticate, authorize } from '@/middlewares/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// List users - admin only
router.get('/', authorize('ADMIN'), usersController.list);

// Get user by ID - admin only
router.get('/:id', authorize('ADMIN'), usersController.get);

// Create new user - admin only
router.post('/', authorize('ADMIN'), usersController.create);

// Update user - admin only
router.put('/:id', authorize('ADMIN'), usersController.update);

// Reset password - admin only
router.post('/:id/reset-password', authorize('ADMIN'), usersController.resetPassword);

// Delete user - admin only
router.delete('/:id', authorize('ADMIN'), usersController.delete);

// Get user statistics - admin only
router.get('/:id/stats', authorize('ADMIN'), usersController.stats);

export default router;
