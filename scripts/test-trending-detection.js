/**
 * Enhanced Trending Detection Test Script
 * Tests advanced trending algorithms including velocity scoring,
 * topic clustering, and lifecycle tracking
 */

import TrendingService from '../src/services/analytics/trendingService.js';

// ANSI color codes for output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
};

/**
 * Print colored test result
 */
function printResult(testName, passed, details = '') {
  const symbol = passed ? '✓' : '✗';
  const color = passed ? colors.green : colors.red;
  console.log(`${color}${symbol} ${testName}${colors.reset}`);
  if (details) {
    console.log(`  ${details}\n`);
  }
}

/**
 * Generate sample articles for testing
 */
function generateSampleArticles() {
  const now = Date.now();
  const oneHourAgo = now - 3600000;
  const twoHoursAgo = now - 7200000;
  const fourHoursAgo = now - 14400000;
  const oneDayAgo = now - 86400000;

  return [
    // Emerging trend: "AI" - rapidly increasing mentions
    {
      title: 'AI Revolution: New Breakthrough in Machine Learning',
      description: 'Artificial intelligence reaches new milestone',
      link: 'https://example.com/ai1',
      publishedAt: new Date(now - 1800000).toISOString(), // 30 min ago
      source: { name: 'TechNews', credibility: 0.95 },
    },
    {
      title: 'AI-Powered Tools Transform Industries',
      description: 'Companies adopt AI at unprecedented rates',
      link: 'https://example.com/ai2',
      publishedAt: new Date(now - 3600000).toISOString(), // 1 hour ago
      source: { name: 'BBC', credibility: 0.98 },
    },
    {
      title: 'AI Safety Concerns Rise Among Experts',
      description: 'Researchers warn about AI risks',
      link: 'https://example.com/ai3',
      publishedAt: new Date(now - 5400000).toISOString(), // 1.5 hours ago
      source: { name: 'Reuters', credibility: 0.97 },
    },
    {
      title: 'New AI Regulations Proposed in Europe',
      description: 'European Union tackles AI governance',
      link: 'https://example.com/ai4',
      publishedAt: new Date(now - 1200000).toISOString(), // 20 min ago
      source: { name: 'Guardian', credibility: 0.92 },
    },
    {
      title: 'OpenAI Announces Latest AI Model',
      description: 'Breakthrough capabilities unveiled',
      link: 'https://example.com/ai5',
      publishedAt: new Date(now - 600000).toISOString(), // 10 min ago
      source: { name: 'TechCrunch', credibility: 0.9 },
    },

    // Peak trend: "climate" - steady high mentions
    {
      title: 'Climate Summit Draws World Leaders',
      description: 'Global climate action discussed',
      link: 'https://example.com/climate1',
      publishedAt: new Date(twoHoursAgo).toISOString(),
      source: { name: 'BBC', credibility: 0.98 },
    },
    {
      title: 'Climate Change Impact Worsens',
      description: 'Scientists report alarming trends',
      link: 'https://example.com/climate2',
      publishedAt: new Date(twoHoursAgo + 600000).toISOString(),
      source: { name: 'Nature', credibility: 0.99 },
    },
    {
      title: 'New Climate Technology Shows Promise',
      description: 'Innovation in carbon capture',
      link: 'https://example.com/climate3',
      publishedAt: new Date(oneHourAgo).toISOString(),
      source: { name: 'Science', credibility: 0.98 },
    },
    {
      title: 'Climate Policy Debate Intensifies',
      description: 'Political divide on climate action',
      link: 'https://example.com/climate4',
      publishedAt: new Date(oneHourAgo + 1800000).toISOString(),
      source: { name: 'Guardian', credibility: 0.92 },
    },

    // Declining trend: "election" - decreasing mentions
    {
      title: 'Election Results Analyzed by Experts',
      description: 'Post-election analysis',
      link: 'https://example.com/election1',
      publishedAt: new Date(oneDayAgo).toISOString(),
      source: { name: 'CNN', credibility: 0.88 },
    },
    {
      title: 'Election Turnout Breaks Records',
      description: 'Historic voter participation',
      link: 'https://example.com/election2',
      publishedAt: new Date(oneDayAgo + 3600000).toISOString(),
      source: { name: 'BBC', credibility: 0.98 },
    },
    {
      title: 'Final Election Numbers Released',
      description: 'Official results confirmed',
      link: 'https://example.com/election3',
      publishedAt: new Date(fourHoursAgo).toISOString(),
      source: { name: 'Reuters', credibility: 0.97 },
    },

    // Similar topics for clustering: "technology", "tech"
    {
      title: 'Technology Sector Sees Growth',
      description: 'Tech stocks rally on positive news',
      link: 'https://example.com/tech1',
      publishedAt: new Date(oneHourAgo).toISOString(),
      source: { name: 'Bloomberg', credibility: 0.95 },
    },
    {
      title: 'Tech Companies Face Regulation',
      description: 'Government scrutiny increases',
      link: 'https://example.com/tech2',
      publishedAt: new Date(oneHourAgo + 900000).toISOString(),
      source: { name: 'WSJ', credibility: 0.96 },
    },
    {
      title: 'Emerging Technologies Transform Business',
      description: 'Innovation drives change',
      link: 'https://example.com/tech3',
      publishedAt: new Date(twoHoursAgo).toISOString(),
      source: { name: 'TechCrunch', credibility: 0.9 },
    },

    // Low credibility source (should have lower score)
    {
      title: 'Shocking AI Discovery That Will Blow Your Mind',
      description: "You won't believe this",
      link: 'https://example.com/clickbait',
      publishedAt: new Date(now - 300000).toISOString(), // 5 min ago
      source: { name: 'BlogSpot', credibility: 0.3 },
    },
  ];
}

/**
 * Test basic trending detection
 */
async function testBasicTrending() {
  console.log(`\n${colors.cyan}=== Test 1: Basic Trending Detection ===${colors.reset}\n`);

  const service = new TrendingService({ minMentions: 2, minVelocity: 0.3 });
  const articles = generateSampleArticles();

  const result = service.analyzeTrending(articles, {
    limit: 10,
    includeLifecycle: false,
    includeClusters: false,
  });

  const passed = result.trending.length > 0;
  printResult(
    'Should detect trending topics',
    passed,
    `Found ${result.trending.length} topics from ${articles.length} articles`
  );

  // Check top topic
  if (result.trending.length > 0) {
    const topTopic = result.trending[0];
    console.log(`Top trending topic: "${topTopic.keyword}"`);
    console.log(`  Mentions: ${topTopic.mentions}`);
    console.log(`  Velocity: ${topTopic.velocity.toFixed(2)} mentions/hour`);
    console.log(`  Trend Score: ${topTopic.trendScore.toFixed(3)}`);
    console.log('  Score Breakdown:');
    console.log(`    - Velocity: ${topTopic.scores.velocity.toFixed(3)}`);
    console.log(`    - Volume: ${topTopic.scores.volume.toFixed(3)}`);
    console.log(`    - Recency: ${topTopic.scores.recency.toFixed(3)}`);
    console.log(`    - Credibility: ${topTopic.scores.credibility.toFixed(3)}`);
  }

  return passed;
}

/**
 * Test velocity scoring
 */
async function testVelocityScoring() {
  console.log(`\n${colors.cyan}=== Test 2: Velocity Scoring ===${colors.reset}\n`);

  const service = new TrendingService({ minMentions: 2, minVelocity: 0.1 });
  const articles = generateSampleArticles();

  const result = service.analyzeTrending(articles);

  // Find "AI" topic (should have high velocity - recent mentions)
  const aiTopic = result.trending.find(t => t.keyword === 'ai');

  // Find "election" topic (should have low velocity - old mentions)
  const electionTopic = result.trending.find(t => t.keyword === 'election');

  const aiVelocityHigher =
    aiTopic && electionTopic
      ? aiTopic.velocity > electionTopic.velocity
      : aiTopic && aiTopic.velocity > 1.0; // If no election, just check AI has good velocity

  printResult(
    'Recent topics should have higher velocity',
    aiVelocityHigher,
    aiTopic && electionTopic
      ? `AI velocity: ${aiTopic.velocity.toFixed(2)}, Election velocity: ${electionTopic.velocity.toFixed(2)}`
      : aiTopic
        ? `AI velocity: ${aiTopic.velocity.toFixed(2)} (high velocity confirmed)`
        : 'Topics not found'
  );

  if (aiTopic) {
    console.log('\nAI topic velocity details:');
    console.log(`  Raw velocity: ${aiTopic.velocity.toFixed(2)} mentions/hour`);
    console.log(`  Normalized: ${aiTopic.velocityNormalized.toFixed(3)}`);
    console.log('  Time distribution:');
    console.log(`    - Last hour: ${aiTopic.distribution.lastHour} mentions`);
    console.log(`    - Last 4 hours: ${aiTopic.distribution.last4Hours} mentions`);
    console.log(`    - Last 24 hours: ${aiTopic.distribution.last24Hours} mentions`);
  }

  return aiVelocityHigher;
}

/**
 * Test credibility scoring
 */
async function testCredibilityScoring() {
  console.log(`\n${colors.cyan}=== Test 3: Credibility Scoring ===${colors.reset}\n`);

  const service = new TrendingService({ minMentions: 1, minVelocity: 0.1 });
  const articles = generateSampleArticles();

  const result = service.analyzeTrending(articles);

  // Find "AI" topics - one from high credibility sources, clickbait from low
  const aiTopic = result.trending.find(t => t.keyword === 'ai');

  if (aiTopic) {
    const avgCredibility = aiTopic.scores.credibility;
    const highCredibility = avgCredibility > 0.7; // Should be high due to quality sources

    printResult(
      'High credibility sources should boost score',
      highCredibility,
      `AI topic credibility score: ${avgCredibility.toFixed(3)}`
    );

    console.log('\nAI topic articles by credibility:');
    aiTopic.articles.slice(0, 3).forEach(article => {
      console.log(
        `  - ${article.source} (${article.credibility.toFixed(2)}): ${article.title.slice(0, 60)}...`
      );
    });

    return highCredibility;
  }

  printResult('High credibility sources should boost score', false, 'AI topic not found');
  return false;
}

/**
 * Test lifecycle tracking
 */
async function testLifecycleTracking() {
  console.log(`\n${colors.cyan}=== Test 4: Lifecycle Tracking ===${colors.reset}\n`);

  const service = new TrendingService({ minMentions: 2, minVelocity: 0.1 });
  const articles = generateSampleArticles();

  // First analysis
  service.analyzeTrending(articles, { includeLifecycle: true });

  // Simulate second analysis with same data (should show emerging/rising)
  const result2 = service.analyzeTrending(articles, { includeLifecycle: true });

  const hasLifecycle = result2.trending.every(t => t.lifecycle && t.lifecycle.stage);

  printResult(
    'Topics should have lifecycle stages',
    hasLifecycle,
    `All ${result2.trending.length} topics have lifecycle data`
  );

  console.log('\nLifecycle stages:');
  const stages = {};
  result2.trending.forEach(topic => {
    const { stage } = topic.lifecycle;
    stages[stage] = (stages[stage] || 0) + 1;

    if (topic.keyword === 'ai' || topic.keyword === 'climate' || topic.keyword === 'election') {
      console.log(
        `  - "${topic.keyword}": ${stage} (confidence: ${topic.lifecycle.confidence.toFixed(2)})`
      );
      console.log(`    ${topic.lifecycle.description}`);
    }
  });

  console.log('\nStage distribution:', stages);

  return hasLifecycle;
}

/**
 * Test topic clustering
 */
async function testTopicClustering() {
  console.log(`\n${colors.cyan}=== Test 5: Topic Clustering ===${colors.reset}\n`);

  const service = new TrendingService({
    minMentions: 2,
    minVelocity: 0.1,
    similarityThreshold: 0.5,
  });
  const articles = generateSampleArticles();

  const result = service.analyzeTrending(articles, { includeClusters: true });

  const hasClusters = result.clusters.length > 0;

  printResult(
    'Similar topics should be clustered',
    hasClusters,
    `Found ${result.clusters.length} clusters`
  );

  if (result.clusters.length > 0) {
    console.log('\nTop clusters:');
    result.clusters.slice(0, 3).forEach((cluster, idx) => {
      console.log(`\n${idx + 1}. Cluster: ${cluster.mainTopic.toUpperCase()}`);
      console.log(`   Total mentions: ${cluster.totalMentions}`);
      console.log(`   Avg trend score: ${cluster.avgTrendScore.toFixed(3)}`);
      console.log(`   Related topics (${cluster.topics.length}):`);
      cluster.topics.slice(0, 5).forEach(topic => {
        console.log(
          `     - ${topic.keyword} (${topic.mentions} mentions, score: ${topic.trendScore.toFixed(3)})`
        );
      });
    });
  }

  return hasClusters;
}

/**
 * Test time window filtering
 */
async function testTimeWindows() {
  console.log(`\n${colors.cyan}=== Test 6: Time Window Filtering ===${colors.reset}\n`);

  const service = new TrendingService({
    minMentions: 2,
    minVelocity: 0.1,
    shortWindow: 3600000, // 1 hour
    mediumWindow: 14400000, // 4 hours
  });
  const articles = generateSampleArticles();

  const result = service.analyzeTrending(articles);

  // Recent topics should score higher
  const recentTopics = result.trending.filter(t => t.scores.recency > 0.7);

  printResult(
    'Recent topics should have high recency scores',
    recentTopics.length > 0,
    `${recentTopics.length} topics with recency > 0.7`
  );

  console.log('\nRecency scores (top 5):');
  result.trending.slice(0, 5).forEach(topic => {
    console.log(
      `  - ${topic.keyword}: ${topic.scores.recency.toFixed(3)} ` +
        `(first: ${new Date(topic.firstSeen).toLocaleTimeString()}, ` +
        `last: ${new Date(topic.lastSeen).toLocaleTimeString()})`
    );
  });

  return recentTopics.length > 0;
}

/**
 * Test similarity calculation
 */
async function testSimilarityCalculation() {
  console.log(`\n${colors.cyan}=== Test 7: Similarity Calculation ===${colors.reset}\n`);

  const service = new TrendingService();

  const tests = [
    { word1: 'technology', word2: 'tech', expected: '> 0.5 (contains)' },
    { word1: 'climate', word2: 'weather', expected: '< 0.5 (different)' },
    { word1: 'election', word2: 'elections', expected: '> 0.8 (similar)' },
    { word1: 'artificial', word2: 'intelligence', expected: '< 0.3 (different)' },
  ];

  let allPassed = true;
  console.log();

  tests.forEach(test => {
    const similarity = service.calculateSimilarity(test.word1, test.word2);
    console.log(
      `Similarity("${test.word1}", "${test.word2}"): ${similarity.toFixed(3)} ${test.expected}`
    );

    // Basic validation
    if (similarity < 0 || similarity > 1) {
      allPassed = false;
    }
  });

  printResult(
    'Similarity scores should be between 0 and 1',
    allPassed,
    'All similarity scores valid'
  );

  return allPassed;
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log(`\n${colors.blue}╔════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.blue}║  Enhanced Trending Detection Test Suite  ║${colors.reset}`);
  console.log(`${colors.blue}╚════════════════════════════════════════════╝${colors.reset}`);

  const results = {
    basicTrending: false,
    velocityScoring: false,
    credibilityScoring: false,
    lifecycleTracking: false,
    topicClustering: false,
    timeWindows: false,
    similarity: false,
  };

  try {
    results.basicTrending = await testBasicTrending();
    results.velocityScoring = await testVelocityScoring();
    results.credibilityScoring = await testCredibilityScoring();
    results.lifecycleTracking = await testLifecycleTracking();
    results.topicClustering = await testTopicClustering();
    results.timeWindows = await testTimeWindows();
    results.similarity = await testSimilarityCalculation();

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
      console.log(
        `${colors.green}✓ All enhanced trending detection tests passed!${colors.reset}\n`
      );
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
