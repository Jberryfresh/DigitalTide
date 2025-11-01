/**
 * Google Gemini AI Service
 * Provides AI text generation using Google's Gemini models
 * Free tier: 15 requests per minute
 * Paid tier: $0.075 per million input tokens
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../../config/index.js';

class GeminiService {
  constructor() {
    this.client = null;
    this.model = null;
    this.isInitialized = false;
    this.requestCount = 0;
    this.lastResetTime = Date.now();
  }

  /**
   * Initialize the Gemini client
   */
  async initialize() {
    try {
      if (!config.ai.gemini.apiKey) {
        console.warn('⚠️  Gemini API key not configured. Set GEMINI_API_KEY in .env');
        return false;
      }

      this.client = new GoogleGenerativeAI(config.ai.gemini.apiKey);
      this.model = this.client.getGenerativeModel({
        model: config.ai.gemini.model,
      });

      this.isInitialized = true;
      console.log('✅ Gemini AI service initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Gemini service:', error.message);
      return false;
    }
  }

  /**
   * Check if service is available
   */
  isAvailable() {
    return this.isInitialized && this.client && this.model;
  }

  /**
   * Check rate limit (15 requests per minute on free tier)
   */
  checkRateLimit() {
    const now = Date.now();
    const timeSinceReset = now - this.lastResetTime;

    // Reset counter every minute
    if (timeSinceReset >= 60000) {
      this.requestCount = 0;
      this.lastResetTime = now;
    }

    // Check if we're at the limit
    const maxRequests = config.ai.gemini.maxRequestsPerMinute || 15;
    if (this.requestCount >= maxRequests) {
      const waitTime = 60000 - timeSinceReset;
      throw new Error(`Rate limit exceeded. Please wait ${Math.ceil(waitTime / 1000)} seconds.`);
    }

    this.requestCount++;
  }

  /**
   * Generate text using Gemini
   * @param {Object} params - Generation parameters
   * @param {string} params.prompt - The prompt to send to Gemini
   * @param {number} params.maxTokens - Maximum tokens to generate (default: 8192)
   * @param {number} params.temperature - Temperature for generation (default: 0.7)
   * @returns {Promise<Object>} Generated text and metadata
   */
  async generate({ prompt, maxTokens = 8192, temperature = 0.7 }) {
    if (!this.isAvailable()) {
      await this.initialize();
      if (!this.isAvailable()) {
        throw new Error('Gemini service not available');
      }
    }

    try {
      // Check rate limit
      this.checkRateLimit();

      const startTime = Date.now();

      // Generate content
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: maxTokens,
          temperature,
        },
      });

      const { response } = result;
      const text = response.text();

      // Calculate metrics
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Estimate token usage (Gemini doesn't provide exact counts in free tier)
      const estimatedInputTokens = Math.ceil(prompt.length / 4);
      const estimatedOutputTokens = Math.ceil(text.length / 4);

      return {
        text,
        usage: {
          inputTokens: estimatedInputTokens,
          outputTokens: estimatedOutputTokens,
          totalTokens: estimatedInputTokens + estimatedOutputTokens,
        },
        model: config.ai.gemini.model,
        responseTime,
        finishReason: response.candidates?.[0]?.finishReason || 'complete',
      };
    } catch (error) {
      console.error('Gemini generation error:', error.message);
      throw new Error(`Gemini generation failed: ${error.message}`);
    }
  }

  /**
   * Generate article content
   * @param {Object} params - Article generation parameters
   * @returns {Promise<Object>} Generated article
   */
  async generateArticle({
    topic,
    context = '',
    style = 'professional',
    length = 'medium',
    keywords = [],
    targetAudience = 'general',
  }) {
    const lengthGuidelines = {
      short: '300-500 words',
      medium: '600-900 words',
      long: '1000-1500 words',
      extended: '1500-2500 words',
    };

    const styleGuidelines = {
      professional: 'Use professional, objective tone with clear structure and formal language.',
      casual:
        'Use conversational, friendly tone with relatable examples and approachable language.',
      technical:
        'Use precise, detailed technical language with specific terminology and accurate explanations.',
      editorial: 'Use engaging, opinion-driven tone with strong voice and clear perspective.',
      narrative: 'Use storytelling approach with descriptive language and engaging narrative flow.',
    };

    const prompt = `Write a ${length} ${style} article about: ${topic}

Target Length: ${lengthGuidelines[length] || '600-900 words'}
Writing Style: ${styleGuidelines[style] || styleGuidelines.professional}
Target Audience: ${targetAudience}
${keywords.length > 0 ? `Keywords to include: ${keywords.join(', ')}` : ''}
${context ? `Context/Background: ${context}` : ''}

Requirements:
- Write a compelling, well-structured article
- Include relevant examples and explanations
- Maintain consistent tone throughout
- Use proper grammar and punctuation
- Make it engaging and informative

Return only the article content, no meta-commentary.`;

    const result = await this.generate({
      prompt,
      maxTokens: 8192,
      temperature: 0.7,
    });

    // Calculate additional metrics
    const wordCount = result.text.split(/\s+/).length;
    const readTime = Math.ceil(wordCount / 200); // 200 words per minute

    return {
      content: result.text,
      metadata: {
        wordCount,
        readTime,
        style,
        length,
        tokensUsed: result.usage.totalTokens,
        model: result.model,
        responseTime: result.responseTime,
      },
    };
  }

  /**
   * Rewrite article content
   * @param {Object} params - Rewrite parameters
   * @returns {Promise<Object>} Rewritten article
   */
  async rewriteArticle({
    content,
    targetStyle = 'professional',
    targetAngle = null,
    preserveFactsOnly = false,
  }) {
    const preservationLevel = preserveFactsOnly
      ? 'facts and data only. You can change phrasing, structure, and examples.'
      : 'facts, key quotes, and main data points. You can adjust tone and style.';

    const angleInstruction = targetAngle
      ? `Change the angle/perspective to: ${targetAngle}`
      : 'Maintain the same general perspective but improve the presentation';

    const prompt = `Rewrite the following article in a ${targetStyle} style.

${angleInstruction}

Preserve: ${preservationLevel}

Original Article:
${content}

Requirements:
- Rewrite in ${targetStyle} style
- ${angleInstruction}
- Keep the core information accurate
- Improve clarity and engagement
- Maintain proper structure

Return only the rewritten article, no commentary.`;

    const result = await this.generate({
      prompt,
      maxTokens: 8192,
      temperature: 0.7,
    });

    return {
      content: result.text,
      originalLength: content.split(/\s+/).length,
      newLength: result.text.split(/\s+/).length,
      style: targetStyle,
      tokensUsed: result.usage.totalTokens,
      responseTime: result.responseTime,
    };
  }

  /**
   * Generate multiple headline options
   * @param {Object} params - Headline generation parameters
   * @returns {Promise<Array>} Array of headline options
   */
  async generateHeadlines({ topic, style = 'professional', count = 5 }) {
    const prompt = `Generate ${count} compelling headline options for an article about: ${topic}

Style: ${style}

Requirements for each headline:
- 50-70 characters (ideal length for SEO)
- Include power words that grab attention
- Make it clear and specific
- Avoid clickbait
- Each headline should take a different approach (question, statement, number-based, etc.)

Return only the headlines, one per line, numbered 1-${count}.`;

    const result = await this.generate({
      prompt,
      maxTokens: 500,
      temperature: 0.8,
    });

    // Parse headlines from response
    const headlines = result.text
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .filter(line => line.length > 0);

    return headlines.slice(0, count);
  }

  /**
   * Check content consistency
   * @param {Object} params - Consistency check parameters
   * @returns {Promise<Object>} Consistency analysis
   */
  async checkConsistency({
    content,
    targetStyle = 'professional',
    targetPersonality = 'balanced',
  }) {
    const prompt = `Analyze the following article for tone and style consistency.

Target Style: ${targetStyle}
Target Personality: ${targetPersonality}

Article:
${content}

Analyze:
1. Overall consistency score (0-100)
2. Tone consistency issues
3. Voice consistency issues
4. Specific style problems with line references
5. Recommendations for improvement

Return your analysis in this JSON format:
{
  "consistencyScore": <number 0-100>,
  "toneConsistency": {
    "score": <number 0-100>,
    "issues": ["<issue>", ...]
  },
  "voiceConsistency": {
    "score": <number 0-100>,
    "issues": ["<issue>", ...]
  },
  "styleIssues": [
    {
      "line": "<problematic text>",
      "issue": "<description>",
      "suggestion": "<how to fix>"
    }
  ],
  "overallAssessment": "<brief summary>",
  "recommendations": ["<recommendation>", ...]
}`;

    const result = await this.generate({
      prompt,
      maxTokens: 2000,
      temperature: 0.3,
    });

    try {
      // Extract JSON from response
      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Could not parse JSON response');
    } catch (error) {
      console.error('Failed to parse consistency analysis:', error.message);
      return {
        consistencyScore: 0,
        error: 'Failed to parse analysis',
        rawResponse: result.text,
      };
    }
  }

  /**
   * Suggest multimedia content
   * @param {Object} params - Multimedia suggestion parameters
   * @returns {Promise<Object>} Multimedia suggestions
   */
  async suggestMultimedia({ topic, content, targetAudience = 'general' }) {
    const prompt = `Suggest multimedia content to enhance an article about: ${topic}

Target Audience: ${targetAudience}

Article Context:
${content.substring(0, 500)}...

Suggest:
1. Featured image (description, style, keywords)
2. Additional images (2-3 with descriptions and placement)
3. Video suggestions (type, description, duration, placement)
4. Infographic ideas (title, data points, visual style)
5. Interactive elements (quizzes, polls, calculators)

Return your suggestions in this JSON format:
{
  "featuredImage": {
    "description": "<detailed description>",
    "style": "photo|illustration|graphic",
    "keywords": ["<keyword>", ...],
    "placement": "top"
  },
  "additionalImages": [
    {
      "description": "<description>",
      "purpose": "<why this image>",
      "placement": "<where in article>"
    }
  ],
  "videoSuggestions": [
    {
      "type": "explainer|interview|tutorial|documentary",
      "description": "<what video should show>",
      "duration": "<suggested length>",
      "placement": "<where in article>"
    }
  ],
  "infographicIdeas": [
    {
      "title": "<infographic title>",
      "dataPoints": ["<data point>", ...],
      "visualStyle": "<suggested style>"
    }
  ],
  "interactiveElements": [
    {
      "type": "quiz|poll|calculator|interactive graphic",
      "description": "<what it does>",
      "purpose": "<engagement goal>"
    }
  ]
}`;

    const result = await this.generate({
      prompt,
      maxTokens: 2000,
      temperature: 0.7,
    });

    try {
      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Could not parse JSON response');
    } catch (error) {
      console.error('Failed to parse multimedia suggestions:', error.message);
      return {
        error: 'Failed to parse suggestions',
        rawResponse: result.text,
      };
    }
  }

  /**
   * Optimize content readability
   * @param {Object} params - Readability optimization parameters
   * @returns {Promise<Object>} Optimized content with metrics
   */
  async optimizeReadability({ content, targetAudience = 'general' }) {
    const prompt = `Improve the readability of the following article for a ${targetAudience} audience.

Original Article:
${content}

Optimize for:
- Average sentence length: 15-20 words
- Average paragraph length: 3-5 sentences
- Passive voice: Less than 10%
- Complex words: Less than 15%
- Flesch Reading Ease: 60-70 (8th-9th grade level)

Make changes to:
1. Simplify complex sentences
2. Break up long paragraphs
3. Replace passive voice with active voice
4. Use simpler word alternatives where appropriate
5. Improve overall flow and clarity

Return your response in this JSON format:
{
  "optimizedContent": "<improved article>",
  "changes": [
    {
      "original": "<original text>",
      "improved": "<improved text>",
      "reason": "<why this change>"
    }
  ],
  "summary": "<brief summary of improvements>"
}`;

    const result = await this.generate({
      prompt,
      maxTokens: 8192,
      temperature: 0.5,
    });

    try {
      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Could not parse JSON response');
    } catch (error) {
      console.error('Failed to parse readability optimization:', error.message);
      return {
        error: 'Failed to parse optimization',
        rawResponse: result.text,
      };
    }
  }

  /**
   * Get service statistics
   */
  getStats() {
    return {
      isAvailable: this.isAvailable(),
      requestCount: this.requestCount,
      lastResetTime: new Date(this.lastResetTime).toISOString(),
      model: config.ai.gemini.model,
    };
  }
}

// Export singleton instance
const geminiService = new GeminiService();
export default geminiService;
