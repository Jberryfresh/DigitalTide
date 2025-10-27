/**
 * Request Validation Middleware
 * Uses Joi for schema validation
 */

import Joi from 'joi';
import { ApiError } from './errorHandler.js';

/**
 * Validate request against Joi schema
 */
export const validate = (schema) => {
  return (req, res, next) => {
    const validationOptions = {
      abortEarly: false, // Return all errors
      allowUnknown: true, // Allow unknown keys in request
      stripUnknown: true, // Remove unknown keys
    };

    const { error, value } = schema.validate(
      {
        body: req.body,
        query: req.query,
        params: req.params,
      },
      validationOptions
    );

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      throw new ApiError(400, 'Validation Error', errors);
    }

    // Replace request data with validated data
    req.body = value.body || req.body;
    req.query = value.query || req.query;
    req.params = value.params || req.params;

    next();
  };
};

/**
 * Common validation schemas
 */
export const schemas = {
  // Pagination
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string(),
    order: Joi.string().valid('asc', 'desc').default('desc'),
  }),

  // ID parameter
  id: Joi.object({
    id: Joi.string().uuid().required(),
  }),

  // Email
  email: Joi.string().email().lowercase().required(),

  // Password
  password: Joi.string().min(8).max(128).required()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .messages({ 'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number' }),
};

export default { validate, schemas };
