# News API Services Setup Guide

## Overview

DigitalTide uses multiple news API services to aggregate content from various sources. This document provides step-by-step instructions for creating accounts and obtaining API keys for three primary news APIs.

**Services Covered:**
1. Google News API (via SerpAPI or NewsAPI.ai)
2. NewsAPI.org
3. MediaStack

---

## Table of Contents

1. [Service Comparison](#service-comparison)
2. [Google News API Setup](#google-news-api-setup)
3. [NewsAPI.org Setup](#newsapiorg-setup)
4. [MediaStack Setup](#mediastack-setup)
5. [Configuration](#configuration)
6. [Testing APIs](#testing-apis)
7. [Rate Limits & Pricing](#rate-limits--pricing)
8. [Best Practices](#best-practices)

---

## Service Comparison

| Feature | Google News (SerpAPI) | NewsAPI.org | MediaStack |
|---------|---------------------|-------------|------------|
| **Free Tier** | 100 searches/month | 100 requests/day | 500 requests/month |
| **Sources** | Google News aggregation | 80,000+ sources | 7,500+ sources |
| **Languages** | 150+ | 50+ | 50+ |
| **Categories** | Yes | Yes | Yes |
| **Historical Data** | Limited | 1 month free | 24 hours free |
| **Real-time** | Yes | Yes | Yes |
| **Best For** | Breaking news, trends | Developer-friendly | Reliable, stable |
| **Price (Paid)** | $50/month (5,000 searches) | $449/month (1M requests) | $9.99/month (10K requests) |

**Recommendation**: Use all three for redundancy and broader coverage.

---

## Google News API Setup

### Option 1: SerpAPI (Recommended)

SerpAPI provides a clean interface to Google News results.

#### Step 1: Create Account

1. Go to [https://serpapi.com/](https://serpapi.com/)
2. Click **"Sign Up"** in the top right
3. Fill in your details:
   - Email address
   - Password
   - Name
4. Verify your email address

#### Step 2: Get API Key

1. After login, you'll be redirected to the dashboard
2. Your API key is displayed prominently at the top
3. Or navigate to: [https://serpapi.com/manage-api-key](https://serpapi.com/manage-api-key)
4. Copy your API key (format: `abc123...`)

#### Step 3: Verify Free Tier

- **Free Plan**: 100 searches per month
- Check usage at: [https://serpapi.com/account](https://serpapi.com/account)
- No credit card required for free tier

#### Step 4: Test the API

```bash
# PowerShell
$apiKey = "YOUR_SERPAPI_KEY"
$url = "https://serpapi.com/search.json?engine=google_news&q=technology&api_key=$apiKey"
Invoke-RestMethod -Uri $url | ConvertTo-Json

# Expected Response:
# {
#   "news_results": [
#     {
#       "title": "...",
#       "link": "...",
#       "source": "...",
#       "date": "...",
#       "snippet": "..."
#     }
#   ]
# }
```

#### API Parameters

```javascript
// Example SerpAPI request
const params = {
  engine: 'google_news',
  q: 'artificial intelligence',      // Search query
  gl: 'us',                           // Country (us, uk, ca, etc.)
  hl: 'en',                           // Language
  num: 10,                            // Results per page (1-100)
  tbm: 'nws',                         // News search
  api_key: process.env.SERPAPI_KEY
};
```

### Option 2: NewsAPI.ai

Alternative Google News scraper with similar functionality.

1. Visit: [https://newsapi.ai/](https://newsapi.ai/)
2. Sign up for free account (1,000 articles/day)
3. Get API key from dashboard
4. Documentation: [https://newsapi.ai/documentation](https://newsapi.ai/documentation)

---

## NewsAPI.org Setup

NewsAPI.org is one of the most popular news APIs with extensive coverage.

### Step 1: Create Account

1. Go to [https://newsapi.org/](https://newsapi.org/)
2. Click **"Get API Key"** button
3. Fill in the registration form:
   - First Name
   - Email Address
   - Password
   - Agree to terms
4. Click **"Submit"**

### Step 2: Verify Email

1. Check your email inbox
2. Click the verification link
3. You'll be redirected to the dashboard

### Step 3: Get API Key

1. Upon login, your API key is displayed
2. Or go to: [https://newsapi.org/account](https://newsapi.org/account)
3. Copy your API key (format: `abc123def456...`)
4. **Important**: Store securely, cannot be recovered if lost

### Step 4: Choose Plan

**Developer Plan (Free)**:
- ✅ 100 requests per day
- ✅ Up to 1 month of historical data
- ✅ All endpoints
- ❌ HTTPS only in production
- ❌ News articles only (no blogs)

**Business Plan ($449/month)**:
- ✅ 250,000 requests per day
- ✅ Full historical archive
- ✅ Commercial use
- ✅ Priority support

### Step 5: Test the API

```bash
# PowerShell
$apiKey = "YOUR_NEWSAPI_KEY"
$url = "https://newsapi.org/v2/top-headlines?country=us&apiKey=$apiKey"
Invoke-RestMethod -Uri $url | ConvertTo-Json -Depth 5

# Expected Response:
# {
#   "status": "ok",
#   "totalResults": 38,
#   "articles": [...]
# }
```

### API Endpoints

#### 1. Top Headlines
```javascript
// GET /v2/top-headlines
const response = await axios.get('https://newsapi.org/v2/top-headlines', {
  params: {
    country: 'us',              // us, gb, ca, au, etc.
    category: 'technology',      // business, entertainment, health, science, sports, technology
    pageSize: 20,               // 1-100
    page: 1,
    apiKey: process.env.NEWSAPI_KEY
  }
});
```

#### 2. Everything (Search)
```javascript
// GET /v2/everything
const response = await axios.get('https://newsapi.org/v2/everything', {
  params: {
    q: 'artificial intelligence',
    language: 'en',
    sortBy: 'publishedAt',      // relevancy, popularity, publishedAt
    from: '2024-10-20',
    to: '2024-10-26',
    pageSize: 20,
    page: 1,
    apiKey: process.env.NEWSAPI_KEY
  }
});
```

#### 3. Sources
```javascript
// GET /v2/top-headlines/sources
const response = await axios.get('https://newsapi.org/v2/top-headlines/sources', {
  params: {
    language: 'en',
    country: 'us',
    apiKey: process.env.NEWSAPI_KEY
  }
});
```

### Available Categories
- `business`
- `entertainment`
- `general`
- `health`
- `science`
- `sports`
- `technology`

### Supported Countries
US, GB, CA, AU, IN, DE, FR, IT, ES, NL, NO, SE, and 40+ more

---

## MediaStack Setup

MediaStack offers reliable news aggregation with good free tier.

### Step 1: Create Account

1. Go to [https://mediastack.com/](https://mediastack.com/)
2. Click **"Get Free API Key"** or **"Sign Up Free"**
3. Fill in registration:
   - Email address
   - Password
   - Agree to terms
4. Click **"Create Account"**

### Step 2: Verify Email

1. Check your email for verification link
2. Click to verify account
3. Login to dashboard

### Step 3: Get API Key

1. After login, you're on the dashboard
2. Your API key is displayed under "Your API Access Key"
3. Or navigate to: [https://mediastack.com/dashboard](https://mediastack.com/dashboard)
4. Copy your access key (format: `abc123def456...`)

### Step 4: Choose Plan

**Free Plan**:
- ✅ 500 requests per month
- ✅ Live news data
- ✅ 7,500+ sources
- ✅ 50 countries
- ❌ HTTP only (no HTTPS)
- ❌ Historical data limited to 24 hours

**Basic Plan ($9.99/month)**:
- ✅ 10,000 requests per month
- ✅ HTTPS encryption
- ✅ Historical data (up to 1 year)
- ✅ Category & keyword filtering

**Professional Plan ($49.99/month)**:
- ✅ 100,000 requests per month
- ✅ All features
- ✅ Priority support

### Step 5: Test the API

```bash
# PowerShell
$apiKey = "YOUR_MEDIASTACK_KEY"
$url = "http://api.mediastack.com/v1/news?access_key=$apiKey&countries=us&limit=10"
Invoke-RestMethod -Uri $url | ConvertTo-Json -Depth 5

# Expected Response:
# {
#   "pagination": {...},
#   "data": [
#     {
#       "title": "...",
#       "description": "...",
#       "url": "...",
#       "source": "...",
#       "published_at": "..."
#     }
#   ]
# }
```

### API Endpoints

#### Live News
```javascript
// GET /v1/news
const response = await axios.get('http://api.mediastack.com/v1/news', {
  params: {
    access_key: process.env.MEDIASTACK_API_KEY,
    countries: 'us,gb,ca',           // Comma-separated country codes
    categories: 'technology,science', // business, entertainment, general, health, science, sports, technology
    languages: 'en',                 // Language codes
    keywords: 'AI',                  // Search keywords
    sort: 'published_desc',          // published_desc, published_asc, popularity
    limit: 25,                       // 1-100
    offset: 0                        // Pagination offset
  }
});
```

#### News Sources
```javascript
// GET /v1/sources
const response = await axios.get('http://api.mediastack.com/v1/sources', {
  params: {
    access_key: process.env.MEDIASTACK_API_KEY,
    countries: 'us',
    categories: 'technology'
  }
});
```

### Available Categories
- `general`
- `business`
- `entertainment`
- `health`
- `science`
- `sports`
- `technology`

---

## Configuration

### Environment Variables

Add these to your `.env` file:

```bash
# Google News API (SerpAPI)
SERPAPI_KEY=your_serpapi_key_here
GOOGLE_NEWS_API_KEY=your_serpapi_key_here  # Alias for consistency

# NewsAPI.org
NEWSAPI_KEY=your_newsapi_key_here

# MediaStack
MEDIASTACK_API_KEY=your_mediastack_key_here

# API Configuration
NEWS_API_RATE_LIMIT=100          # Requests per minute
NEWS_API_TIMEOUT=10000           # Request timeout in ms
NEWS_API_RETRY_ATTEMPTS=3        # Number of retry attempts
NEWS_API_CACHE_TTL=300           # Cache time-to-live in seconds (5 minutes)
```

### Update .env.example

Add to `.env.example`:

```bash
# News API Services
SERPAPI_KEY=your_serpapi_key_here
GOOGLE_NEWS_API_KEY=your_serpapi_key_here
NEWSAPI_KEY=your_newsapi_key_here
MEDIASTACK_API_KEY=your_mediastack_key_here

# News API Configuration
NEWS_API_RATE_LIMIT=100
NEWS_API_TIMEOUT=10000
NEWS_API_RETRY_ATTEMPTS=3
NEWS_API_CACHE_TTL=300
```

### GitHub Secrets

Add to GitHub repository secrets:

1. Go to: https://github.com/Jberryfresh/DigitalTide/settings/secrets/actions
2. Click **"New repository secret"**
3. Add each:
   - `SERPAPI_KEY` or `GOOGLE_NEWS_API_KEY`
   - `NEWSAPI_KEY`
   - `MEDIASTACK_API_KEY`

---

## Testing APIs

### Create Test Script

Create `scripts/test-news-apis.js`:

```javascript
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const testAPIs = async () => {
  console.log('🧪 Testing News APIs...\n');

  // Test SerpAPI (Google News)
  console.log('1️⃣ Testing SerpAPI (Google News)...');
  try {
    const serpResponse = await axios.get('https://serpapi.com/search.json', {
      params: {
        engine: 'google_news',
        q: 'technology',
        api_key: process.env.SERPAPI_KEY
      },
      timeout: 10000
    });
    console.log(`✅ SerpAPI: ${serpResponse.data.news_results?.length || 0} results`);
  } catch (error) {
    console.error(`❌ SerpAPI Error: ${error.message}`);
  }

  // Test NewsAPI.org
  console.log('\n2️⃣ Testing NewsAPI.org...');
  try {
    const newsResponse = await axios.get('https://newsapi.org/v2/top-headlines', {
      params: {
        country: 'us',
        category: 'technology',
        pageSize: 5,
        apiKey: process.env.NEWSAPI_KEY
      },
      timeout: 10000
    });
    console.log(`✅ NewsAPI: ${newsResponse.data.totalResults} total, ${newsResponse.data.articles.length} returned`);
  } catch (error) {
    console.error(`❌ NewsAPI Error: ${error.message}`);
  }

  // Test MediaStack
  console.log('\n3️⃣ Testing MediaStack...');
  try {
    const mediaResponse = await axios.get('http://api.mediastack.com/v1/news', {
      params: {
        access_key: process.env.MEDIASTACK_API_KEY,
        countries: 'us',
        categories: 'technology',
        limit: 5
      },
      timeout: 10000
    });
    console.log(`✅ MediaStack: ${mediaResponse.data.pagination.total} total, ${mediaResponse.data.data.length} returned`);
  } catch (error) {
    console.error(`❌ MediaStack Error: ${error.message}`);
  }

  console.log('\n✅ API Testing Complete!');
};

testAPIs().catch(console.error);
```

### Run Test

```bash
node scripts/test-news-apis.js
```

---

## Rate Limits & Pricing

### SerpAPI

| Plan | Price | Searches/Month | Overage |
|------|-------|----------------|---------|
| Free | $0 | 100 | N/A |
| Starter | $50/month | 5,000 | $5/1000 |
| Developer | $125/month | 15,000 | $4/1000 |
| Production | $250/month | 30,000 | $3/1000 |

**Rate Limiting**: None specified, but recommended max 1 request/second

### NewsAPI.org

| Plan | Price | Requests/Day | Historical Data |
|------|-------|--------------|-----------------|
| Developer | Free | 100 | 1 month |
| Business | $449/month | 250,000 | Full archive |
| Enterprise | Custom | Custom | Full archive |

**Rate Limiting**: 
- Developer: 1 request every 12 minutes (100/day)
- Business: No strict limit, but 250K/day max

### MediaStack

| Plan | Price | Requests/Month | HTTPS |
|------|-------|----------------|-------|
| Free | $0 | 500 | ❌ |
| Basic | $9.99/month | 10,000 | ✅ |
| Professional | $49.99/month | 100,000 | ✅ |
| Business | $199.99/month | 500,000 | ✅ |

**Rate Limiting**: No strict rate limit, but monthly quota enforced

---

## Best Practices

### 1. API Key Security

```javascript
// ❌ BAD - Never hardcode API keys
const API_KEY = 'abc123def456';

// ✅ GOOD - Use environment variables
const API_KEY = process.env.NEWSAPI_KEY;
```

### 2. Error Handling

```javascript
async function fetchNews(query) {
  try {
    const response = await axios.get(NEWS_API_URL, {
      params: { q: query, apiKey: API_KEY },
      timeout: 10000
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 429) {
      console.error('Rate limit exceeded');
      // Implement exponential backoff
    } else if (error.response?.status === 401) {
      console.error('Invalid API key');
    } else {
      console.error('API request failed:', error.message);
    }
    throw error;
  }
}
```

### 3. Caching

```javascript
import Redis from 'redis';

const redis = Redis.createClient();
const CACHE_TTL = 300; // 5 minutes

async function getCachedNews(query) {
  const cacheKey = `news:${query}`;
  
  // Check cache first
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // Fetch from API
  const news = await fetchNews(query);
  
  // Cache result
  await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(news));
  
  return news;
}
```

### 4. Rate Limiting

```javascript
import Bottleneck from 'bottleneck';

// Limit to 1 request per second
const limiter = new Bottleneck({
  minTime: 1000,  // 1 second between requests
  maxConcurrent: 1
});

const fetchNewsRateLimited = limiter.wrap(fetchNews);
```

### 5. Fallback Strategy

```javascript
async function fetchNewsWithFallback(query) {
  const apis = [
    () => fetchFromNewsAPI(query),
    () => fetchFromMediaStack(query),
    () => fetchFromSerpAPI(query)
  ];
  
  for (const api of apis) {
    try {
      return await api();
    } catch (error) {
      console.error(`API failed, trying next...`);
      continue;
    }
  }
  
  throw new Error('All news APIs failed');
}
```

### 6. Response Normalization

```javascript
function normalizeArticle(article, source) {
  switch (source) {
    case 'newsapi':
      return {
        title: article.title,
        description: article.description,
        url: article.url,
        imageUrl: article.urlToImage,
        publishedAt: article.publishedAt,
        source: article.source.name
      };
    
    case 'mediastack':
      return {
        title: article.title,
        description: article.description,
        url: article.url,
        imageUrl: article.image,
        publishedAt: article.published_at,
        source: article.source
      };
    
    case 'serpapi':
      return {
        title: article.title,
        description: article.snippet,
        url: article.link,
        imageUrl: article.thumbnail,
        publishedAt: article.date,
        source: article.source
      };
  }
}
```

---

## Troubleshooting

### Common Issues

**1. 401 Unauthorized**
- Check API key is correct
- Verify key is not expired
- Ensure key is properly loaded from environment

**2. 429 Too Many Requests**
- You've exceeded rate limit
- Implement backoff strategy
- Consider upgrading plan

**3. CORS Errors (Browser)**
- News APIs don't support CORS
- Must call from backend/server only
- Never expose API keys in frontend

**4. Timeout Errors**
- API may be slow or down
- Increase timeout setting
- Implement retry logic

**5. Empty Results**
- Check query parameters
- Verify country/language codes
- Try broader search terms

---

## Additional Resources

### Documentation Links
- **SerpAPI**: https://serpapi.com/google-news-api
- **NewsAPI.org**: https://newsapi.org/docs
- **MediaStack**: https://mediastack.com/documentation

### API Status Pages
- **SerpAPI**: https://status.serpapi.com/
- **NewsAPI**: https://status.newsapi.org/ (if available)
- **MediaStack**: Check dashboard for status

### Support
- **SerpAPI**: support@serpapi.com
- **NewsAPI**: support@newsapi.org
- **MediaStack**: https://mediastack.com/contact

---

## Next Steps

After setting up all three News APIs:

1. ✅ Add API keys to `.env` file
2. ✅ Add API keys to GitHub Secrets
3. ✅ Run test script to verify connectivity
4. ✅ Update `.env.example` with placeholders
5. ✅ Implement news fetching service in `src/services/news/`
6. ✅ Create AI agents for content curation
7. ✅ Set up caching strategy with Redis
8. ✅ Implement rate limiting and error handling

---

**Last Updated**: October 26, 2024  
**Phase**: 1.5 - External Services  
**Status**: Ready for Implementation
