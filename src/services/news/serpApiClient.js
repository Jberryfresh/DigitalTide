/**
 * SerpAPI Client for Google News
 * Fetches news articles from Google News via SerpAPI
 * Free tier: 100 searches/month
 *
 * NOTE: Request count tracking (this.requestCount) is NOT thread-safe.
 * In concurrent environments, multiple requests may race and cause
 * inaccurate quota tracking. This is acceptable for MVP with single
 * instance deployment. For production, implement atomic counters
 * (Redis INCR) or mutex locks.
 */

import axios from 'axios';
import config from '../../config/index.js';

class SerpApiClient {
  constructor() {
    this.apiKey = config.news.serpApiKey;
    this.baseUrl = 'https://serpapi.com/search.json';
    this.requestCount = 0; // ⚠️ Not thread-safe - see class JSDoc
    this.maxRequests = 100; // Free tier limit per month
  }

  /**
   * Fetch news articles from Google News
   * @param {Object} options - Query options
   * @param {string} options.query - Search query (default: 'latest news')
   * @param {string} options.country - Country code (default: 'us')
   * @param {string} options.language - Language code (default: 'en')
   * @param {number} options.limit - Number of results (default: 10, max: 100)
   * @returns {Promise<Array>} Normalized articles
   */
  async fetchNews(options = {}) {
    const { query = 'latest news', country = 'us', language = 'en', limit = 10 } = options;

    // Check rate limit
    if (this.requestCount >= this.maxRequests) {
      throw new Error(`SerpAPI rate limit exceeded (${this.maxRequests} requests/month)`);
    }

    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          engine: 'google_news',
          q: query,
          gl: country,
          hl: language,
          num: Math.min(limit, 100), // SerpAPI max is 100
          api_key: this.apiKey,
        },
        timeout: 10000,
      });

      this.requestCount++;

      const newsResults = response.data.news_results || [];
      return this.normalizeArticles(newsResults);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Normalize SerpAPI response to standard article format
   * @param {Array} articles - Raw articles from SerpAPI
   * @returns {Array} Normalized articles
   */
  normalizeArticles(articles) {
    return articles.map(article => ({
      // Standard fields
      title: article.title,
      description: article.snippet || '',
      content: article.snippet || '',
      url: article.link,
      imageUrl: article.thumbnail || null,
      publishedAt: article.date || new Date().toISOString(),

      // Source information
      source: {
        name: article.source || 'Unknown',
        url: article.link,
      },

      // Metadata
      metadata: {
        provider: 'serpapi',
        position: article.position,
        originalData: article,
      },

      // For deduplication
      fingerprint: this.generateFingerprint(article.title, article.link),
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

      switch (status) {
        case 401:
          return new Error('SerpAPI: Invalid API key');
        case 429:
          return new Error('SerpAPI: Rate limit exceeded');
        case 500:
          return new Error('SerpAPI: Service unavailable');
        default:
          return new Error(`SerpAPI error: ${data.error || error.message}`);
      }
    }

    if (error.code === 'ECONNABORTED') {
      return new Error('SerpAPI: Request timeout');
    }

    return new Error(`SerpAPI: ${error.message}`);
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
          engine: 'google_news',
          q: 'test',
          num: 1,
          api_key: this.apiKey,
        },
        timeout: 5000,
      });
      // Don't increment requestCount for health checks
      return response.status === 200;
    } catch (error) {
      console.error('SerpAPI health check failed:', error.message);
      return false;
    }
  }
}

export default new SerpApiClient();
