# DigitalTide - API Security & Implementation Guidelines

## Security Implementation

### Authentication Flow

#### JWT Token Structure
```json
{
  "header": {
    "alg": "RS256",
    "typ": "JWT",
    "kid": "key-id-1"
  },
  "payload": {
    "sub": "user-uuid",
    "email": "user@example.com",
    "role": "user",
    "permissions": ["read:articles", "write:profile"],
    "iat": 1635264000,
    "exp": 1635264900,
    "aud": "digitaltide-api",
    "iss": "digitaltide.com"
  }
}
```

#### Refresh Token Flow
1. Client receives access token (15min) + refresh token (7 days)
2. Access token expires, client uses refresh token
3. Server validates refresh token and issues new token pair
4. Old refresh token is invalidated (rotation)
5. If refresh token expires, user must re-authenticate

#### Admin Authentication
- Requires MFA (TOTP/SMS) in addition to password
- Admin tokens have additional claims and shorter expiry (5 minutes)
- Admin sessions require periodic re-authentication for sensitive operations
- All admin actions are logged with detailed audit trails

### API Security Headers

#### Required Headers for All Responses:
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

#### CORS Configuration:
```json
{
  "origin": ["https://digitaltide.com", "https://admin.digitaltide.com"],
  "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  "allowedHeaders": ["Authorization", "Content-Type", "X-Requested-With"],
  "credentials": true,
  "maxAge": 86400
}
```

### Input Validation

#### Request Validation Schema Example:
```javascript
// Article creation validation
const createArticleSchema = {
  title: {
    type: "string",
    minLength: 10,
    maxLength: 200,
    pattern: "^[a-zA-Z0-9\\s\\-\\.,!?]+$"
  },
  content: {
    type: "string",
    minLength: 500,
    maxLength: 50000,
    sanitize: true
  },
  category_id: {
    type: "string",
    format: "uuid",
    required: true
  },
  tags: {
    type: "array",
    maxItems: 10,
    items: {
      type: "string",
      format: "uuid"
    }
  }
}
```

#### SQL Injection Prevention:
- Use parameterized queries exclusively
- Validate all input types and formats
- Implement query builder with built-in escaping
- Regular security audits of database queries

#### XSS Prevention:
- Sanitize all user input before storage
- Encode output based on context (HTML, JavaScript, CSS)
- Use Content Security Policy headers
- Implement input validation on both client and server

## Database Design Schema

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role user_role DEFAULT 'user',
    avatar_url TEXT,
    email_verified BOOLEAN DEFAULT FALSE,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE
);

CREATE TYPE user_role AS ENUM ('user', 'admin', 'super_admin');
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at);
```

### Articles Table
```sql
CREATE TABLE articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(500) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    summary TEXT,
    featured_image_url TEXT,
    metadata JSONB DEFAULT '{}',
    status article_status DEFAULT 'draft',
    category_id UUID REFERENCES categories(id),
    author_id UUID REFERENCES users(id),
    agent_created VARCHAR(100),
    quality_score DECIMAL(3,2) DEFAULT 0.00,
    fact_check_score DECIMAL(3,2) DEFAULT 0.00,
    view_count INTEGER DEFAULT 0,
    published_at TIMESTAMP WITH TIME ZONE,
    scheduled_publish_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TYPE article_status AS ENUM ('draft', 'pending_review', 'approved', 'published', 'archived');
CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_published_at ON articles(published_at);
CREATE INDEX idx_articles_category_id ON articles(category_id);
CREATE INDEX idx_articles_quality_score ON articles(quality_score);
```

### Categories Table
```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_sort_order ON categories(sort_order);
```

### Tags Table
```sql
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE article_tags (
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (article_id, tag_id)
);

CREATE INDEX idx_tags_slug ON tags(slug);
CREATE INDEX idx_tags_usage_count ON tags(usage_count);
```

### Agent Tasks Table
```sql
CREATE TABLE agent_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_name VARCHAR(100) NOT NULL,
    task_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    status task_status DEFAULT 'pending',
    priority task_priority DEFAULT 'medium',
    result JSONB,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TYPE task_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'critical');

CREATE INDEX idx_agent_tasks_status ON agent_tasks(status);
CREATE INDEX idx_agent_tasks_agent_name ON agent_tasks(agent_name);
CREATE INDEX idx_agent_tasks_scheduled_at ON agent_tasks(scheduled_at);
```

### Analytics Table
```sql
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(100) NOT NULL,
    article_id UUID REFERENCES articles(id),
    user_id UUID REFERENCES users(id),
    session_id VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_article_id ON analytics_events(article_id);
CREATE INDEX idx_analytics_created_at ON analytics_events(created_at);
CREATE INDEX idx_analytics_user_id ON analytics_events(user_id);
```

### Sources Table
```sql
CREATE TABLE sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    domain VARCHAR(255),
    source_type source_type NOT NULL,
    credibility_score DECIMAL(3,2) DEFAULT 0.50,
    api_config JSONB,
    crawl_config JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    last_crawled TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TYPE source_type AS ENUM ('rss_feed', 'api', 'website', 'social_media');
CREATE INDEX idx_sources_domain ON sources(domain);
CREATE INDEX idx_sources_type ON sources(source_type);
CREATE INDEX idx_sources_credibility_score ON sources(credibility_score);
```

## API Implementation Guidelines

### Error Handling Strategy

#### Centralized Error Handler:
```javascript
class APIError extends Error {
  constructor(message, statusCode, errorCode, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
  }
}

const errorHandler = (err, req, res, next) => {
  const response = {
    success: false,
    error: {
      code: err.errorCode || 'INTERNAL_ERROR',
      message: err.message || 'An unexpected error occurred',
      details: err.details || null
    },
    meta: {
      timestamp: new Date().toISOString(),
      version: 'v1',
      request_id: req.id
    }
  };

  // Log error for monitoring
  logger.error('API Error', {
    error: err,
    request: {
      method: req.method,
      url: req.url,
      user: req.user?.id,
      ip: req.ip
    }
  });

  res.status(err.statusCode || 500).json(response);
};
```

#### Common Error Patterns:
```javascript
// Validation Error
throw new APIError(
  'Invalid input data',
  400,
  'VALIDATION_ERROR',
  [
    { field: 'email', message: 'Email is required' },
    { field: 'password', message: 'Password must be at least 8 characters' }
  ]
);

// Authentication Error
throw new APIError(
  'Invalid credentials',
  401,
  'AUTHENTICATION_FAILED'
);

// Authorization Error
throw new APIError(
  'Insufficient permissions to access this resource',
  403,
  'INSUFFICIENT_PERMISSIONS'
);

// Not Found Error
throw new APIError(
  'Article not found',
  404,
  'RESOURCE_NOT_FOUND'
);
```

### Pagination Implementation

#### Cursor-based Pagination:
```javascript
const paginateArticles = async (req, res) => {
  const { 
    limit = 20, 
    cursor, 
    category, 
    search 
  } = req.query;

  const query = {
    where: {
      status: 'published',
      ...(category && { category: { slug: category } }),
      ...(search && { 
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(cursor && { created_at: { lt: new Date(cursor) } })
    },
    include: {
      category: true,
      tags: true,
      author: { select: { id: true, name: true, avatar: true } }
    },
    orderBy: { created_at: 'desc' },
    take: parseInt(limit) + 1 // Get one extra to check if there's a next page
  };

  const articles = await prisma.article.findMany(query);
  const hasNextPage = articles.length > limit;
  
  if (hasNextPage) {
    articles.pop(); // Remove the extra item
  }

  const nextCursor = hasNextPage ? articles[articles.length - 1].created_at : null;

  res.json({
    success: true,
    data: { articles },
    pagination: {
      limit: parseInt(limit),
      has_next_page: hasNextPage,
      next_cursor: nextCursor
    }
  });
};
```

### Caching Strategy

#### Redis Caching Implementation:
```javascript
const cache = {
  // Cache article for 1 hour
  setArticle: (articleId, data) => {
    return redis.setex(`article:${articleId}`, 3600, JSON.stringify(data));
  },
  
  getArticle: async (articleId) => {
    const cached = await redis.get(`article:${articleId}`);
    return cached ? JSON.parse(cached) : null;
  },
  
  // Cache trending articles for 5 minutes
  setTrending: (data) => {
    return redis.setex('trending:articles', 300, JSON.stringify(data));
  },
  
  getTrending: async () => {
    const cached = await redis.get('trending:articles');
    return cached ? JSON.parse(cached) : null;
  },
  
  // Invalidate cache when article is updated
  invalidateArticle: (articleId) => {
    return redis.del(`article:${articleId}`);
  }
};

// Middleware for caching
const cacheMiddleware = (key, ttl = 3600) => {
  return async (req, res, next) => {
    const cacheKey = typeof key === 'function' ? key(req) : key;
    const cached = await redis.get(cacheKey);
    
    if (cached) {
      return res.json(JSON.parse(cached));
    }
    
    // Override res.json to cache the response
    const originalJson = res.json;
    res.json = function(data) {
      redis.setex(cacheKey, ttl, JSON.stringify(data));
      return originalJson.call(this, data);
    };
    
    next();
  };
};
```

### Rate Limiting Implementation

#### Redis-based Rate Limiting:
```javascript
const rateLimit = {
  check: async (key, limit, window) => {
    const current = await redis.incr(key);
    
    if (current === 1) {
      await redis.expire(key, window);
    }
    
    const ttl = await redis.ttl(key);
    
    return {
      current,
      limit,
      remaining: Math.max(0, limit - current),
      resetTime: Date.now() + (ttl * 1000),
      allowed: current <= limit
    };
  }
};

const rateLimitMiddleware = (options = {}) => {
  const {
    windowMs = 3600000, // 1 hour
    max = 1000,
    keyGenerator = (req) => req.ip,
    skipSuccessfulRequests = false,
    skipFailedRequests = false
  } = options;

  return async (req, res, next) => {
    const key = `rate_limit:${keyGenerator(req)}`;
    const windowSeconds = Math.floor(windowMs / 1000);
    
    const result = await rateLimit.check(key, max, windowSeconds);
    
    // Set rate limit headers
    res.set({
      'X-RateLimit-Limit': max,
      'X-RateLimit-Remaining': result.remaining,
      'X-RateLimit-Reset': new Date(result.resetTime).toISOString()
    });
    
    if (!result.allowed) {
      res.set('Retry-After', Math.ceil((result.resetTime - Date.now()) / 1000));
      return res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests, please try again later',
          details: {
            limit: max,
            window: `${windowMs / 1000}s`,
            reset_time: new Date(result.resetTime).toISOString()
          }
        }
      });
    }
    
    next();
  };
};
```

### WebSocket Implementation

#### Real-time Updates:
```javascript
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

class WebSocketManager {
  constructor() {
    this.clients = new Map();
    this.adminClients = new Set();
  }
  
  authenticate(ws, token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      ws.userId = decoded.sub;
      ws.userRole = decoded.role;
      
      this.clients.set(ws.userId, ws);
      
      if (decoded.role === 'admin' || decoded.role === 'super_admin') {
        this.adminClients.add(ws);
      }
      
      return true;
    } catch (error) {
      return false;
    }
  }
  
  broadcast(message, targetRole = null) {
    const payload = JSON.stringify(message);
    
    if (targetRole === 'admin') {
      this.adminClients.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(payload);
        }
      });
    } else {
      this.clients.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(payload);
        }
      });
    }
  }
  
  sendToUser(userId, message) {
    const ws = this.clients.get(userId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }
  
  notifyArticlePublished(article) {
    this.broadcast({
      type: 'article_published',
      data: { article }
    });
  }
  
  notifySystemAlert(alert) {
    this.broadcast({
      type: 'system_alert',
      data: alert
    }, 'admin');
  }
}

const wsManager = new WebSocketManager();
```

### Search Implementation

#### Elasticsearch Integration:
```javascript
const { Client } = require('@elastic/elasticsearch');

const searchClient = new Client({
  node: process.env.ELASTICSEARCH_URL,
  auth: {
    username: process.env.ELASTICSEARCH_USERNAME,
    password: process.env.ELASTICSEARCH_PASSWORD
  }
});

const searchService = {
  indexArticle: async (article) => {
    await searchClient.index({
      index: 'articles',
      id: article.id,
      body: {
        title: article.title,
        content: article.content,
        summary: article.summary,
        category: article.category.name,
        tags: article.tags.map(tag => tag.name),
        published_at: article.published_at,
        quality_score: article.quality_score
      }
    });
  },
  
  search: async (query, options = {}) => {
    const {
      category,
      page = 1,
      limit = 20,
      sort = 'relevance'
    } = options;
    
    const searchQuery = {
      index: 'articles',
      body: {
        query: {
          bool: {
            must: [
              {
                multi_match: {
                  query,
                  fields: ['title^3', 'summary^2', 'content', 'tags^2'],
                  fuzziness: 'AUTO'
                }
              }
            ],
            filter: [
              ...(category ? [{ term: { category } }] : [])
            ]
          }
        },
        highlight: {
          fields: {
            title: {},
            content: { fragment_size: 150, number_of_fragments: 3 }
          }
        },
        sort: sort === 'date' ? [{ published_at: 'desc' }] : [],
        from: (page - 1) * limit,
        size: limit
      }
    };
    
    const response = await searchClient.search(searchQuery);
    
    return {
      results: response.body.hits.hits.map(hit => ({
        id: hit._id,
        ...hit._source,
        relevance_score: hit._score,
        highlighted_text: hit.highlight?.content?.[0] || null
      })),
      total: response.body.hits.total.value,
      page,
      limit
    };
  },
  
  getSuggestions: async (query) => {
    const response = await searchClient.search({
      index: 'articles',
      body: {
        suggest: {
          title_suggest: {
            prefix: query,
            completion: {
              field: 'title_suggest',
              size: 10
            }
          }
        }
      }
    });
    
    return response.body.suggest.title_suggest[0].options
      .map(option => option.text);
  }
};
```

---

*This implementation guide provides the technical foundation for building secure, scalable, and performant APIs that will power the DigitalTide platform.*