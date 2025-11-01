/**
 * Trending Topics Analysis Service
 * Advanced algorithms for detecting, scoring, and tracking trending topics
 */

class TrendingService {
  constructor(config = {}) {
    this.config = {
      // Trending thresholds
      minMentions: config.minMentions || 3,
      minVelocity: config.minVelocity || 0.5, // mentions per hour

      // Time windows
      shortWindow: config.shortWindow || 3600000, // 1 hour
      mediumWindow: config.mediumWindow || 14400000, // 4 hours
      longWindow: config.longWindow || 86400000, // 24 hours

      // Scoring weights
      velocityWeight: config.velocityWeight || 0.4,
      volumeWeight: config.volumeWeight || 0.3,
      recencyWeight: config.recencyWeight || 0.2,
      credibilityWeight: config.credibilityWeight || 0.1,

      // Clustering
      similarityThreshold: config.similarityThreshold || 0.6,
      maxClusterSize: config.maxClusterSize || 10,

      // Keyword extraction
      minKeywordLength: config.minKeywordLength || 2, // Allow short acronyms like "AI"
      maxKeywordLength: config.maxKeywordLength || 20,
    };

    // Trend history tracking
    this.trendHistory = new Map(); // keyword -> history data
    this.topicClusters = new Map(); // cluster ID -> topics
  } /**
   * Analyze articles and detect trending topics with advanced scoring
   * @param {Array} articles - Articles to analyze
   * @param {Object} options - Analysis options
   * @returns {Object} Trending topics with scores and metadata
   */

  analyzeTrending(articles, options = {}) {
    const now = Date.now();
    const { limit = 20, includeLifecycle = true, includeClusters = true } = options;

    // Extract topics with timestamps
    const topicData = this.extractTopicsFromArticles(articles);

    // Calculate trend scores
    const scoredTopics = this.calculateTrendScores(topicData, now);

    // Filter by minimum thresholds
    const filteredTopics = scoredTopics.filter(
      topic =>
        topic.mentions >= this.config.minMentions && topic.velocity >= this.config.minVelocity
    );

    // Sort by trend score
    const sortedTopics = filteredTopics.sort((a, b) => b.trendScore - a.trendScore);

    // Apply limit
    const topTrending = sortedTopics.slice(0, limit);

    // Add lifecycle analysis if requested
    if (includeLifecycle) {
      topTrending.forEach(topic => {
        topic.lifecycle = this.determineLifecycle(topic);
      });
    }

    // Cluster similar topics if requested
    let clusters = [];
    if (includeClusters) {
      clusters = this.clusterTopics(topTrending);
    }

    // Update trend history
    this.updateTrendHistory(topTrending, now);

    return {
      trending: topTrending,
      clusters,
      metadata: {
        totalTopics: scoredTopics.length,
        trendingCount: topTrending.length,
        timeWindow: {
          short: this.config.shortWindow / 1000,
          medium: this.config.mediumWindow / 1000,
          long: this.config.longWindow / 1000,
        },
        timestamp: new Date(now).toISOString(),
      },
    };
  }

  /**
   * Extract topics from articles with metadata
   * @param {Array} articles - Articles to extract from
   * @returns {Map} Topic data map
   */
  extractTopicsFromArticles(articles) {
    const topicData = new Map();

    articles.forEach(article => {
      const keywords = this.extractKeywords(`${article.title} ${article.description || ''}`, {
        minLength: this.config.minKeywordLength,
        maxLength: this.config.maxKeywordLength,
      });

      const timestamp = new Date(article.publishedAt).getTime();
      const credibility = article.source?.credibility || 0.5;

      keywords.forEach(keyword => {
        if (!topicData.has(keyword)) {
          topicData.set(keyword, {
            keyword,
            mentions: [],
            articles: [],
          });
        }

        const data = topicData.get(keyword);
        data.mentions.push({
          timestamp,
          credibility,
        });
        data.articles.push({
          title: article.title,
          link: article.link,
          source: article.source?.name || 'Unknown',
          publishedAt: article.publishedAt,
          credibility,
        });
      });
    });

    return topicData;
  }

  /**
   * Calculate comprehensive trend scores for topics
   * @param {Map} topicData - Topic data map
   * @param {number} now - Current timestamp
   * @returns {Array} Topics with calculated scores
   */
  calculateTrendScores(topicData, now) {
    const topics = [];

    topicData.forEach((data, keyword) => {
      const { mentions } = data;
      const { articles } = data;

      // Calculate velocity (mentions per hour)
      const velocity = this.calculateVelocity(mentions, now);

      // Calculate volume score (total mentions)
      const volumeScore = Math.min(mentions.length / 10, 1); // Normalize to 0-1

      // Calculate recency score (how recent are the mentions)
      const recencyScore = this.calculateRecencyScore(mentions, now);

      // Calculate credibility score (average source credibility)
      const credibilityScore = this.calculateCredibilityScore(mentions);

      // Calculate weighted trend score
      const trendScore =
        velocity.normalized * this.config.velocityWeight +
        volumeScore * this.config.volumeWeight +
        recencyScore * this.config.recencyWeight +
        credibilityScore * this.config.credibilityWeight;

      // Get time distribution
      const distribution = this.getTimeDistribution(mentions, now);

      topics.push({
        keyword,
        mentions: mentions.length,
        velocity: velocity.raw,
        velocityNormalized: velocity.normalized,
        trendScore,
        scores: {
          velocity: velocity.normalized,
          volume: volumeScore,
          recency: recencyScore,
          credibility: credibilityScore,
        },
        distribution,
        articles: articles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)),
        firstSeen: new Date(Math.min(...mentions.map(m => m.timestamp))).toISOString(),
        lastSeen: new Date(Math.max(...mentions.map(m => m.timestamp))).toISOString(),
      });
    });

    return topics;
  }

  /**
   * Calculate velocity (mentions per hour)
   * @param {Array} mentions - Mention timestamps
   * @param {number} now - Current timestamp
   * @returns {Object} Raw and normalized velocity
   */
  calculateVelocity(mentions, now) {
    // Count mentions in short window (1 hour)
    const shortWindowMentions = mentions.filter(
      m => now - m.timestamp <= this.config.shortWindow
    ).length;

    // Count mentions in medium window (4 hours)
    const mediumWindowMentions = mentions.filter(
      m => now - m.timestamp <= this.config.mediumWindow
    ).length;

    // Raw velocity (mentions per hour in short window)
    const raw = shortWindowMentions / (this.config.shortWindow / 3600000);

    // Acceleration factor (comparing short vs medium window)
    const mediumVelocity = mediumWindowMentions / (this.config.mediumWindow / 3600000);
    const acceleration = mediumVelocity > 0 ? raw / mediumVelocity : 1;

    // Normalized velocity (0-1 scale with acceleration boost)
    const normalized = Math.min((raw * acceleration) / 5, 1);

    return {
      raw,
      normalized,
      acceleration,
      shortWindow: shortWindowMentions,
      mediumWindow: mediumWindowMentions,
    };
  }

  /**
   * Calculate recency score (how recent are mentions)
   * @param {Array} mentions - Mention data
   * @param {number} now - Current timestamp
   * @returns {number} Recency score (0-1)
   */
  calculateRecencyScore(mentions, now) {
    if (mentions.length === 0) return 0;

    // Calculate average age of mentions
    const averageAge = mentions.reduce((sum, m) => sum + (now - m.timestamp), 0) / mentions.length;

    // Normalize to 0-1 (inverse - newer is better)
    // Score decreases as average age increases
    const maxAge = this.config.mediumWindow;
    return Math.max(0, 1 - averageAge / maxAge);
  }

  /**
   * Calculate credibility score from mentions
   * @param {Array} mentions - Mention data with credibility
   * @returns {number} Average credibility (0-1)
   */
  calculateCredibilityScore(mentions) {
    if (mentions.length === 0) return 0;

    const totalCredibility = mentions.reduce((sum, m) => sum + m.credibility, 0);

    return totalCredibility / mentions.length;
  }

  /**
   * Get time distribution of mentions
   * @param {Array} mentions - Mention timestamps
   * @param {number} now - Current timestamp
   * @returns {Object} Distribution data
   */
  getTimeDistribution(mentions, now) {
    const hourAgo = now - 3600000;
    const fourHoursAgo = now - 14400000;
    const dayAgo = now - 86400000;

    return {
      lastHour: mentions.filter(m => m.timestamp >= hourAgo).length,
      last4Hours: mentions.filter(m => m.timestamp >= fourHoursAgo).length,
      last24Hours: mentions.filter(m => m.timestamp >= dayAgo).length,
    };
  }

  /**
   * Determine lifecycle stage of trending topic
   * @param {Object} topic - Topic data
   * @returns {Object} Lifecycle information
   */
  determineLifecycle(topic) {
    const history = this.trendHistory.get(topic.keyword);

    if (!history || history.length < 2) {
      return {
        stage: 'emerging',
        confidence: 0.5,
        description: 'Newly detected trend',
      };
    }

    // Compare current velocity with historical
    const currentVelocity = topic.velocity;
    const previousVelocity = history[history.length - 1].velocity;
    const velocityChange = currentVelocity - previousVelocity;
    const velocityChangePercent =
      previousVelocity > 0 ? (velocityChange / previousVelocity) * 100 : 0;

    // Determine stage based on velocity trend
    let stage;
    let confidence;
    let description;

    if (velocityChangePercent > 50) {
      stage = 'emerging';
      confidence = 0.8;
      description = `Rapidly rising (+${velocityChangePercent.toFixed(0)}%)`;
    } else if (velocityChangePercent > 10) {
      stage = 'rising';
      confidence = 0.9;
      description = `Gaining momentum (+${velocityChangePercent.toFixed(0)}%)`;
    } else if (velocityChangePercent >= -10) {
      stage = 'peak';
      confidence = 0.9;
      description = 'At peak popularity';
    } else if (velocityChangePercent >= -50) {
      stage = 'declining';
      confidence = 0.8;
      description = `Losing momentum (${velocityChangePercent.toFixed(0)}%)`;
    } else {
      stage = 'fading';
      confidence = 0.7;
      description = `Rapidly declining (${velocityChangePercent.toFixed(0)}%)`;
    }

    return {
      stage,
      confidence,
      description,
      velocityChange,
      velocityChangePercent,
      historyLength: history.length,
    };
  }

  /**
   * Cluster similar topics together
   * @param {Array} topics - Topics to cluster
   * @returns {Array} Topic clusters
   */
  clusterTopics(topics) {
    const clusters = [];
    const processed = new Set();

    topics.forEach(topic => {
      if (processed.has(topic.keyword)) return;

      const cluster = {
        id: `cluster_${clusters.length + 1}`,
        mainTopic: topic.keyword,
        topics: [topic],
        totalMentions: topic.mentions,
        avgTrendScore: topic.trendScore,
      };

      // Find similar topics
      topics.forEach(otherTopic => {
        if (otherTopic.keyword !== topic.keyword && !processed.has(otherTopic.keyword)) {
          const similarity = this.calculateSimilarity(topic.keyword, otherTopic.keyword);

          if (similarity >= this.config.similarityThreshold) {
            cluster.topics.push(otherTopic);
            cluster.totalMentions += otherTopic.mentions;
            processed.add(otherTopic.keyword);
          }
        }
      });

      // Calculate average trend score
      cluster.avgTrendScore =
        cluster.topics.reduce((sum, t) => sum + t.trendScore, 0) / cluster.topics.length;

      // Sort topics in cluster by trend score
      cluster.topics.sort((a, b) => b.trendScore - a.trendScore);

      // Limit cluster size
      if (cluster.topics.length > this.config.maxClusterSize) {
        cluster.topics = cluster.topics.slice(0, this.config.maxClusterSize);
      }

      processed.add(topic.keyword);
      clusters.push(cluster);
    });

    // Sort clusters by total mentions
    return clusters.sort((a, b) => b.totalMentions - a.totalMentions);
  }

  /**
   * Calculate similarity between two keywords
   * @param {string} keyword1 - First keyword
   * @param {string} keyword2 - Second keyword
   * @returns {number} Similarity score (0-1)
   */
  calculateSimilarity(keyword1, keyword2) {
    const k1 = keyword1.toLowerCase();
    const k2 = keyword2.toLowerCase();

    // Exact match
    if (k1 === k2) return 1;

    // Contains relationship
    if (k1.includes(k2) || k2.includes(k1)) {
      const shorter = Math.min(k1.length, k2.length);
      const longer = Math.max(k1.length, k2.length);
      return shorter / longer;
    }

    // Levenshtein distance based similarity
    const distance = this.levenshteinDistance(k1, k2);
    const maxLength = Math.max(k1.length, k2.length);
    return 1 - distance / maxLength;
  }

  /**
   * Calculate Levenshtein distance between two strings
   * @param {string} str1 - First string
   * @param {string} str2 - Second string
   * @returns {number} Edit distance
   */
  levenshteinDistance(str1, str2) {
    const matrix = [];

    for (let i = 0; i <= str2.length; i += 1) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j += 1) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i += 1) {
      for (let j = 1; j <= str1.length; j += 1) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1 // deletion
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Extract keywords from text
   * @param {string} text - Text to extract from
   * @param {Object} options - Extraction options
   * @returns {Array<string>} Keywords
   */
  extractKeywords(text, options = {}) {
    if (!text) return [];

    const { minLength = 4, maxLength = 20 } = options;

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
      'said',
      'says',
      'about',
      'after',
      'also',
      'been',
      'more',
      'when',
      'where',
      'which',
      'while',
      'who',
      'into',
      'than',
      'just',
      'over',
    ]);

    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(
        word =>
          word.length >= minLength &&
          word.length <= maxLength &&
          !stopWords.has(word) &&
          /^[a-z]+$/.test(word)
      );
  }

  /**
   * Update trend history for tracking lifecycle
   * @param {Array} topics - Current trending topics
   * @param {number} timestamp - Current timestamp
   */
  updateTrendHistory(topics, timestamp) {
    topics.forEach(topic => {
      if (!this.trendHistory.has(topic.keyword)) {
        this.trendHistory.set(topic.keyword, []);
      }

      const history = this.trendHistory.get(topic.keyword);
      history.push({
        timestamp,
        mentions: topic.mentions,
        velocity: topic.velocity,
        trendScore: topic.trendScore,
      });

      // Keep only last 24 data points (e.g., last 24 hours if checking hourly)
      if (history.length > 24) {
        history.shift();
      }
    });

    // Clean up old topics not seen recently
    const oneDayAgo = timestamp - 86400000;
    this.trendHistory.forEach((history, keyword) => {
      const lastSeen = history[history.length - 1]?.timestamp || 0;
      if (lastSeen < oneDayAgo) {
        this.trendHistory.delete(keyword);
      }
    });
  }

  /**
   * Get trend history for a specific keyword
   * @param {string} keyword - Keyword to get history for
   * @returns {Array} Historical data
   */
  getTrendHistory(keyword) {
    return this.trendHistory.get(keyword) || [];
  }

  /**
   * Clear all trend history
   */
  clearHistory() {
    this.trendHistory.clear();
    this.topicClusters.clear();
  }

  /**
   * Get service statistics
   * @returns {Object} Statistics
   */
  getStats() {
    return {
      trackedTopics: this.trendHistory.size,
      clusters: this.topicClusters.size,
      config: this.config,
    };
  }
}

export default TrendingService;
