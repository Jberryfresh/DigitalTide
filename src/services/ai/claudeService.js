/**
 * Claude AI Service
 * Anthropic Claude integration for article analysis and content generation
 * Model: Claude 3 Opus (most capable model)
 */

import Anthropic from '@anthropic-ai/sdk';
import config from '../../config/index.js';

class ClaudeService {
  constructor() {
    this.client = new Anthropic({
      apiKey: config.ai.anthropic.apiKey,
    });
    this.model = config.ai.anthropic.model || 'claude-3-opus-20240229';
    this.maxTokens = 4096;
  }

  /**
   * Generate article summary
   * @param {Object} article - Article object
   * @param {string} article.title - Article title
   * @param {string} article.content - Article content
   * @param {number} maxLength - Maximum summary length in words (default: 150)
   * @returns {Promise<Object>} Summary result
   */
  async generateSummary(article, maxLength = 150) {
    const { title, content } = article;

    if (!content || content.trim().length === 0) {
      throw new Error('Article content is required for summarization');
    }

    const prompt = `Please provide a concise, professional summary of the following news article. 
The summary should be approximately ${maxLength} words and capture the key points and main ideas.

Title: ${title}

Content:
${content}

Provide only the summary text, no additional commentary.`;

    try {
      const startTime = Date.now();

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const duration = Date.now() - startTime;
      const summary = response.content[0].text;

      return {
        summary: summary.trim(),
        wordCount: summary.trim().split(/\s+/).length,
        metadata: {
          model: this.model,
          tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
          duration,
          stopReason: response.stop_reason,
        },
      };
    } catch (error) {
      throw this.handleError(error, 'generateSummary');
    }
  }

  /**
   * Analyze article sentiment
   * @param {Object} article - Article object
   * @param {string} article.title - Article title
   * @param {string} article.content - Article content
   * @returns {Promise<Object>} Sentiment analysis result
   */
  async analyzeSentiment(article) {
    const { title, content } = article;

    const prompt = `Analyze the sentiment and tone of the following news article. 
Provide your analysis in this exact JSON format:
{
  "sentiment": "positive/negative/neutral",
  "confidence": 0.0-1.0,
  "tone": "descriptive tone (e.g., urgent, calm, optimistic, critical)",
  "emotionalImpact": "high/medium/low",
  "reasoning": "brief explanation"
}

Title: ${title}

Content:
${content}

Provide only the JSON, no additional text.`;

    try {
      const startTime = Date.now();

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const duration = Date.now() - startTime;
      const result = JSON.parse(response.content[0].text);

      return {
        sentiment: result.sentiment,
        confidence: result.confidence,
        tone: result.tone,
        emotionalImpact: result.emotionalImpact,
        reasoning: result.reasoning,
        metadata: {
          model: this.model,
          tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
          duration,
        },
      };
    } catch (error) {
      throw this.handleError(error, 'analyzeSentiment');
    }
  }

  /**
   * Extract key points from article
   * @param {Object} article - Article object
   * @param {string} article.title - Article title
   * @param {string} article.content - Article content
   * @param {number} maxPoints - Maximum number of key points (default: 5)
   * @returns {Promise<Object>} Key points extraction result
   */
  async extractKeyPoints(article, maxPoints = 5) {
    const { title, content } = article;

    const prompt = `Extract the ${maxPoints} most important key points from the following news article.
Format your response as a JSON array of strings, where each string is one key point.
Each key point should be a complete sentence that captures a significant fact or insight.

Title: ${title}

Content:
${content}

Provide only the JSON array, no additional text.`;

    try {
      const startTime = Date.now();

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 2048,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const duration = Date.now() - startTime;
      const keyPoints = JSON.parse(response.content[0].text);

      return {
        keyPoints,
        count: keyPoints.length,
        metadata: {
          model: this.model,
          tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
          duration,
        },
      };
    } catch (error) {
      throw this.handleError(error, 'extractKeyPoints');
    }
  }

  /**
   * Categorize article into predefined categories
   * @param {Object} article - Article object
   * @param {string} article.title - Article title
   * @param {string} article.content - Article content
   * @param {Array<string>} availableCategories - Available category names
   * @returns {Promise<Object>} Categorization result
   */
  async categorizeArticle(article, availableCategories = []) {
    const { title, content } = article;

    const defaultCategories = [
      'Technology',
      'Business',
      'Politics',
      'Science',
      'Health',
      'Entertainment',
      'Sports',
      'World News',
      'Environment',
      'Education',
    ];

    const categories = availableCategories.length > 0 ? availableCategories : defaultCategories;

    const prompt = `Categorize the following news article into the most appropriate category.
Choose from these categories: ${categories.join(', ')}

Provide your response in this exact JSON format:
{
  "primaryCategory": "category name",
  "confidence": 0.0-1.0,
  "secondaryCategories": ["optional", "categories"],
  "reasoning": "brief explanation"
}

Title: ${title}

Content:
${content}

Provide only the JSON, no additional text.`;

    try {
      const startTime = Date.now();

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const duration = Date.now() - startTime;
      const result = JSON.parse(response.content[0].text);

      return {
        primaryCategory: result.primaryCategory,
        confidence: result.confidence,
        secondaryCategories: result.secondaryCategories || [],
        reasoning: result.reasoning,
        metadata: {
          model: this.model,
          tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
          duration,
        },
      };
    } catch (error) {
      throw this.handleError(error, 'categorizeArticle');
    }
  }

  /**
   * Extract entities (people, organizations, locations) from article
   * @param {Object} article - Article object
   * @param {string} article.title - Article title
   * @param {string} article.content - Article content
   * @returns {Promise<Object>} Entity extraction result
   */
  async extractEntities(article) {
    const { title, content } = article;

    const prompt = `Extract all important entities from the following news article.
Provide your response in this exact JSON format:
{
  "people": ["Person Name 1", "Person Name 2"],
  "organizations": ["Organization 1", "Organization 2"],
  "locations": ["Location 1", "Location 2"],
  "events": ["Event 1", "Event 2"],
  "topics": ["Topic 1", "Topic 2"]
}

Title: ${title}

Content:
${content}

Provide only the JSON, no additional text.`;

    try {
      const startTime = Date.now();

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 2048,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const duration = Date.now() - startTime;
      const entities = JSON.parse(response.content[0].text);

      return {
        people: entities.people || [],
        organizations: entities.organizations || [],
        locations: entities.locations || [],
        events: entities.events || [],
        topics: entities.topics || [],
        totalEntities:
          (entities.people?.length || 0) +
          (entities.organizations?.length || 0) +
          (entities.locations?.length || 0) +
          (entities.events?.length || 0) +
          (entities.topics?.length || 0),
        metadata: {
          model: this.model,
          tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
          duration,
        },
      };
    } catch (error) {
      throw this.handleError(error, 'extractEntities');
    }
  }

  /**
   * Generate article tags
   * @param {Object} article - Article object
   * @param {string} article.title - Article title
   * @param {string} article.content - Article content
   * @param {number} maxTags - Maximum number of tags (default: 10)
   * @returns {Promise<Object>} Tag generation result
   */
  async generateTags(article, maxTags = 10) {
    const { title, content } = article;

    const prompt = `Generate up to ${maxTags} relevant tags for the following news article.
Tags should be short (1-3 words), relevant, and useful for search and categorization.
Format your response as a JSON array of strings.

Title: ${title}

Content:
${content}

Provide only the JSON array, no additional text.`;

    try {
      const startTime = Date.now();

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const duration = Date.now() - startTime;
      const tags = JSON.parse(response.content[0].text);

      return {
        tags,
        count: tags.length,
        metadata: {
          model: this.model,
          tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
          duration,
        },
      };
    } catch (error) {
      throw this.handleError(error, 'generateTags');
    }
  }

  /**
   * Comprehensive article analysis (combines multiple analyses)
   * @param {Object} article - Article object
   * @param {Object} options - Analysis options
   * @param {boolean} options.includeSummary - Include summary (default: true)
   * @param {boolean} options.includeSentiment - Include sentiment (default: true)
   * @param {boolean} options.includeKeyPoints - Include key points (default: true)
   * @param {boolean} options.includeCategory - Include category (default: true)
   * @param {boolean} options.includeEntities - Include entities (default: true)
   * @param {boolean} options.includeTags - Include tags (default: true)
   * @returns {Promise<Object>} Comprehensive analysis result
   */
  async analyzeArticle(article, options = {}) {
    const {
      includeSummary = true,
      includeSentiment = true,
      includeKeyPoints = true,
      includeCategory = true,
      includeEntities = true,
      includeTags = true,
    } = options;

    const startTime = Date.now();
    const results = {
      article: {
        title: article.title,
        url: article.url,
      },
      analysis: {},
      metadata: {
        totalDuration: 0,
        totalTokens: 0,
        timestamp: new Date().toISOString(),
      },
    };

    try {
      // Run analyses in parallel for better performance
      const analyses = [];

      if (includeSummary) {
        analyses.push(
          this.generateSummary(article).then(result => {
            results.analysis.summary = result;
          })
        );
      }

      if (includeSentiment) {
        analyses.push(
          this.analyzeSentiment(article).then(result => {
            results.analysis.sentiment = result;
          })
        );
      }

      if (includeKeyPoints) {
        analyses.push(
          this.extractKeyPoints(article).then(result => {
            results.analysis.keyPoints = result;
          })
        );
      }

      if (includeCategory) {
        analyses.push(
          this.categorizeArticle(article).then(result => {
            results.analysis.category = result;
          })
        );
      }

      if (includeEntities) {
        analyses.push(
          this.extractEntities(article).then(result => {
            results.analysis.entities = result;
          })
        );
      }

      if (includeTags) {
        analyses.push(
          this.generateTags(article).then(result => {
            results.analysis.tags = result;
          })
        );
      }

      await Promise.all(analyses);

      // Calculate totals
      const duration = Date.now() - startTime;
      let totalTokens = 0;

      Object.values(results.analysis).forEach(analysis => {
        if (analysis.metadata?.tokensUsed) {
          totalTokens += analysis.metadata.tokensUsed;
        }
      });

      results.metadata.totalDuration = duration;
      results.metadata.totalTokens = totalTokens;

      return results;
    } catch (error) {
      throw this.handleError(error, 'analyzeArticle');
    }
  }

  /**
   * Health check for Claude API
   * @returns {Promise<boolean>} Service health status
   */
  async healthCheck() {
    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 100,
        messages: [
          {
            role: 'user',
            content: 'Respond with "OK" if you receive this message.',
          },
        ],
      });

      return response.content[0].text.includes('OK');
    } catch (error) {
      console.error('Claude health check failed:', error.message);
      return false;
    }
  }

  /**
   * Handle API errors
   * @param {Error} error - Original error
   * @param {string} operation - Operation name
   * @returns {Error} Formatted error
   */
  handleError(error, operation) {
    const baseMessage = `Claude AI error in ${operation}`;

    if (error.status === 401) {
      return new Error(`${baseMessage}: Invalid API key`);
    }

    if (error.status === 429) {
      return new Error(`${baseMessage}: Rate limit exceeded`);
    }

    if (error.status === 500) {
      return new Error(`${baseMessage}: Service temporarily unavailable`);
    }

    if (error.status === 529) {
      return new Error(`${baseMessage}: Service overloaded, please retry`);
    }

    if (error.message?.includes('JSON')) {
      return new Error(`${baseMessage}: Failed to parse AI response`);
    }

    return new Error(`${baseMessage}: ${error.message}`);
  }
}

export default new ClaudeService();
