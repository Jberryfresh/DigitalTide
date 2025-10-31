/**
 * SEO Agent
 * Optimizes content for search engines
 * Handles keyword analysis, meta tag generation, and search optimization
 */

import Agent from '../base/Agent.js';
import claudeService from '../../services/ai/claudeService.js';

class SEOAgent extends Agent {
  constructor(config = {}) {
    super('SEO', config);
    
    this.targetKeywordDensity = config.targetKeywordDensity || 0.02; // 2%
    this.maxKeywords = config.maxKeywords || 5;
  }

  /**
   * Initialize the SEO Agent
   */
  async initialize() {
    this.logger.info('[SEO] Initializing...');
    
    // Verify Claude service availability for keyword generation
    if (!claudeService) {
      throw new Error('Claude AI service not available');
    }

    this.logger.info('[SEO] Initialization complete');
  }

  /**
   * Execute SEO optimization task
   * @param {Object} task - SEO task
   * @param {string} task.type - Task type: 'optimize', 'analyze', 'generateMeta'
   * @param {Object} task.params - Task parameters
   * @returns {Promise<Object>} SEO optimization result
   */
  async execute(task) {
    const { type, params = {} } = task;

    switch (type) {
      case 'optimize':
        return await this.optimizeContent(params);
      
      case 'analyze':
        return await this.analyzeContent(params);
      
      case 'generateMeta':
        return await this.generateMetaTags(params);
      
      case 'suggestKeywords':
        return await this.suggestKeywords(params);
      
      case 'generateSlug':
        return await this.generateSlug(params);
      
      default:
        throw new Error(`Unknown task type: ${type}`);
    }
  }

  /**
   * Optimize content for SEO
   * @param {Object} params - Optimization parameters
   * @returns {Promise<Object>} Optimization result
   */
  async optimizeContent(params) {
    const {
      title,
      content,
      excerpt,
      keywords = [],
      category,
      targetAudience = 'general',
    } = params;

    this.logger.info(`[SEO] Optimizing content: "${title}"`);

    // Analyze current SEO
    const analysis = await this.analyzeContent({ title, content, excerpt, keywords });

    // Generate optimized meta tags
    const metaTags = await this.generateMetaTags({ title, content, excerpt, keywords, category });

    // Suggest additional keywords if needed
    let suggestedKeywords = keywords;
    if (keywords.length < 3) {
      const keywordSuggestions = await this.suggestKeywords({ title, content, category });
      suggestedKeywords = [...new Set([...keywords, ...keywordSuggestions.keywords.slice(0, 5)])];
    }

    // Generate SEO-friendly slug
    const slug = this.generateSlug({ title }).slug;

    // Generate optimization recommendations
    const recommendations = this.generateRecommendations(analysis, metaTags);

    return {
      analysis,
      metaTags,
      suggestedKeywords,
      slug,
      recommendations,
      seoScore: this.calculateSEOScore(analysis, metaTags),
    };
  }

  /**
   * Analyze content for SEO
   * @param {Object} params - Analysis parameters
   * @returns {Promise<Object>} SEO analysis
   */
  async analyzeContent(params) {
    const { title, content, excerpt, keywords = [] } = params;

    this.logger.info(`[SEO] Analyzing content SEO`);

    const analysis = {
      title: this.analyzeTitleSEO(title),
      content: this.analyzeContentSEO(content, keywords),
      excerpt: this.analyzeExcerptSEO(excerpt),
      keywords: this.analyzeKeywordUsage(content, keywords),
      readability: this.analyzeReadability(content),
    };

    // Calculate overall SEO score
    analysis.overallScore = this.calculateOverallSEOScore(analysis);
    analysis.grade = this.getGrade(analysis.overallScore);

    return analysis;
  }

  /**
   * Generate meta tags for content
   * @param {Object} params - Meta tag parameters
   * @returns {Promise<Object>} Generated meta tags
   */
  async generateMetaTags(params) {
    const { title, content, excerpt, keywords = [], category } = params;

    this.logger.info(`[SEO] Generating meta tags`);

    const prompt = `Generate SEO-optimized meta tags for the following article:

Title: ${title}
Category: ${category || 'General'}
Keywords: ${keywords.join(', ')}

Content Preview:
${content.substring(0, 500)}...

Generate meta tags in JSON format:
{
  "metaTitle": "SEO-optimized title (50-60 characters)",
  "metaDescription": "Compelling description (150-160 characters)",
  "metaKeywords": ["keyword1", "keyword2", "keyword3"],
  "ogTitle": "Open Graph title",
  "ogDescription": "Open Graph description",
  "twitterTitle": "Twitter card title",
  "twitterDescription": "Twitter card description",
  "focusKeyword": "primary keyword"
}`;

    try {
      const response = await claudeService.client.messages.create({
        model: claudeService.model,
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const metaText = response.content[0].text;
      let metaTags;

      try {
        metaTags = JSON.parse(metaText);
      } catch (e) {
        // Fallback to basic meta tags
        metaTags = {
          metaTitle: title.substring(0, 60),
          metaDescription: excerpt ? excerpt.substring(0, 160) : content.substring(0, 160),
          metaKeywords: keywords.slice(0, 5),
          ogTitle: title,
          ogDescription: excerpt || content.substring(0, 200),
          twitterTitle: title,
          twitterDescription: excerpt || content.substring(0, 200),
          focusKeyword: keywords[0] || 'news',
        };
      }

      return metaTags;
    } catch (error) {
      // Return basic meta tags on error
      return {
        metaTitle: title.substring(0, 60),
        metaDescription: excerpt ? excerpt.substring(0, 160) : content.substring(0, 160),
        metaKeywords: keywords.slice(0, 5),
        ogTitle: title,
        ogDescription: excerpt || content.substring(0, 200),
        twitterTitle: title,
        twitterDescription: excerpt || content.substring(0, 200),
        focusKeyword: keywords[0] || 'news',
      };
    }
  }

  /**
   * Suggest keywords for content
   * @param {Object} params - Keyword suggestion parameters
   * @returns {Promise<Object>} Keyword suggestions
   */
  async suggestKeywords(params) {
    const { title, content, category } = params;

    this.logger.info(`[SEO] Suggesting keywords for: "${title}"`);

    const prompt = `Analyze the following article and suggest ${this.maxKeywords} highly relevant SEO keywords and phrases:

Title: ${title}
Category: ${category || 'General'}

Content:
${content.substring(0, 1000)}...

Provide keywords in JSON format:
{
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "longTailKeywords": ["long tail phrase 1", "long tail phrase 2"],
  "relatedTopics": ["topic1", "topic2"]
}`;

    try {
      const response = await claudeService.client.messages.create({
        model: claudeService.model,
        max_tokens: 512,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const keywordText = response.content[0].text;
      let suggestions;

      try {
        suggestions = JSON.parse(keywordText);
      } catch (e) {
        // Extract keywords from content if parsing fails
        suggestions = {
          keywords: this.extractTopWords(content, 5),
          longTailKeywords: [],
          relatedTopics: [],
        };
      }

      return suggestions;
    } catch (error) {
      // Fallback to simple extraction
      return {
        keywords: this.extractTopWords(content, 5),
        longTailKeywords: [],
        relatedTopics: [],
      };
    }
  }

  /**
   * Generate SEO-friendly slug
   * @param {Object} params - Slug parameters
   * @returns {Object} Generated slug
   */
  generateSlug(params) {
    const { title } = params;

    if (!title) {
      throw new Error('Title is required for slug generation');
    }

    // Convert to lowercase and remove special characters
    let slug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .substring(0, 100); // Limit length

    // Remove leading/trailing hyphens
    slug = slug.replace(/^-+|-+$/g, '');

    return {
      slug,
      length: slug.length,
      isOptimal: slug.length >= 3 && slug.length <= 75,
    };
  }

  /**
   * Analyze title for SEO
   */
  analyzeTitleSEO(title) {
    const length = title ? title.length : 0;
    const wordCount = title ? title.split(/\s+/).length : 0;
    const hasNumbers = title ? /\d/.test(title) : false;
    const hasPowerWords = title
      ? /\b(best|top|guide|ultimate|essential|proven|amazing|complete)\b/i.test(title)
      : false;

    return {
      length,
      wordCount,
      isOptimalLength: length >= 30 && length <= 70,
      hasNumbers,
      hasPowerWords,
      score: this.calculateTitleScore(length, hasNumbers, hasPowerWords),
    };
  }

  /**
   * Analyze content for SEO
   */
  analyzeContentSEO(content, keywords) {
    const wordCount = content ? content.split(/\s+/).length : 0;
    const charCount = content ? content.length : 0;
    const paragraphCount = content ? content.split(/\n\n/).filter(p => p.trim()).length : 0;
    const hasHeadings = content ? /#{1,6}\s/.test(content) || /<h[1-6]>/i.test(content) : false;
    const hasLists = content ? /[-*]\s|\d+\.\s|<[ou]l>/i.test(content) : false;

    return {
      wordCount,
      charCount,
      paragraphCount,
      hasHeadings,
      hasLists,
      isOptimalLength: wordCount >= 300 && wordCount <= 2500,
      score: this.calculateContentScore(wordCount, hasHeadings, hasLists),
    };
  }

  /**
   * Analyze excerpt for SEO
   */
  analyzeExcerptSEO(excerpt) {
    const length = excerpt ? excerpt.length : 0;
    const wordCount = excerpt ? excerpt.split(/\s+/).length : 0;

    return {
      length,
      wordCount,
      isOptimalLength: length >= 120 && length <= 160,
      exists: !!excerpt,
      score: excerpt && length >= 120 && length <= 160 ? 1 : excerpt ? 0.5 : 0,
    };
  }

  /**
   * Analyze keyword usage
   */
  analyzeKeywordUsage(content, keywords) {
    const contentLower = content ? content.toLowerCase() : '';
    const wordCount = content ? content.split(/\s+/).length : 0;

    const usage = keywords.map(keyword => {
      const keywordLower = keyword.toLowerCase();
      const matches = (contentLower.match(new RegExp(keywordLower, 'g')) || []).length;
      const density = wordCount > 0 ? matches / wordCount : 0;

      return {
        keyword,
        occurrences: matches,
        density: Math.round(density * 10000) / 10000,
        isOptimal: density >= 0.01 && density <= 0.03,
      };
    });

    return {
      keywords: usage,
      averageDensity: usage.length > 0
        ? usage.reduce((sum, k) => sum + k.density, 0) / usage.length
        : 0,
    };
  }

  /**
   * Analyze readability
   */
  analyzeReadability(content) {
    const sentences = content ? content.split(/[.!?]+/).filter(s => s.trim()) : [];
    const words = content ? content.split(/\s+/) : [];
    const avgWordsPerSentence = sentences.length > 0 ? words.length / sentences.length : 0;

    return {
      avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
      isReadable: avgWordsPerSentence >= 15 && avgWordsPerSentence <= 20,
      score: avgWordsPerSentence >= 15 && avgWordsPerSentence <= 20 ? 1 : 0.7,
    };
  }

  /**
   * Calculate title score
   */
  calculateTitleScore(length, hasNumbers, hasPowerWords) {
    let score = 0.5;
    if (length >= 30 && length <= 70) score += 0.3;
    if (hasNumbers) score += 0.1;
    if (hasPowerWords) score += 0.1;
    return Math.min(score, 1);
  }

  /**
   * Calculate content score
   */
  calculateContentScore(wordCount, hasHeadings, hasLists) {
    let score = 0.4;
    if (wordCount >= 300) score += 0.3;
    if (hasHeadings) score += 0.15;
    if (hasLists) score += 0.15;
    return Math.min(score, 1);
  }

  /**
   * Calculate overall SEO score
   */
  calculateOverallSEOScore(analysis) {
    return (
      analysis.title.score * 0.25 +
      analysis.content.score * 0.3 +
      analysis.excerpt.score * 0.15 +
      analysis.readability.score * 0.3
    );
  }

  /**
   * Calculate SEO score from analysis and meta tags
   */
  calculateSEOScore(analysis, metaTags) {
    let score = analysis.overallScore * 0.7; // 70% from content analysis

    // 30% from meta tags
    if (metaTags.metaTitle && metaTags.metaTitle.length >= 50 && metaTags.metaTitle.length <= 60) {
      score += 0.1;
    }
    if (metaTags.metaDescription && metaTags.metaDescription.length >= 150 && metaTags.metaDescription.length <= 160) {
      score += 0.1;
    }
    if (metaTags.metaKeywords && metaTags.metaKeywords.length >= 3) {
      score += 0.1;
    }

    return Math.round(score * 100) / 100;
  }

  /**
   * Get grade
   */
  getGrade(score) {
    if (score >= 0.9) return 'A+';
    if (score >= 0.8) return 'A';
    if (score >= 0.7) return 'B';
    if (score >= 0.6) return 'C';
    if (score >= 0.5) return 'D';
    return 'F';
  }

  /**
   * Generate optimization recommendations
   */
  generateRecommendations(analysis, metaTags) {
    const recommendations = [];

    // Title recommendations
    if (!analysis.title.isOptimalLength) {
      recommendations.push({
        category: 'title',
        priority: 'high',
        message: 'Optimize title length to 30-70 characters',
      });
    }
    if (!analysis.title.hasNumbers && !analysis.title.hasPowerWords) {
      recommendations.push({
        category: 'title',
        priority: 'medium',
        message: 'Consider adding numbers or power words to title',
      });
    }

    // Content recommendations
    if (!analysis.content.isOptimalLength) {
      recommendations.push({
        category: 'content',
        priority: 'high',
        message: `Adjust content length to 300-2500 words (current: ${analysis.content.wordCount})`,
      });
    }
    if (!analysis.content.hasHeadings) {
      recommendations.push({
        category: 'content',
        priority: 'medium',
        message: 'Add headings to improve content structure',
      });
    }

    // Excerpt recommendations
    if (!analysis.excerpt.exists) {
      recommendations.push({
        category: 'excerpt',
        priority: 'high',
        message: 'Add an excerpt (120-160 characters)',
      });
    }

    // Keyword recommendations
    if (analysis.keywords.keywords.length === 0) {
      recommendations.push({
        category: 'keywords',
        priority: 'high',
        message: 'Add target keywords for better SEO',
      });
    }

    return recommendations;
  }

  /**
   * Extract top words from content
   */
  extractTopWords(content, limit = 5) {
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be',
      'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
      'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that',
    ]);

    const words = content
      .toLowerCase()
      .split(/\W+/)
      .filter(word => word.length > 4 && !stopWords.has(word));

    const frequency = {};
    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });

    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([word]) => word);
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    this.logger.info('[SEO] Cleaning up...');
    await super.cleanup();
  }
}

export default SEOAgent;
