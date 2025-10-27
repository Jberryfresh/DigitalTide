# DigitalTide - Coding Standards & Style Guide

**Version**: 1.0  
**Last Updated**: October 26, 2025  
**Applies To**: All developers, AI agents, and contributors

---

## Table of Contents

1. [General Principles](#1-general-principles)
2. [JavaScript/Node.js Standards](#2-javascriptnodejs-standards)
3. [Database Standards](#3-database-standards)
4. [API Development Standards](#4-api-development-standards)
5. [Documentation Standards](#5-documentation-standards)
6. [Git & Version Control](#6-git--version-control)
7. [Testing Standards](#7-testing-standards)
8. [Security Standards](#8-security-standards)
9. [Performance Standards](#9-performance-standards)
10. [AI Agent Development Standards](#10-ai-agent-development-standards)

---

## 1. General Principles

### 1.1 Core Values

**Code Quality Over Speed**:
- Write code that is readable and maintainable
- Prioritize clarity over cleverness
- Optimize for human understanding first, performance second
- Refactor early and often

**Consistency**:
- Follow established patterns throughout the codebase
- Use consistent naming conventions
- Maintain consistent file and folder structure
- Apply the same error handling patterns

**Documentation**:
- Code should be self-documenting through clear naming
- Add comments for complex logic or business rules
- Keep documentation up-to-date with code changes
- Document the "why" not just the "what"

**Security First**:
- Never commit secrets or credentials
- Validate all inputs
- Use parameterized queries
- Follow principle of least privilege

### 1.2 Code Review Guidelines

**All code must be reviewed before merging**:
- [ ] Follows coding standards and style guide
- [ ] Includes appropriate tests
- [ ] Documentation is updated
- [ ] No security vulnerabilities introduced
- [ ] Performance impact considered
- [ ] Error handling is comprehensive
- [ ] Edge cases are handled

---

## 2. JavaScript/Node.js Standards

### 2.1 Module System

**Use ES6 Modules**:
```javascript
// ✓ GOOD - Use ES6 import/export
import express from 'express';
import { query } from '../database/pool.js';

export const getUserById = async (id) => {
  // implementation
};

export default UserController;

// ✗ BAD - Don't use CommonJS
const express = require('express');
module.exports = UserController;
```

### 2.2 File Naming

**Use kebab-case for files**:
```
✓ GOOD:
  user-controller.js
  article-routes.js
  database-pool.js
  auth-middleware.js

✗ BAD:
  UserController.js
  articleRoutes.js
  database_pool.js
  AuthMiddleware.js
```

### 2.3 Variable Naming

**Use descriptive, meaningful names**:
```javascript
// ✓ GOOD - Clear and descriptive
const authenticatedUser = await getUserById(userId);
const articlePublicationDate = new Date(article.published_at);
const maxRetryAttempts = 3;

// ✗ BAD - Unclear abbreviations
const usr = await getUsr(id);
const dt = new Date(art.pub);
const max = 3;
```

**Naming Conventions**:
- **Variables & Functions**: `camelCase` (e.g., `getUserById`, `articleCount`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `MAX_RETRY_ATTEMPTS`, `API_BASE_URL`)
- **Classes**: `PascalCase` (e.g., `ArticleController`, `DatabasePool`)
- **Private properties**: `_camelCase` (e.g., `_privateMethod`, `_internalState`)
- **Boolean variables**: Prefix with `is`, `has`, `should` (e.g., `isAuthenticated`, `hasPermission`, `shouldRetry`)

### 2.4 Function Standards

**Keep functions small and focused**:
```javascript
// ✓ GOOD - Single responsibility, clear purpose
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const hashPassword = async (password) => {
  return await bcrypt.hash(password, 12);
};

// ✗ BAD - Doing too many things
const processUser = async (data) => {
  // validates, hashes password, saves to DB, sends email, logs...
};
```

**Use async/await over promises**:
```javascript
// ✓ GOOD - Clean async/await
const getArticle = async (id) => {
  try {
    const result = await query('SELECT * FROM articles WHERE id = $1', [id]);
    return result.rows[0];
  } catch (error) {
    logger.error('Failed to fetch article:', error);
    throw error;
  }
};

// ✗ BAD - Promise chains
const getArticle = (id) => {
  return query('SELECT * FROM articles WHERE id = $1', [id])
    .then(result => result.rows[0])
    .catch(error => {
      logger.error('Failed to fetch article:', error);
      throw error;
    });
};
```

### 2.5 Error Handling

**Always use try-catch with async/await**:
```javascript
// ✓ GOOD - Comprehensive error handling
export const createArticle = async (req, res, next) => {
  try {
    const { title, content, category_id } = req.body;
    
    // Validate input
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        error: { message: 'Title and content are required' }
      });
    }
    
    const article = await Article.create({ title, content, category_id });
    
    return res.status(201).json({
      success: true,
      data: article
    });
  } catch (error) {
    logger.error('Error creating article:', error);
    next(error); // Pass to error handling middleware
  }
};

// ✗ BAD - No error handling
export const createArticle = async (req, res) => {
  const { title, content } = req.body;
  const article = await Article.create({ title, content });
  res.json(article);
};
```

**Create custom error classes**:
```javascript
// ✓ GOOD - Custom error classes
class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
    this.field = field;
  }
}

class NotFoundError extends Error {
  constructor(resource, id) {
    super(`${resource} with id ${id} not found`);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

// Usage
throw new NotFoundError('Article', articleId);
```

### 2.6 Code Formatting

**Use ESLint and Prettier**:
```javascript
// .eslintrc.json configuration
{
  "extends": ["eslint:recommended"],
  "env": {
    "node": true,
    "es2022": true
  },
  "parserOptions": {
    "ecmaVersion": 2022,
    "sourceType": "module"
  },
  "rules": {
    "no-console": "warn",
    "no-unused-vars": "error",
    "prefer-const": "error",
    "no-var": "error"
  }
}

// .prettierrc.json configuration
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false
}
```

**Format before committing**:
```bash
npm run lint        # Check for linting errors
npm run format      # Auto-format with Prettier
npm run lint:fix    # Auto-fix linting issues
```

### 2.7 Import Organization

**Group imports logically**:
```javascript
// ✓ GOOD - Organized imports
// 1. External dependencies
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// 2. Internal modules (absolute imports)
import { query, transaction } from '../database/pool.js';
import config from '../config/index.js';

// 3. Relative imports
import { validateEmail } from './validators.js';
import { sendEmail } from './email-service.js';

// 4. Types (if using TypeScript)
import type { User, Article } from '../types/index.js';

// ✗ BAD - Random order
import { sendEmail } from './email-service.js';
import express from 'express';
import { query } from '../database/pool.js';
import bcrypt from 'bcrypt';
```

### 2.8 Comments and Documentation

**Write self-documenting code, add comments for complex logic**:
```javascript
// ✓ GOOD - Clear code with helpful comments
/**
 * Calculates the reading time for an article based on word count.
 * Uses average reading speed of 200 words per minute.
 * 
 * @param {string} content - Article content text
 * @returns {number} Estimated reading time in minutes
 */
const calculateReadingTime = (content) => {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / wordsPerMinute);
  
  return readingTime;
};

// Complex business logic requires explanation
const calculateArticleScore = (article) => {
  // Score combines multiple factors with different weights:
  // - Engagement (40%): views, shares, comments
  // - Recency (30%): publish date decay over time
  // - Quality (30%): fact-check score, source credibility
  
  const engagementScore = (article.views * 0.5 + article.shares * 2 + article.comments * 3) / 100;
  const recencyScore = calculateRecencyScore(article.published_at);
  const qualityScore = (article.fact_check_score + article.source_credibility) / 2;
  
  return (engagementScore * 0.4) + (recencyScore * 0.3) + (qualityScore * 0.3);
};

// ✗ BAD - Unnecessary comments
const add = (a, b) => {
  // Add a and b together
  return a + b; // Return the sum
};
```

---

## 3. Database Standards

### 3.1 Table Naming

**Use lowercase with underscores (snake_case)**:
```sql
-- ✓ GOOD
CREATE TABLE articles (...)
CREATE TABLE article_categories (...)
CREATE TABLE user_preferences (...)
CREATE TABLE reading_list_items (...)

-- ✗ BAD
CREATE TABLE Articles (...)
CREATE TABLE articleCategories (...)
CREATE TABLE UserPreferences (...)
```

### 3.2 Column Naming

**Use descriptive snake_case names**:
```sql
-- ✓ GOOD
CREATE TABLE articles (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  author_id INTEGER REFERENCES users(id),
  category_id INTEGER REFERENCES categories(id),
  view_count INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ✗ BAD
CREATE TABLE articles (
  ID SERIAL PRIMARY KEY,
  Title VARCHAR(500),
  Content TEXT,
  AuthorID INTEGER,
  viewCount INTEGER,
  IsPublished BOOLEAN
);
```

### 3.3 Query Standards

**Always use parameterized queries**:
```javascript
// ✓ GOOD - Parameterized query (SQL injection safe)
const getArticlesByCategory = async (categoryId) => {
  const result = await query(
    'SELECT * FROM articles WHERE category_id = $1 AND is_published = true',
    [categoryId]
  );
  return result.rows;
};

// ✗ BAD - String concatenation (SQL injection risk!)
const getArticlesByCategory = async (categoryId) => {
  const result = await query(
    `SELECT * FROM articles WHERE category_id = ${categoryId}`
  );
  return result.rows;
};
```

**Use transactions for multi-step operations**:
```javascript
// ✓ GOOD - Use transactions
const createArticleWithTags = async (articleData, tags) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Insert article
    const articleResult = await client.query(
      'INSERT INTO articles (title, content, author_id) VALUES ($1, $2, $3) RETURNING *',
      [articleData.title, articleData.content, articleData.author_id]
    );
    const article = articleResult.rows[0];
    
    // Insert tags
    for (const tag of tags) {
      await client.query(
        'INSERT INTO article_tags (article_id, tag_id) VALUES ($1, $2)',
        [article.id, tag.id]
      );
    }
    
    await client.query('COMMIT');
    return article;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};
```

### 3.4 Index Strategy

**Create indexes for frequently queried columns**:
```sql
-- ✓ GOOD - Indexes for common queries
CREATE INDEX idx_articles_category_published 
  ON articles(category_id) 
  WHERE is_published = true;

CREATE INDEX idx_articles_published_at 
  ON articles(published_at DESC) 
  WHERE is_published = true;

CREATE INDEX idx_articles_search 
  ON articles USING gin(search_vector);

-- ✗ BAD - No indexes or over-indexing every column
CREATE INDEX idx_articles_every_column_1 ON articles(title);
CREATE INDEX idx_articles_every_column_2 ON articles(content);
CREATE INDEX idx_articles_every_column_3 ON articles(slug);
-- ... (too many indexes slow down writes)
```

---

## 4. API Development Standards

### 4.1 RESTful Conventions

**Use proper HTTP methods and status codes**:
```javascript
// ✓ GOOD - RESTful design
GET    /api/v1/articles           → 200 OK (list)
GET    /api/v1/articles/:id       → 200 OK or 404 Not Found
POST   /api/v1/articles           → 201 Created
PUT    /api/v1/articles/:id       → 200 OK or 404 Not Found
PATCH  /api/v1/articles/:id       → 200 OK or 404 Not Found
DELETE /api/v1/articles/:id       → 204 No Content or 404 Not Found

// ✗ BAD - Non-standard endpoints
GET    /api/v1/getArticles
POST   /api/v1/createArticle
POST   /api/v1/updateArticle/:id
GET    /api/v1/deleteArticle/:id
```

### 4.2 Response Format

**Consistent JSON response structure**:
```javascript
// ✓ GOOD - Consistent structure
{
  "success": true,
  "data": {
    "id": 123,
    "title": "Breaking News",
    "content": "..."
  },
  "meta": {
    "timestamp": "2025-10-26T10:30:00Z",
    "version": "v1"
  }
}

// For lists with pagination
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}

// For errors
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [
      { "field": "email", "message": "Invalid email format" }
    ]
  }
}
```

### 4.3 Input Validation

**Validate all inputs**:
```javascript
// ✓ GOOD - Comprehensive validation
import { body, validationResult } from 'express-validator';

export const validateArticle = [
  body('title')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Title must be between 10 and 500 characters'),
  
  body('content')
    .trim()
    .isLength({ min: 100 })
    .withMessage('Content must be at least 100 characters'),
  
  body('category_id')
    .isInt({ min: 1 })
    .withMessage('Valid category ID is required'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: errors.array()
        }
      });
    }
    next();
  }
];
```

### 4.4 Route Organization

**Organize routes by resource**:
```
src/routes/
  ├── auth-routes.js         # Authentication endpoints
  ├── articles-routes.js     # Article CRUD
  ├── categories-routes.js   # Category management
  ├── tags-routes.js         # Tag management
  ├── search-routes.js       # Search functionality
  └── index.js               # Route aggregation
```

```javascript
// routes/index.js
import express from 'express';
import authRoutes from './auth-routes.js';
import articlesRoutes from './articles-routes.js';
import categoriesRoutes from './categories-routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/articles', articlesRoutes);
router.use('/categories', categoriesRoutes);

export default router;
```

---

## 5. Documentation Standards

### 5.1 Code Documentation

**Document all public functions and classes**:
```javascript
/**
 * Retrieves an article by its unique identifier.
 * 
 * @param {number} id - The article ID
 * @returns {Promise<Object>} Article object with all fields
 * @throws {NotFoundError} If article doesn't exist
 * @throws {DatabaseError} If database query fails
 * 
 * @example
 * const article = await getArticleById(123);
 * console.log(article.title);
 */
export const getArticleById = async (id) => {
  // implementation
};
```

### 5.2 README Files

**Every directory should have a README**:
```markdown
# Articles Module

## Overview
Handles all article-related operations including CRUD, search, and publication.

## Files
- `articles-controller.js` - Business logic for article operations
- `articles-routes.js` - API endpoint definitions
- `articles-model.js` - Database queries and data access

## Usage
```javascript
import { getArticleById } from './articles-controller.js';
const article = await getArticleById(123);
```

## API Endpoints
- `GET /api/v1/articles` - List all articles
- `GET /api/v1/articles/:id` - Get single article
- `POST /api/v1/articles` - Create new article
```

### 5.3 Changelog

**Maintain CHANGELOG.md for significant changes**:
```markdown
# Changelog

## [1.2.0] - 2025-10-26
### Added
- Full-text search functionality with Elasticsearch
- Article recommendation engine
- User reading history tracking

### Changed
- Improved article query performance with new indexes
- Updated authentication to use refresh token rotation

### Fixed
- Fixed pagination bug in article listing
- Corrected timezone handling in published_at field
```

---

## 6. Git & Version Control

### 6.1 Commit Messages

**Use conventional commit format**:
```
[PHASE-X] Type: Brief description - Priority

Type can be:
- feat: New feature
- fix: Bug fix
- docs: Documentation changes
- style: Code formatting (no logic change)
- refactor: Code restructuring (no behavior change)
- test: Adding or updating tests
- chore: Maintenance tasks

Examples:
[PHASE-1] feat: Add JWT authentication system - P1
[PHASE-2] fix: Correct article pagination bug - P1
[PHASE-3] docs: Update API documentation - P2
```

### 6.2 Branch Naming

**Use descriptive branch names**:
```
✓ GOOD:
  phase-1-foundation
  phase-2-backend-infrastructure
  feature/article-recommendations
  fix/pagination-bug
  hotfix/security-vulnerability

✗ BAD:
  dev
  test
  fix
  new-feature
```

### 6.3 Pull Request Guidelines

**PR Template**:
```markdown
## Description
Brief description of changes and why they're needed.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe tests performed and results.

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests pass locally
- [ ] Dependent changes merged
```

---

## 7. Testing Standards

### 7.1 Test Organization

**Mirror source code structure**:
```
src/
  ├── controllers/
  │   └── articles-controller.js
  └── utils/
      └── validators.js

tests/
  ├── controllers/
  │   └── articles-controller.test.js
  └── utils/
      └── validators.test.js
```

### 7.2 Test Naming

**Use descriptive test names**:
```javascript
// ✓ GOOD - Descriptive test names
describe('ArticleController', () => {
  describe('createArticle', () => {
    it('should create article with valid data', async () => {
      // test
    });
    
    it('should return 400 when title is missing', async () => {
      // test
    });
    
    it('should return 401 when user is not authenticated', async () => {
      // test
    });
  });
});

// ✗ BAD - Vague test names
describe('ArticleController', () => {
  it('works', () => {
    // test
  });
  
  it('test 2', () => {
    // test
  });
});
```

### 7.3 Test Coverage

**Aim for high coverage of critical paths**:
```javascript
// Minimum coverage targets
- Overall: 80%
- Critical business logic: 95%
- Utility functions: 90%
- Controllers: 85%
- Routes: 75%
```

---

## 8. Security Standards

### 8.1 Environment Variables

**Never commit secrets**:
```javascript
// ✓ GOOD - Use environment variables
const config = {
  database: {
    host: process.env.DB_HOST,
    password: process.env.DB_PASSWORD
  },
  jwt: {
    secret: process.env.JWT_SECRET
  }
};

// ✗ BAD - Hardcoded secrets
const config = {
  database: {
    host: 'localhost',
    password: 'MySecretPassword123!'
  }
};
```

### 8.2 Input Sanitization

**Sanitize all user inputs**:
```javascript
import validator from 'validator';

// ✓ GOOD - Sanitize inputs
const sanitizeArticleInput = (data) => {
  return {
    title: validator.escape(data.title.trim()),
    content: validator.escape(data.content.trim()),
    slug: validator.escape(data.slug.toLowerCase().trim())
  };
};
```

### 8.3 Authentication & Authorization

**Always verify user permissions**:
```javascript
// ✓ GOOD - Check permissions
export const deleteArticle = async (req, res) => {
  const article = await Article.findById(req.params.id);
  
  if (!article) {
    return res.status(404).json({ error: 'Article not found' });
  }
  
  // Verify user owns the article or is admin
  if (article.author_id !== req.user.id && !req.user.isAdmin) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  await article.delete();
  res.status(204).send();
};
```

---

## 9. Performance Standards

### 9.1 Response Time Targets

**API Performance Goals**:
- Simple GET requests: < 100ms
- Complex queries: < 500ms
- POST/PUT requests: < 1s
- Search operations: < 2s

### 9.2 Database Query Optimization

**Use indexes and limit result sets**:
```javascript
// ✓ GOOD - Optimized query
const getRecentArticles = async (limit = 20, offset = 0) => {
  const result = await query(
    `SELECT a.*, u.username, c.name as category_name
     FROM articles a
     JOIN users u ON a.author_id = u.id
     JOIN categories c ON a.category_id = c.id
     WHERE a.is_published = true
     ORDER BY a.published_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  return result.rows;
};

// ✗ BAD - Fetch all then filter in code
const getRecentArticles = async () => {
  const result = await query('SELECT * FROM articles');
  return result.rows
    .filter(a => a.is_published)
    .sort((a, b) => b.published_at - a.published_at)
    .slice(0, 20);
};
```

### 9.3 Caching Strategy

**Cache frequently accessed data**:
```javascript
import { redis } from '../config/redis.js';

// ✓ GOOD - Cache with TTL
const getArticleById = async (id) => {
  const cacheKey = `article:${id}`;
  
  // Check cache first
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // Fetch from database
  const result = await query('SELECT * FROM articles WHERE id = $1', [id]);
  const article = result.rows[0];
  
  // Cache for 5 minutes
  await redis.setex(cacheKey, 300, JSON.stringify(article));
  
  return article;
};
```

---

## 10. AI Agent Development Standards

### 10.1 Agent Communication

**Use consistent message format**:
```javascript
// ✓ GOOD - Structured agent messages
const agentMessage = {
  type: 'TASK_REQUEST',
  from: 'COO_AGENT',
  to: 'CRAWLER_AGENT',
  priority: 'HIGH',
  payload: {
    action: 'DISCOVER_NEWS',
    params: {
      category: 'technology',
      limit: 50
    }
  },
  timestamp: new Date().toISOString(),
  correlation_id: 'task_123456'
};
```

### 10.2 Agent Error Handling

**Implement retry logic and fallbacks**:
```javascript
// ✓ GOOD - Resilient agent with retries
const executeAgentTask = async (task, maxRetries = 3) => {
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      const result = await performTask(task);
      return result;
    } catch (error) {
      attempt++;
      logger.warn(`Agent task failed (attempt ${attempt}/${maxRetries}):`, error);
      
      if (attempt >= maxRetries) {
        // Notify monitoring system
        await notifyAgentFailure(task, error);
        throw error;
      }
      
      // Exponential backoff
      await sleep(Math.pow(2, attempt) * 1000);
    }
  }
};
```

### 10.3 Agent Logging

**Comprehensive logging for debugging**:
```javascript
// ✓ GOOD - Detailed agent logging
logger.info('Crawler agent starting', {
  agent_id: 'crawler_001',
  task_id: task.id,
  sources: task.sources.length
});

logger.debug('Fetching articles from source', {
  source: source.name,
  url: source.url
});

logger.error('Failed to fetch articles', {
  source: source.name,
  error: error.message,
  stack: error.stack
});
```

---

## Enforcement

### Pre-commit Hooks

```bash
# .husky/pre-commit
#!/bin/sh
npm run lint
npm run format
npm test
```

### Code Review Checklist

Before approving any PR, verify:
- [ ] Follows coding standards
- [ ] Includes tests
- [ ] Documentation updated
- [ ] No security issues
- [ ] Performance considered
- [ ] Error handling comprehensive

---

## Resources

**Tools**:
- ESLint: https://eslint.org/
- Prettier: https://prettier.io/
- Husky: https://typicode.github.io/husky/

**References**:
- Airbnb JavaScript Style Guide: https://github.com/airbnb/javascript
- Node.js Best Practices: https://github.com/goldbergyoni/nodebestpractices

---

**Document Version**: 1.0  
**Last Updated**: October 26, 2025  
**Next Review**: January 26, 2026
