import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { JwtUtil } from '../utils/jwt';
import { ResponseUtil } from '../utils/response';
import { prisma } from '../config/database';
import { logger } from '../config/logger';

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = JwtUtil.getTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      ResponseUtil.unauthorized(res, 'No token provided');
      return;
    }

    const payload = JwtUtil.verifyAccessToken(token);
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      ResponseUtil.unauthorized(res, 'Invalid token');
      return;
    }

    if (!user.active) {
      ResponseUtil.unauthorized(res, 'Account is disabled');
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    ResponseUtil.unauthorized(res, 'Invalid token');
  }
};

export const authorize = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      ResponseUtil.unauthorized(res, 'User not authenticated');
      return;
    }

    if (!roles.includes(req.user.role)) {
      ResponseUtil.forbidden(res, 'Insufficient permissions');
      return;
    }

    next();
  };
};

export const optionalAuth = async (
  req: AuthenticatedRequest,
  _: Response,
  next: NextFunction
) => {
  try {
    const token = JwtUtil.getTokenFromHeader(req.headers.authorization);
    
    if (token) {
      const payload = JwtUtil.verifyAccessToken(token);
      
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      });

      if (user && user.active) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Optional auth - continue without user
    next();
  }
};

export default { authenticate, authorize, optionalAuth };