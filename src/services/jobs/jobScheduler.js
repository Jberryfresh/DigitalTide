/**
 * Job Scheduler Service
 * Manages background jobs for automated news fetching and processing
 */

import cron from 'node-cron';
import newsService from '../news/newsService.js';
import articleStorageService from '../storage/articleStorageService.js';
import config from '../../config/index.js';

class JobScheduler {
  constructor() {
    this.jobs = new Map();
    this.stats = {
      totalRuns: 0,
      successfulRuns: 0,
      failedRuns: 0,
      lastRun: null,
      lastSuccess: null,
      lastError: null,
      articlesProcessed: 0,
      articlesSaved: 0,
      articlesDuplicate: 0,
    };
  }

  /**
   * Initialize and start all scheduled jobs
   */
  start() {
    console.log('');
    console.log('🕐 Starting Job Scheduler...');

    // Hourly news fetch job
    this.scheduleNewsFetch();

    // Daily cache cleanup job
    this.scheduleCacheCleanup();

    // Daily quota reset job (at midnight)
    this.scheduleQuotaReset();

    console.log('✅ Job Scheduler started successfully');
    console.log(`📋 ${this.jobs.size} jobs scheduled`);
    console.log('');
  }

  /**
   * Schedule hourly news fetching
   */
  scheduleNewsFetch() {
    // Run every hour at minute 0
    const cronExpression = '0 * * * *'; // '0 * * * *' = every hour
    // For testing: '*/5 * * * *' = every 5 minutes

    const job = cron.schedule(
      cronExpression,
      async () => {
        await this.runNewsFetch();
      },
      {
        scheduled: true,
        timezone: 'America/New_York', // Adjust to your timezone
      }
    );

    this.jobs.set('news-fetch', job);
    console.log('  ✓ News Fetch: Hourly at minute 0');
  }

  /**
   * Schedule daily cache cleanup
   */
  scheduleCacheCleanup() {
    // Run daily at 3 AM
    const cronExpression = '0 3 * * *';

    const job = cron.schedule(
      cronExpression,
      async () => {
        await this.runCacheCleanup();
      },
      {
        scheduled: true,
        timezone: 'America/New_York',
      }
    );

    this.jobs.set('cache-cleanup', job);
    console.log('  ✓ Cache Cleanup: Daily at 3:00 AM');
  }

  /**
   * Schedule monthly quota reset
   */
  scheduleQuotaReset() {
    // Run on 1st of each month at midnight
    const cronExpression = '0 0 1 * *';

    const job = cron.schedule(
      cronExpression,
      async () => {
        await this.runQuotaReset();
      },
      {
        scheduled: true,
        timezone: 'America/New_York',
      }
    );

    this.jobs.set('quota-reset', job);
    console.log('  ✓ Quota Reset: Monthly on 1st at midnight');
  }

  /**
   * Run news fetch job
   */
  async runNewsFetch() {
    const jobName = 'news-fetch';
    const startTime = Date.now();

    console.log('');
    console.log('═══════════════════════════════════════════════════');
    console.log(`🔄 Running Job: ${jobName}`);
    console.log(`⏰ Started at: ${new Date().toISOString()}`);
    console.log('═══════════════════════════════════════════════════');

    this.stats.totalRuns++;
    this.stats.lastRun = new Date().toISOString();

    try {
      // Fetch news from multiple categories
      const categories = ['technology', 'business', 'science'];
      let totalFetched = 0;
      let totalSaved = 0;
      let totalDuplicates = 0;

      for (const category of categories) {
        console.log(`\n📰 Fetching ${category} news...`);

        try {
          // Fetch news
          const newsResult = await newsService.fetchByCategory(category, 10);
          console.log(`  ✓ Fetched: ${newsResult.articles.length} articles`);
          totalFetched += newsResult.articles.length;

          // Save to database with AI enrichment
          const saveResult = await articleStorageService.saveArticles(newsResult.articles, {
            enrichWithAI: true,
            autoPublish: false, // Save as drafts for review
            defaultAuthorId: null,
          });

          console.log(`  ✓ Saved: ${saveResult.saved} articles`);
          console.log(`  ℹ Duplicates: ${saveResult.duplicates}`);
          if (saveResult.failed > 0) {
            console.log(`  ⚠ Failed: ${saveResult.failed}`);
          }

          totalSaved += saveResult.saved;
          totalDuplicates += saveResult.duplicates;
        } catch (error) {
          console.error(`  ✗ Error fetching ${category}:`, error.message);
        }
      }

      // Update stats
      this.stats.successfulRuns++;
      this.stats.lastSuccess = new Date().toISOString();
      this.stats.articlesProcessed += totalFetched;
      this.stats.articlesSaved += totalSaved;
      this.stats.articlesDuplicate += totalDuplicates;

      const duration = Date.now() - startTime;
      console.log('');
      console.log('═══════════════════════════════════════════════════');
      console.log(`✅ Job Completed: ${jobName}`);
      console.log('📊 Results:');
      console.log(`   - Articles Fetched: ${totalFetched}`);
      console.log(`   - Articles Saved: ${totalSaved}`);
      console.log(`   - Duplicates Skipped: ${totalDuplicates}`);
      console.log(`⏱️  Duration: ${duration}ms`);
      console.log('═══════════════════════════════════════════════════');
      console.log('');
    } catch (error) {
      this.stats.failedRuns++;
      this.stats.lastError = {
        timestamp: new Date().toISOString(),
        error: error.message,
      };

      console.error('');
      console.error('═══════════════════════════════════════════════════');
      console.error(`❌ Job Failed: ${jobName}`);
      console.error(`💥 Error: ${error.message}`);
      console.error('═══════════════════════════════════════════════════');
      console.error('');
    }
  }

  /**
   * Run cache cleanup job
   */
  async runCacheCleanup() {
    const jobName = 'cache-cleanup';
    console.log('');
    console.log('═══════════════════════════════════════════════════');
    console.log(`🧹 Running Job: ${jobName}`);
    console.log('═══════════════════════════════════════════════════');

    try {
      const deleted = await newsService.invalidateCache();
      console.log(`✅ Cache cleaned: ${deleted} keys deleted`);
    } catch (error) {
      console.error(`❌ Cache cleanup failed: ${error.message}`);
    }

    console.log('═══════════════════════════════════════════════════');
    console.log('');
  }

  /**
   * Run quota reset job
   */
  async runQuotaReset() {
    const jobName = 'quota-reset';
    console.log('');
    console.log('═══════════════════════════════════════════════════');
    console.log(`🔄 Running Job: ${jobName}`);
    console.log('═══════════════════════════════════════════════════');

    try {
      newsService.resetAllQuotas();
      console.log('✅ API quotas reset for new month');
    } catch (error) {
      console.error(`❌ Quota reset failed: ${error.message}`);
    }

    console.log('═══════════════════════════════════════════════════');
    console.log('');
  }

  /**
   * Stop all scheduled jobs
   */
  stop() {
    console.log('🛑 Stopping Job Scheduler...');

    for (const [name, job] of this.jobs) {
      job.stop();
      console.log(`  ✓ Stopped: ${name}`);
    }

    this.jobs.clear();
    console.log('✅ Job Scheduler stopped');
  }

  /**
   * Get job statistics
   */
  getStats() {
    return {
      ...this.stats,
      activeJobs: Array.from(this.jobs.keys()),
      jobCount: this.jobs.size,
    };
  }

  /**
   * Manually trigger a job
   * @param {string} jobName - Name of job to run
   */
  async triggerJob(jobName) {
    switch (jobName) {
      case 'news-fetch':
        await this.runNewsFetch();
        break;
      case 'cache-cleanup':
        await this.runCacheCleanup();
        break;
      case 'quota-reset':
        await this.runQuotaReset();
        break;
      default:
        throw new Error(`Unknown job: ${jobName}`);
    }
  }

  /**
   * Update job schedule
   * @param {string} jobName - Job name
   * @param {string} cronExpression - New cron expression
   */
  rescheduleJob(jobName, cronExpression) {
    const job = this.jobs.get(jobName);
    if (!job) {
      throw new Error(`Job not found: ${jobName}`);
    }

    // Stop existing job
    job.stop();

    // Create new job with new schedule
    const newJob = cron.schedule(cronExpression, async () => {
      switch (jobName) {
        case 'news-fetch':
          await this.runNewsFetch();
          break;
        case 'cache-cleanup':
          await this.runCacheCleanup();
          break;
        case 'quota-reset':
          await this.runQuotaReset();
          break;
      }
    });

    this.jobs.set(jobName, newJob);
    console.log(`✅ Rescheduled ${jobName} to: ${cronExpression}`);
  }
}

export default new JobScheduler();
