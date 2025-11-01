/**
 * SEO Agent - Phase 3.4 Enhanced
 * Optimizes content for search engines
 *
 * Features:
 * - Advanced meta tag optimization with validation (P1 Task 2)
 * - Keyword research automation (P2 Task 1)
 * - Internal linking strategy (P2 Task 3)
 * - Schema markup generation (P2 Task 4)
 * - SEO scoring and suggestions (P2 Task 5)
 * - Sitemap generation (P2 Task 6)
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
    const { title, content, excerpt, keywords = [], category } = params;

    this.logger.info(`[SEO] Optimizing content: "${title}"`);

    // Analyze current SEO
    const analysis = await this.analyzeContent({
      title,
      content,
      excerpt,
      keywords,
    });

    // Generate optimized meta tags
    const metaTags = await this.generateMetaTags({
      title,
      content,
      excerpt,
      keywords,
      category,
    });

    // Suggest additional keywords if needed
    let suggestedKeywords = keywords;
    if (keywords.length < 3) {
      const keywordSuggestions = await this.suggestKeywords({ title, content, category });
      suggestedKeywords = [...new Set([...keywords, ...keywordSuggestions.keywords.slice(0, 5)])];
    }

    // Generate SEO-friendly slug
    const { slug } = this.generateSlug({ title });

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

    this.logger.info('[SEO] Analyzing content SEO');

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
   * Generate meta tags for content (P1 Task 2 - Enhanced)
   * @param {Object} params - Meta tag parameters
   * @returns {Promise<Object>} Generated and validated meta tags
   */
  async generateMetaTags(params) {
    const { title, content, excerpt, keywords = [], category, author, publishDate } = params;

    this.logger.info('[SEO] Generating comprehensive meta tags');

    const prompt = `Generate SEO-optimized meta tags for the following article:

Title: ${title}
Category: ${category || 'General'}
Keywords: ${keywords.join(', ')}
Author: ${author || 'DigitalTide'}

Content Preview:
${content.substring(0, 500)}...

Generate comprehensive meta tags in JSON format:
{
  "metaTitle": "SEO-optimized title (50-60 characters, include primary keyword)",
  "metaDescription": "Compelling description (150-160 characters, include call-to-action)",
  "metaKeywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "ogTitle": "Open Graph title (engaging, can be slightly different from meta title)",
  "ogDescription": "Open Graph description (compelling for social sharing)",
  "ogType": "article",
  "twitterTitle": "Twitter card title (concise and attention-grabbing)",
  "twitterDescription": "Twitter card description (engaging for Twitter audience)",
  "twitterCard": "summary_large_image",
  "focusKeyword": "primary keyword for SEO focus",
  "canonical": "suggested canonical URL path"
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
        // Extract JSON from response
        const jsonMatch = metaText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          metaTags = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (e) {
        this.logger.warn('[SEO] Failed to parse AI response, using fallback meta tags');
        metaTags = this.generateFallbackMetaTags({
          title,
          content,
          excerpt,
          keywords,
          category,
          author,
        });
      }

      // Validate and optimize meta tags
      const validatedMetaTags = this.validateAndOptimizeMetaTags(metaTags, {
        title,
        content,
        excerpt,
        keywords,
        category,
        author,
        publishDate,
      });

      return validatedMetaTags;
    } catch (error) {
      this.logger.error('[SEO] Error generating meta tags:', error.message);
      // Return fallback meta tags on error
      return this.generateFallbackMetaTags({
        title,
        content,
        excerpt,
        keywords,
        category,
        author,
      });
    }
  }

  /**
   * Generate fallback meta tags (P1 Task 2)
   * @param {Object} params - Fallback parameters
   * @returns {Object} Basic meta tags
   */
  generateFallbackMetaTags(params) {
    const { title, content, excerpt, keywords = [], category, author } = params;

    const metaTitle = this.optimizeMetaTitle(title, keywords[0]);
    const metaDescription = this.optimizeMetaDescription(excerpt || content, keywords[0]);

    return {
      metaTitle,
      metaDescription,
      metaKeywords: keywords.slice(0, 5),
      ogTitle: title,
      ogDescription: metaDescription,
      ogType: 'article',
      twitterTitle: this.truncateText(title, 70),
      twitterDescription: this.truncateText(metaDescription, 200),
      twitterCard: 'summary_large_image',
      focusKeyword: keywords[0] || this.extractTopWords(content, 1)[0] || 'news',
      canonical: this.generateCanonicalPath(title),
      author: author || 'DigitalTide',
      articleSection: category || 'News',
      validation: {
        isValid: true,
        warnings: ['Generated using fallback method'],
      },
    };
  }

  /**
   * Validate and optimize meta tags (P1 Task 2)
   * @param {Object} metaTags - Meta tags to validate
   * @param {Object} context - Context for validation
   * @returns {Object} Validated and optimized meta tags
   */
  validateAndOptimizeMetaTags(metaTags, context) {
    const validation = {
      isValid: true,
      warnings: [],
      errors: [],
      optimizations: [],
    };

    // Validate and optimize meta title
    if (!metaTags.metaTitle || metaTags.metaTitle.length === 0) {
      metaTags.metaTitle = this.optimizeMetaTitle(context.title, context.keywords[0]);
      validation.warnings.push('Meta title was missing, generated from article title');
    } else if (metaTags.metaTitle.length < 30) {
      validation.warnings.push(
        `Meta title too short (${metaTags.metaTitle.length} chars, recommended 50-60)`
      );
    } else if (metaTags.metaTitle.length > 70) {
      const originalLength = metaTags.metaTitle.length;
      metaTags.metaTitle = this.truncateText(metaTags.metaTitle, 60);
      validation.optimizations.push(
        `Meta title truncated from ${originalLength} to ${metaTags.metaTitle.length} chars`
      );
    }

    // Validate and optimize meta description
    if (!metaTags.metaDescription || metaTags.metaDescription.length === 0) {
      metaTags.metaDescription = this.optimizeMetaDescription(
        context.excerpt || context.content,
        context.keywords[0]
      );
      validation.warnings.push('Meta description was missing, generated from content');
    } else if (metaTags.metaDescription.length < 120) {
      validation.warnings.push(
        `Meta description too short (${metaTags.metaDescription.length} chars, recommended 150-160)`
      );
    } else if (metaTags.metaDescription.length > 170) {
      const originalLength = metaTags.metaDescription.length;
      metaTags.metaDescription = this.truncateText(metaTags.metaDescription, 160);
      validation.optimizations.push(
        `Meta description truncated from ${originalLength} to ${metaTags.metaDescription.length} chars`
      );
    }

    // Validate meta keywords
    if (!metaTags.metaKeywords || metaTags.metaKeywords.length === 0) {
      metaTags.metaKeywords = context.keywords.slice(0, 5);
      validation.warnings.push('Meta keywords were missing, using provided keywords');
    } else if (metaTags.metaKeywords.length > 10) {
      metaTags.metaKeywords = metaTags.metaKeywords.slice(0, 10);
      validation.optimizations.push('Meta keywords limited to 10 maximum');
    }

    // Validate Open Graph tags
    metaTags.ogTitle = metaTags.ogTitle || metaTags.metaTitle;
    metaTags.ogDescription = metaTags.ogDescription || metaTags.metaDescription;
    metaTags.ogType = metaTags.ogType || 'article';

    // Validate Twitter Card tags
    metaTags.twitterTitle = metaTags.twitterTitle || this.truncateText(metaTags.metaTitle, 70);
    metaTags.twitterDescription =
      metaTags.twitterDescription || this.truncateText(metaTags.metaDescription, 200);
    metaTags.twitterCard = metaTags.twitterCard || 'summary_large_image';

    // Add additional structured data
    metaTags.author = context.author || 'DigitalTide';
    metaTags.articleSection = context.category || 'News';
    metaTags.publishDate = context.publishDate || new Date().toISOString();

    // Ensure focus keyword is present
    if (!metaTags.focusKeyword) {
      metaTags.focusKeyword =
        context.keywords[0] || this.extractTopWords(context.content, 1)[0] || 'news';
      validation.warnings.push('Focus keyword was missing, extracted from content');
    }

    // Generate canonical URL if missing
    if (!metaTags.canonical) {
      metaTags.canonical = this.generateCanonicalPath(context.title);
    }

    // Check for keyword presence in meta title
    if (
      metaTags.focusKeyword &&
      !metaTags.metaTitle.toLowerCase().includes(metaTags.focusKeyword.toLowerCase())
    ) {
      validation.warnings.push(`Focus keyword "${metaTags.focusKeyword}" not found in meta title`);
    }

    // Check for keyword presence in meta description
    if (
      metaTags.focusKeyword &&
      !metaTags.metaDescription.toLowerCase().includes(metaTags.focusKeyword.toLowerCase())
    ) {
      validation.warnings.push(
        `Focus keyword "${metaTags.focusKeyword}" not found in meta description`
      );
    }

    // Calculate quality score
    const qualityScore = this.calculateMetaTagQuality(metaTags, validation);

    metaTags.validation = validation;
    metaTags.qualityScore = qualityScore;

    this.logger.info(`[SEO] Meta tags validated with quality score: ${qualityScore}/100`);

    return metaTags;
  }

  /**
   * Optimize meta title (P1 Task 2)
   * @param {string} title - Original title
   * @param {string} keyword - Focus keyword
   * @returns {string} Optimized meta title
   */
  optimizeMetaTitle(title, keyword) {
    let optimized = title;

    // Ensure keyword is included (if provided and not already present)
    if (keyword && !title.toLowerCase().includes(keyword.toLowerCase())) {
      optimized = `${keyword} - ${title}`;
    }

    // Add brand suffix if space allows
    if (optimized.length < 50) {
      optimized = `${optimized} | DigitalTide`;
    }

    // Truncate if too long
    if (optimized.length > 60) {
      optimized = this.truncateText(optimized, 60);
    }

    return optimized;
  }

  /**
   * Optimize meta description (P1 Task 2)
   * @param {string} text - Source text
   * @param {string} keyword - Focus keyword
   * @returns {string} Optimized meta description
   */
  optimizeMetaDescription(text, keyword) {
    // Extract first complete sentence or paragraph
    let description = text.substring(0, 300).trim();

    // Find last complete sentence within limit
    const lastPeriod = description.lastIndexOf('.');
    if (lastPeriod > 100 && lastPeriod < 170) {
      description = description.substring(0, lastPeriod + 1);
    }

    // Ensure keyword is included
    if (keyword && !description.toLowerCase().includes(keyword.toLowerCase())) {
      // Prepend keyword if space allows
      if (description.length < 140) {
        description = `${keyword}: ${description}`;
      }
    }

    // Add call-to-action if space allows
    if (description.length < 140) {
      description = `${description} Read more.`;
    }

    // Truncate to optimal length
    if (description.length > 160) {
      description = this.truncateText(description, 160);
    }

    return description;
  }

  /**
   * Generate canonical URL path (P1 Task 2)
   * @param {string} title - Article title
   * @returns {string} Canonical URL path
   */
  generateCanonicalPath(title) {
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 100);

    return `/article/${slug}`;
  }

  /**
   * Truncate text intelligently (P1 Task 2)
   * @param {string} text - Text to truncate
   * @param {number} maxLength - Maximum length
   * @returns {string} Truncated text
   */
  truncateText(text, maxLength) {
    if (text.length <= maxLength) {
      return text;
    }

    // Try to truncate at last space before limit
    const truncated = text.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');

    if (lastSpace > maxLength * 0.8) {
      return `${truncated.substring(0, lastSpace)}...`;
    }

    // If no good space found, hard truncate
    return `${truncated.substring(0, maxLength - 3)}...`;
  }

  /**
   * Calculate meta tag quality score (P1 Task 2)
   * @param {Object} metaTags - Meta tags to score
   * @param {Object} validation - Validation results
   * @returns {number} Quality score (0-100)
   */
  calculateMetaTagQuality(metaTags, validation) {
    let score = 100;

    // Deduct points for warnings
    score -= validation.warnings.length * 5;

    // Deduct points for errors
    score -= validation.errors.length * 15;

    // Bonus for optimal lengths
    if (metaTags.metaTitle.length >= 50 && metaTags.metaTitle.length <= 60) {
      score += 5;
    }
    if (metaTags.metaDescription.length >= 150 && metaTags.metaDescription.length <= 160) {
      score += 5;
    }

    // Bonus for keyword presence
    if (metaTags.focusKeyword) {
      if (metaTags.metaTitle.toLowerCase().includes(metaTags.focusKeyword.toLowerCase())) {
        score += 5;
      }
      if (metaTags.metaDescription.toLowerCase().includes(metaTags.focusKeyword.toLowerCase())) {
        score += 5;
      }
    }

    // Ensure score is within bounds
    return Math.max(0, Math.min(100, score));
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
      averageDensity:
        usage.length > 0 ? usage.reduce((sum, k) => sum + k.density, 0) / usage.length : 0,
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
    if (
      metaTags.metaDescription &&
      metaTags.metaDescription.length >= 150 &&
      metaTags.metaDescription.length <= 160
    ) {
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
   * Generate comprehensive SEO score with detailed breakdown (P2 Task 5 - Enhanced)
   * @param {Object} params - Scoring parameters
   * @returns {Object} Comprehensive SEO score with breakdown
   */
  generateComprehensiveSEOScore(params) {
    const { title, content, excerpt, keywords = [], metaTags, url } = params;

    this.logger.info('[SEO] Generating comprehensive SEO score');

    // Analyze each component
    const titleAnalysis = this.analyzeTitleSEO(title);
    const contentAnalysis = this.analyzeContentSEO(content, keywords);
    const excerptAnalysis = this.analyzeExcerptSEO(excerpt);
    const keywordAnalysis = this.analyzeKeywordUsage(content, keywords);
    const readabilityAnalysis = this.analyzeReadability(content);
    const urlAnalysis = url ? this.analyzeUrlSEO(url) : null;

    // Calculate component scores (0-100 scale)
    const scores = {
      title: this.calculateTitleScore(titleAnalysis) * 100,
      content: this.calculateContentScore(contentAnalysis) * 100,
      excerpt: excerptAnalysis.score * 100,
      keywords: this.calculateKeywordScore(keywordAnalysis) * 100,
      readability: readabilityAnalysis.score * 100,
      metaTags: metaTags ? this.calculateMetaTagScore(metaTags) : 0,
      url: urlAnalysis ? this.calculateUrlScore(urlAnalysis) * 100 : 100,
    };

    // Calculate weighted overall score
    const overallScore = Math.round(
      scores.title * 0.15 +
        scores.content * 0.25 +
        scores.excerpt * 0.1 +
        scores.keywords * 0.15 +
        scores.readability * 0.15 +
        scores.metaTags * 0.15 +
        scores.url * 0.05
    );

    // Determine grade and status
    const grade = this.getGrade(overallScore / 100);
    const status = this.getSEOStatus(overallScore);

    // Generate actionable suggestions
    const suggestions = this.generateActionableSuggestions({
      titleAnalysis,
      contentAnalysis,
      excerptAnalysis,
      keywordAnalysis,
      readabilityAnalysis,
      urlAnalysis,
      metaTags,
      scores,
    });

    // Calculate potential score improvement
    const potentialScore = this.calculatePotentialScore(scores, suggestions);

    return {
      overallScore,
      grade,
      status,
      scores,
      breakdown: {
        title: { ...titleAnalysis, score: scores.title },
        content: { ...contentAnalysis, score: scores.content },
        excerpt: { ...excerptAnalysis, score: scores.excerpt },
        keywords: { ...keywordAnalysis, score: scores.keywords },
        readability: { ...readabilityAnalysis, score: scores.readability },
        metaTags: metaTags
          ? { ...metaTags.validation, score: scores.metaTags }
          : { score: 0, warnings: ['Meta tags not provided'] },
        url: urlAnalysis ? { ...urlAnalysis, score: scores.url } : null,
      },
      suggestions,
      potentialScore,
      improvement: potentialScore - overallScore,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Analyze URL for SEO (P2 Task 5)
   * @param {string} url - URL to analyze
   * @returns {Object} URL analysis
   */
  analyzeUrlSEO(url) {
    const urlLower = url.toLowerCase();
    const { length } = url;
    const hasKeywords = /\w+/.test(url);
    const hasNumbers = /\d/.test(url);
    const hasSpecialChars = /[^\w\d\-\/]/.test(url);
    const segmentCount = url.split('/').filter(s => s).length;

    return {
      length,
      isOptimalLength: length >= 10 && length <= 75,
      hasKeywords,
      hasNumbers,
      hasSpecialChars,
      segmentCount,
      isClean: !hasSpecialChars && segmentCount <= 4,
      recommendations: [],
    };
  }

  /**
   * Calculate keyword score (P2 Task 5)
   * @param {Object} keywordAnalysis - Keyword analysis results
   * @returns {number} Keyword score (0-1)
   */
  calculateKeywordScore(keywordAnalysis) {
    if (!keywordAnalysis.keywords || keywordAnalysis.keywords.length === 0) {
      return 0;
    }

    let score = 0.3; // Base score for having keywords

    // Score based on keyword count (optimal 3-5)
    const keywordCount = keywordAnalysis.keywords.length;
    if (keywordCount >= 3 && keywordCount <= 5) {
      score += 0.2;
    } else if (keywordCount > 0) {
      score += 0.1;
    }

    // Score based on average density (optimal 1-3%)
    const avgDensity = keywordAnalysis.averageDensity;
    if (avgDensity >= 0.01 && avgDensity <= 0.03) {
      score += 0.3;
    } else if (avgDensity > 0 && avgDensity < 0.05) {
      score += 0.15;
    }

    // Score based on optimal keyword usage
    const optimalCount = keywordAnalysis.keywords.filter(k => k.isOptimal).length;
    score += (optimalCount / keywordCount) * 0.2;

    return Math.min(score, 1);
  }

  /**
   * Calculate meta tag score (P2 Task 5)
   * @param {Object} metaTags - Meta tags with validation
   * @returns {number} Meta tag score (0-100)
   */
  calculateMetaTagScore(metaTags) {
    if (!metaTags.validation) {
      return 50; // Default score if no validation
    }

    // Start with quality score if available
    let score = metaTags.qualityScore || 50;

    // Adjust based on validation results
    const { warnings, errors } = metaTags.validation;
    score -= errors.length * 10;
    score -= warnings.length * 3;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate URL score (P2 Task 5)
   * @param {Object} urlAnalysis - URL analysis results
   * @returns {number} URL score (0-1)
   */
  calculateUrlScore(urlAnalysis) {
    let score = 0.5;

    if (urlAnalysis.isOptimalLength) score += 0.2;
    if (urlAnalysis.hasKeywords) score += 0.15;
    if (urlAnalysis.isClean) score += 0.15;

    return Math.min(score, 1);
  }

  /**
   * Get SEO status (P2 Task 5)
   * @param {number} score - Overall score (0-100)
   * @returns {Object} Status information
   */
  getSEOStatus(score) {
    if (score >= 90) {
      return {
        level: 'excellent',
        color: 'green',
        message: 'Outstanding SEO optimization',
        emoji: '🟢',
      };
    }
    if (score >= 75) {
      return {
        level: 'good',
        color: 'lightgreen',
        message: 'Good SEO with minor improvements possible',
        emoji: '🟡',
      };
    }
    if (score >= 60) {
      return {
        level: 'fair',
        color: 'yellow',
        message: 'Fair SEO - several improvements needed',
        emoji: '🟠',
      };
    }
    if (score >= 40) {
      return {
        level: 'poor',
        color: 'orange',
        message: 'Poor SEO - significant optimization required',
        emoji: '🔴',
      };
    }
    return {
      level: 'critical',
      color: 'red',
      message: 'Critical SEO issues - major overhaul needed',
      emoji: '⛔',
    };
  }

  /**
   * Generate actionable suggestions (P2 Task 5 - Enhanced)
   * @param {Object} analyses - All analysis results
   * @returns {Array} Prioritized actionable suggestions
   */
  generateActionableSuggestions(analyses) {
    const suggestions = [];
    const { titleAnalysis, contentAnalysis, excerptAnalysis, keywordAnalysis, scores } = analyses;

    // Critical priority suggestions (score < 40)
    if (scores.title < 40) {
      suggestions.push({
        category: 'title',
        priority: 'critical',
        impact: 'high',
        effort: 'low',
        currentScore: scores.title,
        potentialGain: 60,
        action: 'Rewrite title to be more SEO-friendly',
        details: `Current title is ${titleAnalysis.length} characters. Aim for 50-60 characters with focus keyword.`,
        example: 'Include primary keyword near the beginning and make it compelling.',
      });
    }

    if (scores.keywords < 40) {
      suggestions.push({
        category: 'keywords',
        priority: 'critical',
        impact: 'high',
        effort: 'medium',
        currentScore: scores.keywords,
        potentialGain: 50,
        action: 'Add and optimize target keywords',
        details: 'Currently missing keywords or poor keyword density.',
        example: 'Research 3-5 relevant keywords and naturally incorporate them with 1-3% density.',
      });
    }

    // High priority suggestions (score 40-60)
    if (scores.title >= 40 && scores.title < 60 && !titleAnalysis.hasPowerWords) {
      suggestions.push({
        category: 'title',
        priority: 'high',
        impact: 'medium',
        effort: 'low',
        currentScore: scores.title,
        potentialGain: 15,
        action: 'Add power words to title',
        details: 'Power words increase click-through rates.',
        example: 'Use words like "ultimate", "essential", "proven", "complete".',
      });
    }

    if (scores.content >= 40 && scores.content < 60 && !contentAnalysis.hasHeadings) {
      suggestions.push({
        category: 'content',
        priority: 'high',
        impact: 'high',
        effort: 'medium',
        currentScore: scores.content,
        potentialGain: 20,
        action: 'Add H2 and H3 headings to structure content',
        details: 'Headings improve readability and SEO.',
        example:
          'Break content into logical sections with descriptive headings containing keywords.',
      });
    }

    if (scores.excerpt < 60 && !excerptAnalysis.exists) {
      suggestions.push({
        category: 'excerpt',
        priority: 'high',
        impact: 'medium',
        effort: 'low',
        currentScore: scores.excerpt,
        potentialGain: 40,
        action: 'Write a compelling excerpt',
        details: 'Excerpt appears in search results and social shares.',
        example: 'Create 150-160 character summary with focus keyword and call-to-action.',
      });
    }

    // Medium priority suggestions (score 60-75)
    if (scores.content >= 60 && scores.content < 75 && !contentAnalysis.hasLists) {
      suggestions.push({
        category: 'content',
        priority: 'medium',
        impact: 'low',
        effort: 'low',
        currentScore: scores.content,
        potentialGain: 10,
        action: 'Add bullet points or numbered lists',
        details: 'Lists improve scannability and user experience.',
        example: 'Convert dense paragraphs into organized lists where appropriate.',
      });
    }

    if (scores.readability >= 60 && scores.readability < 75) {
      suggestions.push({
        category: 'readability',
        priority: 'medium',
        impact: 'medium',
        effort: 'medium',
        currentScore: scores.readability,
        potentialGain: 15,
        action: 'Improve readability with shorter sentences',
        details: 'Target 15-20 words per sentence on average.',
        example: 'Break complex sentences into simpler ones. Use transition words.',
      });
    }

    // Low priority suggestions (score 75+)
    if (scores.url && scores.url < 90 && analyses.urlAnalysis && !analyses.urlAnalysis.isClean) {
      suggestions.push({
        category: 'url',
        priority: 'low',
        impact: 'low',
        effort: 'low',
        currentScore: scores.url,
        potentialGain: 10,
        action: 'Simplify URL structure',
        details: 'Clean URLs are more user and SEO-friendly.',
        example: 'Remove special characters and keep URL segments under 4 levels.',
      });
    }

    // Sort by priority and impact
    const priorityOrder = {
      critical: 0,
      high: 1,
      medium: 2,
      low: 3,
    };
    suggestions.sort((a, b) => {
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return b.potentialGain - a.potentialGain;
    });

    return suggestions;
  }

  /**
   * Calculate potential score after improvements (P2 Task 5)
   * @param {Object} currentScores - Current component scores
   * @param {Array} suggestions - Improvement suggestions
   * @returns {number} Potential overall score
   */
  calculatePotentialScore(currentScores, suggestions) {
    const improvedScores = { ...currentScores };

    // Apply potential gains from suggestions
    suggestions.forEach(suggestion => {
      const { category } = suggestion;
      if (improvedScores[category] !== undefined) {
        improvedScores[category] = Math.min(
          100,
          improvedScores[category] + suggestion.potentialGain
        );
      }
    });

    // Recalculate overall score with weights
    const potentialScore = Math.round(
      improvedScores.title * 0.15 +
        improvedScores.content * 0.25 +
        improvedScores.excerpt * 0.1 +
        improvedScores.keywords * 0.15 +
        improvedScores.readability * 0.15 +
        improvedScores.metaTags * 0.15 +
        improvedScores.url * 0.05
    );

    return potentialScore;
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
      'were',
      'be',
      'been',
      'have',
      'has',
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
      'must',
      'can',
      'this',
      'that',
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
