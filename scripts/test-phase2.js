/**
 * Phase 2 End-to-End Testing Script
 * Tests the complete news pipeline from fetching to storage
 */

import dotenv from 'dotenv';
import newsService from '../src/services/news/newsService.js';
import redisCache from '../src/services/cache/redisCache.js';
import claudeService from '../src/services/ai/claudeService.js';
import articleStorageService from '../src/services/storage/articleStorageService.js';

dotenv.config();

class Phase2Tester {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      tests: [],
    };
  }

  log(message, type = 'info') {
    const symbols = {
      info: 'ℹ️',
      success: '✅',
      error: '❌',
      warning: '⚠️',
    };
    console.log(`${symbols[type]} ${message}`);
  }

  async test(name, fn) {
    console.log('');
    console.log('─────────────────────────────────────────────────────');
    console.log(`🧪 Testing: ${name}`);
    console.log('─────────────────────────────────────────────────────');

    const startTime = Date.now();
    try {
      await fn();
      const duration = Date.now() - startTime;
      this.log(`PASSED (${duration}ms)`, 'success');
      this.results.passed++;
      this.results.tests.push({
        name,
        status: 'PASSED',
        duration,
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      this.log(`FAILED: ${error.message}`, 'error');
      console.error(error.stack);
      this.results.failed++;
      this.results.tests.push({
        name,
        status: 'FAILED',
        error: error.message,
        duration,
      });
    }
  }

  assert(condition, message) {
    if (!condition) {
      throw new Error(message);
    }
  }

  async run() {
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('         PHASE 2 END-TO-END TESTING SUITE');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');

    try {
      // Setup
      await this.setup();

      // Run tests
      await this.testRedisConnection();
      await this.testSerpAPIFetch();
      await this.testMediaStackFetch();
      await this.testNewsServiceMultiSource();
      await this.testCaching();
      await this.testBreakingNews();
      await this.testCategoryFetch();
      await this.testSearchNews();
      await this.testClaudeAISummary();
      await this.testClaudeSentimentAnalysis();
      await this.testClaudeKeyPoints();
      await this.testClaudeCategorization();
      await this.testClaudeTagGeneration();
      await this.testArticleStorage();
      await this.testDuplicateDetection();
      await this.testBatchStorage();
      await this.testSourceHealth();
      await this.testRateLimitTracking();

      // Summary
      await this.printSummary();

      // Cleanup
      await this.cleanup();

      // Exit code
      process.exit(this.results.failed > 0 ? 1 : 0);
    } catch (error) {
      console.error('');
      console.error('❌ Test suite failed to run:', error);
      process.exit(1);
    }
  }

  async setup() {
    this.log('Setting up test environment...', 'info');
    await redisCache.connect();
    this.log('Redis connected', 'success');
  }

  async cleanup() {
    this.log('Cleaning up...', 'info');
    await redisCache.disconnect();
    this.log('Redis disconnected', 'success');
  }

  async testRedisConnection() {
    await this.test('Redis Connection', async () => {
      const isConnected = redisCache.client !== null;
      this.assert(isConnected, 'Redis should be connected');

      // Test set/get
      await redisCache.set('test:key', { foo: 'bar' }, 60);
      const value = await redisCache.get('test:key');
      this.assert(value.foo === 'bar', 'Redis should store and retrieve data');

      // Cleanup
      await redisCache.del('test:key');
    });
  }

  async testSerpAPIFetch() {
    await this.test('SerpAPI News Fetch', async () => {
      const result = await newsService.clients.serpapi.fetchNews({
        query: 'technology',
        limit: 5,
      });

      this.assert(result.success, 'SerpAPI should return success');
      this.assert(Array.isArray(result.articles), 'Should return articles array');
      this.assert(result.articles.length > 0, 'Should return at least 1 article');
      this.assert(result.articles.length <= 5, 'Should respect limit parameter');

      // Validate article structure
      const article = result.articles[0];
      this.assert(article.title, 'Article should have title');
      this.assert(article.url, 'Article should have URL');
      this.assert(article.source, 'Article should have source');

      this.log(`Fetched ${result.articles.length} articles from SerpAPI`, 'info');
    });
  }

  async testMediaStackFetch() {
    await this.test('MediaStack News Fetch', async () => {
      const result = await newsService.clients.mediastack.fetchNews({
        query: 'business',
        limit: 5,
      });

      this.assert(result.success, 'MediaStack should return success');
      this.assert(Array.isArray(result.articles), 'Should return articles array');
      this.assert(result.articles.length > 0, 'Should return at least 1 article');

      // Validate article structure
      const article = result.articles[0];
      this.assert(article.title, 'Article should have title');
      this.assert(article.url, 'Article should have URL');

      this.log(`Fetched ${result.articles.length} articles from MediaStack`, 'info');
    });
  }

  async testNewsServiceMultiSource() {
    await this.test('Multi-Source News Aggregation', async () => {
      const result = await newsService.fetchFromMultipleSources({
        query: 'artificial intelligence',
        limit: 5,
        sources: ['serpapi', 'mediastack'],
        useCache: false,
      });

      this.assert(result.success, 'Should aggregate successfully');
      this.assert(Array.isArray(result.articles), 'Should return articles');
      this.assert(result.articles.length > 0, 'Should have articles');
      this.assert(result.sources.length === 2, 'Should use 2 sources');

      this.log(`Aggregated ${result.articles.length} articles`, 'info');
      this.log(`Sources used: ${result.sources.join(', ')}`, 'info');
    });
  }

  async testCaching() {
    await this.test('Redis Caching System', async () => {
      // First request (cache MISS)
      const result1 = await newsService.fetchFromMultipleSources({
        query: 'cache-test',
        limit: 3,
        useCache: true,
      });

      this.assert(result1.success, 'First request should succeed');
      this.assert(!result1.cached, 'First request should not be cached');

      // Second request (cache HIT)
      const result2 = await newsService.fetchFromMultipleSources({
        query: 'cache-test',
        limit: 3,
        useCache: true,
      });

      this.assert(result2.success, 'Second request should succeed');
      this.assert(result2.cached === true, 'Second request should be cached');
      this.assert(
        result2.articles.length === result1.articles.length,
        'Cached result should have same article count'
      );

      this.log('Cache HIT confirmed on second request', 'success');

      // Cleanup
      await redisCache.delPattern('news:*cache-test*');
    });
  }

  async testBreakingNews() {
    await this.test('Breaking News Fetch', async () => {
      const result = await newsService.fetchBreakingNews(10);

      this.assert(result.success, 'Should fetch breaking news');
      this.assert(result.articles.length > 0, 'Should have breaking news articles');

      this.log(`Fetched ${result.articles.length} breaking news`, 'info');
    });
  }

  async testCategoryFetch() {
    await this.test('Category-Based Fetch', async () => {
      const categories = ['technology', 'business', 'science'];
      
      for (const category of categories) {
        const result = await newsService.fetchByCategory(category, 5);
        this.assert(result.success, `Should fetch ${category} news`);
        this.assert(result.articles.length > 0, `Should have ${category} articles`);
        this.log(`${category}: ${result.articles.length} articles`, 'info');
      }
    });
  }

  async testSearchNews() {
    await this.test('News Search', async () => {
      const result = await newsService.searchNews('climate change', 5);

      this.assert(result.success, 'Search should succeed');
      this.assert(result.articles.length > 0, 'Should find articles');

      this.log(`Found ${result.articles.length} articles`, 'info');
    });
  }

  async testClaudeAISummary() {
    await this.test('Claude AI Article Summary', async () => {
      const summary = await claudeService.generateSummary(
        'Breaking News: Major Technology Advancement',
        'Researchers have made a significant breakthrough in quantum computing technology. The new method allows for more stable qubits and could accelerate the development of practical quantum computers. This advancement represents years of research and collaboration.',
        100
      );

      this.assert(summary, 'Should generate summary');
      this.assert(summary.length > 0, 'Summary should not be empty');
      this.assert(summary.length <= 200, 'Summary should be concise');

      this.log(`Summary: "${summary.substring(0, 80)}..."`, 'info');
    });
  }

  async testClaudeSentimentAnalysis() {
    await this.test('Claude Sentiment Analysis', async () => {
      const result = await claudeService.analyzeSentiment(
        'Positive News Article',
        'This is an exciting development that will benefit everyone. The future looks bright with these innovations.'
      );

      this.assert(result.sentiment, 'Should return sentiment');
      this.assert(result.score !== undefined, 'Should return score');
      this.assert(['positive', 'negative', 'neutral'].includes(result.sentiment), 'Sentiment should be valid');
      this.assert(result.score >= -1 && result.score <= 1, 'Score should be between -1 and 1');

      this.log(`Sentiment: ${result.sentiment} (${result.score})`, 'info');
    });
  }

  async testClaudeKeyPoints() {
    await this.test('Claude Key Points Extraction', async () => {
      const keyPoints = await claudeService.extractKeyPoints(
        'Economic Report',
        'The economy showed strong growth last quarter. Unemployment dropped to record lows. Inflation remained stable. Consumer confidence increased significantly.',
        5
      );

      this.assert(Array.isArray(keyPoints), 'Should return array');
      this.assert(keyPoints.length > 0, 'Should extract key points');
      this.assert(keyPoints.length <= 5, 'Should respect max points limit');

      this.log(`Extracted ${keyPoints.length} key points`, 'info');
    });
  }

  async testClaudeCategorization() {
    await this.test('Claude Article Categorization', async () => {
      const result = await claudeService.categorizeArticle(
        'New Programming Language Released',
        'Developers announced a new programming language designed for machine learning applications.',
        ['Technology', 'Business', 'Science', 'Politics']
      );

      this.assert(result.primary, 'Should return primary category');
      this.assert(Array.isArray(result.secondary), 'Should return secondary categories');
      this.assert(result.confidence !== undefined, 'Should return confidence');
      this.assert(result.primary === 'Technology', 'Should categorize as Technology');

      this.log(`Category: ${result.primary} (confidence: ${result.confidence})`, 'info');
    });
  }

  async testClaudeTagGeneration() {
    await this.test('Claude Tag Generation', async () => {
      const tags = await claudeService.generateTags(
        'AI Breakthrough in Healthcare',
        'Artificial intelligence is revolutionizing medical diagnosis with new machine learning algorithms.',
        8
      );

      this.assert(Array.isArray(tags), 'Should return tags array');
      this.assert(tags.length > 0, 'Should generate tags');
      this.assert(tags.length <= 8, 'Should respect max tags limit');

      this.log(`Tags: ${tags.join(', ')}`, 'info');
    });
  }

  async testArticleStorage() {
    await this.test('Article Storage Pipeline', async () => {
      const testArticle = {
        title: `Test Article ${Date.now()}`,
        content: 'This is a test article for storage validation.',
        summary: 'Test article summary',
        url: `https://example.com/test-${Date.now()}`,
        imageUrl: 'https://example.com/image.jpg',
        source: 'test-source',
        author: 'Test Author',
        publishedAt: new Date().toISOString(),
        category: 'Technology',
        tags: ['test', 'automation'],
      };

      const result = await articleStorageService.saveArticle(testArticle, {
        enrichWithAI: false, // Skip AI to avoid costs
        autoPublish: false,
      });

      this.assert(result.success, 'Article should save successfully');
      this.assert(result.article, 'Should return saved article');
      this.assert(result.article.id, 'Saved article should have ID');

      this.log(`Saved article with ID: ${result.article.id}`, 'success');
    });
  }

  async testDuplicateDetection() {
    await this.test('Duplicate Detection', async () => {
      const testArticle = {
        title: `Duplicate Test ${Date.now()}`,
        content: 'Testing duplicate detection',
        url: `https://example.com/dup-${Date.now()}`,
        source: 'test-source',
        publishedAt: new Date().toISOString(),
      };

      // Save first time
      const result1 = await articleStorageService.saveArticle(testArticle, {
        enrichWithAI: false,
      });
      this.assert(result1.success, 'First save should succeed');

      // Try to save duplicate
      const result2 = await articleStorageService.saveArticle(testArticle, {
        enrichWithAI: false,
      });
      this.assert(!result2.success, 'Duplicate should be rejected');
      this.assert(result2.duplicate, 'Should indicate duplicate');

      this.log('Duplicate detection working correctly', 'success');
    });
  }

  async testBatchStorage() {
    await this.test('Batch Article Storage', async () => {
      const articles = [
        {
          title: `Batch Test 1 ${Date.now()}`,
          content: 'Batch test article 1',
          url: `https://example.com/batch1-${Date.now()}`,
          source: 'test-source',
          publishedAt: new Date().toISOString(),
        },
        {
          title: `Batch Test 2 ${Date.now()}`,
          content: 'Batch test article 2',
          url: `https://example.com/batch2-${Date.now()}`,
          source: 'test-source',
          publishedAt: new Date().toISOString(),
        },
      ];

      const result = await articleStorageService.saveArticles(articles, {
        enrichWithAI: false,
      });

      this.assert(result.total === 2, 'Should process 2 articles');
      this.assert(result.saved >= 1, 'Should save at least 1 article');

      this.log(`Batch: ${result.saved} saved, ${result.duplicates} duplicates`, 'info');
    });
  }

  async testSourceHealth() {
    await this.test('Source Health Checks', async () => {
      const health = await newsService.getSourcesHealth();

      this.assert(health.serpapi, 'Should have SerpAPI health status');
      this.assert(health.mediastack, 'Should have MediaStack health status');

      for (const [source, status] of Object.entries(health)) {
        this.assert(status.available !== undefined, `${source} should have availability`);
        this.log(`${source}: ${status.available ? 'Available' : 'Unavailable'}`, 'info');
      }
    });
  }

  async testRateLimitTracking() {
    await this.test('Rate Limit Tracking', async () => {
      const stats = newsService.getApiStats();

      this.assert(stats.serpapi, 'Should have SerpAPI stats');
      this.assert(stats.mediastack, 'Should have MediaStack stats');

      for (const [source, stat] of Object.entries(stats)) {
        this.assert(stat.monthlyLimit !== undefined, `${source} should have monthly limit`);
        this.assert(stat.used !== undefined, `${source} should track usage`);
        this.assert(stat.remaining !== undefined, `${source} should show remaining`);
        
        this.log(
          `${source}: ${stat.used}/${stat.monthlyLimit} used (${stat.remaining} remaining)`,
          'info'
        );
      }
    });
  }

  async printSummary() {
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('                     TEST SUMMARY');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    console.log(`Total Tests: ${this.results.passed + this.results.failed}`);
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log('');

    if (this.results.failed > 0) {
      console.log('Failed Tests:');
      this.results.tests
        .filter((t) => t.status === 'FAILED')
        .forEach((test) => {
          console.log(`  ❌ ${test.name}: ${test.error}`);
        });
      console.log('');
    }

    const successRate = (
      (this.results.passed / (this.results.passed + this.results.failed)) *
      100
    ).toFixed(1);
    console.log(`Success Rate: ${successRate}%`);
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
  }
}

// Run tests
const tester = new Phase2Tester();
tester.run();
