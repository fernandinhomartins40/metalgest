import path from 'path';
import { uploadsPublicBasePath } from '@/config/upload';
import { AppError } from '@/middlewares/error';

type UploadedFile = Express.Multer.File | undefined;

export class UploadService {
  private buildResponse(folder: string, file: UploadedFile) {
    if (!file) {
      throw new AppError(400, 'File is required', 'FILE_REQUIRED');
    }

    return {
      url: `${uploadsPublicBasePath}/${folder}/${file.filename}`,
      filename: file.originalname,
      storedFilename: file.filename,
      extension: path.extname(file.originalname || '').replace('.', ''),
      size: file.size,
      mimeType: file.mimetype,
    };
  }

  uploadLogo(file: UploadedFile) {
    return this.buildResponse('logos', file);
  }

  uploadDocument(file: UploadedFile) {
    return this.buildResponse('documents', file);
  }
}

export const uploadService = new UploadService();
