/**
 * Test Crawler Agent
 * Verifies RSS feed monitoring and news discovery functionality
 */

import CrawlerAgent from '../src/agents/specialized/CrawlerAgent.js';

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSection(title) {
  console.log(`\n${'='.repeat(80)}`);
  log(`  ${title}`, colors.bright + colors.cyan);
  console.log(`${'='.repeat(80)}\n`);
}

function logSuccess(message) {
  log(`✓ ${message}`, colors.green);
}

function logError(message) {
  log(`✗ ${message}`, colors.red);
}

function logInfo(message) {
  log(`ℹ ${message}`, colors.blue);
}

async function testCrawlerAgent() {
  logSection('CRAWLER AGENT TEST SUITE');

  const results = {
    passed: 0,
    failed: 0,
    tests: [],
  };

  try {
    // Test 1: Agent Initialization
    logSection('Test 1: Agent Initialization');
    try {
      const crawler = new CrawlerAgent({
        rssFeeds: [
          {
            name: 'BBC News',
            url: 'http://feeds.bbci.co.uk/news/rss.xml',
            category: 'general',
            credibility: 0.95,
          },
          {
            name: 'TechCrunch',
            url: 'https://techcrunch.com/feed/',
            category: 'technology',
            credibility: 0.85,
          },
        ],
        useNewsApis: false, // Disable API calls for initial test
        minCredibility: 0.75,
        trendingThreshold: 2,
      });

      logInfo('Starting crawler agent...');
      const started = await crawler.start();

      if (started) {
        logSuccess('Agent initialized successfully');
        logInfo(`Agent status: ${crawler.status}`);
        results.passed += 1;
        results.tests.push({ name: 'Initialization', passed: true });
      } else {
        logError('Agent failed to start');
        results.failed += 1;
        results.tests.push({ name: 'Initialization', passed: false });
      }

      // Test 2: RSS Feed Crawling
      logSection('Test 2: RSS Feed Crawling');
      try {
        logInfo('Crawling RSS feeds...');
        const rssResult = await crawler.run({
          type: 'rss',
          options: {},
        });

        if (rssResult.success && rssResult.result.articles) {
          logSuccess(`Found ${rssResult.result.articles.length} articles from RSS feeds`);
          logInfo(`Execution time: ${rssResult.duration}ms`);

          // Show sample articles
          if (rssResult.result.articles.length > 0) {
            logInfo('\nSample articles:');
            rssResult.result.articles.slice(0, 3).forEach((article, i) => {
              console.log(`\n  ${i + 1}. ${article.title}`);
              console.log(`     Source: ${article.source?.name || 'Unknown'}`);
              console.log(`     Credibility: ${article.source?.credibility || 'N/A'}`);
              console.log(`     Published: ${new Date(article.publishedAt).toLocaleString()}`);
            });
          }

          results.passed += 1;
          results.tests.push({ name: 'RSS Crawling', passed: true });
        } else {
          logError('RSS crawling failed or returned no articles');
          results.failed += 1;
          results.tests.push({ name: 'RSS Crawling', passed: false });
        }
      } catch (error) {
        logError(`RSS crawling error: ${error.message}`);
        results.failed += 1;
        results.tests.push({ name: 'RSS Crawling', passed: false, error: error.message });
      }

      // Test 3: Complete News Discovery
      logSection('Test 3: Complete News Discovery');
      try {
        logInfo('Running full news discovery...');
        const discoveryResult = await crawler.run({
          type: 'discover',
          options: {},
        });

        if (discoveryResult.success && discoveryResult.result.articles) {
          logSuccess(
            `Discovery complete: ${discoveryResult.result.articles.length} articles found`
          );
          logInfo(`RSS articles: ${discoveryResult.result.metadata.rssCount}`);
          logInfo(`API articles: ${discoveryResult.result.metadata.apiCount}`);
          logInfo(`Trending topics: ${discoveryResult.result.trending.length}`);

          if (discoveryResult.result.trending.length > 0) {
            logInfo('\nTop trending topics:');
            discoveryResult.result.trending.slice(0, 5).forEach((topic, i) => {
              console.log(`  ${i + 1}. "${topic.keyword}" - ${topic.mentions} mentions`);
            });
          }

          results.passed += 1;
          results.tests.push({ name: 'News Discovery', passed: true });
        } else {
          logError('News discovery failed');
          results.failed += 1;
          results.tests.push({ name: 'News Discovery', passed: false });
        }
      } catch (error) {
        logError(`News discovery error: ${error.message}`);
        results.failed += 1;
        results.tests.push({ name: 'News Discovery', passed: false, error: error.message });
      }

      // Test 4: Trending Topics Detection
      logSection('Test 4: Trending Topics Detection');
      try {
        logInfo('Detecting trending topics...');
        const trendingResult = await crawler.run({
          type: 'trending',
          options: {},
        });

        if (trendingResult.success && trendingResult.result.topics) {
          logSuccess(`Found ${trendingResult.result.topics.length} trending topics`);
          logInfo(`Total unique topics: ${trendingResult.result.totalTopics}`);

          if (trendingResult.result.topics.length > 0) {
            logInfo('\nTrending topic details:');
            trendingResult.result.topics.slice(0, 3).forEach(topic => {
              console.log(`\n  Topic: "${topic.keyword}"`);
              console.log(`  Mentions: ${topic.mentions}`);
              console.log(`  Trend: ${topic.trend}`);
              console.log(`  First seen: ${new Date(topic.firstSeen).toLocaleString()}`);
            });
          }

          results.passed += 1;
          results.tests.push({ name: 'Trending Detection', passed: true });
        } else {
          logError('Trending detection failed');
          results.failed += 1;
          results.tests.push({ name: 'Trending Detection', passed: false });
        }
      } catch (error) {
        logError(`Trending detection error: ${error.message}`);
        results.failed += 1;
        results.tests.push({ name: 'Trending Detection', passed: false, error: error.message });
      }

      // Test 5: Agent Statistics
      logSection('Test 5: Agent Statistics');
      try {
        const stats = crawler.getCrawlerStats();
        logSuccess('Retrieved crawler statistics');
        logInfo(`Total tasks executed: ${stats.stats.tasksExecuted}`);
        logInfo(`Success rate: ${stats.stats.successRate.toFixed(2)}%`);
        logInfo(`Discovered articles: ${stats.discoveredArticles}`);
        logInfo(`Trending topics tracked: ${stats.trendingTopics}`);
        logInfo(`Last RSS poll: ${stats.lastRSSPoll || 'Never'}`);

        results.passed += 1;
        results.tests.push({ name: 'Statistics', passed: true });
      } catch (error) {
        logError(`Statistics error: ${error.message}`);
        results.failed += 1;
        results.tests.push({ name: 'Statistics', passed: false, error: error.message });
      }

      // Cleanup
      logSection('Cleanup');
      await crawler.stop();
      logSuccess('Agent stopped successfully');
    } catch (error) {
      logError(`Critical error during testing: ${error.message}`);
      console.error(error);
      results.failed += 1;
    }

    // Final Results
    logSection('TEST RESULTS SUMMARY');

    results.tests.forEach(test => {
      if (test.passed) {
        logSuccess(`${test.name}: PASSED`);
      } else {
        logError(`${test.name}: FAILED${test.error ? ` (${test.error})` : ''}`);
      }
    });

    console.log(`\n${'-'.repeat(80)}`);
    log(
      `\nTotal: ${results.tests.length} tests | ` +
        `Passed: ${results.passed} | ` +
        `Failed: ${results.failed}`,
      results.failed === 0 ? colors.green : colors.red
    );

    if (results.failed === 0) {
      log('\n🎉 All tests passed!', colors.green + colors.bright);
    } else {
      log('\n⚠️  Some tests failed. Please review the errors above.', colors.yellow);
    }

    console.log(`${'='.repeat(80)}\n`);

    process.exit(results.failed === 0 ? 0 : 1);
  } catch (error) {
    logError(`Fatal error: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// Run tests
testCrawlerAgent();
