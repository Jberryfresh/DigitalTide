/**
 * Redis Cache Service
 * Wrapper for Redis caching operations
 */

import { createClient } from 'redis';
import config from '../../config/index.js';

class RedisCache {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  /**
   * Initialize Redis connection
   */
  async connect() {
    if (this.isConnected) {
      return;
    }

    try {
      this.client = createClient({
        url: config.redis.url,
        socket: {
          connectTimeout: 5000, // 5 second connection timeout
          reconnectStrategy: (retries) => {
            // Only retry 3 times to fail faster when Redis is unavailable
            if (retries > 3) {
              console.error('Redis: Max reconnection attempts reached');
              return new Error('Redis reconnection failed');
            }
            return Math.min(retries * 500, 2000); // Shorter backoff
          },
        },
      });

      this.client.on('error', (err) => {
        console.error('Redis Client Error:', err);
      });

      this.client.on('connect', () => {
        console.log('✅ Redis connected');
        this.isConnected = true;
      });

      this.client.on('reconnecting', () => {
        console.log('🔄 Redis reconnecting...');
      });

      this.client.on('ready', () => {
        console.log('✅ Redis ready');
      });

      await this.client.connect();
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  /**
   * Get value from cache
   * @param {string} key - Cache key
   * @returns {Promise<any>} Cached value or null
   */
  async get(key) {
    if (!this.isConnected || !this.client) {
      return null; // Fail silently when Redis unavailable
    }

    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Redis GET error for key "${key}":`, error);
      return null;
    }
  }

  /**
   * Set value in cache
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in seconds (default: 300 = 5 minutes)
   * @returns {Promise<boolean>} Success status
   */
  async set(key, value, ttl = 300) {
    if (!this.isConnected || !this.client) {
      return false; // Fail silently when Redis unavailable
    }

    try {
      const serialized = JSON.stringify(value);
      await this.client.setEx(key, ttl, serialized);
      return true;
    } catch (error) {
      console.error(`Redis SET error for key "${key}":`, error);
      return false;
    }
  }

  /**
   * Delete key from cache
   * @param {string} key - Cache key
   * @returns {Promise<boolean>} Success status
   */
  async del(key) {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error(`Redis DEL error for key "${key}":`, error);
      return false;
    }
  }

  /**
   * Delete keys matching pattern
   * @param {string} pattern - Key pattern (e.g., 'news:*')
   * @returns {Promise<number>} Number of keys deleted
   */
  async delPattern(pattern) {
    if (!this.isConnected || !this.client) {
      return 0;
    }

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length === 0) {
        return 0;
      }
      await this.client.del(keys);
      return keys.length;
    } catch (error) {
      console.error(`Redis DEL pattern error for "${pattern}":`, error);
      return 0;
    }
  }

  /**
   * Check if key exists
   * @param {string} key - Cache key
   * @returns {Promise<boolean>} Existence status
   */
  async exists(key) {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`Redis EXISTS error for key "${key}":`, error);
      return false;
    }
  }

  /**
   * Get time to live for key
   * @param {string} key - Cache key
   * @returns {Promise<number>} TTL in seconds (-1 if no expiry, -2 if doesn't exist)
   */
  async ttl(key) {
    try {
      return await this.client.ttl(key);
    } catch (error) {
      console.error(`Redis TTL error for key "${key}":`, error);
      return -2;
    }
  }

  /**
   * Increment value
   * @param {string} key - Cache key
   * @param {number} amount - Amount to increment (default: 1)
   * @returns {Promise<number>} New value
   */
  async incr(key, amount = 1) {
    try {
      return await this.client.incrBy(key, amount);
    } catch (error) {
      console.error(`Redis INCR error for key "${key}":`, error);
      return 0;
    }
  }

  /**
   * Get multiple keys
   * @param {Array<string>} keys - Array of cache keys
   * @returns {Promise<Array>} Array of values
   */
  async mget(keys) {
    try {
      const values = await this.client.mGet(keys);
      return values.map((value) => (value ? JSON.parse(value) : null));
    } catch (error) {
      console.error('Redis MGET error:', error);
      return keys.map(() => null);
    }
  }

  /**
   * Set multiple keys
   * @param {Array<{key: string, value: any, ttl: number}>} items - Items to set
   * @returns {Promise<boolean>} Success status
   */
  async mset(items) {
    try {
      for (const item of items) {
        await this.set(item.key, item.value, item.ttl || 300);
      }
      return true;
    } catch (error) {
      console.error('Redis MSET error:', error);
      return false;
    }
  }

  /**
   * Get all keys matching pattern
   * @param {string} pattern - Key pattern
   * @returns {Promise<Array<string>>} Matching keys
   */
  async keys(pattern) {
    try {
      return await this.client.keys(pattern);
    } catch (error) {
      console.error(`Redis KEYS error for pattern "${pattern}":`, error);
      return [];
    }
  }

  /**
   * Flush all data from cache
   * @returns {Promise<boolean>} Success status
   */
  async flushAll() {
    try {
      await this.client.flushAll();
      return true;
    } catch (error) {
      console.error('Redis FLUSHALL error:', error);
      return false;
    }
  }

  /**
   * Ping Redis server
   * @returns {Promise<boolean>} Connection status
   */
  async ping() {
    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch (error) {
      console.error('Redis PING error:', error);
      return false;
    }
  }

  /**
   * Disconnect from Redis
   */
  async disconnect() {
    try {
      if (this.client && this.isConnected) {
        await this.client.quit();
        this.isConnected = false;
        console.log('✅ Redis disconnected gracefully');
      }
    } catch (error) {
      console.error('Redis disconnect error:', error.message);
      // Force close the connection
      if (this.client) {
        this.client.disconnect();
        this.isConnected = false;
      }
    }
  }

  /**
   * Generate cache key for news articles
   * @param {Object} params - Query parameters
   * @returns {string} Cache key
   */
  generateNewsKey(params) {
    const {
      source, query, category, country, language, limit,
    } = params;
    const parts = ['news', source || 'all'];

    if (query) parts.push(`q:${query}`);
    if (category) parts.push(`cat:${category}`);
    if (country) parts.push(`c:${country}`);
    if (language) parts.push(`l:${language}`);
    if (limit) parts.push(`lim:${limit}`);

    return parts.join(':');
  }
}

export default new RedisCache();
