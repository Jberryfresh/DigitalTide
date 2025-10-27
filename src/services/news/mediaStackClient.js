/**
 * MediaStack Client
 * Fetches news articles from MediaStack API
 * Free tier: 500 requests/month
 * 
 * NOTE: Request count tracking (this.requestCount) is NOT thread-safe.
 * In concurrent environments, multiple requests may race and cause
 * inaccurate quota tracking. This is acceptable for MVP with single
 * instance deployment. For production, implement atomic counters
 * (Redis INCR) or mutex locks.
 */

import axios from 'axios';
import config from '../../config/index.js';

class MediaStackClient {
  constructor() {
    this.apiKey = config.news.mediaStackApiKey;
    this.baseUrl = 'http://api.mediastack.com/v1/news';
    this.requestCount = 0; // ⚠️ Not thread-safe - see class JSDoc
    this.maxRequests = 500; // Free tier limit per month
  }

  /**
   * Fetch news articles from MediaStack
   * @param {Object} options - Query options
   * @param {string} options.query - Search keywords (optional)
   * @param {string} options.countries - Comma-separated country codes (default: 'us')
   * @param {string} options.categories - Comma-separated categories (optional)
   * @param {string} options.languages - Comma-separated language codes (default: 'en')
   * @param {number} options.limit - Number of results (default: 25, max: 100)
   * @param {number} options.offset - Pagination offset (default: 0)
   * @returns {Promise<Array>} Normalized articles
   */
  async fetchNews(options = {}) {
    const {
      query = null,
      countries = 'us',
      categories = null,
      languages = 'en',
      limit = 25,
      offset = 0,
    } = options;

    // Check rate limit
    if (this.requestCount >= this.maxRequests) {
      throw new Error(
        `MediaStack rate limit exceeded (${this.maxRequests} requests/month)`
      );
    }

    try {
      const params = {
        access_key: this.apiKey,
        countries,
        languages,
        limit: Math.min(limit, 100), // MediaStack max is 100
        offset,
        sort: 'published_desc',
      };

      // Add optional parameters
      if (query) params.keywords = query;
      if (categories) params.categories = categories;

      const response = await axios.get(this.baseUrl, {
        params,
        timeout: 10000,
      });

      this.requestCount++;

      const { data, pagination } = response.data;
      const articles = this.normalizeArticles(data || []);

      return {
        articles,
        pagination: {
          total: pagination.total,
          count: pagination.count,
          limit: pagination.limit,
          offset: pagination.offset,
          hasMore: pagination.offset + pagination.count < pagination.total,
        },
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Fetch articles by category
   * @param {string} category - Category name (general, business, entertainment, health, science, sports, technology)
   * @param {number} limit - Number of results
   * @returns {Promise<Object>} Articles with pagination
   */
  async fetchByCategory(category, limit = 25) {
    return this.fetchNews({ categories: category, limit });
  }

  /**
   * Search articles by keywords
   * @param {string} keywords - Search keywords
   * @param {number} limit - Number of results
   * @returns {Promise<Object>} Articles with pagination
   */
  async searchArticles(keywords, limit = 25) {
    return this.fetchNews({ query: keywords, limit });
  }

  /**
   * Normalize MediaStack response to standard article format
   * @param {Array} articles - Raw articles from MediaStack
   * @returns {Array} Normalized articles
   */
  normalizeArticles(articles) {
    return articles.map((article) => ({
      // Standard fields
      title: article.title,
      description: article.description || '',
      content: article.description || '',
      url: article.url,
      imageUrl: article.image || null,
      publishedAt: article.published_at,

      // Source information
      source: {
        name: article.source || 'Unknown',
        url: article.url,
      },

      // Author information
      author: article.author || null,

      // Categories
      category: article.category || null,

      // Location
      country: article.country || null,
      language: article.language || null,

      // Metadata
      metadata: {
        provider: 'mediastack',
        originalData: article,
      },

      // For deduplication
      fingerprint: this.generateFingerprint(article.title, article.url),
    }));
  }

  /**
   * Generate unique fingerprint for article deduplication
   * @param {string} title - Article title
   * @param {string} url - Article URL
   * @returns {string} Fingerprint hash
   */
  generateFingerprint(title, url) {
    const normalized = `${title.toLowerCase().trim()}-${url}`;
    return Buffer.from(normalized).toString('base64');
  }

  /**
   * Handle API errors
   * @param {Error} error - Original error
   * @returns {Error} Formatted error
   */
  handleError(error) {
    if (error.response) {
      const { status, data } = error.response;
      const errorInfo = data.error || {};

      switch (status) {
        case 401:
          return new Error('MediaStack: Invalid API key');
        case 429:
          return new Error('MediaStack: Rate limit exceeded');
        case 500:
          return new Error('MediaStack: Service unavailable');
        default:
          return new Error(
            `MediaStack error: ${errorInfo.message || errorInfo.info || error.message}`
          );
      }
    }

    if (error.code === 'ECONNABORTED') {
      return new Error('MediaStack: Request timeout');
    }

    return new Error(`MediaStack: ${error.message}`);
  }

  /**
   * Get remaining API quota
   * @returns {number} Remaining requests
   */
  getRemainingQuota() {
    return Math.max(0, this.maxRequests - this.requestCount);
  }

  /**
   * Reset request counter (call at start of new month)
   */
  resetQuota() {
    this.requestCount = 0;
  }

  /**
   * Check if service is available
   * Performs a lightweight API check without consuming quota
   * @returns {Promise<boolean>} Service health status
   */
  async healthCheck() {
    try {
      // Just check if API is reachable without incrementing quota
      const response = await axios.get(this.baseUrl, {
        params: {
          access_key: this.apiKey,
          countries: 'us',
          limit: 1,
        },
        timeout: 5000,
      });
      // Don't increment requestCount for health checks
      return response.status === 200 && response.data;
    } catch (error) {
      console.error('MediaStack health check failed:', error.message);
      return false;
    }
  }
}

export default new MediaStackClient();
