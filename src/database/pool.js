/**
 * PostgreSQL Database Connection Pool
 * Manages database connections with automatic reconnection and error handling
 */

import pkg from 'pg';
const { Pool } = pkg;
import config from '../config/index.js';

// Create connection pool
const pool = new Pool({
  host: config.database.host,
  port: config.database.port,
  database: config.database.name,
  user: config.database.user,
  password: config.database.password,
  max: config.database.pool.max,
  idleTimeoutMillis: config.database.pool.idleTimeoutMillis,
  connectionTimeoutMillis: config.database.pool.connectionTimeoutMillis,
  ssl: config.database.ssl.enabled
    ? {
        rejectUnauthorized: config.database.ssl.rejectUnauthorized,
      }
    : false,
});

// Handle pool errors
pool.on('error', (err, client) => {
  console.error('❌ Unexpected error on idle database client', err);
  process.exit(-1);
});

// Handle pool connection
pool.on('connect', (client) => {
  console.log('✅ New database client connected');
});

// Handle pool removal
pool.on('remove', (client) => {
  console.log('🔌 Database client removed from pool');
});

/**
 * Test database connection
 */
export async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as now, version() as version');
    client.release();
    console.log('✅ Database connection successful');
    console.log(`   PostgreSQL Version: ${result.rows[0].version.split(' ')[1]}`);
    console.log(`   Server Time: ${result.rows[0].now}`);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    throw error;
  }
}

/**
 * Execute a single query
 * @param {string} text - SQL query text
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>} Query result
 */
export async function query(text, params) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('📊 Executed query', { text: text.substring(0, 100), duration, rows: result.rowCount });
    return result;
  } catch (error) {
    console.error('❌ Query error:', error.message);
    throw error;
  }
}

/**
 * Get a client from the pool for transactions
 * @returns {Promise<Object>} Database client
 */
export async function getClient() {
  const client = await pool.connect();
  const originalQuery = client.query;
  const originalRelease = client.release;

  // Set a timeout for the client
  const timeout = setTimeout(() => {
    console.error('❌ Client has been checked out for more than 5 seconds!');
    console.error('The last query executed was:', client.lastQuery);
  }, 5000);

  // Monkey patch the query method to keep track of the last query
  client.query = (...args) => {
    client.lastQuery = args;
    return originalQuery.apply(client, args);
  };

  // Monkey patch the release method to clear the timeout
  client.release = () => {
    clearTimeout(timeout);
    client.query = originalQuery;
    client.release = originalRelease;
    return originalRelease.apply(client);
  };

  return client;
}

/**
 * Execute a transaction
 * @param {Function} callback - Async callback function that receives the client
 * @returns {Promise<*>} Result from callback
 */
export async function transaction(callback) {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Close the pool gracefully
 */
export async function closePool() {
  try {
    await pool.end();
    console.log('✅ Database pool closed');
  } catch (error) {
    console.error('❌ Error closing database pool:', error.message);
    throw error;
  }
}

export default pool;
