/**
 * Content Curator Agent
 * Discovers and selects relevant news content for the platform
 * Uses MCP postgres for database queries and news service for content discovery
 */

import Agent from '../base/Agent.js';
import newsService from '../../services/news/newsService.js';
import db from '../../database/index.js';

class ContentCuratorAgent extends Agent {
  constructor(config = {}) {
    super('ContentCurator', config);
    
    this.defaultCategories = config.categories || ['technology', 'business', 'science'];
    this.defaultLimit = config.limit || 10;
    this.minQualityScore = config.minQualityScore || 0.7;
  }

  /**
   * Initialize the Content Curator Agent
   */
  async initialize() {
    this.logger.info('[ContentCurator] Initializing...');
    
    // Verify database connection
    try {
      await db.query('SELECT 1');
      this.logger.info('[ContentCurator] Database connection verified');
    } catch (error) {
      throw new Error(`Database connection failed: ${error.message}`);
    }

    // Verify news service availability
    if (!newsService) {
      throw new Error('News service not available');
    }

    this.logger.info('[ContentCurator] Initialization complete');
  }

  /**
   * Execute content curation task
   * @param {Object} task - Curation task
   * @param {string} task.type - Task type: 'discover', 'curate', 'analyze'
   * @param {Object} task.params - Task parameters
   * @returns {Promise<Object>} Curation result
   */
  async execute(task) {
    const { type, params = {} } = task;

    switch (type) {
      case 'discover':
        return await this.discoverContent(params);
      
      case 'curate':
        return await this.curateContent(params);
      
      case 'analyze':
        return await this.analyzeContent(params);
      
      default:
        throw new Error(`Unknown task type: ${type}`);
    }
  }

  /**
   * Discover new content from various sources
   * @param {Object} params - Discovery parameters
   * @returns {Promise<Object>} Discovered content
   */
  async discoverContent(params) {
    const {
      query = null,
      categories = this.defaultCategories,
      limit = this.defaultLimit,
      useCache = true,
    } = params;

    this.logger.info(`[ContentCurator] Discovering content: query="${query}", categories=${categories.join(',')}`);

    const results = {
      discovered: [],
      byCategory: {},
      totalFound: 0,
    };

    // If query is provided, use it directly
    if (query) {
      const articles = await newsService.fetchNews(query, { limit, useCache });
      results.discovered = articles.articles || [];
      results.totalFound = articles.total || 0;
      results.query = query;
    } else {
      // Otherwise, fetch by categories
      for (const category of categories) {
        try {
          const articles = await newsService.fetchNewsByCategory(category, {
            limit: Math.ceil(limit / categories.length),
            useCache,
          });

          results.byCategory[category] = articles.articles || [];
          results.discovered.push(...(articles.articles || []));
          results.totalFound += articles.total || 0;
        } catch (error) {
          this.logger.error(`[ContentCurator] Error fetching ${category}:`, error.message);
          results.byCategory[category] = [];
        }
      }
    }

    // Remove duplicates
    results.discovered = this.deduplicateArticles(results.discovered);
    results.uniqueCount = results.discovered.length;

    return results;
  }

  /**
   * Curate content by applying quality filters and relevance scoring
   * @param {Object} params - Curation parameters
   * @returns {Promise<Object>} Curated content
   */
  async curateContent(params) {
    const {
      articles = [],
      minQualityScore = this.minQualityScore,
      maxResults = 10,
    } = params;

    this.logger.info(`[ContentCurator] Curating ${articles.length} articles`);

    // Score each article
    const scoredArticles = articles.map(article => ({
      ...article,
      curationScore: this.calculateCurationScore(article),
    }));

    // Filter by quality score
    const qualified = scoredArticles.filter(
      article => article.curationScore >= minQualityScore
    );

    // Sort by score (descending)
    qualified.sort((a, b) => b.curationScore - a.curationScore);

    // Take top results
    const curated = qualified.slice(0, maxResults);

    return {
      curated,
      totalProcessed: articles.length,
      totalQualified: qualified.length,
      totalCurated: curated.length,
      averageScore: curated.reduce((sum, a) => sum + a.curationScore, 0) / curated.length || 0,
    };
  }

  /**
   * Analyze existing content in the database
   * @param {Object} params - Analysis parameters
   * @returns {Promise<Object>} Analysis result
   */
  async analyzeContent(params) {
    const {
      days = 7,
      categories = null,
    } = params;

    this.logger.info(`[ContentCurator] Analyzing content from last ${days} days`);

    // Query database for recent articles
    const query = `
      SELECT 
        a.id,
        a.title,
        a.slug,
        a.status,
        a.view_count,
        a.likes,
        a.quality_score,
        a.created_at,
        c.name as category_name,
        u.username as author
      FROM articles a
      LEFT JOIN categories c ON a.category_id = c.id
      LEFT JOIN users u ON a.author_id = u.id
      WHERE a.created_at >= NOW() - INTERVAL '${days} days'
      ${categories ? `AND c.slug = ANY($1)` : ''}
      ORDER BY a.created_at DESC
    `;

    const queryParams = categories ? [categories] : [];
    const result = await db.query(query, queryParams);
    const articles = result.rows;

    // Calculate statistics
    const stats = {
      totalArticles: articles.length,
      byStatus: {},
      byCategory: {},
      averageQuality: 0,
      totalViews: 0,
      totalLikes: 0,
      topArticles: [],
    };

    // Process articles
    articles.forEach(article => {
      // By status
      stats.byStatus[article.status] = (stats.byStatus[article.status] || 0) + 1;
      
      // By category
      const cat = article.category_name || 'uncategorized';
      stats.byCategory[cat] = (stats.byCategory[cat] || 0) + 1;
      
      // Totals
      stats.totalViews += article.view_count || 0;
      stats.totalLikes += article.likes || 0;
      stats.averageQuality += article.quality_score || 0;
    });

    stats.averageQuality = articles.length > 0 ? stats.averageQuality / articles.length : 0;

    // Get top 10 articles by engagement
    stats.topArticles = articles
      .sort((a, b) => {
        const scoreA = (a.view_count || 0) * 1 + (a.likes || 0) * 5;
        const scoreB = (b.view_count || 0) * 1 + (b.likes || 0) * 5;
        return scoreB - scoreA;
      })
      .slice(0, 10)
      .map(a => ({
        id: a.id,
        title: a.title,
        slug: a.slug,
        views: a.view_count,
        likes: a.likes,
        quality: a.quality_score,
        category: a.category_name,
        author: a.author,
      }));

    return stats;
  }

  /**
   * Calculate curation score for an article
   * @param {Object} article - Article to score
   * @returns {number} Score between 0 and 1
   */
  calculateCurationScore(article) {
    let score = 0.5; // Base score

    // Title quality (20%)
    if (article.title) {
      const titleLength = article.title.length;
      if (titleLength >= 30 && titleLength <= 100) {
        score += 0.2;
      } else if (titleLength >= 20 && titleLength <= 150) {
        score += 0.1;
      }
    }

    // Content quality (30%)
    if (article.content || article.description) {
      const contentLength = (article.content || article.description || '').length;
      if (contentLength >= 500) {
        score += 0.3;
      } else if (contentLength >= 200) {
        score += 0.15;
      }
    }

    // Source reputation (20%)
    if (article.source) {
      const trustedSources = ['reuters', 'ap', 'bbc', 'nytimes', 'wsj', 'techcrunch', 'wired'];
      const sourceLower = article.source.toLowerCase();
      if (trustedSources.some(s => sourceLower.includes(s))) {
        score += 0.2;
      } else if (article.source.length > 0) {
        score += 0.1;
      }
    }

    // Recency (15%)
    if (article.publishedAt || article.published_at) {
      const publishedDate = new Date(article.publishedAt || article.published_at);
      const ageInHours = (Date.now() - publishedDate.getTime()) / (1000 * 60 * 60);
      
      if (ageInHours <= 24) {
        score += 0.15;
      } else if (ageInHours <= 72) {
        score += 0.1;
      } else if (ageInHours <= 168) {
        score += 0.05;
      }
    }

    // Image availability (10%)
    if (article.imageUrl || article.image_url || article.urlToImage) {
      score += 0.1;
    }

    // URL quality (5%)
    if (article.url && !article.url.includes('?utm')) {
      score += 0.05;
    }

    // Ensure score is between 0 and 1
    return Math.min(Math.max(score, 0), 1);
  }

  /**
   * Remove duplicate articles based on title similarity and URL
   * @param {Array} articles - Articles to deduplicate
   * @returns {Array} Deduplicated articles
   */
  deduplicateArticles(articles) {
    const seen = new Set();
    const unique = [];

    for (const article of articles) {
      // Create fingerprint
      const titleNorm = (article.title || '').toLowerCase().trim();
      const urlNorm = (article.url || '').toLowerCase();
      
      const fingerprint = `${titleNorm}||${urlNorm}`;

      if (!seen.has(fingerprint) && titleNorm.length > 0) {
        seen.add(fingerprint);
        unique.push(article);
      }
    }

    return unique;
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    this.logger.info('[ContentCurator] Cleaning up...');
    await super.cleanup();
  }
}

export default ContentCuratorAgent;
