/**
 * Unified AI Service
 * Provides intelligent multi-provider AI integration with automatic fallback
 *
 * Provider Priority:
 * 1. Gemini (Free tier - 15 req/min)
 * 2. Claude (Paid - Best quality)
 * 3. OpenAI (Paid - Alternative)
 */

import config from '../../config/index.js';
import geminiService from './geminiService.js';
import claudeService from './claudeService.js';

class UnifiedAIService {
  constructor() {
    this.providers = {
      gemini: geminiService,
      anthropic: claudeService,
      claude: claudeService, // Alias
    };

    this.preferredProvider = config.ai.preferredProvider || 'gemini';
    this.fallbackOrder = ['gemini', 'anthropic', 'openai'];
    this.providerStatus = {};
    this.stats = {
      totalRequests: 0,
      providerUsage: {},
      failedRequests: 0,
      fallbacksUsed: 0,
    };
  }

  /**
   * Initialize all available providers
   */
  async initialize() {
    const results = {};

    // Initialize Gemini (free tier)
    if (config.ai.gemini.apiKey) {
      try {
        const success = await geminiService.initialize();
        results.gemini = success ? 'available' : 'unavailable';
        this.providerStatus.gemini = success;
      } catch (error) {
        console.warn('Gemini initialization failed:', error.message);
        results.gemini = 'unavailable';
        this.providerStatus.gemini = false;
      }
    } else {
      results.gemini = 'not_configured';
      this.providerStatus.gemini = false;
    }

    // Initialize Claude (paid)
    if (config.ai.anthropic.apiKey) {
      try {
        const success = await claudeService.initialize();
        results.anthropic = success ? 'available' : 'unavailable';
        this.providerStatus.anthropic = success;
      } catch (error) {
        console.warn('Claude initialization failed:', error.message);
        results.anthropic = 'unavailable';
        this.providerStatus.anthropic = false;
      }
    } else {
      results.anthropic = 'not_configured';
      this.providerStatus.anthropic = false;
    }

    // Log initialization results
    console.log('\n🤖 AI Services Status:');
    console.log(`   Gemini (Free):  ${this.getStatusEmoji(results.gemini)} ${results.gemini}`);
    console.log(
      `   Claude (Paid):  ${this.getStatusEmoji(results.anthropic)} ${results.anthropic}`
    );
    console.log(`   Preferred:      ${this.preferredProvider}\n`);

    return results;
  }

  /**
   * Get status emoji for logging
   */
  getStatusEmoji(status) {
    const emojis = {
      available: '✅',
      unavailable: '❌',
      not_configured: '⚠️ ',
    };
    return emojis[status] || '❓';
  }

  /**
   * Get the next available provider
   */
  async getAvailableProvider(preferredFirst = true) {
    // Try preferred provider first if requested
    if (preferredFirst && this.providerStatus[this.preferredProvider]) {
      const provider = this.providers[this.preferredProvider];
      if (provider && provider.isAvailable()) {
        return { name: this.preferredProvider, service: provider };
      }
    }

    // Try fallback order
    for (const providerName of this.fallbackOrder) {
      if (this.providerStatus[providerName]) {
        const provider = this.providers[providerName];
        if (provider && provider.isAvailable()) {
          if (providerName !== this.preferredProvider) {
            this.stats.fallbacksUsed++;
          }
          return { name: providerName, service: provider };
        }
      }
    }

    throw new Error('No AI providers available');
  }

  /**
   * Execute with automatic fallback
   */
  async executeWithFallback(method, params) {
    const errors = [];
    let lastProvider = null;

    // Try each provider in order
    for (const providerName of this.fallbackOrder) {
      if (!this.providerStatus[providerName]) continue;

      const provider = this.providers[providerName];
      if (!provider || !provider.isAvailable()) continue;

      try {
        lastProvider = providerName;
        const result = await provider[method](params);

        // Track success
        this.stats.totalRequests++;
        this.stats.providerUsage[providerName] = (this.stats.providerUsage[providerName] || 0) + 1;

        return {
          ...result,
          provider: providerName,
          fallbackUsed: providerName !== this.preferredProvider,
        };
      } catch (error) {
        errors.push({ provider: providerName, error: error.message });
        console.warn(`${providerName} failed, trying next provider:`, error.message);
        continue;
      }
    }

    // All providers failed
    this.stats.failedRequests++;
    const errorMsg = errors.map(e => `${e.provider}: ${e.error}`).join('; ');
    throw new Error(`All AI providers failed: ${errorMsg}`);
  }

  /**
   * Generate article content
   */
  async generateArticle(params) {
    return this.executeWithFallback('generateArticle', params);
  }

  /**
   * Rewrite article content
   */
  async rewriteArticle(params) {
    return this.executeWithFallback('rewriteArticle', params);
  }

  /**
   * Generate headlines
   */
  async generateHeadlines(params) {
    return this.executeWithFallback('generateHeadlines', params);
  }

  /**
   * Check content consistency
   */
  async checkConsistency(params) {
    return this.executeWithFallback('checkConsistency', params);
  }

  /**
   * Suggest multimedia content
   */
  async suggestMultimedia(params) {
    return this.executeWithFallback('suggestMultimedia', params);
  }

  /**
   * Optimize readability
   */
  async optimizeReadability(params) {
    return this.executeWithFallback('optimizeReadability', params);
  }

  /**
   * Get combined statistics from all providers
   */
  getStats() {
    return {
      preferredProvider: this.preferredProvider,
      providerStatus: { ...this.providerStatus },
      usage: { ...this.stats },
      providers: {
        gemini: this.providerStatus.gemini ? geminiService.getStats() : null,
        anthropic: this.providerStatus.anthropic ? claudeService.getStats() : null,
      },
    };
  }

  /**
   * Check if any provider is available
   */
  isAvailable() {
    return Object.values(this.providerStatus).some(status => status === true);
  }

  /**
   * Get provider preference explanation
   */
  getProviderInfo() {
    return {
      gemini: {
        name: 'Google Gemini',
        cost: 'FREE (15 requests/minute)',
        quality: 'Good',
        speed: 'Fast',
        bestFor: 'Development, testing, high-volume generation',
        status: this.providerStatus.gemini ? 'available' : 'unavailable',
      },
      anthropic: {
        name: 'Anthropic Claude',
        cost: 'PAID ($3-15 per million tokens)',
        quality: 'Excellent',
        speed: 'Medium',
        bestFor: 'Creative writing, premium content, consistency',
        status: this.providerStatus.anthropic ? 'available' : 'unavailable',
      },
      openai: {
        name: 'OpenAI GPT-4',
        cost: 'PAID ($2.50-10 per million tokens)',
        quality: 'Excellent',
        speed: 'Fast',
        bestFor: 'General purpose, coding, analysis',
        status: 'not_implemented',
      },
    };
  }
}

// Export singleton instance
const unifiedAIService = new UnifiedAIService();
export default unifiedAIService;
