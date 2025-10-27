/**
 * Seed Data Runner
 * Populates database with initial development data
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import pool, { testConnection } from '../src/database/pool.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SEEDS_DIR = path.join(__dirname, 'seeds');

/**
 * Get all seed files sorted by version
 */
function getSeedFiles() {
  const files = fs.readdirSync(SEEDS_DIR);
  return files
    .filter((file) => file.endsWith('.sql'))
    .sort((a, b) => {
      const versionA = parseInt(a.split('_')[0]);
      const versionB = parseInt(b.split('_')[0]);
      return versionA - versionB;
    });
}

/**
 * Run a single seed file
 */
async function runSeed(filename) {
  const name = filename.replace('.sql', '').substring(4); // Remove version prefix

  console.log(`\n🌱 Seeding: ${name}...`);

  const filePath = path.join(SEEDS_DIR, filename);
  const sql = fs.readFileSync(filePath, 'utf8');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Execute the seed SQL
    await client.query(sql);
    
    await client.query('COMMIT');
    console.log(`✅ Seed ${name} completed successfully`);
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`❌ Seed ${name} failed:`, error.message);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Main seed function
 */
async function seed() {
  console.log('🌱 DigitalTide Database Seeding');
  console.log('================================\n');

  try {
    // Test database connection
    await testConnection();
    console.log('');

    // Get seed files
    const seedFiles = getSeedFiles();

    console.log(`📁 Found ${seedFiles.length} seed file(s):\n`);
    seedFiles.forEach((file) => {
      console.log(`   - ${file}`);
    });

    // Run seed files
    for (const file of seedFiles) {
      await runSeed(file);
    }

    console.log('\n✨ All seed data loaded successfully!\n');
    console.log('📊 Database Summary:');
    
    // Show summary statistics
    const stats = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as users,
        (SELECT COUNT(*) FROM categories) as categories,
        (SELECT COUNT(*) FROM articles) as articles,
        (SELECT COUNT(*) FROM sources) as sources,
        (SELECT COUNT(*) FROM tags) as tags
    `);
    
    console.log(`   - Users: ${stats.rows[0].users}`);
    console.log(`   - Categories: ${stats.rows[0].categories}`);
    console.log(`   - Articles: ${stats.rows[0].articles}`);
    console.log(`   - Sources: ${stats.rows[0].sources}`);
    console.log(`   - Tags: ${stats.rows[0].tags}\n`);

  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run seeder
seed();
