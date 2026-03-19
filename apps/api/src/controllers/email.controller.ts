import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '@/middlewares/error';
import { emailService } from '@/services/email.service';

export class EmailController {
  ultrazendWebhook = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const signature = req.get('x-webhook-signature') || '';
    const rawBody = req.rawBody || JSON.stringify(req.body || {});
    const result = await emailService.processUltraZendWebhook(req.body, rawBody, signature);

    res.status(200).json({
      received: true,
      duplicate: result.duplicate,
    });
  });
}

export const emailController = new EmailController();
