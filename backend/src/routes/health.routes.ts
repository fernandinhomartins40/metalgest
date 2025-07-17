import { Router } from 'express';
import { ResponseUtil } from '@/utils/response';
import { asyncHandler } from '@/middleware/errorHandler';
import { prisma } from '@/config/database';
import { env } from '@/config/env';

const router = Router();

router.get('/',
  asyncHandler(async (req, res) => {
    ResponseUtil.success(res, {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: env.NODE_ENV,
      version: env.API_VERSION,
    }, 'Health check successful');
  })
);

router.get('/detailed',
  asyncHandler(async (req, res) => {
    const startTime = Date.now();
    
    try {
      // Test database connection
      await prisma.$queryRaw`SELECT 1`;
      const dbLatency = Date.now() - startTime;
      
      const healthData = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: env.NODE_ENV,
        version: env.API_VERSION,
        memory: process.memoryUsage(),
        database: {
          status: 'connected',
          latency: dbLatency,
        },
        system: {
          platform: process.platform,
          arch: process.arch,
          nodeVersion: process.version,
          pid: process.pid,
        },
      };
      
      ResponseUtil.success(res, healthData, 'Detailed health check successful');
    } catch (error) {
      const healthData = {
        status: 'ERROR',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: env.NODE_ENV,
        version: env.API_VERSION,
        database: {
          status: 'disconnected',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };
      
      ResponseUtil.error(res, {
        code: 'HEALTH_CHECK_FAILED',
        message: 'Health check failed',
        details: healthData,
      }, 503);
    }
  })
);

export default router;