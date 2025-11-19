import { Router } from 'express';
import { settingsController } from '@/controllers/settings.controller';
import { authenticate } from '@/middlewares/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get company settings (must be before /:key)
router.get('/company', settingsController.getCompany);

// Update company settings (must be before /:key)
router.put('/company', settingsController.updateCompany);

// Update multiple settings (must be before /:key)
router.post('/bulk', settingsController.updateBulk);

// List all settings
router.get('/', settingsController.list);

// Get setting by key
router.get('/:key', settingsController.get);

// Create or update setting
router.put('/:key', settingsController.upsert);

// Delete setting
router.delete('/:key', settingsController.delete);

export default router;
