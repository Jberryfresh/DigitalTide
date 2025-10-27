/**
 * Database Migration Runner
 * Executes SQL migration files in order
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import pool, { testConnection } from '../src/database/pool.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

/**
 * Get all migration files sorted by version
 */
function getMigrationFiles() {
  const files = fs.readdirSync(MIGRATIONS_DIR);
  return files
    .filter((file) => file.endsWith('.sql'))
    .sort((a, b) => {
      const versionA = parseInt(a.split('_')[0]);
      const versionB = parseInt(b.split('_')[0]);
      return versionA - versionB;
    });
}

/**
 * Get applied migrations from database
 */
async function getAppliedMigrations() {
  try {
    const result = await pool.query(`
      SELECT version FROM schema_migrations ORDER BY version
    `);
    return result.rows.map((row) => row.version);
  } catch (error) {
    // If schema_migrations table doesn't exist, return empty array
    if (error.code === '42P01') {
      return [];
    }
    throw error;
  }
}

/**
 * Run a single migration file
 */
async function runMigration(filename) {
  const version = filename.split('_')[0];
  const name = filename.replace('.sql', '').substring(4); // Remove version prefix

  console.log(`\n📝 Running migration ${version}: ${name}...`);

  const filePath = path.join(MIGRATIONS_DIR, filename);
  const sql = fs.readFileSync(filePath, 'utf8');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Execute the migration SQL
    await client.query(sql);
    
    await client.query('COMMIT');
    console.log(`✅ Migration ${version} completed successfully`);
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`❌ Migration ${version} failed:`, error.message);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Main migration function
 */
async function migrate() {
  console.log('🚀 DigitalTide Database Migration');
  console.log('==================================\n');

  try {
    // Test database connection
    await testConnection();
    console.log('');

    // Get migration files and applied migrations
    const migrationFiles = getMigrationFiles();
    const appliedMigrations = await getAppliedMigrations();

    console.log(`📁 Found ${migrationFiles.length} migration file(s)`);
    console.log(`✅ ${appliedMigrations.length} migration(s) already applied\n`);

    // Filter pending migrations
    const pendingMigrations = migrationFiles.filter((file) => {
      const version = file.split('_')[0];
      return !appliedMigrations.includes(version);
    });

    if (pendingMigrations.length === 0) {
      console.log('✨ Database is up to date! No migrations to run.\n');
      return;
    }

    console.log(`⏳ ${pendingMigrations.length} migration(s) pending:\n`);
    pendingMigrations.forEach((file) => {
      console.log(`   - ${file}`);
    });

    // Run pending migrations
    for (const file of pendingMigrations) {
      await runMigration(file);
    }

    console.log('\n✨ All migrations completed successfully!\n');
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

/**
 * Rollback last migration (placeholder for future implementation)
 */
async function rollback() {
  console.log('⚠️  Rollback functionality not yet implemented');
  console.log('To rollback, manually execute the down migration or restore from backup\n');
  process.exit(0);
}

/**
 * Show migration status
 */
async function status() {
  console.log('📊 Migration Status\n');

  try {
    await testConnection();
    
    const migrationFiles = getMigrationFiles();
    const appliedMigrations = await getAppliedMigrations();

    console.log('┌────────┬─────────────────────────────────┬──────────┐');
    console.log('│ Version│ Name                            │ Status   │');
    console.log('├────────┼─────────────────────────────────┼──────────┤');

    migrationFiles.forEach((file) => {
      const version = file.split('_')[0];
      const name = file.replace('.sql', '').substring(4).substring(0, 31);
      const status = appliedMigrations.includes(version) ? '✅ Applied' : '⏳ Pending';
      console.log(`│ ${version.padEnd(6)} │ ${name.padEnd(31)} │ ${status.padEnd(8)} │`);
    });

    console.log('└────────┴─────────────────────────────────┴──────────┘\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Parse command line arguments
const command = process.argv[2] || 'migrate';

switch (command) {
  case 'up':
  case 'migrate':
    migrate();
    break;
  case 'down':
  case 'rollback':
    rollback();
    break;
  case 'status':
    status();
    break;
  default:
    console.log('Usage: node migrate.js [command]');
    console.log('\nCommands:');
    console.log('  migrate, up    Run pending migrations (default)');
    console.log('  rollback, down Rollback last migration');
    console.log('  status         Show migration status\n');
    process.exit(0);
}
