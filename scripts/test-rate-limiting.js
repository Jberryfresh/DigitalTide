/**
 * Rate Limiting Test Script
 * Tests that rate limiters are working correctly on API endpoints
 */

import axios from 'axios';
import chalk from 'chalk';

const BASE_URL = 'http://localhost:3000';
const VERBOSE = process.argv.includes('--verbose');

/**
 * Test rate limiter on a specific endpoint
 */
async function testRateLimit(config) {
  const { name, endpoint, method = 'GET', data = null, expectedLimit, windowMs } = config;

  console.log(chalk.blue(`\n🧪 Testing ${name}...`));
  console.log(chalk.gray(`   Endpoint: ${method} ${endpoint}`));
  console.log(chalk.gray(`   Expected limit: ${expectedLimit} requests per ${windowMs / 1000}s`));

  const results = {
    success: 0,
    rateLimited: 0,
    errors: 0,
    firstRateLimitAt: null,
  };

  // Make requests until we hit the rate limit
  const requestsToMake = expectedLimit + 5; // Go over limit to ensure we get rate limited

  for (let i = 1; i <= requestsToMake; i++) {
    try {
      const config = {
        method,
        url: `${BASE_URL}${endpoint}`,
        validateStatus: () => true, // Don't throw on any status
      };

      if (data) {
        config.data = data;
        config.headers = { 'Content-Type': 'application/json' };
      }

      const response = await axios(config);

      if (response.status === 429) {
        results.rateLimited++;
        if (!results.firstRateLimitAt) {
          results.firstRateLimitAt = i;
        }

        if (VERBOSE) {
          console.log(chalk.yellow(`   Request ${i}: Rate limited (429)`));
          console.log(chalk.gray(`   Message: ${response.data?.error?.message || 'N/A'}`));
          console.log(
            chalk.gray(
              `   RateLimit-Remaining: ${response.headers['ratelimit-remaining'] || 'N/A'}`
            )
          );
        }
      } else if (response.status >= 200 && response.status < 300) {
        results.success++;
        if (VERBOSE) {
          console.log(chalk.green(`   Request ${i}: Success (${response.status})`));
          console.log(
            chalk.gray(
              `   RateLimit-Remaining: ${response.headers['ratelimit-remaining'] || 'N/A'}`
            )
          );
        }
      } else {
        results.errors++;
        if (VERBOSE) {
          console.log(chalk.red(`   Request ${i}: Error (${response.status})`));
        }
      }

      // Small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 50));
    } catch (error) {
      results.errors++;
      if (VERBOSE) {
        console.log(chalk.red(`   Request ${i}: Exception - ${error.message}`));
      }
    }
  }

  // Analyze results
  console.log(chalk.cyan('\n   Results:'));
  console.log(chalk.gray(`   Successful requests: ${results.success}`));
  console.log(chalk.gray(`   Rate limited requests: ${results.rateLimited}`));
  console.log(chalk.gray(`   Errors: ${results.errors}`));
  console.log(chalk.gray(`   First rate limit at request: ${results.firstRateLimitAt || 'N/A'}`));

  // Determine if test passed
  const passed =
    results.rateLimited > 0 && // We got rate limited
    results.firstRateLimitAt &&
    results.firstRateLimitAt <= expectedLimit + 2; // Allow small margin for timing

  if (passed) {
    console.log(chalk.green('   ✅ PASSED - Rate limiter is working correctly'));
  } else {
    console.log(chalk.red('   ❌ FAILED - Rate limiter may not be working as expected'));
    if (results.rateLimited === 0) {
      console.log(chalk.yellow('   No rate limiting occurred - check if middleware is applied'));
    }
  }

  return { ...results, passed };
}

/**
 * Main test suite
 */
async function runTests() {
  console.log(chalk.bold.cyan('\n╔════════════════════════════════════════════════════════════╗'));
  console.log(chalk.bold.cyan('║          DigitalTide Rate Limiting Test Suite             ║'));
  console.log(chalk.bold.cyan('╚════════════════════════════════════════════════════════════╝\n'));

  // Check if server is running
  try {
    await axios.get(`${BASE_URL}/health`);
    console.log(chalk.green('✅ Server is running\n'));
  } catch (error) {
    console.log(chalk.red('❌ Server is not running!'));
    console.log(chalk.yellow('Please start the server with: npm run dev\n'));
    process.exit(1);
  }

  const tests = [
    {
      name: 'General API Limiter (Articles List)',
      endpoint: '/api/v1/articles',
      expectedLimit: 1000,
      windowMs: 3600000, // 1 hour - too long to test, we'll just verify it works
    },
    {
      name: 'Search Limiter (Article Search)',
      endpoint: '/api/v1/search?q=test',
      expectedLimit: 30,
      windowMs: 60000, // 1 minute
    },
    {
      name: 'Search Limiter (Search Suggestions)',
      endpoint: '/api/v1/search/suggestions?q=te',
      expectedLimit: 30,
      windowMs: 60000, // 1 minute
    },
    {
      name: 'News API Limiter (Fetch News)',
      endpoint: '/api/v1/news/fetch?query=technology&limit=5',
      expectedLimit: 10,
      windowMs: 60000, // 1 minute
    },
    {
      name: 'Auth Limiter (Register)',
      endpoint: '/api/v1/auth/register',
      method: 'POST',
      data: { email: 'test@example.com', password: 'Test123!' },
      expectedLimit: 5,
      windowMs: 900000, // 15 minutes
    },
  ];

  const results = [];

  for (const test of tests) {
    // Skip long-duration tests unless verbose
    if (test.windowMs > 120000 && !VERBOSE) {
      console.log(chalk.yellow(`\n⏭️  Skipping ${test.name} (window too long)`));
      console.log(chalk.gray('   Run with --verbose to test all endpoints (may take longer)'));
      continue;
    }

    const result = await testRateLimit(test);
    results.push({ name: test.name, ...result });

    // Wait before next test to avoid interference
    console.log(chalk.gray('\n   Waiting 5 seconds before next test...'));
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  // Summary
  console.log(
    chalk.bold.cyan('\n\n╔════════════════════════════════════════════════════════════╗')
  );
  console.log(chalk.bold.cyan('║                       Test Summary                         ║'));
  console.log(chalk.bold.cyan('╚════════════════════════════════════════════════════════════╝\n'));

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const skipped = tests.length - results.length;

  console.log(chalk.green(`✅ Passed: ${passed}`));
  console.log(chalk.red(`❌ Failed: ${failed}`));
  console.log(chalk.yellow(`⏭️  Skipped: ${skipped}`));

  if (failed === 0 && passed > 0) {
    console.log(chalk.bold.green('\n🎉 All rate limiting tests passed!\n'));
    process.exit(0);
  } else if (passed > 0) {
    console.log(chalk.bold.yellow('\n⚠️  Some tests failed. Check the results above.\n'));
    process.exit(1);
  } else {
    console.log(chalk.bold.red('\n❌ Rate limiting may not be working correctly.\n'));
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error(chalk.red('\n❌ Test suite error:'), error.message);
  process.exit(1);
});
