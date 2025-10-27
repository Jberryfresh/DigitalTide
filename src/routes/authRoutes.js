/**
 * Authentication Routes
 * Routes for user authentication and authorization
 */

import express from 'express';
import Joi from 'joi';
import * as authController from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';
import { authLimiter, apiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

/**
 * Validation schemas
 */
const registerSchema = Joi.object({
  body: Joi.object({
    email: schemas.email,
    password: schemas.password,
    firstName: Joi.string().min(1).max(100).optional(),
    lastName: Joi.string().min(1).max(100).optional(),
  }),
});

const loginSchema = Joi.object({
  body: Joi.object({
    email: schemas.email,
    password: Joi.string().required(),
  }),
});

const refreshSchema = Joi.object({
  body: Joi.object({
    refreshToken: Joi.string().required(),
  }),
});

const logoutSchema = Joi.object({
  body: Joi.object({
    refreshToken: Joi.string().optional(),
  }),
});

/**
 * Routes
 */

// POST /api/v1/auth/register - Register new user
router.post('/register', authLimiter, validate(registerSchema), authController.register);

// POST /api/v1/auth/login - Login user
router.post('/login', authLimiter, validate(loginSchema), authController.login);

// POST /api/v1/auth/refresh - Refresh access token
router.post('/refresh', apiLimiter, validate(refreshSchema), authController.refresh);

// POST /api/v1/auth/logout - Logout user
router.post('/logout', apiLimiter, validate(logoutSchema), authController.logout);

// POST /api/v1/auth/logout-all - Logout from all devices (requires authentication)
router.post('/logout-all', apiLimiter, authenticate, authController.logoutAll);

// GET /api/v1/auth/me - Get current user profile (requires authentication)
router.get('/me', apiLimiter, authenticate, authController.getMe);

export default router;
