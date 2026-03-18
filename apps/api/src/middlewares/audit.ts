import { Request, Response, NextFunction } from 'express';
import { auditService } from '@/services/audit.service';
import { logger } from '@/utils/logger';

const auditableMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const hiddenKeys = new Set([
  'password',
  'currentPassword',
  'newPassword',
  'confirmPassword',
  'refreshToken',
  'accessToken',
  'authorization',
  'token',
]);

const sanitize = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map((item) => sanitize(item));
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  return Object.entries(value as Record<string, unknown>).reduce<Record<string, unknown>>(
    (result, [key, currentValue]) => {
      result[key] = hiddenKeys.has(key) ? '[REDACTED]' : sanitize(currentValue);
      return result;
    },
    {}
  );
};

const extractModuleName = (url: string) => {
  const [pathname] = url.split('?');
  const cleanedPath = pathname.replace(/^\/api\/?/, '');
  return cleanedPath ? cleanedPath.split('/')[0] || 'system' : 'system';
};

const mapAction = (method: string) => {
  if (method === 'POST') return 'CREATE';
  if (method === 'PUT') return 'UPDATE';
  if (method === 'PATCH') return 'PATCH';
  if (method === 'DELETE') return 'DELETE';
  return method;
};

export const auditMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!auditableMethods.has(req.method)) {
    next();
    return;
  }

  const startedAt = Date.now();

  res.on('finish', () => {
    const module = extractModuleName(req.originalUrl);

    if (module === 'health') {
      return;
    }

    void auditService
      .record({
        userId: req.user?.id,
        action: mapAction(req.method),
        module,
        details: {
          path: req.originalUrl,
          method: req.method,
          statusCode: res.statusCode,
          durationMs: Date.now() - startedAt,
          params: sanitize(req.params),
          query: sanitize(req.query),
          body: sanitize(req.body),
        },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      })
      .catch((error) => {
        logger.error('Failed to write audit log', {
          error: error instanceof Error ? error.message : String(error),
          path: req.originalUrl,
        });
      });
  });

  next();
};
