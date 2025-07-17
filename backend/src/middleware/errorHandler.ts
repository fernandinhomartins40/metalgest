import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ResponseUtil } from '../utils/response';
import { logger } from '../config/logger';
import { env } from '../config/env';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response
) => {
  let statusCode = 500;
  let message = 'Internal server error';
  let details: any = undefined;

  // Log the error
  logger.error('Error occurred:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    user: (req as any).user?.id,
  });

  // Handle different types of errors
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const { statusCode: code, message: msg, details: det } = handlePrismaError(error);
    statusCode = code;
    message = msg;
    details = det;
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = 'Invalid data provided';
    details = error.message;
  } else if (error instanceof Prisma.PrismaClientRustPanicError) {
    statusCode = 500;
    message = 'Database connection error';
  } else if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation error';
    details = error.message;
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  } else if (error.name === 'SyntaxError') {
    statusCode = 400;
    message = 'Invalid JSON payload';
  }

  // Don't expose internal errors in production
  if (env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'Internal server error';
    details = undefined;
  }

  ResponseUtil.error(res, {
    code: getErrorCode(statusCode),
    message,
    details,
    stack: env.NODE_ENV === 'development' ? error.stack : undefined,
  }, statusCode);
};

const handlePrismaError = (error: Prisma.PrismaClientKnownRequestError) => {
  let statusCode = 500;
  let message = 'Database error';
  let details: any = undefined;

  switch (error.code) {
    case 'P2002':
      statusCode = 409;
      message = 'Unique constraint violation';
      details = `The ${error.meta?.target} already exists`;
      break;
    case 'P2003':
      statusCode = 400;
      message = 'Foreign key constraint violation';
      details = 'Referenced record does not exist';
      break;
    case 'P2004':
      statusCode = 400;
      message = 'Constraint violation';
      details = error.message;
      break;
    case 'P2025':
      statusCode = 404;
      message = 'Record not found';
      details = 'The requested resource was not found';
      break;
    case 'P2014':
      statusCode = 400;
      message = 'Invalid relation';
      details = 'The change would violate a relation';
      break;
    case 'P2000':
      statusCode = 400;
      message = 'Value too long';
      details = 'The provided value is too long for the field';
      break;
    case 'P2001':
      statusCode = 400;
      message = 'Record not found';
      details = 'The record searched for in the where condition does not exist';
      break;
    case 'P2015':
      statusCode = 404;
      message = 'Related record not found';
      details = 'A related record could not be found';
      break;
    case 'P2016':
      statusCode = 400;
      message = 'Query interpretation error';
      details = 'Query interpretation error';
      break;
    case 'P2017':
      statusCode = 400;
      message = 'Records not connected';
      details = 'The records for relation are not connected';
      break;
    case 'P2018':
      statusCode = 400;
      message = 'Required connected records not found';
      details = 'The required connected records were not found';
      break;
    case 'P2019':
      statusCode = 400;
      message = 'Input error';
      details = 'Input error';
      break;
    case 'P2020':
      statusCode = 400;
      message = 'Value out of range';
      details = 'Value out of range for the type';
      break;
    default:
      statusCode = 500;
      message = 'Database error';
      details = env.NODE_ENV === 'development' ? error.message : undefined;
  }

  return { statusCode, message, details };
};

const getErrorCode = (statusCode: number): string => {
  switch (statusCode) {
    case 400:
      return 'BAD_REQUEST';
    case 401:
      return 'UNAUTHORIZED';
    case 403:
      return 'FORBIDDEN';
    case 404:
      return 'NOT_FOUND';
    case 409:
      return 'CONFLICT';
    case 422:
      return 'VALIDATION_ERROR';
    case 429:
      return 'TOO_MANY_REQUESTS';
    case 500:
      return 'INTERNAL_ERROR';
    default:
      return 'UNKNOWN_ERROR';
  }
};

export const notFoundHandler = (req: Request, res: Response) => {
  ResponseUtil.notFound(res, `Route ${req.originalUrl} not found`);
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default { errorHandler, notFoundHandler, asyncHandler, AppError };