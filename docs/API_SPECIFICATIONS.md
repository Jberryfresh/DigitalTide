# DigitalTide - API Specifications

## Overview

The DigitalTide API follows RESTful principles with a focus on scalability, security, and developer experience. All endpoints are versioned, use consistent response formats, and include comprehensive error handling.

## Base Configuration

### Base URLs
- **Development**: `http://localhost:3000/api/v1`
- **Staging**: `https://staging-api.digitaltide.com/api/v1`
- **Production**: `https://api.digitaltide.com/api/v1`

### Authentication
- **Type**: JWT Bearer Token with refresh token rotation
- **Header**: `Authorization: Bearer <access_token>`
- **Token Expiry**: Access tokens expire in 15 minutes, refresh tokens in 7 days
- **Admin Access**: Requires additional role verification and MFA

### Response Format
All API responses follow this consistent structure:

```json
{
  "success": true,
  "data": {},
  "message": "Success message",
  "meta": {
    "timestamp": "2025-10-26T10:30:00Z",
    "version": "v1",
    "request_id": "req_123456789"
  },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  },
  "meta": {
    "timestamp": "2025-10-26T10:30:00Z",
    "version": "v1",
    "request_id": "req_123456789"
  }
}
```

## Authentication Endpoints

### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "first_name": "John",
  "last_name": "Doe",
  "newsletter_opt_in": true
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-string",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "role": "user",
      "created_at": "2025-10-26T10:30:00Z"
    },
    "tokens": {
      "access_token": "jwt-access-token",
      "refresh_token": "jwt-refresh-token",
      "expires_in": 900
    }
  },
  "message": "Account created successfully"
}
```

### POST /auth/login
Authenticate user and receive access tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-string",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "role": "user",
      "last_login": "2025-10-26T10:30:00Z"
    },
    "tokens": {
      "access_token": "jwt-access-token",
      "refresh_token": "jwt-refresh-token",
      "expires_in": 900
    }
  },
  "message": "Login successful"
}
```

### POST /auth/refresh
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refresh_token": "jwt-refresh-token"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "access_token": "new-jwt-access-token",
    "refresh_token": "new-jwt-refresh-token",
    "expires_in": 900
  },
  "message": "Token refreshed successfully"
}
```

### POST /auth/logout
Invalidate user tokens and log out.

**Headers:** `Authorization: Bearer <access_token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### POST /auth/forgot-password
Request password reset email.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

### POST /auth/reset-password
Reset password using reset token.

**Request Body:**
```json
{
  "token": "reset-token",
  "new_password": "NewSecurePassword123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

## Article Endpoints

### GET /articles
Retrieve paginated list of articles with filtering and search.

**Query Parameters:**
- `page` (int): Page number (default: 1)
- `limit` (int): Items per page (default: 20, max: 100)
- `category` (string): Filter by category slug
- `tag` (string): Filter by tag slug
- `search` (string): Full-text search query
- `sort` (string): Sort order (latest, popular, trending)
- `status` (string): Article status (published, draft) - Admin only

**Response (200):**
```json
{
  "success": true,
  "data": {
    "articles": [
      {
        "id": "uuid-string",
        "title": "Breaking: AI Revolutionizes Healthcare",
        "slug": "ai-revolutionizes-healthcare",
        "summary": "Latest developments in AI healthcare applications...",
        "featured_image": "https://cdn.digitaltide.com/images/ai-healthcare.jpg",
        "category": {
          "id": "uuid-string",
          "name": "Technology",
          "slug": "technology"
        },
        "tags": [
          {
            "id": "uuid-string",
            "name": "AI",
            "slug": "ai"
          }
        ],
        "author": {
          "id": "uuid-string",
          "name": "DigitalTide AI",
          "avatar": "https://cdn.digitaltide.com/avatars/ai-author.jpg"
        },
        "published_at": "2025-10-26T10:00:00Z",
        "reading_time": 5,
        "view_count": 1250,
        "quality_score": 0.92
      }
    ]
  },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 500,
    "pages": 25
  }
}
```

### GET /articles/{id}
Retrieve a specific article by ID.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "article": {
      "id": "uuid-string",
      "title": "Breaking: AI Revolutionizes Healthcare",
      "slug": "ai-revolutionizes-healthcare",
      "content": "Full article content in markdown format...",
      "summary": "Latest developments in AI healthcare applications...",
      "featured_image": "https://cdn.digitaltide.com/images/ai-healthcare.jpg",
      "metadata": {
        "seo_title": "AI Revolutionizes Healthcare | DigitalTide",
        "seo_description": "Discover how AI is transforming healthcare...",
        "keywords": ["AI", "healthcare", "technology"],
        "reading_time": 5,
        "word_count": 1200
      },
      "category": {
        "id": "uuid-string",
        "name": "Technology",
        "slug": "technology"
      },
      "tags": [
        {
          "id": "uuid-string",
          "name": "AI",
          "slug": "ai"
        }
      ],
      "author": {
        "id": "uuid-string",
        "name": "DigitalTide AI",
        "bio": "AI-powered content creation system",
        "avatar": "https://cdn.digitaltide.com/avatars/ai-author.jpg"
      },
      "published_at": "2025-10-26T10:00:00Z",
      "updated_at": "2025-10-26T10:30:00Z",
      "view_count": 1250,
      "quality_score": 0.92,
      "fact_check_score": 0.95,
      "sources": [
        {
          "name": "Healthcare Technology News",
          "url": "https://healthtech.com/ai-breakthrough",
          "credibility_score": 0.89
        }
      ],
      "related_articles": [
        {
          "id": "uuid-string",
          "title": "The Future of Medical AI",
          "slug": "future-medical-ai",
          "featured_image": "https://cdn.digitaltide.com/images/medical-ai.jpg"
        }
      ]
    }
  }
}
```

### GET /articles/slug/{slug}
Retrieve article by URL slug (for SEO-friendly URLs).

**Response:** Same as GET /articles/{id}

### GET /articles/trending
Get trending articles based on recent engagement.

**Query Parameters:**
- `limit` (int): Number of articles (default: 10, max: 50)
- `timeframe` (string): Time period (1h, 24h, 7d, 30d)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "trending_articles": [
      {
        "id": "uuid-string",
        "title": "Breaking: AI Revolutionizes Healthcare",
        "slug": "ai-revolutionizes-healthcare",
        "featured_image": "https://cdn.digitaltide.com/images/ai-healthcare.jpg",
        "category": "Technology",
        "published_at": "2025-10-26T10:00:00Z",
        "view_count": 1250,
        "trending_score": 0.95,
        "engagement_rate": 0.12
      }
    ]
  }
}
```

### POST /articles (Admin Only)
Create a new article.

**Headers:** `Authorization: Bearer <admin_access_token>`

**Request Body:**
```json
{
  "title": "New Article Title",
  "content": "Article content in markdown...",
  "summary": "Brief article summary",
  "category_id": "uuid-string",
  "tag_ids": ["uuid-1", "uuid-2"],
  "featured_image": "https://cdn.digitaltide.com/images/new-article.jpg",
  "status": "draft",
  "metadata": {
    "seo_title": "Custom SEO Title",
    "seo_description": "Custom SEO description",
    "keywords": ["keyword1", "keyword2"]
  },
  "scheduled_publish_at": "2025-10-26T15:00:00Z"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "article": {
      "id": "uuid-string",
      "title": "New Article Title",
      "slug": "new-article-title",
      "status": "draft",
      "created_at": "2025-10-26T10:30:00Z"
    }
  },
  "message": "Article created successfully"
}
```

### PUT /articles/{id} (Admin Only)
Update an existing article.

**Headers:** `Authorization: Bearer <admin_access_token>`

**Request Body:** Same as POST /articles

**Response (200):**
```json
{
  "success": true,
  "data": {
    "article": {
      "id": "uuid-string",
      "title": "Updated Article Title",
      "updated_at": "2025-10-26T11:00:00Z"
    }
  },
  "message": "Article updated successfully"
}
```

### DELETE /articles/{id} (Admin Only)
Delete an article (soft delete).

**Headers:** `Authorization: Bearer <admin_access_token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Article deleted successfully"
}
```

## Category Endpoints

### GET /categories
Retrieve all article categories.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "uuid-string",
        "name": "Technology",
        "slug": "technology",
        "description": "Latest technology news and trends",
        "article_count": 250,
        "sort_order": 1,
        "is_active": true
      }
    ]
  }
}
```

### GET /categories/{slug}
Get category details with recent articles.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "category": {
      "id": "uuid-string",
      "name": "Technology",
      "slug": "technology",
      "description": "Latest technology news and trends",
      "article_count": 250,
      "recent_articles": [
        {
          "id": "uuid-string",
          "title": "AI Breakthrough",
          "slug": "ai-breakthrough",
          "published_at": "2025-10-26T10:00:00Z"
        }
      ]
    }
  }
}
```

## Search Endpoints

### GET /search
Full-text search across articles.

**Query Parameters:**
- `q` (string, required): Search query
- `category` (string): Filter by category
- `page` (int): Page number
- `limit` (int): Results per page
- `sort` (string): Sort by relevance, date, popularity

**Response (200):**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": "uuid-string",
        "title": "AI Revolutionizes Healthcare",
        "slug": "ai-revolutionizes-healthcare",
        "summary": "Highlighted search snippet...",
        "featured_image": "https://cdn.digitaltide.com/images/ai-healthcare.jpg",
        "category": "Technology",
        "published_at": "2025-10-26T10:00:00Z",
        "relevance_score": 0.95,
        "highlighted_text": "...AI <mark>revolutionizes</mark> modern <mark>healthcare</mark>..."
      }
    ],
    "suggestions": [
      "AI healthcare applications",
      "machine learning medical",
      "artificial intelligence diagnosis"
    ]
  },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

### GET /search/suggestions
Get search suggestions for autocomplete.

**Query Parameters:**
- `q` (string): Partial search query

**Response (200):**
```json
{
  "success": true,
  "data": {
    "suggestions": [
      "artificial intelligence",
      "AI healthcare",
      "AI technology trends"
    ]
  }
}
```

## User Endpoints

### GET /users/profile
Get current user profile.

**Headers:** `Authorization: Bearer <access_token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-string",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "avatar": "https://cdn.digitaltide.com/avatars/user.jpg",
      "role": "user",
      "preferences": {
        "newsletter_subscribed": true,
        "email_notifications": true,
        "preferred_categories": ["technology", "business"],
        "reading_list_count": 25
      },
      "stats": {
        "articles_read": 150,
        "reading_streak": 7,
        "total_reading_time": 1250
      },
      "created_at": "2025-01-15T10:00:00Z",
      "last_login": "2025-10-26T09:30:00Z"
    }
  }
}
```

### PUT /users/profile
Update user profile information.

**Headers:** `Authorization: Bearer <access_token>`

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Smith",
  "preferences": {
    "newsletter_subscribed": false,
    "email_notifications": true,
    "preferred_categories": ["technology", "science"]
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-string",
      "first_name": "John",
      "last_name": "Smith",
      "updated_at": "2025-10-26T11:00:00Z"
    }
  },
  "message": "Profile updated successfully"
}
```

### GET /users/reading-list
Get user's saved articles.

**Headers:** `Authorization: Bearer <access_token>`

**Query Parameters:**
- `page` (int): Page number
- `limit` (int): Items per page

**Response (200):**
```json
{
  "success": true,
  "data": {
    "reading_list": [
      {
        "id": "uuid-string",
        "title": "AI Healthcare Revolution",
        "slug": "ai-healthcare-revolution",
        "featured_image": "https://cdn.digitaltide.com/images/ai-healthcare.jpg",
        "category": "Technology",
        "saved_at": "2025-10-25T14:30:00Z",
        "reading_progress": 0.6
      }
    ]
  },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 25,
    "pages": 2
  }
}
```

### POST /users/reading-list
Add article to reading list.

**Headers:** `Authorization: Bearer <access_token>`

**Request Body:**
```json
{
  "article_id": "uuid-string"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Article added to reading list"
}
```

### DELETE /users/reading-list/{article_id}
Remove article from reading list.

**Headers:** `Authorization: Bearer <access_token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Article removed from reading list"
}
```

## Newsletter Endpoints

### POST /newsletter/subscribe
Subscribe to newsletter.

**Request Body:**
```json
{
  "email": "user@example.com",
  "categories": ["technology", "business"],
  "frequency": "daily"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "subscription": {
      "id": "uuid-string",
      "email": "user@example.com",
      "status": "active",
      "subscribed_at": "2025-10-26T11:00:00Z"
    }
  },
  "message": "Successfully subscribed to newsletter"
}
```

### PUT /newsletter/preferences
Update newsletter preferences.

**Request Body:**
```json
{
  "email": "user@example.com",
  "categories": ["technology", "science"],
  "frequency": "weekly"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Newsletter preferences updated"
}
```

### POST /newsletter/unsubscribe
Unsubscribe from newsletter.

**Request Body:**
```json
{
  "email": "user@example.com",
  "token": "unsubscribe-token"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Successfully unsubscribed from newsletter"
}
```

## Analytics Endpoints

### POST /analytics/view
Track article view.

**Request Body:**
```json
{
  "article_id": "uuid-string",
  "user_id": "uuid-string",
  "session_id": "session-string",
  "user_agent": "Mozilla/5.0...",
  "referrer": "https://google.com",
  "reading_time": 180,
  "scroll_depth": 0.8
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "View tracked successfully"
}
```

### GET /analytics/popular
Get popular articles analytics.

**Query Parameters:**
- `timeframe` (string): 1h, 24h, 7d, 30d
- `limit` (int): Number of results

**Response (200):**
```json
{
  "success": true,
  "data": {
    "popular_articles": [
      {
        "article_id": "uuid-string",
        "title": "AI Healthcare Revolution",
        "view_count": 5420,
        "unique_views": 4230,
        "average_reading_time": 240,
        "engagement_rate": 0.15
      }
    ]
  }
}
```

## Admin Endpoints

### GET /admin/dashboard
Get admin dashboard statistics.

**Headers:** `Authorization: Bearer <admin_access_token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "stats": {
      "total_articles": 1250,
      "published_today": 15,
      "total_users": 45000,
      "active_users_24h": 2340,
      "total_views_24h": 85600,
      "revenue_24h": 1250.75
    },
    "recent_articles": [
      {
        "id": "uuid-string",
        "title": "Recent Article",
        "status": "published",
        "view_count": 245,
        "published_at": "2025-10-26T09:00:00Z"
      }
    ],
    "system_health": {
      "api_status": "healthy",
      "database_status": "healthy",
      "agent_status": "active",
      "cdn_status": "healthy",
      "response_time": 85
    }
  }
}
```

### GET /admin/agents
Get AI agent status and performance.

**Headers:** `Authorization: Bearer <admin_access_token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "agents": [
      {
        "name": "coo_orchestrator",
        "status": "active",
        "last_activity": "2025-10-26T11:00:00Z",
        "tasks_completed": 1250,
        "success_rate": 0.98,
        "average_response_time": 2.3,
        "current_tasks": 3,
        "health_score": 0.95
      },
      {
        "name": "crawler_agent",
        "status": "active",
        "last_activity": "2025-10-26T10:58:00Z",
        "tasks_completed": 2340,
        "success_rate": 0.96,
        "average_response_time": 1.8,
        "current_tasks": 1,
        "health_score": 0.92
      }
    ],
    "overall_health": 0.94
  }
}
```

### POST /admin/agents/{agent_name}/control
Control agent operations.

**Headers:** `Authorization: Bearer <admin_access_token>`

**Request Body:**
```json
{
  "action": "start|stop|restart|configure",
  "config": {
    "crawl_frequency": 300,
    "max_concurrent_tasks": 5
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "agent": {
      "name": "crawler_agent",
      "status": "restarting",
      "message": "Agent restart initiated"
    }
  }
}
```

### GET /admin/content-queue
Get content approval queue.

**Headers:** `Authorization: Bearer <admin_access_token>`

**Query Parameters:**
- `status` (string): pending, approved, rejected
- `page` (int): Page number
- `limit` (int): Items per page

**Response (200):**
```json
{
  "success": true,
  "data": {
    "queue_items": [
      {
        "id": "uuid-string",
        "title": "Pending Article Title",
        "agent_created": "writer_agent",
        "quality_score": 0.87,
        "fact_check_score": 0.92,
        "created_at": "2025-10-26T10:30:00Z",
        "status": "pending_review",
        "flagged_issues": []
      }
    ]
  },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

### POST /admin/content-queue/{id}/approve
Approve content for publication.

**Headers:** `Authorization: Bearer <admin_access_token>`

**Request Body:**
```json
{
  "approved": true,
  "notes": "Approved with minor edits",
  "scheduled_publish_at": "2025-10-26T15:00:00Z"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Content approved for publication"
}
```

## WebSocket Endpoints

### Real-time Updates
WebSocket connection for live updates.

**Connection URL:** `wss://api.digitaltide.com/ws`

**Authentication:** Include JWT token in connection headers or as query parameter.

#### Message Types:

**Article Published:**
```json
{
  "type": "article_published",
  "data": {
    "article": {
      "id": "uuid-string",
      "title": "Breaking News Title",
      "category": "Technology",
      "published_at": "2025-10-26T11:00:00Z"
    }
  }
}
```

**System Alert:**
```json
{
  "type": "system_alert",
  "data": {
    "level": "warning",
    "message": "High traffic detected",
    "timestamp": "2025-10-26T11:00:00Z"
  }
}
```

**Agent Status Update:**
```json
{
  "type": "agent_status",
  "data": {
    "agent_name": "crawler_agent",
    "status": "active",
    "health_score": 0.95,
    "timestamp": "2025-10-26T11:00:00Z"
  }
}
```

## Rate Limiting

### Rate Limits by Endpoint Category:

- **Public endpoints** (articles, search): 1000 requests/hour per IP
- **Authenticated endpoints**: 5000 requests/hour per user
- **Admin endpoints**: 10000 requests/hour per admin user
- **Analytics endpoints**: 500 requests/hour per user
- **Upload endpoints**: 100 requests/hour per user

### Rate Limit Headers:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1635264000
X-RateLimit-Retry-After: 3600
```

## Error Codes

### HTTP Status Codes:
- **200**: Success
- **201**: Created
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **409**: Conflict
- **422**: Validation Error
- **429**: Rate Limit Exceeded
- **500**: Internal Server Error
- **503**: Service Unavailable

### Custom Error Codes:
- **VALIDATION_ERROR**: Input validation failed
- **AUTHENTICATION_FAILED**: Invalid credentials
- **TOKEN_EXPIRED**: JWT token expired
- **INSUFFICIENT_PERMISSIONS**: Access denied
- **RESOURCE_NOT_FOUND**: Requested resource doesn't exist
- **RATE_LIMIT_EXCEEDED**: Too many requests
- **AGENT_UNAVAILABLE**: AI agent is offline
- **CONTENT_PROCESSING_FAILED**: Content generation failed
- **DUPLICATE_CONTENT**: Content already exists
- **EXTERNAL_SERVICE_ERROR**: Third-party service failure

## GraphQL Schema (Future Implementation)

### Types:
```graphql
type Article {
  id: ID!
  title: String!
  slug: String!
  content: String!
  summary: String
  featuredImage: String
  category: Category!
  tags: [Tag!]!
  author: Author!
  publishedAt: DateTime!
  updatedAt: DateTime!
  viewCount: Int!
  qualityScore: Float!
  sources: [Source!]!
  relatedArticles: [Article!]!
}

type Query {
  articles(first: Int, after: String, category: String, search: String): ArticleConnection!
  article(id: ID, slug: String): Article
  trendingArticles(limit: Int, timeframe: String): [Article!]!
  categories: [Category!]!
  search(query: String!, first: Int, after: String): SearchResultConnection!
}

type Mutation {
  createArticle(input: CreateArticleInput!): CreateArticlePayload!
  updateArticle(id: ID!, input: UpdateArticleInput!): UpdateArticlePayload!
  deleteArticle(id: ID!): DeleteArticlePayload!
}

type Subscription {
  articlePublished: Article!
  systemAlert: SystemAlert!
  agentStatusUpdate: AgentStatus!
}
```

---

*This API specification serves as the complete contract between frontend and backend systems. All endpoints will be implemented with comprehensive validation, error handling, and security measures.*