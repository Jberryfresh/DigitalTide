/**
 * News Service Orchestrator
 * Coordinates multiple news API clients and manages article aggregation
 */

import serpApiClient from './serpApiClient.js';
import mediaStackClient from './mediaStackClient.js';
import redisCache from '../cache/redisCache.js';
import config from '../../config/index.js';

class NewsService {
  constructor() {
    this.clients = {
      serpapi: serpApiClient,
      mediastack: mediaStackClient,
    };
    this.cacheTTL = config.news.cacheTTL || 300; // 5 minutes default
  }

  /**
   * Fetch news from multiple sources and aggregate results
   * @param {Object} options - Query options
   * @param {string} options.query - Search query
   * @param {string} options.category - News category
   * @param {string} options.country - Country code
   * @param {string} options.language - Language code
   * @param {number} options.limit - Max results per source
   * @param {Array<string>} options.sources - Specific sources to use (default: all)
   * @param {boolean} options.useCache - Whether to use cache (default: true)
   * @returns {Promise<Object>} Aggregated articles with metadata
   */
  async fetchFromMultipleSources(options = {}) {
    const {
      query = null,
      category = null,
      country = 'us',
      language = 'en',
      limit = 10,
      sources = ['serpapi', 'mediastack'],
      useCache = true,
    } = options;

    // Generate cache key
    const cacheKey = redisCache.generateNewsKey({
      source: sources.join(','),
      query,
      category,
      country,
      language,
      limit,
    });

    // Try to get from cache
    if (useCache) {
      try {
        const cached = await redisCache.get(cacheKey);
        if (cached) {
          console.log(`📦 Cache HIT for key: ${cacheKey}`);
          cached.metadata.fromCache = true;
          cached.metadata.cacheKey = cacheKey;
          return cached;
        }
        console.log(`📭 Cache MISS for key: ${cacheKey}`);
      } catch (error) {
        console.error('Cache read error:', error);
        // Continue without cache
      }
    }

    const results = {
      articles: [],
      metadata: {
        totalFetched: 0,
        sources: {},
        errors: [],
        deduplicated: 0,
        fromCache: false,
      },
    };

    // Fetch from each source in parallel
    const fetchPromises = sources.map(async (source) => {
      try {
        const client = this.clients[source];
        if (!client) {
          throw new Error(`Unknown news source: ${source}`);
        }

        let fetchedArticles = [];

        // Prepare options based on source
        if (source === 'serpapi') {
          fetchedArticles = await client.fetchNews({
            query: query || category || 'latest news',
            country,
            language,
            limit,
          });
        } else if (source === 'mediastack') {
          const response = await client.fetchNews({
            query,
            categories: category,
            countries: country,
            languages: language,
            limit,
          });
          fetchedArticles = response.articles;
        }

        results.metadata.sources[source] = {
          count: fetchedArticles.length,
          status: 'success',
          quota: client.getRemainingQuota(),
        };

        return fetchedArticles;
      } catch (error) {
        results.metadata.sources[source] = {
          count: 0,
          status: 'failed',
          error: error.message,
        };
        results.metadata.errors.push({
          source,
          error: error.message,
        });
        return [];
      }
    });

    // Wait for all fetches to complete
    const allArticles = await Promise.all(fetchPromises);
    const flattenedArticles = allArticles.flat();

    results.metadata.totalFetched = flattenedArticles.length;

    // Deduplicate articles
    results.articles = this.deduplicateArticles(flattenedArticles);
    results.metadata.deduplicated = flattenedArticles.length - results.articles.length;

    // Sort by published date (newest first)
    results.articles.sort(
      (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt),
    );

    // Cache the results
    if (useCache) {
      try {
        await redisCache.set(cacheKey, results, this.cacheTTL);
        console.log(`💾 Cached results for key: ${cacheKey} (TTL: ${this.cacheTTL}s)`);
      } catch (error) {
        console.error('Cache write error:', error);
        // Continue without caching
      }
    }

    return results;
  }

  /**
   * Fetch news from a single source
   * @param {string} source - Source name ('serpapi' or 'mediastack')
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Articles from specified source
   */
  async fetchFromSource(source, options = {}) {
    const client = this.clients[source];
    if (!client) {
      throw new Error(`Unknown news source: ${source}`);
    }

    try {
      if (source === 'serpapi') {
        return await client.fetchNews(options);
      } if (source === 'mediastack') {
        const response = await client.fetchNews(options);
        return response.articles;
      }
    } catch (error) {
      throw new Error(`Failed to fetch from ${source}: ${error.message}`);
    }
  }

  /**
   * Deduplicate articles based on fingerprint
   * @param {Array} articles - Articles to deduplicate
   * @returns {Array} Unique articles
   */
  deduplicateArticles(articles) {
    const seen = new Set();
    return articles.filter((article) => {
      if (seen.has(article.fingerprint)) {
        return false;
      }
      seen.add(article.fingerprint);
      return true;
    });
  }

  /**
   * Get health status of all news sources
   * @returns {Promise<Object>} Health status for each source
   */
  async getSourcesHealth() {
    const health = {};

    for (const [source, client] of Object.entries(this.clients)) {
      try {
        const isHealthy = await client.healthCheck();
        health[source] = {
          status: isHealthy ? 'healthy' : 'unhealthy',
          quota: client.getRemainingQuota(),
          maxRequests: client.maxRequests,
        };
      } catch (error) {
        health[source] = {
          status: 'error',
          error: error.message,
        };
      }
    }

    return health;
  }

  /**
   * Get available news sources
   * @returns {Array} List of available sources with details
   */
  getAvailableSources() {
    return Object.keys(this.clients).map((source) => {
      const client = this.clients[source];
      return {
        id: source,
        name: this.getSourceDisplayName(source),
        quota: client.getRemainingQuota(),
        maxRequests: client.maxRequests,
      };
    });
  }

  /**
   * Get display name for source
   * @param {string} source - Source ID
   * @returns {string} Display name
   */
  getSourceDisplayName(source) {
    const names = {
      serpapi: 'Google News (via SerpAPI)',
      mediastack: 'MediaStack',
      newsapi: 'NewsAPI.org',
    };
    return names[source] || source;
  }

  /**
   * Reset quota for all sources (call at start of month)
   */
  resetAllQuotas() {
    Object.values(this.clients).forEach((client) => client.resetQuota());
  }

  /**
   * Fetch latest breaking news
   * @param {number} limit - Number of articles
   * @returns {Promise<Object>} Latest news articles
   */
  async fetchBreakingNews(limit = 20) {
    return this.fetchFromMultipleSources({
      query: 'breaking news',
      limit: Math.ceil(limit / 2), // Divide limit across sources
    });
  }

  /**
   * Fetch news by category
   * @param {string} category - Category name
   * @param {number} limit - Number of articles
   * @returns {Promise<Object>} Category news articles
   */
  async fetchByCategory(category, limit = 20) {
    return this.fetchFromMultipleSources({
      category,
      limit: Math.ceil(limit / 2),
    });
  }

  /**
   * Search news articles
   * @param {string} query - Search query
   * @param {number} limit - Number of articles
   * @returns {Promise<Object>} Search results
   */
  async searchNews(query, limit = 20) {
    return this.fetchFromMultipleSources({
      query,
      limit: Math.ceil(limit / 2),
    });
  }

  /**
   * Invalidate all news cache
   * @returns {Promise<number>} Number of keys deleted
   */
  async invalidateCache() {
    try {
      const deleted = await redisCache.delPattern('news:*');
      console.log(`🗑️  Invalidated ${deleted} news cache entries`);
      return deleted;
    } catch (error) {
      console.error('Cache invalidation error:', error);
      return 0;
    }
  }

  /**
   * Get cache statistics
   * @returns {Promise<Object>} Cache statistics
   */
  async getCacheStats() {
    try {
      const keys = await redisCache.keys('news:*');
      const stats = {
        totalKeys: keys.length,
        keys: [],
      };

      for (const key of keys.slice(0, 10)) {
        // Get first 10 for sample
        const ttl = await redisCache.ttl(key);
        stats.keys.push({ key, ttl });
      }

      return stats;
    } catch (error) {
      console.error('Cache stats error:', error);
      return { totalKeys: 0, keys: [], error: error.message };
    }
  }
}

export default new NewsService();
