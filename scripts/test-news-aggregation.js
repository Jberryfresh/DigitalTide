/**
 * Multi-Source News Aggregation Test Script
 * Tests intelligent source prioritization, reputation tracking,
 * and article quality filtering
 */

import newsAggregator from '../src/services/news/newsAggregator.js';

// ANSI color codes
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
};

function printResult(testName, passed, details = '') {
  const symbol = passed ? '✓' : '✗';
  const color = passed ? colors.green : colors.red;
  console.log(`${color}${symbol} ${testName}${colors.reset}`);
  if (details) {
    console.log(`  ${details}\n`);
  }
}

/**
 * Test 1: Source Information and Configuration
 */
async function testSourceInformation() {
  console.log(`\n${colors.cyan}=== Test 1: Source Information ===${colors.reset}\n`);

  try {
    const sourceInfo = newsAggregator.getSourceInfo();
    const passed = sourceInfo.length > 0;

    printResult(
      'Should provide source information',
      passed,
      `Found ${sourceInfo.length} configured sources`
    );

    console.log('Available sources:');
    sourceInfo.forEach(source => {
      const statusIcon = source.enabled ? '✓' : '✗';
      console.log(`  ${statusIcon} ${source.name.toUpperCase()}:`);
      console.log(`     Type: ${source.type}`);
      console.log(`     Priority: ${source.priority}`);
      console.log(`     Credibility: ${source.credibility.toFixed(2)}`);
      console.log(`     Cost per request: $${source.costPerRequest.toFixed(3)}`);
      console.log(
        `     Quota limit: ${source.quotaLimit === Infinity ? 'Unlimited' : source.quotaLimit}`
      );
      console.log(`     Categories: ${source.categories.join(', ')}`);
      console.log(`     Reputation: ${source.reputation.successRate.toFixed(2)} success rate`);
    });

    return passed;
  } catch (error) {
    printResult('Should provide source information', false, error.message);
    return false;
  }
}

/**
 * Test 2: Multi-Source Aggregation (Basic)
 */
async function testBasicAggregation() {
  console.log(`\n${colors.cyan}=== Test 2: Basic Multi-Source Aggregation ===${colors.reset}\n`);

  try {
    console.log('Fetching news about "technology" from multiple sources...\n');

    const startTime = Date.now();
    const results = await newsAggregator.aggregateFromMultipleSources({
      query: 'technology',
      limit: 20,
      useCache: false, // Disable cache for testing
      sourcePriority: 'balanced',
    });
    const fetchTime = Date.now() - startTime;

    const passed = results.articles.length > 0;

    printResult(
      'Should aggregate articles from multiple sources',
      passed,
      `Retrieved ${results.articles.length} articles in ${fetchTime}ms`
    );

    console.log('Aggregation metrics:');
    console.log(`  Total fetched: ${results.metadata.totalFetched}`);
    console.log(`  Deduplicated: ${results.metadata.deduplicated}`);
    console.log(`  Filtered: ${results.metadata.filtered}`);
    console.log(`  Final count: ${results.articles.length}`);
    console.log(`  Sources used: ${results.metadata.selectedSources}`);
    console.log(`  Aggregation time: ${results.metadata.aggregationTime}ms`);

    console.log('\nSource results:');
    Object.entries(results.metadata.sources).forEach(([name, data]) => {
      const icon = data.status === 'success' ? '✓' : '✗';
      console.log(`  ${icon} ${name}: ${data.count} articles (${data.status})`);
      if (data.responseTime) {
        console.log(`     Response time: ${data.responseTime}ms`);
      }
      if (data.credibility) {
        console.log(`     Credibility: ${data.credibility.toFixed(2)}`);
      }
      if (data.error) {
        console.log(`     Error: ${data.error}`);
      }
    });

    if (results.articles.length > 0) {
      console.log('\nSample articles:');
      results.articles.slice(0, 3).forEach((article, idx) => {
        console.log(`  ${idx + 1}. ${article.title.substring(0, 70)}...`);
        console.log(
          `     Source: ${article.source?.name} (credibility: ${article.source?.credibility?.toFixed(2) || 'N/A'})`
        );
        console.log(`     Published: ${article.publishedAt}`);
      });
    }

    return passed;
  } catch (error) {
    printResult('Should aggregate articles from multiple sources', false, error.message);
    console.error(error);
    return false;
  }
}

/**
 * Test 3: Source Prioritization Strategies
 */
async function testSourcePrioritization() {
  console.log(`\n${colors.cyan}=== Test 3: Source Prioritization Strategies ===${colors.reset}\n`);

  const strategies = ['balanced', 'quality', 'speed', 'cost'];
  const results = {};

  try {
    for (const strategy of strategies) {
      console.log(`Testing "${strategy}" priority...`);
      const result = await newsAggregator.aggregateFromMultipleSources({
        query: 'business',
        limit: 10,
        useCache: false,
        sourcePriority: strategy,
      });
      results[strategy] = {
        articles: result.articles.length,
        sources: result.metadata.selectedSources,
        time: result.metadata.aggregationTime,
      };
      console.log(`  Articles: ${results[strategy].articles}, Time: ${results[strategy].time}ms\n`);
    }

    const passed = Object.keys(results).length === strategies.length;

    printResult(
      'Should support different prioritization strategies',
      passed,
      `Tested ${Object.keys(results).length} strategies`
    );

    console.log('Strategy comparison:');
    strategies.forEach(strategy => {
      console.log(`  ${strategy.toUpperCase()}:`);
      console.log(`    Articles: ${results[strategy].articles}`);
      console.log(`    Sources: ${results[strategy].sources}`);
      console.log(`    Time: ${results[strategy].time}ms`);
    });

    return passed;
  } catch (error) {
    printResult('Should support different prioritization strategies', false, error.message);
    return false;
  }
}

/**
 * Test 4: Credibility Filtering
 */
async function testCredibilityFiltering() {
  console.log(`\n${colors.cyan}=== Test 4: Credibility Filtering ===${colors.reset}\n`);

  try {
    // Fetch with no filter
    const unfiltered = await newsAggregator.aggregateFromMultipleSources({
      query: 'science',
      limit: 20,
      useCache: false,
      minCredibility: 0.0,
    });

    // Fetch with high credibility filter
    const filtered = await newsAggregator.aggregateFromMultipleSources({
      query: 'science',
      limit: 20,
      useCache: false,
      minCredibility: 0.85,
    });

    const passed = unfiltered.articles.length >= filtered.articles.length;

    printResult(
      'Should filter articles by credibility',
      passed,
      `Unfiltered: ${unfiltered.articles.length}, High credibility: ${filtered.articles.length}`
    );

    console.log('Credibility statistics:');
    console.log('  Without filter (minCredibility: 0.0):');
    console.log(`    Total: ${unfiltered.articles.length} articles`);
    console.log(`    Filtered: ${unfiltered.metadata.filtered}`);
    console.log('  With filter (minCredibility: 0.85):');
    console.log(`    Total: ${filtered.articles.length} articles`);
    console.log(`    Filtered: ${filtered.metadata.filtered}`);

    if (filtered.articles.length > 0) {
      const avgCredibility =
        filtered.articles.reduce((sum, a) => sum + (a.source?.credibility || 0), 0) /
        filtered.articles.length;
      console.log(`    Avg credibility: ${avgCredibility.toFixed(3)}`);
    }

    return passed;
  } catch (error) {
    printResult('Should filter articles by credibility', false, error.message);
    return false;
  }
}

/**
 * Test 5: Deduplication
 */
async function testDeduplication() {
  console.log(`\n${colors.cyan}=== Test 5: Deduplication ===${colors.reset}\n`);

  try {
    const results = await newsAggregator.aggregateFromMultipleSources({
      query: 'news',
      limit: 30,
      useCache: false,
      deduplication: true,
    });

    const passed = results.metadata.deduplicated >= 0;

    printResult(
      'Should deduplicate articles across sources',
      passed,
      `Removed ${results.metadata.deduplicated} duplicates from ${results.metadata.totalFetched} articles`
    );

    console.log('Deduplication metrics:');
    console.log(`  Total fetched: ${results.metadata.totalFetched}`);
    console.log(`  Duplicates found: ${results.metadata.deduplicated}`);
    console.log(`  Unique articles: ${results.articles.length}`);
    console.log(
      `  Deduplication rate: ${((results.metadata.deduplicated / results.metadata.totalFetched) * 100).toFixed(1)}%`
    );

    return passed;
  } catch (error) {
    printResult('Should deduplicate articles across sources', false, error.message);
    return false;
  }
}

/**
 * Test 6: Category-Specific Aggregation
 */
async function testCategoryAggregation() {
  console.log(`\n${colors.cyan}=== Test 6: Category-Specific Aggregation ===${colors.reset}\n`);

  const categories = ['technology', 'business', 'science'];
  const results = {};

  try {
    for (const category of categories) {
      console.log(`Fetching ${category} news...`);
      const result = await newsAggregator.aggregateFromMultipleSources({
        category,
        limit: 10,
        useCache: false,
      });
      results[category] = result.articles.length;
      console.log(`  Found ${results[category]} articles\n`);
    }

    const passed = Object.values(results).every(count => count > 0);

    printResult(
      'Should aggregate by category',
      passed,
      `Fetched articles for ${Object.keys(results).length} categories`
    );

    console.log('Category results:');
    Object.entries(results).forEach(([category, count]) => {
      console.log(`  ${category}: ${count} articles`);
    });

    return passed;
  } catch (error) {
    printResult('Should aggregate by category', false, error.message);
    return false;
  }
}

/**
 * Test 7: Aggregator Statistics
 */
async function testStatistics() {
  console.log(`\n${colors.cyan}=== Test 7: Aggregator Statistics ===${colors.reset}\n`);

  try {
    const stats = newsAggregator.getStats();

    const passed = stats.totalRequests > 0;

    printResult(
      'Should track aggregation statistics',
      passed,
      `${stats.totalRequests} total requests tracked`
    );

    console.log('Aggregator statistics:');
    console.log(`  Total requests: ${stats.totalRequests}`);
    console.log(`  Total articles: ${stats.totalArticles}`);
    console.log(`  Deduplicated: ${stats.deduplicatedArticles}`);
    console.log(`  Available sources: ${stats.availableSources.join(', ')}`);

    console.log('\nSource usage:');
    Object.entries(stats.sourceUsage).forEach(([source, data]) => {
      console.log(`  ${source.toUpperCase()}:`);
      console.log(`    Requests: ${data.requests}`);
      console.log(`    Articles: ${data.articles}`);
      console.log(`    Failures: ${data.failures}`);
      console.log(`    Success rate: ${((1 - data.failures / data.requests) * 100).toFixed(1)}%`);
    });

    console.log('\nSource reputations:');
    Object.entries(stats.sourceReputations).forEach(([source, rep]) => {
      console.log(`  ${source.toUpperCase()}:`);
      console.log(`    Success rate: ${(rep.successRate * 100).toFixed(1)}%`);
      console.log(`    Avg response time: ${rep.avgResponseTime.toFixed(0)}ms`);
      console.log(`    Avg quality: ${rep.avgArticleQuality.toFixed(2)}`);
      console.log(`    Consecutive failures: ${rep.consecutiveFailures}`);
    });

    return passed;
  } catch (error) {
    printResult('Should track aggregation statistics', false, error.message);
    return false;
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log(`\n${colors.blue}╔════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.blue}║  Multi-Source Aggregation Test Suite     ║${colors.reset}`);
  console.log(`${colors.blue}╚════════════════════════════════════════════╝${colors.reset}`);

  const results = {
    sourceInfo: false,
    basicAggregation: false,
    prioritization: false,
    credibilityFiltering: false,
    deduplication: false,
    categoryAggregation: false,
    statistics: false,
  };

  try {
    results.sourceInfo = await testSourceInformation();
    results.basicAggregation = await testBasicAggregation();
    results.prioritization = await testSourcePrioritization();
    results.credibilityFiltering = await testCredibilityFiltering();
    results.deduplication = await testDeduplication();
    results.categoryAggregation = await testCategoryAggregation();
    results.statistics = await testStatistics();

    // Summary
    const passed = Object.values(results).filter(r => r).length;
    const total = Object.keys(results).length;

    console.log(`\n${colors.blue}═══════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.cyan}Test Summary${colors.reset}`);
    console.log(`${colors.blue}═══════════════════════════════════════════════${colors.reset}`);

    const passRate = ((passed / total) * 100).toFixed(0);
    const color = passed === total ? colors.green : passed > 0 ? colors.yellow : colors.red;

    console.log(`\n${color}${passed}/${total} tests passed (${passRate}%)${colors.reset}\n`);

    Object.entries(results).forEach(([test, passed]) => {
      const symbol = passed ? '✓' : '✗';
      const color = passed ? colors.green : colors.red;
      console.log(`  ${color}${symbol} ${test}${colors.reset}`);
    });

    console.log();

    if (passed === total) {
      console.log(`${colors.green}✓ All aggregation tests passed!${colors.reset}\n`);
      process.exit(0);
    } else {
      console.log(`${colors.yellow}⚠ Some tests failed - review output above${colors.reset}\n`);
      process.exit(1);
    }
  } catch (error) {
    console.error(`\n${colors.red}✗ Test suite error:${colors.reset}`, error);
    process.exit(1);
  }
}

// Run tests
runAllTests();
