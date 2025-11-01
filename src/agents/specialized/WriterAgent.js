/**
 * Writer Agent
 * Generates high-quality article content using AI
 * Uses Claude AI service for content generation with multiple writing styles
 */

import Agent from '../base/Agent.js';
import claudeService from '../../services/ai/claudeService.js';

class WriterAgent extends Agent {
  constructor(config = {}) {
    super('Writer', config);

    this.defaultStyle = config.style || 'professional';
    this.defaultLength = config.length || 'medium'; // short, medium, long

    // Writing style templates
    this.styles = {
      professional: {
        tone: 'professional, objective, and informative',
        structure: 'clear introduction, well-organized body, concise conclusion',
      },
      casual: {
        tone: 'conversational, friendly, and engaging',
        structure: 'hook opening, storytelling approach, relatable examples',
      },
      technical: {
        tone: 'detailed, precise, and technical',
        structure: 'comprehensive analysis, technical depth, expert terminology',
      },
      editorial: {
        tone: 'opinionated, persuasive, and thought-provoking',
        structure: 'strong thesis, compelling arguments, call to action',
      },
    };

    // Length guidelines (word counts)
    this.lengths = {
      short: { min: 300, max: 500, description: 'brief overview' },
      medium: { min: 600, max: 900, description: 'standard article' },
      long: { min: 1000, max: 1500, description: 'in-depth analysis' },
    };
  }

  /**
   * Initialize the Writer Agent
   */
  async initialize() {
    this.logger.info('[Writer] Initializing...');

    // Verify Claude service availability
    if (!claudeService) {
      throw new Error('Claude AI service not available');
    }

    this.logger.info('[Writer] Initialization complete');
  }

  /**
   * Execute writing task
   * @param {Object} task - Writing task
   * @param {string} task.type - Task type: 'write', 'rewrite', 'expand'
   * @param {Object} task.params - Task parameters
   * @returns {Promise<Object>} Writing result
   */
  async execute(task) {
    const { type, params = {} } = task;

    switch (type) {
      case 'write':
        return await this.writeArticle(params);

      case 'rewrite':
        return await this.rewriteArticle(params);

      case 'expand':
        return await this.expandArticle(params);

      case 'summarize':
        return await this.summarizeArticle(params);

      default:
        throw new Error(`Unknown task type: ${type}`);
    }
  }

  /**
   * Write a new article from scratch
   * @param {Object} params - Writing parameters
   * @returns {Promise<Object>} Generated article
   */
  async writeArticle(params) {
    const {
      topic,
      sources = [],
      style = this.defaultStyle,
      length = this.defaultLength,
      keywords = [],
      targetAudience = 'general',
    } = params;

    if (!topic) {
      throw new Error('Topic is required for writing an article');
    }

    this.logger.info(`[Writer] Writing article on "${topic}" (${style}, ${length})`);

    const lengthGuide = this.lengths[length] || this.lengths.medium;
    const styleGuide = this.styles[style] || this.styles.professional;

    // Build context from sources
    const sourceContext = sources.length > 0
      ? `\n\nReference Sources:\n${sources.map((s, i) => `${i + 1}. ${s.title} - ${s.content?.substring(0, 200)}...`).join('\n')}`
      : '';

    const prompt = `You are a professional journalist writing for DigitalTide, a high-quality news platform.

Write a comprehensive article on the following topic:
${topic}

Writing Requirements:
- Style: ${styleGuide.tone}
- Structure: ${styleGuide.structure}
- Length: ${lengthGuide.min}-${lengthGuide.max} words (${lengthGuide.description})
- Target Audience: ${targetAudience}
${keywords.length > 0 ? `- Include these keywords naturally: ${keywords.join(', ')}` : ''}
${sourceContext}

Article Structure:
1. Compelling headline (60-80 characters)
2. Engaging introduction (2-3 paragraphs)
3. Main content (well-organized sections)
4. Conclusion (summary and insights)

Provide the article in the following JSON format:
{
  "headline": "Article headline",
  "excerpt": "Brief 2-3 sentence summary",
  "content": "Full article content with proper paragraphs",
  "suggestedTags": ["tag1", "tag2", "tag3"],
  "estimatedReadTime": number_in_minutes
}`;

    try {
      const response = await claudeService.client.messages.create({
        model: claudeService.model,
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content = response.content[0].text;

      // Try to parse JSON response
      let article;
      try {
        article = JSON.parse(content);
      } catch (e) {
        // If not JSON, structure it manually
        article = {
          headline: topic,
          excerpt: content.substring(0, 200),
          content,
          suggestedTags: keywords,
          estimatedReadTime: Math.ceil(content.split(/\s+/).length / 200),
        };
      }

      // Add metadata
      article.metadata = {
        model: claudeService.model,
        tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
        style,
        length,
        wordCount: article.content.split(/\s+/).length,
      };

      return article;
    } catch (error) {
      throw new Error(`Failed to write article: ${error.message}`);
    }
  }

  /**
   * Rewrite existing article with different style or focus
   * @param {Object} params - Rewriting parameters
   * @returns {Promise<Object>} Rewritten article
   */
  async rewriteArticle(params) {
    const {
      originalContent,
      originalTitle,
      newStyle = this.defaultStyle,
      newAngle = null,
      preserveFacts = true,
    } = params;

    if (!originalContent) {
      throw new Error('Original content is required for rewriting');
    }

    this.logger.info(`[Writer] Rewriting article "${originalTitle}" (${newStyle})`);

    const styleGuide = this.styles[newStyle] || this.styles.professional;

    const prompt = `Rewrite the following article with a ${styleGuide.tone} tone and ${styleGuide.structure}.

Original Title: ${originalTitle}
Original Content:
${originalContent}

${newAngle ? `New Angle: ${newAngle}` : ''}
${preserveFacts ? 'IMPORTANT: Preserve all factual information from the original article.' : ''}

Provide the rewritten article in JSON format:
{
  "headline": "New headline",
  "excerpt": "New excerpt",
  "content": "Rewritten content",
  "changes": "Brief description of key changes made"
}`;

    try {
      const response = await claudeService.client.messages.create({
        model: claudeService.model,
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content = response.content[0].text;
      let article;

      try {
        article = JSON.parse(content);
      } catch (e) {
        article = {
          headline: originalTitle,
          excerpt: content.substring(0, 200),
          content,
          changes: 'Rewritten with new style',
        };
      }

      article.metadata = {
        model: claudeService.model,
        tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
        style: newStyle,
      };

      return article;
    } catch (error) {
      throw new Error(`Failed to rewrite article: ${error.message}`);
    }
  }

  /**
   * Expand article with additional content
   * @param {Object} params - Expansion parameters
   * @returns {Promise<Object>} Expanded article
   */
  async expandArticle(params) {
    const {
      originalContent,
      originalTitle,
      expansionTopic,
      targetLength = 'long',
    } = params;

    if (!originalContent || !expansionTopic) {
      throw new Error('Original content and expansion topic are required');
    }

    this.logger.info(`[Writer] Expanding article "${originalTitle}" on ${expansionTopic}`);

    const lengthGuide = this.lengths[targetLength] || this.lengths.long;

    const prompt = `Expand the following article by adding a new section on: ${expansionTopic}

Original Article:
Title: ${originalTitle}
Content:
${originalContent}

Requirements:
- Add ${lengthGuide.min}-${lengthGuide.max} words of new content
- Maintain the same style and tone as the original
- Integrate the new section smoothly
- Preserve all original content

Provide the expanded article in JSON format:
{
  "content": "Full expanded content including original and new sections",
  "newSection": "Just the new content added",
  "integrationPoints": "Where and how new content was integrated"
}`;

    try {
      const response = await claudeService.client.messages.create({
        model: claudeService.model,
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content = response.content[0].text;
      let article;

      try {
        article = JSON.parse(content);
      } catch (e) {
        article = {
          content,
          newSection: content,
          integrationPoints: 'Appended to original content',
        };
      }

      article.metadata = {
        model: claudeService.model,
        tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
        originalWordCount: originalContent.split(/\s+/).length,
        newWordCount: article.content.split(/\s+/).length,
      };

      return article;
    } catch (error) {
      throw new Error(`Failed to expand article: ${error.message}`);
    }
  }

  /**
   * Summarize article
   * @param {Object} params - Summarization parameters
   * @returns {Promise<Object>} Summary
   */
  async summarizeArticle(params) {
    const {
      title,
      content,
      maxLength = 150,
    } = params;

    if (!content) {
      throw new Error('Content is required for summarization');
    }

    this.logger.info(`[Writer] Summarizing article "${title}"`);

    try {
      const result = await claudeService.generateSummary({ title, content }, maxLength);

      return {
        summary: result.summary,
        wordCount: result.wordCount,
        metadata: result.metadata,
      };
    } catch (error) {
      throw new Error(`Failed to summarize article: ${error.message}`);
    }
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    this.logger.info('[Writer] Cleaning up...');
    await super.cleanup();
  }
}

export default WriterAgent;
