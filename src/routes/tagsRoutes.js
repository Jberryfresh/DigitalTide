import express from 'express';
import {
  getTags,
  getTag,
  createTag,
  updateTag,
  deleteTag,
  getPopularTags,
  searchTags,
} from '../controllers/tagsController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import Joi from 'joi';

const router = express.Router();

// Validation schemas
const tagSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  slug: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .required()
    .messages({
      'string.pattern.base': 'Slug must be lowercase letters, numbers, and hyphens only',
    }),
  description: Joi.string().max(500).allow('', null),
});

const updateTagSchema = Joi.object({
  name: Joi.string().min(2).max(50),
  slug: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: Joi.string().max(500).allow('', null),
}).min(1);

const getTagsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(50),
  min_usage: Joi.number().integer().min(0).default(0),
  sort: Joi.string().valid('name', 'usage', 'recent').default('name'),
});

const getTagSchema = Joi.object({
  include_articles: Joi.string().valid('true', 'false').default('false'),
});

const popularTagsSchema = Joi.object({
  limit: Joi.number().integer().min(1).max(100).default(20),
});

const searchTagsSchema = Joi.object({
  q: Joi.string().min(1).required(),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

// Public routes
router.get(
  '/popular',
  validate({ query: popularTagsSchema }),
  getPopularTags
);

router.get(
  '/search',
  validate({ query: searchTagsSchema }),
  searchTags
);

router.get(
  '/',
  validate({ query: getTagsSchema }),
  getTags
);

router.get(
  '/:id',
  validate({ query: getTagSchema }),
  getTag
);

// Protected routes (Admin/Editor only)
router.post(
  '/',
  authenticate,
  authorize('admin', 'editor'),
  validate({ body: tagSchema }),
  createTag
);

router.put(
  '/:id',
  authenticate,
  authorize('admin', 'editor'),
  validate({ body: updateTagSchema }),
  updateTag
);

// Admin only
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  deleteTag
);

export default router;
