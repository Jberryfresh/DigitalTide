/**
 * Credibility Scoring Service
 *
 * Calculates and tracks source credibility scores based on multiple factors:
 * - Source tier classification (Tier 1/2/3 from CONTENT_STRATEGY.md)
 * - Historical performance metrics
 * - Fact-checking results
 * - Content quality indicators
 * - Behavioral patterns
 *
 * Credibility Score Range: 0.0 - 1.0
 * - 0.90-1.00: Tier 1 Premium sources
 * - 0.70-0.89: Tier 2 Reliable sources
 * - 0.50-0.69: Tier 3 Supplementary sources
 * - 0.00-0.49: Unacceptable sources
 */

import redisCache from '../cache/redisCache.js';

class CredibilityService {
  constructor() {
    this.config = {
      // Base credibility scores by tier
      tier1BaseScore: 0.95,
      tier2BaseScore: 0.8,
      tier3BaseScore: 0.6,
      unknownBaseScore: 0.5,

      // Weight factors for score calculation
      weights: {
        tierClassification: 0.4, // Base tier score
        historicalPerformance: 0.25, // Success rate, accuracy
        contentQuality: 0.2, // Article quality metrics
        recencyFactor: 0.1, // Recent performance emphasis
        communityTrust: 0.05, // User engagement, feedback
      },

      // Performance thresholds
      minArticlesForHistory: 5, // Min articles before using historical data
      performanceWindow: 30 * 24 * 60 * 60 * 1000, // 30 days
      excellentPerformance: 0.9,
      goodPerformance: 0.75,
      poorPerformance: 0.5,

      // Decay factors
      scoreDecayRate: 0.02, // Score decreases by 2% per poor article
      scoreRecoveryRate: 0.01, // Score increases by 1% per good article
      maxScoreChange: 0.1, // Max score change per evaluation

      // Cache settings
      cacheEnabled: true,
      cacheTTL: 3600, // 1 hour
    };

    // Tier 1: Premium sources (0.90-1.00)
    this.tier1Sources = new Set([
      // Major News Wire Services
      'reuters.com',
      'apnews.com',
      'ap.org',
      'bbc.com',
      'bbc.co.uk',

      // Major International News
      'nytimes.com',
      'washingtonpost.com',
      'wsj.com',
      'ft.com',
      'economist.com',
      'theguardian.com',

      // Academic/Scientific
      'nature.com',
      'sciencemag.org',
      'thelancet.com',
      'nejm.org',
      'science.org',

      // Government/Official
      'gov.uk',
      'whitehouse.gov',
      'who.int',
      'cdc.gov',
      'nasa.gov',
    ]);

    // Tier 2: Reliable sources (0.70-0.89)
    this.tier2Sources = new Set([
      // Tech Publications
      'techcrunch.com',
      'theverge.com',
      'arstechnica.com',
      'wired.com',
      'cnet.com',

      // Regional/National News
      'npr.org',
      'pbs.org',
      'cbc.ca',
      'aljazeera.com',
      'dw.com',

      // Business/Finance
      'bloomberg.com',
      'forbes.com',
      'businessinsider.com',
      'cnbc.com',

      // Industry Publications
      'technologyreview.com',
      'scientificamerican.com',
      'newscientist.com',
    ]);

    // Tier 3: Supplementary sources (0.50-0.69)
    this.tier3Sources = new Set([
      'medium.com',
      'substack.com',
      'reddit.com',
      'twitter.com',
      'linkedin.com',
      'youtube.com',
    ]);

    // Blocked/Unreliable sources (0.00-0.49)
    this.blockedSources = new Set([
      // Satirical (should be marked clearly if used)
      'theonion.com',
      'clickhole.com',

      // Known misinformation (examples)
      'infowars.com',
      'naturalnews.com',
    ]);

    // Source history tracking
    this.sourceHistory = new Map();

    // Statistics
    this.stats = {
      evaluationsPerformed: 0,
      sourcesTracked: 0,
      tier1Count: 0,
      tier2Count: 0,
      tier3Count: 0,
      blockedCount: 0,
    };

    this.logger = console;
  }

  /**
   * Calculate credibility score for a source
   * @param {Object} source - Source information
   * @returns {Object} Credibility evaluation
   */
  calculateCredibility(source) {
    const { url = '', domain = '', name = '', historicalData = null, recentArticles = [] } = source;

    this.stats.evaluationsPerformed++;

    // Extract domain from URL if needed
    const sourceDomain = domain || this.extractDomain(url);

    // Check cache first (disabled for now due to async issues)
    // if (this.config.cacheEnabled) {
    //   const cached = this.getCachedCredibility(sourceDomain);
    //   if (cached) {
    //     return cached;
    //   }
    // }

    // Calculate base score from tier classification
    const tierEvaluation = this.classifySourceTier(sourceDomain, name);
    const { baseScore } = tierEvaluation;

    // Apply historical performance if available
    let historicalScore = baseScore;
    if (historicalData && historicalData.articleCount >= this.config.minArticlesForHistory) {
      historicalScore = this.calculateHistoricalScore(historicalData);
    } else if (this.sourceHistory.has(sourceDomain)) {
      const history = this.sourceHistory.get(sourceDomain);
      if (history.articles.length >= this.config.minArticlesForHistory) {
        historicalScore = this.calculateHistoricalScore(history);
      }
    }

    // Calculate content quality score from recent articles
    let contentQualityScore = baseScore;
    if (recentArticles.length > 0) {
      contentQualityScore = this.calculateContentQualityScore(recentArticles);
    }

    // Calculate recency factor (recent performance more important)
    const recencyFactor = this.calculateRecencyFactor(sourceDomain);

    // Weighted final score
    const finalScore =
      tierEvaluation.baseScore * this.config.weights.tierClassification +
      historicalScore * this.config.weights.historicalPerformance +
      contentQualityScore * this.config.weights.contentQuality +
      recencyFactor * this.config.weights.recencyFactor +
      baseScore * this.config.weights.communityTrust; // Community trust placeholder

    // Clamp to 0-1 range
    const clampedScore = Math.max(0, Math.min(1, finalScore));

    const result = {
      score: Math.round(clampedScore * 100) / 100,
      tier: tierEvaluation.tier,
      domain: sourceDomain,
      name: name || sourceDomain,
      confidence: this.calculateConfidence(sourceDomain, recentArticles.length),
      factors: {
        tierClassification: Math.round(tierEvaluation.baseScore * 100) / 100,
        historicalPerformance: Math.round(historicalScore * 100) / 100,
        contentQuality: Math.round(contentQualityScore * 100) / 100,
        recencyFactor: Math.round(recencyFactor * 100) / 100,
      },
      metadata: {
        articlesAnalyzed: recentArticles.length,
        hasHistoricalData: historicalData !== null || this.sourceHistory.has(sourceDomain),
        timestamp: new Date().toISOString(),
      },
    };

    // Cache the result (disabled for now due to async issues)
    // if (this.config.cacheEnabled) {
    //   this.cacheCredibility(sourceDomain, result);
    // }

    return result;
  }

  /**
   * Classify source into tier
   * @param {string} domain - Source domain
   * @param {string} name - Source name
   * @returns {Object} Tier classification
   */
  classifySourceTier(domain, name = '') {
    const domainLower = domain.toLowerCase();
    const nameLower = name.toLowerCase();

    // Check blocked first
    if (this.isBlocked(domainLower)) {
      this.stats.blockedCount++;
      return {
        tier: 'blocked',
        baseScore: 0.0,
        reason: 'Source is on blocked list',
      };
    }

    // Tier 1: Premium sources
    if (this.isTier1(domainLower, nameLower)) {
      this.stats.tier1Count++;
      return {
        tier: 1,
        baseScore: this.config.tier1BaseScore,
        reason: 'Premium news source',
      };
    }

    // Tier 2: Reliable sources
    if (this.isTier2(domainLower, nameLower)) {
      this.stats.tier2Count++;
      return {
        tier: 2,
        baseScore: this.config.tier2BaseScore,
        reason: 'Reliable news source',
      };
    }

    // Tier 3: Supplementary sources
    if (this.isTier3(domainLower, nameLower)) {
      this.stats.tier3Count++;
      return {
        tier: 3,
        baseScore: this.config.tier3BaseScore,
        reason: 'Supplementary source',
      };
    }

    // Unknown source - neutral score
    return {
      tier: 'unknown',
      baseScore: this.config.unknownBaseScore,
      reason: 'Unknown source, neutral credibility',
    };
  }

  /**
   * Calculate historical performance score
   * @param {Object} historicalData - Historical metrics
   * @returns {number} Historical score
   */
  calculateHistoricalScore(historicalData) {
    const {
      articleCount = 0,
      successRate = 1.0,
      avgQuality = 0.5,
      factCheckScore = 0.5,
      errorRate = 0.0,
    } = historicalData;

    // Not enough data yet
    if (articleCount < this.config.minArticlesForHistory) {
      return this.config.unknownBaseScore;
    }

    // Calculate weighted score
    const performanceScore =
      successRate * 0.4 + avgQuality * 0.3 + factCheckScore * 0.2 + (1 - errorRate) * 0.1;

    return Math.max(0, Math.min(1, performanceScore));
  }

  /**
   * Calculate content quality score from recent articles
   * @param {Array} articles - Recent articles
   * @returns {number} Quality score
   */
  calculateContentQualityScore(articles) {
    if (articles.length === 0) {
      return this.config.unknownBaseScore;
    }

    const qualityMetrics = articles.map(article => {
      let score = 0.5; // Base score

      // Title quality (20%)
      if (article.title && article.title.length >= 30 && article.title.length <= 150) {
        score += 0.1;
      }

      // Content completeness (30%)
      const contentLength = (article.content || article.description || '').length;
      if (contentLength >= 500) {
        score += 0.15;
      } else if (contentLength >= 200) {
        score += 0.1;
      } else if (contentLength >= 100) {
        score += 0.05;
      }

      // Has image (10%)
      if (article.image || article.imageUrl || article.urlToImage) {
        score += 0.05;
      }

      // Has author (10%)
      if (article.author && article.author !== 'Unknown') {
        score += 0.05;
      }

      // Publication date (10%)
      if (article.publishedAt || article.published_at) {
        score += 0.05;
      }

      // Source attribution (10%)
      if (article.source && article.source.name) {
        score += 0.05;
      }

      // Clean URL (10%)
      if (article.url && !article.url.includes('utm_') && article.url.startsWith('http')) {
        score += 0.05;
      }

      return Math.max(0, Math.min(1, score));
    });

    // Average quality with recency bias (recent articles weighted higher)
    const weights = qualityMetrics.map((_, index) => {
      const position = qualityMetrics.length - index; // More recent = higher position
      return position / qualityMetrics.length;
    });

    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    const weightedScore =
      qualityMetrics.reduce((sum, score, index) => sum + score * weights[index], 0) / totalWeight;

    return weightedScore;
  }

  /**
   * Calculate recency factor (emphasis on recent performance)
   * @param {string} domain - Source domain
   * @returns {number} Recency factor
   */
  calculateRecencyFactor(domain) {
    if (!this.sourceHistory.has(domain)) {
      return 0.5; // Neutral for new sources
    }

    const history = this.sourceHistory.get(domain);
    const now = Date.now();
    const recentWindow = 7 * 24 * 60 * 60 * 1000; // 7 days

    // Filter articles in recent window
    const recentArticles = history.articles.filter(
      article => now - article.timestamp < recentWindow
    );

    if (recentArticles.length === 0) {
      return 0.5; // No recent data
    }

    // Calculate average quality of recent articles
    const avgRecentQuality =
      recentArticles.reduce((sum, article) => sum + (article.quality || 0.5), 0) /
      recentArticles.length;

    return avgRecentQuality;
  }

  /**
   * Calculate confidence in the credibility score
   * @param {string} domain - Source domain
   * @param {number} articleCount - Number of articles analyzed
   * @returns {number} Confidence score (0-1)
   */
  calculateConfidence(domain, articleCount) {
    // Known tier sources have high confidence
    if (this.tier1Sources.has(domain)) return 0.95;
    if (this.tier2Sources.has(domain)) return 0.9;
    if (this.tier3Sources.has(domain)) return 0.75;
    if (this.blockedSources.has(domain)) return 1.0;

    // Unknown sources - confidence based on data availability
    const historyCount = this.sourceHistory.has(domain)
      ? this.sourceHistory.get(domain).articles.length
      : 0;

    const totalData = articleCount + historyCount;

    if (totalData >= 50) return 0.85;
    if (totalData >= 20) return 0.7;
    if (totalData >= 10) return 0.6;
    if (totalData >= 5) return 0.5;
    return 0.3; // Low confidence for new sources
  }

  /**
   * Update source history with new article data
   * @param {Object} article - Article to track
   * @returns {void}
   */
  updateSourceHistory(article) {
    const domain = this.extractDomain(article.url || article.link);
    if (!domain) return;

    if (!this.sourceHistory.has(domain)) {
      this.sourceHistory.set(domain, {
        domain,
        articles: [],
        totalArticles: 0,
        successfulArticles: 0,
        failedArticles: 0,
        avgQuality: 0.5,
        lastUpdated: Date.now(),
      });
      this.stats.sourcesTracked++;
    }

    const history = this.sourceHistory.get(domain);

    // Add article to history
    history.articles.push({
      timestamp: Date.now(),
      quality: article.quality || article.curationScore || 0.5,
      success: article.success !== false,
    });

    // Update counters
    history.totalArticles++;
    if (article.success !== false) {
      history.successfulArticles++;
    } else {
      history.failedArticles++;
    }

    // Calculate average quality
    history.avgQuality =
      history.articles.reduce((sum, a) => sum + a.quality, 0) / history.articles.length;

    history.lastUpdated = Date.now();

    // Keep only recent articles (performance window)
    const cutoff = Date.now() - this.config.performanceWindow;
    history.articles = history.articles.filter(a => a.timestamp > cutoff);

    // Clear cache for this domain
    if (this.config.cacheEnabled) {
      this.clearCachedCredibility(domain);
    }
  }

  /**
   * Batch evaluate multiple sources
   * @param {Array} sources - Array of source objects
   * @returns {Array} Credibility evaluations
   */
  batchEvaluate(sources) {
    return sources.map(source => this.calculateCredibility(source));
  }

  /**
   * Get credibility for a URL
   * @param {string} url - Article URL
   * @returns {Object} Credibility evaluation
   */
  getCredibilityForUrl(url) {
    const domain = this.extractDomain(url);
    return this.calculateCredibility({ domain, url });
  }

  /**
   * Extract domain from URL
   * @param {string} url - Full URL
   * @returns {string} Domain
   */
  extractDomain(url) {
    if (!url) return '';

    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace(/^www\./, '');
    } catch (error) {
      // Fallback for invalid URLs
      const match = url.match(/https?:\/\/(?:www\.)?([^\/]+)/);
      return match ? match[1] : '';
    }
  }

  /**
   * Check if source is Tier 1
   */
  isTier1(domain, name) {
    if (this.tier1Sources.has(domain)) return true;

    // Check by name patterns
    const tier1Patterns = ['reuters', 'associated press', 'bbc news', 'new york times'];
    return tier1Patterns.some(pattern => name.includes(pattern));
  }

  /**
   * Check if source is Tier 2
   */
  isTier2(domain, name) {
    if (this.tier2Sources.has(domain)) return true;

    const tier2Patterns = ['npr', 'pbs', 'guardian', 'techcrunch', 'bloomberg'];
    return tier2Patterns.some(pattern => name.includes(pattern));
  }

  /**
   * Check if source is Tier 3
   */
  isTier3(domain, name) {
    return this.tier3Sources.has(domain);
  }

  /**
   * Check if source is blocked
   */
  isBlocked(domain) {
    return this.blockedSources.has(domain);
  }

  /**
   * Cache credibility evaluation
   */
  cacheCredibility(domain, evaluation) {
    const cacheKey = `credibility:${domain}`;
    redisCache.set(cacheKey, evaluation, this.config.cacheTTL);
  }

  /**
   * Get cached credibility evaluation
   */
  getCachedCredibility(domain) {
    const cacheKey = `credibility:${domain}`;
    return redisCache.get(cacheKey);
  }

  /**
   * Clear cached credibility
   */
  clearCachedCredibility(domain) {
    const cacheKey = `credibility:${domain}`;
    redisCache.del(cacheKey);
  }

  /**
   * Get service statistics
   * @returns {Object} Statistics
   */
  getStats() {
    return {
      ...this.stats,
      sourceHistorySize: this.sourceHistory.size,
      tier1Sources: this.tier1Sources.size,
      tier2Sources: this.tier2Sources.size,
      tier3Sources: this.tier3Sources.size,
      blockedSources: this.blockedSources.size,
    };
  }

  /**
   * Clear all history
   * @returns {void}
   */
  clearHistory() {
    this.sourceHistory.clear();
    this.stats.sourcesTracked = 0;
  }

  /**
   * Export source history for persistence
   * @returns {Array} History data
   */
  exportHistory() {
    return Array.from(this.sourceHistory.entries()).map(([domain, history]) => ({
      domain,
      ...history,
    }));
  }

  /**
   * Import source history from persistence
   * @param {Array} historyData - History data
   * @returns {void}
   */
  importHistory(historyData) {
    historyData.forEach(entry => {
      const { domain, ...history } = entry;
      this.sourceHistory.set(domain, history);
    });
    this.stats.sourcesTracked = this.sourceHistory.size;
  }
}

// Export singleton instance
const credibilityService = new CredibilityService();
export default credibilityService;
