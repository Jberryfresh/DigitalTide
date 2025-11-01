/**
 * Crawler Agent
 * Discovers and monitors news from multiple sources including RSS feeds and APIs
 * Responsible for finding trending topics and new content opportunities
 */

import Agent from '../base/Agent.js';
import rssService from '../../services/news/rssService.js';
import newsService from '../../services/news/newsService.js';
import newsAggregator from '../../services/news/newsAggregator.js';
import redisCache from '../../services/cache/redisCache.js';
import TrendingService from '../../services/analytics/trendingService.js';

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

      // Trending topic detection (enhanced)
      trendingConfig: {
        minMentions: config.minMentions || 3,
        minVelocity: config.minVelocity || 0.5,
        shortWindow: config.shortWindow || 3600000, // 1 hour
        mediumWindow: config.mediumWindow || 14400000, // 4 hours
        longWindow: config.longWindow || 86400000, // 24 hours
        velocityWeight: config.velocityWeight || 0.4,
        volumeWeight: config.volumeWeight || 0.3,
        recencyWeight: config.recencyWeight || 0.2,
        credibilityWeight: config.credibilityWeight || 0.1,
        similarityThreshold: config.similarityThreshold || 0.6,
        maxClusterSize: config.maxClusterSize || 10,
      },

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

    // Initialize trending service with configuration
    this.trendingService = new TrendingService(this.config.trendingConfig);

    this.trendingTopics = new Map(); // Legacy - maintained for compatibility
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

      case 'aggregate':
        return this.crawlMultipleSources(options);

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
   * Crawl news using multi-source aggregator with intelligent prioritization
   * @param {Object} options - Aggregation options
   * @returns {Promise<Object>} Aggregated articles with metadata
   */
  async crawlMultipleSources(options = {}) {
    this.logger.info(`[${this.name}] Crawling with multi-source aggregator...`);

    const {
      query = null,
      category = null,
      country = 'us',
      language = 'en',
      limit = 50,
      sourcePriority = 'balanced', // 'balanced', 'quality', 'speed', 'cost'
      enabledSources = null,
      minCredibility = this.config.minCredibility || 0.0,
      sortBy = 'publishedAt',
    } = options;

    try {
      const results = await newsAggregator.aggregateFromMultipleSources({
        query,
        category,
        country,
        language,
        limit,
        sourcePriority,
        enabledSources,
        useCache: this.config.cacheEnabled,
        deduplication: this.config.enableDeduplication,
        minCredibility,
        sortBy,
      });

      this.lastAPIPoll = new Date().toISOString();

      this.logger.info(
        `[${this.name}] Aggregated ${results.articles.length} articles from ${results.metadata.selectedSources} sources ` +
          `(${results.metadata.deduplicated} duplicates removed, ${results.metadata.filtered} filtered)`
      );

      return {
        success: true,
        articles: results.articles,
        sources: Object.entries(results.metadata.sources).map(([name, data]) => ({
          name,
          type: data.type || 'unknown',
          count: data.count,
          status: data.status,
          priority: data.priority,
          credibility: data.credibility,
          responseTime: data.responseTime,
        })),
        errors: results.metadata.errors,
        metadata: {
          totalFetched: results.metadata.totalFetched,
          deduplicated: results.metadata.deduplicated,
          filtered: results.metadata.filtered,
          aggregationTime: results.metadata.aggregationTime,
          sourcePriority: results.metadata.sourcePriority,
          selectedSources: results.metadata.selectedSources,
        },
      };
    } catch (error) {
      this.logger.error(`[${this.name}] Multi-source aggregation error:`, error);
      throw error;
    }
  }

  /**
   * Detect trending topics from articles using advanced algorithms
   * @param {Object} options - Trending detection options
   * @returns {Promise<Object>} Trending topics with scores and metadata
   */
  async detectTrendingTopics(options = {}) {
    this.logger.info(`[${this.name}] Detecting trending topics with advanced algorithms...`);

    const {
      articles = this.discoveredArticles,
      limit = 20,
      includeLifecycle = true,
      includeClusters = true,
    } = options;

    try {
      // Use advanced trending service
      const analysis = this.trendingService.analyzeTrending(articles, {
        limit,
        includeLifecycle,
        includeClusters,
      });

      // Update legacy trending topics map for backward compatibility
      analysis.trending.forEach(topic => {
        this.trendingTopics.set(topic.keyword, {
          keyword: topic.keyword,
          mentions: topic.mentions,
          velocity: topic.velocity,
          trendScore: topic.trendScore,
          lifecycle: topic.lifecycle,
          articles: topic.articles,
          firstSeen: topic.firstSeen,
          lastSeen: topic.lastSeen,
        });
      });

      this.logger.info(
        `[${this.name}] Found ${analysis.trending.length} trending topics ` +
          `with ${analysis.clusters.length} clusters`
      );

      return {
        success: true,
        topics: analysis.trending,
        clusters: analysis.clusters,
        metadata: analysis.metadata,
        analytics: {
          avgVelocity:
            analysis.trending.length > 0
              ? analysis.trending.reduce((sum, t) => sum + t.velocity, 0) / analysis.trending.length
              : 0,
          avgTrendScore:
            analysis.trending.length > 0
              ? analysis.trending.reduce((sum, t) => sum + t.trendScore, 0) /
                analysis.trending.length
              : 0,
          lifecycleDistribution: this.getLifecycleDistribution(analysis.trending),
        },
      };
    } catch (error) {
      this.logger.error(`[${this.name}] Trending detection error:`, error);
      throw error;
    }
  }

  /**
   * Get lifecycle stage distribution from trending topics
   * @param {Array} topics - Trending topics
   * @returns {Object} Distribution by lifecycle stage
   */
  getLifecycleDistribution(topics) {
    const distribution = {
      emerging: 0,
      rising: 0,
      peak: 0,
      declining: 0,
      fading: 0,
    };

    topics.forEach(topic => {
      if (topic.lifecycle && topic.lifecycle.stage) {
        distribution[topic.lifecycle.stage] = (distribution[topic.lifecycle.stage] || 0) + 1;
      }
    });

    return distribution;
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
   * Start continuous monitoring (enhanced with NewsAggregator integration)
   * @param {Object} options - Monitoring options
   * @returns {Promise<Object>} Status
   */
  async startMonitoring(options = {}) {
    if (this.monitoringInterval || this.activeMonitor) {
      return {
        success: false,
        message: 'Monitoring already active',
      };
    }

    this.logger.info(`[${this.name}] Starting continuous monitoring...`);

    const {
      useAggregator = true, // Use NewsAggregator for multi-source monitoring
      interval = this.config.rssPollInterval,
      webhooks = [], // Array of webhook URLs for notifications
      ...restOptions
    } = options;

    if (useAggregator) {
      // Use NewsAggregator for enhanced monitoring
      this.activeMonitor = this.newsAggregator.startMonitoring({
        ...restOptions,
        interval,
        onNewArticles: async data => {
          this.logger.info(`[${this.name}] Found ${data.articles.length} new articles`);

          // Store discovered articles
          this.discoveredArticles.push(...data.articles);

          // Update trending topics
          if (data.articles.length > 0) {
            const trending = await this.trendingService.analyzeTrending(data.articles, {
              minMentions: 2,
              timeWindow: 3600000,
            });
            trending.trending.forEach(topic => {
              this.trendingTopics.set(topic.keyword, topic);
            });
          }

          // Send webhook notifications
          if (webhooks.length > 0) {
            await this.sendWebhookNotifications(webhooks, {
              type: 'new_articles',
              count: data.articles.length,
              articles: data.articles,
              timestamp: data.metadata.timestamp,
            });
          }

          // Emit event
          this.emit('articles:discovered', data.articles);
        },
        onError: async errorData => {
          this.logger.error(`[${this.name}] Monitoring error:`, errorData.error);

          // Send error webhooks
          if (webhooks.length > 0) {
            await this.sendWebhookNotifications(webhooks, {
              type: 'monitoring_error',
              error: errorData.error,
              timestamp: errorData.timestamp,
            });
          }

          // Emit error event
          this.emit('monitoring:error', errorData);
        },
      });

      this.logger.info(`[${this.name}] NewsAggregator monitoring started`);

      return {
        success: true,
        message: 'Enhanced monitoring started with NewsAggregator',
        monitorId: this.activeMonitor.monitorId,
        interval,
        webhooks: webhooks.length,
      };
    }

    // Fallback to basic monitoring
    await this.discoverNews(restOptions);

    this.monitoringInterval = setInterval(async () => {
      try {
        await this.discoverNews(restOptions);
      } catch (error) {
        this.logger.error(`[${this.name}] Monitoring error:`, error);
      }
    }, interval);

    return {
      success: true,
      message: 'Basic monitoring started',
      interval,
    };
  }

  /**
   * Stop continuous monitoring
   * @returns {Object} Status
   */
  stopMonitoring() {
    let stopped = false;

    // Stop NewsAggregator monitor if active
    if (this.activeMonitor) {
      const result = this.newsAggregator.stopMonitoring(this.activeMonitor.monitorId);
      if (result.success) {
        this.activeMonitor = null;
        stopped = true;
        this.logger.info(`[${this.name}] NewsAggregator monitoring stopped`);
      }
    }

    // Stop basic monitoring if active
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      stopped = true;
      this.logger.info(`[${this.name}] Basic monitoring stopped`);
    }

    if (stopped) {
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
   * Send webhook notifications
   * @param {Array} webhooks - Webhook URLs
   * @param {Object} payload - Notification payload
   * @returns {Promise<void>}
   */
  async sendWebhookNotifications(webhooks, payload) {
    const promises = webhooks.map(async url => {
      try {
        const axios = (await import('axios')).default;
        await axios.post(url, payload, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 5000,
        });
        this.logger.info(`[${this.name}] Webhook sent to ${url}`);
      } catch (error) {
        this.logger.error(`[${this.name}] Webhook failed for ${url}:`, error.message);
      }
    });

    await Promise.allSettled(promises);
  }

  /**
   * Get crawler statistics
   * @returns {Object} Statistics
   */
  getCrawlerStats() {
    const trendingStats = this.trendingService.getStats();
    const aggregatorMonitors = this.newsAggregator.getMonitorStatus();

    return {
      ...this.getStats(),
      trendingTopics: this.trendingTopics.size,
      discoveredArticles: this.discoveredArticles.length,
      lastRSSPoll: this.lastRSSPoll,
      lastAPIPoll: this.lastAPIPoll,
      monitoringActive: !!(this.monitoringInterval || this.activeMonitor),
      monitoringType: this.activeMonitor ? 'enhanced' : this.monitoringInterval ? 'basic' : 'none',
      activeMonitor: this.activeMonitor
        ? {
            id: this.activeMonitor.monitorId,
            interval: this.activeMonitor.interval,
          }
        : null,
      aggregatorMonitors: aggregatorMonitors.length,
      trendingService: {
        trackedTopics: trendingStats.trackedTopics,
        clusters: trendingStats.clusters,
        config: trendingStats.config,
      },
    };
  }

  /**
   * Cleanup crawler resources
   * @returns {Promise<void>}
   */
  async cleanup() {
    this.stopMonitoring();
    this.newsAggregator.stopAllMonitors(); // Cleanup all aggregator monitors
    this.trendingTopics.clear();
    this.discoveredArticles = [];
    this.trendingService.clearHistory();
    await super.cleanup();
  }
}

export default CrawlerAgent;
