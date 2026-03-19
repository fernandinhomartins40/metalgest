import { Router } from 'express';
import { emailController } from '@/controllers/email.controller';

const router = Router();

router.post('/webhooks/ultrazend', emailController.ultrazendWebhook);

export default router;
