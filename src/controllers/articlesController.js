/**
 * Articles Controller
 * Handles article CRUD operations
 */

import { ApiError, asyncHandler } from '../middleware/errorHandler.js';
import { findById, findAll, insert, update, softDelete, query } from '../database/queries.js';

/**
 * Get all articles with pagination and filtering
 * GET /api/v1/articles
 */
export const getArticles = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    status = 'published',
    category,
    tag,
    search,
    sortBy = 'published_at',
    order = 'DESC',
  } = req.query;

  const offset = (page - 1) * limit;
  const conditions = [];
  const params = [];
  let paramCount = 0;

  // Filter by status
  if (status) {
    paramCount++;
    conditions.push(`status = $${paramCount}`);
    params.push(status);
  }

  // Filter by category
  if (category) {
    paramCount++;
    conditions.push(`category_id = $${paramCount}`);
    params.push(category);
  }

  // Filter by tag
  if (tag) {
    paramCount++;
    conditions.push(`id IN (SELECT article_id FROM article_tags WHERE tag_id = $${paramCount})`);
    params.push(tag);
  }

  // Search in title and content
  if (search) {
    paramCount++;
    conditions.push(`(to_tsvector('english', title || ' ' || content) @@ plainto_tsquery('english', $${paramCount}))`);
    params.push(search);
  }

  // Only show published articles for non-authenticated users
  if (!req.user) {
    conditions.push(`status = 'published'`);
    conditions.push(`deleted_at IS NULL`);
  } else if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    paramCount++;
    conditions.push(`(status = 'published' OR author_id = $${paramCount})`);
    params.push(req.user.id);
    conditions.push(`deleted_at IS NULL`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Get total count
  const countQuery = `SELECT COUNT(*) FROM articles ${whereClause}`;
  const countResult = await query(countQuery, params);
  const total = parseInt(countResult.rows[0].count);

  // Get articles
  const articlesQuery = `
    SELECT 
      a.*,
      c.name as category_name,
      c.slug as category_slug,
      u.first_name as author_first_name,
      u.last_name as author_last_name,
      COALESCE(
        json_agg(
          DISTINCT jsonb_build_object('id', t.id, 'name', t.name, 'slug', t.slug)
        ) FILTER (WHERE t.id IS NOT NULL),
        '[]'
      ) as tags
    FROM articles a
    LEFT JOIN categories c ON a.category_id = c.id
    LEFT JOIN users u ON a.author_id = u.id
    LEFT JOIN article_tags at ON a.id = at.article_id
    LEFT JOIN tags t ON at.tag_id = t.id
    ${whereClause}
    GROUP BY a.id, c.name, c.slug, u.first_name, u.last_name
    ORDER BY ${sortBy} ${order}
    LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
  `;

  const result = await query(articlesQuery, [...params, limit, offset]);

  res.json({
    success: true,
    data: result.rows,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

/**
 * Get single article by ID or slug
 * GET /api/v1/articles/:id
 */
export const getArticle = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if it's a UUID (ID) or slug
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  const articleQuery = `
    SELECT 
      a.*,
      c.name as category_name,
      c.slug as category_slug,
      u.first_name as author_first_name,
      u.last_name as author_last_name,
      u.email as author_email,
      COALESCE(
        json_agg(
          DISTINCT jsonb_build_object('id', t.id, 'name', t.name, 'slug', t.slug)
        ) FILTER (WHERE t.id IS NOT NULL),
        '[]'
      ) as tags,
      COALESCE(
        json_agg(
          DISTINCT jsonb_build_object('id', s.id, 'name', s.name, 'url', asrc.source_url)
        ) FILTER (WHERE s.id IS NOT NULL),
        '[]'
      ) as sources
    FROM articles a
    LEFT JOIN categories c ON a.category_id = c.id
    LEFT JOIN users u ON a.author_id = u.id
    LEFT JOIN article_tags at ON a.id = at.article_id
    LEFT JOIN tags t ON at.tag_id = t.id
    LEFT JOIN article_sources asrc ON a.id = asrc.article_id
    LEFT JOIN sources s ON asrc.source_id = s.id
    WHERE ${isUUID ? 'a.id' : 'a.slug'} = $1
    GROUP BY a.id, c.name, c.slug, u.first_name, u.last_name, u.email
  `;

  const result = await query(articleQuery, [id]);

  if (result.rows.length === 0) {
    throw new ApiError(404, 'Article not found');
  }

  const article = result.rows[0];

  // Check permissions
  if (article.status !== 'published' && article.deleted_at) {
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'super_admin' && req.user.id !== article.author_id)) {
      throw new ApiError(404, 'Article not found');
    }
  }

  // Increment view count
  await query('UPDATE articles SET view_count = view_count + 1 WHERE id = $1', [article.id]);

  res.json({
    success: true,
    data: article,
  });
});

/**
 * Create new article
 * POST /api/v1/articles
 */
export const createArticle = asyncHandler(async (req, res) => {
  const {
    title,
    slug,
    content,
    summary,
    featuredImageUrl,
    categoryId,
    tags,
    status = 'draft',
    metadata,
  } = req.body;

  // Check if slug already exists
  const existingArticle = await query('SELECT id FROM articles WHERE slug = $1', [slug]);

  if (existingArticle.rows.length > 0) {
    throw new ApiError(409, 'Article with this slug already exists');
  }

  // Calculate word count and reading time
  const wordCount = content.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / 200); // Average reading speed: 200 words/min

  // Create article
  const article = await insert('articles', {
    title,
    slug,
    content,
    summary: summary || null,
    featured_image_url: featuredImageUrl || null,
    category_id: categoryId || null,
    author_id: req.user.id,
    status,
    metadata: metadata || {},
    word_count: wordCount,
    reading_time: readingTime,
    published_at: status === 'published' ? new Date() : null,
  });

  // Add tags if provided
  if (tags && tags.length > 0) {
    for (const tagId of tags) {
      await insert('article_tags', {
        article_id: article.id,
        tag_id: tagId,
      });
    }
  }

  res.status(201).json({
    success: true,
    message: 'Article created successfully',
    data: article,
  });
});

/**
 * Update article
 * PUT /api/v1/articles/:id
 */
export const updateArticle = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    title,
    slug,
    content,
    summary,
    featuredImageUrl,
    categoryId,
    tags,
    status,
    metadata,
  } = req.body;

  // Get existing article
  const existingArticle = await findById('articles', id);

  if (!existingArticle) {
    throw new ApiError(404, 'Article not found');
  }

  // Check permissions
  if (req.user.role !== 'admin' && req.user.role !== 'super_admin' && req.user.id !== existingArticle.author_id) {
    throw new ApiError(403, 'You do not have permission to update this article');
  }

  // Build update object
  const updateData = {};

  if (title !== undefined) updateData.title = title;
  if (slug !== undefined) {
    // Check if new slug already exists
    if (slug !== existingArticle.slug) {
      const slugExists = await query('SELECT id FROM articles WHERE slug = $1 AND id != $2', [slug, id]);
      if (slugExists.rows.length > 0) {
        throw new ApiError(409, 'Article with this slug already exists');
      }
    }
    updateData.slug = slug;
  }
  if (content !== undefined) {
    updateData.content = content;
    updateData.word_count = content.split(/\s+/).length;
    updateData.reading_time = Math.ceil(updateData.word_count / 200);
  }
  if (summary !== undefined) updateData.summary = summary;
  if (featuredImageUrl !== undefined) updateData.featured_image_url = featuredImageUrl;
  if (categoryId !== undefined) updateData.category_id = categoryId;
  if (metadata !== undefined) updateData.metadata = metadata;
  if (status !== undefined) {
    updateData.status = status;
    // Set published_at when publishing for the first time
    if (status === 'published' && !existingArticle.published_at) {
      updateData.published_at = new Date();
    }
  }

  // Update article
  const article = await update('articles', id, updateData);

  // Update tags if provided
  if (tags !== undefined) {
    // Remove existing tags
    await query('DELETE FROM article_tags WHERE article_id = $1', [id]);
    
    // Add new tags
    if (tags.length > 0) {
      for (const tagId of tags) {
        await insert('article_tags', {
          article_id: id,
          tag_id: tagId,
        });
      }
    }
  }

  res.json({
    success: true,
    message: 'Article updated successfully',
    data: article,
  });
});

/**
 * Delete article (soft delete)
 * DELETE /api/v1/articles/:id
 */
export const deleteArticle = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const article = await findById('articles', id);

  if (!article) {
    throw new ApiError(404, 'Article not found');
  }

  // Check permissions
  if (req.user.role !== 'admin' && req.user.role !== 'super_admin' && req.user.id !== article.author_id) {
    throw new ApiError(403, 'You do not have permission to delete this article');
  }

  await softDelete('articles', id);

  res.json({
    success: true,
    message: 'Article deleted successfully',
  });
});

export default {
  getArticles,
  getArticle,
  createArticle,
  updateArticle,
  deleteArticle,
};
