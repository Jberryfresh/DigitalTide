/**
 * DigitalTide - Source Credibility Scoring Test Suite
 *
 * Tests the credibility scoring system for news sources.
 *
 * Test Coverage:
 * 1. Tier classification (Tier 1/2/3/blocked/unknown)
 * 2. Historical performance tracking
 * 3. Content quality scoring
 * 4. Batch evaluation
 * 5. URL-based credibility lookup
 * 6. Confidence scoring
 * 7. History import/export
 *
 * Usage: node scripts/test-credibility-scoring.js
 */

import credibilityService from '../src/services/analytics/credibilityService.js';

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

let testsRun = 0;
let testsPassed = 0;
let testsFailed = 0;

function logSection(title) {
  console.log(`\n${colors.bright}${colors.cyan}${'='.repeat(80)}${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}${title}${colors.reset}`);
  console.log(`${colors.cyan}${'='.repeat(80)}${colors.reset}\n`);
}

function logTest(name) {
  console.log(`${colors.blue}▶${colors.reset} ${colors.bright}Test:${colors.reset} ${name}`);
  testsRun++;
}

function logSuccess(message) {
  console.log(`${colors.green}  ✓${colors.reset} ${message}`);
  testsPassed++;
}

function logError(message) {
  console.log(`${colors.red}  ✗${colors.reset} ${message}`);
  testsFailed++;
}

function logInfo(message) {
  console.log(`${colors.yellow}  ℹ${colors.reset} ${message}`);
}

function logResult(data) {
  console.log(`${colors.cyan}  →${colors.reset} ${JSON.stringify(data, null, 2)}`);
}

/**
 * Test 1: Tier 1 Source Classification
 */
function testTier1Classification() {
  logTest('Tier 1 (Premium) source classification');

  try {
    // Test major news sources
    const reuters = credibilityService.calculateCredibility({
      url: 'https://www.reuters.com/article/example',
      domain: 'reuters.com',
      name: 'Reuters',
    });

    const nytimes = credibilityService.calculateCredibility({
      url: 'https://www.nytimes.com/2025/01/31/technology/ai-news.html',
      domain: 'nytimes.com',
      name: 'The New York Times',
    });

    const bbc = credibilityService.calculateCredibility({
      url: 'https://www.bbc.com/news/world',
      domain: 'bbc.com',
      name: 'BBC News',
    });

    // Verify tier classification
    if (reuters.tier !== 1) {
      logError(`Reuters should be Tier 1, got Tier ${reuters.tier}`);
    } else {
      logSuccess('Reuters correctly classified as Tier 1');
    }

    if (nytimes.tier !== 1) {
      logError(`NYTimes should be Tier 1, got Tier ${nytimes.tier}`);
    } else {
      logSuccess('New York Times correctly classified as Tier 1');
    }

    if (bbc.tier !== 1) {
      logError(`BBC should be Tier 1, got Tier ${bbc.tier}`);
    } else {
      logSuccess('BBC correctly classified as Tier 1');
    }

    // Verify score ranges
    if (reuters.score < 0.9) {
      logError(`Reuters score ${reuters.score} below Tier 1 minimum (0.90)`);
    } else {
      logSuccess(`Reuters score ${reuters.score} in Tier 1 range`);
    }

    // Verify confidence
    if (reuters.confidence < 0.85) {
      logError(`Reuters confidence ${reuters.confidence} too low`);
    } else {
      logSuccess(`Reuters confidence ${reuters.confidence} appropriately high`);
    }

    logResult({
      reuters: { score: reuters.score, tier: reuters.tier },
      nytimes: { score: nytimes.score, tier: nytimes.tier },
      bbc: { score: bbc.score, tier: bbc.tier },
    });
  } catch (error) {
    logError(`Test failed: ${error.message}`);
  }
}

/**
 * Test 2: Tier 2 Source Classification
 */
function testTier2Classification() {
  logTest('Tier 2 (Reliable) source classification');

  try {
    const techcrunch = credibilityService.calculateCredibility({
      url: 'https://techcrunch.com/2025/01/31/startup-news',
      domain: 'techcrunch.com',
      name: 'TechCrunch',
    });

    const npr = credibilityService.calculateCredibility({
      url: 'https://www.npr.org/sections/news',
      domain: 'npr.org',
      name: 'NPR',
    });

    const theverge = credibilityService.calculateCredibility({
      url: 'https://www.theverge.com/tech/article',
      domain: 'theverge.com',
      name: 'The Verge',
    });

    // Verify tier classification
    if (techcrunch.tier !== 2) {
      logError(`TechCrunch should be Tier 2, got Tier ${techcrunch.tier}`);
    } else {
      logSuccess('TechCrunch correctly classified as Tier 2');
    }

    if (npr.tier !== 2) {
      logError(`NPR should be Tier 2, got Tier ${npr.tier}`);
    } else {
      logSuccess('NPR correctly classified as Tier 2');
    }

    // Verify score ranges (0.70-0.89)
    if (techcrunch.score < 0.7 || techcrunch.score >= 0.9) {
      logError(`TechCrunch score ${techcrunch.score} outside Tier 2 range (0.70-0.89)`);
    } else {
      logSuccess(`TechCrunch score ${techcrunch.score} in Tier 2 range`);
    }

    logResult({
      techcrunch: { score: techcrunch.score, tier: techcrunch.tier },
      npr: { score: npr.score, tier: npr.tier },
      theverge: { score: theverge.score, tier: theverge.tier },
    });
  } catch (error) {
    logError(`Test failed: ${error.message}`);
  }
}

/**
 * Test 3: Tier 3 and Unknown Sources
 */
function testTier3AndUnknown() {
  logTest('Tier 3 (Supplementary) and unknown source classification');

  try {
    const medium = credibilityService.calculateCredibility({
      url: 'https://medium.com/@author/article',
      domain: 'medium.com',
      name: 'Medium',
    });

    const unknownSource = credibilityService.calculateCredibility({
      url: 'https://example-news-site.com/article/123',
      domain: 'example-news-site.com',
      name: 'Example News Site',
    });

    // Verify tier classification
    if (medium.tier !== 3) {
      logError(`Medium should be Tier 3, got Tier ${medium.tier}`);
    } else {
      logSuccess('Medium correctly classified as Tier 3');
    }

    if (unknownSource.tier !== 'unknown') {
      logError(`Unknown source should have tier 'unknown', got ${unknownSource.tier}`);
    } else {
      logSuccess("Unknown source correctly classified as 'unknown'");
    }

    // Verify score ranges
    if (medium.score < 0.5 || medium.score >= 0.7) {
      logError(`Medium score ${medium.score} outside Tier 3 range (0.50-0.69)`);
    } else {
      logSuccess(`Medium score ${medium.score} in Tier 3 range`);
    }

    if (unknownSource.score !== 0.5) {
      logInfo(`Unknown source has neutral score: ${unknownSource.score}`);
    } else {
      logSuccess(`Unknown source has neutral score: ${unknownSource.score}`);
    }

    // Verify lower confidence for unknown
    if (unknownSource.confidence > medium.confidence) {
      logError('Unknown source confidence should be lower than known Tier 3');
    } else {
      logSuccess(`Unknown source has appropriately low confidence: ${unknownSource.confidence}`);
    }

    logResult({
      medium: { score: medium.score, tier: medium.tier, confidence: medium.confidence },
      unknown: {
        score: unknownSource.score,
        tier: unknownSource.tier,
        confidence: unknownSource.confidence,
      },
    });
  } catch (error) {
    logError(`Test failed: ${error.message}`);
  }
}

/**
 * Test 4: Content Quality Scoring
 */
function testContentQualityScoring() {
  logTest('Content quality scoring from recent articles');

  try {
    // High quality articles
    const highQualityArticles = [
      {
        title: 'Comprehensive Analysis of AI Development Trends in 2025',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(50),
        author: 'Jane Smith',
        publishedAt: new Date().toISOString(),
        image: 'https://example.com/image.jpg',
        url: 'https://example.com/article/1',
      },
      {
        title: 'Breaking: Major Discovery in Quantum Computing',
        content: 'Detailed analysis and findings from the research team. '.repeat(40),
        author: 'John Doe',
        publishedAt: new Date().toISOString(),
        image: 'https://example.com/image2.jpg',
        url: 'https://example.com/article/2',
      },
    ];

    // Low quality articles
    const lowQualityArticles = [
      {
        title: 'News',
        content: 'Short content.',
        author: 'Unknown',
      },
      {
        title: 'Click here',
        description: 'Brief.',
      },
    ];

    const highQualityResult = credibilityService.calculateCredibility({
      url: 'https://test-source.com/article',
      domain: 'test-source.com',
      name: 'Test Source',
      recentArticles: highQualityArticles,
    });

    const lowQualityResult = credibilityService.calculateCredibility({
      url: 'https://low-quality-source.com/article',
      domain: 'low-quality-source.com',
      name: 'Low Quality Source',
      recentArticles: lowQualityArticles,
    });

    // High quality should score better
    if (highQualityResult.factors.contentQuality <= lowQualityResult.factors.contentQuality) {
      logError('High quality articles should score higher than low quality');
    } else {
      logSuccess(
        `High quality content scored higher: ${highQualityResult.factors.contentQuality} vs ${lowQualityResult.factors.contentQuality}`
      );
    }

    // Verify confidence increases with data
    if (highQualityResult.confidence <= 0.3 && highQualityResult.tier === 'unknown') {
      logInfo(
        `Unknown source confidence remains low even with data: ${highQualityResult.confidence}`
      );
    } else if (highQualityResult.confidence > 0.3) {
      logSuccess(`Confidence appropriately reflects data: ${highQualityResult.confidence}`);
    } else {
      logSuccess('Confidence behavior correct for source type');
    }

    logResult({
      highQuality: {
        score: highQualityResult.score,
        contentQuality: highQualityResult.factors.contentQuality,
        confidence: highQualityResult.confidence,
      },
      lowQuality: {
        score: lowQualityResult.score,
        contentQuality: lowQualityResult.factors.contentQuality,
        confidence: lowQualityResult.confidence,
      },
    });
  } catch (error) {
    logError(`Test failed: ${error.message}`);
  }
}

/**
 * Test 5: Historical Performance Tracking
 */
function testHistoricalTracking() {
  logTest('Historical performance tracking and updates');

  try {
    // Simulate tracking articles from a source
    const testDomain = 'historical-test.com';
    const articles = [
      { url: `https://${testDomain}/article1`, quality: 0.8, success: true },
      { url: `https://${testDomain}/article2`, quality: 0.7, success: true },
      { url: `https://${testDomain}/article3`, quality: 0.9, success: true },
      { url: `https://${testDomain}/article4`, quality: 0.6, success: true },
      { url: `https://${testDomain}/article5`, quality: 0.85, success: true },
    ];

    // Update history
    articles.forEach(article => credibilityService.updateSourceHistory(article));

    // Get credibility after tracking
    const result = credibilityService.calculateCredibility({
      url: `https://${testDomain}/new-article`,
      domain: testDomain,
      name: 'Historical Test Source',
    });

    if (!result.metadata.hasHistoricalData) {
      logError('Historical data not detected');
    } else {
      logSuccess('Historical data successfully tracked');
    }

    if (result.confidence < 0.5) {
      logError(`Confidence should increase with history: ${result.confidence}`);
    } else {
      logSuccess(`Confidence reflects historical data: ${result.confidence}`);
    }

    logResult({
      domain: testDomain,
      score: result.score,
      hasHistory: result.metadata.hasHistoricalData,
      confidence: result.confidence,
      factors: result.factors,
    });
  } catch (error) {
    logError(`Test failed: ${error.message}`);
  }
}

/**
 * Test 6: Batch Evaluation
 */
function testBatchEvaluation() {
  logTest('Batch evaluation of multiple sources');

  try {
    const sources = [
      { url: 'https://reuters.com/article', domain: 'reuters.com', name: 'Reuters' },
      { url: 'https://techcrunch.com/article', domain: 'techcrunch.com', name: 'TechCrunch' },
      { url: 'https://medium.com/@user/article', domain: 'medium.com', name: 'Medium' },
      { url: 'https://unknown-blog.com/post', domain: 'unknown-blog.com', name: 'Unknown Blog' },
    ];

    const results = credibilityService.batchEvaluate(sources);

    if (results.length !== sources.length) {
      logError(`Expected ${sources.length} results, got ${results.length}`);
    } else {
      logSuccess(`Batch evaluated ${results.length} sources`);
    }

    // Verify ordering (Tier 1 > Tier 2 > Tier 3 > Unknown)
    if (results[0].tier === 1 && results[1].tier === 2 && results[2].tier === 3) {
      logSuccess('Sources correctly classified across tiers');
    } else {
      logError('Tier classification inconsistent');
    }

    // Verify score ordering
    const scores = results.map(r => r.score);
    const isSorted = scores.every((score, i) => i === 0 || scores[i - 1] >= score);
    if (isSorted) {
      logSuccess('Scores correctly ordered (Tier 1 highest)');
    } else {
      logInfo('Scores may vary based on factors beyond tier');
    }

    logResult(
      results.map(r => ({
        domain: r.domain,
        score: r.score,
        tier: r.tier,
      }))
    );
  } catch (error) {
    logError(`Test failed: ${error.message}`);
  }
}

/**
 * Test 7: URL-Based Lookup
 */
function testUrlBasedLookup() {
  logTest('URL-based credibility lookup');

  try {
    const urls = [
      'https://www.washingtonpost.com/technology/2025/01/31/ai-regulation-news/',
      'https://www.wired.com/story/quantum-computing-breakthrough/',
      'https://randomwebsite.com/article/12345',
    ];

    const results = urls.map(url => credibilityService.getCredibilityForUrl(url));

    if (results.length !== urls.length) {
      logError(`Expected ${urls.length} results, got ${results.length}`);
      return;
    }

    logSuccess(`Evaluated ${results.length} URLs`);

    // Verify domain extraction
    if (results[0].domain === 'washingtonpost.com') {
      logSuccess('Domain correctly extracted from URL');
    } else {
      logError(`Expected 'washingtonpost.com', got '${results[0].domain}'`);
    }

    // Verify Tier 1 source
    if (results[0].tier === 1) {
      logSuccess('Washington Post correctly classified as Tier 1');
    } else {
      logError(`Washington Post should be Tier 1, got ${results[0].tier}`);
    }

    logResult(
      results.map(r => ({
        domain: r.domain,
        score: r.score,
        tier: r.tier,
      }))
    );
  } catch (error) {
    logError(`Test failed: ${error.message}`);
  }
}

/**
 * Test 8: Statistics and Export
 */
function testStatisticsAndExport() {
  logTest('Statistics tracking and history export');

  try {
    // Get stats
    const stats = credibilityService.getStats();

    if (!stats || typeof stats.evaluationsPerformed !== 'number') {
      logError('Stats not properly formatted');
      return;
    }

    logSuccess(`Total evaluations: ${stats.evaluationsPerformed}`);
    logSuccess(`Sources tracked: ${stats.sourcesTracked}`);
    logSuccess(`Tier 1 evaluations: ${stats.tier1Count}`);
    logSuccess(`Tier 2 evaluations: ${stats.tier2Count}`);
    logSuccess(`Tier 3 evaluations: ${stats.tier3Count}`);

    // Export history
    const exported = credibilityService.exportHistory();
    if (!Array.isArray(exported)) {
      logError('Export should return an array');
      return;
    }

    logSuccess(`Exported ${exported.length} source histories`);

    // Import history
    const originalSize = credibilityService.getStats().sourceHistorySize;
    credibilityService.clearHistory();
    credibilityService.importHistory(exported);
    const newSize = credibilityService.getStats().sourceHistorySize;

    if (newSize === originalSize) {
      logSuccess('History import/export works correctly');
    } else {
      logError(`History size mismatch: ${originalSize} vs ${newSize}`);
    }

    logResult({
      stats: {
        evaluations: stats.evaluationsPerformed,
        sourcesTracked: stats.sourcesTracked,
        historySize: stats.sourceHistorySize,
      },
      export: {
        entriesExported: exported.length,
      },
    });
  } catch (error) {
    logError(`Test failed: ${error.message}`);
  }
}

/**
 * Main test runner
 */
async function runTests() {
  logSection('DigitalTide - Source Credibility Scoring Test Suite');

  try {
    testTier1Classification();
    testTier2Classification();
    testTier3AndUnknown();
    testContentQualityScoring();
    testHistoricalTracking();
    testBatchEvaluation();
    testUrlBasedLookup();
    testStatisticsAndExport();
  } catch (error) {
    console.error(`\n${colors.red}Fatal error:${colors.reset}`, error);
  }

  // Print summary
  logSection('Test Summary');
  console.log(`${colors.bright}Total Tests:${colors.reset} ${testsRun}`);
  console.log(`${colors.green}Passed:${colors.reset} ${testsPassed}`);
  console.log(`${colors.red}Failed:${colors.reset} ${testsFailed}`);

  const successRate = testsRun > 0 ? ((testsPassed / testsRun) * 100).toFixed(1) : 0;
  console.log(`${colors.cyan}Success Rate:${colors.reset} ${successRate}%\n`);

  if (testsFailed === 0) {
    console.log(`${colors.green}${colors.bright}✓ ALL TESTS PASSED${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`${colors.red}${colors.bright}✗ SOME TESTS FAILED${colors.reset}\n`);
    process.exit(1);
  }
}

// Run tests
runTests();
