/**
 * RSS Feed Service
 * Handles RSS feed parsing and monitoring for news aggregation
 */

import Parser from 'rss-parser';
import crypto from 'crypto';

class RSSService {
  constructor() {
    this.parser = new Parser({
      timeout: 10000, // 10 second timeout
      headers: {
        'User-Agent': 'DigitalTide/1.0 (News Aggregator)',
      },
    });

    // Common news RSS feeds
    this.defaultFeeds = [
      {
        name: 'BBC News',
        url: 'http://feeds.bbci.co.uk/news/rss.xml',
        category: 'general',
        credibility: 0.95,
      },
      {
        name: 'Reuters Top News',
        url: 'https://www.reutersagency.com/feed/?taxonomy=best-topics&post_type=best',
        category: 'general',
        credibility: 0.98,
      },
      {
        name: 'TechCrunch',
        url: 'https://techcrunch.com/feed/',
        category: 'technology',
        credibility: 0.85,
      },
      {
        name: 'Ars Technica',
        url: 'http://feeds.arstechnica.com/arstechnica/index',
        category: 'technology',
        credibility: 0.9,
      },
      {
        name: 'The Verge',
        url: 'https://www.theverge.com/rss/index.xml',
        category: 'technology',
        credibility: 0.85,
      },
      {
        name: 'Hacker News',
        url: 'https://news.ycombinator.com/rss',
        category: 'technology',
        credibility: 0.8,
      },
      {
        name: 'CNBC Top News',
        url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html',
        category: 'business',
        credibility: 0.9,
      },
      {
        name: 'Financial Times',
        url: 'https://www.ft.com/?format=rss',
        category: 'business',
        credibility: 0.95,
      },
      {
        name: 'NPR News',
        url: 'https://feeds.npr.org/1001/rss.xml',
        category: 'general',
        credibility: 0.92,
      },
      {
        name: 'The Guardian World News',
        url: 'https://www.theguardian.com/world/rss',
        category: 'general',
        credibility: 0.9,
      },
      {
        name: 'Science Daily',
        url: 'https://www.sciencedaily.com/rss/all.xml',
        category: 'science',
        credibility: 0.93,
      },
      {
        name: 'Wired',
        url: 'https://www.wired.com/feed/rss',
        category: 'technology',
        credibility: 0.87,
      },
    ];
  }

  /**
   * Parse a single RSS feed
   * @param {string} feedUrl - RSS feed URL
   * @param {Object} feedMetadata - Additional feed metadata
   * @returns {Promise<Object>} Parsed feed with articles
   */
  async parseFeed(feedUrl, feedMetadata = {}) {
    try {
      const feed = await this.parser.parseURL(feedUrl);

      const articles = feed.items.map(item =>
        this.normalizeArticle(item, {
          source: feed.title || feedMetadata.name || 'Unknown',
          feedUrl,
          ...feedMetadata,
        })
      );

      return {
        success: true,
        source: feed.title || feedMetadata.name,
        feedUrl,
        totalArticles: articles.length,
        articles,
        feedMetadata: {
          title: feed.title,
          description: feed.description,
          link: feed.link,
          lastBuildDate: feed.lastBuildDate,
          language: feed.language,
        },
      };
    } catch (error) {
      return {
        success: false,
        source: feedMetadata.name || 'Unknown',
        feedUrl,
        error: error.message,
        articles: [],
      };
    }
  }

  /**
   * Parse multiple RSS feeds in parallel
   * @param {Array<Object>} feeds - Array of feed objects with url and metadata
   * @returns {Promise<Object>} Aggregated results from all feeds
   */
  async parseMultipleFeeds(feeds = this.defaultFeeds) {
    const startTime = Date.now();

    const feedPromises = feeds.map(feed =>
      this.parseFeed(feed.url, {
        name: feed.name,
        category: feed.category,
        credibility: feed.credibility,
      })
    );

    const results = await Promise.all(feedPromises);

    const successfulFeeds = results.filter(r => r.success);
    const failedFeeds = results.filter(r => !r.success);
    const allArticles = successfulFeeds.flatMap(r => r.articles);

    // Deduplicate articles
    const uniqueArticles = this.deduplicateArticles(allArticles);

    return {
      success: true,
      totalFeeds: feeds.length,
      successfulFeeds: successfulFeeds.length,
      failedFeeds: failedFeeds.length,
      totalArticles: allArticles.length,
      uniqueArticles: uniqueArticles.length,
      duplicatesRemoved: allArticles.length - uniqueArticles.length,
      executionTime: Date.now() - startTime,
      articles: uniqueArticles,
      feedResults: results,
      errors: failedFeeds.map(f => ({
        source: f.source,
        url: f.feedUrl,
        error: f.error,
      })),
    };
  }

  /**
   * Normalize RSS article to common format
   * @param {Object} item - RSS feed item
   * @param {Object} metadata - Feed metadata
   * @returns {Object} Normalized article
   */
  normalizeArticle(item, metadata) {
    const article = {
      // Basic information
      title: this.cleanText(item.title || 'Untitled'),
      description: this.cleanText(item.contentSnippet || item.description || item.content || ''),
      content: this.cleanText(item.content || item.description || ''),
      link: item.link || '',
      guid: item.guid || item.link || '',

      // Dates
      publishedAt: item.pubDate || item.isoDate || new Date().toISOString(),
      updatedAt: item.updated || item.pubDate || new Date().toISOString(),

      // Source information
      source: {
        name: metadata.source,
        url: metadata.feedUrl,
        credibility: metadata.credibility || 0.75,
      },

      // Categories and tags
      category: metadata.category || 'general',
      categories: item.categories || [],

      // Author information
      author: item.creator || item.author || 'Unknown',

      // Media
      image:
        item.enclosure?.url || item.media?.thumbnail?.url || item['media:thumbnail']?.$.url || null,
      media: item.enclosure || null,

      // Metadata
      fingerprint: this.generateFingerprint(item),
      fetchedAt: new Date().toISOString(),
    };

    return article;
  }

  /**
   * Generate unique fingerprint for article deduplication
   * @param {Object} item - RSS item
   * @returns {string} MD5 hash fingerprint
   */
  generateFingerprint(item) {
    const text = `${item.title}${item.link}`.toLowerCase().trim();
    return crypto.createHash('md5').update(text).digest('hex');
  }

  /**
   * Clean HTML and extra whitespace from text
   * @param {string} text - Text to clean
   * @returns {string} Cleaned text
   */
  cleanText(text) {
    if (!text) return '';

    return (
      text
        // Remove HTML tags
        .replace(/<[^>]*>/g, '')
        // Remove extra whitespace
        .replace(/\s+/g, ' ')
        // Decode HTML entities
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .trim()
    );
  }

  /**
   * Deduplicate articles based on fingerprint
   * @param {Array} articles - Array of articles
   * @returns {Array} Unique articles
   */
  deduplicateArticles(articles) {
    const seen = new Set();
    return articles.filter(article => {
      if (seen.has(article.fingerprint)) {
        return false;
      }
      seen.add(article.fingerprint);
      return true;
    });
  }

  /**
   * Filter articles by date range
   * @param {Array} articles - Array of articles
   * @param {number} hoursAgo - Only include articles from this many hours ago
   * @returns {Array} Filtered articles
   */
  filterByDate(articles, hoursAgo = 24) {
    const cutoffDate = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
    return articles.filter(article => {
      const articleDate = new Date(article.publishedAt);
      return articleDate >= cutoffDate;
    });
  }

  /**
   * Filter articles by category
   * @param {Array} articles - Array of articles
   * @param {string} category - Category to filter by
   * @returns {Array} Filtered articles
   */
  filterByCategory(articles, category) {
    return articles.filter(
      article => article.category === category || article.categories.includes(category)
    );
  }

  /**
   * Sort articles by publication date
   * @param {Array} articles - Array of articles
   * @param {string} order - 'desc' (newest first) or 'asc' (oldest first)
   * @returns {Array} Sorted articles
   */
  sortByDate(articles, order = 'desc') {
    return [...articles].sort((a, b) => {
      const dateA = new Date(a.publishedAt);
      const dateB = new Date(b.publishedAt);
      return order === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }

  /**
   * Get articles by credibility threshold
   * @param {Array} articles - Array of articles
   * @param {number} minCredibility - Minimum credibility score (0-1)
   * @returns {Array} Filtered articles
   */
  filterByCredibility(articles, minCredibility = 0.8) {
    return articles.filter(article => article.source.credibility >= minCredibility);
  }

  /**
   * Get default RSS feeds
   * @returns {Array} Default feeds configuration
   */
  getDefaultFeeds() {
    return this.defaultFeeds;
  }

  /**
   * Add a custom RSS feed
   * @param {Object} feed - Feed configuration
   * @returns {boolean} Success status
   */
  addCustomFeed(feed) {
    if (!feed.url || !feed.name) {
      throw new Error('Feed must have url and name');
    }

    this.defaultFeeds.push({
      name: feed.name,
      url: feed.url,
      category: feed.category || 'general',
      credibility: feed.credibility || 0.75,
    });

    return true;
  }

  /**
   * Health check - test parsing a simple feed
   * @returns {Promise<boolean>} Health status
   */
  async healthCheck() {
    try {
      // Test with a reliable feed
      const result = await this.parseFeed('http://feeds.bbci.co.uk/news/rss.xml', {
        name: 'BBC News Test',
      });
      return result.success && result.articles.length > 0;
    } catch (error) {
      console.error('RSS Service health check failed:', error);
      return false;
    }
  }
}

export default new RSSService();
