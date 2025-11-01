/**
 * Research Agent
 * Conducts research and fact verification using web search and content fetching
 * Uses MCP brave-search for web research and MCP fetch for gathering source material
 */

import Agent from '../base/Agent.js';
import claudeService from '../../services/ai/claudeService.js';
import mcpClient from '../../services/mcp/mcpClient.js';

class ResearchAgent extends Agent {
  constructor(config = {}) {
    super('Research', config);

    this.maxSources = config.maxSources || 5;
    this.minSourceQuality = config.minSourceQuality || 0.6;
  }

  /**
   * Initialize the Research Agent
   */
  async initialize() {
    this.logger.info('[Research] Initializing...');

    // Verify Claude service availability
    if (!claudeService) {
      throw new Error('Claude AI service not available');
    }

    // Initialize MCP client if not already connected
    if (!mcpClient.connected) {
      await mcpClient.connect();
    }

    this.logger.info('[Research] Initialization complete');
  }

  /**
   * Execute research task
   * @param {Object} task - Research task
   * @param {string} task.type - Task type: 'search', 'verify', 'gather', 'analyze'
   * @param {Object} task.params - Task parameters
   * @returns {Promise<Object>} Research result
   */
  async execute(task) {
    const { type, params = {} } = task;

    switch (type) {
      case 'search':
        return await this.searchTopic(params);

      case 'verify':
        return await this.verifyFacts(params);

      case 'gather':
        return await this.gatherSources(params);

      case 'analyze':
        return await this.analyzeSources(params);

      default:
        throw new Error(`Unknown task type: ${type}`);
    }
  }

  /**
   * Search for information on a topic
   * @param {Object} params - Search parameters
   * @returns {Promise<Object>} Search results
   */
  async searchTopic(params) {
    const {
      query,
      maxResults = this.maxSources,
      country = 'us',
      language = 'en',
    } = params;

    if (!query) {
      throw new Error('Query is required for search');
    }

    this.logger.info(`[Research] Searching for: "${query}"`);

    // In Phase 3, this will use actual MCP brave-search
    // For now, return mock data structure
    const results = {
      query,
      sources: [],
      totalResults: 0,
      searchEngine: 'brave', // Would be actual Brave Search via MCP
      timestamp: new Date().toISOString(),
    };

    // Mock implementation - Phase 3 will replace with:
    // const searchResults = await mcpClient.braveSearch.search({
    //   query,
    //   count: maxResults,
    //   country,
    //   language,
    // });

    this.logger.warn('[Research] MCP brave-search not yet integrated - returning placeholder');

    // For now, generate mock sources based on query
    results.sources = [
      {
        title: `Research on ${query}`,
        url: `https://example.com/research/${query.replace(/\s+/g, '-')}`,
        snippet: `Comprehensive information about ${query}...`,
        publishedDate: new Date().toISOString(),
        source: 'placeholder',
        quality: 0.8,
      },
    ];
    results.totalResults = 1;

    return results;
  }

  /**
   * Verify facts in content
   * @param {Object} params - Verification parameters
   * @returns {Promise<Object>} Verification result
   */
  async verifyFacts(params) {
    const {
      content,
      claims = [],
      context = '',
    } = params;

    if (!content && claims.length === 0) {
      throw new Error('Content or claims required for verification');
    }

    this.logger.info('[Research] Verifying facts...');

    // Extract claims if not provided
    let claimsToVerify = claims;
    if (claimsToVerify.length === 0 && content) {
      claimsToVerify = await this.extractClaims(content);
    }

    // Verify each claim
    const verifications = await Promise.all(
      claimsToVerify.slice(0, 5).map((claim) => this.verifySingleClaim(claim, context)),
    );

    // Calculate overall confidence
    const avgConfidence = verifications.reduce((sum, v) => sum + v.confidence, 0) / verifications.length || 0;

    return {
      overallConfidence: Math.round(avgConfidence * 100) / 100,
      totalClaims: claimsToVerify.length,
      verifiedClaims: verifications.filter((v) => v.confidence >= 0.7).length,
      questionableClaims: verifications.filter((v) => v.confidence < 0.7 && v.confidence >= 0.4).length,
      unverifiedClaims: verifications.filter((v) => v.confidence < 0.4).length,
      verifications,
      recommendation: avgConfidence >= 0.7 ? 'approved' : avgConfidence >= 0.5 ? 'review' : 'reject',
    };
  }

  /**
   * Gather sources for a topic
   * @param {Object} params - Gathering parameters
   * @returns {Promise<Object>} Gathered sources
   */
  async gatherSources(params) {
    const {
      topic,
      maxSources = this.maxSources,
      sourceTypes = ['article', 'research', 'news'],
    } = params;

    if (!topic) {
      throw new Error('Topic is required for gathering sources');
    }

    this.logger.info(`[Research] Gathering sources on: "${topic}"`);

    // Search for sources
    const searchResults = await this.searchTopic({
      query: topic,
      maxResults: maxSources * 2, // Get more to filter
    });

    // Filter and quality-check sources
    const qualifiedSources = searchResults.sources
      .filter((source) => source.quality >= this.minSourceQuality)
      .slice(0, maxSources);

    // Fetch content from each source (using MCP fetch in Phase 3)
    const sourcesWithContent = await Promise.all(
      qualifiedSources.map(async (source) => {
        try {
          const content = await this.fetchSourceContent(source.url);
          return {
            ...source,
            content: content.substring(0, 1000), // Preview
            contentLength: content.length,
            fetched: true,
          };
        } catch (error) {
          return {
            ...source,
            content: source.snippet,
            contentLength: 0,
            fetched: false,
            error: error.message,
          };
        }
      }),
    );

    return {
      topic,
      totalSources: sourcesWithContent.length,
      sources: sourcesWithContent,
      avgQuality: sourcesWithContent.reduce((sum, s) => sum + s.quality, 0) / sourcesWithContent.length || 0,
      fetchedCount: sourcesWithContent.filter((s) => s.fetched).length,
    };
  }

  /**
   * Analyze gathered sources
   * @param {Object} params - Analysis parameters
   * @returns {Promise<Object>} Analysis result
   */
  async analyzeSources(params) {
    const { sources, topic } = params;

    if (!sources || sources.length === 0) {
      throw new Error('Sources are required for analysis');
    }

    this.logger.info(`[Research] Analyzing ${sources.length} sources`);

    const sourcesText = sources.map((s, i) => `Source ${i + 1}: ${s.title}\n${s.content || s.snippet || 'No content'}`).join('\n\n');

    const prompt = `Analyze the following sources about "${topic}" and provide a comprehensive research summary.

${sourcesText}

Provide your analysis in JSON format:
{
  "summary": "Overall summary of findings",
  "keyFindings": ["finding 1", "finding 2", "finding 3"],
  "consensus": "What sources agree on",
  "contradictions": ["Any contradicting information"],
  "gaps": ["Information gaps or missing perspectives"],
  "reliability": "overall|high|medium|low",
  "recommendations": ["recommendation 1", "recommendation 2"]
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

      const analysisText = response.content[0].text;
      let analysis;

      try {
        analysis = JSON.parse(analysisText);
      } catch (e) {
        analysis = {
          summary: analysisText.substring(0, 500),
          keyFindings: ['Analysis complete'],
          consensus: 'Unable to parse detailed analysis',
          contradictions: [],
          gaps: [],
          reliability: 'medium',
          recommendations: ['Review sources manually'],
        };
      }

      analysis.metadata = {
        model: claudeService.model,
        tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
        sourcesAnalyzed: sources.length,
      };

      return analysis;
    } catch (error) {
      throw new Error(`Source analysis failed: ${error.message}`);
    }
  }

  /**
   * Extract claims from content
   * @param {string} content - Content to extract claims from
   * @returns {Promise<Array>} List of claims
   */
  async extractClaims(content) {
    const prompt = `Extract factual claims from the following content that can be verified:

${content.substring(0, 1500)}

Return claims as JSON array:
{
  "claims": ["claim 1", "claim 2", "claim 3"]
}`;

    try {
      const response = await claudeService.client.messages.create({
        model: claudeService.model,
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      });

      const result = JSON.parse(response.content[0].text);
      return result.claims || [];
    } catch (error) {
      this.logger.error('[Research] Failed to extract claims:', error.message);
      return [];
    }
  }

  /**
   * Verify a single claim
   * @param {string} claim - Claim to verify
   * @param {string} context - Additional context
   * @returns {Promise<Object>} Verification result
   */
  async verifySingleClaim(claim, context = '') {
    this.logger.info(`[Research] Verifying claim: "${claim.substring(0, 50)}..."`);

    // In Phase 3, this would search for evidence using MCP brave-search
    // For now, use AI to assess likelihood

    const prompt = `Assess the factual accuracy of this claim:

Claim: ${claim}
${context ? `Context: ${context}` : ''}

Provide assessment in JSON format:
{
  "confidence": 0.0-1.0,
  "verdict": "likely_true|uncertain|likely_false",
  "reasoning": "brief explanation",
  "needsVerification": true/false
}`;

    try {
      const response = await claudeService.client.messages.create({
        model: claudeService.model,
        max_tokens: 512,
        messages: [{ role: 'user', content: prompt }],
      });

      const assessment = JSON.parse(response.content[0].text);
      return {
        claim,
        ...assessment,
      };
    } catch (error) {
      return {
        claim,
        confidence: 0.5,
        verdict: 'uncertain',
        reasoning: 'Unable to verify',
        needsVerification: true,
      };
    }
  }

  /**
   * Fetch content from a URL
   * @param {string} url - URL to fetch
   * @returns {Promise<string>} Fetched content
   */
  async fetchSourceContent(url) {
    // In Phase 3, this will use MCP fetch server
    // const content = await mcpClient.fetch.get(url);

    this.logger.warn('[Research] MCP fetch not yet integrated - returning placeholder');

    // Mock implementation
    return `Content from ${url}\n\nThis is placeholder content. Phase 3 will implement actual fetching via MCP.`;
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    this.logger.info('[Research] Cleaning up...');
    await super.cleanup();
  }
}

export default ResearchAgent;
