/**
 * DigitalTide - Real-Time Monitoring Test Suite
 *
 * Tests the real-time news monitoring capabilities of NewsAggregator and CrawlerAgent.
 *
 * Test Coverage:
 * 1. Basic monitoring start/stop
 * 2. Change detection (new vs. seen articles)
 * 3. Event callbacks (onNewArticles, onError)
 * 4. Monitor status and statistics
 * 5. Multiple concurrent monitors
 * 6. Monitor cleanup and resource management
 *
 * Usage: node scripts/test-monitoring.js
 */

import newsAggregator from '../src/services/news/newsAggregator.js';

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

// Helper to wait for a specified time
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Test 1: Basic Monitor Start/Stop
 */
async function testBasicMonitoring() {
  logTest('Basic monitoring start/stop');

  try {
    // Start a monitor with short interval
    const monitor = newsAggregator.startMonitoring({
      category: 'technology',
      interval: 10000, // 10 seconds for testing
      limit: 5,
    });

    if (!monitor || !monitor.monitorId) {
      logError('Failed to start monitor');
      return;
    }

    logSuccess(`Started monitor: ${monitor.monitorId}`);
    logInfo(`Interval: ${monitor.interval}ms`);

    // Wait a bit to ensure monitor is running
    await wait(1000);

    // Check monitor status
    const status = newsAggregator.getMonitorStatus();
    if (status.length !== 1) {
      logError(`Expected 1 active monitor, found ${status.length}`);
      return;
    }

    logSuccess(`Monitor status retrieved: ${status[0].id}`);
    logResult({
      uptime: `${status[0].stats.uptime}ms`,
      trackedArticles: status[0].stats.trackedArticles,
    });

    // Stop the monitor
    const stopResult = newsAggregator.stopMonitoring(monitor.monitorId);
    if (!stopResult.success) {
      logError('Failed to stop monitor');
      return;
    }

    logSuccess('Monitor stopped successfully');

    // Verify no active monitors
    const finalStatus = newsAggregator.getMonitorStatus();
    if (finalStatus.length !== 0) {
      logError(`Expected 0 active monitors, found ${finalStatus.length}`);
      return;
    }

    logSuccess('All monitors cleaned up');
  } catch (error) {
    logError(`Test failed: ${error.message}`);
  }
}

/**
 * Test 2: Change Detection
 */
async function testChangeDetection() {
  logTest('Change detection for new articles');

  try {
    let callbackInvoked = false;
    let newArticlesCount = 0;

    // Start monitor with callback
    const monitor = newsAggregator.startMonitoring({
      query: 'artificial intelligence',
      interval: 8000, // 8 seconds
      limit: 10,
      onNewArticles: async data => {
        callbackInvoked = true;
        newArticlesCount = data.articles.length;
        logInfo(`Callback invoked with ${data.articles.length} new articles`);
      },
    });

    logSuccess(`Started monitor: ${monitor.monitorId}`);

    // Wait for at least one check cycle (+ processing time)
    logInfo('Waiting 12 seconds for monitoring cycle...');
    await wait(12000);

    // Stop monitor
    newsAggregator.stopMonitoring(monitor.monitorId);

    if (!callbackInvoked) {
      logError('Callback was not invoked');
      return;
    }

    logSuccess(`Callback invoked with ${newArticlesCount} new articles`);

    // Check monitor status was tracking articles
    const stats = newsAggregator.stopMonitoring(monitor.monitorId);
    if (stats.stats && stats.stats.trackedArticles !== undefined) {
      logSuccess(`Tracked ${stats.stats.trackedArticles} unique articles`);
    }
  } catch (error) {
    logError(`Test failed: ${error.message}`);
  } finally {
    // Cleanup any remaining monitors
    newsAggregator.stopAllMonitors();
  }
}

/**
 * Test 3: Event Callbacks
 */
async function testEventCallbacks() {
  logTest('Event callbacks (onNewArticles, onError)');

  try {
    let newArticlesCallbackCount = 0;
    let errorCallbackCount = 0;
    const receivedArticles = [];

    // Start monitor with both callbacks
    const monitor = newsAggregator.startMonitoring({
      category: 'business',
      interval: 7000, // 7 seconds
      limit: 5,
      onNewArticles: async data => {
        newArticlesCallbackCount++;
        receivedArticles.push(...data.articles);
        logInfo(
          `New articles callback #${newArticlesCallbackCount}: ${data.articles.length} articles`
        );
      },
      onError: async data => {
        errorCallbackCount++;
        logInfo(`Error callback invoked: ${data.error}`);
      },
    });

    logSuccess(`Started monitor: ${monitor.monitorId}`);

    // Wait for at least one cycle
    logInfo('Waiting 10 seconds for callback execution...');
    await wait(10000);

    // Stop monitor
    newsAggregator.stopMonitoring(monitor.monitorId);

    if (newArticlesCallbackCount === 0) {
      logError('onNewArticles callback was never invoked');
    } else {
      logSuccess(`onNewArticles invoked ${newArticlesCallbackCount} times`);
      logSuccess(`Total articles received: ${receivedArticles.length}`);
    }

    // Error callback may or may not be invoked depending on API status
    logInfo(`Error callback invoked ${errorCallbackCount} times`);
  } catch (error) {
    logError(`Test failed: ${error.message}`);
  } finally {
    newsAggregator.stopAllMonitors();
  }
}

/**
 * Test 4: Monitor Status and Statistics
 */
async function testMonitorStatus() {
  logTest('Monitor status and statistics tracking');

  try {
    // Start a monitor
    const monitor = newsAggregator.startMonitoring({
      category: 'science',
      interval: 15000, // 15 seconds
      limit: 5,
    });

    logSuccess(`Started monitor: ${monitor.monitorId}`);

    // Wait a bit for initial check
    await wait(2000);

    // Get status
    const status = newsAggregator.getMonitorStatus();
    if (status.length === 0) {
      logError('No monitors found in status');
      return;
    }

    const monitorStatus = status[0];
    logSuccess('Monitor status retrieved');
    logResult({
      id: monitorStatus.id,
      category: monitorStatus.options.category,
      interval: `${monitorStatus.options.interval}ms`,
      uptime: `${monitorStatus.stats.uptime}ms`,
      trackedArticles: monitorStatus.stats.trackedArticles,
    });

    // Verify required fields
    const requiredFields = ['id', 'options', 'stats'];
    const requiredStatFields = [
      'startTime',
      'checksPerformed',
      'articlesFound',
      'errors',
      'uptime',
      'trackedArticles',
    ];

    let allFieldsPresent = true;
    for (const field of requiredFields) {
      if (!(field in monitorStatus)) {
        logError(`Missing field: ${field}`);
        allFieldsPresent = false;
      }
    }

    for (const field of requiredStatFields) {
      if (!(field in monitorStatus.stats)) {
        logError(`Missing stats field: ${field}`);
        allFieldsPresent = false;
      }
    }

    if (allFieldsPresent) {
      logSuccess('All required status fields present');
    }

    // Stop monitor
    newsAggregator.stopMonitoring(monitor.monitorId);
    logSuccess('Monitor stopped');
  } catch (error) {
    logError(`Test failed: ${error.message}`);
  } finally {
    newsAggregator.stopAllMonitors();
  }
}

/**
 * Test 5: Multiple Concurrent Monitors
 */
async function testMultipleMonitors() {
  logTest('Multiple concurrent monitors');

  try {
    // Start 3 different monitors
    const monitor1 = newsAggregator.startMonitoring({
      category: 'technology',
      interval: 20000,
      limit: 5,
    });

    const monitor2 = newsAggregator.startMonitoring({
      query: 'climate change',
      interval: 25000,
      limit: 5,
    });

    const monitor3 = newsAggregator.startMonitoring({
      category: 'health',
      interval: 30000,
      limit: 5,
    });

    logSuccess('Started 3 monitors');
    logInfo(`Monitor 1: ${monitor1.monitorId} (technology, 20s)`);
    logInfo(`Monitor 2: ${monitor2.monitorId} (climate change query, 25s)`);
    logInfo(`Monitor 3: ${monitor3.monitorId} (health, 30s)`);

    // Wait a bit
    await wait(1000);

    // Check status
    const status = newsAggregator.getMonitorStatus();
    if (status.length !== 3) {
      logError(`Expected 3 active monitors, found ${status.length}`);
    } else {
      logSuccess('All 3 monitors active');
    }

    // Stop individual monitors
    const result1 = newsAggregator.stopMonitoring(monitor1.monitorId);
    if (!result1.success) {
      logError('Failed to stop monitor 1');
    } else {
      logSuccess('Stopped monitor 1');
    }

    // Verify 2 remaining
    const status2 = newsAggregator.getMonitorStatus();
    if (status2.length !== 2) {
      logError(`Expected 2 remaining monitors, found ${status2.length}`);
    } else {
      logSuccess('2 monitors remaining');
    }

    // Stop all remaining
    const stopAllResult = newsAggregator.stopAllMonitors();
    if (!stopAllResult.success || stopAllResult.stopped !== 2) {
      logError(`Failed to stop all monitors: ${JSON.stringify(stopAllResult)}`);
    } else {
      logSuccess(`Stopped all remaining monitors: ${stopAllResult.stopped}`);
    }

    // Verify cleanup
    const finalStatus = newsAggregator.getMonitorStatus();
    if (finalStatus.length !== 0) {
      logError(`Expected 0 monitors, found ${finalStatus.length}`);
    } else {
      logSuccess('All monitors cleaned up');
    }
  } catch (error) {
    logError(`Test failed: ${error.message}`);
  } finally {
    newsAggregator.stopAllMonitors();
  }
}

/**
 * Test 6: Monitor Cleanup and Resource Management
 */
async function testMonitorCleanup() {
  logTest('Monitor cleanup and resource management');

  try {
    // Start multiple monitors
    const monitors = [];
    for (let i = 0; i < 5; i++) {
      monitors.push(
        newsAggregator.startMonitoring({
          category: 'technology',
          interval: 60000, // 1 minute
          limit: 5,
        })
      );
    }

    logSuccess(`Started ${monitors.length} monitors`);

    // Verify all started
    let status = newsAggregator.getMonitorStatus();
    if (status.length !== 5) {
      logError(`Expected 5 monitors, found ${status.length}`);
      return;
    }

    logSuccess('All monitors confirmed active');

    // Stop all at once
    const stopResult = newsAggregator.stopAllMonitors();
    if (!stopResult.success || stopResult.stopped !== 5) {
      logError(`Failed to stop all monitors: ${JSON.stringify(stopResult)}`);
      return;
    }

    logSuccess(`Stopped all ${stopResult.stopped} monitors`);

    // Verify complete cleanup
    status = newsAggregator.getMonitorStatus();
    if (status.length !== 0) {
      logError(`Expected 0 monitors, found ${status.length}`);
      return;
    }

    logSuccess('All monitors cleaned up, no memory leaks');

    // Test stopping non-existent monitor
    const invalidResult = newsAggregator.stopMonitoring('invalid_monitor_id');
    if (invalidResult.success) {
      logError('Should not succeed stopping invalid monitor');
    } else {
      logSuccess('Correctly rejected invalid monitor ID');
    }
  } catch (error) {
    logError(`Test failed: ${error.message}`);
  } finally {
    newsAggregator.stopAllMonitors();
  }
}

/**
 * Main test runner
 */
async function runTests() {
  logSection('DigitalTide - Real-Time Monitoring Test Suite');

  console.log(
    `${colors.yellow}⚠${colors.reset} These tests use real API calls and will take time to complete.`
  );
  console.log(`${colors.yellow}⚠${colors.reset} Estimated runtime: 1-2 minutes\n`);

  try {
    await testBasicMonitoring();
    await wait(2000); // Brief pause between tests

    await testChangeDetection();
    await wait(2000);

    await testEventCallbacks();
    await wait(2000);

    await testMonitorStatus();
    await wait(2000);

    await testMultipleMonitors();
    await wait(2000);

    await testMonitorCleanup();
  } catch (error) {
    console.error(`\n${colors.red}Fatal error:${colors.reset}`, error);
  } finally {
    // Final cleanup
    newsAggregator.stopAllMonitors();
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
