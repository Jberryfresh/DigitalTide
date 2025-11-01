import { query } from '../database/queries.js';
import { ApiError, asyncHandler } from '../middleware/errorHandler.js';

/**
 * @desc    Get all categories
 * @route   GET /api/v1/categories
 * @access  Public
 */
export const getCategories = asyncHandler(async (req, res) => {
  const {
    page = 1, limit = 50, parent_id = null, include_article_count = 'true',
  } = req.query;

  const offset = (page - 1) * limit;
  const includeCount = include_article_count === 'true';

  let categoriesQuery;
  let countQuery;
  let queryParams;

  if (parent_id) {
    // Get categories by parent
    categoriesQuery = includeCount
      ? `
        SELECT 
          c.*,
          COUNT(DISTINCT a.id) as article_count
        FROM categories c
        LEFT JOIN articles a ON c.id = a.category_id
        WHERE c.parent_id = $1
        GROUP BY c.id
        ORDER BY c.name ASC
        LIMIT $2 OFFSET $3
      `
      : `
        SELECT * FROM categories
        WHERE parent_id = $1
        ORDER BY name ASC
        LIMIT $2 OFFSET $3
      `;

    countQuery = 'SELECT COUNT(*) FROM categories WHERE parent_id = $1';
    queryParams = [parent_id, limit, offset];
  } else {
    // Get all categories or top-level only
    categoriesQuery = includeCount
      ? `
        SELECT 
          c.*,
          COUNT(DISTINCT a.id) as article_count
        FROM categories c
        LEFT JOIN articles a ON c.id = a.category_id
        GROUP BY c.id
        ORDER BY c.name ASC
        LIMIT $1 OFFSET $2
      `
      : `
        SELECT * FROM categories
        ORDER BY name ASC
        LIMIT $1 OFFSET $2
      `;

    countQuery = 'SELECT COUNT(*) FROM categories';
    queryParams = [limit, offset];
  }

  const categories = await query(categoriesQuery, queryParams);
  const totalResult = await query(countQuery, parent_id ? [parent_id] : []);
  const total = parseInt(totalResult.rows[0].count);

  res.json({
    success: true,
    data: {
      categories: categories.rows,
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
 * @desc    Get category by ID
 * @route   GET /api/v1/categories/:id
 * @access  Public
 */
export const getCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { include_children = 'false', include_articles = 'false' } = req.query;

  // Get category with article count
  const categoryResult = await query(
    `
    SELECT 
      c.*,
      COUNT(DISTINCT a.id) as article_count
    FROM categories c
    LEFT JOIN articles a ON c.id = a.category_id
    WHERE c.id = $1
    GROUP BY c.id
    `,
    [id],
  );

  if (categoryResult.rows.length === 0) {
    throw new ApiError(404, 'Category not found');
  }

  const category = categoryResult.rows[0];

  // Get parent category if exists
  if (category.parent_id) {
    const parent = await query('SELECT id, name, slug FROM categories WHERE id = $1', [
      category.parent_id,
    ]);
    category.parent = parent.rows[0] || null;
  }

  // Get child categories if requested
  if (include_children === 'true') {
    const children = await query(
      `
      SELECT 
        c.*,
        COUNT(DISTINCT a.id) as article_count
      FROM categories c
      LEFT JOIN articles a ON c.id = a.category_id
      WHERE c.parent_id = $1
      GROUP BY c.id
      ORDER BY c.name ASC
      `,
      [id],
    );
    category.children = children.rows;
  }

  // Get recent articles if requested
  if (include_articles === 'true') {
    const articles = await query(
      `
      SELECT 
        a.id, a.title, a.slug, a.published_at,
        u.username as author_username
      FROM articles a
      INNER JOIN users u ON a.author_id = u.id
      WHERE a.category_id = $1 
        AND a.status = 'published'
        AND a.deleted_at IS NULL
      ORDER BY a.published_at DESC
      LIMIT 10
      `,
      [id],
    );
    category.recent_articles = articles.rows;
  }

  res.json({
    success: true,
    data: { category },
  });
});

/**
 * @desc    Create new category
 * @route   POST /api/v1/categories
 * @access  Private (Admin/Editor)
 */
export const createCategory = asyncHandler(async (req, res) => {
  const {
    name, slug, description, parent_id, metadata,
  } = req.body;

  // Check if slug already exists
  const existing = await query('SELECT id FROM categories WHERE slug = $1', [slug]);

  if (existing.rows.length > 0) {
    throw new ApiError(409, 'Category slug already exists');
  }

  // Verify parent category exists if provided
  if (parent_id) {
    const parent = await query('SELECT id FROM categories WHERE id = $1', [parent_id]);

    if (parent.rows.length === 0) {
      throw new ApiError(404, 'Parent category not found');
    }
  }

  const result = await query(
    `
    INSERT INTO categories (name, slug, description, parent_id, metadata)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
    `,
    [name, slug, description || null, parent_id || null, metadata || null],
  );

  res.status(201).json({
    success: true,
    data: { category: result.rows[0] },
    message: 'Category created successfully',
  });
});

/**
 * @desc    Update category
 * @route   PUT /api/v1/categories/:id
 * @access  Private (Admin/Editor)
 */
export const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    name, slug, description, parent_id, metadata,
  } = req.body;

  // Check if category exists
  const existing = await query('SELECT * FROM categories WHERE id = $1', [id]);

  if (existing.rows.length === 0) {
    throw new ApiError(404, 'Category not found');
  }

  // Check if new slug conflicts with another category
  if (slug && slug !== existing.rows[0].slug) {
    const slugCheck = await query('SELECT id FROM categories WHERE slug = $1 AND id != $2', [
      slug,
      id,
    ]);

    if (slugCheck.rows.length > 0) {
      throw new ApiError(409, 'Category slug already exists');
    }
  }

  // Verify parent category exists if provided
  if (parent_id && parent_id !== existing.rows[0].parent_id) {
    // Prevent circular reference
    if (parseInt(parent_id) === parseInt(id)) {
      throw new ApiError(400, 'Category cannot be its own parent');
    }

    const parent = await query('SELECT id FROM categories WHERE id = $1', [parent_id]);

    if (parent.rows.length === 0) {
      throw new ApiError(404, 'Parent category not found');
    }
  }

  const result = await query(
    `
    UPDATE categories
    SET 
      name = COALESCE($1, name),
      slug = COALESCE($2, slug),
      description = COALESCE($3, description),
      parent_id = COALESCE($4, parent_id),
      metadata = COALESCE($5, metadata),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $6
    RETURNING *
    `,
    [name, slug, description, parent_id, metadata, id],
  );

  res.json({
    success: true,
    data: { category: result.rows[0] },
    message: 'Category updated successfully',
  });
});

/**
 * @desc    Delete category
 * @route   DELETE /api/v1/categories/:id
 * @access  Private (Admin only)
 */
export const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if category exists
  const existing = await query('SELECT * FROM categories WHERE id = $1', [id]);

  if (existing.rows.length === 0) {
    throw new ApiError(404, 'Category not found');
  }

  // Check if category has articles
  const articleCount = await query('SELECT COUNT(*) FROM articles WHERE category_id = $1', [id]);

  if (parseInt(articleCount.rows[0].count) > 0) {
    throw new ApiError(
      409,
      'Cannot delete category with associated articles. Please reassign articles first.',
    );
  }

  // Check if category has children
  const childCount = await query('SELECT COUNT(*) FROM categories WHERE parent_id = $1', [id]);

  if (parseInt(childCount.rows[0].count) > 0) {
    throw new ApiError(
      409,
      'Cannot delete category with child categories. Please delete or reassign children first.',
    );
  }

  await query('DELETE FROM categories WHERE id = $1', [id]);

  res.json({
    success: true,
    message: 'Category deleted successfully',
  });
});
