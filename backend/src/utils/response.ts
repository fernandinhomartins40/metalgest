import { Response } from 'express';
import { ApiResponse, ApiError } from '@/types';

export class ResponseUtil {
  static success<T>(
    res: Response,
    data?: T,
    message?: string,
    statusCode: number = 200
  ): void {
    const response: ApiResponse<T> = {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    };
    res.status(statusCode).json(response);
  }

  static error(
    res: Response,
    error: ApiError,
    statusCode: number = 500
  ): void {
    const response: ApiResponse = {
      success: false,
      error,
      timestamp: new Date().toISOString(),
    };
    res.status(statusCode).json(response);
  }

  static validationError(
    res: Response,
    message: string,
    details?: any
  ): void {
    const error: ApiError = {
      code: 'VALIDATION_ERROR',
      message,
      details,
    };
    this.error(res, error, 400);
  }

  static notFound(
    res: Response,
    message: string = 'Resource not found'
  ): void {
    const error: ApiError = {
      code: 'NOT_FOUND',
      message,
    };
    this.error(res, error, 404);
  }

  static unauthorized(
    res: Response,
    message: string = 'Unauthorized access'
  ): void {
    const error: ApiError = {
      code: 'UNAUTHORIZED',
      message,
    };
    this.error(res, error, 401);
  }

  static forbidden(
    res: Response,
    message: string = 'Forbidden access'
  ): void {
    const error: ApiError = {
      code: 'FORBIDDEN',
      message,
    };
    this.error(res, error, 403);
  }

  static conflict(
    res: Response,
    message: string = 'Resource conflict'
  ): void {
    const error: ApiError = {
      code: 'CONFLICT',
      message,
    };
    this.error(res, error, 409);
  }

  static tooManyRequests(
    res: Response,
    message: string = 'Too many requests'
  ): void {
    const error: ApiError = {
      code: 'TOO_MANY_REQUESTS',
      message,
    };
    this.error(res, error, 429);
  }

  static internalError(
    res: Response,
    message: string = 'Internal server error',
    details?: any
  ): void {
    const error: ApiError = {
      code: 'INTERNAL_ERROR',
      message,
      details,
    };
    this.error(res, error, 500);
  }
}

export default ResponseUtil;