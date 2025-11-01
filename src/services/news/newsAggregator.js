/**
 * Multi-Source News Aggregator
 * Advanced aggregation system with source prioritization, reputation tracking,
 * and intelligent article selection
 */

import serpApiClient from './serpApiClient.js';
import mediaStackClient from './mediaStackClient.js';
import rssService from './rssService.js';
import redisCache from '../cache/redisCache.js';
import config from '../../config/index.js';

class NewsAggregator {
  constructor() {
    // Register all available news sources
    this.sources = {
      serpapi: {
        client: serpApiClient,
        type: 'api',
        priority: 90, // High priority - good quality
        credibility: 0.85,
        costPerRequest: 0.01, // Estimated cost
        quotaLimit: 100, // Monthly limit
        enabled: !!config.news.serpApiKey,
        categories: ['general', 'business', 'technology', 'science', 'health'],
        countries: ['us', 'uk', 'ca', 'au'],
        languages: ['en'],
      },
      mediastack: {
        client: mediaStackClient,
        type: 'api',
        priority: 80, // Good priority
        credibility: 0.8,
        costPerRequest: 0.005,
        quotaLimit: 500,
        enabled: !!config.news.mediaStackApiKey,
        categories: [
          'general',
          'business',
          'technology',
          'entertainment',
          'sports',
          'science',
          'health',
        ],
        countries: ['us', 'gb', 'ca', 'au', 'de', 'fr'],
        languages: ['en', 'de', 'fr'],
      },
      rss: {
        client: rssService,
        type: 'rss',
        priority: 70, // Good priority - free and reliable
        credibility: 0.9, // High credibility (curated feeds)
        costPerRequest: 0, // Free
        quotaLimit: Infinity,
        enabled: true,
        categories: ['general', 'business', 'technology', 'science', 'health'],
        countries: ['us', 'uk', 'global'],
        languages: ['en'],
      },
    };

    // Source reputation tracking
    this.sourceReputation = new Map();
    this.initializeReputations();

    // Aggregation statistics
    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      totalArticles: 0,
      deduplicatedArticles: 0,
      sourceUsage: {},
    };

    this.cacheTTL = config.news.cacheTTL || 300;
  }

  /**
   * Initialize reputation scores for all sources
   */
  initializeReputations() {
    Object.keys(this.sources).forEach(sourceName => {
      this.sourceReputation.set(sourceName, {
        successRate: 1.0,
        avgResponseTime: 1000,
        avgArticleQuality: 0.8,
        totalRequests: 0,
        failedRequests: 0,
        lastFailure: null,
        consecutiveFailures: 0,
      });
    });
  }

  /**
   * Fetch news from multiple sources with intelligent prioritization
   * @param {Object} options - Aggregation options
   * @returns {Promise<Object>} Aggregated and prioritized articles
   */
  async aggregateFromMultipleSources(options = {}) {
    const {
      query = null,
      category = null,
      country = 'us',
      language = 'en',
      limit = 50,
      sourcePriority = 'balanced', // 'balanced', 'quality', 'speed', 'cost'
      enabledSources = null, // null = all, or array of source names
      useCache = true,
      deduplication = true,
      minCredibility = 0.0,
      sortBy = 'publishedAt', // 'publishedAt', 'relevance', 'quality'
    } = options;

    const startTime = Date.now();

    // Generate cache key
    const cacheKey = redisCache.generateNewsKey({
      source: 'aggregated',
      query,
      category,
      country,
      language,
      limit,
      priority: sourcePriority,
    });

    // Try cache
    if (useCache) {
      try {
        const cached = await redisCache.get(cacheKey);
        if (cached) {
          console.log(`📦 [NewsAggregator] Cache HIT: ${cacheKey}`);
          cached.metadata.fromCache = true;
          return cached;
        }
      } catch (error) {
        console.error('[NewsAggregator] Cache read error:', error.message);
      }
    }

    // Select and prioritize sources
    const selectedSources = this.selectSources({
      enabledSources,
      category,
      country,
      language,
      sourcePriority,
    });

    console.log(
      `📰 [NewsAggregator] Selected ${selectedSources.length} sources:`,
      selectedSources.map(s => `${s.name} (priority: ${s.effectivePriority})`)
    );

    // Fetch from sources in priority order (with parallel execution per priority tier)
    const results = await this.fetchFromSources(selectedSources, {
      query,
      category,
      country,
      language,
      limit: Math.ceil(limit / selectedSources.length), // Distribute limit across sources
    });

    // Aggregate results
    const aggregated = {
      articles: results.articles,
      metadata: {
        totalFetched: results.totalFetched,
        sources: results.sourceResults,
        errors: results.errors,
        deduplicated: 0,
        filtered: 0,
        aggregationTime: Date.now() - startTime,
        fromCache: false,
        sourcePriority,
        selectedSources: selectedSources.length,
      },
    };

    // Deduplicate if enabled
    if (deduplication) {
      const beforeDedup = aggregated.articles.length;
      aggregated.articles = this.deduplicateArticles(aggregated.articles);
      aggregated.metadata.deduplicated = beforeDedup - aggregated.articles.length;
    }

    // Filter by credibility
    if (minCredibility > 0) {
      const beforeFilter = aggregated.articles.length;
      aggregated.articles = aggregated.articles.filter(
        article => (article.source?.credibility || 0) >= minCredibility
      );
      aggregated.metadata.filtered = beforeFilter - aggregated.articles.length;
    }

    // Sort articles
    aggregated.articles = this.sortArticles(aggregated.articles, sortBy);

    // Limit final results
    if (aggregated.articles.length > limit) {
      aggregated.articles = aggregated.articles.slice(0, limit);
    }

    // Update statistics
    this.updateStats(aggregated);

    // Cache results
    if (useCache) {
      try {
        await redisCache.set(cacheKey, aggregated, this.cacheTTL);
        console.log(`💾 [NewsAggregator] Cached results: ${cacheKey}`);
      } catch (error) {
        console.error('[NewsAggregator] Cache write error:', error.message);
      }
    }

    return aggregated;
  }

  /**
   * Select and prioritize sources based on criteria
   * @param {Object} options - Selection criteria
   * @returns {Array} Selected sources with effective priority scores
   */
  selectSources(options) {
    const { enabledSources, category, country, language, sourcePriority } = options;

    // Filter available sources
    let availableSources = Object.entries(this.sources)
      .filter(([name, source]) => {
        // Check if source is enabled
        if (!source.enabled) return false;

        // Check if source is in enabledSources list
        if (enabledSources && !enabledSources.includes(name)) return false;

        // Check if source supports requested category
        if (category && !source.categories.includes(category)) return false;

        // Check if source supports requested country
        if (country && !source.countries.includes(country) && !source.countries.includes('global'))
          return false;

        // Check if source supports requested language
        if (language && !source.languages.includes(language)) return false;

        // Check reputation (skip if too many consecutive failures)
        const reputation = this.sourceReputation.get(name);
        if (reputation.consecutiveFailures >= 3) return false;

        return true;
      })
      .map(([name, source]) => ({
        name,
        ...source,
      }));

    // Calculate effective priority based on strategy
    availableSources = availableSources.map(source => {
      const reputation = this.sourceReputation.get(source.name);
      let effectivePriority = source.priority;

      switch (sourcePriority) {
        case 'quality':
          // Prioritize credibility and quality
          effectivePriority =
            source.priority * 0.3 +
            source.credibility * 50 +
            reputation.avgArticleQuality * 30 +
            reputation.successRate * 20;
          break;

        case 'speed':
          // Prioritize response time and success rate
          effectivePriority =
            source.priority * 0.4 +
            (1000 / Math.max(reputation.avgResponseTime, 100)) * 40 +
            reputation.successRate * 20;
          break;

        case 'cost':
          // Prioritize free/cheap sources
          effectivePriority =
            source.priority * 0.3 +
            (source.costPerRequest === 0 ? 50 : (1 / source.costPerRequest) * 20) +
            reputation.successRate * 20;
          break;

        case 'balanced':
        default:
          // Balanced approach
          effectivePriority =
            source.priority * 0.4 +
            source.credibility * 20 +
            reputation.successRate * 20 +
            (source.costPerRequest === 0 ? 20 : 0);
          break;
      }

      return {
        ...source,
        effectivePriority,
        reputation,
      };
    });

    // Sort by effective priority (highest first)
    availableSources.sort((a, b) => b.effectivePriority - a.effectivePriority);

    return availableSources;
  }

  /**
   * Fetch articles from multiple sources
   * @param {Array} sources - Selected sources
   * @param {Object} options - Fetch options
   * @returns {Promise<Object>} Combined results
   */
  async fetchFromSources(sources, options) {
    const results = {
      articles: [],
      totalFetched: 0,
      sourceResults: {},
      errors: [],
    };

    // Fetch from all sources in parallel
    const fetchPromises = sources.map(async source => {
      const startTime = Date.now();
      const reputation = this.sourceReputation.get(source.name);

      try {
        let articles = [];

        // Fetch based on source type
        if (source.type === 'api') {
          articles = await this.fetchFromApiSource(source, options);
        } else if (source.type === 'rss') {
          articles = await this.fetchFromRssSource(source, options);
        }

        // Update reputation on success
        const responseTime = Date.now() - startTime;
        this.updateSourceReputation(source.name, {
          success: true,
          responseTime,
          articleCount: articles.length,
        });

        results.sourceResults[source.name] = {
          count: articles.length,
          status: 'success',
          responseTime,
          credibility: source.credibility,
          priority: source.effectivePriority,
        };

        return articles;
      } catch (error) {
        // Update reputation on failure
        this.updateSourceReputation(source.name, {
          success: false,
          error: error.message,
        });

        results.sourceResults[source.name] = {
          count: 0,
          status: 'failed',
          error: error.message,
          priority: source.effectivePriority,
        };

        results.errors.push({
          source: source.name,
          error: error.message,
          timestamp: new Date().toISOString(),
        });

        return [];
      }
    });

    // Wait for all fetches
    const allArticles = await Promise.all(fetchPromises);
    results.articles = allArticles.flat();
    results.totalFetched = results.articles.length;

    return results;
  }

  /**
   * Fetch from API-based source
   * @param {Object} source - Source configuration
   * @param {Object} options - Fetch options
   * @returns {Promise<Array>} Articles
   */
  async fetchFromApiSource(source, options) {
    const { query, category, country, language, limit } = options;

    if (source.name === 'serpapi') {
      return await source.client.fetchNews({
        query: query || category || 'latest news',
        country,
        language,
        limit,
      });
    }

    if (source.name === 'mediastack') {
      const response = await source.client.fetchNews({
        query,
        categories: category,
        countries: country,
        languages: language,
        limit,
      });
      return response.articles || [];
    }

    throw new Error(`Unknown API source: ${source.name}`);
  }

  /**
   * Fetch from RSS-based source
   * @param {Object} source - Source configuration
   * @param {Object} options - Fetch options
   * @returns {Promise<Array>} Articles
   */
  async fetchFromRssSource(source, options) {
    const { category, limit } = options;

    // Get feeds matching category
    const feeds = source.client.getDefaultFeeds();
    const categoryFeeds = category ? feeds.filter(feed => feed.category === category) : feeds;

    // Parse multiple feeds
    const result = await source.client.parseMultipleFeeds(
      categoryFeeds.map(feed => feed.url),
      { maxArticles: limit }
    );

    return result.articles || [];
  }

  /**
   * Update source reputation based on performance
   * @param {string} sourceName - Source name
   * @param {Object} data - Performance data
   */
  updateSourceReputation(sourceName, data) {
    const reputation = this.sourceReputation.get(sourceName);
    if (!reputation) return;

    reputation.totalRequests += 1;

    if (data.success) {
      // Success - update positive metrics
      reputation.consecutiveFailures = 0;
      reputation.successRate =
        (reputation.successRate * (reputation.totalRequests - 1) + 1) / reputation.totalRequests;

      if (data.responseTime) {
        reputation.avgResponseTime =
          (reputation.avgResponseTime * (reputation.totalRequests - 1) + data.responseTime) /
          reputation.totalRequests;
      }

      if (data.articleCount) {
        // Estimate quality based on article count (more articles generally = better)
        const qualityScore = Math.min(data.articleCount / 10, 1);
        reputation.avgArticleQuality =
          (reputation.avgArticleQuality * (reputation.totalRequests - 1) + qualityScore) /
          reputation.totalRequests;
      }
    } else {
      // Failure - update negative metrics
      reputation.failedRequests += 1;
      reputation.consecutiveFailures += 1;
      reputation.lastFailure = new Date().toISOString();
      reputation.successRate =
        (reputation.successRate * (reputation.totalRequests - 1)) / reputation.totalRequests;
    }

    this.sourceReputation.set(sourceName, reputation);
  }

  /**
   * Deduplicate articles based on URL and title similarity
   * @param {Array} articles - Articles to deduplicate
   * @returns {Array} Deduplicated articles
   */
  deduplicateArticles(articles) {
    const seen = new Map();
    const deduplicated = [];

    articles.forEach(article => {
      // Generate deduplication key
      const url = article.link || article.url;
      const title = article.title?.toLowerCase().trim();

      // Check URL match
      if (url && seen.has(url)) {
        return; // Skip duplicate
      }

      // Check title similarity (simple approach - exact match)
      if (title) {
        const titleKey = title.substring(0, 50); // First 50 chars
        if (Array.from(seen.values()).some(key => key.startsWith(titleKey))) {
          return; // Skip similar title
        }
        seen.set(url || `title_${seen.size}`, titleKey);
      }

      deduplicated.push(article);
    });

    return deduplicated;
  }

  /**
   * Sort articles by specified criteria
   * @param {Array} articles - Articles to sort
   * @param {string} sortBy - Sort criteria
   * @returns {Array} Sorted articles
   */
  sortArticles(articles, sortBy) {
    switch (sortBy) {
      case 'publishedAt':
        return articles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

      case 'quality':
        return articles.sort((a, b) => {
          const qualityA =
            (a.source?.credibility || 0.5) * (a.description ? 1.2 : 1) * (a.imageUrl ? 1.1 : 1);
          const qualityB =
            (b.source?.credibility || 0.5) * (b.description ? 1.2 : 1) * (b.imageUrl ? 1.1 : 1);
          return qualityB - qualityA;
        });

      case 'relevance':
        // If no relevance score, fall back to published date
        return articles.sort(
          (a, b) =>
            (b.relevanceScore || 0) - (a.relevanceScore || 0) ||
            new Date(b.publishedAt) - new Date(a.publishedAt)
        );

      default:
        return articles;
    }
  }

  /**
   * Update aggregation statistics
   * @param {Object} aggregated - Aggregated results
   */
  updateStats(aggregated) {
    this.stats.totalRequests += 1;
    this.stats.totalArticles += aggregated.metadata.totalFetched;
    this.stats.deduplicatedArticles += aggregated.metadata.deduplicated;

    // Update source usage stats
    Object.entries(aggregated.metadata.sources).forEach(([source, data]) => {
      if (!this.stats.sourceUsage[source]) {
        this.stats.sourceUsage[source] = { requests: 0, articles: 0, failures: 0 };
      }
      this.stats.sourceUsage[source].requests += 1;
      this.stats.sourceUsage[source].articles += data.count;
      if (data.status === 'failed') {
        this.stats.sourceUsage[source].failures += 1;
      }
    });
  }

  /**
   * Get aggregator statistics
   * @returns {Object} Statistics
   */
  getStats() {
    return {
      ...this.stats,
      sourceReputations: Object.fromEntries(this.sourceReputation),
      availableSources: Object.keys(this.sources).filter(name => this.sources[name].enabled),
    };
  }

  /**
   * Get source information
   * @returns {Object} Source details
   */
  getSourceInfo() {
    return Object.entries(this.sources).map(([name, source]) => ({
      name,
      type: source.type,
      enabled: source.enabled,
      priority: source.priority,
      credibility: source.credibility,
      costPerRequest: source.costPerRequest,
      quotaLimit: source.quotaLimit,
      categories: source.categories,
      countries: source.countries,
      languages: source.languages,
      reputation: this.sourceReputation.get(name),
    }));
  }

  /**
   * Reset source reputation (for testing or recovery)
   * @param {string} sourceName - Source to reset (or null for all)
   */
  resetReputation(sourceName = null) {
    if (sourceName) {
      const source = this.sources[sourceName];
      if (source) {
        this.sourceReputation.set(sourceName, {
          successRate: 1.0,
          avgResponseTime: 1000,
          avgArticleQuality: 0.8,
          totalRequests: 0,
          failedRequests: 0,
          lastFailure: null,
          consecutiveFailures: 0,
        });
      }
    } else {
      this.initializeReputations();
    }
  }
}

// Export singleton instance
const newsAggregator = new NewsAggregator();
export default newsAggregator;
