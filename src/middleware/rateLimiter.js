/**
 * Rate Limiting Middleware
 * Protects API endpoints from abuse with configurable rate limits
 */

import rateLimit from 'express-rate-limit';
import config from '../config/index.js';

/**
 * General API rate limiter
 * Applies to most public endpoints
 */
export const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs, // 1 hour by default
  max: config.rateLimit.maxRequests, // 1000 requests per hour by default
  message: {
    success: false,
    error: {
      message: 'Too many requests from this IP, please try again later.',
      code: 'RATE_LIMIT_EXCEEDED',
    },
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  // Skip successful requests if needed
  skipSuccessfulRequests: false,
  // Skip failed requests if needed
  skipFailedRequests: false,
});

/**
 * Strict rate limiter for authentication endpoints
 * Prevents brute force attacks on login/register
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per 15 minutes
  message: {
    success: false,
    error: {
      message: 'Too many authentication attempts, please try again after 15 minutes.',
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
});

/**
 * Moderate rate limiter for content creation
 * Prevents spam while allowing legitimate content creation
 */
export const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 creates per hour
  message: {
    success: false,
    error: {
      message: 'Too many creation requests, please try again later.',
      code: 'CREATE_RATE_LIMIT_EXCEEDED',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Lenient rate limiter for search endpoints
 * Allows more frequent searches for good UX
 */
export const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 searches per minute
  message: {
    success: false,
    error: {
      message: 'Too many search requests, please slow down.',
      code: 'SEARCH_RATE_LIMIT_EXCEEDED',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Strict rate limiter for password reset
 * Prevents abuse of password reset functionality
 */
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts per hour
  message: {
    success: false,
    error: {
      message: 'Too many password reset requests, please try again later.',
      code: 'PASSWORD_RESET_RATE_LIMIT_EXCEEDED',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Admin rate limiter
 * More lenient for authenticated admin operations
 */
export const adminLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.adminMax || 10000, // 10x normal limit
  message: {
    success: false,
    error: {
      message: 'Admin rate limit exceeded.',
      code: 'ADMIN_RATE_LIMIT_EXCEEDED',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * News API rate limiter
 * Prevents excessive external API calls
 */
export const newsApiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: {
    success: false,
    error: {
      message: 'Too many news API requests, please try again shortly.',
      code: 'NEWS_API_RATE_LIMIT_EXCEEDED',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export default {
  apiLimiter,
  authLimiter,
  createLimiter,
  searchLimiter,
  passwordResetLimiter,
  adminLimiter,
  newsApiLimiter,
};
