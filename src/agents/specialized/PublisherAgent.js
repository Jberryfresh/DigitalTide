/**
 * Publisher Agent
 * Handles content publishing, scheduling, and distribution
 * Uses MCP github for version control and MCP filesystem for file operations
 */

import Agent from '../base/Agent.js';
import db from '../../database/index.js';
import mcpClient from '../../services/mcp/mcpClient.js';

class PublisherAgent extends Agent {
  constructor(config = {}) {
    super('Publisher', config);

    this.autoPublish = config.autoPublish || false;
    this.requireApproval = config.requireApproval !== false;
    this.defaultStatus = config.defaultStatus || 'draft';
  }

  /**
   * Initialize the Publisher Agent
   */
  async initialize() {
    this.logger.info('[Publisher] Initializing...');

    // Verify database connection
    try {
      await db.query('SELECT 1');
      this.logger.info('[Publisher] Database connection verified');
    } catch (error) {
      throw new Error(`Database connection failed: ${error.message}`);
    }

    // Initialize MCP client if not already connected
    if (!mcpClient.connected) {
      await mcpClient.connect();
    }

    this.logger.info('[Publisher] Initialization complete');
  }

  /**
   * Execute publishing task
   * @param {Object} task - Publishing task
   * @param {string} task.type - Task type: 'publish', 'schedule', 'update', 'archive'
   * @param {Object} task.params - Task parameters
   * @returns {Promise<Object>} Publishing result
   */
  async execute(task) {
    const { type, params = {} } = task;

    switch (type) {
      case 'publish':
        return await this.publishArticle(params);

      case 'schedule':
        return await this.scheduleArticle(params);

      case 'update':
        return await this.updateArticle(params);

      case 'archive':
        return await this.archiveArticle(params);

      case 'backup':
        return await this.backupContent(params);

      default:
        throw new Error(`Unknown task type: ${type}`);
    }
  }

  /**
   * Publish an article
   * @param {Object} params - Publishing parameters
   * @returns {Promise<Object>} Publishing result
   */
  async publishArticle(params) {
    const {
      articleData,
      authorId,
      categoryId,
      tags = [],
      status = this.defaultStatus,
      publishAt = null,
    } = params;

    if (!articleData || !articleData.title || !articleData.content) {
      throw new Error('Article data with title and content is required');
    }

    this.logger.info(`[Publisher] Publishing article: "${articleData.title}"`);

    // Generate slug if not provided
    const slug = articleData.slug || this.generateSlug(articleData.title);

    // Determine status
    let finalStatus = status;
    if (this.autoPublish && !this.requireApproval) {
      finalStatus = 'published';
    } else if (publishAt) {
      finalStatus = 'scheduled';
    }

    // Insert article into database
    const insertQuery = `
      INSERT INTO articles (
        title, slug, excerpt, content, 
        author_id, category_id, status,
        featured_image_url, seo_title, seo_description,
        published_at, quality_score
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id, title, slug, status, created_at
    `;

    const values = [
      articleData.title,
      slug,
      articleData.excerpt || articleData.content.substring(0, 200),
      articleData.content,
      authorId || 1, // Default to system user
      categoryId || null,
      finalStatus,
      articleData.featuredImage || null,
      articleData.seoTitle || articleData.title,
      articleData.seoDescription || articleData.excerpt,
      publishAt || (finalStatus === 'published' ? new Date() : null),
      articleData.qualityScore || 0.8,
    ];

    try {
      const result = await db.query(insertQuery, values);
      const article = result.rows[0];

      // Add tags if provided
      if (tags.length > 0) {
        await this.addTagsToArticle(article.id, tags);
      }

      // Backup to filesystem (via MCP in Phase 3)
      if (finalStatus === 'published') {
        await this.backupArticleToFilesystem(article);
      }

      // Create version in git (via MCP in Phase 3)
      if (finalStatus === 'published') {
        await this.commitToGit(article);
      }

      return {
        success: true,
        article: {
          id: article.id,
          title: article.title,
          slug: article.slug,
          status: article.status,
          url: `/articles/${article.slug}`,
          publishedAt: article.created_at,
        },
        actions: {
          savedToDatabase: true,
          tagsAdded: tags.length,
          backedUp: finalStatus === 'published',
          versionControlled: finalStatus === 'published',
        },
      };
    } catch (error) {
      throw new Error(`Failed to publish article: ${error.message}`);
    }
  }

  /**
   * Schedule an article for future publishing
   * @param {Object} params - Scheduling parameters
   * @returns {Promise<Object>} Scheduling result
   */
  async scheduleArticle(params) {
    const { articleId, publishAt } = params;

    if (!articleId || !publishAt) {
      throw new Error('Article ID and publish time are required');
    }

    this.logger.info(`[Publisher] Scheduling article ${articleId} for ${publishAt}`);

    const updateQuery = `
      UPDATE articles
      SET status = 'scheduled', published_at = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, title, slug, status, published_at
    `;

    try {
      const result = await db.query(updateQuery, [publishAt, articleId]);

      if (result.rows.length === 0) {
        throw new Error('Article not found');
      }

      const article = result.rows[0];

      return {
        success: true,
        article: {
          id: article.id,
          title: article.title,
          slug: article.slug,
          status: article.status,
          scheduledFor: article.published_at,
        },
      };
    } catch (error) {
      throw new Error(`Failed to schedule article: ${error.message}`);
    }
  }

  /**
   * Update an existing article
   * @param {Object} params - Update parameters
   * @returns {Promise<Object>} Update result
   */
  async updateArticle(params) {
    const { articleId, updates } = params;

    if (!articleId || !updates) {
      throw new Error('Article ID and updates are required');
    }

    this.logger.info(`[Publisher] Updating article ${articleId}`);

    // Build update query dynamically
    const allowedFields = ['title', 'slug', 'excerpt', 'content', 'status', 'featured_image_url'];
    const setClause = [];
    const values = [];
    let paramIndex = 1;

    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        setClause.push(`${key} = $${paramIndex}`);
        values.push(updates[key]);
        paramIndex++;
      }
    });

    if (setClause.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(articleId);
    const updateQuery = `
      UPDATE articles
      SET ${setClause.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex}
      RETURNING id, title, slug, status, updated_at
    `;

    try {
      const result = await db.query(updateQuery, values);

      if (result.rows.length === 0) {
        throw new Error('Article not found');
      }

      const article = result.rows[0];

      // Create new version in git if published
      if (article.status === 'published') {
        await this.commitToGit({ ...article, action: 'update' });
      }

      return {
        success: true,
        article: {
          id: article.id,
          title: article.title,
          slug: article.slug,
          status: article.status,
          updatedAt: article.updated_at,
        },
        fieldsUpdated: setClause.length,
      };
    } catch (error) {
      throw new Error(`Failed to update article: ${error.message}`);
    }
  }

  /**
   * Archive an article
   * @param {Object} params - Archive parameters
   * @returns {Promise<Object>} Archive result
   */
  async archiveArticle(params) {
    const { articleId, reason = 'archived' } = params;

    if (!articleId) {
      throw new Error('Article ID is required');
    }

    this.logger.info(`[Publisher] Archiving article ${articleId}`);

    const updateQuery = `
      UPDATE articles
      SET status = 'archived', updated_at = NOW()
      WHERE id = $1
      RETURNING id, title, slug, status
    `;

    try {
      const result = await db.query(updateQuery, [articleId]);

      if (result.rows.length === 0) {
        throw new Error('Article not found');
      }

      const article = result.rows[0];

      // Backup before archiving
      await this.backupArticleToFilesystem({ ...article, reason });

      return {
        success: true,
        article: {
          id: article.id,
          title: article.title,
          status: article.status,
        },
        reason,
        backedUp: true,
      };
    } catch (error) {
      throw new Error(`Failed to archive article: ${error.message}`);
    }
  }

  /**
   * Backup content to filesystem
   * @param {Object} params - Backup parameters
   * @returns {Promise<Object>} Backup result
   */
  async backupContent(params) {
    const { articles = [], destination = 'backups' } = params;

    this.logger.info(`[Publisher] Backing up ${articles.length} articles`);

    const backupResults = await Promise.all(
      articles.map(article => this.backupArticleToFilesystem(article, destination))
    );

    const successful = backupResults.filter(r => r.success).length;

    return {
      success: successful === articles.length,
      totalArticles: articles.length,
      successful,
      failed: articles.length - successful,
      destination,
    };
  }

  /**
   * Add tags to an article
   * @param {number} articleId - Article ID
   * @param {Array} tags - Array of tag names
   */
  async addTagsToArticle(articleId, tags) {
    for (const tagName of tags) {
      try {
        // Find or create tag
        let tagResult = await db.query('SELECT id FROM tags WHERE name = $1', [tagName]);

        let tagId;
        if (tagResult.rows.length === 0) {
          // Create new tag
          const slug = this.generateSlug(tagName).toLowerCase();
          tagResult = await db.query('INSERT INTO tags (name, slug) VALUES ($1, $2) RETURNING id', [
            tagName,
            slug,
          ]);
          tagId = tagResult.rows[0].id;
        } else {
          tagId = tagResult.rows[0].id;
        }

        // Link tag to article
        await db.query(
          'INSERT INTO article_tags (article_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [articleId, tagId]
        );
      } catch (error) {
        this.logger.error(`[Publisher] Failed to add tag "${tagName}":`, error.message);
      }
    }
  }

  /**
   * Backup article to filesystem (via MCP in Phase 3)
   * @param {Object} article - Article data
   * @param {string} destination - Backup destination
   * @returns {Promise<Object>} Backup result
   */
  async backupArticleToFilesystem(article, destination = 'backups') {
    // In Phase 3, this will use MCP filesystem server
    // await mcpClient.filesystem.write({
    //   path: `${destination}/articles/${article.slug}.md`,
    //   content: this.formatArticleAsMarkdown(article),
    // });

    this.logger.warn('[Publisher] MCP filesystem not yet integrated - skipping backup');

    return {
      success: true,
      path: `${destination}/articles/${article.slug}.md`,
      placeholder: true,
    };
  }

  /**
   * Commit article to git (via MCP in Phase 3)
   * @param {Object} article - Article data
   * @returns {Promise<Object>} Commit result
   */
  async commitToGit(article) {
    // In Phase 3, this will use MCP github server
    // await mcpClient.github.commit({
    //   path: `content/articles/${article.slug}.md`,
    //   content: this.formatArticleAsMarkdown(article),
    //   message: `${article.action || 'Publish'}: ${article.title}`,
    // });

    this.logger.warn('[Publisher] MCP github not yet integrated - skipping git commit');

    return {
      success: true,
      placeholder: true,
    };
  }

  /**
   * Format article as Markdown
   * @param {Object} article - Article data
   * @returns {string} Markdown content
   */
  formatArticleAsMarkdown(article) {
    return `---
title: ${article.title}
slug: ${article.slug}
date: ${article.published_at || article.created_at}
status: ${article.status}
---

${article.content}
`;
  }

  /**
   * Generate URL-friendly slug
   * @param {string} text - Text to convert to slug
   * @returns {string} Generated slug
   */
  generateSlug(text) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 100)
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    this.logger.info('[Publisher] Cleaning up...');
    await super.cleanup();
  }
}

export default PublisherAgent;
