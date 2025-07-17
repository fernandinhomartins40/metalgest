import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '@/types';
import { prisma } from '@/config/database';
import { logger } from '@/config/logger';

export const auditLog = (action: string, module: string) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const originalSend = res.send;
      
      res.send = function (data) {
        // Log the action after response
        if (req.user && res.statusCode < 400) {
          logAuditEntry(req, action, module, data);
        }
        return originalSend.call(this, data);
      };
      
      next();
    } catch (error) {
      logger.error('Audit middleware error:', error);
      next();
    }
  };
};

const logAuditEntry = async (
  req: AuthenticatedRequest,
  action: string,
  module: string,
  responseData?: any
) => {
  try {
    const details: any = {
      method: req.method,
      url: req.url,
      body: req.body,
      query: req.query,
      params: req.params,
    };

    // Add response data for certain actions
    if (action === 'create' || action === 'update' || action === 'delete') {
      try {
        const parsedData = JSON.parse(responseData);
        if (parsedData.data) {
          details.resourceId = parsedData.data.id;
        }
      } catch (e) {
        // Ignore parsing errors
      }
    }

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action,
        module,
        details,
        ipAddress: getClientIP(req),
        userAgent: req.get('User-Agent') || null,
      },
    });
  } catch (error) {
    logger.error('Failed to create audit log:', error);
  }
};

const getClientIP = (req: Request): string => {
  return (
    req.headers['x-forwarded-for'] as string ||
    req.headers['x-real-ip'] as string ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    'unknown'
  );
};

export const auditMiddleware = {
  // Common audit actions
  list: (module: string) => auditLog('list', module),
  create: (module: string) => auditLog('create', module),
  read: (module: string) => auditLog('read', module),
  update: (module: string) => auditLog('update', module),
  delete: (module: string) => auditLog('delete', module),
  search: (module: string) => auditLog('search', module),
  
  // Authentication actions
  login: () => auditLog('login', 'auth'),
  logout: () => auditLog('logout', 'auth'),
  register: () => auditLog('register', 'auth'),
  resetPassword: () => auditLog('reset_password', 'auth'),
  
  // Custom actions
  custom: (action: string, module: string) => auditLog(action, module),
};

export default auditMiddleware;