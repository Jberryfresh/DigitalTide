/**
 * Common Database Query Helpers
 * Reusable query functions for common database operations
 */

import { query as poolQuery, transaction } from './pool.js';

// Re-export query and transaction for direct use
export { poolQuery as query, transaction };

/**
 * Whitelist of allowed table names to prevent SQL injection
 * Add new tables here as they are created
 */
const ALLOWED_TABLES = [
  'users',
  'articles',
  'categories',
  'sources',
  'tags',
  'article_tags',
  'article_categories',
  'user_preferences',
  'user_saved_articles',
  'user_reading_history',
  'user_sessions',
  'refresh_tokens',
  'api_keys',
  'rate_limits',
  'audit_logs',
];

/**
 * Validate table name against whitelist
 * @param {string} table - Table name to validate
 * @throws {Error} If table name is not in whitelist
 */
function validateTableName(table) {
  if (!ALLOWED_TABLES.includes(table)) {
    throw new Error(`Invalid table name: "${table}". Allowed tables: ${ALLOWED_TABLES.join(', ')}`);
  }
}

/**
 * Generic find by ID
 * @param {string} table - Table name
 * @param {string} id - Record ID
 * @returns {Promise<Object|null>} Record or null
 */
export async function findById(table, id) {
  validateTableName(table);
  const result = await poolQuery(`SELECT * FROM ${table} WHERE id = $1`, [id]);
  return result.rows[0] || null;
}

/**
 * Generic find all with pagination
 * @param {string} table - Table name
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Paginated results
 */
export async function findAll(table, options = {}) {
  validateTableName(table);
  const {
    where = '', params = [], orderBy = 'created_at DESC', limit = 20, offset = 0,
  } = options;

  const whereClause = where ? `WHERE ${where}` : '';
  const queryText = `
    SELECT * FROM ${table}
    ${whereClause}
    ORDER BY ${orderBy}
    LIMIT $${params.length + 1} OFFSET $${params.length + 2}
  `;

  const countText = `SELECT COUNT(*) FROM ${table} ${whereClause}`;

  const [dataResult, countResult] = await Promise.all([
    poolQuery(queryText, [...params, limit, offset]),
    poolQuery(countText, params),
  ]);

  return {
    data: dataResult.rows,
    total: parseInt(countResult.rows[0].count),
    limit,
    offset,
    totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit),
  };
}

/**
 * Generic insert
 * @param {string} table - Table name
 * @param {Object} data - Data to insert
 * @returns {Promise<Object>} Inserted record
 */
export async function insert(table, data) {
  validateTableName(table);
  const keys = Object.keys(data);
  const values = Object.values(data);
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');

  const queryText = `
    INSERT INTO ${table} (${keys.join(', ')})
    VALUES (${placeholders})
    RETURNING *
  `;

  const result = await poolQuery(queryText, values);
  return result.rows[0];
}

/**
 * Generic update
 * @param {string} table - Table name
 * @param {string} id - Record ID
 * @param {Object} data - Data to update
 * @returns {Promise<Object>} Updated record
 */
export async function update(table, id, data) {
  validateTableName(table);
  const keys = Object.keys(data);
  const values = Object.values(data);
  const setClause = keys.map((key, i) => `${key} = $${i + 2}`).join(', ');

  const queryText = `
    UPDATE ${table}
    SET ${setClause}
    WHERE id = $1
    RETURNING *
  `;

  const result = await poolQuery(queryText, [id, ...values]);
  return result.rows[0];
}

/**
 * Generic soft delete
 * @param {string} table - Table name
 * @param {string} id - Record ID
 * @returns {Promise<Object>} Deleted record
 */
export async function softDelete(table, id) {
  validateTableName(table);
  const queryText = `
    UPDATE ${table}
    SET deleted_at = NOW()
    WHERE id = $1 AND deleted_at IS NULL
    RETURNING *
  `;

  const result = await poolQuery(queryText, [id]);
  return result.rows[0];
}

/**
 * Generic hard delete
 * @param {string} table - Table name
 * @param {string} id - Record ID
 * @returns {Promise<boolean>} Success status
 */
export async function hardDelete(table, id) {
  validateTableName(table);
  const queryText = `DELETE FROM ${table} WHERE id = $1`;
  const result = await poolQuery(queryText, [id]);
  return result.rowCount > 0;
}

/**
 * Count records
 * @param {string} table - Table name
 * @param {string} where - WHERE clause
 * @param {Array} params - Query parameters
 * @returns {Promise<number>} Count
 */
export async function count(table, where = '', params = []) {
  validateTableName(table);
  const whereClause = where ? `WHERE ${where}` : '';
  const queryText = `SELECT COUNT(*) FROM ${table} ${whereClause}`;
  const result = await poolQuery(queryText, params);
  return parseInt(result.rows[0].count);
}

/**
 * Check if record exists
 * @param {string} table - Table name
 * @param {string} where - WHERE clause
 * @param {Array} params - Query parameters
 * @returns {Promise<boolean>} Exists status
 */
export async function exists(table, where, params) {
  validateTableName(table);
  const queryText = `SELECT EXISTS(SELECT 1 FROM ${table} WHERE ${where})`;
  const result = await poolQuery(queryText, params);
  return result.rows[0].exists;
}

/**
 * Batch insert
 * @param {string} table - Table name
 * @param {Array<Object>} records - Records to insert
 * @returns {Promise<Array>} Inserted records
 */
export async function batchInsert(table, records) {
  validateTableName(table);
  if (!records || records.length === 0) {
    return [];
  }

  return transaction(async (client) => {
    const results = [];
    for (const record of records) {
      const keys = Object.keys(record);
      const values = Object.values(record);
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');

      const queryText = `
        INSERT INTO ${table} (${keys.join(', ')})
        VALUES (${placeholders})
        RETURNING *
      `;

      const result = await client.query(queryText, values);
      results.push(result.rows[0]);
    }
    return results;
  });
}

/**
 * Full-text search
 * @param {string} table - Table name
 * @param {string} columns - Columns to search (e.g., 'title || content')
 * @param {string} searchTerm - Search term
 * @param {Object} options - Additional options
 * @returns {Promise<Array>} Search results
 */
export async function fullTextSearch(table, columns, searchTerm, options = {}) {
  validateTableName(table);
  const { limit = 20, offset = 0, orderBy = 'created_at DESC' } = options;

  const queryText = `
    SELECT *, ts_rank(to_tsvector('english', ${columns}), plainto_tsquery('english', $1)) as rank
    FROM ${table}
    WHERE to_tsvector('english', ${columns}) @@ plainto_tsquery('english', $1)
    ORDER BY rank DESC, ${orderBy}
    LIMIT $2 OFFSET $3
  `;

  const result = await poolQuery(queryText, [searchTerm, limit, offset]);
  return result.rows;
}

/**
 * Execute raw SQL query
 * @param {string} sql - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>} Query result
 */
export async function raw(sql, params = []) {
  return poolQuery(sql, params);
}

export default {
  findById,
  findAll,
  insert,
  update,
  softDelete,
  hardDelete,
  count,
  exists,
  batchInsert,
  fullTextSearch,
  raw,
};
