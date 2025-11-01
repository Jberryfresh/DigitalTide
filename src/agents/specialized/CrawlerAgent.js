/**
 * Crawler Agent
 * Discovers and monitors news from multiple sources including RSS feeds and APIs
 * Responsible for finding trending topics and new content opportunities
 */

import Agent from '../base/Agent.js';
import rssService from '../../services/news/rssService.js';
import newsService from '../../services/news/newsService.js';
import redisCache from '../../services/cache/redisCache.js';

class CrawlerAgent extends Agent {
  constructor(config = {}) {
    super('CrawlerAgent', config);

    this.config = {
      // RSS feed monitoring
      rssFeeds: config.rssFeeds || rssService.getDefaultFeeds(),
      rssPollInterval: config.rssPollInterval || 900000, // 15 minutes

      // API news monitoring
      useNewsApis: config.useNewsApis !== false, // Default: true
      apiPollInterval: config.apiPollInterval || 1800000, // 30 minutes

      // Trending topic detection
      trendingThreshold: config.trendingThreshold || 3, // Min appearances to be trending
      trendingWindow: config.trendingWindow || 3600000, // 1 hour window

      // Source credibility
      minCredibility: config.minCredibility || 0.75,

      // Article filtering
      maxArticleAge: config.maxArticleAge || 86400000, // 24 hours
      minArticleQuality: config.minArticleQuality || 0.6,

      // Duplicate detection
      enableDeduplication: config.enableDeduplication !== false,

      // Cache settings
      cacheEnabled: config.cacheEnabled !== false,
      cacheTTL: config.cacheTTL || 900, // 15 minutes
    };

    this.trendingTopics = new Map(); // Track trending topics
    this.discoveredArticles = []; // Recently discovered articles
    this.lastRSSPoll = null;
    this.lastAPIPoll = null;
    this.monitoringInterval = null;
  }

  /**
   * Initialize the Crawler Agent
   * @returns {Promise<void>}
   */
  async initialize() {
    this.logger.info(`[${this.name}] Initializing Crawler Agent...`);

    try {
      // Test RSS service
      const rssHealth = await rssService.healthCheck();
      if (!rssHealth) {
        this.logger.warn(`[${this.name}] RSS service health check failed`);
      }

      // Test news APIs
      if (this.config.useNewsApis) {
        const apiHealth = await newsService.getSourcesHealth();
        this.logger.info(`[${this.name}] News API health:`, apiHealth);
      }

      this.logger.info(`[${this.name}] Initialization complete`);
    } catch (error) {
      this.logger.error(`[${this.name}] Initialization error:`, error);
      throw error;
    }
  }

  /**
   * Execute crawler task
   * @param {Object} task - Crawler task
   * @returns {Promise<Object>} Discovered content
   */
  async execute(task) {
    const { type = 'discover', options = {} } = task;

    switch (type) {
      case 'discover':
        return this.discoverNews(options);

      case 'rss':
        return this.crawlRSSFeeds(options);

      case 'api':
        return this.crawlNewsAPIs(options);

      case 'trending':
        return this.detectTrendingTopics(options);

      case 'monitor':
        return this.startMonitoring(options);

      case 'stop':
        return this.stopMonitoring();

      default:
        throw new Error(`Unknown crawler task type: ${type}`);
    }
  }

  /**
   * Discover news from all available sources
   * @param {Object} options - Discovery options
   * @returns {Promise<Object>} Discovered articles and topics
   */
  async discoverNews(options = {}) {
    this.logger.info(`[${this.name}] Starting news discovery...`);

    const results = {
      rssArticles: [],
      apiArticles: [],
      trendingTopics: [],
      totalDiscovered: 0,
      sources: [],
      errors: [],
    };

    try {
      // Crawl RSS feeds
      const rssResults = await this.crawlRSSFeeds(options);
      results.rssArticles = rssResults.articles;
      results.sources.push(...rssResults.sources);
      if (rssResults.errors.length > 0) {
        results.errors.push(...rssResults.errors);
      }

      // Crawl news APIs if enabled
      if (this.config.useNewsApis) {
        const apiResults = await this.crawlNewsAPIs(options);
        results.apiArticles = apiResults.articles;
        results.sources.push(...apiResults.sources);
        if (apiResults.errors.length > 0) {
          results.errors.push(...apiResults.errors);
        }
      }

      // Combine all articles
      const allArticles = [...results.rssArticles, ...results.apiArticles];

      // Deduplicate if enabled
      let uniqueArticles = allArticles;
      if (this.config.enableDeduplication) {
        uniqueArticles = this.deduplicateArticles(allArticles);
        this.logger.info(
          `[${this.name}] Removed ${allArticles.length - uniqueArticles.length} duplicates`
        );
      }

      // Filter by quality and age
      const filteredArticles = this.filterArticles(uniqueArticles);

      // Sort by credibility and recency
      const sortedArticles = this.sortArticles(filteredArticles);

      // Store discovered articles
      this.discoveredArticles = sortedArticles;

      // Detect trending topics
      const trending = await this.detectTrendingTopics({ articles: sortedArticles });
      results.trendingTopics = trending.topics;

      results.totalDiscovered = sortedArticles.length;

      this.logger.info(
        `[${this.name}] Discovery complete: ${results.totalDiscovered} articles, ${results.trendingTopics.length} trending topics`
      );

      return {
        success: true,
        articles: sortedArticles,
        trending: results.trendingTopics,
        metadata: {
          totalDiscovered: results.totalDiscovered,
          rssCount: results.rssArticles.length,
          apiCount: results.apiArticles.length,
          sources: results.sources,
          errors: results.errors,
        },
      };
    } catch (error) {
      this.logger.error(`[${this.name}] Discovery error:`, error);
      throw error;
    }
  }

  /**
   * Crawl RSS feeds for new articles
   * @param {Object} options - RSS crawl options
   * @returns {Promise<Object>} RSS articles
   */
  async crawlRSSFeeds(options = {}) {
    this.logger.info(`[${this.name}] Crawling RSS feeds...`);

    const { feeds = this.config.rssFeeds, category = null } = options;

    try {
      // Filter feeds by category if specified
      const feedsToCrawl = category ? feeds.filter(feed => feed.category === category) : feeds;

      // Parse all feeds
      const results = await rssService.parseMultipleFeeds(feedsToCrawl);

      this.lastRSSPoll = new Date().toISOString();

      return {
        success: true,
        articles: results.articles,
        sources: results.feedResults
          .filter(r => r.success)
          .map(r => ({
            name: r.source,
            type: 'rss',
            count: r.totalArticles,
          })),
        errors: results.errors,
        metadata: {
          totalFeeds: results.totalFeeds,
          successfulFeeds: results.successfulFeeds,
          failedFeeds: results.failedFeeds,
          executionTime: results.executionTime,
        },
      };
    } catch (error) {
      this.logger.error(`[${this.name}] RSS crawl error:`, error);
      throw error;
    }
  }

  /**
   * Crawl news APIs for articles
   * @param {Object} options - API crawl options
   * @returns {Promise<Object>} API articles
   */
  async crawlNewsAPIs(options = {}) {
    this.logger.info(`[${this.name}] Crawling news APIs...`);

    const { query = null, category = null, country = 'us', language = 'en', limit = 20 } = options;

    try {
      const results = await newsService.fetchFromMultipleSources({
        query,
        category,
        country,
        language,
        limit,
        useCache: this.config.cacheEnabled,
      });

      this.lastAPIPoll = new Date().toISOString();

      return {
        success: true,
        articles: results.articles,
        sources: Object.entries(results.metadata.sources).map(([name, data]) => ({
          name,
          type: 'api',
          count: data.count,
          status: data.status,
        })),
        errors: results.metadata.errors,
        metadata: {
          totalFetched: results.metadata.totalFetched,
          deduplicated: results.metadata.deduplicated,
        },
      };
    } catch (error) {
      this.logger.error(`[${this.name}] API crawl error:`, error);
      throw error;
    }
  }

  /**
   * Detect trending topics from articles
   * @param {Object} options - Trending detection options
   * @returns {Promise<Object>} Trending topics
   */
  async detectTrendingTopics(options = {}) {
    this.logger.info(`[${this.name}] Detecting trending topics...`);

    const { articles = this.discoveredArticles } = options;

    try {
      // Extract keywords and topics from titles and content
      const topicCounts = new Map();

      articles.forEach(article => {
        // Extract keywords from title
        const keywords = this.extractKeywords(article.title);

        keywords.forEach(keyword => {
          const current = topicCounts.get(keyword) || {
            count: 0,
            articles: [],
            firstSeen: article.publishedAt,
            lastSeen: article.publishedAt,
          };

          current.count += 1;
          current.articles.push({
            title: article.title,
            link: article.link,
            source: article.source?.name || 'Unknown',
            publishedAt: article.publishedAt,
          });
          current.lastSeen = article.publishedAt;

          topicCounts.set(keyword, current);
        });
      });

      // Filter topics by threshold
      const trending = Array.from(topicCounts.entries())
        .filter(([, data]) => data.count >= this.config.trendingThreshold)
        .map(([keyword, data]) => ({
          keyword,
          mentions: data.count,
          articles: data.articles,
          firstSeen: data.firstSeen,
          lastSeen: data.lastSeen,
          trend: 'rising', // Could be enhanced with trend analysis
        }))
        .sort((a, b) => b.mentions - a.mentions)
        .slice(0, 20); // Top 20 trending topics

      // Update trending topics map
      trending.forEach(topic => {
        this.trendingTopics.set(topic.keyword, topic);
      });

      this.logger.info(`[${this.name}] Found ${trending.length} trending topics`);

      return {
        success: true,
        topics: trending,
        totalTopics: topicCounts.size,
        trendingCount: trending.length,
      };
    } catch (error) {
      this.logger.error(`[${this.name}] Trending detection error:`, error);
      throw error;
    }
  }

  /**
   * Extract keywords from text
   * @param {string} text - Text to extract keywords from
   * @returns {Array<string>} Keywords
   */
  extractKeywords(text) {
    if (!text) return [];

    // Remove common words and short words
    const stopWords = new Set([
      'the',
      'a',
      'an',
      'and',
      'or',
      'but',
      'in',
      'on',
      'at',
      'to',
      'for',
      'of',
      'with',
      'by',
      'from',
      'as',
      'is',
      'was',
      'are',
      'be',
      'been',
      'has',
      'have',
      'had',
      'do',
      'does',
      'did',
      'will',
      'would',
      'could',
      'should',
      'may',
      'might',
      'can',
      'this',
      'that',
      'these',
      'those',
      'it',
      'its',
      'their',
      'them',
      'they',
      'we',
      'you',
      'he',
      'she',
    ]);

    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Remove punctuation
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.has(word))
      .filter(word => /^[a-z]+$/.test(word)); // Only alphabetic words
  }

  /**
   * Deduplicate articles based on fingerprint
   * @param {Array} articles - Articles to deduplicate
   * @returns {Array} Unique articles
   */
  deduplicateArticles(articles) {
    const seen = new Set();
    return articles.filter(article => {
      const fingerprint = article.fingerprint || article.guid || article.link;
      if (seen.has(fingerprint)) {
        return false;
      }
      seen.add(fingerprint);
      return true;
    });
  }

  /**
   * Filter articles by quality and age
   * @param {Array} articles - Articles to filter
   * @returns {Array} Filtered articles
   */
  filterArticles(articles) {
    const now = Date.now();
    const maxAge = this.config.maxArticleAge;

    return articles.filter(article => {
      // Check age
      const articleAge = now - new Date(article.publishedAt).getTime();
      if (articleAge > maxAge) {
        return false;
      }

      // Check credibility
      const credibility = article.source?.credibility || 0.5;
      if (credibility < this.config.minCredibility) {
        return false;
      }

      // Check basic quality (has title and link)
      if (!article.title || !article.link) {
        return false;
      }

      return true;
    });
  }

  /**
   * Sort articles by credibility and recency
   * @param {Array} articles - Articles to sort
   * @returns {Array} Sorted articles
   */
  sortArticles(articles) {
    return [...articles].sort((a, b) => {
      // Sort by credibility first
      const credA = a.source?.credibility || 0.5;
      const credB = b.source?.credibility || 0.5;

      if (credB !== credA) {
        return credB - credA;
      }

      // Then by recency
      return new Date(b.publishedAt) - new Date(a.publishedAt);
    });
  }

  /**
   * Start continuous monitoring
   * @param {Object} options - Monitoring options
   * @returns {Promise<Object>} Status
   */
  async startMonitoring(options = {}) {
    if (this.monitoringInterval) {
      return {
        success: false,
        message: 'Monitoring already active',
      };
    }

    this.logger.info(`[${this.name}] Starting continuous monitoring...`);

    // Run initial discovery
    await this.discoverNews(options);

    // Set up periodic monitoring
    this.monitoringInterval = setInterval(async () => {
      try {
        await this.discoverNews(options);
      } catch (error) {
        this.logger.error(`[${this.name}] Monitoring error:`, error);
      }
    }, this.config.rssPollInterval);

    return {
      success: true,
      message: 'Monitoring started',
      interval: this.config.rssPollInterval,
    };
  }

  /**
   * Stop continuous monitoring
   * @returns {Object} Status
   */
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      this.logger.info(`[${this.name}] Monitoring stopped`);
      return {
        success: true,
        message: 'Monitoring stopped',
      };
    }

    return {
      success: false,
      message: 'Monitoring not active',
    };
  }

  /**
   * Get crawler statistics
   * @returns {Object} Statistics
   */
  getCrawlerStats() {
    return {
      ...this.getStats(),
      trendingTopics: this.trendingTopics.size,
      discoveredArticles: this.discoveredArticles.length,
      lastRSSPoll: this.lastRSSPoll,
      lastAPIPoll: this.lastAPIPoll,
      monitoringActive: !!this.monitoringInterval,
    };
  }

  /**
   * Cleanup crawler resources
   * @returns {Promise<void>}
   */
  async cleanup() {
    this.stopMonitoring();
    this.trendingTopics.clear();
    this.discoveredArticles = [];
    await super.cleanup();
  }
}

export default CrawlerAgent;
