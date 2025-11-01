import { query } from '../database/queries.js';
import { ApiError, asyncHandler } from '../middleware/errorHandler.js';

/**
 * @desc    Get all tags
 * @route   GET /api/v1/tags
 * @access  Public
 */
export const getTags = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 50,
    min_usage = 0,
    sort = 'name', // name, usage, recent
  } = req.query;

  const offset = (page - 1) * limit;

  // Determine sort order
  let orderBy;
  switch (sort) {
    case 'usage':
      orderBy = 'usage_count DESC, t.name ASC';
      break;
    case 'recent':
      orderBy = 't.created_at DESC';
      break;
    case 'name':
    default:
      orderBy = 't.name ASC';
      break;
  }

  const tagsQuery = `
    SELECT 
      t.*,
      COUNT(at.article_id) as usage_count
    FROM tags t
    LEFT JOIN article_tags at ON t.id = at.tag_id
    GROUP BY t.id
    HAVING COUNT(at.article_id) >= $1
    ORDER BY ${orderBy}
    LIMIT $2 OFFSET $3
  `;

  const countQuery = `
    SELECT COUNT(*) FROM (
      SELECT t.id
      FROM tags t
      LEFT JOIN article_tags at ON t.id = at.tag_id
      GROUP BY t.id
      HAVING COUNT(at.article_id) >= $1
    ) as filtered
  `;

  const tags = await query(tagsQuery, [min_usage, limit, offset]);
  const totalResult = await query(countQuery, [min_usage]);
  const total = parseInt(totalResult.rows[0].count);

  res.json({
    success: true,
    data: {
      tags: tags.rows,
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
 * @desc    Get tag by ID
 * @route   GET /api/v1/tags/:id
 * @access  Public
 */
export const getTag = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { include_articles = 'false' } = req.query;

  // Get tag with usage count
  const tagResult = await query(
    `
    SELECT 
      t.*,
      COUNT(at.article_id) as usage_count
    FROM tags t
    LEFT JOIN article_tags at ON t.id = at.tag_id
    WHERE t.id = $1
    GROUP BY t.id
    `,
    [id]
  );

  if (tagResult.rows.length === 0) {
    throw new ApiError(404, 'Tag not found');
  }

  const tag = tagResult.rows[0];

  // Get recent articles if requested
  if (include_articles === 'true') {
    const articles = await query(
      `
      SELECT 
        a.id, a.title, a.slug, a.published_at,
        u.username as author_username
      FROM articles a
      INNER JOIN article_tags at ON a.id = at.article_id
      INNER JOIN users u ON a.author_id = u.id
      WHERE at.tag_id = $1 
        AND a.status = 'published'
        AND a.deleted_at IS NULL
      ORDER BY a.published_at DESC
      LIMIT 10
      `,
      [id]
    );
    tag.recent_articles = articles.rows;
  }

  res.json({
    success: true,
    data: { tag },
  });
});

/**
 * @desc    Create new tag
 * @route   POST /api/v1/tags
 * @access  Private (Admin/Editor)
 */
export const createTag = asyncHandler(async (req, res) => {
  const { name, slug, description } = req.body;

  // Check if slug already exists
  const existing = await query('SELECT id FROM tags WHERE slug = $1', [slug]);

  if (existing.rows.length > 0) {
    throw new ApiError(409, 'Tag slug already exists');
  }

  const result = await query(
    `
    INSERT INTO tags (name, slug, description)
    VALUES ($1, $2, $3)
    RETURNING *
    `,
    [name, slug, description || null]
  );

  res.status(201).json({
    success: true,
    data: { tag: result.rows[0] },
    message: 'Tag created successfully',
  });
});

/**
 * @desc    Update tag
 * @route   PUT /api/v1/tags/:id
 * @access  Private (Admin/Editor)
 */
export const updateTag = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, slug, description } = req.body;

  // Check if tag exists
  const existing = await query('SELECT * FROM tags WHERE id = $1', [id]);

  if (existing.rows.length === 0) {
    throw new ApiError(404, 'Tag not found');
  }

  // Check if new slug conflicts with another tag
  if (slug && slug !== existing.rows[0].slug) {
    const slugCheck = await query('SELECT id FROM tags WHERE slug = $1 AND id != $2', [slug, id]);

    if (slugCheck.rows.length > 0) {
      throw new ApiError(409, 'Tag slug already exists');
    }
  }

  const result = await query(
    `
    UPDATE tags
    SET 
      name = COALESCE($1, name),
      slug = COALESCE($2, slug),
      description = COALESCE($3, description),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $4
    RETURNING *
    `,
    [name, slug, description, id]
  );

  res.json({
    success: true,
    data: { tag: result.rows[0] },
    message: 'Tag updated successfully',
  });
});

/**
 * @desc    Delete tag
 * @route   DELETE /api/v1/tags/:id
 * @access  Private (Admin only)
 */
export const deleteTag = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if tag exists
  const existing = await query('SELECT * FROM tags WHERE id = $1', [id]);

  if (existing.rows.length === 0) {
    throw new ApiError(404, 'Tag not found');
  }

  // Check if tag is used by articles
  const usageCount = await query('SELECT COUNT(*) FROM article_tags WHERE tag_id = $1', [id]);

  if (parseInt(usageCount.rows[0].count) > 0) {
    throw new ApiError(
      409,
      'Cannot delete tag that is associated with articles. Please remove tag from articles first.'
    );
  }

  await query('DELETE FROM tags WHERE id = $1', [id]);

  res.json({
    success: true,
    message: 'Tag deleted successfully',
  });
});

/**
 * @desc    Get popular tags
 * @route   GET /api/v1/tags/popular
 * @access  Public
 */
export const getPopularTags = asyncHandler(async (req, res) => {
  const { limit = 20 } = req.query;

  const tags = await query(
    `
    SELECT 
      t.*,
      COUNT(at.article_id) as usage_count
    FROM tags t
    INNER JOIN article_tags at ON t.id = at.tag_id
    INNER JOIN articles a ON at.article_id = a.id
    WHERE a.status = 'published' AND a.deleted_at IS NULL
    GROUP BY t.id
    HAVING COUNT(at.article_id) > 0
    ORDER BY usage_count DESC, t.name ASC
    LIMIT $1
    `,
    [limit]
  );

  res.json({
    success: true,
    data: { tags: tags.rows },
  });
});

/**
 * @desc    Search tags by name
 * @route   GET /api/v1/tags/search
 * @access  Public
 */
export const searchTags = asyncHandler(async (req, res) => {
  const { q, limit = 20 } = req.query;

  if (!q || q.trim().length === 0) {
    throw new ApiError(400, 'Search query is required');
  }

  const tags = await query(
    `
    SELECT 
      t.*,
      COUNT(at.article_id) as usage_count
    FROM tags t
    LEFT JOIN article_tags at ON t.id = at.tag_id
    WHERE t.name ILIKE $1 OR t.slug ILIKE $1
    GROUP BY t.id
    ORDER BY usage_count DESC, t.name ASC
    LIMIT $2
    `,
    [`%${q}%`, limit]
  );

  res.json({
    success: true,
    data: {
      query: q,
      tags: tags.rows,
    },
  });
});
