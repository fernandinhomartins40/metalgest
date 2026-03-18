import { Router } from 'express';
import { uploadController } from '@/controllers/upload.controller';
import { documentUpload, logoUpload } from '@/config/upload';
import { authenticate, authorize } from '@/middlewares/auth';

const router = Router();

router.use(authenticate);
router.post('/logo', authorize('ADMIN', 'MANAGER'), logoUpload.single('file'), uploadController.uploadLogo);
router.post('/documents', documentUpload.single('file'), uploadController.uploadDocument);

export default router;
