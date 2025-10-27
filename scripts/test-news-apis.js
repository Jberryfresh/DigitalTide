import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Test script for verifying News API connections
 * Tests: SerpAPI (Google News), NewsAPI.org, and MediaStack
 */

const testAPIs = async () => {
  console.log('╔══════════════════════════════════════╗');
  console.log('║  Testing DigitalTide News APIs      ║');
  console.log('╚══════════════════════════════════════╝\n');

  let successCount = 0;
  let failureCount = 0;

  // Test SerpAPI (Google News)
  console.log('1️⃣  Testing SerpAPI (Google News)...');
  console.log('─'.repeat(40));
  try {
    if (!process.env.SERPAPI_KEY && !process.env.GOOGLE_NEWS_API_KEY) {
      throw new Error('API key not found in environment');
    }

    const apiKey = process.env.SERPAPI_KEY || process.env.GOOGLE_NEWS_API_KEY;
    const serpResponse = await axios.get('https://serpapi.com/search.json', {
      params: {
        engine: 'google_news',
        q: 'technology',
        gl: 'us',
        hl: 'en',
        num: 5,
        api_key: apiKey
      },
      timeout: 10000
    });

    const results = serpResponse.data.news_results || [];
    console.log(`✅ Status: SUCCESS`);
    console.log(`📊 Results: ${results.length} articles`);
    if (results.length > 0) {
      console.log(`📰 Sample: "${results[0].title.substring(0, 60)}..."`);
      console.log(`🔗 Source: ${results[0].source}`);
    }
    console.log(`⏱️  Response time: ${serpResponse.headers['x-response-time'] || 'N/A'}`);
    successCount++;
  } catch (error) {
    console.log(`❌ Status: FAILED`);
    console.log(`💥 Error: ${error.message}`);
    if (error.response) {
      console.log(`📍 Status Code: ${error.response.status}`);
      console.log(`📝 Details: ${error.response.data?.error || 'No details'}`);
    }
    failureCount++;
  }

  console.log('\n');

  // Test NewsAPI.org
  console.log('2️⃣  Testing NewsAPI.org...');
  console.log('─'.repeat(40));
  try {
    if (!process.env.NEWSAPI_KEY) {
      throw new Error('API key not found in environment');
    }

    const newsResponse = await axios.get('https://newsapi.org/v2/top-headlines', {
      params: {
        country: 'us',
        category: 'technology',
        pageSize: 5,
        apiKey: process.env.NEWSAPI_KEY
      },
      timeout: 10000
    });

    const { status, totalResults, articles } = newsResponse.data;
    console.log(`✅ Status: ${status.toUpperCase()}`);
    console.log(`📊 Total Results: ${totalResults}`);
    console.log(`📄 Returned: ${articles.length} articles`);
    if (articles.length > 0) {
      console.log(`📰 Sample: "${articles[0].title.substring(0, 60)}..."`);
      console.log(`🔗 Source: ${articles[0].source.name}`);
    }
    successCount++;
  } catch (error) {
    console.log(`❌ Status: FAILED`);
    console.log(`💥 Error: ${error.message}`);
    if (error.response) {
      console.log(`📍 Status Code: ${error.response.status}`);
      console.log(`📝 Details: ${error.response.data?.message || 'No details'}`);
    }
    failureCount++;
  }

  console.log('\n');

  // Test MediaStack
  console.log('3️⃣  Testing MediaStack...');
  console.log('─'.repeat(40));
  try {
    if (!process.env.MEDIASTACK_API_KEY) {
      throw new Error('API key not found in environment');
    }

    const mediaResponse = await axios.get('http://api.mediastack.com/v1/news', {
      params: {
        access_key: process.env.MEDIASTACK_API_KEY,
        countries: 'us',
        categories: 'technology',
        limit: 5,
        languages: 'en'
      },
      timeout: 10000
    });

    const { pagination, data } = mediaResponse.data;
    console.log(`✅ Status: SUCCESS`);
    console.log(`📊 Total Results: ${pagination.total}`);
    console.log(`📄 Returned: ${data.length} articles`);
    if (data.length > 0) {
      console.log(`📰 Sample: "${data[0].title.substring(0, 60)}..."`);
      console.log(`🔗 Source: ${data[0].source}`);
    }
    successCount++;
  } catch (error) {
    console.log(`❌ Status: FAILED`);
    console.log(`💥 Error: ${error.message}`);
    if (error.response) {
      console.log(`📍 Status Code: ${error.response.status}`);
      const errorData = error.response.data?.error;
      if (errorData) {
        console.log(`📝 Details: ${errorData.message || errorData.info || 'No details'}`);
      }
    }
    failureCount++;
  }

  // Summary
  console.log('\n');
  console.log('╔══════════════════════════════════════╗');
  console.log('║           Test Summary              ║');
  console.log('╚══════════════════════════════════════╝');
  console.log(`✅ Successful: ${successCount}/3`);
  console.log(`❌ Failed: ${failureCount}/3`);
  console.log('');

  if (successCount === 3) {
    console.log('🎉 All APIs are working correctly!');
    console.log('✓ You can now use these services in DigitalTide');
  } else if (successCount > 0) {
    console.log('⚠️  Some APIs failed. Check the errors above.');
    console.log('💡 Tip: Verify your API keys in the .env file');
  } else {
    console.log('❌ All APIs failed!');
    console.log('');
    console.log('Troubleshooting steps:');
    console.log('1. Check that .env file exists and contains API keys');
    console.log('2. Verify API keys are correct and active');
    console.log('3. Ensure you have internet connectivity');
    console.log('4. Check if you\'ve exceeded rate limits');
    console.log('');
    console.log('Environment variables expected:');
    console.log('- SERPAPI_KEY or GOOGLE_NEWS_API_KEY');
    console.log('- NEWSAPI_KEY');
    console.log('- MEDIASTACK_API_KEY');
  }

  console.log('');
  console.log('For more information, see: docs/NEWS_API_SETUP.md');
  console.log('');

  process.exit(failureCount > 0 ? 1 : 0);
};

// Run the tests
testAPIs().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
