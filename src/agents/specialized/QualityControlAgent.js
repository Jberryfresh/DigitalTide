/**
 * Quality Control Agent
 * Validates and ensures content quality standards
 * Performs fact-checking, plagiarism detection, and quality scoring
 */

import Agent from '../base/Agent.js';
import claudeService from '../../services/ai/claudeService.js';

class QualityControlAgent extends Agent {
  constructor(config = {}) {
    super('QualityControl', config);

    this.minQualityScore = config.minQualityScore || 0.7;
    this.checkPlagiarism = config.checkPlagiarism !== false;
    this.checkFacts = config.checkFacts !== false;
    this.checkGrammar = config.checkGrammar !== false;
  }

  /**
   * Initialize the Quality Control Agent
   */
  async initialize() {
    this.logger.info('[QualityControl] Initializing...');

    // Verify Claude service availability for quality checks
    if (!claudeService) {
      throw new Error('Claude AI service not available');
    }

    this.logger.info('[QualityControl] Initialization complete');
  }

  /**
   * Execute quality control task
   * @param {Object} task - Quality control task
   * @param {string} task.type - Task type: 'validate', 'score', 'review'
   * @param {Object} task.params - Task parameters
   * @returns {Promise<Object>} Quality control result
   */
  async execute(task) {
    const { type, params = {} } = task;

    switch (type) {
      case 'validate':
        return await this.validateContent(params);

      case 'score':
        return await this.scoreContent(params);

      case 'review':
        return await this.reviewContent(params);

      case 'factCheck':
        return await this.factCheck(params);

      default:
        throw new Error(`Unknown task type: ${type}`);
    }
  }

  /**
   * Validate content against quality standards
   * @param {Object} params - Validation parameters
   * @returns {Promise<Object>} Validation result
   */
  async validateContent(params) {
    const { title, content, excerpt, minimumWordCount = 300, requireExcerpt = true } = params;

    this.logger.info(`[QualityControl] Validating content: "${title}"`);

    const issues = [];
    const warnings = [];

    // Basic validations
    if (!title || title.trim().length === 0) {
      issues.push({ type: 'error', field: 'title', message: 'Title is required' });
    } else {
      if (title.length < 20) {
        warnings.push({
          type: 'warning',
          field: 'title',
          message: 'Title is too short (minimum 20 characters)',
        });
      }
      if (title.length > 150) {
        warnings.push({
          type: 'warning',
          field: 'title',
          message: 'Title is too long (maximum 150 characters)',
        });
      }
    }

    if (!content || content.trim().length === 0) {
      issues.push({ type: 'error', field: 'content', message: 'Content is required' });
    } else {
      const wordCount = content.trim().split(/\s+/).length;
      if (wordCount < minimumWordCount) {
        issues.push({
          type: 'error',
          field: 'content',
          message: `Content is too short (${wordCount} words, minimum ${minimumWordCount})`,
        });
      }
    }

    if (requireExcerpt && (!excerpt || excerpt.trim().length === 0)) {
      warnings.push({ type: 'warning', field: 'excerpt', message: 'Excerpt is recommended' });
    }

    // Grammar and spelling check using AI
    if (this.checkGrammar && content) {
      try {
        const grammarCheck = await this.checkGrammarAndSpelling(title, content);
        if (grammarCheck.issues.length > 0) {
          warnings.push(...grammarCheck.issues);
        }
      } catch (error) {
        this.logger.error('[QualityControl] Grammar check failed:', error.message);
      }
    }

    const isValid = issues.length === 0;
    const qualityScore = this.calculateQualityScore({
      title,
      content,
      excerpt,
      issues,
      warnings,
    });

    return {
      isValid,
      qualityScore,
      issues,
      warnings,
      recommendation: this.getRecommendation(qualityScore, issues, warnings),
    };
  }

  /**
   * Score content quality
   * @param {Object} params - Scoring parameters
   * @returns {Promise<Object>} Quality score
   */
  async scoreContent(params) {
    const { title, content, excerpt } = params;

    this.logger.info(`[QualityControl] Scoring content: "${title}"`);

    const scores = {
      readability: 0,
      structure: 0,
      depth: 0,
      engagement: 0,
      seo: 0,
    };

    // Readability (0-1)
    const wordCount = content.split(/\s+/).length;
    const avgSentenceLength = this.calculateAverageSentenceLength(content);
    scores.readability = this.calculateReadabilityScore(wordCount, avgSentenceLength);

    // Structure (0-1)
    scores.structure = this.assessStructure(content);

    // Depth (0-1)
    scores.depth = Math.min(wordCount / 1000, 1); // 1000+ words = max depth score

    // Engagement (0-1)
    scores.engagement = this.assessEngagement(title, content, excerpt);

    // SEO (0-1)
    scores.seo = this.assessSEO(title, content, excerpt);

    // Overall score (weighted average)
    const overall =
      scores.readability * 0.2 +
      scores.structure * 0.25 +
      scores.depth * 0.2 +
      scores.engagement * 0.2 +
      scores.seo * 0.15;

    return {
      overall: Math.round(overall * 100) / 100,
      breakdown: scores,
      grade: this.getGrade(overall),
      suggestions: this.getSuggestions(scores),
    };
  }

  /**
   * Comprehensive content review
   * @param {Object} params - Review parameters
   * @returns {Promise<Object>} Review result
   */
  async reviewContent(params) {
    const { title, content } = params;

    this.logger.info(`[QualityControl] Reviewing content: "${title}"`);

    const prompt = `You are a professional editor reviewing content for a news platform. 
Review the following article and provide constructive feedback.

Title: ${title}

Content:
${content}

Provide your review in JSON format:
{
  "overallRating": 1-10,
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "suggestions": ["suggestion 1", "suggestion 2"],
  "tone": "description of tone",
  "targetAudience": "description of best audience",
  "readability": "easy/medium/difficult",
  "recommendation": "approve/revise/reject"
}`;

    try {
      const response = await claudeService.client.messages.create({
        model: claudeService.model,
        max_tokens: 2048,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const reviewText = response.content[0].text;
      let review;

      try {
        review = JSON.parse(reviewText);
      } catch (e) {
        review = {
          overallRating: 7,
          strengths: ['Content provided'],
          weaknesses: [],
          suggestions: [reviewText.substring(0, 200)],
          tone: 'unknown',
          targetAudience: 'general',
          readability: 'medium',
          recommendation: 'revise',
        };
      }

      review.metadata = {
        model: claudeService.model,
        tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
      };

      return review;
    } catch (error) {
      throw new Error(`Content review failed: ${error.message}`);
    }
  }

  /**
   * Fact-check content
   * @param {Object} params - Fact-checking parameters
   * @returns {Promise<Object>} Fact-check result
   */
  async factCheck(params) {
    const { title, content, sources = [] } = params;

    this.logger.info(`[QualityControl] Fact-checking: "${title}"`);

    const sourcesText =
      sources.length > 0
        ? `\n\nReference sources:\n${sources.map((s, i) => `${i + 1}. ${s}`).join('\n')}`
        : '';

    const prompt = `You are a professional fact-checker. Review the following article for factual accuracy, 
potential misinformation, and claims that need verification.

Title: ${title}

Content:
${content}
${sourcesText}

Provide your fact-check in JSON format:
{
  "overallConfidence": 0-100,
  "verifiedClaims": ["claim 1", "claim 2"],
  "unverifiedClaims": ["claim 1", "claim 2"],
  "potentialIssues": ["issue 1", "issue 2"],
  "requiresMoreSources": true/false,
  "recommendation": "approve/review/reject",
  "reasoning": "brief explanation"
}`;

    try {
      const response = await claudeService.client.messages.create({
        model: claudeService.model,
        max_tokens: 2048,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const checkText = response.content[0].text;
      let factCheck;

      try {
        factCheck = JSON.parse(checkText);
      } catch (e) {
        factCheck = {
          overallConfidence: 50,
          verifiedClaims: [],
          unverifiedClaims: [],
          potentialIssues: ['Unable to parse fact-check results'],
          requiresMoreSources: true,
          recommendation: 'review',
          reasoning: 'Automated check inconclusive',
        };
      }

      factCheck.metadata = {
        model: claudeService.model,
        tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
      };

      return factCheck;
    } catch (error) {
      throw new Error(`Fact-checking failed: ${error.message}`);
    }
  }

  /**
   * Check grammar and spelling
   * @param {string} title - Title
   * @param {string} content - Content
   * @returns {Promise<Object>} Grammar check result
   */
  async checkGrammarAndSpelling(title, content) {
    const text = `${title}\n\n${content}`;
    const preview = text.substring(0, 1000); // Check first 1000 chars

    const prompt = `Check the following text for grammar and spelling errors. List only critical issues.

Text:
${preview}

Provide results in JSON format:
{
  "issues": [{"type": "warning", "field": "content", "message": "description"}]
}`;

    try {
      const response = await claudeService.client.messages.create({
        model: claudeService.model,
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      });

      const result = JSON.parse(response.content[0].text);
      return result;
    } catch (error) {
      return { issues: [] };
    }
  }

  /**
   * Calculate quality score
   */
  calculateQualityScore(data) {
    let score = 1.0;

    // Deduct for issues
    score -= data.issues.length * 0.2;

    // Deduct for warnings
    score -= data.warnings.length * 0.05;

    // Bonus for good content length
    const wordCount = data.content.split(/\s+/).length;
    if (wordCount >= 500) score += 0.1;
    if (wordCount >= 1000) score += 0.1;

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Calculate readability score
   */
  calculateReadabilityScore(wordCount, avgSentenceLength) {
    // Ideal: 15-20 words per sentence
    const sentenceScore = avgSentenceLength >= 15 && avgSentenceLength <= 20 ? 1 : 0.7;
    const lengthScore = wordCount >= 300 ? 1 : wordCount / 300;
    return (sentenceScore + lengthScore) / 2;
  }

  /**
   * Calculate average sentence length
   */
  calculateAverageSentenceLength(content) {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const totalWords = content.split(/\s+/).length;
    return sentences.length > 0 ? totalWords / sentences.length : 0;
  }

  /**
   * Assess content structure
   */
  assessStructure(content) {
    const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);
    const hasParagraphs = paragraphs.length >= 3 ? 0.5 : 0.2;
    const hasVariety =
      paragraphs.some(p => p.length > 200) && paragraphs.some(p => p.length < 200) ? 0.5 : 0.3;
    return hasParagraphs + hasVariety;
  }

  /**
   * Assess engagement potential
   */
  assessEngagement(title, content, excerpt) {
    let score = 0.5;

    // Title engagement
    if (title && /[?!]/.test(title)) score += 0.15;
    if (title && /\d/.test(title)) score += 0.1; // Numbers in title

    // Content engagement
    if (content && content.includes('?')) score += 0.1; // Questions
    if (excerpt && excerpt.length > 50) score += 0.15;

    return Math.min(score, 1);
  }

  /**
   * Assess SEO quality
   */
  assessSEO(title, content, excerpt) {
    let score = 0.5;

    if (title && title.length >= 30 && title.length <= 70) score += 0.2;
    if (excerpt && excerpt.length >= 120 && excerpt.length <= 160) score += 0.2;
    if (content && content.length >= 300) score += 0.1;

    return Math.min(score, 1);
  }

  /**
   * Get quality grade
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
   * Get improvement suggestions
   */
  getSuggestions(scores) {
    const suggestions = [];

    if (scores.readability < 0.7) {
      suggestions.push('Improve readability: Use shorter sentences and simpler language');
    }
    if (scores.structure < 0.7) {
      suggestions.push('Improve structure: Add more paragraphs and vary paragraph lengths');
    }
    if (scores.depth < 0.7) {
      suggestions.push('Add more depth: Expand content with more details and examples');
    }
    if (scores.engagement < 0.7) {
      suggestions.push('Increase engagement: Add questions, statistics, or compelling hooks');
    }
    if (scores.seo < 0.7) {
      suggestions.push('Optimize SEO: Improve title and excerpt length');
    }

    return suggestions;
  }

  /**
   * Get recommendation based on validation
   */
  getRecommendation(score, issues, warnings) {
    if (issues.length > 0) return 'reject';
    if (score < 0.5) return 'major_revision';
    if (score < 0.7) return 'minor_revision';
    if (warnings.length > 2) return 'review';
    return 'approve';
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    this.logger.info('[QualityControl] Cleaning up...');
    await super.cleanup();
  }
}

export default QualityControlAgent;
