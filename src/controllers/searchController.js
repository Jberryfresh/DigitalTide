import { query } from '../database/queries.js';
import { ApiError, asyncHandler } from '../middleware/errorHandler.js';

/**
 * @desc    Search articles with advanced filtering
 * @route   GET /api/v1/search
 * @access  Public
 */
export const searchArticles = asyncHandler(async (req, res) => {
  const {
    q, // search query
    page = 1,
    limit = 20,
    status = 'published',
    category_id,
    tag_id,
    author_id,
    source_id,
    from_date,
    to_date,
    sort = 'relevance', // relevance, date, popularity
    min_reading_time,
    max_reading_time,
  } = req.query;

  if (!q || q.trim().length === 0) {
    throw new ApiError(400, 'Search query is required');
  }

  const offset = (page - 1) * limit;
  const searchQuery = q.trim();

  // Build WHERE conditions
  const conditions = ['a.deleted_at IS NULL'];
  const params = [];
  let paramIndex = 1;

  // Full-text search condition
  conditions.push(`a.search_vector @@ plainto_tsquery('english', $${paramIndex})`);
  params.push(searchQuery);
  paramIndex++;

  // Status filter
  if (status) {
    conditions.push(`a.status = $${paramIndex}`);
    params.push(status);
    paramIndex++;
  }

  // Category filter
  if (category_id) {
    conditions.push(`a.category_id = $${paramIndex}`);
    params.push(category_id);
    paramIndex++;
  }

  // Tag filter
  if (tag_id) {
    conditions.push(`EXISTS (
      SELECT 1 FROM article_tags at 
      WHERE at.article_id = a.id AND at.tag_id = $${paramIndex}
    )`);
    params.push(tag_id);
    paramIndex++;
  }

  // Author filter
  if (author_id) {
    conditions.push(`a.author_id = $${paramIndex}`);
    params.push(author_id);
    paramIndex++;
  }

  // Source filter
  if (source_id) {
    conditions.push(`EXISTS (
      SELECT 1 FROM article_sources asrc 
      WHERE asrc.article_id = a.id AND asrc.source_id = $${paramIndex}
    )`);
    params.push(source_id);
    paramIndex++;
  }

  // Date range filters
  if (from_date) {
    conditions.push(`a.published_at >= $${paramIndex}`);
    params.push(from_date);
    paramIndex++;
  }

  if (to_date) {
    conditions.push(`a.published_at <= $${paramIndex}`);
    params.push(to_date);
    paramIndex++;
  }

  // Reading time filters
  if (min_reading_time) {
    conditions.push(`a.reading_time >= $${paramIndex}`);
    params.push(min_reading_time);
    paramIndex++;
  }

  if (max_reading_time) {
    conditions.push(`a.reading_time <= $${paramIndex}`);
    params.push(max_reading_time);
    paramIndex++;
  }

  // Determine sort order
  let orderByClause;
  switch (sort) {
    case 'date':
      orderByClause = 'a.published_at DESC';
      break;
    case 'popularity':
      orderByClause = 'a.views_count DESC, a.published_at DESC';
      break;
    case 'relevance':
    default:
      orderByClause =
        "ts_rank(a.search_vector, plainto_tsquery('english', $1)) DESC, a.published_at DESC";
      break;
  }

  // Main search query
  const searchQuerySQL = `
    SELECT 
      a.id,
      a.title,
      a.slug,
      a.summary,
      a.featured_image,
      a.published_at,
      a.reading_time,
      a.views_count,
      a.status,
      u.id as author_id,
      u.username as author_username,
      u.display_name as author_display_name,
      ${sort === 'relevance' ? "ts_rank(a.search_vector, plainto_tsquery('english', $1)) as relevance_score," : ''}
      ts_headline('english', a.content, plainto_tsquery('english', $1), 
        'MaxWords=50, MinWords=20, ShortWord=3, HighlightAll=FALSE, MaxFragments=2, FragmentDelimiter=" ... "'
      ) as excerpt,
      COALESCE(
        json_agg(DISTINCT jsonb_build_object(
          'id', c.id,
          'name', c.name,
          'slug', c.slug
        )) FILTER (WHERE c.id IS NOT NULL), 
        '[]'
      ) as categories,
      COALESCE(
        json_agg(DISTINCT jsonb_build_object(
          'id', t.id,
          'name', t.name,
          'slug', t.slug
        )) FILTER (WHERE t.id IS NOT NULL), 
        '[]'
      ) as tags
    FROM articles a
    INNER JOIN users u ON a.author_id = u.id
    LEFT JOIN categories c ON a.category_id = c.id
    LEFT JOIN article_tags at ON a.id = at.article_id
    LEFT JOIN tags t ON at.tag_id = t.id
    WHERE ${conditions.join(' AND ')}
    GROUP BY a.id, u.id, u.username, u.display_name
    ORDER BY ${orderByClause}
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  params.push(limit, offset);

  // Count query
  const countQuerySQL = `
    SELECT COUNT(DISTINCT a.id) as total
    FROM articles a
    WHERE ${conditions.join(' AND ')}
  `;

  const [articlesResult, countResult] = await Promise.all([
    query(searchQuerySQL, params),
    query(countQuerySQL, params.slice(0, paramIndex - 1)),
  ]);

  const total = parseInt(countResult.rows[0].total);

  res.json({
    success: true,
    data: {
      query: searchQuery,
      articles: articlesResult.rows,
      filters: {
        status,
        category_id,
        tag_id,
        author_id,
        source_id,
        from_date,
        to_date,
        sort,
        min_reading_time,
        max_reading_time,
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
});

/**
 * @desc    Get search suggestions based on query
 * @route   GET /api/v1/search/suggestions
 * @access  Public
 */
export const getSearchSuggestions = asyncHandler(async (req, res) => {
  const { q, limit = 10 } = req.query;

  if (!q || q.trim().length < 2) {
    return res.json({
      success: true,
      data: { suggestions: [] },
    });
  }

  const searchQuery = q.trim();

  // Get title suggestions using trigram similarity
  const suggestions = await query(
    `
    SELECT 
      id,
      title,
      slug,
      similarity(title, $1) as sim_score
    FROM articles
    WHERE 
      status = 'published'
      AND deleted_at IS NULL
      AND (
        title ILIKE $2
        OR similarity(title, $1) > 0.3
      )
    ORDER BY sim_score DESC, published_at DESC
    LIMIT $3
    `,
    [searchQuery, `%${searchQuery}%`, limit]
  );

  res.json({
    success: true,
    data: {
      query: searchQuery,
      suggestions: suggestions.rows,
    },
  });
});

/**
 * @desc    Get trending search terms
 * @route   GET /api/v1/search/trending
 * @access  Public
 */
export const getTrendingSearches = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  // Get most searched tags and categories as trending terms
  const trending = await query(
    `
    (
      SELECT 
        t.name as term,
        'tag' as type,
        COUNT(at.article_id) as popularity
      FROM tags t
      INNER JOIN article_tags at ON t.id = at.tag_id
      INNER JOIN articles a ON at.article_id = a.id
      WHERE a.status = 'published' 
        AND a.deleted_at IS NULL
        AND a.published_at >= NOW() - INTERVAL '7 days'
      GROUP BY t.id, t.name
      ORDER BY popularity DESC
      LIMIT $1
    UNION ALL
    (
      SELECT 
        c.name as term,
        'category' as type,
        COUNT(a.id) as popularity
      FROM categories c
      INNER JOIN articles a ON c.id = a.category_id
      WHERE a.status = 'published' 
        AND a.deleted_at IS NULL
        AND a.published_at >= NOW() - INTERVAL '7 days'
      GROUP BY c.id, c.name
      ORDER BY popularity DESC
      LIMIT $1
    )
    ORDER BY popularity DESC
    LIMIT $1
    `,
    [limit]
  );

  res.json({
    success: true,
    data: { trending: trending.rows },
  });
});

/**
 * @desc    Advanced multi-entity search (articles, categories, tags, authors)
 * @route   GET /api/v1/search/all
 * @access  Public
 */
export const searchAll = asyncHandler(async (req, res) => {
  const { q, limit = 5 } = req.query;

  if (!q || q.trim().length === 0) {
    throw new ApiError(400, 'Search query is required');
  }

  const searchQuery = q.trim();

  // Search articles
  const articlesPromise = query(
    `
    SELECT 
      'article' as type,
      id,
      title as name,
      slug,
      summary as description,
      published_at,
      ts_rank(search_vector, plainto_tsquery('english', $1)) as relevance
    FROM articles
    WHERE 
      search_vector @@ plainto_tsquery('english', $1)
      AND status = 'published'
      AND deleted_at IS NULL
    ORDER BY relevance DESC, published_at DESC
    LIMIT $2
    `,
    [searchQuery, limit]
  );

  // Search categories
  const categoriesPromise = query(
    `
    SELECT 
      'category' as type,
      id,
      name,
      slug,
      description,
      created_at
    FROM categories
    WHERE 
      name ILIKE $1 
      OR description ILIKE $1
    ORDER BY name ASC
    LIMIT $2
    `,
    [`%${searchQuery}%`, limit]
  );

  // Search tags
  const tagsPromise = query(
    `
    SELECT 
      'tag' as type,
      id,
      name,
      slug,
      description,
      created_at
    FROM tags
    WHERE 
      name ILIKE $1 
      OR description ILIKE $1
    ORDER BY name ASC
    LIMIT $2
    `,
    [`%${searchQuery}%`, limit]
  );

  // Search authors
  const authorsPromise = query(
    `
    SELECT 
      'author' as type,
      id,
      username as name,
      display_name as slug,
      bio as description,
      created_at
    FROM users
    WHERE 
      (username ILIKE $1 OR display_name ILIKE $1 OR bio ILIKE $1)
      AND role IN ('admin', 'editor', 'writer')
    ORDER BY username ASC
    LIMIT $2
    `,
    [`%${searchQuery}%`, limit]
  );

  const [articles, categories, tags, authors] = await Promise.all([
    articlesPromise,
    categoriesPromise,
    tagsPromise,
    authorsPromise,
  ]);

  res.json({
    success: true,
    data: {
      query: searchQuery,
      results: {
        articles: articles.rows,
        categories: categories.rows,
        tags: tags.rows,
        authors: authors.rows,
      },
      total: articles.rows.length + categories.rows.length + tags.rows.length + authors.rows.length,
    },
  });
});
