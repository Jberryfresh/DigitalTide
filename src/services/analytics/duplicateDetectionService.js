/**
 * Duplicate Detection Service
 *
 * Advanced duplicate detection and filtering for news articles.
 * Features:
 * - Exact duplicate detection (URL and fingerprint-based)
 * - Fuzzy title matching (Levenshtein distance)
 * - Content similarity (cosine similarity with TF-IDF)
 * - Near-duplicate detection (multiple factors)
 * - Image URL comparison
 * - Best article selection from duplicate groups
 * - Configurable similarity thresholds
 *
 * @module services/analytics/duplicateDetectionService
 */

import crypto from 'crypto';

class DuplicateDetectionService {
  constructor() {
    // Similarity thresholds
    this.thresholds = {
      exactMatch: 1.0, // 100% identical
      nearDuplicate: 0.85, // 85-99% similar (high similarity)
      similar: 0.7, // 70-84% similar (related articles)
      different: 0.7, // <70% = different articles
    };

    // Weights for similarity factors
    this.weights = {
      title: 0.35, // Title similarity (35%)
      content: 0.3, // Content similarity (30%)
      url: 0.15, // URL similarity (15%)
      image: 0.1, // Image URL similarity (10%)
      metadata: 0.1, // Source/author/date similarity (10%)
    };

    // Statistics
    this.stats = {
      totalComparisons: 0,
      exactDuplicates: 0,
      nearDuplicates: 0,
      similarArticles: 0,
      uniqueArticles: 0,
      avgSimilarityScore: 0,
    };

    // Cache for TF-IDF vectors (for performance)
    this.vectorCache = new Map();
    this.cacheMaxSize = 1000;
  }

  /**
   * Detect duplicates in a collection of articles
   * @param {Array} articles - Articles to analyze
   * @param {Object} options - Detection options
   * @returns {Object} Detection results
   */
  detectDuplicates(articles, options = {}) {
    const {
      threshold = this.thresholds.nearDuplicate,
      includeExact = true,
      includeNear = true,
      includeSimilar = false,
      returnGroups = true,
    } = options;

    const results = {
      original: articles.length,
      unique: [],
      duplicates: [],
      groups: [],
      metadata: {
        threshold,
        exactMatches: 0,
        nearMatches: 0,
        similarMatches: 0,
        processingTime: 0,
      },
    };

    const startTime = Date.now();

    // Step 1: Quick exact duplicate detection (URL and fingerprint)
    const { unique: uniqueByUrl, duplicates: urlDuplicates } = this.detectExactDuplicates(articles);
    results.metadata.exactMatches = urlDuplicates.length;
    results.duplicates.push(...urlDuplicates);

    // Step 2: Advanced similarity detection on remaining articles
    if (includeNear || includeSimilar) {
      const similarityGroups = this.groupSimilarArticles(uniqueByUrl, threshold);

      // Extract best article from each group
      for (const group of similarityGroups) {
        if (group.articles.length === 1) {
          results.unique.push(group.articles[0]);
        } else {
          const best = this.selectBestArticle(group.articles);
          results.unique.push(best);

          // Track duplicates (all except the best one)
          const duplicatesInGroup = group.articles.filter(a => a !== best);
          results.duplicates.push(
            ...duplicatesInGroup.map(article => ({
              article,
              duplicateOf: best,
              similarityScore: group.avgSimilarity,
              reason:
                group.avgSimilarity >= this.thresholds.nearDuplicate ? 'near-duplicate' : 'similar',
            }))
          );

          if (group.avgSimilarity >= this.thresholds.nearDuplicate) {
            results.metadata.nearMatches += duplicatesInGroup.length;
          } else {
            results.metadata.similarMatches += duplicatesInGroup.length;
          }

          if (returnGroups) {
            results.groups.push({
              best,
              duplicates: duplicatesInGroup,
              avgSimilarity: group.avgSimilarity,
              size: group.articles.length,
            });
          }
        }
      }
    } else {
      // No advanced detection, just use URL-deduplicated articles
      results.unique = uniqueByUrl;
    }

    results.metadata.processingTime = Date.now() - startTime;
    this.updateStats(results);

    return results;
  }

  /**
   * Detect exact duplicates based on URL and fingerprint
   * @param {Array} articles - Articles to check
   * @returns {Object} Unique and duplicate articles
   */
  detectExactDuplicates(articles) {
    const seenUrls = new Map();
    const seenFingerprints = new Map();
    const unique = [];
    const duplicates = [];

    for (const article of articles) {
      const url = this.normalizeUrl(article.url);
      const fingerprint = article.fingerprint || this.generateFingerprint(article);

      // Check URL
      if (seenUrls.has(url)) {
        duplicates.push({
          article,
          duplicateOf: seenUrls.get(url),
          similarityScore: 1.0,
          reason: 'exact-url',
        });
        continue;
      }

      // Check fingerprint
      if (seenFingerprints.has(fingerprint)) {
        duplicates.push({
          article,
          duplicateOf: seenFingerprints.get(fingerprint),
          similarityScore: 1.0,
          reason: 'exact-fingerprint',
        });
        continue;
      }

      // This is unique
      seenUrls.set(url, article);
      seenFingerprints.set(fingerprint, article);
      unique.push(article);
    }

    return { unique, duplicates };
  }

  /**
   * Group similar articles together
   * @param {Array} articles - Articles to group
   * @param {number} threshold - Minimum similarity threshold
   * @returns {Array} Groups of similar articles
   */
  groupSimilarArticles(articles, threshold = this.thresholds.similar) {
    const groups = [];
    const processed = new Set();

    for (let i = 0; i < articles.length; i++) {
      if (processed.has(i)) continue;

      const group = {
        articles: [articles[i]],
        similarities: [],
        avgSimilarity: 1.0,
      };
      processed.add(i);

      // Compare with remaining articles
      for (let j = i + 1; j < articles.length; j++) {
        if (processed.has(j)) continue;

        const similarity = this.calculateSimilarity(articles[i], articles[j]);
        this.stats.totalComparisons++;

        if (similarity >= threshold) {
          group.articles.push(articles[j]);
          group.similarities.push(similarity);
          processed.add(j);
        }
      }

      // Calculate average similarity for this group
      if (group.similarities.length > 0) {
        group.avgSimilarity =
          group.similarities.reduce((sum, s) => sum + s, 0) / group.similarities.length;
      }

      groups.push(group);
    }

    return groups;
  }

  /**
   * Calculate similarity between two articles
   * @param {Object} article1 - First article
   * @param {Object} article2 - Second article
   * @returns {number} Similarity score (0-1)
   */
  calculateSimilarity(article1, article2) {
    let totalScore = 0;
    let totalWeight = 0;

    // Title similarity (Levenshtein distance)
    if (article1.title && article2.title) {
      const titleSim = this.calculateTitleSimilarity(article1.title, article2.title);
      totalScore += titleSim * this.weights.title;
      totalWeight += this.weights.title;
    }

    // Content similarity (cosine similarity with TF-IDF)
    if (article1.content && article2.content) {
      const contentSim = this.calculateContentSimilarity(article1.content, article2.content);
      totalScore += contentSim * this.weights.content;
      totalWeight += this.weights.content;
    } else if (article1.description && article2.description) {
      // Fallback to description if content not available
      const descSim = this.calculateContentSimilarity(article1.description, article2.description);
      totalScore += descSim * this.weights.content;
      totalWeight += this.weights.content;
    }

    // URL similarity
    if (article1.url && article2.url) {
      const urlSim = this.calculateUrlSimilarity(article1.url, article2.url);
      totalScore += urlSim * this.weights.url;
      totalWeight += this.weights.url;
    }

    // Image similarity
    if (article1.image && article2.image) {
      const imageSim = this.calculateImageSimilarity(article1.image, article2.image);
      totalScore += imageSim * this.weights.image;
      totalWeight += this.weights.image;
    }

    // Metadata similarity (source, author, date)
    const metadataSim = this.calculateMetadataSimilarity(article1, article2);
    totalScore += metadataSim * this.weights.metadata;
    totalWeight += this.weights.metadata;

    // Normalize by total weight
    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }

  /**
   * Calculate title similarity using Levenshtein distance
   * @param {string} title1 - First title
   * @param {string} title2 - Second title
   * @returns {number} Similarity score (0-1)
   */
  calculateTitleSimilarity(title1, title2) {
    const t1 = this.normalizeText(title1);
    const t2 = this.normalizeText(title2);

    // Exact match
    if (t1 === t2) return 1.0;

    // Contains relationship (one title is substring of another)
    if (t1.includes(t2) || t2.includes(t1)) {
      const shorter = Math.min(t1.length, t2.length);
      const longer = Math.max(t1.length, t2.length);
      return 0.8 + (0.2 * shorter) / longer; // 0.8-1.0 for substring matches
    }

    // Token-based similarity (for news headlines with similar meaning)
    const tokens1 = t1.split(/\s+/);
    const tokens2 = t2.split(/\s+/);
    const commonTokens = tokens1.filter(token => tokens2.includes(token));
    const tokenSimilarity = (commonTokens.length * 2) / (tokens1.length + tokens2.length);

    // Levenshtein distance
    const distance = this.levenshteinDistance(t1, t2);
    const maxLength = Math.max(t1.length, t2.length);
    const levenshteinSimilarity = Math.max(0, 1 - distance / maxLength);

    // Combine token and Levenshtein similarity (weighted average)
    // Token similarity is more robust for news headlines about the same story
    return tokenSimilarity * 0.6 + levenshteinSimilarity * 0.4;
  }

  /**
   * Calculate content similarity using cosine similarity
   * @param {string} content1 - First content
   * @param {string} content2 - Second content
   * @returns {number} Similarity score (0-1)
   */
  calculateContentSimilarity(content1, content2) {
    const c1 = this.normalizeText(content1);
    const c2 = this.normalizeText(content2);

    // For very short content, use simple comparison
    if (c1.length < 50 || c2.length < 50) {
      return this.calculateTitleSimilarity(c1, c2);
    }

    // Get or create TF-IDF vectors
    const vector1 = this.getOrCreateVector(c1);
    const vector2 = this.getOrCreateVector(c2);

    // Calculate cosine similarity
    return this.cosineSimilarity(vector1, vector2);
  }

  /**
   * Calculate URL similarity
   * @param {string} url1 - First URL
   * @param {string} url2 - Second URL
   * @returns {number} Similarity score (0-1)
   */
  calculateUrlSimilarity(url1, url2) {
    const u1 = this.normalizeUrl(url1);
    const u2 = this.normalizeUrl(url2);

    // Exact match
    if (u1 === u2) return 1.0;

    // Same domain
    const domain1 = this.extractDomain(url1);
    const domain2 = this.extractDomain(url2);
    if (domain1 === domain2) {
      // Same domain but different paths - check path similarity
      const path1 = u1.replace(domain1, '');
      const path2 = u2.replace(domain2, '');
      const pathSim = this.calculateTitleSimilarity(path1, path2);
      return 0.5 + 0.5 * pathSim; // 0.5-1.0 for same domain
    }

    return 0; // Different domains = not similar
  }

  /**
   * Calculate image URL similarity
   * @param {string} image1 - First image URL
   * @param {string} image2 - Second image URL
   * @returns {number} Similarity score (0-1)
   */
  calculateImageSimilarity(image1, image2) {
    if (!image1 || !image2) return 0;

    const img1 = this.normalizeUrl(image1);
    const img2 = this.normalizeUrl(image2);

    // Exact match
    if (img1 === img2) return 1.0;

    // Extract filename from URL
    const filename1 = img1.split('/').pop().split('?')[0];
    const filename2 = img2.split('/').pop().split('?')[0];

    if (filename1 === filename2) return 0.9; // Same filename, different path

    return 0;
  }

  /**
   * Calculate metadata similarity (source, author, date)
   * @param {Object} article1 - First article
   * @param {Object} article2 - Second article
   * @returns {number} Similarity score (0-1)
   */
  calculateMetadataSimilarity(article1, article2) {
    let score = 0;
    let factors = 0;

    // Source similarity
    if (article1.source && article2.source) {
      const source1 = typeof article1.source === 'string' ? article1.source : article1.source.name;
      const source2 = typeof article2.source === 'string' ? article2.source : article2.source.name;
      if (source1 && source2) {
        score += source1.toLowerCase() === source2.toLowerCase() ? 1 : 0;
        factors++;
      }
    }

    // Author similarity
    if (article1.author && article2.author) {
      score += article1.author.toLowerCase() === article2.author.toLowerCase() ? 1 : 0;
      factors++;
    }

    // Publication date proximity (within 24 hours = similar)
    if (article1.publishedAt && article2.publishedAt) {
      const date1 = new Date(article1.publishedAt);
      const date2 = new Date(article2.publishedAt);
      const hoursDiff = Math.abs(date1 - date2) / (1000 * 60 * 60);
      score += Math.max(0, 1 - hoursDiff / 24); // Linear decay over 24 hours
      factors++;
    }

    return factors > 0 ? score / factors : 0;
  }

  /**
   * Select best article from a group of duplicates
   * @param {Array} articles - Group of duplicate articles
   * @returns {Object} Best article
   */
  selectBestArticle(articles) {
    if (articles.length === 1) return articles[0];

    // Score each article
    const scored = articles.map(article => ({
      article,
      score: this.calculateArticleQualityScore(article),
    }));

    // Sort by score (descending)
    scored.sort((a, b) => b.score - a.score);

    return scored[0].article;
  }

  /**
   * Calculate quality score for article selection
   * @param {Object} article - Article to score
   * @returns {number} Quality score
   */
  calculateArticleQualityScore(article) {
    let score = 0;

    // Source credibility (if available)
    if (article.credibility) {
      score += article.credibility * 30; // 0-30 points
    } else if (article.source) {
      // Basic source scoring
      const source = typeof article.source === 'string' ? article.source : article.source.name;
      const tier1 = ['reuters', 'ap', 'bbc', 'nytimes', 'wsj'];
      const tier2 = ['techcrunch', 'theverge', 'npr', 'guardian'];

      if (tier1.some(s => source.toLowerCase().includes(s))) {
        score += 27; // 90% of 30
      } else if (tier2.some(s => source.toLowerCase().includes(s))) {
        score += 23; // 77% of 30
      } else {
        score += 15; // 50% of 30
      }
    }

    // Content completeness (20 points)
    const content = article.content || article.description || '';
    const contentLength = content.length;
    if (contentLength > 2000) score += 20;
    else if (contentLength > 1000) score += 15;
    else if (contentLength > 500) score += 10;
    else score += 5;

    // Title quality (10 points)
    const title = article.title || '';
    if (title.length >= 30 && title.length <= 100) score += 10;
    else if (title.length >= 20) score += 7;
    else score += 3;

    // Has image (10 points)
    if (article.image || article.imageUrl || article.urlToImage) {
      score += 10;
    }

    // Has author (10 points)
    if (article.author && article.author !== 'Unknown') {
      score += 10;
    }

    // Publication date (10 points for recent, decay over time)
    if (article.publishedAt || article.published_at) {
      const date = new Date(article.publishedAt || article.published_at);
      const hoursSincePublished = (Date.now() - date.getTime()) / (1000 * 60 * 60);
      if (hoursSincePublished <= 6) score += 10;
      else if (hoursSincePublished <= 24) score += 8;
      else if (hoursSincePublished <= 72) score += 5;
      else score += 2;
    }

    // Clean URL (5 points)
    if (article.url && !article.url.includes('utm_') && article.url.startsWith('http')) {
      score += 5;
    }

    // Has category/tags (5 points)
    if (
      (article.category && article.category.length > 0) ||
      (article.tags && article.tags.length > 0)
    ) {
      score += 5;
    }

    return score; // Max: 100 points
  }

  /**
   * Generate content fingerprint for deduplication
   * @param {Object} article - Article to fingerprint
   * @returns {string} Fingerprint hash
   */
  generateFingerprint(article) {
    const title = (article.title || '').toLowerCase().trim();
    const url = this.normalizeUrl(article.url || '');
    const normalized = `${title}||${url}`;

    return crypto.createHash('md5').update(normalized).digest('hex');
  }

  /**
   * Normalize text for comparison
   * @param {string} text - Text to normalize
   * @returns {string} Normalized text
   */
  normalizeText(text) {
    if (!text) return '';

    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .replace(/\s+/g, ' '); // Normalize whitespace
  }

  /**
   * Normalize URL for comparison
   * @param {string} url - URL to normalize
   * @returns {string} Normalized URL
   */
  normalizeUrl(url) {
    if (!url) return '';

    return url
      .toLowerCase()
      .replace(/^https?:\/\//, '') // Remove protocol
      .replace(/^www\./, '') // Remove www
      .replace(/\/$/, '') // Remove trailing slash
      .split('?')[0] // Remove query params
      .split('#')[0]; // Remove hash
  }

  /**
   * Extract domain from URL
   * @param {string} url - URL
   * @returns {string} Domain
   */
  extractDomain(url) {
    if (!url) return '';

    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace(/^www\./, '');
    } catch (error) {
      const match = url.match(/https?:\/\/(?:www\.)?([^\/]+)/);
      return match ? match[1] : '';
    }
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
   * Get or create TF-IDF vector for text
   * @param {string} text - Text to vectorize
   * @returns {Map} TF-IDF vector
   */
  getOrCreateVector(text) {
    const hash = crypto.createHash('md5').update(text).digest('hex');

    if (this.vectorCache.has(hash)) {
      return this.vectorCache.get(hash);
    }

    const vector = this.createTfIdfVector(text);

    // Cache management
    if (this.vectorCache.size >= this.cacheMaxSize) {
      // Remove oldest entry
      const firstKey = this.vectorCache.keys().next().value;
      this.vectorCache.delete(firstKey);
    }

    this.vectorCache.set(hash, vector);
    return vector;
  }

  /**
   * Create TF-IDF vector from text
   * @param {string} text - Text to vectorize
   * @returns {Map} TF-IDF vector
   */
  createTfIdfVector(text) {
    const words = this.tokenize(text);
    const termFreq = new Map();

    // Calculate term frequency
    for (const word of words) {
      termFreq.set(word, (termFreq.get(word) || 0) + 1);
    }

    // Normalize by document length
    const docLength = words.length;
    for (const [term, freq] of termFreq.entries()) {
      termFreq.set(term, freq / docLength);
    }

    return termFreq;
  }

  /**
   * Tokenize text into words
   * @param {string} text - Text to tokenize
   * @returns {Array} Array of words
   */
  tokenize(text) {
    const normalized = this.normalizeText(text);
    const words = normalized.split(/\s+/).filter(word => word.length > 2);

    // Remove common stop words
    const stopWords = new Set([
      'the',
      'and',
      'for',
      'are',
      'but',
      'not',
      'you',
      'all',
      'can',
      'her',
      'was',
      'one',
      'our',
      'out',
      'day',
      'get',
      'has',
      'him',
      'his',
      'how',
      'man',
      'new',
      'now',
      'old',
      'see',
      'two',
      'way',
      'who',
      'boy',
      'did',
      'its',
      'let',
      'put',
      'say',
      'she',
      'too',
      'use',
      'this',
      'that',
      'with',
      'from',
      'have',
      'they',
      'said',
      'what',
      'when',
      'your',
      'will',
      'been',
    ]);

    return words.filter(word => !stopWords.has(word));
  }

  /**
   * Calculate cosine similarity between two TF-IDF vectors
   * @param {Map} vector1 - First vector
   * @param {Map} vector2 - Second vector
   * @returns {number} Cosine similarity (0-1)
   */
  cosineSimilarity(vector1, vector2) {
    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;

    // Get all unique terms
    const allTerms = new Set([...vector1.keys(), ...vector2.keys()]);

    for (const term of allTerms) {
      const val1 = vector1.get(term) || 0;
      const val2 = vector2.get(term) || 0;

      dotProduct += val1 * val2;
      magnitude1 += val1 * val1;
      magnitude2 += val2 * val2;
    }

    magnitude1 = Math.sqrt(magnitude1);
    magnitude2 = Math.sqrt(magnitude2);

    if (magnitude1 === 0 || magnitude2 === 0) return 0;

    return dotProduct / (magnitude1 * magnitude2);
  }

  /**
   * Update statistics
   * @param {Object} results - Detection results
   */
  updateStats(results) {
    this.stats.uniqueArticles += results.unique.length;

    for (const dup of results.duplicates) {
      if (dup.reason === 'exact-url' || dup.reason === 'exact-fingerprint') {
        this.stats.exactDuplicates++;
      } else if (dup.similarityScore >= this.thresholds.nearDuplicate) {
        this.stats.nearDuplicates++;
      } else {
        this.stats.similarArticles++;
      }
    }

    // Update average similarity
    if (this.stats.totalComparisons > 0) {
      const totalScore = results.duplicates.reduce((sum, dup) => sum + dup.similarityScore, 0);
      this.stats.avgSimilarityScore = totalScore / results.duplicates.length || 0;
    }
  }

  /**
   * Get statistics
   * @returns {Object} Statistics
   */
  getStats() {
    return {
      ...this.stats,
      cacheSize: this.vectorCache.size,
      cacheMaxSize: this.cacheMaxSize,
    };
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.vectorCache.clear();
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      totalComparisons: 0,
      exactDuplicates: 0,
      nearDuplicates: 0,
      similarArticles: 0,
      uniqueArticles: 0,
      avgSimilarityScore: 0,
    };
  }

  /**
   * Get threshold configuration
   * @returns {Object} Thresholds
   */
  getThresholds() {
    return { ...this.thresholds };
  }

  /**
   * Update threshold configuration
   * @param {Object} thresholds - New thresholds
   */
  setThresholds(thresholds) {
    this.thresholds = { ...this.thresholds, ...thresholds };
  }

  /**
   * Get weight configuration
   * @returns {Object} Weights
   */
  getWeights() {
    return { ...this.weights };
  }

  /**
   * Update weight configuration
   * @param {Object} weights - New weights
   */
  setWeights(weights) {
    this.weights = { ...this.weights, ...weights };
  }
}

// Export singleton instance
const duplicateDetectionService = new DuplicateDetectionService();
export default duplicateDetectionService;
