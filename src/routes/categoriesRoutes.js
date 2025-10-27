import express from 'express';
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoriesController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import Joi from 'joi';

const router = express.Router();

// Validation schemas
const categorySchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  slug: Joi.string()
    .min(2)
    .max(100)
    .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .required()
    .messages({
      'string.pattern.base': 'Slug must be lowercase letters, numbers, and hyphens only',
    }),
  description: Joi.string().max(500).allow('', null),
  parent_id: Joi.number().integer().positive().allow(null),
  metadata: Joi.object().allow(null),
});

const updateCategorySchema = Joi.object({
  name: Joi.string().min(2).max(100),
  slug: Joi.string()
    .min(2)
    .max(100)
    .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: Joi.string().max(500).allow('', null),
  parent_id: Joi.number().integer().positive().allow(null),
  metadata: Joi.object().allow(null),
}).min(1);

const getCategoriesSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(50),
  parent_id: Joi.number().integer().positive(),
  include_article_count: Joi.string().valid('true', 'false').default('true'),
});

const getCategorySchema = Joi.object({
  include_children: Joi.string().valid('true', 'false').default('false'),
  include_articles: Joi.string().valid('true', 'false').default('false'),
});

// Public routes
router.get(
  '/',
  validate({ query: getCategoriesSchema }),
  getCategories
);

router.get(
  '/:id',
  validate({ query: getCategorySchema }),
  getCategory
);

// Protected routes (Admin/Editor only)
router.post(
  '/',
  authenticate,
  authorize('admin', 'editor'),
  validate({ body: categorySchema }),
  createCategory
);

router.put(
  '/:id',
  authenticate,
  authorize('admin', 'editor'),
  validate({ body: updateCategorySchema }),
  updateCategory
);

// Admin only
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  deleteCategory
);

export default router;
