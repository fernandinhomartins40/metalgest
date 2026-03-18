import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '@/middlewares/error';
import { uploadService } from '@/services/upload.service';

export class UploadController {
  uploadLogo = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const file = uploadService.uploadLogo(req.file);
    res.status(201).json(file);
  });

  uploadDocument = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const file = uploadService.uploadDocument(req.file);
    res.status(201).json(file);
  });
}

export const uploadController = new UploadController();
