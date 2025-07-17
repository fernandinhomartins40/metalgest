import rateLimit from 'express-rate-limit';
import { env } from '@/config/env';
import { ResponseUtil } from '@/utils/response';

// General rate limiter
export const generalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    ResponseUtil.tooManyRequests(res, 'Too many requests');
  },
});

// Strict rate limiter for authentication
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: (req, res) => {
    ResponseUtil.tooManyRequests(
      res,
      'Too many authentication attempts, please try again later'
    );
  },
});

// Password reset rate limiter
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts per hour
  message: 'Too many password reset attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    ResponseUtil.tooManyRequests(
      res,
      'Too many password reset attempts, please try again later'
    );
  },
});

// File upload rate limiter
export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 uploads per window
  message: 'Too many file uploads, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    ResponseUtil.tooManyRequests(
      res,
      'Too many file uploads, please try again later'
    );
  },
});

// API rate limiter for heavy operations
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  message: 'Too many API requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    ResponseUtil.tooManyRequests(res, 'Too many API requests');
  },
});

export default {
  generalLimiter,
  authLimiter,
  passwordResetLimiter,
  uploadLimiter,
  apiLimiter,
};