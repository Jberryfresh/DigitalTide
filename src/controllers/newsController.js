/**
 * News Controller
 * Handles news fetching, aggregation, and AI analysis
 */

import newsService from '../services/news/newsService.js';
import claudeService from '../services/ai/claudeService.js';
import redisCache from '../services/cache/redisCache.js';
import articleStorageService from '../services/storage/articleStorageService.js';

/**
 * Fetch fresh news from multiple sources
 * GET /api/v1/news/fetch
 */
export const fetchNews = async (req, res, next) => {
  try {
    const {
      query,
      category,
      country = 'us',
      language = 'en',
      limit = 20,
      sources,
      useCache = 'true',
    } = req.query;

    // Parse sources if provided
    const sourcesArray = sources ? sources.split(',') : ['serpapi', 'mediastack'];
    const useCacheBool = useCache === 'true';

    const result = await newsService.fetchFromMultipleSources({
      query,
      category,
      country,
      language,
      limit: parseInt(limit, 10),
      sources: sourcesArray,
      useCache: useCacheBool,
    });

    res.json({
      success: true,
      data: {
        articles: result.articles,
        count: result.articles.length,
        metadata: result.metadata,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch breaking news
 * GET /api/v1/news/breaking
 */
export const fetchBreakingNews = async (req, res, next) => {
  try {
    const { limit = 20 } = req.query;

    const result = await newsService.fetchBreakingNews(parseInt(limit, 10));

    res.json({
      success: true,
      data: {
        articles: result.articles,
        count: result.articles.length,
        metadata: result.metadata,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch news by category
 * GET /api/v1/news/category/:category
 */
export const fetchByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const { limit = 20 } = req.query;

    const result = await newsService.fetchByCategory(
      category,
      parseInt(limit, 10)
    );

    res.json({
      success: true,
      data: {
        category,
        articles: result.articles,
        count: result.articles.length,
        metadata: result.metadata,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Search news articles
 * GET /api/v1/news/search
 */
export const searchNews = async (req, res, next) => {
  try {
    const { q, limit = 20 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Search query (q) is required',
      });
    }

    const result = await newsService.searchNews(q, parseInt(limit, 10));

    res.json({
      success: true,
      data: {
        query: q,
        articles: result.articles,
        count: result.articles.length,
        metadata: result.metadata,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get available news sources
 * GET /api/v1/news/sources
 */
export const getSources = async (req, res, next) => {
  try {
    const sources = newsService.getAvailableSources();

    res.json({
      success: true,
      data: {
        sources,
        count: sources.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get news sources health status
 * GET /api/v1/news/health
 */
export const getHealth = async (req, res, next) => {
  try {
    const health = await newsService.getSourcesHealth();

    // Check if all sources are healthy
    const allHealthy = Object.values(health).every(
      (source) => source.status === 'healthy'
    );

    res.status(allHealthy ? 200 : 503).json({
      success: allHealthy,
      data: {
        overall: allHealthy ? 'healthy' : 'degraded',
        sources: health,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Analyze article with AI
 * POST /api/v1/news/analyze
 */
export const analyzeArticle = async (req, res, next) => {
  try {
    const { title, content, url } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        error: 'Article title and content are required',
      });
    }

    const article = { title, content, url };
    const options = {
      includeSummary: req.body.includeSummary !== false,
      includeSentiment: req.body.includeSentiment !== false,
      includeKeyPoints: req.body.includeKeyPoints !== false,
      includeCategory: req.body.includeCategory !== false,
      includeEntities: req.body.includeEntities !== false,
      includeTags: req.body.includeTags !== false,
    };

    const analysis = await claudeService.analyzeArticle(article, options);

    res.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate article summary
 * POST /api/v1/news/summarize
 */
export const summarizeArticle = async (req, res, next) => {
  try {
    const { title, content, maxLength = 150 } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        error: 'Article title and content are required',
      });
    }

    const result = await claudeService.generateSummary(
      { title, content },
      parseInt(maxLength, 10)
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Analyze article sentiment
 * POST /api/v1/news/sentiment
 */
export const analyzeSentiment = async (req, res, next) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        error: 'Article title and content are required',
      });
    }

    const result = await claudeService.analyzeSentiment({ title, content });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Extract key points from article
 * POST /api/v1/news/key-points
 */
export const extractKeyPoints = async (req, res, next) => {
  try {
    const { title, content, maxPoints = 5 } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        error: 'Article title and content are required',
      });
    }

    const result = await claudeService.extractKeyPoints(
      { title, content },
      parseInt(maxPoints, 10)
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Categorize article
 * POST /api/v1/news/categorize
 */
export const categorizeArticle = async (req, res, next) => {
  try {
    const { title, content, availableCategories } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        error: 'Article title and content are required',
      });
    }

    const result = await claudeService.categorizeArticle(
      { title, content },
      availableCategories || []
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate article tags
 * POST /api/v1/news/tags
 */
export const generateTags = async (req, res, next) => {
  try {
    const { title, content, maxTags = 10 } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        error: 'Article title and content are required',
      });
    }

    const result = await claudeService.generateTags(
      { title, content },
      parseInt(maxTags, 10)
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Invalidate news cache
 * DELETE /api/v1/news/cache
 */
export const invalidateCache = async (req, res, next) => {
  try {
    const deleted = await newsService.invalidateCache();

    res.json({
      success: true,
      data: {
        message: 'Cache invalidated successfully',
        keysDeleted: deleted,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get cache statistics
 * GET /api/v1/news/cache/stats
 */
export const getCacheStats = async (req, res, next) => {
  try {
    const stats = await newsService.getCacheStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch and save news to database
 * POST /api/v1/news/fetch-and-save
 */
export const fetchAndSave = async (req, res, next) => {
  try {
    const {
      query,
      category,
      country = 'us',
      language = 'en',
      limit = 20,
      enrichWithAI = true,
      autoPublish = false,
    } = req.body;

    // Fetch news
    const newsResult = await newsService.fetchFromMultipleSources({
      query,
      category,
      country,
      language,
      limit: parseInt(limit, 10),
    });

    // Save to database
    const saveResult = await articleStorageService.saveArticles(
      newsResult.articles,
      {
        enrichWithAI: enrichWithAI === true,
        autoPublish: autoPublish === true,
        defaultAuthorId: req.user?.id, // From auth middleware
      }
    );

    res.json({
      success: true,
      data: {
        fetched: newsResult.articles.length,
        saved: saveResult.saved,
        duplicates: saveResult.duplicates,
        failed: saveResult.failed,
        articles: saveResult.articles,
        errors: saveResult.errors,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Save articles to database
 * POST /api/v1/news/save
 */
export const saveArticles = async (req, res, next) => {
  try {
    const {
      articles,
      enrichWithAI = true,
      autoPublish = false,
    } = req.body;

    if (!articles || !Array.isArray(articles)) {
      return res.status(400).json({
        success: false,
        error: 'Articles array is required',
      });
    }

    const result = await articleStorageService.saveArticles(articles, {
      enrichWithAI: enrichWithAI === true,
      autoPublish: autoPublish === true,
      defaultAuthorId: req.user?.id,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get storage statistics
 * GET /api/v1/news/storage/stats
 */
export const getStorageStats = async (req, res, next) => {
  try {
    const stats = await articleStorageService.getStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================================
// JOB SCHEDULER ENDPOINTS
// ============================================================================

/**
 * Manually trigger a background job
 * POST /api/v1/news/jobs/trigger
 * Body: { jobName: 'news-fetch' | 'cache-cleanup' | 'quota-reset' }
 */
export const triggerJob = async (req, res, next) => {
  try {
    const { jobName } = req.body;

    if (!jobName) {
      return res.status(400).json({
        success: false,
        error: 'Job name is required',
      });
    }

    const validJobs = ['news-fetch', 'cache-cleanup', 'quota-reset'];
    if (!validJobs.includes(jobName)) {
      return res.status(400).json({
        success: false,
        error: `Invalid job name. Valid options: ${validJobs.join(', ')}`,
      });
    }

    // Import dynamically to avoid circular dependency
    const { default: jobScheduler } = await import(
      '../services/jobs/jobScheduler.js'
    );

    // Trigger job in background
    jobScheduler.triggerJob(jobName).catch((error) => {
      console.error(`Job ${jobName} failed:`, error);
    });

    res.json({
      success: true,
      message: `Job '${jobName}' triggered successfully`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get job scheduler statistics
 * GET /api/v1/news/jobs/stats
 */
export const getJobStats = async (req, res, next) => {
  try {
    const { default: jobScheduler } = await import(
      '../services/jobs/jobScheduler.js'
    );

    const stats = jobScheduler.getStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================================
// MCP SERVER ENDPOINTS
// ============================================================================

/**
 * Get MCP servers health status
 * GET /api/v1/news/mcp/health
 */
export const getMCPHealth = async (req, res, next) => {
  try {
    const { default: mcpClient } = await import(
      '../services/mcp/mcpClient.js'
    );

    const health = await mcpClient.healthCheck();

    res.json({
      success: true,
      connected: mcpClient.connected,
      servers: health,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get MCP usage statistics
 * GET /api/v1/news/mcp/stats
 */
export const getMCPStats = async (req, res, next) => {
  try {
    const { default: mcpClient } = await import(
      '../services/mcp/mcpClient.js'
    );

    const stats = mcpClient.getStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};
