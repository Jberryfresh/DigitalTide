/**
 * News Routes
 * API endpoints for news fetching, search, and AI analysis
 */

import express from 'express';
import * as newsController from '../controllers/newsController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Public endpoints - No authentication required

/**
 * GET /api/v1/news/fetch
 * Fetch news from multiple sources
 * Query params: query, category, country, language, limit, sources, useCache
 */
router.get('/fetch', newsController.fetchNews);

/**
 * GET /api/v1/news/breaking
 * Fetch breaking news
 * Query params: limit
 */
router.get('/breaking', newsController.fetchBreakingNews);

/**
 * GET /api/v1/news/category/:category
 * Fetch news by category
 * Params: category
 * Query params: limit
 */
router.get('/category/:category', newsController.fetchByCategory);

/**
 * GET /api/v1/news/search
 * Search news articles
 * Query params: q (required), limit
 */
router.get('/search', newsController.searchNews);

/**
 * GET /api/v1/news/sources
 * Get available news sources and their status
 */
router.get('/sources', newsController.getSources);

/**
 * GET /api/v1/news/health
 * Check health status of all news sources
 */
router.get('/health', newsController.getHealth);

/**
 * GET /api/v1/news/cache/stats
 * Get cache statistics
 */
router.get('/cache/stats', newsController.getCacheStats);

// Protected endpoints - Require authentication

/**
 * POST /api/v1/news/analyze
 * Comprehensive AI analysis of an article
 * Body: { title, content, url, includeSummary, includeSentiment, includeKeyPoints, includeCategory, includeEntities, includeTags }
 */
router.post('/analyze', authenticate, newsController.analyzeArticle);

/**
 * POST /api/v1/news/summarize
 * Generate article summary
 * Body: { title, content, maxLength }
 */
router.post('/summarize', authenticate, newsController.summarizeArticle);

/**
 * POST /api/v1/news/sentiment
 * Analyze article sentiment
 * Body: { title, content }
 */
router.post('/sentiment', authenticate, newsController.analyzeSentiment);

/**
 * POST /api/v1/news/key-points
 * Extract key points from article
 * Body: { title, content, maxPoints }
 */
router.post('/key-points', authenticate, newsController.extractKeyPoints);

/**
 * POST /api/v1/news/categorize
 * Categorize article
 * Body: { title, content, availableCategories }
 */
router.post('/categorize', authenticate, newsController.categorizeArticle);

/**
 * POST /api/v1/news/tags
 * Generate article tags
 * Body: { title, content, maxTags }
 */
router.post('/tags', authenticate, newsController.generateTags);

/**
 * DELETE /api/v1/news/cache
 * Invalidate all news cache
 * Requires authentication
 */
router.delete('/cache', authenticate, newsController.invalidateCache);

/**
 * POST /api/v1/news/fetch-and-save
 * Fetch news and save to database with AI enrichment
 * Body: { query, category, country, language, limit, enrichWithAI, autoPublish }
 * Requires authentication
 */
router.post('/fetch-and-save', authenticate, newsController.fetchAndSave);

/**
 * POST /api/v1/news/save
 * Save articles to database
 * Body: { articles[], enrichWithAI, autoPublish }
 * Requires authentication
 */
router.post('/save', authenticate, newsController.saveArticles);

/**
 * GET /api/v1/news/storage/stats
 * Get storage statistics
 */
router.get('/storage/stats', newsController.getStorageStats);

/**
 * POST /api/v1/news/jobs/trigger
 * Manually trigger a background job
 * Body: { jobName: 'news-fetch' | 'cache-cleanup' | 'quota-reset' }
 * Requires authentication
 */
router.post('/jobs/trigger', authenticate, newsController.triggerJob);

/**
 * GET /api/v1/news/jobs/stats
 * Get job scheduler statistics
 * Requires authentication
 */
router.get('/jobs/stats', authenticate, newsController.getJobStats);

/**
 * GET /api/v1/news/mcp/health
 * Get MCP servers health status
 */
router.get('/mcp/health', newsController.getMCPHealth);

/**
 * GET /api/v1/news/mcp/stats
 * Get MCP usage statistics
 * Requires authentication
 */
router.get('/mcp/stats', authenticate, newsController.getMCPStats);

export default router;
