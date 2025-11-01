/**
 * Writer Agent - Phase 3.3 Enhanced
 * Generates high-quality article content using AI with advanced features
 *
 * Features:
 * - Claude/GPT integration for content generation
 * - Content transformation and rewriting
 * - Headline generation and optimization
 * - Tone and style consistency checking
 * - Article structure templates
 * - Multimedia content suggestions
 * - Readability optimization
 * - Content length optimization
 * - Writing personality profiles
 */

import Agent from '../base/Agent.js';
import unifiedAIService from '../../services/ai/unifiedAIService.js';

class WriterAgent extends Agent {
  constructor(config = {}) {
    super('Writer', config);

    this.defaultStyle = config.style || 'professional';
    this.defaultLength = config.length || 'medium';
    this.defaultPersonality = config.personality || 'balanced';

    // Enhanced writing style templates (P1 Task 5)
    this.styles = {
      professional: {
        tone: 'professional, objective, and informative',
        structure: 'clear introduction, well-organized body, concise conclusion',
        voice: 'third-person, authoritative',
        sentenceVariety: 'mix of simple and complex sentences',
      },
      casual: {
        tone: 'conversational, friendly, and engaging',
        structure: 'hook opening, storytelling approach, relatable examples',
        voice: 'second-person, approachable',
        sentenceVariety: 'shorter sentences, active voice',
      },
      technical: {
        tone: 'detailed, precise, and technical',
        structure: 'comprehensive analysis, technical depth, expert terminology',
        voice: 'third-person, expert',
        sentenceVariety: 'complex sentences with technical accuracy',
      },
      editorial: {
        tone: 'opinionated, persuasive, and thought-provoking',
        structure: 'strong thesis, compelling arguments, call to action',
        voice: 'first-person allowed, passionate',
        sentenceVariety: 'varied for emphasis and rhythm',
      },
      narrative: {
        tone: 'storytelling, engaging, and descriptive',
        structure: 'narrative arc, character development, scene setting',
        voice: 'varied based on story needs',
        sentenceVariety: 'literary techniques, varied pacing',
      },
    };

    // Enhanced length guidelines with optimization (P2 Task 8)
    this.lengths = {
      short: {
        min: 300,
        max: 500,
        description: 'brief overview',
        bestFor: ['breaking news', 'quick updates', 'announcements'],
        structure: '3-4 paragraphs, minimal sections',
      },
      medium: {
        min: 600,
        max: 900,
        description: 'standard article',
        bestFor: ['news stories', 'analysis', 'how-to guides'],
        structure: '5-7 paragraphs, 2-3 sections',
      },
      long: {
        min: 1000,
        max: 1500,
        description: 'in-depth analysis',
        bestFor: ['investigative', 'comprehensive guides', 'deep dives'],
        structure: '8+ paragraphs, 4-6 sections',
      },
      extended: {
        min: 1500,
        max: 2500,
        description: 'comprehensive coverage',
        bestFor: ['major events', 'research pieces', 'ultimate guides'],
        structure: '10+ paragraphs, 6-10 sections',
      },
    };

    // Article structure templates (P1 Task 5)
    this.templates = {
      breakingNews: {
        name: 'Breaking News',
        structure: [
          'headline',
          'lead_paragraph',
          'context_background',
          'details_analysis',
          'whats_next',
          'related_coverage',
        ],
        guidelines: {
          headline: '60-80 characters, action verb + subject + outcome',
          lead: '50-75 words, 5Ws (who, what, when, where, why)',
          context: '100-150 words, why it matters',
          details: '200-300 words, facts, quotes, perspectives',
          whatsNext: '50-100 words, future developments',
        },
      },
      analysis: {
        name: 'Analysis/Deep Dive',
        structure: [
          'headline',
          'introduction_hook',
          'background_context',
          'analysis_sections',
          'implications',
          'conclusion',
          'sources_references',
        ],
        guidelines: {
          headline: 'Thought-provoking question or bold statement',
          intro: '100-150 words, hook + why it matters',
          background: '200-300 words, historical perspective',
          analysis: '3-4 sections, 250-350 words each',
          implications: '200-250 words, future impact',
          conclusion: '100-150 words, key takeaways',
        },
      },
      howTo: {
        name: 'How-To Guide',
        structure: [
          'headline',
          'introduction',
          'prerequisites',
          'step_by_step',
          'tips_best_practices',
          'troubleshooting',
          'conclusion',
        ],
        guidelines: {
          headline: 'Clear action: "How to [achieve outcome]"',
          intro: "75-100 words, what they'll learn",
          prerequisites: 'List of requirements',
          steps: 'Numbered steps, 50-100 words each',
          tips: '3-5 pro tips',
          troubleshooting: 'Common issues and solutions',
        },
      },
      opinion: {
        name: 'Opinion/Editorial',
        structure: [
          'headline',
          'opening_statement',
          'thesis',
          'arguments',
          'counterarguments',
          'conclusion_call_to_action',
        ],
        guidelines: {
          headline: 'Strong stance or provocative question',
          opening: '100-150 words, attention-grabbing',
          thesis: 'Clear position statement',
          arguments: '3-4 points, 150-200 words each',
          counter: 'Acknowledge opposing views',
          conclusion: 'Strong closing, call to action',
        },
      },
      listicle: {
        name: 'List Article',
        structure: ['headline', 'introduction', 'numbered_items', 'conclusion'],
        guidelines: {
          headline: 'Number + compelling benefit',
          intro: '50-100 words, why list matters',
          items: '5-15 items, 75-150 words each',
          conclusion: '50-75 words, summary',
        },
      },
    };

    // Writing personality profiles (P3 Task 9)
    this.personalities = {
      balanced: {
        description: 'Professional yet approachable',
        traits: ['objective', 'clear', 'trustworthy', 'engaging'],
        avoidWords: ['very', 'really', 'just', 'literally'],
        preferredStructure: 'logical flow with examples',
      },
      authoritative: {
        description: 'Expert and commanding',
        traits: ['confident', 'knowledgeable', 'decisive', 'precise'],
        avoidWords: ['maybe', 'perhaps', 'possibly', 'might'],
        preferredStructure: 'data-driven with strong statements',
      },
      conversational: {
        description: 'Friendly and relatable',
        traits: ['warm', 'accessible', 'empathetic', 'casual'],
        avoidWords: ['heretofore', 'aforementioned', 'pursuant'],
        preferredStructure: 'storytelling with personal touches',
      },
      analytical: {
        description: 'Detailed and methodical',
        traits: ['thorough', 'logical', 'systematic', 'comprehensive'],
        avoidWords: ['emotional language', 'hype', 'amazing'],
        preferredStructure: 'structured analysis with evidence',
      },
      provocative: {
        description: 'Bold and challenging',
        traits: ['daring', 'questioning', 'contrarian', 'thought-provoking'],
        avoidWords: ['conventional', 'standard', 'typical'],
        preferredStructure: 'challenge-question-propose framework',
      },
    };

    // Readability targets (P2 Task 7)
    this.readabilityTargets = {
      fleschReadingEase: { min: 60, max: 70, ideal: 65 }, // 8th-9th grade
      avgSentenceLength: { min: 15, max: 20, ideal: 17 },
      avgParagraphLength: { min: 3, max: 5, ideal: 4 },
      passiveVoiceMax: 10, // percentage
      adverbUsageMax: 5, // percentage
      complexWordsMax: 15, // percentage
    };

    // Headline optimization parameters (P1 Task 3)
    this.headlineRules = {
      minLength: 50,
      maxLength: 70,
      idealLength: 60,
      includeNumber: 'optional', // numbers increase engagement
      includeEmotionalWord: 'recommended',
      includePowerWord: 'recommended',
      powerWords: [
        'proven',
        'essential',
        'ultimate',
        'complete',
        'definitive',
        'expert',
        'critical',
        'breakthrough',
        'revolutionary',
        'exclusive',
      ],
      emotionalWords: [
        'amazing',
        'surprising',
        'shocking',
        'inspiring',
        'heartbreaking',
        'terrifying',
        'fascinating',
        'incredible',
        'devastating',
      ],
    };

    // Statistics tracking
    this.stats.articlesGenerated = 0;
    this.stats.headlinesOptimized = 0;
    this.stats.contentRewritten = 0;
    this.stats.qualityScores = [];
  }

  /**
   * Initialize the Writer Agent
   */
  async initialize() {
    this.logger.info('[Writer] Initializing...');

    // Initialize unified AI service (Gemini + Claude + OpenAI)
    await unifiedAIService.initialize();

    // Check if any AI provider is available
    if (!unifiedAIService.isAvailable()) {
      throw new Error('No AI services available. Please configure at least one AI provider.');
    }

    const stats = unifiedAIService.getStats();
    this.logger.info(`[Writer] AI Services initialized - Primary: ${stats.preferredProvider}`);

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
    const sourceContext =
      sources.length > 0
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
      // Use unified AI service (automatically uses Gemini, Claude, or OpenAI)
      const result = await unifiedAIService.generateArticle({
        topic,
        context: sourceContext,
        style,
        length,
        keywords,
        targetAudience,
      });

      // Structure the response
      const article = {
        headline: topic, // Will be improved with generateHeadlines() if needed
        excerpt: result.content.substring(0, 200),
        content: result.content,
        suggestedTags: keywords,
        estimatedReadTime: result.metadata.readTime,
      };

      // Add metadata
      article.metadata = {
        model: result.metadata.model,
        tokensUsed: result.metadata.tokensUsed,
        provider: result.provider || 'unknown',
        fallbackUsed: result.fallbackUsed || false,
        style,
        length,
        wordCount: result.metadata.wordCount,
      };

      this.stats.articlesGenerated++;

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
      // Use unified AI service for rewriting
      const result = await unifiedAIService.rewriteArticle({
        content: originalContent,
        targetStyle: newStyle,
        targetAngle: newAngle,
        preserveFactsOnly: !preserveFacts,
      });

      const article = {
        headline: originalTitle, // Keep original title unless specifically changed
        excerpt: result.content.substring(0, 200),
        content: result.content,
        changes: `Rewritten from ${result.originalLength} to ${result.newLength} words`,
      };

      article.metadata = {
        model: result.model || 'unknown',
        tokensUsed: result.tokensUsed,
        provider: result.provider || 'unknown',
        style: newStyle,
        originalLength: result.originalLength,
        newLength: result.newLength,
      };

      this.stats.contentRewritten += 1;

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
    const { originalContent, originalTitle, expansionTopic, targetLength = 'long' } = params;

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
      // Use unified AI service to expand article
      const result = await unifiedAIService.generateArticle({
        topic: originalTitle,
        context: prompt,
        style: 'professional',
        length: targetLength,
      });

      const { content } = result;
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
        model: result.metadata?.model || 'unknown',
        tokensUsed: result.metadata?.tokensUsed || 0,
        provider: result.provider || 'unknown',
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
    const { title, content, maxLength = 150 } = params;

    if (!content) {
      throw new Error('Content is required for summarization');
    }

    this.logger.info(`[Writer] Summarizing article "${title}"`);

    try {
      // Use unified AI service to generate summary
      const result = await unifiedAIService.generateArticle({
        topic: `Summary of: ${title}`,
        context: `Summarize the following article in no more than ${maxLength} words:\n\n${content}`,
        style: 'professional',
        length: 'short',
      });

      const summary = result.content;
      const wordCount = summary.split(/\s+/).length;

      return {
        summary,
        wordCount,
        metadata: {
          model: result.metadata?.model || 'unknown',
          tokensUsed: result.metadata?.tokensUsed || 0,
          provider: result.provider || 'unknown',
        },
      };
    } catch (error) {
      throw new Error(`Failed to summarize article: ${error.message}`);
    }
  }

  /**
   * P1 TASK 3: Generate and optimize headlines
   * Creates multiple headline options and scores them
   * @param {Object} params - Headline parameters
   * @param {string} params.topic - Article topic
   * @param {string} params.content - Article content (optional, for context)
   * @param {number} params.count - Number of headlines to generate (default: 5)
   * @returns {Promise<Object>} Generated and scored headlines
   */
  async generateHeadlines(params) {
    const { topic, content = '', count = 5, style = 'professional' } = params;

    if (!topic) {
      throw new Error('Topic is required for headline generation');
    }

    this.logger.info(`[Writer] Generating ${count} headline options for "${topic}"`);

    try {
      // Use unified AI service for headline generation
      const result = await unifiedAIService.generateHeadlines({
        topic,
        style,
        count,
      });

      // Extract headlines array from result (unifiedAIService wraps with metadata)
      let headlineTexts;
      if (Array.isArray(result)) {
        headlineTexts = result;
      } else if (result.headlines && Array.isArray(result.headlines)) {
        headlineTexts = result.headlines;
      } else if (result.content) {
        headlineTexts =
          typeof result.content === 'string'
            ? result.content.split('\n').filter(line => line.trim())
            : [];
      } else {
        // Convert object with numeric keys back to array (happens when unifiedAIService wraps array)
        headlineTexts = Object.keys(result)
          .filter(key => !isNaN(key))
          .sort((a, b) => parseInt(a) - parseInt(b))
          .map(key => result[key])
          .filter(text => typeof text === 'string' && text.length > 0);
      }

      if (!headlineTexts || headlineTexts.length === 0) {
        throw new Error('No headlines generated');
      }

      // Score each headline
      const scoredHeadlines = headlineTexts.map(text => {
        const score = this.scoreHeadline(text);
        return {
          text,
          score: score.totalScore,
          scoreBreakdown: score,
        };
      });

      // Sort by score
      scoredHeadlines.sort((a, b) => b.score - a.score);

      this.stats.headlinesOptimized += headlineTexts.length;

      return {
        headlines: scoredHeadlines,
        recommended: scoredHeadlines[0],
        metadata: {
          count: headlineTexts.length,
          provider: result.provider,
        },
      };
    } catch (error) {
      throw new Error(`Failed to generate headlines: ${error.message}`);
    }
  }

  /**
   * Score a headline based on best practices
   * @param {string} headline - Headline text
   * @returns {Object} Score breakdown
   */
  scoreHeadline(headline) {
    const { length } = headline;
    const words = headline.toLowerCase().split(/\s+/);

    // Length score (0-30 points)
    let lengthScore = 0;
    if (length >= this.headlineRules.minLength && length <= this.headlineRules.maxLength) {
      if (length === this.headlineRules.idealLength) {
        lengthScore = 30;
      } else {
        const deviation = Math.abs(length - this.headlineRules.idealLength);
        lengthScore = Math.max(0, 30 - deviation);
      }
    }

    // Power words (0-25 points)
    const powerWordCount = this.headlineRules.powerWords.filter(word =>
      headline.toLowerCase().includes(word)
    ).length;
    const powerWordScore = Math.min(25, powerWordCount * 10);

    // Emotional words (0-20 points)
    const emotionalWordCount = this.headlineRules.emotionalWords.filter(word =>
      headline.toLowerCase().includes(word)
    ).length;
    const emotionalScore = Math.min(20, emotionalWordCount * 10);

    // Number presence (0-15 points)
    const hasNumber = /\d+/.test(headline);
    const numberScore = hasNumber ? 15 : 0;

    // Clarity score (0-10 points) - shorter headlines with fewer words
    const clarityScore = words.length <= 10 ? 10 : Math.max(0, 10 - (words.length - 10));

    const totalScore = lengthScore + powerWordScore + emotionalScore + numberScore + clarityScore;

    return {
      totalScore: Math.round(totalScore),
      lengthScore,
      powerWordScore,
      emotionalScore,
      numberScore,
      clarityScore,
      length,
      wordCount: words.length,
    };
  }

  /**
   * P1 TASK 4: Check tone and style consistency
   * Analyzes content for consistency with specified style
   * @param {Object} params - Consistency check parameters
   * @param {string} params.content - Content to analyze
   * @param {string} params.targetStyle - Target style
   * @param {string} params.targetPersonality - Target personality
   * @returns {Promise<Object>} Consistency analysis
   */
  async checkConsistency(params) {
    const {
      content,
      targetStyle = this.defaultStyle,
      targetPersonality = this.defaultPersonality,
    } = params;

    if (!content) {
      throw new Error('Content is required for consistency checking');
    }

    this.logger.info(`[Writer] Checking consistency for ${targetStyle} style`);

    const styleGuide = this.styles[targetStyle];
    const personalityGuide = this.personalities[targetPersonality];

    if (!styleGuide) {
      throw new Error(`Unknown style: ${targetStyle}`);
    }

    try {
      // Use unified AI service for consistency checking
      const analysis = await unifiedAIService.checkConsistency({
        content,
        targetStyle,
        targetPersonality,
      });

      return {
        ...analysis,
        targetStyle,
        targetPersonality,
        metadata: {},
      };
    } catch (error) {
      throw new Error(`Failed to check consistency: ${error.message}`);
    }
  }

  /**
   * P2 TASK 6: Generate multimedia content suggestions
   * Suggests images, videos, infographics for article
   * @param {Object} params - Multimedia suggestion parameters
   * @param {string} params.title - Article title
   * @param {string} params.content - Article content
   * @param {string} params.topic - Article topic/category
   * @returns {Promise<Object>} Multimedia suggestions
   */
  async suggestMultimedia(params) {
    const { title, content, topic, category } = params;

    if (!title || !content) {
      throw new Error('Title and content are required for multimedia suggestions');
    }

    this.logger.info(`[Writer] Generating multimedia suggestions for "${title}"`);

    try {
      // Use unified AI service for multimedia suggestions
      const suggestions = await unifiedAIService.suggestMultimedia({
        topic,
        content,
        targetAudience: category || 'general',
      });

      return {
        ...suggestions,
        metadata: {
          generatedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      throw new Error(`Failed to generate multimedia suggestions: ${error.message}`);
    }
  }

  /**
   * P2 TASK 7: Optimize content for readability
   * Analyzes and improves content readability
   * @param {Object} params - Readability optimization parameters
   * @param {string} params.content - Content to optimize
   * @param {string} params.targetAudience - Target audience level
   * @returns {Promise<Object>} Optimized content with readability analysis
   */
  async optimizeReadability(params) {
    const { content, targetAudience = 'general' } = params;

    if (!content) {
      throw new Error('Content is required for readability optimization');
    }

    this.logger.info('[Writer] Optimizing content readability');

    // Calculate current readability metrics
    const currentMetrics = this.calculateReadabilityMetrics(content);

    try {
      // Use unified AI service for readability optimization
      const result = await unifiedAIService.optimizeReadability({
        content,
        targetAudience,
      });

      // Calculate metrics if not provided
      const newMetrics = result.optimizedContent
        ? this.calculateReadabilityMetrics(result.optimizedContent)
        : currentMetrics;

      return {
        optimizedContent: result.optimizedContent || content,
        changes: result.changes || [],
        improvementSummary: result.summary || 'Content optimized for readability',
        metrics: {
          before: currentMetrics,
          after: newMetrics,
          improvement: {
            sentenceLength: currentMetrics.avgSentenceLength - newMetrics.avgSentenceLength,
            passiveVoice: currentMetrics.passiveVoicePercent - newMetrics.passiveVoicePercent,
          },
        },
        metadata: {},
      };
    } catch (error) {
      throw new Error(`Failed to optimize readability: ${error.message}`);
    }
  }

  /**
   * Calculate readability metrics for content
   * @param {string} content - Content to analyze
   * @returns {Object} Readability metrics
   */
  calculateReadabilityMetrics(content) {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 0);
    const words = content.split(/\s+/).filter(w => w.trim().length > 0);

    const sentenceCount = sentences.length;
    const paragraphCount = paragraphs.length;
    const wordCount = words.length;

    const avgSentenceLength = sentenceCount > 0 ? wordCount / sentenceCount : 0;
    const avgParagraphLength = paragraphCount > 0 ? sentenceCount / paragraphCount : 0;

    // Simple passive voice detection (was/were + past participle)
    const passivePatterns = /\b(was|were|been|being)\s+\w+ed\b/gi;
    const passiveMatches = content.match(passivePatterns) || [];
    const passiveVoicePercent =
      sentenceCount > 0 ? (passiveMatches.length / sentenceCount) * 100 : 0;

    // Complex words (3+ syllables - simplified estimation)
    const complexWords = words.filter(word => this.estimateSyllables(word) >= 3);
    const complexWordsPercent = wordCount > 0 ? (complexWords.length / wordCount) * 100 : 0;

    // Flesch Reading Ease (simplified calculation)
    const fleschScore =
      206.835 - 1.015 * avgSentenceLength - 84.6 * (this.countSyllables(content) / wordCount);

    return {
      sentenceCount,
      paragraphCount,
      wordCount,
      avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
      avgParagraphLength: Math.round(avgParagraphLength * 10) / 10,
      passiveVoicePercent: Math.round(passiveVoicePercent * 10) / 10,
      complexWordsPercent: Math.round(complexWordsPercent * 10) / 10,
      fleschReadingEase: Math.round(fleschScore * 10) / 10,
    };
  }

  /**
   * Estimate syllable count for a word (simplified)
   * @param {string} word - Word to analyze
   * @returns {number} Estimated syllable count
   */
  estimateSyllables(word) {
    word = word.toLowerCase().replace(/[^a-z]/g, '');
    if (word.length <= 3) return 1;

    const vowels = word.match(/[aeiouy]+/g);
    let count = vowels ? vowels.length : 0;

    // Adjust for silent 'e'
    if (word.endsWith('e')) count--;

    return Math.max(1, count);
  }

  /**
   * Count total syllables in text
   * @param {string} text - Text to analyze
   * @returns {number} Total syllable count
   */
  countSyllables(text) {
    const words = text.split(/\s+/).filter(w => w.trim().length > 0);
    return words.reduce((total, word) => total + this.estimateSyllables(word), 0);
  }

  /**
   * P2 TASK 8: Optimize content length based on topic type
   * Recommends and adjusts content length for optimal engagement
   * @param {Object} params - Length optimization parameters
   * @param {string} params.topic - Article topic
   * @param {string} params.category - Article category
   * @param {string} params.content - Current content
   * @param {string} params.contentType - Type of content (breaking news, analysis, etc.)
   * @returns {Promise<Object>} Length optimization recommendation
   */
  async optimizeLength(params) {
    const { topic, category, content, contentType = 'general' } = params;

    if (!content) {
      throw new Error('Content is required for length optimization');
    }

    this.logger.info(`[Writer] Optimizing content length for ${contentType}`);

    const currentWordCount = content.split(/\s+/).length;

    // Determine optimal length based on content type
    let optimalLength = this.lengths.medium;

    for (const [, lengthData] of Object.entries(this.lengths)) {
      if (
        lengthData.bestFor &&
        lengthData.bestFor.some(type => contentType.toLowerCase().includes(type.toLowerCase()))
      ) {
        optimalLength = lengthData;
        break;
      }
    }

    const recommendation = {
      currentLength: currentWordCount,
      optimalRange: {
        min: optimalLength.min,
        max: optimalLength.max,
        description: optimalLength.description,
      },
      assessment: 'optimal',
      action: 'none',
      reasoning: '',
    };

    if (currentWordCount < optimalLength.min) {
      recommendation.assessment = 'too_short';
      recommendation.action = 'expand';
      recommendation.targetWordCount = optimalLength.min;
      recommendation.wordsToAdd = optimalLength.min - currentWordCount;
      recommendation.reasoning = `Article is ${recommendation.wordsToAdd} words short for ${contentType} content. Consider adding more detail, examples, or context.`;
    } else if (currentWordCount > optimalLength.max) {
      recommendation.assessment = 'too_long';
      recommendation.action = 'trim';
      recommendation.targetWordCount = optimalLength.max;
      recommendation.wordsToRemove = currentWordCount - optimalLength.max;
      recommendation.reasoning = `Article is ${recommendation.wordsToRemove} words over ideal length. Consider removing redundant content or splitting into multiple articles.`;
    } else {
      recommendation.reasoning = `Article length is optimal for ${contentType} content.`;
    }

    // If action needed, provide suggestions
    if (recommendation.action !== 'none') {
      const prompt = `The following article is ${recommendation.assessment.replace('_', ' ')} for its content type (${contentType}).

Current length: ${currentWordCount} words
Target length: ${recommendation.targetWordCount} words
Action needed: ${recommendation.action}

Content:
${content}

Provide specific suggestions in JSON format:
{
  "suggestions": [
    {"section": "which part", "action": "what to do", "reasoning": "why"},
    ...
  ],
  "priority": "which suggestions are most important",
  "estimatedImpact": "how this improves the article"
}`;

      try {
        // Use unified AI service for length optimization suggestions
        const result = await unifiedAIService.generateArticle({
          topic: 'Content Length Optimization',
          context: prompt,
          style: 'professional',
          length: 'short',
        });

        // Parse AI response
        let aiSuggestions;
        try {
          aiSuggestions =
            typeof result.content === 'string' ? JSON.parse(result.content) : result.content;
        } catch {
          // If parsing fails, provide basic structure
          aiSuggestions = {
            suggestions: [],
            priority: 'Unable to parse AI response',
            estimatedImpact: result.content.substring(0, 200),
          };
        }

        recommendation.suggestions = aiSuggestions.suggestions || [];
        recommendation.priority = aiSuggestions.priority;
        recommendation.estimatedImpact = aiSuggestions.estimatedImpact;
        recommendation.metadata = {
          model: result.metadata?.model || 'unknown',
          tokensUsed: result.metadata?.tokensUsed || 0,
          provider: result.provider || 'unknown',
        };
      } catch (error) {
        this.logger.warn('[Writer] Could not generate AI suggestions:', error.message);
        recommendation.suggestions = [];
      }
    }

    return recommendation;
  }

  /**
   * P1 TASK 5: Generate article using specific template
   * Creates structured content based on template
   * @param {Object} params - Template generation parameters
   * @param {string} params.templateType - Template to use (breakingNews, analysis, howTo, etc.)
   * @param {string} params.topic - Article topic
   * @param {Object} params.data - Template-specific data
   * @param {string} params.style - Writing style
   * @returns {Promise<Object>} Generated article following template
   */
  async generateFromTemplate(params) {
    const { templateType, topic, data = {}, style = 'professional' } = params;

    const template = this.templates[templateType];
    if (!template) {
      throw new Error(`Unknown template type: ${templateType}`);
    }

    this.logger.info(`[Writer] Generating ${template.name} article on "${topic}"`);

    const styleGuide = this.styles[style];

    const prompt = `Write a ${template.name} article following this exact structure:

Template Structure: ${template.structure.join(' → ')}

Guidelines:
${Object.entries(template.guidelines)
  .map(([key, value]) => `- ${key}: ${value}`)
  .join('\n')}

Writing Style:
- Tone: ${styleGuide.tone}
- Voice: ${styleGuide.voice}
- Structure: ${styleGuide.structure}

Topic: ${topic}

${data.sources ? `Sources:\n${data.sources.map((s, i) => `${i + 1}. ${s.title}`).join('\n')}` : ''}
${data.keyPoints ? `Key Points:\n${data.keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}` : ''}
${data.context ? `Context:\n${data.context}` : ''}

Provide the complete article in JSON format:
{
  "headline": "article headline",
  "excerpt": "2-3 sentence summary",
  "sections": [
    {
      "heading": "section title",
      "content": "section content"
    },
    ...
  ],
  "fullContent": "complete article text with all sections",
  "metadata": {
    "template": "${templateType}",
    "estimatedReadTime": number_in_minutes,
    "wordCount": number,
    "suggestedTags": ["tag1", "tag2"]
  }
}`;

    try {
      // Use unified AI service to generate article from template
      const result = await unifiedAIService.generateArticle({
        topic,
        context: prompt,
        style,
        length: 'long',
      });

      // Parse the JSON response if it's a string
      let article;
      if (typeof result.content === 'string') {
        try {
          article = JSON.parse(result.content);
        } catch {
          // If parsing fails, create article structure from content
          article = {
            headline: topic,
            excerpt: result.content.substring(0, 200),
            fullContent: result.content,
            sections: [],
          };
        }
      } else {
        article = result.content;
      }

      article.templateUsed = templateType;
      article.templateName = template.name;

      // Ensure metadata exists and has wordCount
      if (!article.metadata) {
        article.metadata = {};
      }
      if (!article.metadata.wordCount && article.fullContent) {
        article.metadata.wordCount = article.fullContent.split(/\s+/).length;
      }
      if (!article.metadata.estimatedReadTime && article.metadata.wordCount) {
        article.metadata.estimatedReadTime = Math.ceil(article.metadata.wordCount / 200);
      }

      article.apiMetadata = {
        model: result.metadata?.model || 'unknown',
        tokensUsed: result.metadata?.tokensUsed || 0,
        provider: result.provider || 'unknown',
      };

      this.stats.articlesGenerated++;

      return article;
    } catch (error) {
      throw new Error(`Failed to generate article from template: ${error.message}`);
    }
  }

  /**
   * Get available templates
   * @returns {Array} List of available templates
   */
  getAvailableTemplates() {
    return Object.entries(this.templates).map(([key, template]) => ({
      type: key,
      name: template.name,
      structure: template.structure,
      description: template.guidelines,
    }));
  }

  /**
   * Get available styles
   * @returns {Array} List of available writing styles
   */
  getAvailableStyles() {
    return Object.entries(this.styles).map(([key, style]) => ({
      name: key,
      ...style,
    }));
  }

  /**
   * Get available personalities
   * @returns {Array} List of available personalities
   */
  getAvailablePersonalities() {
    return Object.entries(this.personalities).map(([key, personality]) => ({
      name: key,
      ...personality,
    }));
  }

  /**
   * Get writing statistics
   * @returns {Object} Comprehensive statistics
   */
  getWritingStats() {
    return {
      ...this.getStats(),
      writing: {
        articlesGenerated: this.stats.articlesGenerated,
        headlinesOptimized: this.stats.headlinesOptimized,
        contentRewritten: this.stats.contentRewritten,
        avgQualityScore:
          this.stats.qualityScores.length > 0
            ? this.stats.qualityScores.reduce((a, b) => a + b, 0) / this.stats.qualityScores.length
            : 0,
      },
    };
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    this.logger.info('[Writer] Cleaning up...');
    this.logger.info(`[Writer] Total articles generated: ${this.stats.articlesGenerated}`);
    this.logger.info(`[Writer] Total headlines optimized: ${this.stats.headlinesOptimized}`);
    await super.cleanup();
  }
}

export default WriterAgent;
