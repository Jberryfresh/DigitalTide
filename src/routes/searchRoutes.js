import express from 'express';
import Joi from 'joi';
import {
  searchArticles,
  getSearchSuggestions,
  getTrendingSearches,
  searchAll,
} from '../controllers/searchController.js';
import { validate } from '../middleware/validation.js';
import { searchLimiter, apiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Validation schemas
const searchArticlesSchema = Joi.object({
  query: Joi.object({
    q: Joi.string().min(1).required(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    status: Joi.string().valid('draft', 'published', 'archived').default('published'),
    category_id: Joi.number().integer().positive(),
    tag_id: Joi.number().integer().positive(),
    author_id: Joi.number().integer().positive(),
    source_id: Joi.number().integer().positive(),
    from_date: Joi.date().iso(),
    to_date: Joi.date().iso().greater(Joi.ref('from_date')),
    sort: Joi.string().valid('relevance', 'date', 'popularity').default('relevance'),
    min_reading_time: Joi.number().integer().min(0),
    max_reading_time: Joi.number().integer().positive().greater(Joi.ref('min_reading_time')),
  }),
});

const suggestionsSchema = Joi.object({
  query: Joi.object({
    q: Joi.string().min(2).required(),
    limit: Joi.number().integer().min(1).max(20).default(10),
  }),
});

const trendingSchema = Joi.object({
  query: Joi.object({
    limit: Joi.number().integer().min(1).max(50).default(10),
  }),
});

const searchAllSchema = Joi.object({
  query: Joi.object({
    q: Joi.string().min(1).required(),
    limit: Joi.number().integer().min(1).max(20).default(5),
  }),
});

// All search routes are public
router.get('/', searchLimiter, validate(searchArticlesSchema), searchArticles);

router.get('/suggestions', searchLimiter, validate(suggestionsSchema), getSearchSuggestions);

router.get('/trending', apiLimiter, validate(trendingSchema), getTrendingSearches);

router.get('/all', searchLimiter, validate(searchAllSchema), searchAll);

export default router;
