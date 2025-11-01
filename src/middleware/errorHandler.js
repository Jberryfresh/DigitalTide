/**
 * Global Error Handler Middleware
 * Catches all errors and returns consistent JSON responses
 */

import config from '../config/index.js';

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  constructor(statusCode, message, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error handler middleware
 */
export const errorHandler = (err, req, res, next) => {
  let { statusCode, message, errors } = err;

  // Default to 500 if no status code
  statusCode = statusCode || 500;

  // Default message for 500 errors
  if (statusCode === 500 && !message) {
    message = 'Internal Server Error';
  }

  // Log error in development
  if (config.app.env === 'development') {
    console.error('🔴 Error:', {
      statusCode,
      message,
      errors,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
    });
  }

  // Build error response
  const response = {
    success: false,
    statusCode,
    message,
    ...(errors && { errors }),
    ...(config.app.env === 'development' && { stack: err.stack }),
  };

  res.status(statusCode).json(response);
};

/**
 * 404 Not Found handler
 */
export const notFound = (req, res, next) => {
  const error = new ApiError(404, `Route ${req.originalUrl} not found`);
  next(error);
};

/**
 * Async handler wrapper to catch async errors
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default {
  ApiError, errorHandler, notFound, asyncHandler,
};
