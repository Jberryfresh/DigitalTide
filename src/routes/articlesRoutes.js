/**
 * Articles Routes
 * Routes for article CRUD operations
 */

import express from 'express';
import Joi from 'joi';
import * as articlesController from '../controllers/articlesController.js';
import { authenticate, authorize, optionalAuth } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';
import { apiLimiter, createLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

/**
 * Validation schemas
 */
const getArticlesSchema = Joi.object({
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    status: Joi.string()
      .valid('draft', 'pending_review', 'approved', 'published', 'archived')
      .optional(),
    category: Joi.string().uuid().optional(),
    tag: Joi.string().uuid().optional(),
    search: Joi.string().optional(),
    sortBy: Joi.string()
      .valid('published_at', 'created_at', 'view_count', 'quality_score')
      .default('published_at'),
    order: Joi.string().valid('asc', 'desc', 'ASC', 'DESC').default('desc'),
  }),
});

const createArticleSchema = Joi.object({
  body: Joi.object({
    title: Joi.string().min(1).max(500).required(),
    slug: Joi.string()
      .min(1)
      .max(500)
      .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .required(),
    content: Joi.string().min(1).required(),
    summary: Joi.string().max(1000).optional(),
    featuredImageUrl: Joi.string().uri().optional(),
    categoryId: Joi.string().uuid().optional(),
    tags: Joi.array().items(Joi.string().uuid()).optional(),
    status: Joi.string().valid('draft', 'pending_review', 'approved', 'published').default('draft'),
    metadata: Joi.object().optional(),
  }),
});

const updateArticleSchema = Joi.object({
  params: schemas.id,
  body: Joi.object({
    title: Joi.string().min(1).max(500).optional(),
    slug: Joi.string()
      .min(1)
      .max(500)
      .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .optional(),
    content: Joi.string().min(1).optional(),
    summary: Joi.string().max(1000).optional(),
    featuredImageUrl: Joi.string().uri().allow(null).optional(),
    categoryId: Joi.string().uuid().allow(null).optional(),
    tags: Joi.array().items(Joi.string().uuid()).optional(),
    status: Joi.string()
      .valid('draft', 'pending_review', 'approved', 'published', 'archived')
      .optional(),
    metadata: Joi.object().optional(),
  }),
});

const articleIdSchema = Joi.object({
  params: Joi.object({
    id: Joi.alternatives()
      .try(Joi.string().uuid(), Joi.string().pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/))
      .required(),
  }),
});

/**
 * Routes
 */

// GET /api/v1/articles - Get all articles (public with optional auth)
router.get(
  '/',
  apiLimiter,
  optionalAuth,
  validate(getArticlesSchema),
  articlesController.getArticles
);

// GET /api/v1/articles/:id - Get single article (public with optional auth)
router.get(
  '/:id',
  apiLimiter,
  optionalAuth,
  validate(articleIdSchema),
  articlesController.getArticle
);

// POST /api/v1/articles - Create article (requires authentication)
router.post(
  '/',
  createLimiter,
  authenticate,
  validate(createArticleSchema),
  articlesController.createArticle
);

// PUT /api/v1/articles/:id - Update article (requires authentication)
router.put(
  '/:id',
  createLimiter,
  authenticate,
  validate(updateArticleSchema),
  articlesController.updateArticle
);

// DELETE /api/v1/articles/:id - Delete article (requires authentication)
router.delete(
  '/:id',
  apiLimiter,
  authenticate,
  validate(articleIdSchema),
  articlesController.deleteArticle
);

export default router;
