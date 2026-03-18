import app from '@/app';
import { logger } from '@/utils/logger';
import { prisma } from '@/config/database';

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, closing server...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, closing server...');
  await prisma.$disconnect();
  process.exit(0);
});

const server = app.listen(PORT, () => {
  logger.info(`MetalGest API Server running on http://${HOST}:${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});

export default server;
