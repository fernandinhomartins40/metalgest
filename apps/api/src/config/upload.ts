import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from '@/middlewares/error';

const uploadDir = path.resolve(process.cwd(), process.env.UPLOAD_DIR || 'uploads');
const logoDir = path.join(uploadDir, 'logos');
const documentDir = path.join(uploadDir, 'documents');
const maxFileSize = Number(process.env.MAX_FILE_SIZE || 10 * 1024 * 1024);

[uploadDir, logoDir, documentDir].forEach((directory) => {
  fs.mkdirSync(directory, { recursive: true });
});

const createStorage = (destination: string) =>
  multer.diskStorage({
    destination: (_req, _file, callback) => {
      callback(null, destination);
    },
    filename: (_req, file, callback) => {
      const extension = path.extname(file.originalname || '');
      callback(null, `${uuidv4()}${extension}`);
    },
  });

const createUploader = (destination: string, allowedMimeTypes: string[]) =>
  multer({
    storage: createStorage(destination),
    limits: { fileSize: maxFileSize },
    fileFilter: (_req, file, callback) => {
      if (!allowedMimeTypes.includes(file.mimetype)) {
        callback(new AppError(400, 'Invalid file type', 'INVALID_FILE_TYPE'));
        return;
      }

      callback(null, true);
    },
  });

export const logoUpload = createUploader(logoDir, [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/svg+xml',
]);

export const documentUpload = createUploader(documentDir, [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
]);

export const uploadsPublicBasePath = '/api/uploads';
export { uploadDir };
