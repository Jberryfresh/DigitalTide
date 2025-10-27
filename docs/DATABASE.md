# DigitalTide Database Documentation

## Overview

The DigitalTide database architecture is designed to support a high-performance, AI-powered news platform with comprehensive analytics, user management, and content delivery capabilities.

## Database Stack

- **PostgreSQL 16**: Primary relational database
- **Redis**: Caching and session management
- **Elasticsearch**: Full-text search and analytics
- **Qdrant**: Vector database for content similarity

## PostgreSQL Schema

### Core Tables

#### Users Table
Manages user accounts, authentication, and profiles.

**Key Features:**
- UUID primary keys
- Bcrypt password hashing
- Role-based access control (user, admin, super_admin)
- Email verification flow
- Password reset tokens
- Account lockout after failed login attempts
- User preferences stored as JSONB

**Indexes:**
- `email` (unique, for login lookups)
- `role` (for permission checks)
- `is_active` (for filtering active users)

#### Articles Table
Central content table with comprehensive metadata.

**Key Features:**
- Draft, review, and published workflows
- Quality scoring system (fact-check, SEO, readability)
- Agent attribution for AI-generated content
- Engagement metrics (views, likes, shares, comments)
- Soft deletes with `deleted_at` timestamp
- Full-text search capabilities
- Scheduled publishing

**Indexes:**
- `slug` (unique, for URL routing)
- `status` (for filtering by publication status)
- `published_at` (DESC, for chronological listings)
- `category_id` (for category filtering)
- `quality_score` (DESC, for quality sorting)
- Full-text search index on title + content

#### Categories Table
Organizes content into hierarchical topics.

**Key Features:**
- Icon and color customization
- Sort ordering for UI display
- Active/inactive status
- URL-friendly slugs

#### Tags Table
Flexible article classification system.

**Key Features:**
- Usage count tracking
- Automatic count updates via triggers
- URL-friendly slugs

#### Sources Table
External news sources for content aggregation.

**Key Features:**
- Source type (RSS, API, website, social media)
- Credibility scoring (0.00 to 1.00)
- API and crawl configuration stored as JSONB
- Crawl frequency and success tracking
- Error monitoring

#### Agent Tasks Table
Task queue for AI agent job processing.

**Key Features:**
- Task status tracking (pending, processing, completed, failed)
- Priority levels (low, medium, high, critical)
- Retry logic with max retry count
- Task timeout configuration
- Result and error storage as JSONB
- Scheduled execution

**Indexes:**
- `status` (for queue processing)
- `agent_name` (for agent-specific queries)
- `priority` (for priority-based scheduling)
- `scheduled_at` (for time-based execution)

#### Analytics Events Table
Comprehensive user behavior tracking.

**Key Features:**
- Event type classification
- User and article associations
- Session tracking
- Device, browser, and OS detection
- Geographic data (country, city)
- IP address and user agent logging
- Extensible metadata as JSONB

**Production Note:** This table should be partitioned by month for optimal performance.

### Junction Tables

#### article_tags
Links articles to multiple tags (many-to-many).

#### article_sources
Links articles to their source materials with relevance scoring.

### Supporting Tables

#### reading_list
User-saved articles with reading progress tracking.

**Key Features:**
- Reading progress percentage
- Completion status
- Personal notes
- Unique constraint per user-article pair

#### newsletter_subscriptions
Email newsletter subscriber management.

**Key Features:**
- Subscription preferences as JSONB
- Unique unsubscribe tokens
- Subscription status tracking
- Last sent timestamp

#### comments
User comments on articles (optional, disabled by default).

**Key Features:**
- Nested comments (parent_id for replies)
- Moderation (is_approved, is_flagged)
- Soft deletes
- Like count tracking

#### refresh_tokens
JWT refresh token management.

**Key Features:**
- Token revocation
- Expiration tracking
- User association

### Custom Types (Enums)

```sql
user_role: 'user' | 'admin' | 'super_admin'
article_status: 'draft' | 'pending_review' | 'approved' | 'published' | 'archived'
task_status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
task_priority: 'low' | 'medium' | 'high' | 'critical'
source_type: 'rss_feed' | 'api' | 'website' | 'social_media'
```

## Database Triggers

### Auto-Update Triggers
Automatically update `updated_at` timestamp on record modification:
- users
- categories
- articles
- sources
- agent_tasks
- reading_list
- comments

### Tag Usage Triggers
- **increment_tag_usage**: Increment tag usage count when article is tagged
- **decrement_tag_usage**: Decrement tag usage count when tag is removed

## Migration System

### Running Migrations

```bash
# Run all pending migrations
npm run db:migrate

# Check migration status
npm run db:migrate:status

# Rollback last migration (not yet implemented)
npm run db:rollback
```

### Migration Files

Located in `database/migrations/`:
- `001_initial_schema.sql` - Complete database schema

### Adding New Migrations

1. Create a new file: `002_descriptive_name.sql`
2. Use sequential numbering
3. Include both UP and DOWN migrations (future enhancement)
4. Test thoroughly in development

## Seed Data

### Running Seeds

```bash
# Load all seed data
npm run db:seed

# Complete database setup (migrate + seed)
npm run db:setup

# Reset database (drop + recreate + migrate + seed)
npm run db:reset
```

### Seed Files

Located in `database/seeds/`:
- `001_initial_data.sql` - Categories and admin user
- `002_news_sources.sql` - Trusted news sources
- `003_sample_articles.sql` - Demo articles and tags

## Database Connection

### Connection Pool Configuration

```javascript
import { pool, testConnection, query, transaction } from './src/database/index.js';

// Test connection
await testConnection();

// Execute query
const result = await query('SELECT * FROM articles WHERE status = $1', ['published']);

// Use transaction
await transaction(async (client) => {
  await client.query('UPDATE articles SET view_count = view_count + 1 WHERE id = $1', [articleId]);
  await client.query('INSERT INTO analytics_events ...');
});
```

### Query Helpers

```javascript
import db from './src/database/index.js';

// Find by ID
const article = await db.findById('articles', articleId);

// Find all with pagination
const { data, total, totalPages } = await db.findAll('articles', {
  where: 'status = $1',
  params: ['published'],
  orderBy: 'published_at DESC',
  limit: 20,
  offset: 0
});

// Insert
const newArticle = await db.insert('articles', {
  title: 'My Article',
  slug: 'my-article',
  content: 'Content here...',
  status: 'draft'
});

// Update
const updated = await db.update('articles', articleId, {
  title: 'Updated Title'
});

// Soft delete
const deleted = await db.softDelete('articles', articleId);

// Full-text search
const results = await db.fullTextSearch(
  'articles',
  'title || content',
  'climate change',
  { limit: 10 }
);
```

## Performance Optimization

### Indexing Strategy

1. **Primary Keys**: UUID v4 for distributed systems
2. **Foreign Keys**: Indexed for JOIN performance
3. **Search Fields**: Full-text search indexes on content
4. **Sort Fields**: Indexes on frequently sorted columns (created_at, published_at, score fields)
5. **Filter Fields**: Indexes on status, role, is_active fields

### Connection Pooling

- **Max Connections**: 20 (configurable via env)
- **Idle Timeout**: 30 seconds
- **Connection Timeout**: 2 seconds

### Query Optimization Tips

1. Use indexed fields in WHERE clauses
2. Limit result sets with LIMIT/OFFSET
3. Use prepared statements with parameterized queries
4. Batch inserts for bulk operations
5. Use transactions for multi-step operations

## Security

### Best Practices Implemented

1. **Parameterized Queries**: All queries use $1, $2, etc. to prevent SQL injection
2. **Password Hashing**: Bcrypt with 10 rounds
3. **Token Storage**: Refresh tokens stored securely with expiration
4. **Soft Deletes**: Maintain data integrity with deleted_at timestamps
5. **Access Control**: Role-based permissions at database level

### Environment Variables

Required in `.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=digitaltide
DB_USER=postgres
DB_PASSWORD=your_secure_password
DB_POOL_MAX=20
DB_POOL_IDLE_TIMEOUT=30000
DB_POOL_CONNECTION_TIMEOUT=2000
```

## Backup and Recovery

### Backup Strategy (Production)

```bash
# Full backup
pg_dump digitaltide > backup_$(date +%Y%m%d_%H%M%S).sql

# Compressed backup
pg_dump digitaltide | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz

# Schema only
pg_dump --schema-only digitaltide > schema_backup.sql

# Data only
pg_dump --data-only digitaltide > data_backup.sql
```

### Restore

```bash
# Restore from backup
psql digitaltide < backup.sql

# Restore compressed
gunzip -c backup.sql.gz | psql digitaltide
```

## Monitoring

### Key Metrics to Monitor

1. **Connection Pool Usage**: Active vs. idle connections
2. **Query Performance**: Slow query log (queries > 1s)
3. **Table Size Growth**: Monitor articles and analytics_events
4. **Index Usage**: Verify indexes are being used
5. **Lock Contention**: Monitor for blocking queries

### Useful Queries

```sql
-- Active connections
SELECT count(*) FROM pg_stat_activity WHERE datname = 'digitaltide';

-- Database size
SELECT pg_size_pretty(pg_database_size('digitaltide'));

-- Table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Slow queries (enable pg_stat_statements extension)
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

## Scaling Considerations

### Horizontal Scaling

1. **Read Replicas**: Use PostgreSQL streaming replication for read-heavy workloads
2. **Partitioning**: Partition analytics_events by month/year
3. **Caching**: Use Redis for frequently accessed data

### Vertical Scaling

1. **Increase Connection Pool**: Adjust DB_POOL_MAX based on load
2. **Memory**: Increase shared_buffers (25% of RAM)
3. **CPU**: Multi-core for parallel query execution

## Troubleshooting

### Common Issues

**Connection Refused**
- Check Docker containers: `docker-compose ps`
- Verify PostgreSQL is running: `docker-compose logs postgres`
- Check environment variables in `.env`

**Migration Fails**
- Check migration syntax
- Verify database connection
- Check schema_migrations table

**Slow Queries**
- Enable query logging
- Analyze query plans with EXPLAIN
- Add indexes where needed

**Deadlocks**
- Review transaction order
- Keep transactions short
- Use appropriate isolation levels

## Future Enhancements

1. **Partitioning**: Implement time-based partitioning for analytics_events
2. **Sharding**: Distribute data across multiple databases
3. **CDC**: Change Data Capture for real-time sync
4. **Materialized Views**: Pre-computed aggregations for dashboards
5. **TimescaleDB**: Time-series extension for analytics

---

**Last Updated**: Phase 1 - Database Implementation
**Version**: 1.0.0
